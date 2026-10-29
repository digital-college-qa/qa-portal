const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {load}=require('../scripts/audit-lesson-reference.cjs');
const w=load(),api=w.LEARN_REFERENCE;
const model=(n,lang='ru')=>api.build(w.LEARN_PAIRS[`qa-${n}`],`qa-${n}`,lang);

test('every lesson has its own local-to-English vocabulary in both portal languages',()=>{
  for(let n=1;n<=26;n++)for(const lang of ['ru','kz']){
    const m=model(n,lang);assert.ok(m.glossary.length>=4,`${n} ${lang}`);
    assert.equal(new Set(m.glossary.map(x=>x.en.toLowerCase())).size,m.glossary.length);
    assert.ok(m.glossary.every(x=>x.local.trim()&&x.en.trim()),`${n} ${lang}`);
    const html=api.render(w.LEARN_PAIRS[`qa-${n}`],`qa-${n}`,lang);
    assert.match(html.left,lang==='ru'?/Русский → English/:/Қазақша → English/);
    assert.match(html.left,/lang="en"/);
  }
  assert.ok(model(1).glossary.some(x=>x.en==='Requirement'));
  assert.ok(!model(6).glossary.some(x=>x.en==='Requirement'));
  assert.ok(model(6).glossary.some(x=>x.en==='Boundary values'));
  assert.ok(model(26).glossary.some(x=>x.en==='Handover'));
});

test('ID abbreviations are selected by occurrences, including the displayed tracker illustration',()=>{
  assert.equal(model(1).abbreviations.find(x=>x.code==='CRT').en,'Cart');
  assert.match(model(1).abbreviations.find(x=>x.code==='CRT').why,/C, R, T/);
  assert.ok(model(8).abbreviations.some(x=>x.code==='SRC'),'SRC is visible in the tracker picture');
  for(let n=1;n<=26;n++)assert.ok(!model(n).abbreviations.some(x=>['REG','BTN'].includes(x.code)),String(n));
  assert.equal(api.render(w.LEARN_PAIRS['qa-15'],'qa-15','ru').right,'');
  const pair={ru:{learn:['REG BTN CRTfoo SOME_CRT CATalog https://example.org'],terms:[['Тест','Test','...']]}};
  const extra=api.build(pair,'qa-99','ru').abbreviations.map(x=>x.code);
  assert.equal(JSON.stringify(extra),'["REG","BTN"]');
});

test('reference updates from the lesson and reads the actual ID without inventing a code',()=>{
  const pair={ru:{terms:[['Новый термин','New term','...']],template:'ID: TC-CRT-021'}};
  const m=api.build(pair,'qa-99','ru');assert.ok(m.glossary.some(x=>x.en==='New term'));
  assert.equal(m.example.id,'TC-CRT-021');assert.equal(JSON.stringify(m.example.parts),'["Тест-кейс","Корзина","021"]');
  pair.ru.template='';assert.equal(api.build(pair,'qa-99','ru').example,null);
});

test('moving the lesson into the layout keeps its node and cleans up resize listeners',()=>{
  const code=fs.readFileSync(path.join(__dirname,'../js/learn/lesson-reference.js'),'utf8');
  let removed=0,created=0;const panels=[{open:true},{open:true}],media={matches:true,addEventListener(){},removeEventListener(){removed++;}};
  const frame={className:'',insertAdjacentHTML(){},append(node){this.lesson=node;},querySelectorAll(){return panels;}};
  const lesson={replaceWith(node){assert.equal(node,frame);}};
  const c={window:{matchMedia:()=>media},document:{createElement(){created++;return frame;}}};
  vm.runInNewContext(code,c);const pair={ru:{terms:[['Проверка','Check','...']],template:'TC-CRT-001'}};
  c.window.LEARN_REFERENCE.mount({querySelector:()=>lesson},pair,'qa-1','ru');
  assert.equal(frame.lesson,lesson);assert.equal(created,1);assert.ok(panels.every(p=>!p.open));
  c.window.LEARN_REFERENCE.dispose();assert.equal(removed,1);
});

test('reference labels escape text and never treat teacher notes or link names as a used abbreviation',()=>{
  const pair={ru:{terms:[['<img onerror=x>','<unsafe>','...']],teacher:'REG BTN',links:[['REG','https://x.invalid/BTN']]}};
  const html=api.render(pair,'qa-99','ru');assert.doesNotMatch(html.left,/<img/);assert.match(html.left,/&lt;unsafe&gt;/);assert.equal(html.right,'');
});
