/* IPC closes if the laptop agent exits, including a closed Windows console. */
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const executable=fileURLToPath(new URL('tools/cloudflared.exe',import.meta.url));
const child=spawn(executable,process.argv.slice(2),{windowsHide:true,stdio:['ignore','pipe','pipe']});
let stopping=false;
function stop(){if(stopping)return;stopping=true;child.kill();setTimeout(()=>process.exit(0),500).unref();}
child.stdout.on('data',b=>{if(!stopping)process.stdout.write(b);});child.stderr.on('data',b=>{if(!stopping)process.stderr.write(b);});
process.stdout.on('error',stop);process.stderr.on('error',stop);
child.on('error',error=>{console.error(error.message);process.exitCode=1;stop();});child.on('exit',code=>process.exit(code||0));
process.on('disconnect',stop);process.on('SIGINT',stop);process.on('SIGTERM',stop);
