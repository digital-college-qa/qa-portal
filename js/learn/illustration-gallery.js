/* Accessible, manual image examples. Slide changes never rerender the lesson or its draft. */
(function () {
  'use strict';
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const labels = lang => lang === 'kz' ? {
    heading:'Суреттермен түсіндіру',prev:'Алдыңғы сурет',next:'Келесі сурет',
    enlarge:'Суретті үлкейту',close:'Жабу',failed:'Сурет жүктелмеді. Оны үлкейтіп ашып көр.',
    scroll:'Үлкен суретті көлденең және тігінен айналдыруға болады.'
  } : {
    heading:'Объяснение в картинках',prev:'Предыдущая иллюстрация',next:'Следующая иллюстрация',
    enlarge:'Открыть изображение крупнее',close:'Закрыть',failed:'Изображение не загрузилось. Попробуй открыть его крупнее.',
    scroll:'Большое изображение можно прокручивать по горизонтали и вертикали.'
  };
  const slides = (route,lang) => window.LEARN_ILLUSTRATIONS?.[route]?.[lang] || [];

  function render(route,lang) {
    const rows=slides(route,lang);
    if(!rows.length)return '';
    const t=labels(lang),row=rows[0];
    return `<section class="ln-visuals" data-lesson-visuals aria-label="${t.heading}" tabindex="0">
      <div class="ln-visual-bar"><strong>${t.heading}</strong><div class="ln-visual-controls"><span data-visual-count>1 / ${rows.length}</span><button type="button" data-visual-prev aria-label="${t.prev}">←</button><button type="button" data-visual-next aria-label="${t.next}">→</button></div></div>
      <figure class="ln-visual-figure"><button type="button" class="ln-visual-open" data-visual-open aria-label="${t.enlarge}"><picture><source data-visual-mobile media="(max-width: 640px)" srcset="${esc(row.mobile||row.src)}"><img data-visual-img src="${esc(row.src)}" alt="${esc(row.alt)}" decoding="async" loading="lazy"></picture></button>
      <p data-visual-error hidden>${t.failed}</p><figcaption aria-live="polite" aria-atomic="true"><h3 class="ln-visual-title" data-visual-title>${esc(row.title)}</h3><p data-visual-caption>${esc(row.caption)}</p></figcaption></figure>
      <button type="button" class="ln-visual-enlarge" data-visual-zoom>${t.enlarge} ↗</button>
      <dialog class="ln-visual-dialog" data-visual-dialog aria-labelledby="visual-dialog-title"><div class="ln-visual-dialog-head"><h2 id="visual-dialog-title" data-visual-dialog-title>${esc(row.title)}</h2><button type="button" data-visual-close>${t.close} ×</button></div><p class="ln-visual-scroll-note">${t.scroll}</p><div class="ln-visual-canvas" tabindex="0"><img data-visual-large alt=""></div></dialog>
    </section>`;
  }

  function bind(root,route,lang) {
    const rows=slides(route,lang),gallery=root.querySelector('[data-lesson-visuals]');
    if(!gallery||!rows.length)return;
    const q=selector=>gallery.querySelector(selector),image=q('[data-visual-img]'),dialog=q('[data-visual-dialog]');
    let index=0;
    function paint() {
      const row=rows[index];
      q('[data-visual-count]').textContent=`${index+1} / ${rows.length}`;
      q('[data-visual-title]').textContent=row.title;
      q('[data-visual-caption]').textContent=row.caption;
      q('[data-visual-error]').hidden=true;
      image.alt=row.alt;
      q('[data-visual-mobile]').srcset=row.mobile||row.src;
      image.src=row.src;
      if(dialog.open)paintLarge();
    }
    function paintLarge() {
      const row=rows[index],large=q('[data-visual-large]');
      q('[data-visual-dialog-title]').textContent=row.title;
      large.alt=row.alt;large.src=row.src;
    }
    const step=direction=>{index=(index+direction+rows.length)%rows.length;paint();};
    q('[data-visual-prev]').addEventListener('click',()=>step(-1));
    q('[data-visual-next]').addEventListener('click',()=>step(1));
    gallery.addEventListener('keydown',event=>{
      if(event.key==='ArrowLeft'||event.key==='ArrowRight'){
        event.preventDefault();step(event.key==='ArrowLeft'?-1:1);
      }
    });
    const open=()=>{paintLarge();dialog.showModal();};
    q('[data-visual-open]').addEventListener('click',open);
    q('[data-visual-zoom]').addEventListener('click',open);
    q('[data-visual-close]').addEventListener('click',()=>dialog.close());
    dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
    image.addEventListener('error',()=>{q('[data-visual-error]').hidden=false;});
  }
  window.LEARN_GALLERY={render,bind};
})();
