const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..'),context={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'js/study-content.js'),'utf8'),context);
const topics=context.window.KB,ids=new Set(topics.map(t=>t.id));
function strings(v){return typeof v==='string'?[v]:v&&typeof v==='object'?Object.values(v).flatMap(strings):[];}
test('all rewritten topics have concise explanation, contrasting examples and frequent mistakes',()=>{
  assert.equal(topics.length,84);assert.equal(ids.size,topics.length);
  for(const topic of topics)for(const lang of ['ru','kz']){
    const t=topic[lang];for(const field of ['title','short','good','bad'])assert.ok(t[field]?.trim(),topic.id+': '+field);
    assert.ok(t.short.length<1300,topic.id+': overly long definition');assert.notEqual(t.good,t.bad,topic.id);
    assert.ok(t.mistakes.length>0);assert.doesNotMatch(t.short,/\|.*\|/);
  }
});
test('all student-facing internal links resolve to existing pages and knowledge topics',()=>{
  for(const value of strings(context.window.STUDY_CONTENT))for(const [,href]of value.matchAll(/\]\(([^)]+)\)/g)){
    if(/^https?:/.test(href))continue;
    const url=new URL(href,'https://school.invalid/kb.html');assert.ok(fs.existsSync(path.join(root,url.pathname.slice(1))),href);
    if(url.pathname==='/kb.html'&&url.hash)assert.ok(ids.has(url.hash.slice(1)),href);
    if(url.searchParams.has('version'))assert.ok(['1.0','1.5','2.0'].includes(url.searchParams.get('version')),href);
  }
  for(const t of topics)for(const lang of ['ru','kz'])for(const link of t[lang].links||[])assert.ok(ids.has(link.href.split('#')[1]),link.href);
});
test('practical tools explain actions instead of requiring an external registration',()=>{
  for(const t of topics.filter(t=>t.block==='toolkit'&&t.id!=='tool-software-map'))for(const lang of ['ru','kz']){
    assert.ok(t[lang].steps.length>=2,t.id);assert.ok(t[lang].steps.every(s=>s.trim()),t.id);
  }
});
test('templates make preparation and data optional and keep expected/actual results separate',()=>{
  for(const id of ['test-case','bug-report']){
    const t=topics.find(t=>t.id===id);
    assert.match(t.ru.template,/Предусловия: \(необязательно/);assert.match(t.ru.template,/Тестовые данные: \(необязательно/);
    assert.match(t.ru.template,/Ожидаемый результат/);assert.match(t.ru.template,/Фактический результат/);
    assert.match(t.kz.template,/Алғышарт: \(міндетті емес/);assert.match(t.kz.template,/Тест дерегі: \(міндетті емес/);
    assert.doesNotMatch(t.ru.template,/RU.*KZ/);
  }
});
test('published automation snippets compile in the real supported classroom language',async()=>{
  const {compile}=await import('../server/language.mjs');let checked=0;
  for(const t of topics)for(const lang of ['ru','kz'])if(t[lang].code){assert.ok(compile(t[lang].code).length,t.id);checked++;}
  assert.equal(checked,12);
});
test('documented API bodies and cart IDs match the real teaching store',()=>{
  const {createStore}=require('../js/labs/store.js');const state={};
  const store=createStore({seed:[{id:3,price:1200,inStock:true,name:{ru:'Капучино',kz:'Капучино'}}],read:(k,f)=>state[k]??f,write:(k,v)=>state[k]=v});
  const body=topics.find(t=>t.id==='api-client').ru.requestBody;
  const result=store.handle({method:'POST',path:'/cart/items',body});assert.equal(result.status,201);
  assert.ok(result.body.items[0].id);assert.equal(result.body.items[0].itemId,undefined);
  const before=JSON.stringify(store.cartBody());
  assert.equal(store.handle({method:'POST',path:'/cart/items',body:JSON.stringify({productId:3,quantity:0,size:'M'})}).status,400);
  assert.equal(JSON.stringify(store.cartBody()),before);
  assert.equal(store.handle({method:'DELETE',path:'/cart/items/'+result.body.items[0].id}).status,204);
});
test('reset instructions distinguish local cart/price reset from account removal',()=>{
  const t=topics.find(t=>t.id==='api-client');assert.match(t.ru.steps.join(' '),/не удаляет аккаунты/);assert.match(t.kz.steps.join(' '),/аккаунт.*жоймайды/i);
});
