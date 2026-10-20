(function(){
  'use strict';
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const nodes=document.querySelectorAll('[data-reveal]');
  if('IntersectionObserver'in window&&nodes.length){document.body.classList.add('portal-animated');const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('revealed');observer.unobserve(entry.target);}}),{threshold:.08});nodes.forEach(n=>observer.observe(n));}
  if(document.body.dataset.page!=='labs'){const progress=document.createElement('div');progress.className='portal-progress';document.body.appendChild(progress);let queued=false;const update=()=>{const max=document.documentElement.scrollHeight-innerHeight;progress.style.width=(max>0?scrollY/max*100:0)+'%';queued=false;};addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(update);}},{passive:true});update();}
})();
