(function () {
  "use strict";

  function load(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  }
  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* storage unavailable */ }
  }
  const lang = () => (load("qc_lang", "ru") === "kz" ? "kz" : "ru");
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const UI = {
    ru: {
      title: "База знаний", search: "Поиск: чек-лист, bug, қате…", found: "Найдено", ctrlf: "<b>Ctrl+F</b> — найти слово на открытой странице. Поиск выше — найти тему по всей базе.",
      topics: "☰ Все темы", blocks: { toolkit: "Инструменты QA", tools: "Шпаргалки", k1: "Основы · 1 курс", k2: "2 курс", practice: "API и автотесты", extra: "Дополнительно" },
      steps: "Сделай пошагово", sources: "Официальные инструкции",
      short: "Коротко", when: "Когда и зачем", analogy: "Пример из жизни", body: "Подробнее", template: "Шаблон",
      example: "Пример на qala coffe", mistakes: "Частые ошибки", remember: "Запомни", check: "Проверь себя",
      check_hint: "Сначала ответь сам, потом нажми на вопрос.", terms: "Слова для поиска", open_shop: "Открыть в магазине →",
      copy: "Скопировать", copied: "Скопировано", read: "Я прочитал(а)", unread: "Прочитано ✓ (нажми, чтобы снять)",
      prev: "← Назад", next: "Дальше →", pairs: { k1: "1 курс, пара", k2: "2 курс, пара" }, nothing: "Ничего не найдено. Попробуй другое слово или английский термин.",
      gl_title: "Глоссарий", gl_note: "Термины по порядку пар: сверху то, что проходим раньше. Английский — русский — казахский. Нажми на тему, чтобы прочитать подробно.",
      gl_head: ["English", "Русский", "Қазақша", "Тема"], gl_other: "Другие темы курса", soon: "Тема появится позже.",
      welcome_title: "База знаний по тестированию", welcome: "Слева — все темы курса по порядку пар: сверху то, что проходим раньше, снизу — позже. Нажми на тему, чтобы открыть. Не помнишь, где тема? Напиши слово в поиске — на русском, казахском или английском."
    },
    kz: {
      title: "Білім қоры", search: "Іздеу: чек-лист, bug, қате…", found: "Табылды", ctrlf: "<b>Ctrl+F</b> — ашық беттен сөз табу. Жоғарыдағы іздеу — бүкіл қордан тақырып табу.",
      topics: "☰ Барлық тақырып", blocks: { toolkit: "QA құралдары", tools: "Анықтамалар", k1: "Негіздер · 1 курс", k2: "2 курс", practice: "API және автотесттер", extra: "Қосымша" },
      steps: "Қадаммен орында", sources: "Ресми нұсқаулықтар",
      short: "Қысқаша", when: "Қашан және не үшін", analogy: "Өмірден мысал", body: "Толығырақ", template: "Үлгі",
      example: "qala coffe мысалы", mistakes: "Жиі кездесетін қателер", remember: "Есте сақта", check: "Өзіңді тексер",
      check_hint: "Алдымен өзің жауап бер, содан кейін сұрақты бас.", terms: "Іздеуге арналған сөздер", open_shop: "Дүкеннен ашу →",
      copy: "Көшіру", copied: "Көшірілді", read: "Оқыдым", unread: "Оқылды ✓ (алып тастау үшін бас)",
      prev: "← Артқа", next: "Әрі қарай →", pairs: { k1: "1 курс, сабақ", k2: "2 курс, сабақ" }, nothing: "Ештеңе табылмады. Басқа сөзді немесе ағылшын терминін жазып көр.",
      gl_title: "Глоссарий", gl_note: "Терминдер сабақтар ретімен: жоғарыда ертерек өтетініміз. Ағылшынша — орысша — қазақша. Толық оқу үшін тақырыпты бас.",
      gl_head: ["English", "Орысша", "Қазақша", "Тақырып"], gl_other: "Курстың басқа тақырыптары", soon: "Тақырып кейін қосылады.",
      welcome_title: "Тестілеу бойынша білім қоры", welcome: "Сол жақта — курстың барлық тақырыбы сабақтар ретімен: жоғарыда ертерек өтетініміз, төменде — кейінірек. Ашу үшін тақырыпты бас. Тақырып қайда екенін ұмыттың ба? Іздеуге сөз жаз — орысша, қазақша немесе ағылшынша."
    }
  };
  const u = k => UI[lang()][k];

  const tr = (ru, kz) => lang() === 'kz' ? kz : ru;
  const ORDER = ["toolkit", "tools", "k1", "k2", "practice", "extra"];
  const topics = (window.KB || []).slice().sort((a, b) =>
    ORDER.indexOf(a.block) - ORDER.indexOf(b.block) || (a.n == null ? -1 : a.n) - (b.n == null ? -1 : b.n));
  const byId = id => topics.find(x => x.id === id);
  const readSet = () => new Set(load("qc_kb_read", []));
  const toolIds = ['tool-elements', 'tool-network', 'tool-console', 'tool-storage', 'tool-responsive', 'tool-evidence', 'api-client', 'playwright-basics', 'tool-logs', 'tool-bugtracker'];
  const paths = {
    inspect: '<path d="M4 4h16v16H4zM9 2v20M2 9h20m-7 4 6 3-4 1-1 4z"/>',
    network: '<circle cx="5" cy="12" r="3"/><circle cx="19" cy="5" r="3"/><circle cx="19" cy="19" r="3"/><path d="m8 11 8-5M8 13l8 5"/>',
    console: '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="m7 9 3 3-3 3m6 1h4"/>',
    storage: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 4 16 4 16 0V5M4 12c0 4 16 4 16 0"/>',
    device: '<rect x="7" y="2" width="11" height="20" rx="2"/><path d="M11 18h3M3 6v12"/>',
    camera: '<path d="M3 7h5l2-3h4l2 3h5v14H3z"/><circle cx="12" cy="13" r="4"/>',
    api: '<path d="m7 5-5 7 5 7m10-14 5 7-5 7m-3-18-4 22"/>',
    tests: '<path d="M9 2h6m-5 0v8L4 21h16l-6-11V2M8 15h8"/>',
    logs: '<path d="M9 5h12M9 12h12M9 19h12M3 5h1m-1 7h1m-1 7h1"/>',
    report: '<path d="M5 3h10l4 4v14H5zm9 0v5h5M8 12h8m-8 4h5"/>',
    book: '<path d="M12 5c-3-2-6-2-10-1v15c4-1 7-1 10 1 3-2 6-2 10-1V4c-4-1-7-1-10 1zm0 0v15"/>',
    search: '<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/>',
    arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>'
  };
  const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.book}</svg>`;
  const topicIcon = tp => tp.icon || (tp.id === 'api-client' ? 'api' : tp.id === 'playwright-basics' ? 'tests' : tp.block === 'practice' ? 'api' : 'book');
  const categories = [
    { id: 'theory', icon: 'book', title: tr('Основы тестирования', 'Тестілеу негіздері'), note: tr('От первого бага до тест-дизайна', 'Алғашқы багтан тест-дизайнға дейін'), match: tp => ['k1', 'k2', 'extra'].includes(tp.block) },
    { id: 'toolkit', icon: 'inspect', title: tr('Инструменты QA', 'QA құралдары'), note: tr('Открой инструмент и попробуй по шагам', 'Құралды ашып, қадаммен орында'), match: tp => toolIds.includes(tp.id) },
    { id: 'practice', icon: 'api', title: tr('API и автотесты', 'API және автотесттер'), note: tr('Запросы, ответы и первый Playwright', 'Сұраныс, жауап және алғашқы Playwright'), match: tp => tp.block === 'practice' },
    { id: 'templates', icon: 'report', title: tr('Шпаргалки и шаблоны', 'Анықтамалар мен үлгілер'), note: tr('Тест-кейсы, чек-листы и баг-репорты', 'Тест-кейс, чек-лист және баг-репорт'), match: tp => tp.block === 'tools' || ['test-case', 'checklist', 'bug-report', 'qa-report'].includes(tp.id) }
  ];

  /* ---------- tiny markdown: paragraphs, lists, tables, ``` blocks, **b**, `code`, [link](url), ### h ---------- */
  function inline(s) {
    return esc(s)
      .replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>")
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, txt, href) => `<a href="${href}">${txt}</a>`);
  }
  function md(text) {
    if (!text) return "";
    const lines = String(text).split("\n");
    let html = "", i = 0;
    while (i < lines.length) {
      const line = lines[i];
      if (line.trim().startsWith("```")) {
        const buf = [];
        i++;
        while (i < lines.length && !lines[i].trim().startsWith("```")) buf.push(lines[i++]);
        i++;
        html += `<pre class="kb-pre">${esc(buf.join("\n"))}</pre>`;
      } else if (/^\s*\|/.test(line)) {
        const rows = [];
        while (i < lines.length && /^\s*\|/.test(lines[i])) rows.push(lines[i++]);
        const cells = r => r.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map(c => c.trim());
        const body = rows.filter(r => !/^\s*\|[\s:|-]+\|\s*$/.test(r));
        html += `<div class="kb-tablewrap"><table class="kb-table"><thead><tr>${cells(body[0]).map(c => `<th>${inline(c)}</th>`).join("")}</tr></thead><tbody>` +
          body.slice(1).map(r => `<tr>${cells(r).map(c => `<td>${inline(c)}</td>`).join("")}</tr>`).join("") + "</tbody></table></div>";
      } else if (/^\s*[-•]\s+/.test(line)) {
        const items = [];
        while (i < lines.length && /^\s*[-•]\s+/.test(lines[i])) items.push(lines[i++].replace(/^\s*[-•]\s+/, ""));
        html += `<ul>${items.map(x => `<li>${inline(x)}</li>`).join("")}</ul>`;
      } else if (/^\s*\d+\.\s+/.test(line)) {
        const items = [];
        while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) items.push(lines[i++].replace(/^\s*\d+\.\s+/, ""));
        html += `<ol>${items.map(x => `<li>${inline(x)}</li>`).join("")}</ol>`;
      } else if (/^###\s+/.test(line)) {
        html += `<h3>${inline(line.replace(/^###\s+/, ""))}</h3>`;
        i++;
      } else if (!line.trim()) {
        i++;
      } else {
        const buf = [];
        while (i < lines.length && lines[i].trim() && !/^\s*([-•]\s|\d+\.\s|\||```|###\s)/.test(lines[i])) buf.push(lines[i++]);
        html += `<p>${buf.map(inline).join("<br>")}</p>`;
      }
    }
    return html;
  }

  function label(tp) {
    return (tp.n == null ? "" : tp.n + ". ") + tp[lang()].title;
  }
  function pairsText(tp) {
    if (!tp.pairs) return "";
    return ["k1", "k2"].filter(k => tp.pairs[k] && tp.pairs[k].length)
      .map(k => `${u("pairs")[k]} ${tp.pairs[k].join(", ")}`).join(" · ");
  }
  function haystack(tp) {
    const parts = [JSON.stringify(tp.ru), JSON.stringify(tp.kz)];
    (tp.terms || []).forEach(t => parts.push(t.join(" ")));
    return parts.join(" ").toLowerCase();
  }

  /* ---------- layout ---------- */
  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="kb-shell wrap">
      <div class="kb-commandbar">
        <a class="kb-brand" href="#home">${icon('book')}<span>${u('title')}</span></a>
        <form class="kb-searchbox" role="search" id="kb-search-form"><label class="kb-sr-only" for="kb-q">${tr('Поиск по базе знаний', 'Білім қорынан іздеу')}</label>${icon('search')}<input id="kb-q" class="kb-search" type="search" autocomplete="off" placeholder="${tr('Что ищем? Баг, Network, API…', 'Не іздейміз? Баг, Network, API…')}"><kbd aria-hidden="true">/</kbd></form>
        <a class="kb-practice-link" href="labs.html">${tr('В лабораторию', 'Зертханаға')}${icon('arrow')}</a>
      </div>
      <div class="kb kb-layout" id="kb-layout">
        <button class="btn btn-small kb-toggle" type="button" id="kb-toggle" aria-expanded="false" aria-controls="kb-side">${u("topics")}</button>
        <aside class="kb-side" id="kb-side"><a href="#home" class="kb-side-home">← ${tr('К каталогу', 'Каталогқа')}</a><nav id="kb-nav" aria-label="${tr('Темы базы знаний', 'Білім қорының тақырыптары')}"></nav><div class="kb-read-progress" id="kb-progress"></div></aside>
        <div class="kb-main" id="kb-main"></div>
      </div>
    </div>`;

  function drawNav(filter) {
    const done = readSet();
    const q = (filter || "").trim().toLowerCase();
    const current = location.hash.slice(1);
    const count = topics.filter(tp => done.has(tp.id)).length;
    document.getElementById('kb-progress').innerHTML = `<span>${tr('Прочитано', 'Оқылды')} <b>${count} / ${topics.length}</b></span><progress value="${count}" max="${topics.length}" aria-label="${tr('Прочитанные темы', 'Оқылған тақырыптар')}"></progress>`;
    const link = tp => `<a href="#${tp.id}" class="kb-link ${tp.id === current ? "on" : ""}">${esc(label(tp))}${done.has(tp.id) ? ' <span class="kb-done">✓</span>' : ""}</a>`;
    if (q) {
      // сначала темы, где слово в названии или терминах, потом — где оно встречается в тексте
      const strong = tp => (tp.ru.title + " " + tp.kz.title + " " + (tp.terms || []).map(t => t.join(" ")).join(" ")).toLowerCase().includes(q);
      const found = topics.filter(tp => haystack(tp).includes(q));
      const list = found.filter(strong).concat(found.filter(tp => !strong(tp)));
      document.getElementById("kb-nav").innerHTML = list.length
        ? `<div class="kb-block">${u("found")}: ${list.length}</div>` + list.map(link).join("")
        : `<p class="muted">${u("nothing")}</p>`;
      return;
    }
    const shown = topics;
    let html = "";
    ORDER.forEach(block => {
      const list = shown.filter(tp => tp.block === block);
      if (block === "tools") list.push({ id: "glossary", block: "tools", ru: { title: "📖 " + UI.ru.gl_title }, kz: { title: "📖 " + UI.kz.gl_title } });
      if (!list.length) return;
      html += `<details class="kb-nav-group" ${byId(current)?.block === block || current === 'glossary' && block === 'tools' ? 'open' : ''}><summary>${u("blocks")[block]}<span>${list.length}</span></summary>${list.map(link).join("")}</details>`;
    });
    document.getElementById("kb-nav").innerHTML = html || `<p class="muted">${u("nothing")}</p>`;
  }

  function copyBtn(text) {
    return `<button class="btn btn-small btn-ghost kb-copy" type="button" data-copy="${esc(text)}">${u("copy")}</button>`;
  }

  const plain = text => String(text || '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[*`#]/g, '').replace(/\s+/g, ' ').trim();
  function card(tp) {
    const done = readSet().has(tp.id), text = plain(tp[lang()].short);
    return `<a class="kb-topic-card tone-${topicIcon(tp)}" href="#${tp.id}"><span class="kb-card-top"><span class="kb-card-icon">${icon(topicIcon(tp))}</span><small>${done ? tr('Прочитано ✓', 'Оқылды ✓') : tp[lang()].steps ? tr('Пошаговая инструкция', 'Қадамдық нұсқаулық') : tr('Тема и примеры', 'Тақырып пен мысалдар')}</small></span><h3>${esc(tp[lang()].title)}</h3><p>${esc(text.length > 130 ? text.slice(0, 127) + '…' : text)}</p><span class="kb-card-bottom">${tp.minutes ? '~' + tp.minutes + ' ' + tr('мин', 'мин') : tr('Открыть разбор', 'Талдауды ашу')} ${icon('arrow')}</span></a>`;
  }
  function pills(selected) {
    return `<nav class="kb-filter-pills" aria-label="${tr('Разделы базы знаний', 'Білім қорының бөлімдері')}"><a href="#catalog-all" ${selected === 'all' ? 'aria-current="page"' : ''}>${tr('Все темы', 'Барлық тақырып')}</a>${categories.map(c => `<a href="#catalog-${c.id}" ${selected === c.id ? 'aria-current="page"' : ''}>${c.title}</a>`).join('')}<a href="#glossary">${tr('Словарь EN · RU · KZ', 'EN · RU · KZ сөздігі')}</a></nav>`;
  }
  function drawCatalog(category = 'all', query = '') {
    const home = category === 'home' && !query;
    document.getElementById('kb-layout').className = 'kb kb-layout is-catalog';
    const main = document.getElementById('kb-main');
    if (home) {
      const last = byId(load('qc_kb_last', ''));
      main.innerHTML = `<section class="kb-hero"><div class="kb-hero-copy"><span class="hub-eyebrow"><i></i>${tr('ТВОЯ ПОЛКА ЗНАНИЙ', 'СЕНІҢ БІЛІМ СӨРЕҢ')}</span><h1>${tr('Меньше путаницы.<br><em>Больше практики.</em>', 'Аз шатасу.<br><em>Көп тәжірибе.</em>')}</h1><p>${tr('Понятные объяснения, инструменты тестировщика и задания на qala coffe. Найди тему, попробуй по шагам и объясни результат.', 'Түсінікті түсіндірме, тестілеуші құралдары және qala coffe тапсырмалары. Тақырыпты тап, қадаммен орында және нәтижені түсіндір.')}</p><div class="kb-hero-actions"><a class="btn" href="#catalog-toolkit">${tr('Изучить инструменты', 'Құралдарды зерттеу')} ↗</a><a href="#testing-qa">${tr('Я только начинаю →', 'Жаңадан бастаймын →')}</a></div><div class="kb-hero-facts"><span><b>${topics.length}</b> ${tr('тем', 'тақырып')}</span><span><b>${toolIds.length}</b> ${tr('инструментов и приёмов', 'құрал мен тәсіл')}</span><span>RU + KZ</span></div></div><div class="kb-kit-art" aria-hidden="true"><div class="kb-kit-orbit"></div><div class="kb-kit-window"><div class="kb-kit-window-top"><i></i><i></i><i></i><span>qa-toolkit</span></div><div class="kb-kit-code"><span>01</span> observe()<br><span>02</span> compare()<br><span>03</span> explain()</div><div class="kb-kit-success">✓ ${tr('Теперь понятно', 'Енді түсінікті')}</div></div><div class="kb-kit-chip chip-inspect">${icon('inspect')} DevTools</div><div class="kb-kit-chip chip-api">${icon('api')} API</div><div class="kb-kit-chip chip-tests">${icon('tests')} Playwright</div><span class="kb-kit-spark">✳</span></div></section>
      ${last ? `<a class="kb-continue" href="#${last.id}"><span>${tr('Продолжить чтение', 'Оқуды жалғастыру')} <strong>${esc(last[lang()].title)}</strong></span>${icon('arrow')}</a>` : ''}
      <section class="kb-catalog-section"><div class="kb-section-heading"><div><span class="hub-eyebrow">${tr('НАЙДИ СВОЁ НАПРАВЛЕНИЕ', 'ӨЗ БАҒЫТЫҢДЫ ТАП')}</span><h2>${tr('Что разберём сегодня?', 'Бүгін нені талдаймыз?')}</h2></div><a href="#catalog-all">${tr('Все темы', 'Барлық тақырып')} →</a></div><div class="kb-category-grid">${categories.map(c => `<a class="kb-category" href="#catalog-${c.id}"><span class="kb-card-icon">${icon(c.icon)}</span><strong>${c.title}</strong><span>${c.note}</span><small>${topics.filter(c.match).length} ${tr('материалов', 'материал')} ↗</small></a>`).join('')}</div></section>
      <section class="kb-catalog-section"><div class="kb-section-heading"><div><span class="hub-eyebrow">${tr('ПОЛЕЗНО С ПЕРВОГО ДНЯ', 'АЛҒАШҚЫ КҮННЕН ПАЙДАЛЫ')}</span><h2>${tr('Инструменты тестировщика', 'Тестілеуші құралдары')}</h2></div><a href="#catalog-toolkit">${tr('Все инструменты', 'Барлық құрал')} →</a></div><p class="kb-section-note">${tr('Что открыть, куда нажать и как понять результат. Начни с любой карточки.', 'Нені ашу, қайда басу және нәтижені қалай түсіну керек. Кез келген карточкадан баста.')}</p><div class="kb-topic-grid">${toolIds.slice(0, 6).map(byId).filter(Boolean).map(card).join('')}</div></section>
      <section class="kb-start-route"><span class="kb-route-icon">${icon('network')}</span><div><h2>${tr('Первая практика за три шага', 'Үш қадамдық алғашқы тәжірибе')}</h2><p>${tr('Открой Network → отправь запрос в лаборатории → сравни ответ с сайтом.', 'Network аш → зертханада сұраныс жібер → жауапты сайтпен салыстыр.')}</p></div><a href="#tool-network">${tr('Попробовать', 'Орындап көру')} →</a></section>`;
      return;
    }
    const group = categories.find(c => c.id === category), q = query.trim().toLowerCase();
    const strong = tp => (tp.ru.title + ' ' + tp.kz.title + ' ' + JSON.stringify(tp.terms || [])).toLowerCase().includes(q);
    let list = topics.filter(tp => (!group || group.match(tp)) && (!q || haystack(tp).includes(q)));
    if (category === 'toolkit') list.sort((a,b) => toolIds.indexOf(a.id) - toolIds.indexOf(b.id));
    if (q) list = list.filter(strong).concat(list.filter(tp => !strong(tp)));
    main.innerHTML = `<a href="#home" class="kb-back-link">← ${tr('На главную базы знаний', 'Білім қорының басты бетіне')}</a><header class="kb-catalog-title"><span class="hub-eyebrow">${q ? tr('ПОИСК ПО ВСЕЙ БАЗЕ', 'БҮКІЛ ҚОРДАН ІЗДЕУ') : tr('ВЫБЕРИ И ПОПРОБУЙ', 'ТАҢДА ЖӘНЕ ОРЫНДА')} </span><h1>${q ? tr('Нашлось по запросу', 'Сұраныс бойынша табылды') + ' «' + esc(query) + '»' : group ? group.title : tr('Все темы', 'Барлық тақырып')}</h1><p>${q ? list.length + ' ' + tr('материалов. Поиск понимает русский, казахский и английские термины.', 'материал. Іздеу орысша, қазақша және ағылшынша терминдерді түсінеді.') : group ? group.note : tr('Теория, инструменты и примеры для практики.', 'Теория, құралдар және тәжірибе мысалдары.')}</p></header>${pills(q ? '' : category)}${category === 'templates' ? `<a class="kb-glossary-card" href="#glossary">${icon('book')}<span><strong>${tr('Открыть словарь терминов', 'Терминдер сөздігін ашу')}</strong><small>English · Русский · Қазақша</small></span>${icon('arrow')}</a>` : ''}<div class="kb-topic-grid">${list.map(card).join('')}</div>${!list.length ? `<div class="kb-empty">${icon('search')}<h2>${tr('Пока ничего не нашли', 'Әзірге ештеңе табылмады')}</h2><p>${u('nothing')}</p><button type="button" class="btn btn-ghost" data-clear-search>${tr('Сбросить поиск', 'Іздеуді тазарту')}</button></div>` : ''}`;
  }

  function drawTopic(tp) {
    const c = tp[lang()];
    const idx = topics.indexOf(tp);
    const prev = topics[idx - 1], next = topics[idx + 1];
    const done = readSet().has(tp.id);
    const sections = [];
    const sec = (key, html, cls) => {
      if (!html) return '';
      sections.push([key, u(key)]);
      return `<section class="kb-sec ${cls || ""}" id="kb-section-${key}"><h2>${u(key)}</h2>${html}</section>`;
    };
    const content = `${sec("short", md(c.short), "kb-short")}
      ${sec("when", md(c.when))}
      ${sec("steps", c.steps ? `<ol class="kb-guide-steps">${c.steps.map(([title, text], i) => `<li><span class="kb-step-number">${i + 1}</span><div><h3>${esc(title)}</h3>${md(text)}</div></li>`).join('')}</ol>` : '')}
      ${sec("analogy", md(c.analogy), "kb-analogy")}
      ${sec("body", md(c.body))}
      ${c.template ? sec("template", `<div class="kb-tpl"><pre class="kb-pre">${esc(c.template)}</pre>${copyBtn(c.template)}</div>`) : ""}
      ${sec("example", md(c.example) + (c.exampleLink ? `<p><a class="btn btn-small" href="${c.exampleLink.href}" target="_blank" rel="noopener">${esc(c.exampleLink.label || u("open_shop"))}</a></p>` : ""), "kb-example")}
      ${sec("mistakes", c.mistakes?.length ? `<ul>${c.mistakes.map(m => `<li>${inline(m)}</li>`).join("")}</ul>` : "")}
      ${c.remember ? `<div class="kb-remember"><b>${u("remember")}:</b> ${inline(c.remember)}</div>` : ""}
      ${sec("check", c.check?.length ? `<p class="muted">${u("check_hint")}</p>` + c.check.map(([q, a]) => `<details class="kb-q"><summary>${inline(q)}</summary><div>${md(a)}</div></details>`).join("") : "")}
      ${sec('sources', tp.sources?.length ? `<ul class="kb-sources">${tp.sources.map(([title, href]) => `<li><a href="${href}" target="_blank" rel="noopener">${esc(title)} ↗</a></li>`).join('')}</ul>` : '')}`;
    document.getElementById('kb-layout').className = 'kb kb-layout is-reading';
    document.getElementById("kb-main").innerHTML = `
      <div class="kb-breadcrumb"><a href="#home">${u('title')}</a><span>/</span><a href="#catalog-${tp.block === 'toolkit' ? 'toolkit' : tp.block === 'practice' ? 'practice' : 'theory'}">${esc(u('blocks')[tp.block])}</a></div>
      <header class="kb-topic-head"><span class="kb-topic-badge">${icon(topicIcon(tp))}${tp.block === 'toolkit' ? tr('Инструмент · инструкция', 'Құрал · нұсқаулық') : esc(pairsText(tp)) || u('blocks')[tp.block]}${tp.minutes ? ' · ~' + tp.minutes + ' ' + tr('мин', 'мин') : ''}</span><h1>${esc(c.title)}</h1><p>${tr('Разберись → попробуй → проверь себя', 'Түсін → орында → өзіңді тексер')}</p></header>
      <div class="kb-reading-grid"><div class="kb-reading-content">${content}
      ${tp.terms && tp.terms.length ? `<p class="kb-terms"><b>${u("terms")}:</b> ${tp.terms.map(t => esc(t.filter(Boolean).join(" / "))).join(" · ")}</p>` : ""}
      <div class="kb-foot">
        <button class="btn ${done ? "btn-ghost" : ""}" id="kb-read" type="button">${done ? u("unread") : u("read")}</button>
        <span>${prev ? `<a href="#${prev.id}">${u("prev")}</a>` : ""} ${next ? `<a href="#${next.id}">${u("next")}</a>` : ""}</span>
      </div></div><aside class="kb-on-page" aria-label="${tr('Оглавление темы', 'Тақырып мазмұны')}"><strong>${tr('В этой теме', 'Осы тақырыпта')}</strong>${sections.map(([key, title]) => `<button type="button" data-jump="kb-section-${key}">${title}</button>`).join('')}<a class="kb-toc-practice" href="labs.html">${tr('Попробовать на сайте', 'Сайтта орындау')} ↗</a></aside></div>`;
    save('qc_kb_last', tp.id);
    document.getElementById("kb-read").addEventListener("click", () => {
      const s = readSet();
      if (s.has(tp.id)) s.delete(tp.id); else s.add(tp.id);
      save("qc_kb_read", [...s]);
      drawTopic(tp);
      drawNav(document.getElementById("kb-q").value);
    });
  }

  // Глоссарий по порядку пар: сначала термины первой пары, потом второй и т. д.
  const course = () => (load("qc_kb_course", "k1") === "k2" ? "k2" : "k1");

  function glossaryGroup(tp) {
    if (tp.block === "tools") return { order: 1e6, title: tp[lang()].title };
    const main = course(), other = main === "k1" ? "k2" : "k1";
    const p = tp.pairs && tp.pairs[main] && tp.pairs[main][0];
    const q = tp.pairs && tp.pairs[other] && tp.pairs[other][0];
    if (p) return { order: p, title: `${u("pairs")[main]} ${p}` };
    if (q) return { order: 1000, title: u("gl_other") };
    return { order: 5e5, title: u("blocks").extra };
  }

  function drawGlossary() {
    document.getElementById('kb-layout').className = 'kb kb-layout is-glossary';
    const list = topics.filter(tp => tp.terms && tp.terms.length)
      .map(tp => ({ tp, g: glossaryGroup(tp) }))
      .sort((a, b) => a.g.order - b.g.order || (a.tp.n == null ? 0 : a.tp.n) - (b.tp.n == null ? 0 : b.tp.n));
    let html = "", lastGroup = null;
    list.forEach(({ tp, g }) => {
      if (g.title !== lastGroup) {
        html += `<tr class="kb-gl-group"><td colspan="4">${esc(g.title)}</td></tr>`;
        lastGroup = g.title;
      }
      tp.terms.forEach((t, i) => {
        html += `<tr><td><b>${esc(t[0] || "—")}</b></td><td>${esc(t[1] || "—")}</td><td>${esc(t[2] || "—")}</td>` +
          `<td>${i === 0 ? `<a href="#${tp.id}">${esc(label(tp))}</a>` : ""}</td></tr>`;
      });
    });
    document.getElementById("kb-main").innerHTML = `
      <h1>📖 ${u("gl_title")}</h1>
      <p class="muted">${u("gl_note")}</p>
      <div class="kb-course">${["k1", "k2"].map(k => `<button type="button" class="btn btn-small ${course() === k ? "" : "btn-ghost"}" data-course="${k}">${u("blocks")[k]}</button>`).join("")}</div>
      <div class="kb-tablewrap"><table class="kb-table kb-gl"><thead><tr>${u("gl_head").map(h => `<th>${h}</th>`).join("")}</tr></thead><tbody>
      ${html}
      </tbody></table></div>`;
    document.querySelectorAll(".kb-course button").forEach(b => b.addEventListener("click", () => {
      save("qc_kb_course", b.dataset.course);
      drawGlossary();
    }));
  }

  function route() {
    const id = location.hash.slice(1);
    const tp = byId(id);
    if (id === "glossary") { document.getElementById('kb-q').value = ''; drawGlossary(); }
    else if (tp) drawTopic(tp);
    else if (id === 'search' && document.getElementById('kb-q').value.trim()) drawCatalog('all', document.getElementById('kb-q').value);
    else {
      document.getElementById('kb-q').value = '';
      drawCatalog(id.startsWith('catalog-') ? id.slice(8) : 'home');
    }
    drawNav(document.getElementById("kb-q").value);
    document.getElementById("kb-side").classList.remove("open");
    document.getElementById("kb-toggle").setAttribute("aria-expanded", "false");
    window.scrollTo(0, 0);
  }

  function search() {
    const query = document.getElementById('kb-q').value;
    if (query.trim()) {
      if (location.hash !== '#search') { history.pushState(null, '', '#search'); window.scrollTo(0, 0); }
      drawCatalog('all', query);
      drawNav(query);
    } else { history.replaceState(null, '', '#home'); route(); }
  }
  document.getElementById("kb-q").addEventListener("input", search);
  document.getElementById('kb-search-form').addEventListener('submit', e => { e.preventDefault(); search(); });
  document.addEventListener('keydown', e => {
    if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey && !e.target.closest('input,textarea,[contenteditable="true"]')) { e.preventDefault(); document.getElementById('kb-q').focus(); }
  });
  document.getElementById("kb-toggle").addEventListener("click", e => {
    const open = document.getElementById("kb-side").classList.toggle("open");
    e.currentTarget.setAttribute("aria-expanded", String(open));
  });
  document.getElementById("kb-main").addEventListener("click", e => {
    const jump = e.target.closest('[data-jump]');
    if (jump) {
      const section = document.getElementById(jump.dataset.jump);
      const offset = document.getElementById('header').offsetHeight + document.querySelector('.kb-commandbar').offsetHeight + 28;
      if (section) { window.scrollTo({top: section.getBoundingClientRect().top + scrollY - offset, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'}); section.setAttribute('tabindex', '-1'); section.focus({preventScroll:true}); }
      return;
    }
    if (e.target.closest('[data-clear-search]')) { document.getElementById('kb-q').value = ''; search(); document.getElementById('kb-q').focus(); return; }
    const b = e.target.closest(".kb-copy");
    if (!b) return;
    const text = b.dataset.copy;
    const done = () => { b.textContent = u("copied"); setTimeout(() => { b.textContent = u("copy"); }, 1500); };
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, () => prompt("Ctrl+C", text));
    else prompt("Ctrl+C", text);
  });
  window.addEventListener("hashchange", route);
  route();
})();
