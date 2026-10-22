/* Уроки: список пар по этапам (#k1, #k2) и страница пары (#k1-5). Режимы «Просто» / «Подробно» со сдвигом.
   Данные: js/learn/course.js (структура курсов) и js/learn/<курс>-<пара>.js (содержимое пар). */
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
  const L = load("qc_lang", "ru") === "kz" ? "kz" : "ru";
  const LI = L === "kz" ? 1 : 0;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const UI = {
    ru: {
      title: "Уроки", lead: "Все пары курса по этапам. Любая пара открыта всегда — возвращайся к ней сколько угодно.",
      pair: "Пара", stage: "Этап", soon: "Готовится", simple: "Просто", detailed: "Подробно",
      mode_hint: { s: "Объясняем без терминов, на примерах из жизни.", d: "Точные термины и шаблоны, как на работе." },
      gloss: "Словарь пары", gloss_btn: "📖 Словарь", gloss_note: "Нажми на подчёркнутое слово в тексте — оно подсветится здесь.",
      gloss_languages: "Языки перевода", gloss_ru: "Только RU", gloss_kz: "Только KZ", gloss_both: "RU + KZ",
      remember: "Запомни", quiz: "Проверь себя", right: "Верно!", wrong: "Не совсем.", more: "Подробнее",
      copy: "Скопировать", copied: "Скопировано", back: "← Все пары", prev: "← Пара", next: "Пара →",
      empty: "Эта пара ещё готовится. Пока можно открыть тему в", kb: "базе знаний", task: "Задание"
    },
    kz: {
      title: "Сабақтар", lead: "Курстың барлық сабағы кезеңдер бойынша. Кез келген сабақ әрқашан ашық — оған қанша рет болса да орал.",
      pair: "Сабақ", stage: "Кезең", soon: "Дайындалуда", simple: "Қарапайым", detailed: "Толық",
      mode_hint: { s: "Терминсіз, өмірден мысалдармен түсіндіреміз.", d: "Нақты терминдер мен үлгілер, жұмыстағыдай." },
      gloss: "Сабақ сөздігі", gloss_btn: "📖 Сөздік", gloss_note: "Мәтіндегі асты сызылған сөзді бас — ол осында белгіленеді.",
      gloss_languages: "Аударма тілдері", gloss_ru: "Тек RU", gloss_kz: "Тек KZ", gloss_both: "RU + KZ",
      remember: "Есте сақта", quiz: "Өзіңді тексер", right: "Дұрыс!", wrong: "Толық емес.", more: "Толығырақ",
      copy: "Көшіру", copied: "Көшірілді", back: "← Барлық сабақ", prev: "← Сабақ", next: "Сабақ →",
      empty: "Бұл сабақ әлі дайындалуда. Әзірге тақырыпты мына жерден ашуға болады:", kb: "білім қоры", task: "Тапсырма"
    }
  }[L];

  const C = window.LEARN_COURSES, P = window.LEARN_PAIRS || {};
  const app = document.getElementById("app");
  let mode = load("qc_learn_mode", "s") === "d" ? "d" : "s";
  const savedGlossLanguages = load("qc_learn_gloss_languages", "both");
  let glossLanguages = ["ru", "kz", "both"].includes(savedGlossLanguages) ? savedGlossLanguages : "both";

  /* ---------- текст: абзацы, списки, таблицы, ``` / ```copy, **жирный**, [ссылка](url), [[слово@Term]] ---------- */
  function inline(s, m) {
    return esc(s)
      .replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>")
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\[\[([^\]@]+)@([^\]]+)\]\]/g, (x, word, term) => m === "d"
        ? `<button type="button" class="ln-term" data-term="${term}">${word}</button>` : word)
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (x, txt, href) => `<a href="${href}">${txt}</a>`);
  }
  function md(text, m) {
    const lines = String(text || "").split("\n");
    let html = "", i = 0;
    while (i < lines.length) {
      const line = lines[i];
      if (line.trim().startsWith("```")) {
        const copy = /```copy/.test(line), buf = [];
        i++;
        while (i < lines.length && !lines[i].trim().startsWith("```")) buf.push(lines[i++]);
        i++;
        html += `<div class="ln-code"><pre>${esc(buf.join("\n"))}</pre>${copy ? `<button type="button" class="btn btn-ghost ln-copy">${UI.copy}</button>` : ""}</div>`;
      } else if (/^\s*\|/.test(line)) {
        const rows = [];
        while (i < lines.length && /^\s*\|/.test(lines[i])) rows.push(lines[i++]);
        const cells = r => r.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map(c => c.trim());
        const body = rows.filter(r => !/^\s*\|[\s:|-]+\|\s*$/.test(r));
        html += `<div class="ln-tablewrap"><table class="ln-table"><thead><tr>${cells(body[0]).map(c => `<th>${inline(c, m)}</th>`).join("")}</tr></thead><tbody>` +
          body.slice(1).map(r => `<tr>${cells(r).map(c => `<td>${inline(c, m)}</td>`).join("")}</tr>`).join("") + "</tbody></table></div>";
      } else if (/^\s*-\s+/.test(line)) {
        const items = [];
        while (i < lines.length && /^\s*-\s+/.test(lines[i])) items.push(lines[i++].replace(/^\s*-\s+/, ""));
        html += `<ul>${items.map(x => `<li>${inline(x, m)}</li>`).join("")}</ul>`;
      } else if (/^\s*\d+\.\s+/.test(line)) {
        const items = [];
        while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) items.push(lines[i++].replace(/^\s*\d+\.\s+/, ""));
        html += `<ol>${items.map(x => `<li>${inline(x, m)}</li>`).join("")}</ol>`;
      } else if (!line.trim()) {
        i++;
      } else {
        html += `<p>${inline(line, m)}</p>`;
        i++;
      }
    }
    return html;
  }

  const title = (k, n) => C[k].titles[n][LI];
  const stageOf = (k, n) => C[k].stages.find(s => n >= s.pairs[0] && n <= s.pairs[1]);
  const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

  /* ---------- список пар ---------- */
  function renderCourse(k) {
    save("qc_learn_course", k);
    app.innerHTML = `
      <section class="wrap section ln">
        <h1>${UI.title}</h1>
        <p class="p-lead">${UI.lead}</p>
        <p class="ln-empty"><a href="kb.html#start-here">${L === 'kz' ? 'Алғаш рет пе? Қойынды, көшіру және жұмысты сақтау →' : 'Впервые за компьютером? Вкладки, копирование и сохранение работы →'}</a></p>
        <div class="ln-tabs">${Object.keys(C).map(c => `<a href="#${c}" class="${c === k ? "on" : ""}">${C[c].name[LI]}</a>`).join("")}</div>
        ${C[k].stages.map(s => `
          <div class="ln-stage">
            <div class="ln-stage-head"><span class="ln-stage-n">${UI.stage} ${s.n}</span><h2>${s.name[LI]}</h2><span class="muted">${s.sub[LI]}</span></div>
            <div class="ln-cards">${range(s.pairs[0], s.pairs[1]).map(n => {
              const d = P[`${k}-${n}`];
              return `<a class="ln-card ${d ? "" : "soon"}" href="#${k}-${n}">
                <span class="ln-card-n">${UI.pair} ${n}</span>
                <strong>${title(k, n)}</strong>
                <span class="muted">${d ? d.summary[LI] : UI.soon}</span></a>`;
            }).join("")}</div>
          </div>`).join("")}
      </section>`;
    window.scrollTo(0, 0);
  }

  /* ---------- страница пары ---------- */
  function bodyHtml(d, m) {
    const x = d[L];
    const secs = x.sections.map(s => {
      const more = s.more && s.more[m];
      if (s.optional && m === 's') return `<details class="ln-sec ln-more"><summary>${esc(s.h[m])}</summary>${md(s[m], m)}</details>`;
      return `<section class="ln-sec">
        <h2><span aria-hidden="true">${s.icon}</span> ${s.h[m]}</h2>
        ${md(s[m], m)}
        ${more ? `<details class="ln-more"><summary>${UI.more}: ${esc(more.t)}</summary>${md(more.body, m)}</details>` : ""}
      </section>`;
    }).join("");
    const quiz = x.quiz[m].map((q, qi) => `
      <div class="ln-q" data-q="${qi}">
        <p><b>${qi + 1}. ${esc(q[0])}</b></p>
        <div class="ln-opts">${q[1].map((o, oi) => `<button type="button" class="ln-opt" data-o="${oi}">${esc(o)}</button>`).join("")}</div>
        <p class="ln-fb" hidden></p>
      </div>`).join("");
    return `${secs}
      <div class="ln-remember"><b>${UI.remember}:</b> ${esc(x.remember[m])}</div>
      <section class="ln-sec"><h2><span aria-hidden="true">✅</span> ${UI.quiz}</h2>${quiz}</section>
      ${x.task ? `<p class="ln-task">📝 ${esc(x.task)}</p>` : ""}`;
  }

  function renderFirstLesson(d, head, nav) {
    const x = d[L], kz = L === "kz";
    const text = {
      learn: kz ? "Бүгін не үйренеміз" : "Что сегодня выучим",
      tasks: kz ? "Тапсырмалар" : "Задачи",
      next: kz ? "Жаңа мысал" : "Новый пример",
      example: kz ? "Мысал" : "Пример",
      of: kz ? "/" : "из",
      copy: kz ? "Үлгіні көшіру" : "Скопировать шаблон",
      labels: kz ? ["Талап", "Не істедік", "Күтілетін нәтиже", "Нақты нәтиже", "Бұл нені білдіреді"]
        : ["Требование", "Что сделали", "Ожидаемый результат", "Фактический результат", "Что это значит"]
    };
    const openLinks = html => html.replace(/<a href="/g, '<a target="_blank" rel="noopener" href="');
    app.innerHTML = `<div class="wrap section ln ln-first">
      ${head}
      <section class="ln-sec ln-first-learn" aria-labelledby="first-learn-title">
        <h2 id="first-learn-title">${text.learn}</h2>
        <p class="ln-first-intro">${esc(x.intro)}</p>
        ${x.explanation.map(p => md(p, "s")).join("")}
        <div class="ln-first-links">${x.links.map(([label, href]) => `<a href="${esc(href)}" target="_blank" rel="noopener">${esc(label)} ↗</a>`).join("")}</div>
        <p class="ln-example-note">${esc(x.exampleNote)}</p>
        <div class="ln-example">
          <div class="ln-example-bar"><span class="ln-example-count"></span><button type="button" class="ln-example-next">${text.next} <span aria-hidden="true">↻</span></button></div>
          <div class="ln-example-content" aria-live="polite" aria-atomic="true"></div>
        </div>
      </section>
      <section class="ln-sec ln-first-tasks" aria-labelledby="first-tasks-title">
        <h2 id="first-tasks-title">${text.tasks}</h2>
        <ol>${x.tasks.map((step, i) => `<li>${openLinks(inline(step, "s"))}${i === 2 ? `<div class="ln-code"><pre>${esc(x.template)}</pre><button type="button" class="btn btn-ghost ln-copy">${text.copy}</button></div>` : ""}</li>`).join("")}</ol>
      </section>
      ${nav}
    </div>`;
    let exampleIndex = 0;
    const showExample = () => {
      const example = x.examples[exampleIndex];
      app.querySelector(".ln-example-count").textContent = `${text.example} ${exampleIndex + 1} ${text.of} ${x.examples.length}`;
      app.querySelector(".ln-example-content").innerHTML = `<h3>${esc(example[0])}</h3><dl>${example.slice(1).map((value, i) => `<div><dt>${text.labels[i]}</dt><dd>${esc(value)}</dd></div>`).join("")}</dl>`;
    };
    showExample();
    app.querySelector(".ln-example-next").addEventListener("click", () => {
      exampleIndex = (exampleIndex + 1) % x.examples.length;
      showExample();
    });
    wireBody(app);
  }

  function renderIllustratedLesson(d, head, nav) {
    const data = window.QALecture, x = d[L], kz = L === "kz";
    const tr = (ru, kk) => kz ? kk : ru;
    const openLinks = html => html.replace(/<a href="/g, '<a target="_blank" rel="noopener" href="');
    const figure = (src, label) => `<figure class="ln-figure"><a href="${esc(src)}" target="_blank" rel="noopener" aria-label="${esc(tr('Увеличить схему: ', 'Сызбаны үлкейту: ') + label)}"><img src="${esc(src)}" width="1040" height="650" alt="${esc(tr('Учебная схема: ', 'Оқу сызбасы: ') + label)}" loading="lazy"></a><figcaption>${tr('Учебная иллюстрация. ', 'Оқу иллюстрациясы. ')}<a href="${esc(src)}" target="_blank" rel="noopener">${tr('Открыть крупнее', 'Үлкейтіп ашу')} ↗</a></figcaption></figure>`;
    app.innerHTML = `<div class="wrap section ln ln-first ln-illustrated">
      ${head}
      <section class="ln-sec" aria-labelledby="lecture-learn"><h2 id="lecture-learn">${tr('Что сегодня выучим', 'Бүгін не үйренеміз')}</h2>
        <p>${esc(x.intro)}</p>
        <div class="ln-topic-choices" role="group" aria-label="${tr('Темы этой пары', 'Осы сабақ тақырыптары')}">${d.topics.map((id, i) => `<button type="button" data-lecture-topic="${esc(id)}" aria-pressed="${i === 0}">${esc(data.topics[id].title[LI])}</button>`).join('')}</div>
        <div class="ln-topic-content"></div>
        <div class="ln-example">
          <div class="ln-example-bar"><span class="ln-example-count"></span><button type="button" class="ln-example-next">${tr('Новый пример', 'Жаңа мысал')} <span aria-hidden="true">↻</span></button></div>
          <div class="ln-illustrated-example"></div>
          <p class="ln-example-announcement" role="status" aria-live="polite"></p>
        </div>
      </section>
      <section class="ln-sec ln-first-tasks" aria-labelledby="lecture-tasks"><h2 id="lecture-tasks">${tr('Задачи', 'Тапсырмалар')}</h2>
        <ol>${x.tasks.map((step, i) => `<li>${openLinks(inline(step, 's'))}${i === x.copyAfter ? `<div class="ln-code"><pre>${esc(x.template)}</pre><button type="button" class="btn btn-ghost ln-copy">${tr('Скопировать шаблон', 'Үлгіні көшіру')}</button></div>${x.template.includes('ID:') ? `<p class="ln-template-hint">${tr('ID: TC — тест-кейс, BUG — баг-репорт, CL — чек-лист. Раздел: CRT — корзина, MNU — меню, ORD — заказ. 001 — первая запись этого типа в разделе; следующая — 002. При исправлении записи ID сохраняется.', 'ID: TC — тест-кейс, BUG — баг-репорт, CL — чек-лист. Бөлім: CRT — себет, MNU — мәзір, ORD — тапсырыс. 001 — осы түрдің бөлімдегі бірінші жазбасы; келесісі — 002. Жазбаны түзеткенде ID сақталады.')}</p>` : ''}` : ''}</li>`).join('')}</ol>
      </section>${nav}</div>`;
    let topicId = d.topics[0], index = 0;
    const showExample = (announce = false) => {
      const bank = data.banks[data.topics[topicId].bank], example = bank[index], text = example[L];
      const counter = `${tr('Пример', 'Мысал')} ${index + 1} ${tr('из', '/')} ${bank.length}`;
      app.querySelector('.ln-example-count').textContent = counter;
      app.querySelector('.ln-illustrated-example').innerHTML = `<h3>${esc(text[0])}</h3><p>${inline(text[1], 's')}</p>${figure(example.images[LI], text[0])}<p class="ln-example-explanation">${inline(text[2], 's')}</p>`;
      app.querySelector('.ln-example-announcement').textContent = announce ? counter + ': ' + text[0] : '';
    };
    const showTopic = () => {
      const topic = data.topics[topicId];
      app.querySelector('.ln-topic-content').innerHTML = `<h3>${esc(topic.title[LI])}</h3><p class="ln-topic-en">${esc(topic.en)}</p>${md(topic.body[LI], 's')}${figure(topic.images[LI], topic.title[LI])}<p><a class="ln-kb-link" href="kb.html#${esc(topic.kb)}" target="_blank" rel="noopener">${tr('Прочитать объяснение в базе знаний', 'Білім қорындағы түсіндіруді оқу')} ↗</a></p>`;
      app.querySelectorAll('[data-lecture-topic]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.lectureTopic === topicId)));
      showExample();
      wireBody(app.querySelector('.ln-topic-content'));
    };
    showTopic();
    app.querySelectorAll('[data-lecture-topic]').forEach(button => button.addEventListener('click', () => {
      topicId = button.dataset.lectureTopic; index = 0; showTopic();
    }));
    app.querySelector('.ln-example-next').addEventListener('click', () => {
      index = (index + 1) % data.banks[data.topics[topicId].bank].length;
      showExample(true);
    });
    wireBody(app.querySelector('.ln-first-tasks'));
  }

  function renderPair(k, n) {
    const d = P[`${k}-${n}`];
    const st = stageOf(k, n);
    const last = C[k].stages[C[k].stages.length - 1].pairs[1];
    const nav = `<div class="ln-nav">
      ${n > 1 ? `<a class="btn btn-ghost" href="#${k}-${n - 1}">${UI.prev} ${n - 1}</a>` : "<span></span>"}
      <a class="btn btn-ghost" href="#${k}">${UI.back}</a>
      ${n < last ? `<a class="btn btn-ghost" href="#${k}-${n + 1}">${UI.next} ${n + 1}</a>` : "<span></span>"}</div>`;
    const head = `<div class="ln-crumbs"><a href="#${k}">${C[k].name[LI]}</a> › ${UI.stage} ${st.n} · ${st.name[LI]}</div>
      <h1><span class="ln-h-n">${UI.pair} ${n}</span> ${title(k, n)}</h1>`;
    if (!d) {
      app.innerHTML = `<section class="wrap section ln">${head}
        <p class="ln-empty">${UI.empty} <a href="kb.html">${UI.kb}</a>.</p>${nav}</section>`;
      window.scrollTo(0, 0);
      return;
    }
    if (d.format === "illustrated-curriculum") {
      renderIllustratedLesson(d, head, nav);
      window.scrollTo(0, 0);
      return;
    }
    if (d.format === "guided-first-lesson") {
      renderFirstLesson(d, head, nav);
      window.scrollTo(0, 0);
      return;
    }
    app.innerHTML = `
      <section class="wrap section ln">
        ${head}
        <div class="ln-bar">
          <div class="ln-mode" role="group">
            <button type="button" data-m="s" class="${mode === "s" ? "on" : ""}">🙂 ${UI.simple}</button>
            <button type="button" data-m="d" class="${mode === "d" ? "on" : ""}">🎓 ${UI.detailed}</button>
          </div>
          <span class="muted ln-mode-hint">${UI.mode_hint[mode]}</span>
          <button type="button" class="btn btn-ghost ln-gloss-btn">${UI.gloss_btn}</button>
        </div>
        <div class="ln-layout">
          <div class="ln-viewport"><div class="ln-body">${bodyHtml(d, mode)}</div></div>
          <aside class="ln-gloss">
            <div class="ln-gloss-head">
              <h2>${UI.gloss}</h2>
              <select class="ln-gloss-languages" aria-label="${UI.gloss_languages}">
                ${[["ru", UI.gloss_ru], ["kz", UI.gloss_kz], ["both", UI.gloss_both]].map(([value, label]) => `<option value="${value}"${glossLanguages === value ? " selected" : ""}>${label}</option>`).join("")}
              </select>
            </div>
            <p class="muted ln-gloss-note">${UI.gloss_note}</p>
            ${d.glossary.map(g => `<div class="ln-g" data-term="${esc(g[0])}">
              <b>${esc(g[0])}</b> ${g[1] ? `<span class="ln-pron">[${esc(g[1])}]</span>` : ''}
              <span data-gloss-lang="ru"${glossLanguages === "kz" ? " hidden" : ""}><i>RU</i> ${esc(g[2])}</span><span data-gloss-lang="kz"${glossLanguages === "ru" ? " hidden" : ""}><i>KZ</i> ${esc(g[3])}</span></div>`).join("")}
          </aside>
        </div>
        ${nav}
      </section>`;
    wirePair(d);
    window.scrollTo(0, 0);
  }

  function wireBody(root) {
    root.querySelectorAll(".ln-copy").forEach(b => b.addEventListener("click", () => {
      const text = b.parentElement.querySelector("pre").textContent;
      const label = b.dataset.copyLabel || (b.dataset.copyLabel = b.textContent);
      const done = () => { b.textContent = UI.copied; setTimeout(() => { b.textContent = label; }, 1500); };
      const manual = () => prompt(L === "kz" ? "Мәтінді қолмен көшір: Ctrl+C" : "Скопируй текст вручную: Ctrl+C", text);
      if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, manual); else manual();
    }));
    root.querySelectorAll(".ln-q").forEach(q => q.querySelectorAll(".ln-opt").forEach(o => o.addEventListener("click", () => {
      const data = q.__data;
      const ok = Number(o.dataset.o) === data[2];
      q.querySelectorAll(".ln-opt").forEach(x => x.classList.remove("ok", "bad"));
      o.classList.add(ok ? "ok" : "bad");
      const fb = q.querySelector(".ln-fb");
      fb.hidden = false;
      fb.className = "ln-fb " + (ok ? "ok" : "bad");
      fb.textContent = (ok ? UI.right + " " : UI.wrong + " ") + data[3];
    })));
    root.querySelectorAll(".ln-term").forEach(t => t.addEventListener("click", () => {
      const g = document.querySelector(`.ln-g[data-term="${CSS.escape(t.dataset.term)}"]`);
      if (!g) return;
      const aside = document.querySelector(".ln-gloss");
      if (getComputedStyle(aside).position !== "sticky") aside.classList.add("open");
      g.scrollIntoView({ block: "nearest", behavior: "smooth" });
      g.classList.remove("flash");
      void g.offsetWidth;
      g.classList.add("flash");
    }));
  }

  function wirePair(d) {
    const vp = document.querySelector(".ln-viewport");
    document.querySelector(".ln-gloss-languages").addEventListener("change", e => {
      glossLanguages = e.target.value;
      save("qc_learn_gloss_languages", glossLanguages);
      document.querySelectorAll("[data-gloss-lang]").forEach(row => {
        row.hidden = glossLanguages !== "both" && row.dataset.glossLang !== glossLanguages;
      });
    });
    const attachQuiz = () => document.querySelectorAll(".ln-q").forEach(q => { q.__data = d[L].quiz[mode][Number(q.dataset.q)]; });
    attachQuiz();
    wireBody(vp);
    document.querySelector(".ln-gloss-btn").addEventListener("click", () => document.querySelector(".ln-gloss").classList.toggle("open"));
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let busy = false;
    document.querySelectorAll(".ln-mode button").forEach(b => b.addEventListener("click", () => {
      const m = b.dataset.m;
      if (m === mode || busy) return;
      const dir = m === "d" ? -1 : 1;   // «Подробно» уезжает влево, «Просто» — вправо
      mode = m;
      save("qc_learn_mode", m);
      document.querySelectorAll(".ln-mode button").forEach(x => x.classList.toggle("on", x.dataset.m === m));
      document.querySelector(".ln-mode-hint").textContent = UI.mode_hint[m];
      const old = vp.querySelector(".ln-body");
      const swap = () => {
        const nb = document.createElement("div");
        nb.className = "ln-body";
        nb.innerHTML = bodyHtml(d, m);
        return nb;
      };
      if (reduce) { old.replaceWith(swap()); attachQuiz(); wireBody(vp); return; }
      busy = true;
      vp.style.height = old.offsetHeight + "px";
      old.style.transform = `translateX(${dir * 60}px)`;
      old.style.opacity = "0";
      setTimeout(() => {
        const nb = swap();
        nb.style.transition = "none";
        nb.style.transform = `translateX(${-dir * 60}px)`;
        nb.style.opacity = "0";
        old.replaceWith(nb);
        attachQuiz();
        wireBody(vp);
        vp.style.height = nb.offsetHeight + "px";
        requestAnimationFrame(() => requestAnimationFrame(() => {
          nb.style.transition = "";
          nb.style.transform = "";
          nb.style.opacity = "";
        }));
        setTimeout(() => { vp.style.height = ""; busy = false; }, 320);
      }, 200);
    }));
  }

  /* ---------- маршрут ---------- */
  function route() {
    const h = location.hash.slice(1);
    const m = h.match(/^(k[12])-(\d+)$/);
    if (m && C[m[1]].titles[m[2]]) return renderPair(m[1], Number(m[2]));
    const k = C[h] ? h : (C[load("qc_learn_course", "k1")] ? load("qc_learn_course", "k1") : "k1");
    renderCourse(k);
  }
  window.addEventListener("hashchange", route);
  route();
})();
