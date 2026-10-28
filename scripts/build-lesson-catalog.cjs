/* Public student lesson catalog: the website and Discord use the same loaded lesson data. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
function buildCatalog(root=path.join(__dirname,'..'),readSource=file=>fs.readFileSync(path.join(root,file),'utf8')){
  const html=readSource('learn.html'),context={window:{}};
  for(const [,src]of html.matchAll(/<script src="([^"?]+)/g)){
    if(src==='js/study-content.js'||src.startsWith('js/learn/'))vm.runInNewContext(readSource(src),context,{filename:src});
  }
  const {LEARN_COURSES:metadata,LEARN_PAIRS:lessons}=context.window,courses={};
  const plain=text=>String(text||'').replace(/\[([^\]]+)\]\(([^)]+)\)/g,'$1').trim();
  for(const course of ['k1','k2']){
    courses[course]={};
    for(let n=1;n<=26;n++){
      const lesson=lessons[`${course}-${n}`];
      if(!lesson)throw Error(`Missing lesson ${course}-${n}`);
      const guided=lesson.format==='guided-first-lesson';
      const entry={title:Array.from(metadata[course].titles[n]),guided,practiceKind:lesson.ru.practiceKind||'written'};
      for(const [i,lang]of ['ru','kz'].entries())entry[lang]={intro:plain(lesson[lang].intro),result:plain(lesson.summary?.[i]),tasks:guided?[]:Array.from(lesson[lang].tasks||[],plain)};
      courses[course][n]=entry;
    }
  }
  return {schemaVersion:1,revision:crypto.createHash('sha256').update(JSON.stringify(courses)).digest('hex'),lessonUrl:'https://digital-college-qa.github.io/qa-portal/learn.html',courses};
}
module.exports={buildCatalog};
if(require.main===module){
  const root=path.join(__dirname,'..'),file=path.join(root,'data/lesson-catalog.json'),text=JSON.stringify(buildCatalog(root),null,2)+'\n';
  if(process.argv.includes('--check')){
    if(!fs.existsSync(file)||fs.readFileSync(file,'utf8')!==text){console.error('Lesson catalog is stale. Run node scripts/build-lesson-catalog.cjs');process.exitCode=1;}
    else console.log('Lesson catalog matches all 52 website lessons.');
  }else{fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,text);console.log('Generated data/lesson-catalog.json: 52 lessons.');}
}
