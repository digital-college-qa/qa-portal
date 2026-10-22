const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const context = vm.createContext({window:{KB:[],LEARN_PAIRS:{}}});
const run = file => vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});
for(const file of fs.readdirSync(path.join(root,'js/kb')).filter(f=>f.endsWith('.js')).sort())run('js/kb/'+file);
const html = fs.readFileSync(path.join(root,'learn.html'),'utf8');
for(const [,file] of html.matchAll(/src="(js\/learn\/[^?" ]+)/g))run(file);
const data=context.window.QALecture, kbIds=new Set(context.window.KB.map(t=>t.id));
function destination(href){
  if(/^https?:/.test(href))return;
  const url=new URL(href,'https://school.invalid/');
  assert.ok(fs.existsSync(path.join(root,url.pathname.slice(1))),href);
  if(url.pathname==='/kb.html')assert.ok(kbIds.has(url.hash.slice(1)),href);
}

test('all 52 lessons follow the real HTML load order and reference their numbered source plan',()=>{
  assert.equal(Object.keys(data.lessons).length,52);
  for(const course of ['k1','k2'])for(let n=1;n<=26;n++){
    const id=`${course}-${n}`,lesson=context.window.LEARN_PAIRS[id];
    assert.equal(lesson.format,'illustrated-curriculum',id);
    assert.equal(lesson.source.pair,n,id);
    assert.ok(lesson.source.file.endsWith(`Поурочные планы QA ${course[1]} курс.docx`),id);
    assert.ok(lesson.source.title&&lesson.topics.length,id);
    for(const key of lesson.topics)assert.ok(data.topics[key],`${id}: ${key}`);
    for(const lang of ['ru','kz']){
      const content=lesson[lang];
      assert.ok(content.intro&&content.template&&content.tasks.length>=5,id);
      assert.ok(content.tasks.some(t=>t.includes('work-chat')),id);
      assert.match(content.tasks[0],new RegExp('version='+lesson.version.replaceAll('.','\\.')),id);
      for(const text of content.tasks)for(const [,href]of text.matchAll(/\]\(([^)]+)\)/g))destination(href);
    }
  }
});
test('every concept and all ten examples in each bank have both translations and real illustrations',()=>{
  for(const [id,topic]of Object.entries(data.topics)){
    assert.ok(topic.en,id);assert.ok(kbIds.has(topic.kb),id);
    for(let i=0;i<2;i++){
      assert.ok(topic.title[i]&&topic.body[i],id);
      destination(topic.images[i]);
      assert.match(fs.readFileSync(path.join(root,topic.images[i]),'utf8'),/<svg[\s>]/,id);
    }
    assert.ok(data.banks[topic.bank],id);
  }
  for(const [id,bank]of Object.entries(data.banks)){
    assert.equal(bank.length,10,id);
    for(const lang of ['ru','kz'])assert.equal(new Set(bank.map(e=>e[lang][0])).size,10,id);
    for(const example of bank){
      for(const lang of ['ru','kz'])assert.ok(example[lang].length===3&&example[lang].every(Boolean),id);
      for(const src of example.images)destination(src);
    }
  }
});
test('templates make conditional fields optional and do not require a site language in the environment',()=>{
  for(const id of ['test-case','bug-report']){
    const topic=context.window.KB.find(t=>t.id===id);
    assert.match(topic.ru.template,/Предусловия \(необязательно\)/);
    assert.match(topic.ru.template,/Тестовые данные \(необязательно\)/);
    assert.match(topic.kz.template,/Алғышарт \(міндетті емес\)/);
    assert.doesNotMatch(topic.ru.template,/RU\s*\/\s*KZ/);
  }
  assert.ok(kbIds.has('work-templates'));
});
test('Kanban has the four illustrated working columns and a backlog, not an empty generic picture',()=>{
  const svg=fs.readFileSync(path.join(root,data.topics.agile.images[0]),'utf8');
  for(const label of ['Backlog','To do','In progress','Review','Done','TASK-'])assert.ok(svg.includes(label),label);
});

test('the new negative API examples compile in the actual classroom runner',async()=>{
  const {pathToFileURL}=require('node:url');
  const {compile}=await import(pathToFileURL(path.join(root,'server/language.mjs')).href);
  for(const body of data.topics['negative-auto'].body){
    const code=body.match(/```copy\n([\s\S]*?)```/)[1];
    assert.equal(compile(code).length,2);
  }
});
test('the illustrated quantity rejection uses the real cart endpoint, not the product endpoint',()=>{
  const svg=fs.readFileSync(path.join(root,'img/lessons/example-api-6-ru.svg'),'utf8');
  assert.ok(svg.includes('/cart/items'));
  assert.ok(svg.includes('quantity&quot;:0'));
  assert.ok(svg.includes('INVALID_QUANTITY'));
});
