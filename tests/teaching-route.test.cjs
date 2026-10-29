const test=require('node:test'), assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..'),context={window:{}};
const html=fs.readFileSync(path.join(root,'learn.html'),'utf8');
for(const [,src] of html.matchAll(/<script src="([^"?]+)/g)) {
  if(src==='js/study-content.js'||src.startsWith('js/learn/'))vm.runInNewContext(fs.readFileSync(path.join(root,src),'utf8'),context,{filename:src});
}
const data=context.window.STUDY_CONTENT,pairs=context.window.LEARN_PAIRS,ids=new Set(data.topics.map(t=>t.id));
test('unified course pairs are guided, bilingual and carry a filled sample under the template',()=>{
  const course=context.window.LEARN_COURSES.qa,ready=Object.keys(pairs).filter(id=>id.startsWith('qa-'));
  assert.equal(Object.keys(course.titles).length,26);
  assert.equal(JSON.stringify(course.stages.map(s=>s.pairs)),'[[1,8],[9,13],[14,17],[18,26]]');
  assert.equal(ready.length,26);
  for(const id of ready){
    const pair=pairs[id];
    assert.ok(course.titles[id.slice(3)],id);assert.equal(pair.format,'guided-first-lesson',id);
    for(const lang of ['ru','kz']){
      const x=pair[lang];
      assert.equal(x.examples.length,4,id);assert.equal(x.templateAfter,0,id);assert.ok(x.template.trim(),id);
      assert.ok(x.teacher.trim(),id);assert.equal(x.practiceKind,'written',id);
      assert.ok(x.sample.title&&x.sample.note&&x.sample.text,id);
      assert.doesNotMatch(x.sample.text,/<[^>]+>/,id+': образец заполнен до конца');
      assert.equal(x.tasks.length,pair.ru.tasks.length,id);
      assert.equal(x.template.split('\n').length,pair.ru.template.split('\n').length,id+': шаблоны RU и KZ');
      const width=(x.exampleLabels||[1,2,3,4,5]).length+1;assert.ok(x.examples.every(e=>e.length===width&&e.every(v=>v.trim())),id);
      for(const [,href]of x.links)if(href.startsWith('kb.html#'))assert.ok(ids.has(href.split('#')[1]),id+' '+href);
      if(x.image)assert.ok(fs.existsSync(path.join(root,x.image.src)),id);
    }
  }
});
test('a short version of a pair has a topic, a filled sample, a simple task and a blank template in RU and KZ',()=>{
  const simple=Object.entries(pairs).filter(([,pair])=>pair.simple);
  assert.ok(simple.length>=2);
  for(const [id,pair] of simple)for(const lang of ['ru','kz']){
    const x=pair.simple[lang],list=x.options||x.steps||[];
    assert.ok(x.topic.trim()&&x.task.trim()&&x.sample.note.trim()&&x.sample.text.trim(),id);
    assert.ok(x.learn.length>=1&&x.learn.length<=4,id);assert.ok(list.length>=2,id);
    const words=[...x.learn,x.task,...list].join(' ').split(/\s+/).length;
    assert.ok(words<=200,`${id} ${lang}: простая версия короткая (${words} слов)`);
    assert.doesNotMatch(x.sample.text,/\([^()\n]+\)/,id+': образец заполнен до конца');
    assert.match(x.template,/\([^()\n]+\)/,id+': в шаблоне есть места для ответа');
    assert.equal(x.template.split('\n').length,pair.simple.ru.template.split('\n').length,id+': шаблоны RU и KZ');
    for(const [,href]of x.links)if(href.startsWith('kb.html#'))assert.ok(ids.has(href.split('#')[1]),id+' '+href);
  }
});
test('only the unified course is on the site; old course 1 and 2 routes lead to it',()=>{
  assert.equal(JSON.stringify(Object.keys(context.window.LEARN_COURSES)),'["qa"]');
  assert.equal(Object.keys(pairs).filter(id=>!id.startsWith('qa-')).length,0);
  assert.ok(!('lessons' in data));
  assert.ok(!fs.existsSync(path.join(root,'js/learn/k1-plan.js')));
  const learn=fs.readFileSync(path.join(root,'js/learn.js'),'utf8');
  const routes=JSON.parse('{'+learn.match(/const OLD_ROUTES = \{([\s\S]*?)\};/)[1].replace(/(k[12]):/g,'"$1":')+'}');
  for(const course of ['k1','k2']){assert.equal(routes[course].length,26,course);assert.ok(routes[course].every(n=>Number.isInteger(n)&&n>=1&&n<=26),course);}
});
test('every topic has a few complete examples; topics of the course show at least three',()=>{
  for(const [id,rows]of Object.entries(data.examples)){
    const topic=data.topics.find(t=>t.id===id);
    assert.ok(rows.length>=2&&rows.length<=24,id);
    if(topic.pairs.qa.length&&topic.block!=='tools')assert.ok(rows.length>=3,id);
    for(const lang of ['ru','kz'])for(const row of rows){assert.equal(row[lang].length,3,id);assert.ok(row[lang].every(s=>typeof s==='string'&&s.trim()),id);}
  }
});
test('knowledge base topics point to pairs of the unified course',()=>{
  for(const topic of data.topics){
    assert.equal(JSON.stringify(Object.keys(topic.pairs)),'["qa"]',topic.id);
    assert.ok(topic.pairs.qa.every(n=>Number.isInteger(n)&&n>=1&&n<=26),topic.id);
    assert.notEqual(topic.block,'k2',topic.id);
  }
  assert.equal(new Set(data.topics.flatMap(t=>t.pairs.qa)).size,26);
  assert.ok(data.topics.find(t=>t.id==='severity-priority').pairs.qa.includes(4));
});
test('lessons and knowledge base load exactly the same canonical teaching data',()=>{
  const kb=fs.readFileSync(path.join(root,'kb.html'),'utf8');
  const canonical=page=>page.match(/src="(js\/study-content\.js\?v=[^"]+)"/)?.[1];
  assert.ok(canonical(html));assert.equal(canonical(html),canonical(kb));
  assert.ok(!html.includes('k1-plan')&&!kb.includes('k1-plan'));
  assert.ok(!html.includes('js/learn/student-route.js'));assert.ok(!kb.includes('js/kb/a-t00-t08.js'));
});
