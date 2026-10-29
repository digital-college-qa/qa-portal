const test=require('node:test'), assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..'),context={window:{}};
const html=fs.readFileSync(path.join(root,'learn.html'),'utf8');
for(const [,src] of html.matchAll(/<script src="([^"?]+)/g)) {
  if(src==='js/study-content.js'||src.startsWith('js/learn/'))vm.runInNewContext(fs.readFileSync(path.join(root,src),'utf8'),context,{filename:src});
}
const data=context.window.STUDY_CONTENT,pairs=context.window.LEARN_PAIRS,ids=new Set(data.topics.map(t=>t.id));
const GUIDED=Array.from({length:26},(_,i)=>'k1-'+(i+1));
test('unified course pairs are guided, bilingual and carry a filled sample under the template',()=>{
  const course=context.window.LEARN_COURSES.qa,ready=Object.keys(pairs).filter(id=>id.startsWith('qa-'));
  assert.equal(Object.keys(course.titles).length,26);
  assert.equal(JSON.stringify(course.stages.map(s=>s.pairs)),'[[1,8],[9,13],[14,17],[18,26]]');
  assert.ok(ready.length>=17);
  for(const id of ready){
    const pair=pairs[id];
    assert.ok(course.titles[id.slice(3)],id);assert.equal(pair.format,'guided-first-lesson',id);
    for(const lang of ['ru','kz']){
      const x=pair[lang];
      assert.equal(x.examples.length,4,id);assert.equal(x.templateAfter,0,id);assert.ok(x.template.trim(),id);
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
test('all 52 actual lesson routes are short, bilingual and tied to their source pair',()=>{
  assert.equal(Object.keys(pairs).filter(id=>/^k[12]-/.test(id)).length,52);
  for(const course of ['k1','k2'])for(let n=1;n<=26;n++){
    const id=`${course}-${n}`,pair=pairs[id],source=data.lessons[id];
    assert.equal(source.source.pair,n,id);
    assert.match(source.source.file,new RegExp(course==='k1'?'1 курс':'2 курс'));
    assert.ok(['1.0','1.5','2.0'].includes(source.version));
    assert.ok(source.topics.length>0&&source.topics.every(t=>ids.has(t)),id);
    for(const lang of ['ru','kz']){
      assert.ok(pair[lang].intro.trim());
      if(GUIDED.includes(id)){
        const x=pair[lang];
        assert.equal(pair.format,'guided-first-lesson',id);assert.ok(x.examples.length>=4&&x.examples.length<=10,id);
        assert.ok(x.tasks[x.templateAfter??2],id);
        assert.ok(['written','oral'].includes(x.practiceKind),id);
        assert.ok(x.teacher.trim(),id);
        if(x.practiceKind==='oral') {
          assert.equal(x.template,'',id);
          assert.ok(!x.worksheet,id);
        } else {
          assert.ok(x.template.trim(),id);
          if(x.worksheet)for(const section of x.worksheet.sections){
            assert.ok(section.title,id);assert.ok(section.fields.length,id);
            for(const field of section.fields)assert.ok(field.key&&field.label,id);
          }
        }
        assert.deepEqual(Array.from(source.source.originalPairs),Array.from(pair.originalPairs),id);
        for(const [,href]of x.links)if(href.startsWith('kb.html#'))assert.ok(ids.has(href.split('#')[1]),id+' '+href);
        assert.equal(x.tasks.length,pair.ru.tasks.length,id);assert.equal(x.examples.length,pair.ru.examples.length,id);
        const width=(x.exampleLabels||[1,2,3,4,5]).length+1;assert.ok(x.examples.every(e=>e.length===width&&e.every(s=>s.trim())),id);
        if(x.image)assert.ok(fs.existsSync(path.join(root,x.image.src)),id);
        continue;
      }
      assert.equal(pair.format,'simple-course',id);assert.equal(pair[lang].tasks.length,3,id);
      assert.ok(pair[lang].tasks.every(t=>t.length>20),id);
      assert.doesNotMatch(pair[lang].tasks.join(' '),/version=(1\.1|2\.1)/);
    }
  }
});
test('every topic has a few complete examples; lesson topics show at least three',()=>{
  const lessonTopics=new Set(Object.values(data.lessons).flatMap(l=>l.topics));
  for(const [id,rows]of Object.entries(data.examples)){
    assert.ok(rows.length>=2&&rows.length<=24,id);
    if(lessonTopics.has(id))assert.ok(rows.length>=3,id);
    for(const lang of ['ru','kz'])for(const row of rows){assert.equal(row[lang].length,3,id);assert.ok(row[lang].every(s=>typeof s==='string'&&s.trim()),id);}
  }
});
test('lessons and knowledge base load exactly the same canonical teaching data',()=>{
  const kb=fs.readFileSync(path.join(root,'kb.html'),'utf8');
  const canonical=page=>page.match(/src="(js\/study-content\.js\?v=[^"]+)"/)?.[1];
  assert.ok(canonical(html));assert.equal(canonical(html),canonical(kb));
  assert.ok(html.includes('js/learn/k1-plan.js'));assert.ok(kb.includes('js/learn/k1-plan.js'));
  assert.ok(!html.includes('js/learn/student-route.js'));assert.ok(!kb.includes('js/kb/a-t00-t08.js'));
});
test('the new sequence keeps every original topic and puts Severity at the first bug report',()=>{
  const originals=new Set(Object.values(context.window.K1_CURRICULUM.mapping).flat());
  assert.deepEqual([...originals].sort((a,b)=>a-b),Array.from({length:26},(_,i)=>i+1));
  assert.ok(data.lessons['k1-4'].topics.includes('severity-priority'));
  assert.ok(!data.lessons['k1-14'].topics.includes('severity-priority'));
  const severity=data.topics.find(t=>t.id==='severity-priority');
  assert.ok(severity.pairs.k1.includes(4));assert.ok(!severity.pairs.k1.includes(14));
  const ranges=context.window.LEARN_COURSES.k1.stages.flatMap(stage=>Array.from({length:stage.pairs[1]-stage.pairs[0]+1},(_,i)=>stage.pairs[0]+i));
  assert.deepEqual(Array.from(ranges),Array.from({length:26},(_,i)=>i+1));
});
