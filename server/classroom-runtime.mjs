import {spawn} from 'node:child_process';
import {randomBytes} from 'node:crypto';
import {readFile,writeFile,mkdir,access,readdir} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import net from 'node:net';
import path from 'node:path';
import {passwordRecord} from './accounts.mjs';
const HERE=fileURLToPath(new URL('.',import.meta.url));
const delay=ms=>new Promise(r=>setTimeout(r,ms));
async function freePort(){const s=net.createServer();await new Promise((r,j)=>s.once('error',j).listen(0,'127.0.0.1',r));const p=s.address().port;await new Promise(r=>s.close(r));return p;}
export async function browserPath(){
  const {chromium}=await import('@playwright/test');if(existsSync(chromium.executablePath()))return chromium.executablePath();
  if(process.env.QA_BROWSER_PATH&&existsSync(process.env.QA_BROWSER_PATH))return process.env.QA_BROWSER_PATH;
  const base=path.join(process.env.LOCALAPPDATA||'', 'ms-playwright');
  for(const name of (await readdir(base).catch(()=>[])).filter(x=>x.startsWith('chromium_headless_shell-')).sort().reverse()){
    const candidate=path.join(base,name,'chrome-headless-shell-win64','chrome-headless-shell.exe');if(existsSync(candidate))return candidate;
  }
  throw Error('Chromium не найден. Выполни npm exec -- playwright install chromium --only-shell в папке server.');
}
export class Classroom{
  constructor({cloudflared=path.join(HERE,'tools','cloudflared.exe'),maxMs=4*3600000}={}){this.cloudflared=cloudflared;this.maxMs=maxMs;this.children=new Set();this.generation=0;this.phase='stopped';}
  status(){return{phase:this.phase,url:this.url||'',username:this.username||'',password:this.phase==='running'?this.password||'':'',startedAt:this.startedAt||null,expiresAt:this.expiresAt||null,error:this.error||''};}
  async stop(){this.generation++;this.phase='stopping';clearTimeout(this.deadline);const children=[...this.children];await Promise.all(children.map(child=>new Promise(resolve=>{if(!child.pid||child.exitCode!==null){resolve();return;}if(process.platform==='win32'){const killer=spawn('taskkill',['/PID',String(child.pid),'/T','/F'],{windowsHide:true,stdio:'ignore'});killer.once('error',()=>{child.kill();resolve();});killer.once('exit',resolve);}else{try{process.kill(-child.pid,'SIGTERM');}catch(_){child.kill();}child.once('exit',resolve);setTimeout(resolve,2500).unref();}})));this.children.clear();this.phase='stopped';this.url='';this.password='';this.startedAt=null;this.expiresAt=null;}
  launch(args,env={}){const child=spawn(args[0],args.slice(1),{cwd:HERE,env:{...process.env,...env},windowsHide:true,detached:process.platform!=='win32',stdio:['ignore','pipe','pipe','ipc']});this.children.add(child);child.on('error',error=>{this.error=error.message;});child.on('exit',()=>{this.children.delete(child);if(this.phase==='running'){this.error='Один из процессов остановился';this.stop();}});return child;}
  async start({localOnly=false}={}){
    if(['starting','running'].includes(this.phase))return this.status();await this.stop();const generation=++this.generation;this.phase='starting';this.error='';
    try{
      const executable=await browserPath();if(!localOnly)await access(this.cloudflared);
      const folder=path.join(HERE,'secrets');await mkdir(folder,{recursive:true});this.username='qa-class';this.password=randomBytes(18).toString('base64url');
      const file=path.join(folder,'laptop-users.json');await writeFile(file,JSON.stringify({schema:1,users:[{username:this.username,...passwordRecord(this.password),disabled:false}]}),{mode:0o600});
      const port=await freePort();this.localURL=`http://127.0.0.1:${port}`;
      if(generation!==this.generation)return this.status();
      const runner=this.launch([process.execPath,'index.mjs'],{HOST:'127.0.0.1',PORT:String(port),LAB_USERS_FILE:file,LAB_PASSWORD:'',LAB_PASSWORD_FILE:'',LAB_SHARED_CLASS_LOGIN:'1',QA_BROWSER_PATH:executable,ALLOWED_ORIGINS:'https://digital-college-qa.github.io,http://127.0.0.1:8765',TRUST_PROXY:'0'});
      let output='';runner.stderr.on('data',b=>output=(output+b).slice(-4000));runner.stdout.on('data',()=>{});
      let healthy=false;for(let i=0;i<60;i++){if(generation!==this.generation)return this.status();if(runner.exitCode!==null)throw Error('Runner не запустился: '+output.slice(-250));try{const r=await fetch(this.localURL+'/health',{signal:AbortSignal.timeout(1000)});if(r.ok){healthy=true;break;}}catch(_){}await delay(200);}if(!healthy)throw Error('Runner не отвечает');
      if(localOnly)this.url=this.localURL;
      else{
        const tunnel=this.launch([process.execPath,'tunnel-guard.mjs','tunnel','--url',this.localURL,'--no-autoupdate','--protocol','http2']);let buffer='';this.tunnelDiagnostics='';
        this.url=await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Не удалось получить ссылку Cloudflare за 60 секунд')),60000);const output=chunk=>{buffer=(buffer+chunk.toString()).slice(-10000);this.tunnelDiagnostics=buffer;const match=buffer.match(/https:\/\/[a-z0-9]+(?:-[a-z0-9]+){2,}\.trycloudflare\.com/);if(match){clearTimeout(timer);resolve(match[0]);}};tunnel.stdout.on('data',output);tunnel.stderr.on('data',output);tunnel.once('error',e=>{clearTimeout(timer);reject(e);});tunnel.once('exit',()=>{clearTimeout(timer);reject(Error('Туннель остановился до подключения'));});});
      }
      if(!localOnly){
        let reachable=false;const until=Date.now()+90000;
        while(Date.now()<until){if(generation!==this.generation)return this.status();try{const response=await fetch(this.url+'/health',{signal:AbortSignal.timeout(2500)});if(response.ok&&(await response.json()).service==='qa-playwright-runner'){reachable=true;break;}}catch(_){}await delay(1500);}
        if(!reachable)throw Error('Временная ссылка ещё не доступна через DNS. Повтори запуск через минуту.');
      }
      if(generation!==this.generation)return this.status();
      this.phase='running';this.startedAt=Date.now();this.expiresAt=this.startedAt+this.maxMs;this.deadline=setTimeout(()=>this.stop(),this.maxMs);this.deadline.unref();return this.status();
    }catch(error){if(generation!==this.generation)return this.status();const message=error.message;await this.stop();this.error=message;throw error;}
  }
}
