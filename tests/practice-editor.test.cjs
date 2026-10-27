const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const code=fs.readFileSync(path.join(__dirname,'../js/learn/practice-editor.js'),'utf8');

function harness({saved=new Map(),lang='ru',route='k1-3',failStorage=false,requireRun=false}={}){
  const fields=[{dataset:{workField:'id'},value:'TC-CRT-001'},{dataset:{workField:'expected'},value:''},{dataset:{workField:'actual'},value:''},{dataset:{workField:'optional'},value:''}];
  const handlers={},status={textContent:''},button={addEventListener:(event,callback)=>handlers['copy']=callback};
  const editor={querySelector:s=>s==='.ln-work-status'?status:s==='.ln-work-copy'?button:null,querySelectorAll:()=>fields,addEventListener:(event,callback)=>handlers[event]=callback};
  let copied='';
  const context={window:{},localStorage:{getItem:key=>saved.get(key)||null,setItem:(key,value)=>{if(failStorage)throw Error('quota');saved.set(key,value);}},navigator:{clipboard:{writeText:async text=>{copied=text;}}},prompt:()=>assert.fail('unexpected manual copy')};
  vm.runInNewContext(code,context);
  const x={template:'unused',worksheet:{sections:[{title:'Cart check',fields:[{key:'id',label:'ID',value:'TC-CRT-001',readOnly:true,required:true},{key:'expected',label:'Expected',required:true},{key:'actual',label:'Actual'},{key:'optional',label:'Optional data'}]}]}};
  if(requireRun){
    x.worksheet.sections[0].fields[2].required=true;
    x.worksheet.sections[0].fields.push({key:'status',label:'Status',mustRun:true});
    fields.push({dataset:{workField:'status'},value:'Not run'});
  }
  context.window.LEARN_PRACTICE.bind({querySelector:()=>editor},x,lang,route);
  return {fields,handlers,status,button,saved,get copied(){return copied;},api:context.window.LEARN_PRACTICE,x};
}

test('a draft survives reopening the same lesson, with readonly ID kept intact',()=>{
  const first=harness();first.fields[1].value='One item in cart';first.handlers.input();
  const reopened=harness({saved:first.saved});assert.equal(reopened.fields[1].value,'One item in cart');assert.equal(reopened.fields[0].value,'TC-CRT-001');
  assert.match(reopened.status.textContent,/черновик/);
});
test('drafts do not leak between lessons or languages',()=>{
  const first=harness();first.fields[1].value='my result';first.handlers.input();
  assert.equal(harness({saved:first.saved,route:'k1-4'}).fields[1].value,'');
  assert.equal(harness({saved:first.saved,lang:'kz'}).fields[1].value,'');
});
test('copying an unfinished worksheet marks missing answers and omits unused optional data',async()=>{
  const h=harness();await h.handlers.copy();assert.match(h.copied,/Expected: <не заполнено>/);assert.doesNotMatch(h.copied,/Optional data:/);assert.doesNotMatch(h.copied,/Actual:/);assert.match(h.status.textContent,/Черновик скопирован/);
  h.fields[1].value='<write expectation>';await h.handlers.copy();assert.match(h.status.textContent,/Черновик/);
});
test('copy contains student input without inventing an actual result',async()=>{
  const h=harness();h.fields[1].value='One item';await h.handlers.copy();assert.match(h.copied,/Expected: One item/);assert.doesNotMatch(h.copied,/Actual:/);assert.match(h.status.textContent,/Работа скопирована/);
});
test('a run-required case stays a draft while its status is Not run',async()=>{
  const h=harness({requireRun:true});
  h.fields[1].value='Expected';h.fields[2].value='Observed';await h.handlers.copy();assert.match(h.status.textContent,/Черновик/);
  h.fields[4].value='Passed';await h.handlers.copy();assert.match(h.status.textContent,/Работа скопирована/);
});
test('a blocked local save gives recovery advice and keeps copy usable',async()=>{
  const h=harness({failStorage:true});h.fields[1].value='expected';h.handlers.input();assert.match(h.status.textContent,/Сохранение недоступно/);await h.handlers.copy();assert.match(h.copied,/expected/);
});
test('worksheet rendering escapes student-facing content and labels optional fields without requiring them',()=>{
  const h=harness();const html=h.api.render({worksheet:{sections:[{title:'<script>',fields:[{key:'field',label:'<unsafe>',value:'"<value>',help:'<help>'}]}]}},'ru');
  assert.doesNotMatch(html,/<script>/);assert.match(html,/&lt;script&gt;/);assert.match(html,/&lt;unsafe&gt;/);assert.doesNotMatch(html,/aria-required/);
});
