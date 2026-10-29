const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..'),context={window:{}};
for(const name of ['illustration-data','illustration-gallery'])vm.runInNewContext(fs.readFileSync(path.join(root,`js/learn/${name}.js`),'utf8'),context);
const data=context.window.LEARN_ILLUSTRATIONS,api=context.window.LEARN_GALLERY;

test('all eight lessons have two or three complete bilingual slides with local safe images',()=>{
  assert.equal(Object.keys(data).length,8);
  for(let n=1;n<=8;n++){
    const pair=data[`qa-${n}`];assert.ok(pair.ru.length>=2&&pair.ru.length<=3);assert.equal(pair.ru.length,pair.kz.length);
    for(const lang of ['ru','kz'])for(const row of pair[lang]){
      assert.ok(row.title&&row.alt&&row.caption);
      for(const src of [row.src,row.mobile].filter(Boolean)){
        assert.match(src,/^img\/[\w/-]+\.svg$/);const image=fs.readFileSync(path.join(root,src),'utf8');
        assert.match(image,/<svg\b/);assert.doesNotMatch(image,/<script|<foreignObject|https?:\/\/(?!www\.w3\.org)/i);
      }
    }
  }
  assert.match(data['qa-4'].ru[2].caption,/Продукт.*обходной путь/);
  assert.ok(data['qa-7'].ru[0].src.includes('mockup-cart'),'independent exercise stays unsolved');
});

function harness(route='qa-4',lang='ru'){
  const nodes={};
  for(const key of ['count','title','caption','error','img','mobile','dialog','dialog-title','large','prev','next','open','zoom','close']){
    nodes[key]={textContent:'',hidden:true,handlers:{},addEventListener(event,fn){this.handlers[event]=fn;}};
  }
  nodes.dialog.showModal=function(){this.open=true;};nodes.dialog.close=function(){this.open=false;};
  const handlers={},gallery={querySelector:s=>nodes[s.slice(13,-1)],addEventListener:(e,fn)=>handlers[e]=fn};
  api.bind({querySelector:()=>gallery},route,lang);
  return {nodes,handlers};
}

test('arrows wrap in both directions and update the matching title, caption, alt and mobile source',()=>{
  const {nodes:n}=harness();n.next.handlers.click();const row=data['qa-4'].ru[1];
  assert.equal(n.count.textContent,'2 / 3');assert.equal(n.img.alt,row.alt);assert.equal(n.img.src,row.src);assert.equal(n.mobile.srcset,row.mobile);assert.equal(n.caption.textContent,row.caption);
  n.prev.handlers.click();n.prev.handlers.click();assert.equal(n.count.textContent,'3 / 3');assert.equal(n.title.textContent,data['qa-4'].ru[2].title);
  n.next.handlers.click();assert.equal(n.count.textContent,'1 / 3');
});

test('keyboard navigation and the enlarged dialog stay on the same example without lesson rerendering',()=>{
  const {nodes:n,handlers}=harness('qa-2','kz');n.open.handlers.click();assert.equal(n.dialog.open,true);
  let prevented=false;handlers.keydown({key:'ArrowRight',preventDefault:()=>{prevented=true;}});
  assert.equal(prevented,true);assert.equal(n.large.src,data['qa-2'].kz[1].src);assert.equal(n['dialog-title'].textContent,data['qa-2'].kz[1].title);
  n.close.handlers.click();assert.equal(n.dialog.open,false);
  n.img.handlers.error();assert.equal(n.error.hidden,false);n.prev.handlers.click();assert.equal(n.error.hidden,true);
});

test('rendering has accessible native buttons and no automatic slide timer',()=>{
  const html=api.render('qa-1','ru');assert.match(html,/aria-live="polite"/);assert.match(html,/Предыдущая иллюстрация/);assert.match(html,/<picture>/);assert.match(html,/<dialog/);
  assert.equal(api.render('qa-26','ru'),'');assert.doesNotMatch(fs.readFileSync(path.join(root,'js/learn/illustration-gallery.js'),'utf8'),/setInterval|setTimeout/);
});
