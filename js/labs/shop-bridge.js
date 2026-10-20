(function(){
  'use strict';
  function apply(){
    try{const overrides=QAVersions.read('qc_product_overrides',{});PRODUCTS.forEach(p=>{if(!p._originalPrice)p._originalPrice=p.price;if(!('_originalStock'in p))p._originalStock=p.inStock;p.price=p._originalPrice;p.inStock=p._originalStock;Object.assign(p,overrides[p.id]||{});});}catch(_){}
  }
  window.QAApplyOverrides=apply;
  apply();
  window.addEventListener('storage',e=>{if(['qc_product_overrides','qc_cart','qc_orders'].map(QAVersions.keyFor).includes(e.key)){apply();window.QAShop?.refresh();}});
  window.addEventListener('message',e=>{
    if(e.origin!==location.origin||e.source!==window.parent||e.data?.type!=='qa-refresh')return;
    apply();window.QAShop?.refresh();
  });
  try{if(new URLSearchParams(location.search).has('embedded')||(window.parent!==window&&window.parent.location.pathname.endsWith('/labs.html')))document.body.classList.add('shop-embedded');}catch(_){}
})();
