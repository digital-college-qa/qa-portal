import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm,readFile} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {passwordRecord,verifyPassword,updateAccount,loadAccounts} from '../accounts.mjs';
test('passwords are salted and invalid credentials fail',()=>{const p='An-example-password-20',a=passwordRecord(p),b=passwordRecord(p);assert.notEqual(a.hash,b.hash);assert.equal(verifyPassword(p,a),true);assert.equal(verifyPassword('wrong',a),false);assert.equal(verifyPassword(p,{}),false);assert.throws(()=>passwordRecord('short'));});
test('student lifecycle: create, duplicate, reset, disable; file never contains password',async()=>{const dir=await mkdtemp(path.join(os.tmpdir(),'qa-accounts-'));try{const file=path.join(dir,'users.json'),p='An-example-password-20';await updateAccount(file,'student01','add',p);assert.equal((await readFile(file,'utf8')).includes(p),false);await assert.rejects(()=>updateAccount(file,'student01','add',p));await updateAccount(file,'student01','reset',p+'new');assert.equal(verifyPassword(p+'new',(await loadAccounts(file)).users[0]),true);await updateAccount(file,'student01','disable');assert.equal((await loadAccounts(file)).users[0].disabled,true);await assert.rejects(()=>updateAccount(file,'../bad','add',p));}finally{await rm(dir,{recursive:true,force:true});}});
