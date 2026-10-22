/* Presentation only: the shared requirements remain the source of truth. No fetch,
   so this page also works when opened directly from the student's local folder. */
(function () {
  "use strict";
  const esc = value => String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const groups = [
    ["navigation", ["NAV"], "Навигация", "Навигация"],
    ["menu", ["CAT", "FIL", "SRC"], "Меню и поиск", "Мәзір және іздеу"],
    ["product", ["PRD", "CMB", "FAV"], "Выбор товара", "Тауарды таңдау"],
    ["cart", ["CRT"], "Корзина", "Себет"],
    ["order", ["ORD", "TIM", "DEL"], "Заказ и доставка", "Тапсырыс және жеткізу"],
    ["account", ["ACC", "PRO"], "Аккаунт и профиль", "Аккаунт және профиль"],
    ["offers", ["PRM", "LOY", "DSC"], "Акции и скидки", "Акциялар және жеңілдіктер"],
    ["reviews", ["REV"], "Отзывы", "Пікірлер"],
    ["interface", ["LOC", "UI"], "Язык и внешний вид", "Тіл және сыртқы көрініс"],
    ["tools", ["API", "LAB", "OBS"], "API, автотесты и журнал", "API, автотесттер және журнал"]
  ];

  function render(app, version, kz) {
    const tr = (ru, kk) => kz ? kk : ru;
    const rules = QARequirements.rules(version);
    const sections = groups.map(([key, prefixes, ru, kk]) => ({key, title: kz ? kk : ru,
      rules: rules.filter(([id]) => prefixes.includes(id.split("-")[0]))})).filter(g => g.rules.length);
    if (version === "1.0") sections.find(g => g.key === "menu").title = tr("Меню", "Мәзір");
    if (version === "1.5") {
      sections.find(g => g.key === "tools").title = tr("Учебный API", "Оқу API-ы");
      sections.find(g => g.key === "offers").title = tr("Скидки", "Жеңілдіктер");
    }
    if (version === "2.0") sections.find(g => g.key === "offers").title = tr("Акции и баллы", "Акциялар және ұпайлар");
    // Keep any future rule visible even if its prefix has not been grouped yet.
    const assigned = new Set(sections.flatMap(g => g.rules.map(([id]) => id)));
    const remaining = rules.filter(([id]) => !assigned.has(id));
    if (remaining.length) sections.push({key:"other", title:tr("Другие правила", "Басқа ережелер"), rules:remaining});
    const coverage = version === "1.0"
      ? tr("Описано 14 из 20 правил — 70%. Если нужного правила нет, уточни его у ментора в Discord.", "20 ережеден 14-і сипатталған — 70%. Қажетті ереже болмаса, Discord-та ментордан нақтыла.")
      : version === "1.5"
        ? tr("Точные требования ко всем функциям версии 1.5.", "1.5 нұсқасының барлық функциясына нақты талаптар берілген.")
        : tr("Все разделы описаны. Обобщённые слова уточняй у ментора. Версия 2.0 ещё в разработке.", "Барлық бөлім сипатталған. Жалпы сөздерді ментордан нақтыла. 2.0 нұсқасы әлі әзірленуде.");
    app.innerHTML = `<div class="wrap section requirements-page">
      <div class="requirements-heading">
        <div><p class="requirements-eyebrow">qala coffe · ${tr("ПРАВИЛА САЙТА", "САЙТ ЕРЕЖЕЛЕРІ")}</p>
          <h1>${tr("Требования", "Талаптар")}</h1>
          <p class="requirements-lead">${tr("Как должна работать кофейня. Сравнивай с этими правилами то, что видишь на сайте.", "Кофехана қалай жұмыс істеуі керек. Сайтта көргеніңді осы ережелермен салыстыр.")}</p></div>
        <div class="requirements-actions">
          <label for="requirements-version">${tr("Версия кофейни", "Кофехана нұсқасы")}</label>
          <select id="requirements-version">${Object.entries(QAVersions.releases).map(([v, release]) => `<option value="${v}"${v === version ? " selected" : ""}>${v} · ${esc(release.title[kz ? 1 : 0])}</option>`).join("")}</select>
          <a class="btn btn-ghost" href="menu.html?version=${version}">${tr("Открыть кофейню", "Кофехананы ашу")} ↗</a>
        </div>
      </div>
      <p class="requirements-coverage"><span class="requirements-version-badge">v${version}</span> ${coverage}</p>
      <div class="requirements-toolbar">
        <label for="requirements-search">${tr("Найти правило", "Ережені табу")}</label>
        <div class="requirements-search-row">
          <input id="requirements-search" type="search" autocomplete="off" placeholder="${tr("CAT-02 или «корзина»", "CAT-02 немесе «себет»")}" aria-controls="requirements-list">
          <button class="requirements-clear" type="button" hidden>${tr("Сбросить поиск", "Іздеуді тазарту")}</button>
        </div>
        <p class="requirements-count" role="status" aria-live="polite"></p>
      </div>
      <nav class="requirements-jumps" aria-label="${tr("Разделы требований", "Талап бөлімдері")}">${sections.map(g => `<a href="#requirements-${g.key}" data-group-link="${g.key}">${g.title}</a>`).join("")}</nav>
      <div id="requirements-list">${sections.map(g => `<section class="requirements-group" data-group="${g.key}" aria-labelledby="requirements-${g.key}">
        <h2 id="requirements-${g.key}">${g.title}</h2>
        <div class="requirements-cards">${g.rules.map(([id, ru, kk]) => `<article class="requirements-rule" id="req-${id}" data-rule>
          <a class="requirements-rule-id" href="#req-${id}" aria-label="${tr("Правило", "Ереже")} ${id}">${id}</a>
          <p>${esc(kz ? kk : ru)}</p>
        </article>`).join("")}</div>
      </section>`).join("")}</div>
      <div class="requirements-empty" hidden><p>${tr("Ничего не найдено. Попробуй номер правила или другое слово.", "Ештеңе табылмады. Ереже нөмірін немесе басқа сөзді қолданып көр.")}</p></div>
      <div class="requirements-journal"></div>
    </div>`;

    // The public training account stays exactly as described in the shared document.
    if (version === "2.0") {
      const original = document.createElement("div");
      original.innerHTML = QARequirements.html(version, kz);
      const access = original.querySelector(".requirement h3")?.parentElement;
      if (access) {
        access.className = "requirements-access";
        app.querySelector(".requirements-journal").append(access);
      }
    }
    const input = app.querySelector("#requirements-search");
    const clear = app.querySelector(".requirements-clear");
    const cards = Array.from(app.querySelectorAll("[data-rule]"));
    const normalize = text => text.toLocaleLowerCase().replace(/[\s\u2010-\u2015-]+/g, " ").trim();
    const searchable = cards.map(card => [card, normalize(card.textContent + " " + card.closest("[data-group]").querySelector("h2").textContent)]);
    const filter = () => {
      const words = normalize(input.value).split(" ").filter(Boolean);
      let shown = 0;
      searchable.forEach(([card, text]) => {
        card.hidden = !words.every(word => text.includes(word));
        if (!card.hidden) shown++;
      });
      app.querySelectorAll("[data-group]").forEach(group => {
        group.hidden = !group.querySelector("[data-rule]:not([hidden])");
        app.querySelector(`[data-group-link="${group.dataset.group}"]`).hidden = group.hidden;
      });
      clear.hidden = !input.value;
      app.querySelector(".requirements-empty").hidden = shown !== 0;
      app.querySelector(".requirements-count").textContent = words.length
        ? tr(`Найдено: ${shown} из ${rules.length}`, `Табылды: ${shown} / ${rules.length}`)
        : tr(`Всего правил: ${rules.length}`, `Барлығы ${rules.length} ереже`);
    };
    input.addEventListener("input", filter);
    clear.addEventListener("click", () => { input.value = ""; filter(); input.focus(); });
    filter();
    app.querySelector("#requirements-version").addEventListener("change", event => {
      QAVersions.select(event.target.value);
      const url = new URL(location.href);
      url.searchParams.set("version", event.target.value);
      url.hash = "";
      location.href = url.href;
    });
    if (location.hash) {
      const target = document.getElementById(location.hash.slice(1));
      if (target && app.contains(target)) requestAnimationFrame(() => target.scrollIntoView({block:"start"}));
    }
  }
  window.QARequirementsPage = {render};
})();
