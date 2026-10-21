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
  const version = () => QAVersions.current;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const T = {
    ru: {
      portal: "QA Portal",
      home: "Главная портала",
      shop: "Магазин", learn: "Уроки", kb: "База знаний", docs: "Требования", data: "Тестовые данные", releases: "Релизы", labs: "Лаборатория",
      hub_title: "QA Portal",
      hub_sub: "Здесь всё для тестирования сайта кофейни qala coffe: сам сайт, требования заказчика, тестовые данные и версии.",
      hub_version: "Сейчас на стенде: <b>версия {v}</b>. Сменить версию — в разделе «Релизы».",
      tiles: [
        ["home.html", "🛒", "Магазин", "Сайт кофейни, который мы тестируем."],
        ["learn.html", "🎓", "Уроки", "Все пары курса по этапам: просто или подробно, словарь EN · RU · KZ."],
        ["kb.html", "📚", "База знаний", "Понятные темы, инструменты QA и пошаговые инструкции для практики."],
        ["docs.html", "📄", "Требования", "Правила выбранной версии. Макеты выдаёт ментор отдельно."],
        ["testdata.html", "🧪", "Тестовые данные", "Email, пароли, телефоны, промокод и длинные тексты для проверок."],
        ["releases.html", "🔁", "Релизы", "Версии сайта: что исправили и что добавили. Здесь выбирается версия."],
        ["labs.html", "🔌", "API и автотесты", "Окна инструментов поверх кофейни. Отправь запрос — увидишь результат на сайте."]
      ],
      reset_title: "Начать с чистого листа",
      reset_text: "Удалить мои аккаунты, корзину и заказы на этом компьютере. Язык и выбранная версия сохранятся.",
      reset_btn: "Сбросить мои данные",
      reset_confirm: "Удалить все аккаунты, корзину и заказы на этом компьютере?",
      reset_done: "Готово: данные сброшены.",
      // docs
      docs_title: "Требования заказчика (ТЗ)",
      docs_meta: "Версия документа 1.0 · составил ментор со слов заказчика",
      docs_note: "Если в ТЗ чего-то нет или написано непонятно — не угадывай, а задай вопрос ментору.",
      mock_title: "Макеты экранов",
      mock_note: "Макеты нарисовал дизайнер до разработки. Серые блоки — места для картинок и текста.",
      // data
      data_title: "Тестовые данные",
      data_note: "Не используй настоящую почту и настоящие пароли — только данные со страницы или придуманные.",
      copy: "Скопировать", copied: "Скопировано",
      long_title: "Длинные тексты",
      long_text: "Текст на {n} символов",
      // releases
      rel_title: "Релизы",
      rel_switch: "Какую версию тестируем",
      rel_current: "текущая",
      rel_apply: "Переключить",
      rel_switched: "Версия {v} включена. Открой магазин — в серой полосе сверху будет номер версии.",
      fixed: "Исправлено", added: "Новое", planned: "В разработке"
    },
    kz: {
      portal: "QA Portal",
      home: "Порталдың басты беті",
      shop: "Дүкен", learn: "Сабақтар", kb: "Білім қоры", docs: "Талаптар", data: "Тест деректері", releases: "Релиздер", labs: "Зертхана",
      hub_title: "QA Portal",
      hub_sub: "qala coffe кофеханасының сайтын тестілеуге қажеттінің бәрі осында: сайттың өзі, тапсырыс берушінің талаптары, тест деректері және нұсқалар.",
      hub_version: "Қазір стендте: <b>{v} нұсқа</b>. Нұсқаны «Релиздер» бөлімінде ауыстыруға болады.",
      tiles: [
        ["home.html", "🛒", "Дүкен", "Біз тестілейтін кофехана сайты."],
        ["learn.html", "🎓", "Сабақтар", "Курстың барлық сабағы кезеңдер бойынша: қарапайым немесе толық, EN · RU · KZ сөздігі."],
        ["kb.html", "📚", "Білім қоры", "Түсінікті тақырыптар, QA құралдары және тәжірибеге арналған қадамдық нұсқаулықтар."],
        ["docs.html", "📄", "Талаптар", "Таңдалған нұсқа ережелері. Макетті ментор бөлек береді."],
        ["testdata.html", "🧪", "Тест деректері", "Тексеруге арналған email, құпиясөздер, телефондар, промокод және ұзын мәтіндер."],
        ["releases.html", "🔁", "Релиздер", "Сайт нұсқалары: не түзетілді, не қосылды. Нұсқа осында таңдалады."],
        ["labs.html", "🔌", "API және автотесттер", "Құралдар кофехананың үстінде. Сұраныс жібер — нәтижесін сайттан көр."]
      ],
      reset_title: "Таза парақтан бастау",
      reset_text: "Осы компьютердегі аккаунттарымды, себетімді және тапсырыстарымды өшіру. Тіл мен таңдалған нұсқа сақталады.",
      reset_btn: "Деректерімді тазарту",
      reset_confirm: "Осы компьютердегі барлық аккаунттарды, себетті және тапсырыстарды өшіру керек пе?",
      reset_done: "Дайын: деректер тазартылды.",
      docs_title: "Тапсырыс берушінің талаптары (ТТ)",
      docs_meta: "Құжат нұсқасы 1.0 · ментор тапсырыс берушінің сөзінен жазды",
      docs_note: "ТТ-да бірдеңе жоқ болса немесе түсініксіз жазылса — болжама, менторға сұрақ қой.",
      mock_title: "Экран макеттері",
      mock_note: "Макеттерді дизайнер әзірлеуге дейін салған. Сұр блоктар — сурет пен мәтінге арналған орындар.",
      data_title: "Тест деректері",
      data_note: "Нақты поштаңды және нақты құпиясөздеріңді қолданба — тек осы беттегі немесе ойдан шығарылған деректер.",
      copy: "Көшіру", copied: "Көшірілді",
      long_title: "Ұзын мәтіндер",
      long_text: "{n} таңбалы мәтін",
      rel_title: "Релиздер",
      rel_switch: "Қай нұсқаны тестілейміз",
      rel_current: "ағымдағы",
      rel_apply: "Ауыстыру",
      rel_switched: "{v} нұсқа қосылды. Дүкенді аш — жоғарыдағы сұр жолақта нұсқа нөмірі тұрады.",
      fixed: "Түзетілді", added: "Жаңа", planned: "Әзірленуде"
    }
  };
  const t = (k, vars) => {
    let s = T[lang()][k];
    if (vars) Object.keys(vars).forEach(x => { s = s.split("{" + x + "}").join(vars[x]); });
    return s;
  };

  const DATA = {
    ru: [
      ["Email для регистрации", [["test1@example.com", ""], ["test2@example.com", ""], ["Test1@Example.com", "тот же email, но с заглавными буквами"], ["test1example.com", "без @"]]],
      ["Пароли", [["abc", "3 символа"], ["Qwer", "4 символа"], ["Qwerty1", "7 символов"], ["Qwerty12", "8 символов"], ["Qwerty123", "9 символов"]]],
      ["Телефоны", [["+7 701 123 45 67", ""], ["87011234567", ""], ["абвгд", "буквы"], ["123", "слишком короткий"]]],
      ["Адрес доставки", [["г. Алматы, ул. Сатпаева, 22, кв. 5", ""]]],
      ["Промокод из рассылки кофейни", [["KOFE10", ""], ["kofe10", "тот же, маленькими буквами"]]],
      ["Размеры экрана", [["375 × 812", "телефон"], ["768 × 1024", "планшет"], ["1280 × 800", "компьютер"]]],
    ],
    kz: [
      ["Тіркелуге арналған email", [["test1@example.com", ""], ["test2@example.com", ""], ["Test1@Example.com", "сол email, бірақ бас әріптермен"], ["test1example.com", "@ жоқ"]]],
      ["Құпиясөздер", [["abc", "3 таңба"], ["Qwer", "4 таңба"], ["Qwerty1", "7 таңба"], ["Qwerty12", "8 таңба"], ["Qwerty123", "9 таңба"]]],
      ["Телефондар", [["+7 701 123 45 67", ""], ["87011234567", ""], ["абвгд", "әріптер"], ["123", "тым қысқа"]]],
      ["Жеткізу мекенжайы", [["Алматы қ., Сәтбаев к-сі, 22, 5-пәтер", ""]]],
      ["Кофехана таратқан промокод", [["KOFE10", ""], ["kofe10", "сол промокод, кіші әріптермен"]]],
      ["Экран өлшемдері", [["375 × 812", "телефон"], ["768 × 1024", "планшет"], ["1280 × 800", "компьютер"]]],
    ]
  };
  const SCREEN_HOWTO = {
    ru: "Как включить размер телефона в Chrome или Edge: F12 → Ctrl+Shift+M → вверху выбрать размер. Браузеры для проверки: Chrome, Edge, Firefox — используй доступные браузеры и записывай их фактические версии.",
    kz: "Chrome немесе Edge-те телефон өлшемін қосу: F12 → Ctrl+Shift+M → жоғарыдан өлшемді таңда. Тексеруге арналған браузерлер: Chrome, Edge, Firefox — қолжетімді браузерді қолдан, нақты нұсқасын жаз."
  };

  const pages = {};

  pages.hub = function (app) {
    const kk = lang() === "kz";
    const tr = (ru, kz) => kk ? kz : ru;
    app.innerHTML = `
      <section class="wrap hub">
        <div class="hub-hero">
          <div class="hub-hero-copy"><span class="hub-eyebrow"><i></i> ${tr("ТВОЯ ТЕРРИТОРИЯ ПРАКТИКИ", "СЕНІҢ ПРАКТИКА АЛАҢЫҢ")}</span>
          <h1>${tr("Любопытство.<br>Практика.<br><em>Твой первый баг.</em>", "Қызығушылық.<br>Практика.<br><em>Алғашқы багың.</em>")}</h1>
          <p>${tr("Здесь учатся замечать то, что другие пропустили. Исследуй кофейню, отправляй запросы и запускай тесты — всё в одной лаборатории.", "Басқалар байқамағанды көруді үйрен. Кофехананы зертте, сұраныс жібер, тест іске қос — бәрі бір зертханада.")}</p>
          <div class="hub-cta"><a class="btn hub-primary" href="labs.html">${tr("Открыть лабораторию", "Зертхананы ашу")} <span>↗</span></a><a class="hub-secondary" href="learn.html#k1">${tr("Начать с уроков", "Сабақтардан бастау")} <span>→</span></a></div>
          <div class="hub-details"><span><i class="mint-dot"></i> ${tr("Без внешних аккаунтов для API", "API үшін сыртқы аккаунтсыз")}</span><span>RU + KZ</span></div>
          </div>
          <div class="hub-playground" aria-label="${tr("Схема: запрос меняет цену товара", "Сызба: сұраныс тауар бағасын өзгертеді")}">
            <div class="hero-orbit orbit-one"></div><div class="hero-orbit orbit-two"></div><div class="hero-spark spark-one">✳</div><div class="hero-spark spark-two">+</div>
            <div class="hero-float float-request"><div class="mini-title"><span class="mini-dots">● ● ●</span> request.http</div><div class="mini-request"><b>PATCH</b> /products/3</div><code>{ "price": <span>1800</span> }</code><div class="mini-send">Send <span>↗</span></div></div>
            <div class="hero-flow"><i></i><i></i><i></i><span>→</span></div>
            <div class="hero-float float-coffee"><div class="coffee-symbol"><svg viewBox="0 0 100 100" fill="none" aria-hidden="true"><path d="M26 40h45v22a21 21 0 0 1-42 0z" fill="#FEF5E9" stroke="#3B3054" stroke-width="3"/><path d="M71 44h5c16 0 16 24-5 24M22 86h55M43 17c-12 10 10 10 0 20M56 12c-12 10 10 10 0 20" stroke="#3B3054" stroke-width="3" stroke-linecap="round"/></svg></div><strong>${tr("Капучино", "Капучино")}</strong><span class="mini-coffee-sub">qala coffe</span><div class="mini-price"><del>1 200 ₸</del><b>1 800 ₸</b></div><div class="mini-updated"><i></i> ${tr("Обновлено через API", "API арқылы жаңарды")}</div></div>
            <div class="hero-float float-passed"><span class="passed-icon">✓</span><div><strong>Test passed</strong><small>coffee.spec.js · 1.2 s</small></div></div>
            <div class="hero-small-note">${tr("Пример: запрос → ответ → изменение сайта", "Мысал: сұраныс → жауап → сайт өзгерісі")}</div>
          </div>
        </div>
        <div class="hub-route" data-reveal><span class="hub-route-label">${tr("ТВОЙ МАРШРУТ", "СЕНІҢ БАҒЫТЫҢ")}</span><a href="learn.html#k1"><b>01</b><span>${tr("Разберись в теме", "Тақырыпты түсін")}</span></a><i>→</i><a href="labs.html"><b>02</b><span>${tr("Попробуй на сайте", "Сайтта сына")}</span></a><i>→</i><a href="kb.html#bug-report"><b>03</b><span>${tr("Объясни результат", "Нәтижені түсіндір")}</span></a></div>
        <div class="hub-section-heading" data-reveal><div><span class="hub-eyebrow">${tr("ВСЁ ПОД РУКОЙ", "БӘРІ ҚОЛАСТЫНДА")}</span><h2>${tr("Куда отправимся сегодня?", "Бүгін қайда барамыз?")}</h2></div><p>${tr("От первого вопроса до уверенной проверки.", "Алғашқы сұрақтан сенімді тексеруге дейін.")}</p></div>
        <div class="p-tiles">${t("tiles").map(([href, icon, title, text], i) => href
          ? `<a class="p-tile tile-${i}" href="${href}" data-reveal><span class="tile-number">0${i + 1}</span><span class="p-icon">${icon}</span><strong>${title}</strong><span>${text}</span><span class="tile-arrow">↗</span></a>`
          : `<div class="p-tile off"><span class="p-icon">${icon}</span><strong>${title}</strong><span>${text}</span></div>`).join("")}
        </div>
        <div class="hub-lab-banner" data-reveal><span class="hub-banner-icon">⌘</span><div><strong>${tr("Инструменты поверх сайта. Результат перед глазами.", "Құралдар сайттың үстінде. Нәтиже көз алдыңда.")}</strong><p>${tr("Открывай API, тесты и документацию в отдельных окнах. Перемещай их так, как удобно тебе.", "API, тесттер және құжаттаманы бөлек терезелерде аш. Өзіңе ыңғайлы орналастыр.")}</p></div><a href="labs.html">${tr("Попробовать", "Сынап көру")} ↗</a></div>
        <div class="p-reset" data-reveal>
          <div><strong>${t("reset_title")}</strong><br><span class="muted">${t("reset_text")}</span></div>
          <button class="btn btn-ghost" id="reset" type="button">${t("reset_btn")}</button>
        </div>
        <p class="muted" id="reset-msg"></p>
        <footer class="hub-footer"><span>QA Portal <i>×</i> Digital college</span><span>${tr("Учиться интереснее, когда можно попробовать.", "Істеп көрсең, үйрену қызығырақ.")}</span></footer>
      </section>`;
    document.getElementById("reset").addEventListener("click", () => {
      if (!confirm(t("reset_confirm"))) return;
      const legacy = ["qc_users", "qc_session", "qc_cart", "qc_orders", "qc_promo", "qc_next_order", "qc_product_overrides"];
      const prefixes = Object.keys(QAVersions.releases).map(v => "qc_v" + v + "_");
      Object.keys(localStorage).filter(k => legacy.includes(k) || prefixes.some(prefix => k.startsWith(prefix))).forEach(k => {
        try { localStorage.removeItem(k); } catch (e) { /* storage unavailable */ }
      });
      document.getElementById("reset-msg").textContent = t("reset_done");
    });
  };

  pages.docs = function (app) {
    app.innerHTML = `<section class="wrap section p-doc"><h1>${t("docs_title")} · qala coffe ${version()}</h1><p class="p-callout">${t("docs_note")}</p>${QARequirements.html(version(),lang()==="kz")}</section>`;
  };

  function filler(n) {
    const base = lang() === "kz"
      ? "Кофе өте дәмді болды, курьер уақытында жеткізді, рахмет! "
      : "Кофе был очень вкусный, курьер привёз вовремя, спасибо! ";
    let s = "";
    while (s.length < n) s += base;
    return s.slice(0, n);
  }

  pages.data = function (app) {
    const l = lang();
    app.innerHTML = `
      <section class="wrap section p-doc">
        <h1>${t("data_title")}</h1>
        <p class="p-callout">${t("data_note")}</p><p>${lang()==="kz"?"Бұл мәндер автоматты түрде жарамды деп саналмайды. Оларды таңдалған нұсқаның талабымен салыстыр: 1.0-де тіркелу мен промокод жоқ; 1.5-тен бастап бар. Email мысалы дайын аккаунт емес — оны алдымен тіркеу керек.":"Значения здесь не означают, что сайт должен их принять. Сверяйся с требованиями выбранной версии: в 1.0 нет регистрации и промокода, с 1.5 они доступны. Email из таблицы — пример данных, а не готовый аккаунт: его нужно зарегистрировать."}</p>
        ${DATA[l].map(([h, rows]) => `<h2>${h}</h2>
          <table class="p-table">${rows.map(([v, note]) => `<tr><td><code>${esc(v)}</code></td><td class="muted">${esc(note)}</td>
            <td><button class="btn btn-small btn-ghost copy" type="button" data-v="${esc(v)}">${t("copy")}</button></td></tr>`).join("")}</table>`).join("")}
        <p class="muted">${SCREEN_HOWTO[l]}</p>
        <h2>${t("long_title")}</h2>
        <table class="p-table">${[63, 64, 65, 199, 200, 201, 250, 1000].map(n => `<tr><td>${t("long_text", { n })}</td><td></td>
          <td><button class="btn btn-small btn-ghost copy" type="button" data-n="${n}">${t("copy")}</button></td></tr>`).join("")}</table>
      </section>`;
    document.querySelectorAll(".copy").forEach(b => b.addEventListener("click", () => {
      const text = b.dataset.n ? filler(Number(b.dataset.n)) : b.dataset.v;
      const done = () => { b.textContent = t("copied"); setTimeout(() => { b.textContent = t("copy"); }, 1500); };
      if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, () => prompt("Ctrl+C", text));
      else prompt("Ctrl+C", text);
    }));
  };

  pages.releases = function (app) {
    const kk=lang()==="kz",tr=(r,k)=>kk?k:r;
    const descriptions={"1.0":tr("6 напитков, один объём, корзина и учебный заказ. Документация: 14 из 20 правил. Вопросы — ментору в Discord.","6 сусын, бір көлем, себет пен оқу тапсырысы. Құжаттама: 20 ережеден 14. Сұрақтар — Discord-та менторға."),"1.5":tr("12 напитков, категории, избранное, молоко и сиропы, самовывоз, кабинет, повтор заказа и API-клиент. Точные требования.","12 сусын, санаттар, таңдаулы, сүт пен сироп, алып кету, кабинет, тапсырысты қайталау мен API клиент. Нақты талаптар."),"2.0":tr("Предварительная версия: 40 позиций, сэндвичи, завтраки, закуски и выпечка; комбо, акции, баллы, профиль, сетевые сценарии и журнал. Playwright требует подключённого сервера. Полный набор сложных сценариев ещё в разработке.","Алдын ала нұсқа: 40 тауар, сэндвич, таңғы ас, тіскебасар мен пісірме; комбо, акция, ұпай, профиль, желі сценарийлері мен журнал. Playwright серверді қажет етеді. Күрделі сценарийлердің толық жинағы әзірленуде.")};
    app.innerHTML=`<section class="wrap section p-doc"><h1>${t("rel_title")}</h1><p class="p-callout">${tr("Выбери стенд. Корзина, аккаунты, цены и заказы каждой версии хранятся отдельно в твоём браузере.","Стендті таңда. Әр нұсқаның себеті, аккаунты, бағасы мен тапсырысы браузерде бөлек сақталады.")}</p><div class="release-cards">${Object.entries(QAVersions.releases).map(([v,p])=>`<article class="p-rel"><span class="p-project-badge">${p.stage==='preview'?tr('В РАЗРАБОТКЕ','ӘЗІРЛЕНУДЕ'):tr('УЧЕБНЫЙ СТЕНД','ОҚУ СТЕНДІ')}</span><h2>qala coffe ${v}</h2><h3>${p.title[kk?1:0]}</h3><p>${descriptions[v]}</p><button class="btn" data-version="${v}">${v===version()?tr('Выбрана ✓','Таңдалды ✓'):tr('Выбрать','Таңдау')}</button> <a class="btn btn-ghost" href="menu.html?version=${v}">${tr('Открыть кофейню','Кофехананы ашу')} ↗</a></article>`).join('')}</div><p id="sw-msg" role="status"></p></section>`;
    document.querySelectorAll('[data-version]').forEach(b=>b.onclick=()=>{QAVersions.select(b.dataset.version);const url=new URL(location.href);url.searchParams.set("version",b.dataset.version);location.href=url;});
  };

  document.documentElement.lang = lang() === "kz" ? "kk" : "ru";
  const page = document.body.dataset.page;
  QAPortalNavigation.render(page);
  if (pages[page]) pages[page](document.getElementById("app"));

  // GitHub Pages caches HTML as well as assets. Version cross-page links so a
  // previously visited page cannot bring back an older navigation shell.
  const shellRevision = QAPortalNavigation.revision;
  const portalPages = new Set(["index.html", "learn.html", "kb.html", "docs.html", "testdata.html", "releases.html", "labs.html", "home.html", "menu.html", "product.html", "cart.html", "checkout.html", "account.html", "login.html", "register.html", "contacts.html", "aktsii.html"]);
  function refreshPortalLinks() {
    document.querySelectorAll('a[href]').forEach(link => {
      const href = link.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      const url = new URL(href, location.href);
      if (url.origin !== location.origin || !portalPages.has(url.pathname.split("/").pop())) return;
      if (url.searchParams.get("ui") === shellRevision) return;
      url.searchParams.set("ui", shellRevision);
      link.setAttribute("href", url.pathname + url.search + url.hash);
    });
  }
  refreshPortalLinks();
  // Lessons and the knowledge base render their links after this shared shell.
  new MutationObserver(refreshPortalLinks).observe(document.getElementById("app"), { childList: true, subtree: true });
})();
