import http from 'node:http';
import {isIP} from 'node:net';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {randomBytes,scryptSync,timingSafeEqual} from 'node:crypto';
import {fork,spawn} from 'node:child_process';
import {createRequire} from 'node:module';
import {compile} from './language.mjs';
import {loadAccounts,verifyPassword} from './accounts.mjs';
const require=createRequire(import.meta.url);
const {createStore}=require('../js/labs/store.js');
const scenarios=require('../js/labs/scenario-model.js');
const ROOT=path.resolve(fileURLToPath(new URL('..',import.meta.url)));
const PORT=Number(process.env.PORT||3000),HOST=process.env.HOST||'127.0.0.1';
const USER=process.env.LAB_USERNAME||'student';
const USERS_FILE=process.env.LAB_USERS_FILE;
const password=process.env.LAB_PASSWORD_FILE?(await readFile(process.env.LAB_PASSWORD_FILE,'utf8')).trim():process.env.LAB_PASSWORD;
if(!USERS_FILE&&(!password||password.length<16))throw Error('Configure LAB_USERS_FILE or LAB_PASSWORD_FILE (at least 16 characters). No default password is provided.');
if(USERS_FILE)await loadAccounts(USERS_FILE);
const salt=randomBytes(16),passwordHash=scryptSync(password||randomBytes(24).toString('hex'),salt,32);
const origins=new Set((process.env.ALLOWED_ORIGINS||'https://digital-college-qa.github.io').split(',').map(x=>x.trim()));
const sessions=new Map(),runs=new Map(),attempts=new Map();
const seedSource=await readFile(path.join(ROOT,'js/data.js'),'utf8');
// This is our checked-in catalog, never submitted student source.
const {runInNewContext}=await import('node:vm');
const seed=runInNewContext(seedSource+'; JSON.parse(JSON.stringify(PRODUCTS))',{JSON});
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png'};
function state(input={}){
  const catalog=new Set(seed.map(p=>p.id));
  const cart=Array.isArray(input.qc_cart)?input.qc_cart.slice(0,40).filter(i=>i&&catalog.has(i.id)&&['S','M','L'].includes(i.size)&&Number.isInteger(i.qty)&&i.qty>=1&&i.qty<=10).map(i=>({id:i.id,size:i.size,qty:i.qty,syrup:Boolean(i.syrup),...(i.milk==='oat'?{milk:'oat'}:{}),...(['vanilla','caramel'].includes(i.syrupType)?{syrupType:i.syrupType}:{}),...(i.combo===true?{combo:true}:{})})):[];
  const overrides={};
  for(const[id,value]of Object.entries(input.qc_product_overrides||{})){if(!catalog.has(Number(id))||!value||typeof value!=='object')continue;const p={};if(Number.isInteger(value.price)&&value.price>=0&&value.price<=100000)p.price=value.price;if(typeof value.inStock==='boolean')p.inStock=value.inStock;overrides[id]=p;}
  return {qc_cart:cart,qc_product_overrides:overrides,qc_lang:input.qc_lang==='kz'?'kz':'ru',qc_version:['1.0','1.5','2.0'].includes(input.qc_version)?input.qc_version:'2.0'};
}
function send(res,status,data,headers={}){res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers});res.end(status===204?undefined:JSON.stringify(data));}
function payload(req){return new Promise((resolve,reject)=>{let data='';req.on('data',chunk=>{data+=chunk;if(data.length>32768){reject(Error('Request is too large'));req.destroy();}});req.on('end',()=>{try{resolve(JSON.parse(data||'{}'));}catch(_){reject(Error('Invalid JSON'));}});req.on('error',reject);});}
async function auth(req){const match=req.headers.authorization?.match(/^Bearer ([a-f0-9]{64})$/);const entry=match&&sessions.get(match[1]);if(!entry||entry.expires<=Date.now())return null;if(USERS_FILE){const u=(await loadAccounts(USERS_FILE)).users.find(u=>u.username===entry.username);if(!u||u.disabled||u.hash!==entry.credential){sessions.delete(match[1]);for(const run of runs.values())if(run.owner===entry.owner&&run.status==='running')stop(run);return null;}}return{...entry,token:match[1]};}
function killGroup(child){if(!child?.pid)return;try{if(process.platform==='linux')process.kill(-child.pid,'SIGKILL');else if(process.platform==='win32')spawn('taskkill',['/PID',String(child.pid),'/T','/F'],{windowsHide:true,stdio:'ignore'}).on('error',()=>child.kill());else child.kill();}catch(_){}}
function stop(run,status='cancelled',graceful=false){clearTimeout(run.timer);if(graceful)setTimeout(()=>killGroup(run.child),1500).unref();else killGroup(run.child);run.status=status;run.steps.forEach(s=>{if(s.status==='running')s.status=status==='passed'?'passed':'failed';});run.finished=Date.now();}
function publicRun(run){return {id:run.id,status:run.status,steps:run.steps,error:run.error,image:run.image,storage:run.storage,route:run.route};}
const server=http.createServer(async(req,res)=>{
  const origin=req.headers.origin;
  if(origin&&!origins.has(origin)){send(res,403,{error:'Origin is not allowed'});return;}
  if(origin){res.setHeader('Access-Control-Allow-Origin',origin);res.setHeader('Vary','Origin');res.setHeader('Access-Control-Allow-Headers','Authorization, Content-Type');res.setHeader('Access-Control-Allow-Methods','GET, POST, DELETE, OPTIONS');}
  if(req.method==='OPTIONS'){res.writeHead(204);res.end();return;}
  const url=new URL(req.url,'http://localhost');
  try{
    if(url.pathname==='/health'){send(res,200,{service:'qa-playwright-runner',ready:true});return;}
    if(url.pathname==='/auth/login'&&req.method==='POST'){
      const forwarded=String(req.headers['x-forwarded-for']||'').split(',')[0].trim();
      const ip=process.env.TRUST_PROXY==='1'&&isIP(forwarded)?forwarded:(req.socket.remoteAddress||'unknown');
      if(attempts.size>2000){for(const[key,item]of attempts)if(item.until<Date.now())attempts.delete(key);if(attempts.size>2000){send(res,429,{error:'Try again later'});return;}}
      let count=attempts.get(ip);if(!count||count.until<Date.now()){count={count:0,until:Date.now()+60000};attempts.set(ip,count);}if(count.count>=8){send(res,429,{error:'Too many login attempts. Wait one minute.'});return;}
      const body=await payload(req),provided=typeof body.password==='string'&&body.password.length<=256?body.password:'';
      if(count.count>=8){send(res,429,{error:'Too many login attempts. Wait one minute.'});return;}
      const account=USERS_FILE?(await loadAccounts(USERS_FILE)).users.find(u=>u.username===body.username):null;
      const valid=USERS_FILE?verifyPassword(provided,account||{salt:salt.toString('hex'),hash:passwordHash.toString('hex')})&&Boolean(account&&!account.disabled):timingSafeEqual(scryptSync(provided,salt,32),passwordHash)&&body.username===USER;
      if(!valid){count.count++;send(res,401,{error:'Incorrect username or password'});return;}
      if(sessions.size>=300){send(res,503,{error:'Session limit reached'});return;}
      const token=randomBytes(32).toString('hex');sessions.set(token,{username:body.username,credential:account?.hash,owner:randomBytes(16).toString('hex'),expires:Date.now()+6*3600000});send(res,200,{token,expiresIn:21600});return;
    }
    if(url.pathname==='/auth/logout'&&req.method==='POST'){const session=await auth(req);if(session){sessions.delete(session.token);for(const run of runs.values())if(run.owner===session.owner&&run.status==='running')stop(run);}send(res,200,{ok:true});return;}
    // Worker-only API is reachable on loopback and requires a per-run random key.
    if(url.pathname.startsWith('/api/training/')){
      if(!['127.0.0.1','::1','::ffff:127.0.0.1'].includes(req.socket.remoteAddress)){send(res,403,{error:'Worker API is local only'});return;}
      const key=req.headers['x-qa-run'];const run=[...runs.values()].find(r=>r.key===key&&r.status==='running');if(!run){send(res,401,{error:'Unknown run'});return;}
      const apiPath=url.pathname.slice('/api/training'.length)+url.search;
      if(apiPath==='/state'){
        if(req.method==='POST')run.storage=state(await payload(req));
        send(res,200,run.storage);return;
      }
      const store=createStore({read:(k,f)=>run.storage[k]??f,write:(k,v)=>run.storage[k]=v,seed});
      const data=await payload(req);const result=store.handle({method:req.method,path:apiPath,body:JSON.stringify(data),requestId:randomBytes(8).toString('hex')});send(res,result.status,result.body,result.headers);return;
    }
    if(url.pathname.startsWith('/shop/scenario-api/')&&req.method==='POST'){
      const result=await scenarios.respond(url.pathname.slice('/shop/scenario-api/'.length),await payload(req),url.searchParams.get('mode'));
      send(res,result.status,result.body,{'X-Training-Simulation':'true','X-Trace-Id':String(req.headers['x-trace-id']||'local').slice(0,100)});return;
    }
    // The runner serves only known training assets, never its own source/config.
    if(url.pathname.startsWith('/shop/')&&req.method==='GET'){
      const relative=decodeURIComponent(url.pathname.slice(6));
      if(relative.includes('..')||relative.includes('\\')||!(/^(?:home|menu|product|cart|checkout|account|login|register|contacts|aktsii)\.html$/.test(relative)||/^(?:js|css|img)\/[a-zA-Z0-9_./-]+$/.test(relative))||!mime[path.extname(relative)]){send(res,404,{error:'Not found'});return;}
      const file=await readFile(path.join(ROOT,relative));res.writeHead(200,{'Content-Type':mime[path.extname(relative)],'X-Content-Type-Options':'nosniff','Cache-Control':'no-store'});res.end(file);return;
    }
    const session=await auth(req);if(!session){send(res,401,{error:'Log in to the Playwright server'});return;}
    if(url.pathname==='/runs'&&req.method==='POST'){
      if([...runs.values()].filter(r=>r.status==='running').length>=2){send(res,429,{error:'Two tests are already running. Try again shortly.'});return;}
      const sameStudent=r=>process.env.LAB_SHARED_CLASS_LOGIN==='1'?r.owner===session.owner:r.username===session.username;
      if([...runs.values()].some(r=>sameStudent(r)&&r.status==='running')){send(res,429,{error:'Your previous run is still active'});return;}
      const recent=[...runs.values()].filter(r=>sameStudent(r)&&r.started>Date.now()-60000);if(recent.length>=5){send(res,429,{error:'At most five runs per minute'});return;}
      const body=await payload(req);if(body.storage?.qc_version&&body.storage.qc_version!=='2.0'){send(res,403,{error:'Playwright is available in release 2.0'});return;}try{compile(body.code);}catch(e){send(res,400,{error:e.message});return;}
      if(runs.size>=50){const old=[...runs.values()].filter(r=>r.status!=='running').sort((a,b)=>a.started-b.started);for(const item of old){runs.delete(item.id);if(runs.size<40)break;}if(runs.size>=50){send(res,503,{error:'Result storage is full'});return;}}
      const id=randomBytes(16).toString('hex'),key=randomBytes(24).toString('hex');
      const run={id,key,owner:session.owner,username:session.username,status:'running',started:Date.now(),storage:state(body.storage),steps:[]};runs.set(id,run);
      const child=fork(fileURLToPath(new URL('worker.mjs',import.meta.url)),[],{detached:process.platform==='linux',execArgv:['--max-old-space-size=256'],stdio:['ignore','ignore','pipe','ipc'],env:{PATH:process.env.PATH,HOME:process.env.HOME,USERPROFILE:process.env.USERPROFILE,TMP:process.env.TMP,TEMP:process.env.TEMP,PLAYWRIGHT_BROWSERS_PATH:process.env.PLAYWRIGHT_BROWSERS_PATH,QA_DEPENDENCIES:process.env.QA_DEPENDENCIES,QA_BROWSER_PATH:process.env.QA_BROWSER_PATH}});run.child=child;
      run.timer=setTimeout(()=>{run.error='Execution time limit (45 seconds) exceeded';stop(run,'failed');},45000);
      child.on('message',message=>{
        if(run.status!=='running')return;
        if(message.storage)run.storage=state(message.storage);
        if(typeof message.route==='string')run.route=message.route;
        if(typeof message.image==='string'&&message.image.length<1500000)run.image=message.image;
        if(message.type==='step'&&run.steps.length<120)run.steps.push({...message.step,...(message.step.status==='running'?{startedAt:Date.now()}:{})});
        if(message.type==='test-passed'){const item=run.steps.find(s=>s.status==='running'&&s.title===message.title);if(item){item.status='passed';item.durationMs=Date.now()-item.startedAt;delete item.startedAt;}}
        if(message.type==='done'){run.error=message.error;stop(run,message.status==='passed'?'passed':'failed',true);}
      });
      child.on('error',()=>{run.error='The browser runner could not start';stop(run,'failed');});
      child.on('exit',()=>{if(run.status==='running'){run.error='The browser runner stopped unexpectedly';stop(run,'failed');}});
      child.send({code:body.code,storage:run.storage,key,baseURL:`http://127.0.0.1:${PORT}/shop/`,apiURL:`http://127.0.0.1:${PORT}/api/training`});send(res,201,{id,status:run.status});return;
    }
    const match=url.pathname.match(/^\/runs\/([a-f0-9]{32})$/);
    if(match){const run=runs.get(match[1]);if(!run||run.owner!==session.owner){send(res,404,{error:'Run not found'});return;}if(req.method==='DELETE'){if(run.status==='running')stop(run);send(res,200,{id:run.id,status:run.status});return;}if(req.method==='GET'){send(res,200,publicRun(run));return;}}
    send(res,404,{error:'Not found'});
  }catch(error){if(!res.headersSent)send(res,error.code==='ENOENT'?404:400,{error:error.code==='ENOENT'?'Not found':error.message.slice(0,250)});}
});
server.requestTimeout=15000;server.headersTimeout=10000;
setInterval(()=>{for(const[token,s]of sessions)if(s.expires<Date.now())sessions.delete(token);for(const[id,r]of runs)if(r.status!=='running'&&Date.now()-(r.finished||r.started)>600000)runs.delete(id);for(const[key,a]of attempts)if(a.until<Date.now())attempts.delete(key);},60000).unref();
server.listen(PORT,HOST,()=>console.log(`QA runner listening on ${HOST}:${PORT}`));
function shutdown(){for(const r of runs.values())if(r.status==='running')stop(r);server.close(()=>process.exit(0));}
process.on('SIGTERM',shutdown);if(process.send)process.on('disconnect',shutdown);
