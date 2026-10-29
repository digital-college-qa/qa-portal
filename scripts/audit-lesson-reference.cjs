/* Audit the exact lesson vocabulary and abbreviations used by the browser reference. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
function load(root=path.join(__dirname,'..')){
  const c={window:{}};
  for(const [,src]of fs.readFileSync(path.join(root,'learn.html'),'utf8').matchAll(/<script src="([^"?]+)/g)){
    if(src==='js/study-content.js'||src.startsWith('js/learn/'))vm.runInNewContext(fs.readFileSync(path.join(root,src),'utf8'),c,{filename:src});
  }
  return c.window;
}
module.exports={load};
if(require.main===module){
  const w=load(),rows=[];
  for(let n=1;n<=26;n++){
    const route=`qa-${n}`,pair=w.LEARN_PAIRS[route],ru=w.LEARN_REFERENCE.build(pair,route,'ru'),kz=w.LEARN_REFERENCE.build(pair,route,'kz');
    rows.push(`| ${n} | ${ru.glossary.length} / ${kz.glossary.length} | ${ru.abbreviations.map(a=>a.code).join(', ')||'—'} |`);
  }
  const text='# Словари и сокращения уроков\n\nСрез текущего содержания. Пересчитать: `node scripts/audit-lesson-reference.cjs`.\nСами справочники вычисляются в браузере из актуального текста урока, терминов и подписей иллюстраций.\n\n| Пара | Слова RU / KZ | Сокращения в русском варианте |\n|---|---|---|\n'+rows.join('\n')+'\n\nREG и BTN показываются только при появлении в тексте. Коды разделов — локальная договорённость проекта.\nСловарь слева следует языку портала и всегда сохраняет английский перевод.\nНа узком экране два справочника превращаются в раскрываемые блоки над уроком.\n';
  fs.writeFileSync(path.join(__dirname,'../docs/lesson-reference-audit.md'),text);
  console.log(rows.join('\n'));
}
