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
  const on = h => contrast(h,'#ffffff')>=contrast(h,'#000000')?'#ffffff':'#000000';
  function readable(candidate, backgrounds, minimum=4.8) {
    if(backgrounds.every(bg=>contrast(candidate,bg)>=minimum))return candidate;
    const end=['#111827','#ffffff'].sort((a,b)=>Math.min(...backgrounds.map(bg=>contrast(b,bg)))-Math.min(...backgrounds.map(bg=>contrast(a,bg))))[0];
    for(let step=1;step<=100;step++){const value=mix(candidate,end,step/100);if(backgrounds.every(bg=>contrast(value,bg)>=minimum))return value;}
    return end;
  }
  function hsl(value) {
    const [r,g,b]=rgb(value).map(v=>v/255),max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min,l=(max+min)/2;
    let h=0;if(d){if(max===r)h=((g-b)/d)%6;else if(max===g)h=(b-r)/d+2;else h=(r-g)/d+4;h/=6;if(h<0)h++;}
    return [h,d?d/(1-Math.abs(2*l-1)):0,l];
  }
  function fromHsl([h,s,l]) {
    const c=(1-Math.abs(2*l-1))*s,x=c*(1-Math.abs((h*6)%2-1)),m=l-c/2;
    const sectors=[[c,x,0],[x,c,0],[0,c,x],[0,x,c],[x,0,c],[c,0,x]];
    return '#'+sectors[Math.min(5,Math.floor(h*6))].map(v=>Math.round((v+m)*255).toString(16).padStart(2,'0')).join('');
  }
  function harmonious(custom) {
    const dark=luminance(custom.bg)<.22;
    const shade=(value,saturation,lo,hi)=>{const [h,s,l]=hsl(value);return fromHsl([h,Math.min(s,saturation),Math.min(hi,Math.max(lo,l))]);};
    return {bg:shade(custom.bg,.3,dark?.055:.92,dark?.18:.98),
      surface:shade(custom.surface,.22,dark?.14:.94,dark?.24:.995),text:custom.text,
      accent:shade(custom.accent,.65,dark?.66:.32,dark?.82:.52)};
  }
  function resolvePalette(raw, systemDark=false) {
    const config=normalize(raw);
    const palette={...(config.mode==='custom'?harmonious(config.custom):presets[config.mode==='system'?(systemDark?'dark':'light'):config.mode])};
    const dark=luminance(palette.bg)<.22;
    const raised=mix(palette.surface,dark?'#ffffff':'#111827',dark?.045:.018);
    const soft=mix(palette.surface,palette.accent,dark?.11:.065);
    const selected=mix(palette.surface,palette.accent,dark?.18:.12);
    const surfaces=[palette.bg,palette.surface,raised,soft,selected];
    palette.text=readable(palette.text,surfaces,5.2);
    const link=readable(palette.accent,surfaces,4.8);
    const goodbg=mix(palette.surface,'#33986b',dark?.14:.065),badbg=mix(palette.surface,'#c44960',dark?.14:.065),warnbg=mix(palette.surface,'#b68522',dark?.14:.065);
    const disabled=mix(palette.surface,palette.text,.055);
    const vars={bg:palette.bg,surface:palette.surface,raised,text:palette.text,accent:palette.accent,soft,selected,
      muted:readable(mix(palette.text,palette.surface,.3),surfaces,4.8),
      line:mix(palette.surface,palette.text,dark?.2:.16),
      'control-line':readable(mix(palette.surface,palette.text,.3),[palette.bg,palette.surface,soft],3.05),
      link,'selected-text':readable(palette.accent,[selected],4.8),
      onaccent:on(palette.accent),'accent-hover':mix(palette.accent,on(palette.accent)==='#ffffff'?'#000000':'#ffffff',.08),
      focus:readable(palette.accent,surfaces,3.1),disabled,'disabled-text':readable(mix(palette.text,disabled,.35),[disabled],4.8),
      goodbg,badbg,warnbg,good:readable(dark?'#a0dfba':'#24623e',[...surfaces,goodbg],4.8),
      bad:readable(dark?'#ffb6c4':'#96364b',[...surfaces,badbg],4.8),
      warning:readable(dark?'#f3d18c':'#785315',[...surfaces,warnbg],4.8),
      'code-bg':palette.surface,shadow:dark?'#00000035':'#18243a12',
      'pattern-opacity':dark?'.08':'.055','glow-strength':dark?'8%':'4%'};
    for(const [key,candidate] of Object.entries({codekey:dark?'#d7c2ff':'#67449b',codenum:dark?'#f5d28f':'#80521a',codestring:dark?'#9cdeca':'#1b6b50'}))vars[key]=readable(candidate,[palette.surface,soft,raised],4.8);
    return {palette,vars,dark,adjusted:config.mode==='custom'&&['bg','surface','text','accent'].some(k=>palette[k].toLowerCase()!==config.custom[k].toLowerCase())};
  }
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
    const {palette,vars,dark}=resolvePalette(state,media.matches);
    const root = document.documentElement;
    root.dataset.theme=state.mode; root.dataset.tone=dark?'dark':'light';
    Object.entries(vars).forEach(([k,v])=>root.style.setProperty('--theme-'+k,v));
    root.style.colorScheme=dark?'dark':'light';
    if(persist)try{localStorage.setItem(KEY,JSON.stringify(state));}catch(_){}
    return palette;
  }
  apply(read(),false);
  media.addEventListener?.('change',()=>{if(state.mode==='system')apply(state,false);});
  window.addEventListener('storage',e=>{if(e.key===KEY||e.key===null)apply(read(),false);});
  window.QATheme = {apply,read,contrast,presets,resolve:resolvePalette};

  function mount() {
    let language='ru';try{language=JSON.parse(localStorage.getItem('qc_lang'))==='kz'?'kz':'ru';}catch(_){}
    const tr=(ru,kz)=>language==='kz'?kz:ru;
    const dialog=document.createElement('dialog');dialog.className='theme-dialog';dialog.id='theme-dialog';dialog.setAttribute('aria-labelledby','theme-title');
    const names={system:tr('Как на устройстве','Құрылғыдағыдай'),light:tr('Светлая','Ашық'),dark:tr('Тёмная','Қараңғы'),sand:tr('Тёплый песок','Жылы құм'),sage:tr('Шалфей','Шалфей'),dusk:tr('Сумерки','Ымырт'),custom:tr('Свои цвета','Өз түстерім')};
    const fields={bg:tr('Фон страницы','Бет фоны'),surface:tr('Карточки и панели','Карточкалар мен панельдер'),text:tr('Основной текст','Негізгі мәтін'),accent:tr('Акцент и кнопки','Акцент пен батырмалар')};
    dialog.innerHTML=`<div class="theme-dialog-head"><div><p class="theme-eyebrow">QA PORTAL</p><h2 id="theme-title">${tr('Комфорт для глаз','Көзге жайлы')}</h2></div><button class="theme-close" type="button" aria-label="${tr('Закрыть настройки темы','Тақырып баптауын жабу')}">×</button></div><p>${tr('Выбери настроение или собери свою палитру. Изменения сохраняются автоматически.','Дайын палитраны таңда немесе өзің жаса. Өзгерістер автоматты сақталады.')}</p><fieldset class="theme-presets"><legend>${tr('Цветовая тема','Түс тақырыбы')}</legend>${Object.entries(names).map(([key,name])=>{const p=presets[key]||presets.light;return `<label class="theme-preset"><input type="radio" name="appearance" value="${key}"><span class="theme-swatch" style="background:${p.bg};border-color:${p.text}"><i style="background:${p.surface}"></i><i style="background:${p.accent}"></i><i style="background:${p.text}"></i></span><span>${name}</span></label>`;}).join('')}</fieldset><details class="theme-custom"><summary>${tr('Настроить цвета вручную','Түстерді қолмен баптау')}</summary><div class="theme-color-grid">${Object.entries(fields).map(([key,name])=>`<div class="theme-color-field"><label for="theme-color-${key}">${name}</label><div><input type="color" id="theme-color-${key}" data-color="${key}"><input type="text" data-hex="${key}" aria-label="${name}: HEX" maxlength="7" pattern="#[0-9a-fA-F]{6}" spellcheck="false"></div></div>`).join('')}</div><p class="theme-helper">${tr('Насыщенность и яркость автоматически смягчаются, а надписи остаются контрастными. Выбранные HEX сохраняются; ниже — результат применения.','Қанықтық пен жарықтық автоматты жұмсартылады, мәтін айқын қалады. Таңдалған HEX сақталады; төменде қолданылған нәтиже.')}</p><div class="theme-preview"><strong>QA Portal · 1 500 ₸ · 50/100</strong><small>${tr("Пример текста, чисел и карточки","Мәтін, сандар және карточка үлгісі")}</small><br><span class="theme-preview-badge">${tr("200 · Успешно","200 · Сәтті")}</span></div></details><div class="theme-dialog-foot"><button type="button" class="theme-reset">${tr('Сбросить к теме устройства','Құрылғы тақырыбына қайту')}</button><button type="button" class="theme-done">${tr('Готово','Дайын')}</button></div>`;
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
