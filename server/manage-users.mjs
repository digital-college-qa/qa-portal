import {randomBytes} from 'node:crypto';
import {updateAccount,loadAccounts} from './accounts.mjs';
import {writeFile} from 'node:fs/promises';
const [action,username]=process.argv.slice(2),file=process.env.LAB_USERS_FILE||'/accounts/users.json';
try{
  if(action==='init'){await writeFile(file,JSON.stringify({schema:1,users:[]})+'\n',{flag:'wx',mode:0o600});console.log('Empty accounts file created. Add a student before starting the runner.');}
  else if(action==='list')console.log((await loadAccounts(file)).users.map(u=>`${u.username}\t${u.disabled?'disabled':'active'}`).join('\n'));
  else{
    let password;
    if(action!=='disable'){
      if(process.argv.includes('--password-stdin')){let value='';for await(const chunk of process.stdin){value+=chunk;if(value.length>256)throw Error('Password input is too long');}password=value.trim();}
      else password=randomBytes(18).toString('base64url');
    }
    await updateAccount(file,username,action,password);
    console.log(`${action}: ${username}`);
    if(password&&!process.argv.includes('--password-stdin'))console.log(`Temporary password (give privately to this student): ${password}`);
  }
}catch(error){console.error(error.message);process.exitCode=1;}
