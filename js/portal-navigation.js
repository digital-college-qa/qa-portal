/* One navigation renderer shared by portal pages and standalone coffee pages. */
(function () {
  "use strict";
  const revision = "20261021-testdata30";
  const lang = () => QAVersions.read("qc_lang", "ru") === "kz" ? "kz" : "ru";
  const version = () => QAVersions.current;
  const save = (key, value) => QAVersions.write(key, value);
  const labels = {
    portal: ["QA Portal", "QA Portal"], learn: ["Уроки", "Сабақтар"],
    kb: ["База знаний", "Білім қоры"], docs: ["Требования", "Талаптар"],
    data: ["Тестовые данные", "Тест деректері"], releases: ["Релизы", "Релиздер"],
    labs: ["Лаборатория", "Зертхана"]
  };
  const t = key => labels[key][lang() === "kz" ? 1 : 0];
  function stampLinks(root) {
    root.querySelectorAll("a[href]").forEach(link => {
      const url = new URL(link.getAttribute("href"), location.href);
      if (url.origin !== location.origin) return;
      url.searchParams.set("ui", revision);
      link.setAttribute("href", url.pathname + url.search + url.hash);
    });
  }
  function render(active, root = document.getElementById("header")) {
    const kk = lang() === "kz", tr = (ru, kz) => kk ? kz : ru;
    const icons = {
      hub: '<path d="m3 10 9-7 9 7v10H4V10m5 10v-7h6v7"/>',
      learn: '<path d="m2 8 10-5 10 5-10 5zm4 3v6c4 3 8 3 12 0v-6m4-3v8"/>',
      kb: '<path d="M12 5c-3-2-6-2-10-1v15c4-1 7-1 10 1 3-2 6-2 10-1V4c-4-1-7-1-10 1zm0 0v15"/>',
      shop: '<path d="M4 8h12v7a6 6 0 0 1-12 0zm12 1h2a3 3 0 0 1 0 6h-2M3 22h15M7 2v3m5-3v3"/>',
      docs: '<path d="M5 3h9l5 5v13H5zm9 0v6h5M8 13h8m-8 4h6"/>',
      data: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 4 16 4 16 0V5M4 12c0 4 16 4 16 0"/>',
      releases: '<path d="M8 3v12a4 4 0 1 0 4 4M8 8h8V3m0 5 4-4m-4 4-4-4"/>',
      labs: '<path d="m7 6-5 6 5 6m10-12 5 6-5 6m-3-15-4 18"/>'
    };
    const icon = id => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[id]}</svg>`;
    const items = [["index.html", tr("Главная", "Басты бет"), "hub"], ["learn.html", t("learn"), "learn"], ["kb.html", t("kb"), "kb"]];
    const project = [
      ["home.html", "shop", tr("Сайт, который тестируем", "Біз тестілейтін сайт")],
      ["docs.html", "docs", tr("Как должно работать", "Қалай жұмыс істеуі керек")],
      ["testdata.html", "data", tr("Данные для проверок", "Тексеру деректері")],
      ["releases.html", "releases", tr("Версии и изменения", "Нұсқалар мен өзгерістер")],
      ["labs.html", "labs", tr("API, тесты и журнал", "API, тесттер және журнал")]
    ];
    const inProject = project.some(([, id]) => active === id);
    root.innerHTML = `
      <div class="wrap p-head">
        <a class="p-logo" href="index.html"><span class="logo-mark">Q</span> ${t("portal")}</a>
        <nav class="p-nav" aria-label="${tr("Основная навигация", "Негізгі навигация")}">
          ${items.map(([href, title, id]) => `<a href="${href}" class="p-nav-link ${active === id ? "active" : ""}" ${active === id ? 'aria-current="page"' : ''}>${icon(id)}<span>${title}</span></a>`).join("")}
          <div class="p-project">
            <button class="p-project-toggle ${inProject ? "active" : ""}" id="project-toggle" type="button" aria-expanded="false" aria-controls="project-panel">${icon("shop")}<span>qala coffe</span><svg class="p-chevron" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m4 6 4 4 4-4" stroke="currentColor" stroke-width="1.7"/></svg></button>
            <section id="project-panel" class="p-project-panel" aria-labelledby="project-title" hidden>
              <div class="p-project-intro"><span class="p-project-badge">${tr("УЧЕБНЫЙ ПРОЕКТ", "ОҚУ ЖОБАСЫ")}</span><h2 id="project-title">qala coffe <span>☕</span></h2><p>${tr("Кофейня и всё для её тестирования. Выбери, с чего начать.", "Кофехана және оны тестілеуге қажеттінің бәрі. Неден бастайтыныңды таңда.")}</p><span class="p-project-version">${tr("Текущая версия", "Ағымдағы нұсқа")} <b data-project-version>${version()}</b></span></div>
              <div class="p-project-links">${project.map(([href, id, note]) => `<a href="${href}" class="p-project-link ${active === id ? "active" : ""}" ${active === id ? 'aria-current="page"' : ''}>${icon(id)}<span><strong>${id === "shop" ? tr("Открыть кофейню", "Кофехананы ашу") : t(id === "data" ? "data" : id)}</strong><small>${note}</small></span><span class="p-link-arrow" aria-hidden="true">↗</span></a>`).join("")}</div>
            </section>
          </div>
        </nav>
        <div class="lang" role="group" aria-label="${tr("Язык портала", "Портал тілі")}">
          <button type="button" data-lang="ru" aria-pressed="${lang() === "ru"}" class="${lang() === "ru" ? "on" : ""}">RU</button>
          <button type="button" data-lang="kz" aria-pressed="${lang() === "kz"}" class="${lang() === "kz" ? "on" : ""}">KZ</button>
        </div>
      </div>
      ${inProject ? `<div class="p-project-context"><div class="wrap"><span class="p-context-label">qala coffe <b data-project-version>v${version()}</b></span><nav aria-label="${tr("Разделы проекта qala coffe", "qala coffe жобасының бөлімдері")}">${project.map(([href, id]) => `<a href="${href}" ${active === id ? 'aria-current="page"' : ''}>${icon(id)}${id === "shop" ? tr("Кофейня", "Кофехана") : t(id === "data" ? "data" : id)}</a>`).join("")}</nav></div></div>` : ''}`;
    stampLinks(root);
    const toggle = root.querySelector("#project-toggle"), panel = root.querySelector("#project-panel");
    const setOpen = open => { panel.hidden = !open; toggle.setAttribute("aria-expanded", String(open)); };
    toggle.addEventListener("click", () => setOpen(panel.hidden));
    toggle.addEventListener("keydown", e => {
      if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); panel.querySelector("a").focus(); }
    });
    root.addEventListener("keydown", e => {
      if (e.key === "Escape" && !panel.hidden) { setOpen(false); toggle.focus(); }
    });
    document.addEventListener("click", e => { if (!e.target.closest(".p-project")) setOpen(false); });
    root.addEventListener("focusout", e => { if (!root.querySelector(".p-project").contains(e.relatedTarget)) setOpen(false); });
    root.querySelectorAll(".lang button").forEach(b => b.addEventListener("click", () => {
      save("qc_lang", b.dataset.lang);
      location.reload();
    }));
    const measure = () => {
      document.documentElement.style.setProperty("--portal-header-height", `${root.offsetHeight}px`);
      const context = root.querySelector('.p-project-context nav');
      const current = context?.querySelector('[aria-current="page"]');
      if (current) context.scrollLeft = current.offsetLeft - context.offsetLeft - (context.clientWidth - current.offsetWidth) / 2;
    };
    measure();
    if (window.ResizeObserver) new ResizeObserver(measure).observe(root);
  }

  window.QAPortalNavigation = Object.freeze({ render, revision });
  // The lab owns the outer shell, including the runner's live shop preview.
  if (document.body.classList.contains("coffee-release") &&
      !document.body.classList.contains("shop-embedded") && !window.__QA_RUNNER && window.parent === window) {
    const shell = document.createElement("div");
    shell.className = "portal-shell";
    const root = document.createElement("header");
    root.id = "portal-header";
    shell.append(root);
    document.body.prepend(shell);
    render("shop", root);
  }
})();
