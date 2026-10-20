import assert from 'node:assert/strict';
import {Classroom} from '../classroom-runtime.mjs';
const c=new Classroom({maxMs:180000});
const pause=ms=>new Promise(r=>setTimeout(r,ms));
try{
 const state=await c.start();assert.equal(state.phase,'running');console.log('Temporary HTTPS tunnel:',state.url,'(credentials omitted).');
 let available=false,lastError='';for(let i=0;i<40;i++){try{const health=await fetch(state.url+'/health',{signal:AbortSignal.timeout(3000)});if(health.ok){available=true;break;}lastError='HTTP '+health.status;}catch(e){lastError=e.cause?.code||e.message;}await pause(2000);}if(!available)console.log('Tunnel check:',lastError,'\n',c.tunnelDiagnostics?.split('\n').filter(l=>/ERR|Registered|connection|proxy|protocol/i.test(l)).slice(-8).join('\n'));assert.ok(available,'HTTPS tunnel did not become ready');
 const login=await fetch(state.url+'/auth/login',{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://digital-college-qa.github.io'},body:JSON.stringify({username:state.username,password:state.password}),signal:AbortSignal.timeout(15000)});assert.equal(login.status,200);const {token}=await login.json();
 const code="import {test,expect} from '@playwright/test';test('lesson via tunnel',async({page,request})=>{await request.delete('cart');await page.goto('product.html?id=3');await page.getByRole('button',{name:'M',exact:true}).click();await page.getByRole('button',{name:/В корзину|Себетке/}).click();await page.goto('cart.html');await expect(page.getByText('Капучино',{exact:true})).toBeVisible();});";
 const created=await fetch(state.url+'/runs',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify({code,storage:{qc_version:'2.0',qc_lang:'ru',qc_cart:[],qc_product_overrides:{}}}),signal:AbortSignal.timeout(15000)});assert.equal(created.status,201);const job=await created.json();let result;
 for(let i=0;i<40;i++){const response=await fetch(state.url+'/runs/'+job.id,{headers:{Authorization:'Bearer '+token},signal:AbortSignal.timeout(10000)});assert.equal(response.status,200);result=await response.json();if(result.status!=='running')break;await pause(500);}
 assert.equal(result.status,'passed',result.error);assert.equal(result.storage.qc_cart[0].id,3);assert.ok(result.image.length>1000);console.log('PASS: real Playwright through public HTTPS tunnel, authorized origin, cart sync and screenshot.');
}finally{await c.stop();assert.equal(c.phase,'stopped');console.log('Runner and public tunnel stopped.');}
