const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {buildCatalog}=require('../scripts/build-lesson-catalog.cjs');
test('the public Discord catalog is current and keeps every lesson number, title and practice kind',()=>{
  const published=JSON.parse(fs.readFileSync(path.join(__dirname,'../data/lesson-catalog.json'),'utf8'));
  assert.deepEqual(published,buildCatalog());
  for(const course of ['k1','k2']){
    assert.deepEqual(Object.keys(published.courses[course]),Array.from({length:26},(_,i)=>String(i+1)));
    for(const lesson of Object.values(published.courses[course])){
      assert.equal(lesson.title.length,2);assert.ok(lesson.title.every(t=>t.trim()));
      assert.ok(['oral','written'].includes(lesson.practiceKind));
    }
  }
});
