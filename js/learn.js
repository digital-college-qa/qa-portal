/* Уроки: список пар по этапам (#qa) и страница пары (#qa-5).
   Данные: js/learn/course.js и общий источник js/study-content.js. */
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
  // уровень пары с простой версией: simple — коротко, до 70 баллов; full — полный урок, до 100
  let level = load("qc_learn_level", "simple") === "full" ? "full" : "simple";
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
        ${Object.keys(C).length > 1 ? `<div class="ln-tabs">${Object.keys(C).map(c => `<a href="#${c}" class="${c === k ? "on" : ""}">${C[c].name[LI]}</a>`).join("")}</div>` : ""}
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
      prev: kz ? "Артқа" : "Назад",
      next: kz ? "Алға" : "Вперёд",
      prevLabel: kz ? "Алдыңғы мысал" : "Предыдущий пример",
      nextLabel: kz ? "Келесі мысал" : "Следующий пример",
      example: kz ? "Мысал" : "Пример",
      of: kz ? "/" : "из",
      copy: kz ? "Үлгіні көшіру" : "Скопировать шаблон",
      labels: x.exampleLabels || (kz ? ["Талап", "Не істедік", "Күтілетін нәтиже", "Нақты нәтиже", "Бұл нені білдіреді"]
        : ["Требование", "Что сделали", "Ожидаемый результат", "Фактический результат", "Что это значит"])
    };
    const templateAfter = x.templateAfter ?? 2;
    const openLinks = html => html.replace(/<a href="/g, '<a target="_blank" rel="noopener" href="');
    // необязательный заполненный образец сразу под полем работы
    const sample = x.sample ? `<div class="ln-sample"><p class="ln-sample-title"><strong>${esc(x.sample.title)}</strong></p>${x.sample.note ? `<p class="ln-sample-note">${esc(x.sample.note)}</p>` : ""}<div class="ln-code"><pre>${esc(x.sample.text)}</pre></div></div>` : "";
    app.innerHTML = `<div class="wrap section ln ln-first">
      ${head}
      <section class="ln-sec ln-first-learn" aria-labelledby="first-learn-title">
        <h2 id="first-learn-title">${text.learn}</h2>
        <p class="ln-first-intro">${esc(x.intro)}</p>
        ${x.explanation.map(p => md(p, "s")).join("")}
        ${x.image ? `<figure class="ln-figure"><img src="${esc(x.image.src)}" alt="${esc(x.image.alt)}" loading="lazy"><figcaption>${esc(x.image.caption)}</figcaption></figure>` : ""}
        <div class="ln-first-links">${x.links.map(([label, href]) => `<a href="${esc(href)}" target="_blank" rel="noopener">${esc(label)} ↗</a>`).join("")}</div>
        <p class="ln-example-note">${esc(x.exampleNote)}</p>
        <div class="ln-example">
          <div class="ln-example-bar"><span class="ln-example-count"></span><div class="ln-example-controls"><button type="button" class="ln-example-prev" aria-label="${text.prevLabel}"><span aria-hidden="true">←</span> ${text.prev}</button><button type="button" class="ln-example-next" aria-label="${text.nextLabel}">${text.next} <span aria-hidden="true">→</span></button></div></div>
          <div class="ln-example-content" aria-live="polite" aria-atomic="true"></div>
        </div>
      </section>
      <section class="ln-sec ln-first-tasks" aria-labelledby="first-tasks-title">
        <h2 id="first-tasks-title">${text.tasks}</h2>
        ${x.teacher ? `<p class="ln-teacher"><strong>${kz ? 'Оқытушыға' : 'Преподавателю'}:</strong> ${openLinks(inline(x.teacher, 's'))}</p>` : ''}
        <ol>${x.tasks.map((step, i) => `<li>${openLinks(inline(step, "s"))}${i === templateAfter && x.practiceKind !== 'oral' ? (window.LEARN_PRACTICE ? window.LEARN_PRACTICE.render(x, L) : `<div class="ln-code"><pre>${esc(x.template)}</pre><button type="button" class="btn btn-ghost ln-copy">${text.copy}</button></div>`) + sample : ""}</li>`).join("")}</ol>
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
    const moveExample = direction => {
      exampleIndex = (exampleIndex + direction + x.examples.length) % x.examples.length;
      showExample();
    };
    app.querySelector(".ln-example-prev").addEventListener("click", () => moveExample(-1));
    app.querySelector(".ln-example-next").addEventListener("click", () => moveExample(1));
    wireBody(app);
    if (x.practiceKind !== 'oral') window.LEARN_PRACTICE?.bind(app, d.simple ? { ...x, workHeader: kz ? "Деңгей: кеңейтілген нұсқа" : "Уровень: продвинутая версия" } : x, L, location.hash.slice(1));
  }

  // Переключатель «Простая / Продвинутая» над парой, у которой есть простая версия.
  function levelBar() {
    const kz = L === "kz";
    const hint = level === "simple"
      ? (kz ? "Қысқаша: не үйренеміз, үлгі және тапсырма. 70 баллға дейін." : "Коротко: что изучаем, образец и задача. До 70 баллов.")
      : (kz ? "Толық сабақ: түсіндіру, мысалдар және егжей-тегжейлі қадамдар. 100 баллға дейін." : "Полный урок: объяснение, примеры и подробные шаги. До 100 баллов.");
    return `<div class="ln-level-bar"><div class="ln-mode ln-level" role="group" aria-label="${kz ? "Сабақ деңгейі" : "Уровень пары"}">
      <button type="button" data-level="simple" class="${level === "simple" ? "on" : ""}" aria-pressed="${level === "simple"}">🙂 ${kz ? "Қарапайым" : "Простая"}</button>
      <button type="button" data-level="full" class="${level === "full" ? "on" : ""}" aria-pressed="${level === "full"}">🎓 ${kz ? "Кеңейтілген" : "Продвинутая"}</button>
    </div><p class="ln-level-hint">${hint}</p></div>`;
  }

  function renderSimplePair(d, head, nav) {
    const x = d.simple[L], kz = L === "kz";
    const openLinks = html => html.replace(/<a href="/g, '<a target="_blank" rel="noopener" href="');
    const list = x.steps ? `<ol class="ln-simple-list">${x.steps.map(s => `<li>${openLinks(inline(s, "s"))}</li>`).join("")}</ol>`
      : x.options ? `<ul class="ln-simple-list">${x.options.map(s => `<li>${openLinks(inline(s, "s"))}</li>`).join("")}</ul>` : "";
    const ai = x.prompt ? `<div class="ln-ai"><p><strong>${kz ? "ЖИ-ге промпт" : "Промпт для ИИ"}</strong> — ${kz ? "кез келген тегін ЖИ-чатқа қой. ЖИ қателесуі мүмкін: жауапты іске қосып тексер." : "вставь в любой бесплатный ИИ-чат. ИИ может ошибиться: проверь ответ запуском."}</p><div class="ln-code"><pre>${esc(x.prompt)}</pre><button type="button" class="btn btn-ghost ln-copy">${kz ? "Промптты көшіру" : "Скопировать промпт"}</button></div></div>` : "";
    const hints = [...x.template.matchAll(/\([^()\n]+\)/g)].map(m => m[0]);
    const work = { template: x.template, templateHints: hints, workHeader: kz ? "Деңгей: қарапайым нұсқа" : "Уровень: простая версия" };
    const submit = kz
      ? `Дайын ба? **«Жұмысты көшіру»** бас → [Discord](https://discord.com/channels/1559176798489673840) → өз тобың → **work-chat** → **«Сдать работу»** → өз тармағыңа қойып, жібер. [Жіберу қадамдары](kb.html#start-here)`
      : `Готово? Нажми **«Скопировать работу»** → [Discord](https://discord.com/channels/1559176798489673840) → своя группа → **work-chat** → **«Сдать работу»** → вставь в свою ветку и отправь. [Как отправить по шагам](kb.html#start-here)`;
    app.innerHTML = `<div class="wrap section ln ln-first ln-simple-pair">
      ${head}
      <section class="ln-sec ln-first-learn" aria-labelledby="simple-learn-title">
        <h2 id="simple-learn-title">${kz ? "Бүгін үйренеміз" : "Сегодня изучаем"}: ${esc(x.topic)}</h2>
        ${x.learn.map(p => openLinks(md(p, "s"))).join("")}
        <h3>${kz ? "Былай жасалады" : "Делается вот так"}</h3>
        <p class="ln-sample-note">${esc(x.sample.note)}</p>
        <div class="ln-code"><pre>${esc(x.sample.text)}</pre></div>
      </section>
      <section class="ln-sec ln-first-tasks" aria-labelledby="simple-task-title">
        <h2 id="simple-task-title">${kz ? "Тапсырма" : "Задача"}</h2>
        <p>${openLinks(inline(x.task, "s"))}</p>
        ${list}
        <div class="ln-first-links">${x.links.map(([label, href]) => `<a href="${esc(href)}" target="_blank" rel="noopener">${esc(label)} ↗</a>`).join("")}</div>
        ${ai}
        ${window.LEARN_PRACTICE ? window.LEARN_PRACTICE.render(work, L) : `<div class="ln-code"><pre>${esc(x.template)}</pre></div>`}
        <p class="ln-simple-submit">${openLinks(inline(submit, "s"))}</p>
      </section>
      ${nav}
    </div>`;
    wireBody(app);
    window.LEARN_PRACTICE?.bind(app, work, L, location.hash.slice(1) + ".simple");
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
    if (d.format === "guided-first-lesson") {
      if (d.simple) {
        const withBar = head + levelBar();
        if (level === "simple") renderSimplePair(d, withBar, nav); else renderFirstLesson(d, withBar, nav);
        app.querySelectorAll("[data-level]").forEach(b => b.addEventListener("click", () => {
          if (b.dataset.level === level) return;
          level = b.dataset.level;
          save("qc_learn_level", level);
          renderPair(k, n);
        }));
      } else renderFirstLesson(d, head, nav);
      window.scrollTo(0, 0);
      return;
    }
    if (d.format === "simple-course") {
      renderSimpleLesson(d, head, nav);
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

  function renderSimpleLesson(d, head, nav) {
    const content = window.STUDY_CONTENT, x = d[L], tr = (ru, kz) => L === 'kz' ? kz : ru;
    const topic = id => content.topics.find(t => t.id === id);
    const destination = d.kind === 'api' ? `labs.html?version=${d.version}&tool=api` : d.kind === 'auto' ? `labs.html?version=${d.version}&tool=tests` : `menu.html?version=${d.version}`;
    const template = {case:'test-case',bug:'bug-report',checklist:'checklist',api:'api-test-design',auto:'playwright-basics',record:'qa-report'}[d.kind];
    const taskFormat = ['case','bug','checklist','api'].includes(d.kind) ? `<p class="ln-format-link"><a href="kb.html#${template}" target="_blank" rel="noopener">${tr('Открыть шаблон и объяснение полей', 'Үлгі мен өріс түсіндіруін ашу')} ↗</a></p>` : '';
    const submission = d.kind === 'record' ? tr('Запиши короткие ответы по трём пунктам и версию сайта.', 'Үш пунктке қысқа жауап пен сайт нұсқасын жаз.') : d.kind === 'auto' ? tr('Сохрани код, результат запуска или причину Blocked и короткий вывод.', 'Код, орындау нәтижесі не Blocked себебін, қысқа қорытындыны сақта.') : tr('Оформи результат по шаблону ниже. Необязательные поля без нужды удали.', 'Нәтижені төмендегі үлгімен жаз. Қажетсіз міндетті емес өрісті алып таста.');
    app.innerHTML = `<div class="wrap section ln ln-first ln-simple-course">${head}
      <section class="ln-sec" aria-labelledby="simple-learn"><h2 id="simple-learn">${tr('Что сегодня выучим','Бүгін не үйренеміз')}</h2>
        <p class="ln-first-intro">${esc(x.intro)}</p>
        <p class="ln-topic-hint">${tr('Нажми на каждую тему: прочитай объяснение и посмотри пример. По синей ссылке — разбор и частые ошибки. Примеры — учебные ситуации.', 'Әр тақырыпты бас: түсіндіру мен мысалды оқы. Көк сілтемеде талдау мен жиі қателер бар. Мысалдар — оқу жағдайлары.')}</p>
        <div class="ln-topic-choices" role="group" aria-label="${tr('Темы пары','Сабақ тақырыптары')}">${d.topics.map((id,i)=>`<button type="button" data-study-topic="${esc(id)}" aria-pressed="${i===0}">${esc(topic(id)[L].title)}</button>`).join('')}</div>
        <div class="ln-topic-content"></div>
        <div class="ln-example"><div class="ln-example-bar"><span class="ln-example-count"></span><div class="ln-example-controls"><button type="button" class="ln-example-prev" aria-label="${tr('Предыдущий пример','Алдыңғы мысал')}">← ${tr('Назад','Артқа')}</button><button type="button" class="ln-example-next" aria-label="${tr('Следующий пример','Келесі мысал')}">${tr('Вперёд','Алға')} →</button></div></div><div class="ln-example-content" aria-live="polite" aria-atomic="true"></div></div>
      </section>
      <section class="ln-sec ln-first-tasks" aria-labelledby="simple-tasks"><h2 id="simple-tasks">${tr('Задачи','Тапсырмалар')}</h2>
        <p><a class="ln-work-link" href="${destination}" target="_blank" rel="noopener">${tr('Открыть рабочую страницу','Жұмыс бетін ашу')} · ${esc(d.version)} ↗</a> · <a href="docs.html?version=${d.version}" target="_blank" rel="noopener">${tr('Требования','Талаптар')}</a></p>
        <ol>${x.tasks.map(t=>`<li>${inline(t,'s')}</li>`).join('')}<li>${submission} ${tr('Отправь в свою ветку','Өз тармағыңа жібер')} <a href="https://discord.com/channels/1559176798489673840" target="_blank" rel="noopener">Discord</a>: work-chat → «Сдать работу» → ${tr('ссылка бота','бот сілтемесі')}. <a href="kb.html#start-here" target="_blank" rel="noopener">${tr('Как отправить по шагам','Жіберу қадамдары')} ↗</a></li></ol>${taskFormat}
      </section>${nav}</div>`;
    let selected=d.topics[0], index=0;
    function example() {
      const rows=content.examples[selected], row=rows[index][L];
      app.querySelector('.ln-example-count').textContent=`${tr('Пример','Мысал')} ${index+1} ${tr('из','/')} ${rows.length}`;
      app.querySelector('.ln-example-content').innerHTML=`<h3>${esc(row[0])}</h3><p>${inline(row[1],'s')}</p><p class="ln-example-meaning">${inline(row[2],'s')}</p>`;
    }
    function explain() {
      const t=topic(selected), words=(t.terms||[]).map(w=>w[0]).filter(Boolean).slice(0,3).join(' · ');
      app.querySelector('.ln-topic-content').innerHTML=`<p class="ln-topic-en">${esc(words)}</p><p>${inline(t[L].short,'s')}</p><a class="ln-kb-link" href="kb.html#${esc(selected)}" target="_blank" rel="noopener">${tr('Объяснение, примеры и частые ошибки','Түсіндіру, мысалдар және жиі қателер')} ↗</a>`;
      app.querySelectorAll('[data-study-topic]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.studyTopic===selected)));
      example();
    }
    app.querySelectorAll('[data-study-topic]').forEach(b=>b.addEventListener('click',()=>{selected=b.dataset.studyTopic;index=0;explain();}));
    for(const [selector,direction] of [['.ln-example-prev',-1],['.ln-example-next',1]])app.querySelector(selector).addEventListener('click',()=>{index=(index+direction+content.examples[selected].length)%content.examples[selected].length;example();});
    explain();
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
  // Старые адреса 1 и 2 курса (ссылки в Discord) ведут на ту же тему в едином курсе.
  const OLD_ROUTES = {
    k1: [1, 2, 3, 4, 1, 5, 7, 6, 19, 14, 8, 18, 8, 9, 8, 18, 19, 20, 20, 21, 23, 23, 24, 24, 25, 26],
    k2: [1, 4, 6, 6, 9, 10, 11, 12, 12, 13, 14, 14, 15, 16, 17, 17, 18, 19, 20, 22, 22, 24, 24, 25, 25, 26]
  };
  function route() {
    const h = location.hash.slice(1);
    const old = h.match(/^(k[12])(?:-(\d+))?$/);
    if (old) {
      const n = OLD_ROUTES[old[1]][Number(old[2]) - 1];
      location.replace(n ? `#qa-${n}` : "#qa");
      return;
    }
    const m = h.match(/^(qa)-(\d+)$/);
    if (m && C[m[1]].titles[m[2]]) return renderPair(m[1], Number(m[2]));
    renderCourse("qa");
  }
  window.addEventListener("hashchange", route);
  route();
})();
