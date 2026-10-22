const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const c = vm.createContext({window:{KB:[],LEARN_PAIRS:{}}});
const run = f => vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),c,{filename:f});
for(const f of fs.readdirSync(path.join(root,'js/kb')).filter(f=>f.endsWith('.js')))run('js/kb/'+f);
run('js/learn/course.js');
for(const f of fs.readdirSync(path.join(root,'js/learn')).filter(f=>/^k1-.*\.js$/.test(f)))run('js/learn/'+f);
run('js/learn/student-route.js');
run('js/learn/first-lesson.js');

test('all 52 scheduled lessons have bilingual practical guidance and valid learning destinations',()=>{
  const ids=new Set(c.window.KB.map(t=>t.id));
  assert.equal(Object.keys(c.window.LEARN_PAIRS).length,52);
  for(const course of ['k1','k2']) for(let n=1;n<=26;n++){
    const id=course+'-'+n, lesson=c.window.LEARN_PAIRS[id];
    assert.ok(lesson,id);
    for(const lang of ['ru','kz']){
      assert.ok(lesson.summary[lang==='kz'?1:0]);
      const content=lesson[lang];
      if(lesson.format==='guided-first-lesson') {
        assert.equal(id,'k1-1','Only the approved pilot should use the new format');
        assert.equal(content.examples.length,10);
        assert.equal(new Set(content.examples.map(e=>e[0])).size,10);
        for(const example of content.examples) {
          assert.equal(example.length,6,'Situation, rule, action, expectation, observation and explanation');
          assert.ok(example.every(field=>typeof field==='string'&&field.trim()));
        }
        assert.ok(content.explanation.length&&content.tasks.length);
        assert.match(content.template,/CAT-02/);
        assert.match(content.tasks.join(' '),/work-chat/);
        assert.match(content.explanation.join(' '),/Requirement/);
        const destinations=[...content.links.map(([,href])=>href),
          ...content.tasks.flatMap(s=>Array.from(s.matchAll(/\]\(([^)]+)\)/g),m=>m[1]))];
        for(const href of destinations) {
          if(/^https?:/.test(href))continue;
          const url=new URL(href,'https://school.invalid/');
          assert.ok(fs.existsSync(path.join(root,url.pathname.slice(1))),id+': '+href);
          if(url.pathname==='/kb.html')assert.ok(ids.has(url.hash.slice(1)),href);
        }
        continue;
      }
      assert.ok(content.sections.length>=5,id+': actionable sections');
      const text=content.sections.map(s=>s.s).join('\n');
      assert.match(text,/version=(1\.0|1\.5|2\.0)/,id);
      assert.doesNotMatch(text,/version=(1\.1|2\.1)/,id);
      assert.match(text,/start-here/,id+': beginner fallback');
      assert.ok(content.sections[3].s.includes( lang==='ru'?'Минимум':'Ең азы'),id+': submission');
      for(const section of content.sections)for(const mode of ['s','d']){
        assert.ok(section.h[mode]&&section[mode],id);
        for(const [,href] of section[mode].matchAll(/\]\(([^)]+)\)/g)){
          if(/^https?:/.test(href))continue;
          const url=new URL(href,'https://school.invalid/');
          assert.ok(fs.existsSync(path.join(root,url.pathname.slice(1))),id+': '+href);
          if(url.pathname==='/kb.html'&&url.hash)assert.ok(ids.has(url.hash.slice(1)),id+': '+href);
        }
      }
      for(const mode of ['s','d'])for(const [q,options,answer,why]of content.quiz[mode])assert.ok(q&&why&&options[answer],id);
    }
  }
});

test('beginner routes are loaded before rendering and the first course uses the stable project',()=>{
  const html=fs.readFileSync(path.join(root,'learn.html'),'utf8');
  assert.ok(html.indexOf('js/learn/student-route.js')<html.indexOf('src="js/learn.js'));
  assert.ok(html.indexOf('js/learn/student-route.js')<html.indexOf('js/learn/first-lesson.js'));
  assert.ok(html.indexOf('js/learn/first-lesson.js')<html.indexOf('src="js/learn.js'));
  assert.equal(c.window.LEARN_COURSES.k1.stages[4].sub[0],'Проверяем свой раздел qala coffe 1.5');
  assert.ok(c.window.KB.find(t=>t.id==='start-here'));
  assert.ok(c.window.KB.find(t=>t.id==='api-first-request'));
  for(const n of [13,14,15,16])for(const lang of ['ru','kz']){
    const text=c.window.LEARN_PAIRS['k2-'+n][lang].sections.map(s=>s.s).join('\n');
    assert.match(text,/version=2\.0&tool=tests/,'Automation practice must open the actual test panel');
  }
});
