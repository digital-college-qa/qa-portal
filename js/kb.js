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
      topics: "☰ Темы", blocks: { tools: "Шпаргалки", k1: "1 курс", k2: "2 курс", extra: "Дополнительно (для собеседования)" },
      short: "Коротко", when: "Когда и зачем", analogy: "Пример из жизни", body: "Подробнее", template: "Шаблон",
      example: "Пример на Qala Coffee", mistakes: "Частые ошибки", remember: "Запомни", check: "Проверь себя",
      check_hint: "Сначала ответь сам, потом нажми на вопрос.", terms: "Слова для поиска", open_shop: "Открыть в магазине →",
      copy: "Скопировать", copied: "Скопировано", read: "Я прочитал(а)", unread: "Прочитано ✓ (нажми, чтобы снять)",
      prev: "← Назад", next: "Дальше →", pairs: { k1: "1 курс, пара", k2: "2 курс, пара" }, nothing: "Ничего не найдено. Попробуй другое слово или английский термин.",
      gl_title: "Глоссарий", gl_note: "Все термины базы: английский, русский, казахский. Нажми на тему, чтобы прочитать подробно.",
      gl_head: ["English", "Русский", "Қазақша", "Тема"], soon: "Тема появится позже.",
      welcome_title: "База знаний по тестированию", welcome: "Слева — все темы курса по порядку пар: сверху то, что проходим раньше, снизу — позже. Нажми на тему, чтобы открыть. Не помнишь, где тема? Напиши слово в поиске — на русском, казахском или английском."
    },
    kz: {
      title: "Білім қоры", search: "Іздеу: чек-лист, bug, қате…", found: "Табылды", ctrlf: "<b>Ctrl+F</b> — ашық беттен сөз табу. Жоғарыдағы іздеу — бүкіл қордан тақырып табу.",
      topics: "☰ Тақырыптар", blocks: { tools: "Анықтамалар", k1: "1 курс", k2: "2 курс", extra: "Қосымша (сұхбатқа арналған)" },
      short: "Қысқаша", when: "Қашан және не үшін", analogy: "Өмірден мысал", body: "Толығырақ", template: "Үлгі",
      example: "Qala Coffee мысалы", mistakes: "Жиі кездесетін қателер", remember: "Есте сақта", check: "Өзіңді тексер",
      check_hint: "Алдымен өзің жауап бер, содан кейін сұрақты бас.", terms: "Іздеуге арналған сөздер", open_shop: "Дүкеннен ашу →",
      copy: "Көшіру", copied: "Көшірілді", read: "Оқыдым", unread: "Оқылды ✓ (алып тастау үшін бас)",
      prev: "← Артқа", next: "Әрі қарай →", pairs: { k1: "1 курс, сабақ", k2: "2 курс, сабақ" }, nothing: "Ештеңе табылмады. Басқа сөзді немесе ағылшын терминін жазып көр.",
      gl_title: "Глоссарий", gl_note: "Қордағы барлық терминдер: ағылшын, орыс, қазақ тілдерінде. Толық оқу үшін тақырыпты бас.",
      gl_head: ["English", "Орысша", "Қазақша", "Тақырып"], soon: "Тақырып кейін қосылады.",
      welcome_title: "Тестілеу бойынша білім қоры", welcome: "Сол жақта — курстың барлық тақырыбы сабақтар ретімен: жоғарыда ертерек өтетініміз, төменде — кейінірек. Ашу үшін тақырыпты бас. Тақырып қайда екенін ұмыттың ба? Іздеуге сөз жаз — орысша, қазақша немесе ағылшынша."
    }
  };
  const u = k => UI[lang()][k];

  const ORDER = ["tools", "k1", "k2", "extra"];
  const topics = (window.KB || []).slice().sort((a, b) =>
    ORDER.indexOf(a.block) - ORDER.indexOf(b.block) || (a.n == null ? -1 : a.n) - (b.n == null ? -1 : b.n));
  const byId = id => topics.find(x => x.id === id);
  const readSet = () => new Set(load("qc_kb_read", []));

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
    const parts = [tp.ru.title, tp.kz.title, JSON.stringify(tp[lang()])];
    (tp.terms || []).forEach(t => parts.push(t.join(" ")));
    return parts.join(" ").toLowerCase();
  }

  /* ---------- layout ---------- */
  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="kb wrap">
      <button class="btn btn-small kb-toggle" type="button" id="kb-toggle">${u("topics")}</button>
      <aside class="kb-side" id="kb-side">
        <input id="kb-q" class="kb-search" type="search" placeholder="${esc(u("search"))}">
        <p class="kb-hint">${u("ctrlf")}</p>
        <nav id="kb-nav"></nav>
      </aside>
      <article class="kb-main" id="kb-main"></article>
    </div>`;

  function drawNav(filter) {
    const done = readSet();
    const q = (filter || "").trim().toLowerCase();
    const current = location.hash.slice(1);
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
      html += `<div class="kb-block">${u("blocks")[block]}</div>` + list.map(link).join("");
    });
    document.getElementById("kb-nav").innerHTML = html || `<p class="muted">${u("nothing")}</p>`;
  }

  function copyBtn(text) {
    return `<button class="btn btn-small btn-ghost kb-copy" type="button" data-copy="${esc(text)}">${u("copy")}</button>`;
  }

  function drawTopic(tp) {
    const c = tp[lang()];
    const idx = topics.indexOf(tp);
    const prev = topics[idx - 1], next = topics[idx + 1];
    const done = readSet().has(tp.id);
    const sec = (key, html, cls) => html ? `<section class="kb-sec ${cls || ""}"><h2>${u(key)}</h2>${html}</section>` : "";
    document.getElementById("kb-main").innerHTML = `
      <div class="kb-meta">${esc(pairsText(tp))}</div>
      <h1>${esc(label(tp))}</h1>
      ${sec("short", md(c.short), "kb-short")}
      ${sec("when", md(c.when))}
      ${sec("analogy", md(c.analogy), "kb-analogy")}
      ${sec("body", md(c.body))}
      ${c.template ? sec("template", `<div class="kb-tpl"><pre class="kb-pre">${esc(c.template)}</pre>${copyBtn(c.template)}</div>`) : ""}
      ${sec("example", md(c.example) + (c.exampleLink ? `<p><a class="btn btn-small" href="${c.exampleLink.href}" target="_blank">${esc(c.exampleLink.label || u("open_shop"))}</a></p>` : ""), "kb-example")}
      ${sec("mistakes", c.mistakes && c.mistakes.length ? `<ul>${c.mistakes.map(m => `<li>${inline(m)}</li>`).join("")}</ul>` : "")}
      ${c.remember ? `<div class="kb-remember"><b>${u("remember")}:</b> ${inline(c.remember)}</div>` : ""}
      ${sec("check", c.check && c.check.length ? `<p class="muted">${u("check_hint")}</p>` + c.check.map(([q, a]) => `<details class="kb-q"><summary>${inline(q)}</summary><div>${md(a)}</div></details>`).join("") : "")}
      ${tp.terms && tp.terms.length ? `<p class="kb-terms"><b>${u("terms")}:</b> ${tp.terms.map(t => esc(t.filter(Boolean).join(" / "))).join(" · ")}</p>` : ""}
      <div class="kb-foot">
        <button class="btn ${done ? "btn-ghost" : ""}" id="kb-read" type="button">${done ? u("unread") : u("read")}</button>
        <span>${prev ? `<a href="#${prev.id}">${u("prev")}</a>` : ""} ${next ? `<a href="#${next.id}">${u("next")}</a>` : ""}</span>
      </div>`;
    document.getElementById("kb-read").addEventListener("click", () => {
      const s = readSet();
      if (s.has(tp.id)) s.delete(tp.id); else s.add(tp.id);
      save("qc_kb_read", [...s]);
      drawTopic(tp);
      drawNav(document.getElementById("kb-q").value);
    });
  }

  function drawGlossary() {
    const rows = [];
    topics.forEach(tp => (tp.terms || []).forEach(t => rows.push([t[0], t[1], t[2], tp])));
    rows.sort((a, b) => (a[0] || a[1]).localeCompare(b[0] || b[1], "en"));
    document.getElementById("kb-main").innerHTML = `
      <h1>📖 ${u("gl_title")}</h1>
      <p class="muted">${u("gl_note")}</p>
      <div class="kb-tablewrap"><table class="kb-table"><thead><tr>${u("gl_head").map(h => `<th>${h}</th>`).join("")}</tr></thead><tbody>
      ${rows.map(([en, ru, kz, tp]) => `<tr><td>${esc(en || "—")}</td><td>${esc(ru || "—")}</td><td>${esc(kz || "—")}</td><td><a href="#${tp.id}">${esc(label(tp))}</a></td></tr>`).join("")}
      </tbody></table></div>`;
  }

  function route() {
    const id = location.hash.slice(1);
    const tp = byId(id);
    if (id === "glossary") drawGlossary();
    else if (tp) drawTopic(tp);
    else document.getElementById("kb-main").innerHTML = `<h1>${u("welcome_title")}</h1><p class="kb-short">${u("welcome")}</p>`;
    drawNav(document.getElementById("kb-q").value);
    document.getElementById("kb-side").classList.remove("open");
    window.scrollTo(0, 0);
  }

  document.getElementById("kb-q").addEventListener("input", e => drawNav(e.target.value));
  document.getElementById("kb-toggle").addEventListener("click", () => document.getElementById("kb-side").classList.toggle("open"));
  document.getElementById("kb-main").addEventListener("click", e => {
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
