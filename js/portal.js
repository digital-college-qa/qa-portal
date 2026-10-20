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
  const version = () => (load("qc_version", "1.0") === "1.1" ? "1.1" : "1.0");
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const T = {
    ru: {
      portal: "QA Portal",
      home: "Главная портала",
      shop: "Магазин", learn: "Уроки", kb: "База знаний", docs: "Требования", data: "Тестовые данные", releases: "Релизы", labs: "Практикум",
      hub_title: "QA Portal",
      hub_sub: "Здесь всё для тестирования сайта кофейни qala coffe: сам сайт, требования заказчика, тестовые данные и версии.",
      hub_version: "Сейчас на стенде: <b>версия {v}</b>. Сменить версию — в разделе «Релизы».",
      tiles: [
        ["home.html", "🛒", "Магазин", "Сайт кофейни, который мы тестируем."],
        ["learn.html", "🎓", "Уроки", "Все пары курса по этапам: просто или подробно, словарь EN · RU · KZ."],
        ["kb.html", "📚", "База знаний", "Все темы курса по парам: что это, шаблон, пример на qala coffe, проверь себя."],
        ["docs.html", "📄", "Требования", "ТЗ заказчика и макеты экранов от дизайнера."],
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
      shop: "Дүкен", learn: "Сабақтар", kb: "Білім қоры", docs: "Талаптар", data: "Тест деректері", releases: "Релиздер", labs: "Практикум",
      hub_title: "QA Portal",
      hub_sub: "qala coffe кофеханасының сайтын тестілеуге қажеттінің бәрі осында: сайттың өзі, тапсырыс берушінің талаптары, тест деректері және нұсқалар.",
      hub_version: "Қазір стендте: <b>{v} нұсқа</b>. Нұсқаны «Релиздер» бөлімінде ауыстыруға болады.",
      tiles: [
        ["home.html", "🛒", "Дүкен", "Біз тестілейтін кофехана сайты."],
        ["learn.html", "🎓", "Сабақтар", "Курстың барлық сабағы кезеңдер бойынша: қарапайым немесе толық, EN · RU · KZ сөздігі."],
        ["kb.html", "📚", "Білім қоры", "Курстың барлық тақырыбы сабақтар бойынша: бұл не, үлгі, qala coffe мысалы, өзіңді тексер."],
        ["docs.html", "📄", "Талаптар", "Тапсырыс берушінің ТТ-сы және дизайнердің экран макеттері."],
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

  /* ---------- requirements (deliberately incomplete: the rest is answered by the manager) ---------- */
  const TZ = {
    ru: [
      ["1. Общее", [
        "qala coffe — сайт кофейни с доставкой горячих напитков.",
        "Сайт на двух языках: русском и казахском. Язык переключается в шапке сайта.",
        "Сайт должен работать на компьютере, планшете и телефоне.",
        "Сайт должен работать быстро и быть удобным."]],
      ["2. Главная", [
        "Первый экран: слоган, короткое описание и кнопка «Заказать», которая ведёт в меню.",
        "Блок «Хиты продаж» — 6 самых популярных напитков и ссылка на всё меню.",
        "Баннер со скидкой для новых клиентов показывается только тем, кто не вошёл в аккаунт."]],
      ["3. Меню", [
        "Все напитки: картинка, название, объём, цена и кнопка «Подробнее».",
        "Поиск по названию напитка.",
        "Сортировка: по популярности, по цене (по возрастанию и по убыванию), по названию.",
        "Напиток с пометкой «Нет в наличии» купить нельзя.",
        "Цены — в целых тенге."]],
      ["4. Карточка напитка", [
        "Название, описание, выбор объёма (S, M, L), сироп, количество, цена и кнопка «В корзину».",
        "Сироп стоит 200 тенге.",
        "Количество меняется кнопками «−» и «+» или вводом числа.",
        "Отзывы видят только те, кто вошёл в аккаунт."]],
      ["5. Корзина", [
        "Список напитков: количество можно менять, напиток можно удалить.",
        "Поле для промокода.",
        "Новым клиентам — скидка 10% на первый заказ. Скидки не суммируются — применяется большая.",
        "Минимальная сумма заказа — 1 500 тенге. Если сумма меньше — оформить заказ нельзя.",
        "Доставка платная, при заказе на большую сумму — бесплатная."]],
      ["6. Оформление заказа", [
        "Поля: имя, телефон, город, адрес, время доставки, комментарий, способ оплаты.",
        "Ближайшее время доставки — через 30 минут после заказа (время на приготовление).",
        "Заказы принимаются до 21:30.",
        "После подтверждения показывается сообщение с номером заказа и суммой."]],
      ["7. Регистрация и вход", [
        "Регистрация: имя, email, телефон (необязательно), пароль, согласие с правилами сервиса.",
        "Email не зависит от регистра: Test@mail.kz и test@mail.kz — один и тот же аккаунт.",
        "После регистрации пользователь попадает в личный кабинет.",
        "Вход — по email и паролю."]],
      ["8. Личный кабинет", [
        "Приветствие пользователя.",
        "История заказов — последние 10 заказов.",
        "Кнопка «Выйти»."]],
      ["9. Контакты", [
        "Адрес, телефон, часы работы, email и карта."]]
    ],
    kz: [
      ["1. Жалпы", [
        "qala coffe — ыстық сусындарды жеткізетін кофехана сайты.",
        "Сайт екі тілде: орыс және қазақ. Тіл сайттың жоғарғы жағында ауыстырылады.",
        "Сайт компьютерде, планшетте және телефонда жұмыс істеуі керек.",
        "Сайт жылдам жұмыс істеуі және ыңғайлы болуы керек."]],
      ["2. Басты бет", [
        "Бірінші экран: ұран, қысқа сипаттама және мәзірге апаратын «Тапсырыс беру» батырмасы.",
        "«Сатылым хиттері» блогы — ең танымал 6 сусын және бүкіл мәзірге сілтеме.",
        "Жаңа клиенттерге жеңілдік баннері тек аккаунтқа кірмегендерге көрсетіледі."]],
      ["3. Мәзір", [
        "Барлық сусындар: сурет, атауы, көлемі, бағасы және «Толығырақ» батырмасы.",
        "Сусын атауы бойынша іздеу.",
        "Сұрыптау: танымалдығы, бағасы (өсуі және кемуі бойынша), атауы бойынша.",
        "«Қолда жоқ» белгісі бар сусынды сатып алуға болмайды.",
        "Бағалар — бүтін теңгемен."]],
      ["4. Сусын карточкасы", [
        "Атауы, сипаттамасы, көлемді таңдау (S, M, L), сироп, саны, бағасы және «Себетке» батырмасы.",
        "Сироп 200 теңге тұрады.",
        "Саны «−» және «+» батырмаларымен немесе сан енгізу арқылы өзгереді.",
        "Пікірлерді тек аккаунтқа кіргендер көреді."]],
      ["5. Себет", [
        "Сусындар тізімі: санын өзгертуге, сусынды өшіруге болады.",
        "Промокод өрісі.",
        "Жаңа клиенттерге алғашқы тапсырысқа 10% жеңілдік. Жеңілдіктер қосылмайды — үлкені қолданылады.",
        "Тапсырыстың ең аз сомасы — 1 500 теңге. Сома аз болса, тапсырыс беруге болмайды.",
        "Жеткізу ақылы, үлкен сомаға тапсырыс берсең — тегін."]],
      ["6. Тапсырысты рәсімдеу", [
        "Өрістер: аты, телефон, қала, мекенжай, жеткізу уақыты, пікір, төлем тәсілі.",
        "Ең жақын жеткізу уақыты — тапсырыстан 30 минуттан кейін (дайындауға кететін уақыт).",
        "Тапсырыстар 21:30-ға дейін қабылданады.",
        "Растағаннан кейін тапсырыс нөмірі мен сомасы бар хабар көрсетіледі."]],
      ["7. Тіркелу және кіру", [
        "Тіркелу: аты, email, телефон (міндетті емес), құпиясөз, сервис ережелерімен келісу.",
        "Email регистрге тәуелді емес: Test@mail.kz және test@mail.kz — бір аккаунт.",
        "Тіркелгеннен кейін пайдаланушы жеке кабинетке түседі.",
        "Кіру — email және құпиясөз арқылы."]],
      ["8. Жеке кабинет", [
        "Пайдаланушымен амандасу.",
        "Тапсырыстар тарихы — соңғы 10 тапсырыс.",
        "«Шығу» батырмасы."]],
      ["9. Байланыс", [
        "Мекенжай, телефон, жұмыс уақыты, email және карта."]]
    ]
  };

  const MOCKS = {
    ru: [
      ["Экран «Вход»", `
        <div class="mk-title">Вход</div>
        <div class="mk-label">Email</div><div class="mk-input"></div>
        <div class="mk-label">Пароль</div><div class="mk-input">••••••••</div>
        <div class="mk-link mk-right">Забыли пароль?</div>
        <div class="mk-btn">Войти</div>
        <div class="mk-small">Нет аккаунта? <span class="mk-link">Зарегистрируйтесь</span></div>`],
      ["Экран «Карточка напитка»", `
        <div class="mk-row">
          <div class="mk-img">картинка</div>
          <div class="mk-col">
            <div class="mk-title">Название напитка</div>
            <div class="mk-ghost">♡ В избранное</div>
            <div class="mk-text"></div><div class="mk-text short"></div>
            <div class="mk-label">Объём</div>
            <div class="mk-sizes"><span>S</span><span>M</span><span>L</span></div>
            <div class="mk-label">☐ Сироп</div>
            <div class="mk-label">Количество</div>
            <div class="mk-sizes"><span>−</span><span>1</span><span>+</span></div>
            <div class="mk-row mk-mid"><div class="mk-price">Цена</div><div class="mk-btn">В корзину</div></div>
          </div>
        </div>`]
    ],
    kz: [
      ["«Кіру» экраны", `
        <div class="mk-title">Кіру</div>
        <div class="mk-label">Email</div><div class="mk-input"></div>
        <div class="mk-label">Құпиясөз</div><div class="mk-input">••••••••</div>
        <div class="mk-link mk-right">Құпиясөзді ұмыттыңыз ба?</div>
        <div class="mk-btn">Кіру</div>
        <div class="mk-small">Аккаунт жоқ па? <span class="mk-link">Тіркеліңіз</span></div>`],
      ["«Сусын карточкасы» экраны", `
        <div class="mk-row">
          <div class="mk-img">сурет</div>
          <div class="mk-col">
            <div class="mk-title">Сусын атауы</div>
            <div class="mk-ghost">♡ Таңдаулыларға</div>
            <div class="mk-text"></div><div class="mk-text short"></div>
            <div class="mk-label">Көлемі</div>
            <div class="mk-sizes"><span>S</span><span>M</span><span>L</span></div>
            <div class="mk-label">☐ Сироп</div>
            <div class="mk-label">Саны</div>
            <div class="mk-sizes"><span>−</span><span>1</span><span>+</span></div>
            <div class="mk-row mk-mid"><div class="mk-price">Бағасы</div><div class="mk-btn">Себетке</div></div>
          </div>
        </div>`]
    ]
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
    ru: "Как включить размер телефона в Chrome или Edge: F12 → Ctrl+Shift+M → вверху выбрать размер. Браузеры для проверки: Chrome, Edge (есть на любом Windows), Firefox.",
    kz: "Chrome немесе Edge-те телефон өлшемін қосу: F12 → Ctrl+Shift+M → жоғарыдан өлшемді таңда. Тексеруге арналған браузерлер: Chrome, Edge (кез келген Windows-та бар), Firefox."
  };

  const RELEASES = {
    ru: [
      { v: "2.0", date: "в разработке", planned: ["Новые разделы сайта. Подробности появятся позже."] },
      { v: "1.1", date: "10 ноября 2026", fixed: [
          "Сортировка «Цена ↑» теперь от дешёвых к дорогим.",
          "Кнопка «+» в карточке напитка добавляет 1.",
          "Поиск в меню не зависит от регистра букв.",
          "Картинка «Латте» загружается.",
          "После удаления напитка сумма в корзине и счётчик в шапке обновляются сразу.",
          "Пароль при регистрации скрыт точками.",
          "На телефоне в меню 1 карточка в ряд, на планшете — 2."],
        added: [
          "Не больше 10 штук одного напитка — в карточке и в корзине.",
          "Пароль — минимум 8 символов.",
          "Комментарий к заказу — до 200 символов, под полем счётчик."] },
      { v: "1.0", date: "1 октября 2026", added: ["Первая версия сайта: главная, меню, карточка напитка, корзина, оформление заказа, регистрация, вход, личный кабинет, контакты."] }
    ],
    kz: [
      { v: "2.0", date: "әзірленуде", planned: ["Сайттың жаңа бөлімдері. Толығырақ кейін белгілі болады."] },
      { v: "1.1", date: "2026 жылғы 10 қараша", fixed: [
          "«Баға ↑» сұрыптауы енді арзаннан қымбатқа қарай.",
          "Сусын карточкасындағы «+» батырмасы 1 қосады.",
          "Мәзірдегі іздеу әріп регистріне тәуелді емес.",
          "«Латте» суреті жүктеледі.",
          "Сусынды өшіргеннен кейін себеттегі сома мен жоғарыдағы санауыш бірден жаңарады.",
          "Тіркелу кезінде құпиясөз нүктелермен жасырылады.",
          "Телефонда мәзірде қатарда 1 карточка, планшетте — 2."],
        added: [
          "Бір сусыннан 10 данадан артық емес — карточкада және себетте.",
          "Құпиясөз — кемінде 8 таңба.",
          "Тапсырысқа пікір — 200 таңбаға дейін, өрістің астында санауыш."] },
      { v: "1.0", date: "2026 жылғы 1 қазан", added: ["Сайттың бірінші нұсқасы: басты бет, мәзір, сусын карточкасы, себет, тапсырысты рәсімдеу, тіркелу, кіру, жеке кабинет, байланыс."] }
    ]
  };

  /* ---------- layout ---------- */
  function header(active) {
    const items = [["index.html", "home", "hub"], ["home.html", "shop", "shop"], ["learn.html", "learn", "learn"], ["kb.html", "kb", "kb"], ["docs.html", "docs", "docs"],
                   ["testdata.html", "data", "data"], ["releases.html", "releases", "releases"], ["labs.html", "labs", "labs"]];
    document.getElementById("header").innerHTML = `
      <div class="wrap p-head">
        <a class="p-logo" href="index.html"><span class="logo-mark">Q</span> ${t("portal")}</a>
        <nav class="p-nav">${items.map(([h, k, id]) => `<a href="${h}" class="${active === id ? "active" : ""}">${t(k)}</a>`).join("")}</nav>
        <div class="lang">
          <button type="button" data-lang="ru" class="${lang() === "ru" ? "on" : ""}">RU</button>
          <button type="button" data-lang="kz" class="${lang() === "kz" ? "on" : ""}">KZ</button>
        </div>
      </div>`;
    document.querySelectorAll(".lang button").forEach(b => b.addEventListener("click", () => {
      save("qc_lang", b.dataset.lang);
      location.reload();
    }));
  }

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
      ["qc_users", "qc_session", "qc_cart", "qc_orders", "qc_promo", "qc_next_order", "qc_product_overrides"].forEach(k => {
        try { localStorage.removeItem(k); } catch (e) { /* storage unavailable */ }
      });
      document.getElementById("reset-msg").textContent = t("reset_done");
    });
  };

  pages.docs = function (app) {
    const l = lang();
    app.innerHTML = `
      <section class="wrap section p-doc">
        <h1>${t("docs_title")}</h1>
        <p class="muted">${t("docs_meta")}</p>
        <p class="p-callout">${t("docs_note")}</p>
        ${TZ[l].map(([h, items]) => `<h2>${h}</h2><ul>${items.map(i => `<li>${esc(i)}</li>`).join("")}</ul>`).join("")}
        <h2 class="p-sep">${t("mock_title")}</h2>
        <p class="muted">${t("mock_note")}</p>
        <div class="mk-grid">${MOCKS[l].map(([title, html]) => `<figure class="mk"><figcaption>${title}</figcaption><div class="mk-screen">${html}</div></figure>`).join("")}</div>
      </section>`;
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
        <p class="p-callout">${t("data_note")}</p>
        ${DATA[l].map(([h, rows]) => `<h2>${h}</h2>
          <table class="p-table">${rows.map(([v, note]) => `<tr><td><code>${esc(v)}</code></td><td class="muted">${esc(note)}</td>
            <td><button class="btn btn-small btn-ghost copy" type="button" data-v="${esc(v)}">${t("copy")}</button></td></tr>`).join("")}</table>`).join("")}
        <p class="muted">${SCREEN_HOWTO[l]}</p>
        <h2>${t("long_title")}</h2>
        <table class="p-table">${[200, 250, 1000].map(n => `<tr><td>${t("long_text", { n })}</td><td></td>
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
    const l = lang();
    const cur = version();
    app.innerHTML = `
      <section class="wrap section p-doc">
        <h1>${t("rel_title")}</h1>
        <div class="p-switch">
          <strong>${t("rel_switch")}:</strong>
          ${["1.0", "1.1"].map(v => `<label class="check"><input type="radio" name="ver" value="${v}" ${v === cur ? "checked" : ""}> ${v}</label>`).join("")}
          <button class="btn btn-small" id="apply" type="button">${t("rel_apply")}</button>
        </div>
        <p class="muted" id="sw-msg"></p>
        ${RELEASES[l].map(r => `
          <div class="p-rel">
            <h2>${l === "kz" ? r.v + " нұсқа" : "Версия " + r.v} <span class="muted">· ${r.date}${r.v === cur ? " · " + t("rel_current") : ""}</span></h2>
            ${r.fixed ? `<h3>${t("fixed")}</h3><ul>${r.fixed.map(i => `<li>${esc(i)}</li>`).join("")}</ul>` : ""}
            ${r.added ? `<h3>${t("added")}</h3><ul>${r.added.map(i => `<li>${esc(i)}</li>`).join("")}</ul>` : ""}
            ${r.planned ? `<h3>${t("planned")}</h3><ul>${r.planned.map(i => `<li>${esc(i)}</li>`).join("")}</ul>` : ""}
          </div>`).join("")}
      </section>`;
    document.getElementById("apply").addEventListener("click", () => {
      const v = document.querySelector('input[name="ver"]:checked').value;
      save("qc_version", v);
      document.getElementById("sw-msg").textContent = t("rel_switched", { v });
      document.querySelectorAll(".p-rel h2 .muted").forEach(el => { el.textContent = el.textContent.replace(" · " + t("rel_current"), ""); });
    });
  };

  document.documentElement.lang = lang() === "kz" ? "kk" : "ru";
  const page = document.body.dataset.page;
  header(page);
  if (pages[page]) pages[page](document.getElementById("app"));
})();
