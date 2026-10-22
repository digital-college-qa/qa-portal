const test=require('node:test'), assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..'),context={window:{}};
const html=fs.readFileSync(path.join(root,'learn.html'),'utf8');
for(const [,src] of html.matchAll(/<script src="([^"?]+)/g)) {
  if(src==='js/study-content.js'||src.startsWith('js/learn/'))vm.runInNewContext(fs.readFileSync(path.join(root,src),'utf8'),context,{filename:src});
}
const data=context.window.STUDY_CONTENT,pairs=context.window.LEARN_PAIRS,ids=new Set(data.topics.map(t=>t.id));
test('all 52 actual lesson routes are short, bilingual and tied to their source pair',()=>{
  assert.equal(Object.keys(pairs).length,52);
  for(const course of ['k1','k2'])for(let n=1;n<=26;n++){
    const id=`${course}-${n}`,pair=pairs[id],source=data.lessons[id];
    assert.equal(source.source.pair,n,id);
    assert.match(source.source.file,new RegExp(course==='k1'?'1 курс':'2 курс'));
    assert.ok(['1.0','1.5','2.0'].includes(source.version));
    assert.ok(source.topics.length>0&&source.topics.every(t=>ids.has(t)),id);
    for(const lang of ['ru','kz']){
      assert.ok(pair[lang].intro.trim());
      if(id==='k1-1'){assert.equal(pair.format,'guided-first-lesson');assert.equal(pair[lang].examples.length,10);continue;}
      assert.equal(pair.format,'simple-course',id);assert.equal(pair[lang].tasks.length,3,id);
      assert.ok(pair[lang].tasks.every(t=>t.length>20),id);
      assert.doesNotMatch(pair[lang].tasks.join(' '),/version=(1\.1|2\.1)/);
    }
  }
});
test('every lesson topic has ten complete examples in both languages',()=>{
  for(const [id,rows]of Object.entries(data.examples)){
    assert.equal(rows.length,10,id);
    for(const lang of ['ru','kz'])for(const row of rows){assert.equal(row[lang].length,3,id);assert.ok(row[lang].every(s=>typeof s==='string'&&s.trim()),id);}
  }
});
test('lessons and knowledge base load exactly the same canonical teaching data',()=>{
  const kb=fs.readFileSync(path.join(root,'kb.html'),'utf8');
  assert.ok(html.includes('js/study-content.js?v=35'));assert.ok(kb.includes('js/study-content.js?v=35'));
  assert.ok(!html.includes('js/learn/student-route.js'));assert.ok(!kb.includes('js/kb/a-t00-t08.js'));
});
