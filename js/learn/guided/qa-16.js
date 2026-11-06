/* Unified QA course, pair 16. Two levels with 4 equal-level task variants;
   the full level adds terms, "why" and 4 questions for 100 points. Edit this file directly. */
window.LEARN_PAIRS["qa-16"] = {
  "format": "two-level",
  "draftVersion": "5",
  "summary": [
    "Негативный API-автотест из своей проверки",
    "Өз тексеруіңнен негативтік API автотесі"
  ],
  "ru": {
    "intro": "Превратим негативную API-проверку из пары 13 в автотест: он сам отправит неверный запрос и проверит отказ и пустую корзину.",
    "topic": "негативный автотест",
    "learn": [
      "На паре 13 ты вручную отправил неверный запрос и проверил отказ. Теперь то же сделает автотест — за секунду и сколько угодно раз.",
      "Вместо `page` такой тест использует `request` — он шлёт запросы к API, как API-клиент. Тест: очистить корзину → отправить неверный запрос → проверить код и `error.code` → проверить, что корзина пуста.",
      "**Зелёный негативный тест — это успех**: сайт правильно отказал. Красный — что-то не совпало с ожиданием: читаем первое сообщение."
    ],
    "terms": [
      [
        "Позитивный автотест",
        "Positive test",
        "разрешённый запрос — ждём успех."
      ],
      [
        "Негативный автотест",
        "Negative test",
        "запрещённый запрос — ждём правильный отказ."
      ],
      [
        "Подготовка",
        "Setup",
        "шаг перед проверкой: `request.delete('cart')` очищает корзину."
      ],
      [
        "Запрос из теста",
        "request",
        "отправляет запросы к API: get, post, patch, delete."
      ],
      [
        "Состояние",
        "State",
        "что стало с данными после запроса."
      ]
    ],
    "why": [
      "**Почему зелёный негативный тест — это успех.** В негативном тесте мы ждём, что сервер отклонит запрещённые данные; когда сервер вернул ожидаемый отказ, проверка правила прошла успешно (`Passed`). [Подробнее: негативные автотесты →](kb.html#negative-auto)",
      "**Зачем проверять error.code, а не только код 400.** Код `400` возвращается при самых разных ошибках запроса, а `error.code` (`INVALID_QUANTITY`, `INVALID_SIZE`) доказывает, что сработало именно проверяемое правило. [Подробнее: проверка кода и состояния →](kb.html#api-test-design)",
      "**Зачем в начале теста вызывать request.delete('cart').** Очистка корзины перед шагами делает тест независимым от прошлых запусков и гарантирует пустое стартовое состояние. [Подробнее: структура негативного автотеста →](kb.html#negative-auto)",
      "**Почему в конце негативного теста проверяют cart.items.length.** Даже получив код отказа, важно убедиться, что невалидная позиция не записалась в массив корзины `cart.items`. [Подробнее: проверка состояния после отказа →](kb.html#negative-auto)"
    ],
    "sample": {
      "note": "Это негативный тест цены латте. Твой — про добавление в корзину по выбранному варианту.",
      "text": "Версия сайта: 2.0\nНеверное значение: цена -1\nОжидаю: код 400; error.code INVALID_PRICE; цена латте не изменилась\nМой тест:\nimport { test, expect } from '@playwright/test';\n\ntest('Цена -1 отклоняется, цена латте не меняется', async ({ request }) => {\n  const response = await request.patch('products/4', { data: { price: -1 } });\n  expect(response.status()).toBe(400);\n  const body = await response.json();\n  expect(body.error.code).toBe('INVALID_PRICE');\n  const after = await request.get('products/4');\n  const product = await after.json();\n  expect(product.price).toBe(1300);\n});\nЗапуск: Passed"
    },
    "task": "Напиши **один негативный API-автотест** для `quantity: 0` (код `400`, `INVALID_QUANTITY`) и проверь, что корзина осталась пустой.",
    "steps": [
      "Очисти корзину в начале теста через `request.delete('cart')`.",
      "Попроси ИИ написать тест (промпт ниже) для `quantity: 0` и вставь код в окно **«Автотесты»**.",
      "Нажми **«Запустить»** и запиши результат."
    ],
    "prompt": "Напиши один автотест Playwright на JavaScript для учебного раннера.\nМожно только: import { test, expect } from '@playwright/test'; test(...); const; await; request.get, request.post, request.delete; response.status(); response.json(); expect(...).toBe().\nНельзя: циклы, свои функции, обращение по номеру вроде items[0], полный адрес сайта. Пути пиши без косой черты в начале: 'cart/items'.\nТест: очистить корзину запросом request.delete('cart'). Отправить request.post('cart/items') с data { productId: 3, quantity: 0, size: 'M' }.\nПроверить код ответа 400 и body.error.code 'INVALID_QUANTITY'. Потом request.get('cart') и проверить, что cart.items.length равно 0.",
    "variants": [
      {
        "title": "Вариант 1 · Неверное quantity: 0 (400)",
        "task": "Напиши **один негативный API-автотест** для `quantity: 0` (код `400`, `INVALID_QUANTITY`) и проверь, что корзина осталась пустой.",
        "steps": [
          "Очисти корзину в начале теста через `request.delete('cart')`.",
          "Попроси ИИ написать тест (промпт ниже) для `quantity: 0` и вставь код в окно **«Автотесты»**.",
          "Нажми **«Запустить»** и запиши результат."
        ],
        "prompt": "Напиши один автотест Playwright на JavaScript для учебного раннера.\nМожно только: import { test, expect } from '@playwright/test'; test(...); const; await; request.get, request.post, request.delete; response.status(); response.json(); expect(...).toBe().\nНельзя: циклы, свои функции, обращение по номеру вроде items[0], полный адрес сайта. Пути пиши без косой черты в начале: 'cart/items'.\nТест: очистить корзину запросом request.delete('cart'). Отправить request.post('cart/items') с data { productId: 3, quantity: 0, size: 'M' }.\nПроверить код ответа 400 и body.error.code 'INVALID_QUANTITY'. Потом request.get('cart') и проверить, что cart.items.length равно 0.",
        "template": "Версия сайта: 2.0\nНеверное значение: quantity 0\nОжидаю: код (число); error.code (твой ответ); корзина пуста\nМой тест:\n(вставь сюда код из окна «Автотесты»)\nЗапуск: (Passed / Failed: первое сообщение / Blocked: причина)"
      },
      {
        "title": "Вариант 2 · Неверный size: 'XL' (400)",
        "task": "Напиши **один негативный API-автотест** для `size: 'XL'` (код `400`, `INVALID_SIZE`) и проверь, что корзина осталась пустой.",
        "steps": [
          "Очисти корзину в начале теста через `request.delete('cart')`.",
          "Попроси ИИ написать тест (промпт ниже) для `size: 'XL'` и вставь код в окно **«Автотесты»**.",
          "Нажми **«Запустить»** и запиши результат."
        ],
        "prompt": "Напиши один автотест Playwright на JavaScript для учебного раннера.\nМожно только: import { test, expect } from '@playwright/test'; test(...); const; await; request.get, request.post, request.delete; response.status(); response.json(); expect(...).toBe().\nНельзя: циклы, свои функции, обращение по номеру вроде items[0], полный адрес сайта. Пути пиши без косой черты в начале: 'cart/items'.\nТест: очистить корзину запросом request.delete('cart'). Отправить request.post('cart/items') с data { productId: 3, quantity: 1, size: 'XL' }.\nПроверить код ответа 400 и body.error.code 'INVALID_SIZE'. Потом request.get('cart') и проверить, что cart.items.length равно 0.",
        "template": "Версия сайта: 2.0\nНеверное значение: size 'XL'\nОжидаю: код (число); error.code (твой ответ); корзина пуста\nМой тест:\n(вставь сюда код из окна «Автотесты»)\nЗапуск: (Passed / Failed: первое сообщение / Blocked: причина)"
      },
      {
        "title": "Вариант 3 · Несуществующий productId: 99 (404)",
        "task": "Напиши **один негативный API-автотест** для `productId: 99` (код `404`, `PRODUCT_NOT_FOUND`) и проверь, что корзина осталась пустой.",
        "steps": [
          "Очисти корзину в начале теста через `request.delete('cart')`.",
          "Попроси ИИ написать тест (промпт ниже) для `productId: 99` и вставь код в окно **«Автотесты»**.",
          "Нажми **«Запустить»** и запиши результат."
        ],
        "prompt": "Напиши один автотест Playwright на JavaScript для учебного раннера.\nМожно только: import { test, expect } from '@playwright/test'; test(...); const; await; request.get, request.post, request.delete; response.status(); response.json(); expect(...).toBe().\nНельзя: циклы, свои функции, обращение по номеру вроде items[0], полный адрес сайта. Пути пиши без косой черты в начале: 'cart/items'.\nТест: очистить корзину запросом request.delete('cart'). Отправить request.post('cart/items') с data { productId: 99, quantity: 1, size: 'M' }.\nПроверить код ответа 404 и body.error.code 'PRODUCT_NOT_FOUND'. Потом request.get('cart') и проверить, что cart.items.length равно 0.",
        "template": "Версия сайта: 2.0\nНеверное значение: productId 99\nОжидаю: код (число); error.code (твой ответ); корзина пуста\nМой тест:\n(вставь сюда код из окна «Автотесты»)\nЗапуск: (Passed / Failed: первое сообщение / Blocked: причина)"
      },
      {
        "title": "Вариант 4 · Нет в наличии productId: 10 (409)",
        "task": "Напиши **один негативный API-автотест** для напитка не в наличии `productId: 10` (код `409`, `OUT_OF_STOCK`) и проверь, что корзина пуста.",
        "steps": [
          "Очисти корзину в начале теста через `request.delete('cart')`.",
          "Попроси ИИ написать тест (промпт ниже) для `productId: 10` и вставь код в окно **«Автотесты»**.",
          "Нажми **«Запустить»** и запиши результат."
        ],
        "prompt": "Напиши один автотест Playwright на JavaScript для учебного раннера.\nМожно только: import { test, expect } from '@playwright/test'; test(...); const; await; request.get, request.post, request.delete; response.status(); response.json(); expect(...).toBe().\nНельзя: циклы, свои функции, обращение по номеру вроде items[0], полный адрес сайта. Пути пиши без косой черты в начале: 'cart/items'.\nТест: очистить корзину запросом request.delete('cart'). Отправить request.post('cart/items') с data { productId: 10, quantity: 1, size: 'M' }.\nПроверить код ответа 409 и body.error.code 'OUT_OF_STOCK'. Потом request.get('cart') и проверить, что cart.items.length равно 0.",
        "template": "Версия сайта: 2.0\nНеверное значение: productId 10 (не в наличии)\nОжидаю: код (число); error.code (твой ответ); корзина пуста\nМой тест:\n(вставь сюда код из окна «Автотесты»)\nЗапуск: (Passed / Failed: первое сообщение / Blocked: причина)"
      }
    ],
    "links": [
      [
        "Лаборатория 2.0: автотесты",
        "labs.html?version=2.0&tool=tests"
      ],
      [
        "Негативные автотесты",
        "kb.html#negative-auto"
      ],
      [
        "API: позитив, негатив и состояние",
        "kb.html#api-test-design"
      ],
      [
        "Почему автотест красный",
        "kb.html#automation-diagnostics"
      ]
    ],
    "template": "Версия сайта: 2.0\nНеверное значение: quantity 0\nОжидаю: код (число); error.code (твой ответ); корзина пуста\nМой тест:\n(вставь сюда код из окна «Автотесты»)\nЗапуск: (Passed / Failed: первое сообщение / Blocked: причина)",
    "whyTemplate": "Почему зелёный негативный тест — это успех: (твой ответ)\nЗачем проверять error.code, а не только код 400: (твой ответ)\nЗачем в начале теста вызывать request.delete('cart'): (твой ответ)\nПочему в конце негативного теста проверяют cart.items.length: (твой ответ)",
    "practiceKind": "written"
  },
  "kz": {
    "intro": "13-сабақтағы негативтік API тексеруін автотестке айналдырамыз: ол қате сұранысты өзі жіберіп, бас тартуды және бос себетті тексереді.",
    "topic": "негативтік автотест",
    "learn": [
      "13-сабақта сен қате сұранысты қолмен жіберіп, бас тартуды тексердің. Енді соны автотест жасайды — бір секундта және қанша рет болса да.",
      "Мұндай тест `page` орнына `request` қолданады — ол API-ға API-клиент сияқты сұраныс жібереді. Тест: себетті тазалау → қате сұраныс жіберу → код пен `error.code`-ты тексеру → себет бос екенін тексеру.",
      "**Жасыл негативтік тест — сәттілік**: сайт дұрыс бас тартты. Қызыл — бірдеңе күтумен сәйкес келмеді: бірінші хабарламаны оқимыз."
    ],
    "terms": [
      [
        "Позитивтік автотест",
        "Positive test",
        "рұқсат етілген сұраныс — сәттілікті күтеміз."
      ],
      [
        "Негативтік автотест",
        "Negative test",
        "тыйым салынған сұраныс — дұрыс бас тартуды күтеміз."
      ],
      [
        "Дайындық",
        "Setup",
        "тексеру алдындағы қадам: `request.delete('cart')` себетті тазалайды."
      ],
      [
        "Тесттегі сұраныс",
        "request",
        "API-ға сұраныс жібереді: get, post, patch, delete."
      ],
      [
        "Күй",
        "State",
        "сұраныстан кейін деректерге не болды."
      ]
    ],
    "why": [
      "**Неліктен жасыл негативтік тест — бұл сәттілік.** Негативтік тестте сервердің тыйым салынған деректен бас тартуын күтеміз; бас тарту келсе, ереже орындалды (`Passed`). [Толығырақ: негативтік автотесттер →](kb.html#negative-auto)",
      "**Неліктен тек 400 кодын емес, error.code өрісін де тексереді.** `400` коды әртүрлі қателерде қайтады, ал `error.code` нақты қай ереже ұсталғанын көрсетеді. [Толығырақ: API күйін тексеру →](kb.html#api-test-design)",
      "**Тест басында request.delete('cart') не үшін шақырылады.** Себетті алдын ала тазарту тестті алдыңғы іске қосулардан тәуелсіз етеді. [Толығырақ: негативтік автотест құрылымы →](kb.html#negative-auto)",
      "**Негативтік тест соңында cart.items.length не үшін тексеріледі.** Бас тарту коды келсе де, жарамсыз тауар себетке қосылып кетпегенін тексеру қажет. [Толығырақ: күйді тексеру →](kb.html#negative-auto)"
    ],
    "sample": {
      "note": "Бұл — латте бағасының негативтік тесті. Сенікі — таңдалған нұсқа бойынша себетке қосу туралы.",
      "text": "Сайт нұсқасы: 2.0\nҚате мән: баға -1\nКүтемін: код 400; error.code INVALID_PRICE; латте бағасы өзгермеді\nМенің тестім:\nimport { test, expect } from '@playwright/test';\n\ntest('Баға -1 қабылданбайды, латте бағасы өзгермейді', async ({ request }) => {\n  const response = await request.patch('products/4', { data: { price: -1 } });\n  expect(response.status()).toBe(400);\n  const body = await response.json();\n  expect(body.error.code).toBe('INVALID_PRICE');\n  const after = await request.get('products/4');\n  const product = await after.json();\n  expect(product.price).toBe(1300);\n});\nІске қосу: Passed"
    },
    "task": "`quantity: 0` (`400` коды, `INVALID_QUANTITY`) үшін **бір негативтік API автотестін** жазып, себеттің бос қалғанын тексер.",
    "steps": [
      "Тест басында `request.delete('cart')` арқылы себетті тазала.",
      "`quantity: 0` үшін тестті ЖИ-ден сұра (төмендегі промпт) да, кодты **«Автотесттер»** терезесіне қой.",
      "**«Іске қосу»** басып, нәтижені жаз."
    ],
    "prompt": "Оқу раннеріне арналған JavaScript тіліндегі бір Playwright автотестін жаз.\nТек мыналарға болады: import { test, expect } from '@playwright/test'; test(...); const; await; request.get, request.post, request.delete; response.status(); response.json(); expect(...).toBe().\nБолмайды: циклдер, өз функцияларың, items[0] сияқты нөмір бойынша қатынау, сайттың толық мекенжайы. Жолдарды басында қиғаш сызықсыз жаз: 'cart/items'.\nТест: request.delete('cart') сұранысымен себетті тазала. { productId: 3, quantity: 0, size: 'M' } data-мен request.post('cart/items') жібер.\n400 жауап кодын және body.error.code 'INVALID_QUANTITY' екенін тексер. Содан кейін request.get('cart') жіберіп, cart.items.length 0-ге тең екенін тексер.",
    "variants": [
      {
        "title": "1-нұсқа · Қате quantity: 0 (400)",
        "task": "`quantity: 0` (`400` коды, `INVALID_QUANTITY`) үшін **бір негативтік API автотестін** жазып, себеттің бос қалғанын тексер.",
        "steps": [
          "Тест басында `request.delete('cart')` арқылы себетті тазала.",
          "`quantity: 0` үшін тестті ЖИ-ден сұра (төмендегі промпт) да, кодты **«Автотесттер»** терезесіне қой.",
          "**«Іске қосу»** басып, нәтижені жаз."
        ],
        "prompt": "Оқу раннеріне арналған JavaScript тіліндегі бір Playwright автотестін жаз.\nТек мыналарға болады: import { test, expect } from '@playwright/test'; test(...); const; await; request.get, request.post, request.delete; response.status(); response.json(); expect(...).toBe().\nБолмайды: циклдер, өз функцияларың, items[0] сияқты нөмір бойынша қатынау, сайттың толық мекенжайы. Жолдарды басында қиғаш сызықсыз жаз: 'cart/items'.\nТест: request.delete('cart') сұранысымен себетті тазала. { productId: 3, quantity: 0, size: 'M' } data-мен request.post('cart/items') жібер.\n400 жауап кодын және body.error.code 'INVALID_QUANTITY' екенін тексер. Содан кейін request.get('cart') жіберіп, cart.items.length 0-ге тең екенін тексер.",
        "template": "Сайт нұсқасы: 2.0\nҚате мән: quantity 0\nКүтемін: код (сан); error.code (өз жауабың); себет бос\nМенің тестім:\n(«Автотесттер» терезесіндегі кодты осында қой)\nІске қосу: (Passed / Failed: бірінші хабарлама / Blocked: себебі)"
      },
      {
        "title": "2-нұсқа · Қате size: 'XL' (400)",
        "task": "`size: 'XL'` (`400` коды, `INVALID_SIZE`) үшін **бір негативтік API автотестін** жазып, себеттің бос қалғанын тексер.",
        "steps": [
          "Тест басында `request.delete('cart')` арқылы себетті тазала.",
          "`size: 'XL'` үшін тестті ЖИ-ден сұра (төмендегі промпт) да, кодты **«Автотесттер»** терезесіне қой.",
          "**«Іске қосу»** басып, нәтижені жаз."
        ],
        "prompt": "Оқу раннеріне арналған JavaScript тіліндегі бір Playwright автотестін жаз.\nТек мыналарға болады: import { test, expect } from '@playwright/test'; test(...); const; await; request.get, request.post, request.delete; response.status(); response.json(); expect(...).toBe().\nБолмайды: циклдер, өз функцияларың, items[0] сияқты нөмір бойынша қатынау, сайттың толық мекенжайы. Жолдарды басында қиғаш сызықсыз жаз: 'cart/items'.\nТест: request.delete('cart') сұранысымен себетті тазала. { productId: 3, quantity: 1, size: 'XL' } data-мен request.post('cart/items') жібер.\n400 жауап кодын және body.error.code 'INVALID_SIZE' екенін тексер. Содан кейін request.get('cart') жіберіп, cart.items.length 0-ге тең екенін тексер.",
        "template": "Сайт нұсқасы: 2.0\nҚате мән: size 'XL'\nКүтемін: код (сан); error.code (өз жауабың); себет бос\nМенің тестім:\n(«Автотесттер» терезесіндегі кодты осында қой)\nІске қосу: (Passed / Failed: бірінші хабарлама / Blocked: себебі)"
      },
      {
        "title": "3-нұсқа · Жоқ productId: 99 (404)",
        "task": "`productId: 99` (`404` коды, `PRODUCT_NOT_FOUND`) үшін **бір негативтік API автотестін** жазып, себеттің бос қалғанын тексер.",
        "steps": [
          "Тест басында `request.delete('cart')` арқылы себетті тазала.",
          "`productId: 99` үшін тестті ЖИ-ден сұра (төмендегі промпт) да, кодты **«Автотесттер»** терезесіне қой.",
          "**«Іске қосу»** басып, нәтижені жаз."
        ],
        "prompt": "Оқу раннеріне арналған JavaScript тіліндегі бір Playwright автотестін жаз.\nТек мыналарға болады: import { test, expect } from '@playwright/test'; test(...); const; await; request.get, request.post, request.delete; response.status(); response.json(); expect(...).toBe().\nБолмайды: циклдер, өз функцияларың, items[0] сияқты нөмір бойынша қатынау, сайттың толық мекенжайы. Жолдарды басында қиғаш сызықсыз жаз: 'cart/items'.\nТест: request.delete('cart') сұранысымен себетті тазала. { productId: 99, quantity: 1, size: 'M' } data-мен request.post('cart/items') жібер.\n404 жауап кодын және body.error.code 'PRODUCT_NOT_FOUND' екенін тексер. Содан кейін request.get('cart') жіберіп, cart.items.length 0-ге тең екенін тексер.",
        "template": "Сайт нұсқасы: 2.0\nҚате мән: productId 99\nКүтемін: код (сан); error.code (өз жауабың); себет бос\nМенің тестім:\n(«Автотесттер» терезесіндегі кодты осында қой)\nІске қосу: (Passed / Failed: бірінші хабарлама / Blocked: себебі)"
      },
      {
        "title": "4-нұсқа · Қоймада жоқ productId: 10 (409)",
        "task": "Қоймада жоқ `productId: 10` (`409` коды, `OUT_OF_STOCK`) үшін **бір негативтік API автотестін** жазып, себеттің бос қалғанын тексер.",
        "steps": [
          "Тест басында `request.delete('cart')` арқылы себетті тазала.",
          "`productId: 10` үшін тестті ЖИ-ден сұра (төмендегі промпт) да, кодты **«Автотесттер»** терезесіне қой.",
          "**«Іске қосу»** басып, нәтижені жаз."
        ],
        "prompt": "Оқу раннеріне арналған JavaScript тіліндегі бір Playwright автотестін жаз.\nТек мыналарға болады: import { test, expect } from '@playwright/test'; test(...); const; await; request.get, request.post, request.delete; response.status(); response.json(); expect(...).toBe().\nБолмайды: циклдер, өз функцияларың, items[0] сияқты нөмір бойынша қатынау, сайттың толық мекенжайы. Жолдарды басында қиғаш сызықсыз жаз: 'cart/items'.\nТест: request.delete('cart') сұранысымен себетті тазала. { productId: 10, quantity: 1, size: 'M' } data-мен request.post('cart/items') жібер.\n409 жауап кодын және body.error.code 'OUT_OF_STOCK' екенін тексер. Содан кейін request.get('cart') жіберіп, cart.items.length 0-ге тең екенін тексер.",
        "template": "Сайт нұсқасы: 2.0\nҚате мән: productId 10 (қоймада жоқ)\nКүтемін: код (сан); error.code (өз жауабың); себет бос\nМенің тестім:\n(«Автотесттер» терезесіндегі кодты осында қой)\nІске қосу: (Passed / Failed: бірінші хабарлама / Blocked: себебі)"
      }
    ],
    "links": [
      [
        "2.0 зертханасы: автотесттер",
        "labs.html?version=2.0&tool=tests"
      ],
      [
        "Негативтік автотесттер",
        "kb.html#negative-auto"
      ],
      [
        "API: позитив, негатив және күй",
        "kb.html#api-test-design"
      ],
      [
        "Автотест неге қызыл",
        "kb.html#automation-diagnostics"
      ]
    ],
    "template": "Сайт нұсқасы: 2.0\nҚате мән: quantity 0\nКүтемін: код (сан); error.code (өз жауабың); себет бос\nМенің тестім:\n(«Автотесттер» терезесіндегі кодты осында қой)\nІске қосу: (Passed / Failed: бірінші хабарлама / Blocked: себебі)",
    "whyTemplate": "Неге жасыл негативтік тест — сәттілік: (өз жауабың)\nНеге тек 400 кодын емес, error.code-ты да тексереміз: (өз жауабың)\nТест басында request.delete('cart') шақыру не үшін керек: (өз жауабың)\nНегативтік тест соңында cart.items.length неге тексеріледі: (өз жауабың)",
    "practiceKind": "written"
  },
  "sourcePairs": [
    "k2-14"
  ]
};
