/* Only teaching API calls are intercepted. Assets and normal navigation are
   never cached or rewritten. State stays with the requesting browser client. */
importScripts('js/labs/scenario-model.js?v=22');
self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url),prefix=new URL('training-api/',self.registration.scope).pathname;
  const scenarioPrefix=new URL('scenario-api/',self.registration.scope).pathname;
  if(url.origin===self.location.origin&&url.pathname.startsWith(scenarioPrefix)){
    event.respondWith((async()=>{
      const body=await event.request.json().catch(()=>({})),mode=url.searchParams.get('mode'),path=url.pathname.slice(scenarioPrefix.length);
      const traceId=event.request.headers.get('X-Trace-Id')||crypto.randomUUID();
      const result=await QAScenarios.respond(path,body,mode);
      return Response.json(result.body,{status:result.status,headers:{'Cache-Control':'no-store','X-Trace-Id':traceId,'X-Training-Simulation':'true'}});
    })());return;
  }
  if(url.origin!==self.location.origin||!url.pathname.startsWith(prefix))return;
  event.respondWith((async()=>{
    const client=await self.clients.get(event.clientId);
    if(!client)return Response.json({error:{code:'NO_CLIENT',message:'Open the QA workspace'}},{status:503});
    const payload={method:event.request.method,path:'/'+url.pathname.slice(prefix.length)+url.search,body:['GET','HEAD'].includes(event.request.method)?undefined:await event.request.text()};
    return new Promise(resolve=>{
      const channel=new MessageChannel();
      const timeout=setTimeout(()=>{channel.port1.close();resolve(Response.json({error:{code:'TIMEOUT',message:'Teaching client did not respond'}},{status:504}));},10000);
      channel.port1.onmessage=({data})=>{clearTimeout(timeout);channel.port1.close();resolve(new Response(data.status===204?null:JSON.stringify(data.body),{status:data.status,headers:data.headers}));};
      client.postMessage({type:'qa-api-request',payload},[channel.port2]);
    });
  })());
});
