import {spawn} from 'node:child_process';
import {randomBytes} from 'node:crypto';
import net from 'node:net';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const listener=net.createServer();await new Promise(r=>listener.listen(0,'127.0.0.1',r));const port=listener.address().port;await new Promise(r=>listener.close(r));
const password=randomBytes(24).toString('hex'),base=`http://127.0.0.1:${port}`;
const child=spawn(process.execPath,[fileURLToPath(new URL('../index.mjs',import.meta.url))],{env:{...process.env,LAB_USERNAME:'tester',LAB_PASSWORD:password,LAB_PASSWORD_FILE:'',PORT:String(port),HOST:'127.0.0.1'},stdio:['ignore','pipe','pipe']});
let errors='';child.stderr.on('data',b=>errors+=b);
async function request(path,method='GET',body,token){const r=await fetch(base+path,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:body===undefined?undefined:JSON.stringify(body)});return{status:r.status,body:await r.json()};}
try{
  let ready=false;for(let i=0;i<60;i++){try{if((await request('/health')).status===200){ready=true;break;}}catch(_){}await new Promise(r=>setTimeout(r,100));}assert.ok(ready,'Server did not start: '+errors);
  assert.equal((await request('/runs','POST',{code:''})).status,401);
  assert.equal((await request('/auth/login','POST',{username:'tester',password:'wrong'})).status,401);
  const session=await request('/auth/login','POST',{username:'tester',password});assert.equal(session.status,200);const token=session.body.token;
  const denied=await fetch(base+'/health',{headers:{Origin:'https://evil.example'}});assert.equal(denied.status,403);
  assert.equal((await request('/runs','POST',{code:"import fs from 'node:fs';"},token)).status,400);
  const code=`import {test,expect} from '@playwright/test';test('live cart',async({page,request})=>{await request.delete('cart');await page.goto('product.html?id=3');await page.getByRole('button',{name:'M',exact:true}).click();await page.getByRole('button',{name:/В корзину|Себетке/}).click();await page.goto('cart.html');await expect(page.getByText('Капучино',{exact:true})).toBeVisible();});`;
  const created=await request('/runs','POST',{code,storage:{qc_lang:'ru',qc_version:'1.1',qc_cart:[],qc_product_overrides:{}}},token);assert.equal(created.status,201);
  let result;for(let i=0;i<160;i++){result=await request('/runs/'+created.body.id,'GET',undefined,token);if(result.body.status!=='running')break;await new Promise(r=>setTimeout(r,250));}
  assert.equal(result.body.status,'passed',JSON.stringify({error:result.body.error,steps:result.body.steps},null,2));assert.equal(result.body.storage.qc_cart[0].id,3);assert.ok(result.body.image?.length>1000);assert.ok(result.body.steps.length>=6);
  const other=await request('/auth/login','POST',{username:'tester',password});assert.equal((await request('/runs/'+created.body.id,'GET',undefined,other.body.token)).status,404);
  const failing=`import {test,expect} from '@playwright/test';test('expected failure',async({page})=>{await page.goto('menu.html');await expect(page.getByRole('heading',{name:'Not a real heading'})).toBeVisible();});`;
  const second=await request('/runs','POST',{code:failing,storage:{}},token);assert.equal(second.status,201);let failure;
  for(let i=0;i<100;i++){failure=await request('/runs/'+second.body.id,'GET',undefined,token);if(failure.body.status!=='running')break;await new Promise(r=>setTimeout(r,250));}
  assert.equal(failure.body.status,'failed');assert.ok(failure.body.error);assert.ok(failure.body.steps.some(s=>s.status==='failed'));
  const third=await request('/runs','POST',{code:failing,storage:{}},token);assert.equal(third.status,201);for(let i=0;i<30;i++){const progress=await request('/runs/'+third.body.id,'GET',undefined,token);if(progress.body.steps.length)break;await new Promise(r=>setTimeout(r,100));}assert.equal((await request('/runs/'+third.body.id,'DELETE',undefined,token)).body.status,'cancelled');
  await request('/auth/logout','POST',{},token);assert.equal((await request('/runs/'+created.body.id,'GET',undefined,token)).status,401);
  console.log('PASS: authenticated real Playwright, cart synchronization, screenshots, failure, cancellation, session isolation, origin and code restrictions');
}finally{child.kill('SIGTERM');await new Promise(resolve=>{child.once('exit',resolve);setTimeout(()=>{child.kill();resolve();},3000).unref();});}
