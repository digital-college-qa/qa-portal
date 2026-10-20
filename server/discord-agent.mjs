/* Outbound-only bridge: no control port, shell commands or arbitrary jobs. */
import {readFile,open,unlink,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {Classroom} from './classroom-runtime.mjs';
const folder=fileURLToPath(new URL('secrets/',import.meta.url));await mkdir(folder,{recursive:true});
const config=JSON.parse(await readFile(path.join(folder,'discord-agent.json'),'utf8'));
if(!/^https:\/\/[a-z0-9.-]+\.workers\.dev$/.test(config.workerURL)||!/^[a-f0-9]{64}$/.test(config.token))throw Error('Invalid agent configuration');
const lockPath=path.join(folder,'discord-agent.lock');let lock;
try{lock=await open(lockPath,'wx');await lock.writeFile(String(process.pid));}catch(error){if(error.code!=='EEXIST')throw error;const pid=Number(await readFile(lockPath,'utf8'));let active=false;try{process.kill(pid,0);active=true;}catch(_){}if(active){console.log('Агент уже работает. Управление — в Discord → Журнал.');process.exit(0);}await unlink(lockPath);lock=await open(lockPath,'wx');await lock.writeFile(String(process.pid));}
const classroom=new Classroom();let shutting=false,lastContact=Date.now(),observed=0,busy=false,nextAttempt=0;
async function poll(){if(shutting)return;try{
  const response=await fetch(config.workerURL+'/qa-laptop/poll',{method:'POST',headers:{Authorization:'Bearer '+config.token,'Content-Type':'application/json'},body:JSON.stringify({generation:observed,...classroom.status()}),signal:AbortSignal.timeout(12000)});
  if(!response.ok)throw Error('Agent connection: '+response.status);const command=await response.json();lastContact=Date.now();
  observed=command.generation;
  if(command.desired==='stopped'&&classroom.phase!=='stopped')await classroom.stop();
  else if(command.desired==='running'&&!busy&&classroom.phase==='stopped'&&Date.now()>nextAttempt){busy=true;nextAttempt=Date.now()+15000;classroom.start().catch(error=>console.error('Сервер не запущен:',error.message)).finally(()=>{busy=false;});}
}catch(error){if(Date.now()-lastContact>90000&&classroom.phase!=='stopped')await classroom.stop();console.error('Связь с ботом недоступна. Повторяем подключение.');}}
const timer=setInterval(poll,4000);await poll();console.log('Агент подключён. Управление: Discord → Журнал → Сервер QA. Закрытие агента выключит сервер.');
async function shutdown(){if(shutting)return;shutting=true;clearInterval(timer);await classroom.stop();await lock.close();await unlink(lockPath).catch(()=>{});process.exit(0);}
process.on('SIGINT',shutdown);process.on('SIGTERM',shutdown);
