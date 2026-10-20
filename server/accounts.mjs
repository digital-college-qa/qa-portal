import {randomBytes,scryptSync,timingSafeEqual} from 'node:crypto';
import {readFile,writeFile,rename,mkdir} from 'node:fs/promises';
import path from 'node:path';
export function passwordRecord(password){
  if(typeof password!=='string'||password.length<16||password.length>128)throw Error('Password must contain 16–128 characters');
  const salt=randomBytes(16).toString('hex');return{salt,hash:scryptSync(password,salt,32).toString('hex')};
}
export function verifyPassword(password,record){
  if(typeof password!=='string'||password.length>256||!record||!/^[a-f0-9]{32}$/.test(record.salt)||!/^[a-f0-9]{64}$/.test(record.hash))return false;
  return timingSafeEqual(scryptSync(password,record.salt,32),Buffer.from(record.hash,'hex'));
}
export async function loadAccounts(file){
  const data=JSON.parse(await readFile(file,'utf8'));
  if(data.schema!==1||!Array.isArray(data.users)||data.users.length>1000)throw Error('Invalid accounts file');
  return data;
}
export async function updateAccount(file,username,action,password){
  if(!/^[a-zA-Z0-9][a-zA-Z0-9_.-]{2,39}$/.test(username))throw Error('Username: 3–40 letters, digits, dot, underscore or hyphen');
  let data;try{data=await loadAccounts(file);}catch(error){if(error.code!=='ENOENT')throw error;data={schema:1,users:[]};}
  const existing=data.users.find(u=>u.username===username);
  if(action==='disable'){if(!existing)throw Error('Unknown username');existing.disabled=true;}
  else if(action==='add'){
    if(existing)throw Error('Username already exists; use reset to change the password');
    data.users.push({username,...passwordRecord(password),disabled:false,createdAt:new Date().toISOString()});
  }else if(action==='reset'){
    if(!existing)throw Error('Unknown username');Object.assign(existing,passwordRecord(password),{disabled:false});
  }else throw Error('Action: add, reset or disable');
  await mkdir(path.dirname(file),{recursive:true});
  const temporary=file+'.'+randomBytes(6).toString('hex')+'.tmp';
  await writeFile(temporary,JSON.stringify(data,null,2)+'\n',{mode:0o600});await rename(temporary,file);
}
