import assert from 'node:assert/strict';
import {Classroom} from '../classroom-runtime.mjs';
const classroom=new Classroom({maxMs:120000});
try{
 const state=await classroom.start({localOnly:true});assert.equal(state.phase,'running');assert.ok(state.password.length>=16);
 const denied=await fetch(state.url+'/runs',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});assert.equal(denied.status,401);
 const login=await fetch(state.url+'/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:state.username,password:state.password})});assert.equal(login.status,200);
 const url=state.url;await classroom.stop();assert.equal(classroom.status().phase,'stopped');await assert.rejects(()=>fetch(url+'/health',{signal:AbortSignal.timeout(1000)}));
 console.log('PASS: laptop start, authenticated login, stop closes endpoint');
}finally{await classroom.stop();}
