import { createRequire } from 'node:module';
import { compile, executeStatements } from './language.mjs';
const require=createRequire(import.meta.url);
let chromium,expect;
try{({chromium,expect}=require('@playwright/test'));}catch(error){if(!process.env.QA_DEPENDENCIES)throw error;({chromium}=require(process.env.QA_DEPENDENCIES+'/playwright'));({expect}=require(process.env.QA_DEPENDENCIES+'/playwright/test'));}
process.once('message',async job=>{
  let browser;
  try{
    const tests=compile(job.code);expect.setDefaultOptions?.({timeout:4000});
    browser=await chromium.launch({headless:true,chromiumSandbox:process.platform==='linux',...(process.env.QA_BROWSER_PATH?{executablePath:process.env.QA_BROWSER_PATH}:{})});
    for(const testcase of tests){
      process.send({type:'step',step:{title:testcase.title,status:'running'}});
      const context=await browser.newContext({viewport:{width:1100,height:760},serviceWorkers:'block',acceptDownloads:false});
      context.setDefaultTimeout(4500);context.setDefaultNavigationTimeout(8000);
      await context.route('**/*',route=>{const url=new URL(route.request().url());return url.origin===new URL(job.baseURL).origin&&url.pathname.startsWith('/shop/')&&!url.pathname.startsWith('/shop/server/')?route.continue():route.abort();});
      await context.addInitScript(({storage,marker})=>{if(sessionStorage.getItem('__qa_seed')===marker)return;for(const[k,v]of Object.entries(storage))localStorage.setItem(k,JSON.stringify(v));sessionStorage.setItem('__qa_seed',marker);},{storage:job.storage,marker:job.key});
      const page=await context.newPage();
      await page.goto(job.baseURL+'menu.html');
      const snapshot=async()=>{
        const storage=await page.evaluate(()=>Object.fromEntries(['qc_cart','qc_product_overrides','qc_lang','qc_version'].map(k=>[k,JSON.parse(localStorage.getItem(k)||'null')])));
        const image=(await page.screenshot({type:'jpeg',quality:45,timeout:4000})).toString('base64');
        const current=new URL(page.url());
        return {storage,image,route:current.pathname.split('/').pop()+current.search};
      };
      const request={};
      for(const method of ['get','post','put','patch','delete'])request[method]=async(path,options={})=>{
        if(typeof path!=='string'||!/^\/?(?:products|cart|orders|session)(?:[/?]|$)/.test(path))throw Error('Use a relative training API path');
        const current=await snapshot();
        await context.request.post(job.apiURL+'/state',{headers:{'X-QA-Run':job.key},data:current.storage,timeout:5000});
        const url=new URL(path.replace(/^\//,''),job.apiURL+'/');
        if(!url.href.startsWith(job.apiURL+'/'))throw Error('API path is outside the training contract');
        const response=await context.request[method](url.href,{data:options.data,headers:{'X-QA-Run':job.key},timeout:5000});
        const state=await context.request.get(job.apiURL+'/state',{headers:{'X-QA-Run':job.key},timeout:5000});
        const storage=await state.json();
        await page.evaluate(storage=>{for(const[k,v]of Object.entries(storage))localStorage.setItem(k,JSON.stringify(v));window.QAShop?.refresh();},storage);
        return response;
      };
      await executeStatements(testcase.body,{page,request,expect,baseURL:job.baseURL,step:async(node,status,durationMs,error)=>{
        const output=await snapshot();process.send({type:'step',step:{title:job.code.slice(node.start,node.end).replace(/\s+/g,' ').slice(0,160),status,durationMs,error},...output});
      }});
      process.send({type:'test-passed',title:testcase.title,...await snapshot()});await context.close();
    }
    process.send({type:'done',status:'passed'});
  }catch(error){process.send?.({type:'done',status:'failed',error:error.message.slice(0,1800)});}
  finally{if(browser)await browser.close().catch(()=>{});process.exit(0);}
});
