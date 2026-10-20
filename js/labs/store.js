/* Shared teaching API state. Browser storage is the database of the local
   training mode. A real HTTP-shaped request is handled through api-worker.js. */
(function (root) {
  'use strict';
  const copy = value => JSON.parse(JSON.stringify(value));
  function createStore({ read, write, seed, onChange = () => {} }) {
    const products = () => seed.map(p => ({ ...copy(p), ...read('qc_product_overrides', {})[p.id] }));
    const lineId = item => `${item.id}-${item.size}-${item.syrup ? 1 : 0}`+(item.syrupType?'-'+item.syrupType:'')+(item.milk==='oat'?'-oat':'')+(item.combo?'-combo':'');
    const price = (p, item) => p.price + (p.id>14?0:({S:-200,M:0,L:300}[item.size] || 0)) + (item.syrup ? 200 : 0)+(item.milk==='oat'&&read('qc_version','2.0')!=='1.5'?300:0)+(item.combo?1500:0);
    function cartBody() {
      const catalog = products();
      const items = read('qc_cart', []).map(item => {
        const p = catalog.find(p => p.id === item.id);
        return { id:lineId(item), productId:item.id, name:p?.name, size:item.size, syrup:Boolean(item.syrup), ...(item.syrupType?{syrupType:item.syrupType}:{}), ...(item.milk?{milk:item.milk}:{}), ...(item.combo?{combo:true}:{}), quantity:item.qty, unitPrice:p ? price(p,item) : 0 };
      });
      return { items, quantity:items.reduce((n,i)=>n+i.quantity,0), subtotal:items.reduce((n,i)=>n+i.unitPrice*i.quantity,0) };
    }
    function commit(key,value,detail) { write(key,value);onChange({key,...detail}); }
    function handle({ method='GET', path='/', body, requestId='local' }) {
      const headers = { 'Content-Type':'application/json; charset=utf-8', 'X-Request-Id':requestId, 'Cache-Control':'no-store' };
      const reply = (status,body) => ({status,headers,body});
      const fail = (status,code,message) => reply(status,{error:{code,message},requestId});
      let data = {};
      try { if (body) data=typeof body==='string'?JSON.parse(body):body; } catch (_) { return fail(400,'INVALID_JSON','Body must be valid JSON'); }
      if (!data || typeof data!=='object' || Array.isArray(data)) return fail(400,'INVALID_BODY','Body must be a JSON object');
      const url = new URL(path,'https://training.invalid');
      const parts = url.pathname.split('/').filter(Boolean);
      if (parts[0]==='products') {
        const list=products(), id=Number(parts[1]), p=list.find(p=>p.id===id);
        if (method==='GET' && parts.length===1) {
          const q=(url.searchParams.get('q')||'').toLowerCase(), category=url.searchParams.get('category');
          return reply(200,{items:list.filter(p=>(!q||Object.values(p.name).some(n=>n.toLowerCase().includes(q)))&&(!category||(p.category||'coffee')===category))});
        }
        if (parts.length!==2) return fail(404,'NOT_FOUND','Unknown resource');
        if (!p) return fail(404,'PRODUCT_NOT_FOUND','Product not found');
        if (method==='GET') return reply(200,p);
        if (method==='PATCH') {
          const keys=Object.keys(data);
          if (!keys.length||keys.some(k=>!['price','inStock'].includes(k))) return fail(400,'INVALID_FIELD','Editable fields: price, inStock');
          if ('price' in data && (!Number.isInteger(data.price)||data.price<0||data.price>100000)) return fail(400,'INVALID_PRICE','price must be an integer from 0 to 100000');
          if ('inStock' in data && typeof data.inStock!=='boolean') return fail(400,'INVALID_STOCK','inStock must be boolean');
          const overrides=read('qc_product_overrides',{});
          overrides[id]={...overrides[id],...data};commit('qc_product_overrides',overrides,{event:'product.updated',entityId:id,changes:data});
          return reply(200,products().find(p=>p.id===id));
        }
        return fail(405,'METHOD_NOT_ALLOWED','Use GET or PATCH');
      }
      if (parts[0]==='cart') {
        if (parts.length===1 && method==='GET') return reply(200,cartBody());
        if (parts.length===1 && method==='DELETE') {commit('qc_cart',[],{event:'cart.cleared'});return reply(204,null);}
        if (parts[1]!=='items') return fail(404,'NOT_FOUND','Unknown cart resource');
        const cart=read('qc_cart',[]);
        if (parts.length===2 && method==='POST') {
          const p=products().find(p=>p.id===data.productId);
          if(!p)return fail(404,'PRODUCT_NOT_FOUND','Product not found');
          if(!p.inStock)return fail(409,'OUT_OF_STOCK','Product is not available');
          if(!Number.isInteger(data.quantity)||data.quantity<1||data.quantity>10)return fail(400,'INVALID_QUANTITY','quantity must be an integer from 1 to 10');
          const size=data.size||'M';if(!['S','M','L'].includes(size))return fail(400,'INVALID_SIZE','Use S, M or L');
          if('syrup'in data&&typeof data.syrup!=='boolean')return fail(400,'INVALID_SYRUP','syrup must be boolean');
          const item={id:p.id,size,syrup:Boolean(data.syrup),qty:data.quantity},existing=cart.find(i=>lineId(i)===lineId(item));
          if(existing&&existing.qty+item.qty>10)return fail(400,'QUANTITY_LIMIT','The resulting quantity cannot exceed 10');
          if(existing)existing.qty+=item.qty;else cart.push(item);
          commit('qc_cart',cart,{event:'cart.item.added',entityId:p.id});return reply(201,cartBody());
        }
        if(parts.length===3){
          const index=cart.findIndex(i=>lineId(i)===decodeURIComponent(parts[2]));
          if(index<0)return fail(404,'ITEM_NOT_FOUND','Cart line not found');
          if(method==='DELETE'){cart.splice(index,1);commit('qc_cart',cart,{event:'cart.item.deleted'});return reply(204,null);}
          if(method==='PATCH'){
            if(Object.keys(data).some(k=>k!=='quantity')||!Number.isInteger(data.quantity)||data.quantity<1||data.quantity>10)return fail(400,'INVALID_QUANTITY','Provide only quantity, an integer from 1 to 10');
            cart[index].qty=data.quantity;commit('qc_cart',cart,{event:'cart.item.updated'});return reply(200,cartBody());
          }
        }
        return fail(405,'METHOD_NOT_ALLOWED','Use the method specified by the contract');
      }
      if(parts[0]==='orders'&&parts.length===1&&method==='GET')return reply(200,{items:read('qc_orders',[])});
      if(parts.join('/')==='session/reset'&&method==='POST'){
        commit('qc_product_overrides',{}, {event:'products.reset'});commit('qc_cart',[],{event:'cart.cleared'});return reply(200,{reset:true});
      }
      return fail(404,'NOT_FOUND','Unknown API endpoint');
    }
    return { handle, products, cartBody };
  }
  root.QAStore={createStore};
  if(typeof module!=='undefined')module.exports=root.QAStore;
})(typeof window==='undefined'?globalThis:window);
