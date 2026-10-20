/* Same controlled service responses in Service Worker and server Chromium. */
(function(root){
  async function respond(path,body={},mode='normal'){
    if(!['search','product','order'].includes(path))return{status:404,body:{error:{code:'NOT_FOUND'}}};
    if(mode==='delay')await new Promise(r=>setTimeout(r,path==='search'?(body.q==='чай'?1800:250):1100));
    let data=path==='product'?{product:body.product}:path==='search'?{q:body.q||'',items:(Array.isArray(body.catalog)?body.catalog:[]).filter(p=>Object.values(p.name||{}).some(n=>String(n).toLowerCase().includes(String(body.q||'').trim().toLowerCase())))}:{accepted:true,reservation:mode!=='reserve'};
    if(path==='product'&&data.product){if(mode==='missing')delete data.product.nutrition;if(mode==='string')data.product.price=String(data.product.price);}
    const status=path==='order'&&mode==='server500'?500:200;
    if(status===500)data={error:{code:'ORDER_SERVICE_UNAVAILABLE',message:'Training order service unavailable'}};
    return{status,body:data};
  }
  root.QAScenarios={respond};if(typeof module!=='undefined')module.exports=root.QAScenarios;
})(typeof self==='undefined'?globalThis:self);
