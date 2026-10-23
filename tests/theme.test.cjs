const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..'),source=fs.readFileSync(path.join(root,'js/theme.js'),'utf8');
function setup(saved,dark=false,blocked=false){
  const values=new Map(saved?[['qc_appearance',saved]]:[]),styles={},events={},media={matches:dark,addEventListener:(k,fn)=>events.media=fn};
  const context={window:{addEventListener:(k,fn)=>events[k]=fn},document:{documentElement:{dataset:{},style:{setProperty:(k,v)=>styles[k]=v}},readyState:'loading',addEventListener(){}},matchMedia:()=>media,
    localStorage:{getItem:k=>{if(blocked)throw Error('storage blocked');return values.get(k)??null;},setItem:(k,v)=>{if(blocked)throw Error('storage blocked');values.set(k,v);}}};
  vm.runInNewContext(source,context);return{theme:context.window.QATheme,values,styles,events,media,context};
}
test('first visit follows device theme, then a manual choice persists across pages',()=>{
  const a=setup(null,true);assert.equal(a.styles['--theme-bg'],'#141b26');
  a.theme.apply({mode:'sage'});const b=setup(a.values.get('qc_appearance'),true);
  assert.equal(b.styles['--theme-bg'],'#eaf0e9');assert.equal(b.theme.read().mode,'sage');
});
test('device changes update system mode but never override an explicit choice',()=>{
  const a=setup();a.media.matches=true;a.events.media();assert.equal(a.styles['--theme-bg'],'#141b26');
  a.theme.apply({mode:'sand'});a.media.matches=false;a.events.media();assert.equal(a.styles['--theme-bg'],'#f4eddf');
});
test('corrupt saved data and disabled storage never prevent the site from loading',()=>{
  assert.equal(setup('not-json').theme.read().mode,'system');
  const a=setup(null,false,true);assert.doesNotThrow(()=>a.theme.apply({mode:'dark'}));
});
test('custom colours persist, reject CSS injection, and keep text readable on both surfaces',()=>{
  const a=setup();a.theme.apply({mode:'custom',custom:{bg:'#101010',surface:'#ffffff',text:'#101010',accent:'red;display:none'}});
  assert.equal(a.theme.read().custom.accent,'#6950ad');
  assert.ok(a.theme.contrast(a.styles['--theme-text'],a.styles['--theme-bg'])>=4.5);
  assert.ok(a.theme.contrast(a.styles['--theme-text'],a.styles['--theme-surface'])>=4.5);
  assert.equal(setup(a.values.get('qc_appearance')).theme.read().mode,'custom');
});
test('every preset has readable text and buttons',()=>{
  const a=setup();for(const mode of Object.keys(a.theme.presets)){
    a.theme.apply({mode});assert.ok(a.theme.contrast(a.styles['--theme-text'],a.styles['--theme-bg'])>=4.5,mode);
    assert.ok(a.theme.contrast(a.styles['--theme-onaccent'],a.styles['--theme-accent'])>=4.5,mode);
  }
});
test('JSON keys, numbers and strings remain readable in all palettes and custom dark colours',()=>{
  const a=setup();const cases=Object.keys(a.theme.presets).map(mode=>({mode})).concat([{mode:'custom',custom:{bg:'#101e24',surface:'#233c45',text:'#e8f5fa',accent:'#9cdef0'}}]);
  for(const input of cases){a.theme.apply(input);for(const part of ['codekey','codenum','codestring'])assert.ok(a.theme.contrast(a.styles['--theme-'+part],a.styles['--theme-surface'])>=4.5,input.mode+': '+part);}
});
test('all entry pages load appearance before body rendering; diagrams exist in both languages',()=>{
  for(const file of fs.readdirSync(root).filter(f=>f.endsWith('.html'))){const s=fs.readFileSync(path.join(root,file),'utf8');assert.ok(s.indexOf('js/theme.js')>0&&s.indexOf('js/theme.js')<s.indexOf('</head>'),file);}
  const c={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'js/kb-visuals.js'),'utf8'),c);
  assert.equal(c.window.KB_VISUALS.agile.length,3);
  for(const f of c.window.KB_VISUALS.agile)for(const lang of ['ru','kz']){const s=fs.readFileSync(path.join(root,`img/methods/${f.file}-${lang}.svg`),'utf8');assert.ok(s.includes('<desc'));assert.doesNotMatch(s,/<image|<script/);}
});

test('semantic roles retain contrast across presets and 256 extreme custom palettes',()=>{
 const a=setup(),colors=['#000000','#ffffff','#ff0000','#00ff00','#0000ff','#ffff00','#00ffff','#ff00ff'];
 const cases=Object.keys(a.theme.presets).map(mode=>({mode}));
 for(let n=0;n<256;n++)cases.push({mode:'custom',custom:{bg:colors[n%8],surface:colors[Math.floor(n/8)%8],text:colors[Math.floor(n/32)%8],accent:colors[Math.floor(n/4)%8]}});
 for(const input of cases){const {vars:v}=a.theme.resolve(input);const check=(fg,bg,min=4.5)=>assert.ok(a.theme.contrast(v[fg],v[bg])>=min,JSON.stringify(input)+' '+fg+'/'+bg);
  for(const bg of ['bg','surface','raised','soft','selected'])for(const fg of ['text','muted','link'])check(fg,bg);
  for(const kind of ['good','bad'])check(kind,kind+'bg');check('warning','warnbg');check('selected-text','selected');
  check('onaccent','accent');check('onaccent','accent-hover');check('disabled-text','disabled');
  for(const bg of ['bg','surface','soft'])check('control-line',bg,3);
  for(const fg of ['codekey','codenum','codestring'])check(fg,'code-bg');
 }
});
