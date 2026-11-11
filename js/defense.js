/* Защита практики (defense.html): переключатель «Простой / Продвинутый» и вывод js/defense/content.js.
   Оформление берётся из классов страниц пар (css/learn.css): ln-sec, ln-level-bar, ln-variants, ln-code. */
(function () {
  "use strict";
  const load = (key, fallback) => {
    try { const raw = localStorage.getItem(key); return raw === null ? fallback : JSON.parse(raw); } catch (e) { return fallback; }
  };
  const save = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* storage unavailable */ } };
  const L = load("qc_lang", "ru") === "kz" ? "kz" : "ru";
  const D = window.DEFENSE_CONTENT, head = D[L], C = D.ru;
  const app = document.getElementById("app");
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const md = s => esc(s)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1 ↗</a>');
  const fill = (tpl, vars) => tpl.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
  const tr = (ru, kz) => (L === "kz" ? kz : ru);

  const fromHash = location.hash.slice(1);
  let mode = ["simple", "full"].includes(fromHash) ? fromHash : (load("qc_defense_mode", "simple") === "full" ? "full" : "simple");
  let copies = [];

  const paras = list => list.map(p => `<p>${md(p)}</p>`).join("");
  const items = (list, tag = "ul") => `<${tag} class="ln-simple-list">${list.map(x => `<li>${md(x)}</li>`).join("")}</${tag}>`;
  const links = list => `<div class="ln-first-links">${list.map(([label, href]) => `<a href="${esc(href)}" target="_blank" rel="noopener">${esc(label)} ↗</a>`).join("")}</div>`;
  const code = (text, label) => {
    copies.push(text);
    return `<div class="ln-code"><pre>${esc(text)}</pre><button type="button" class="btn btn-ghost ln-copy" data-copy="${copies.length - 1}">${esc(label || tr("Скопировать", "Көшіру"))}</button></div>`;
  };
  const section = (id, title, body) => `<section class="ln-sec" aria-labelledby="df-${id}"><h2 id="df-${id}">${title}</h2>${body}</section>`;

  function variantData(s) {
    const saved = Number(load("qc_defense_variant", 0));
    const idx = Number.isInteger(saved) && saved >= 0 && saved < s.variants.length ? saved : 0;
    const v = s.variants[idx];
    const vars = {
      num: idx + 1, title: v.title, n: v.steps.length, k: v.scenarios.length,
      list: v.scenarios.map((x, i) => `${i + 1}. ${x}`).join("\n"),
      inline: v.scenarios.map(x => x.replace(/\.$/, "").replace(/^./, c => c.toLowerCase())).join("; ")
    };
    const prompt = fill(s.rules, { test: v.test }) + "\n\nШаги:\n" + v.steps.map(([text, c], i) => `${i + 1}. ${text} Код: ${c}`).join("\n");
    const ready = "import { test, expect } from '@playwright/test';\n\n" +
      `test('${v.test}', async ({ page, request }) => {\n${v.steps.map(([, c]) => "  " + c).join("\n")}\n});`;
    return { idx, v, vars, prompt, ready };
  }

  function renderSimple() {
    const s = C.simple, { idx, v, vars, prompt, ready } = variantData(s);
    const bar = `<div class="ln-variant-bar"><span class="ln-variant-label">${esc(s.variantLabel)}</span><div class="ln-variants" role="group" aria-label="Вариант автотеста">${s.variants.map((x, i) =>
      `<button type="button" data-variant="${i}" class="ln-variant-btn${i === idx ? " on" : ""}" aria-pressed="${i === idx}">${i + 1}. ${esc(x.title)}</button>`).join("")}</div></div>`;
    const qa = `<p class="ln-sample-note">${md(s.qaNote)}</p><ol class="ln-simple-list df-qa">${s.qa.map(([q, a]) => `<li><p><strong>${md(q)}</strong></p><p>${md(a)}</p></li>`).join("")}</ol>`;
    return [
      section("about", tr("Что такое простой режим", "Қарапайым режим деген не"), paras(s.about) + links(s.links)),
      section("prep", esc(s.prepTitle), items(s.prep, "ol")),
      section("variant", tr("Твой автотест", "Сенің автотестің"), bar +
        `<h3>${esc(s.scenariosTitle)} (${v.steps.length} ${tr("шагов", "қадам")})</h3>` + items(v.scenarios, "ol") +
        `<h3>${esc(s.promptTitle)}</h3><p>${md(fill(s.promptNote, vars))}</p>` + code(prompt, tr("Скопировать промпт", "Промптты көшіру")) +
        `<details class="df-ready"><summary>${esc(s.codeSummary)}</summary>${code(ready, tr("Скопировать код", "Кодты көшіру"))}</details>` +
        `<h3>${esc(s.runTitle)}</h3>` + items(s.run, "ol") +
        `<h3>${esc(s.readTitle)}</h3>` + items(s.read)),
      section("result", esc(s.resultTitle), `<p class="ln-sample-note">${md(s.resultNote)}</p>` + code(fill(s.result, vars), tr("Скопировать шаблон", "Үлгіні көшіру"))),
      section("qa", esc(s.qaTitle), qa),
      section("accept", esc(s.acceptTitle), items(s.accept))
    ].join("");
  }

  function renderFull() {
    const f = C.full;
    const blocks = f.blocks.map(b => `<h3>${esc(b.title)}</h3>${items(b.need)}${links(b.links)}`).join("");
    const templates = f.templates.map(([name, text]) => `<h3>${esc(name)}</h3>${code(text, tr("Скопировать шаблон", "Үлгіні көшіру"))}`).join("");
    return [
      section("task", tr("Задание", "Тапсырма"), paras(f.about)),
      section("ask", esc(f.askTitle), `<p class="ln-sample-note">${md(f.askNote)}</p>` + items(f.ask)),
      section("blocks", esc(f.blocksTitle), `<p class="ln-sample-note">${md(f.blocksNote)}</p>` + blocks),
      section("final", esc(f.finalTitle), items(f.final, "ol")),
      section("templates", esc(f.templatesTitle), `<p class="ln-sample-note">${md(f.templatesNote)}</p>` + templates),
      section("accept", esc(f.acceptTitle), items(f.accept)),
      section("submit", esc(f.submitTitle), items(f.submit) + links(f.links))
    ].join("");
  }

  function render(keepScroll) {
    copies = [];
    const y = window.scrollY;
    const [sl, sh] = head.modes.simple, [fl, fh] = head.modes.full;
    app.innerHTML = `<div class="wrap section ln ln-first ln-two-level df">
      <div class="ln-crumbs"><a href="learn.html#qa">${tr("Уроки", "Сабақтар")}</a> › ${tr("Итоговая защита", "Қорытынды қорғау")}</div>
      <h1>${esc(head.title)}</h1>
      <p class="df-lead">${md(head.lead)}</p>
      ${head.note ? `<p class="p-callout">${md(head.note)}</p>` : ""}
      <div class="ln-level-bar"><div class="ln-mode ln-level" role="group" aria-label="${tr("Режим защиты", "Қорғау режимі")}">
        <button type="button" data-mode="simple" class="${mode === "simple" ? "on" : ""}" aria-pressed="${mode === "simple"}">${esc(sl)}</button>
        <button type="button" data-mode="full" class="${mode === "full" ? "on" : ""}" aria-pressed="${mode === "full"}">${esc(fl)}</button>
      </div><p class="ln-level-hint">${esc(mode === "simple" ? sh : fh)}</p></div>
      ${mode === "simple" ? renderSimple() : renderFull()}
    </div>`;
    app.querySelectorAll("[data-mode]").forEach(b => b.addEventListener("click", () => {
      if (b.dataset.mode === mode) return;
      mode = b.dataset.mode;
      save("qc_defense_mode", mode);
      history.replaceState(null, "", "#" + mode);
      render(true);
    }));
    app.querySelectorAll("[data-variant]").forEach(b => b.addEventListener("click", () => {
      save("qc_defense_variant", Number(b.dataset.variant));
      render(true);
    }));
    app.querySelectorAll("[data-copy]").forEach(b => b.addEventListener("click", () => {
      const text = copies[Number(b.dataset.copy)], label = b.textContent;
      const done = () => { b.textContent = tr("Скопировано ✓", "Көшірілді ✓"); setTimeout(() => { b.textContent = label; }, 1500); };
      if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, () => prompt("Ctrl+C", text));
      else prompt("Ctrl+C", text);
    }));
    if (keepScroll) window.scrollTo(0, y);
  }

  window.addEventListener("hashchange", () => {
    const h = location.hash.slice(1);
    if (["simple", "full"].includes(h) && h !== mode) { mode = h; save("qc_defense_mode", mode); render(); }
  });
  render();
})();
