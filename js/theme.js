/* Runs in the head so the saved palette is applied before the page is painted. */
(function () {
  'use strict';
  const KEY = 'qc_appearance';
  const presets = {
    light: { bg:'#f5f5fa', surface:'#ffffff', text:'#29263b', accent:'#6950ad' },
    dark: { bg:'#141b26', surface:'#1e2938', text:'#e3e9f2', accent:'#b9a3f2' },
    sand: { bg:'#f4eddf', surface:'#fffaf0', text:'#44382b', accent:'#85603e' },
    sage: { bg:'#eaf0e9', surface:'#f7faf5', text:'#293e35', accent:'#386d58' },
    dusk: { bg:'#292532', surface:'#36313f', text:'#eee6ef', accent:'#d0acd9' },
  };
  const hex = value => typeof value === 'string' && /^#[\da-f]{6}$/i.test(value);
  const rgb = h => h.slice(1).match(/../g).map(c => parseInt(c,16));
  const mix = (a,b,p) => '#' + rgb(a).map((c,i)=>Math.round(c*(1-p)+rgb(b)[i]*p).toString(16).padStart(2,'0')).join('');
  const luminance = h => rgb(h).map(c=>{c/=255;return c<=.04045?c/12.92:((c+.055)/1.055)**2.4;}).reduce((s,c,i)=>s+c*[.2126,.7152,.0722][i],0);
  const contrast = (a,b) => (Math.max(luminance(a),luminance(b))+.05)/(Math.min(luminance(a),luminance(b))+.05);
  const on = h => contrast(h,'#ffffff')>=contrast(h,'#111827')?'#ffffff':'#111827';
  let media;
  try { media = matchMedia('(prefers-color-scheme: dark)'); } catch (_) { media = {matches:false}; }
  let state;
  function normalize(raw) {
    const mode = raw && (raw.mode === 'system' || raw.mode === 'custom' || presets[raw.mode]) ? raw.mode : 'system';
    const custom = {};
    for (const k of ['bg','surface','text','accent']) custom[k] = hex(raw?.custom?.[k]) ? raw.custom[k] : presets.light[k];
    return {mode,custom};
  }
  function read() { try { return normalize(JSON.parse(localStorage.getItem(KEY))); } catch (_) { return normalize(null); } }
  function apply(raw, persist = true) {
    state = normalize(raw);
    const palette = {...(state.mode==='custom'?state.custom:presets[state.mode==='system'?(media.matches?'dark':'light'):state.mode])};
    // Keep custom colours readable without requiring the reader to tune contrast ratios.
    if (Math.min(contrast(palette.text,palette.bg),contrast(palette.text,palette.surface))<4.5) {
      palette.text = ['#111827','#ffffff'].sort((a,b)=>Math.min(contrast(b,palette.bg),contrast(b,palette.surface))-Math.min(contrast(a,palette.bg),contrast(a,palette.surface)))[0];
      if (contrast(palette.text,palette.surface)<4.5) palette.surface=mix(palette.bg,palette.surface,.1);
      if (contrast(palette.text,palette.bg)<4.5) palette.text=on(palette.bg);
      if (contrast(palette.text,palette.surface)<4.5) palette.surface=mix(palette.bg,palette.surface,.1);
    }
    const dark = luminance(palette.bg)<.2;
    const root = document.documentElement;
    root.dataset.theme=state.mode; root.dataset.tone=dark?'dark':'light';
    const vars = {bg:palette.bg,surface:palette.surface,text:palette.text,accent:palette.accent,
      muted:mix(palette.text,palette.surface,.24),line:mix(palette.surface,palette.text,.22),
      soft:mix(palette.surface,palette.accent,.12),onaccent:on(palette.accent),link:contrast(palette.accent,palette.surface)>=4.5?palette.accent:palette.text,
      good:dark?'#a0d9b5':'#245f3e',goodbg:dark?'#233f33':'#edf7ef',bad:dark?'#f3b3b3':'#943d3d',badbg:dark?'#492e36':'#fff0f0'};
    Object.entries(vars).forEach(([k,v])=>root.style.setProperty('--theme-'+k,v));
    root.style.colorScheme=dark?'dark':'light';
    if(persist)try{localStorage.setItem(KEY,JSON.stringify(state));}catch(_){}
    return palette;
  }
  apply(read(),false);
  media.addEventListener?.('change',()=>{if(state.mode==='system')apply(state,false);});
  window.addEventListener('storage',e=>{if(e.key===KEY||e.key===null)apply(read(),false);});
  window.QATheme = {apply,read,contrast,presets};

  function mount() {
    let language='ru';try{language=JSON.parse(localStorage.getItem('qc_lang'))==='kz'?'kz':'ru';}catch(_){}
    const tr=(ru,kz)=>language==='kz'?kz:ru;
    const dialog=document.createElement('dialog');dialog.className='theme-dialog';dialog.id='theme-dialog';dialog.setAttribute('aria-labelledby','theme-title');
    const names={system:tr('Как на устройстве','Құрылғыдағыдай'),light:tr('Светлая','Ашық'),dark:tr('Тёмная','Қараңғы'),sand:tr('Тёплый песок','Жылы құм'),sage:tr('Шалфей','Шалфей'),dusk:tr('Сумерки','Ымырт'),custom:tr('Свои цвета','Өз түстерім')};
    const fields={bg:tr('Фон страницы','Бет фоны'),surface:tr('Карточки и панели','Карточкалар мен панельдер'),text:tr('Основной текст','Негізгі мәтін'),accent:tr('Акцент и кнопки','Акцент пен батырмалар')};
    dialog.innerHTML=`<div class="theme-dialog-head"><div><p class="theme-eyebrow">QA PORTAL</p><h2 id="theme-title">${tr('Комфорт для глаз','Көзге жайлы')}</h2></div><button class="theme-close" type="button" aria-label="${tr('Закрыть настройки темы','Тақырып баптауын жабу')}">×</button></div><p>${tr('Выбери настроение или собери свою палитру. Изменения сохраняются автоматически.','Дайын палитраны таңда немесе өзің жаса. Өзгерістер автоматты сақталады.')}</p><fieldset class="theme-presets"><legend>${tr('Цветовая тема','Түс тақырыбы')}</legend>${Object.entries(names).map(([key,name])=>{const p=presets[key]||presets.light;return `<label class="theme-preset"><input type="radio" name="appearance" value="${key}"><span class="theme-swatch" style="background:${p.bg};border-color:${p.text}"><i style="background:${p.surface}"></i><i style="background:${p.accent}"></i><i style="background:${p.text}"></i></span><span>${name}</span></label>`;}).join('')}</fieldset><details class="theme-custom"><summary>${tr('Настроить цвета вручную','Түстерді қолмен баптау')}</summary><div class="theme-color-grid">${Object.entries(fields).map(([key,name])=>`<div class="theme-color-field"><label for="theme-color-${key}">${name}</label><div><input type="color" id="theme-color-${key}" data-color="${key}"><input type="text" data-hex="${key}" aria-label="${name}: HEX" maxlength="7" pattern="#[0-9a-fA-F]{6}" spellcheck="false"></div></div>`).join('')}</div><p class="theme-helper">${tr('Если цвета текста и фона сливаются, цвет текста автоматически станет контрастнее.','Мәтін мен фон түстері араласып кетсе, мәтін түсі автоматты түрде айқынырақ болады.')}</p></details><div class="theme-dialog-foot"><button type="button" class="theme-reset">${tr('Сбросить к теме устройства','Құрылғы тақырыбына қайту')}</button><button type="button" class="theme-done">${tr('Готово','Дайын')}</button></div>`;
    document.body.append(dialog);
    function sync() {
      dialog.querySelectorAll('[name="appearance"]').forEach(r=>r.checked=r.value===state.mode);
      const p=state.mode==='custom'?state.custom:apply(state,false);
      for(const key in fields){dialog.querySelector(`[data-color="${key}"]`).value=p[key];const input=dialog.querySelector(`[data-hex="${key}"]`);input.value=p[key];input.setCustomValidity('');}
    }
    dialog.querySelectorAll('[name="appearance"]').forEach(r=>r.addEventListener('change',()=>{apply({...state,mode:r.value});sync();}));
    dialog.querySelectorAll('[data-color],[data-hex]').forEach(input=>input.addEventListener('input',()=>{
      const key=input.dataset.color||input.dataset.hex,value=input.value;
      if(!hex(value)){input.setCustomValidity(tr('Формат: #AABBCC','Пішімі: #AABBCC'));return;}
      input.setCustomValidity('');
      const base=state.mode==='custom'?state.custom:apply(state,false);
      apply({mode:'custom',custom:{...base,[key]:value}});sync();
    }));
    dialog.querySelector('.theme-reset').addEventListener('click',()=>{apply({mode:'system',custom:presets.light});sync();});
    dialog.querySelectorAll('.theme-close,.theme-done').forEach(b=>b.addEventListener('click',()=>dialog.close()));
    dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
    function attach() {
      if(document.getElementById('theme-trigger'))return;
      const header=document.querySelector('#header .p-head, #portal-header .p-head, #header .head-in');
      if(!header)return;
      const tools=document.createElement('div');tools.className='theme-head-tools';
      const lang=header.querySelector('.lang');if(lang){lang.before(tools);tools.append(lang);}else header.append(tools);
      const button=document.createElement('button');button.type='button';button.id='theme-trigger';button.className='theme-trigger';button.setAttribute('aria-haspopup','dialog');button.setAttribute('aria-controls','theme-dialog');button.title=tr('Цветовая тема и свои цвета','Түс тақырыбы және өз түстерім');
      button.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M12 3a9 9 0 1 0 9 9 7 7 0 0 1-9-9Z"/></svg><span>'+tr('Тема','Тақырып')+'</span>';
      button.setAttribute('aria-label',tr('Тема','Тақырып'));
      button.addEventListener('click',()=>{sync();dialog.showModal();});tools.append(button);
    }
    attach();
    const header=document.querySelector('#header, #portal-header');if(header)new MutationObserver(attach).observe(header,{childList:true,subtree:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();
