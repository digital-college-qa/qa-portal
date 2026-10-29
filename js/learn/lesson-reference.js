/* Per-lesson translation and ID reference, derived from current teaching content.
   Area codes are this project's naming convention, not an industry standard. */
(function () {
  'use strict';
  const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  // code: [English, RU, KZ, explanation RU, explanation KZ]
  const codes={
    TC:['Test Case','Тест-кейс','Тест-кейс','Первые буквы Test и Case. Например, TC-CRT-001 — тест-кейс корзины.','Test және Case сөздерінің алғашқы әріптері. TC-CRT-001 — себеттің тест-кейсі.'],
    BUG:['Bug','Баг / ошибка','Баг / қате','Bug — «ошибка». В начале ID помечает карточку баг-репорта.','Bug — «қате». ID басында баг-репорт карточкасын белгілейді.'],
    CL:['Checklist','Чек-лист','Чек-лист','Короткая метка чек-листа в ID.','ID ішіндегі чек-листтің қысқа белгісі.'],
    CRT:['Cart','Корзина','Себет','CaRT → CRT: оставили C, R, T. Это код раздела «Корзина» в наших ID.','CaRT → CRT: C, R, T әріптері қалды. Біздің ID-де бұл «Себет» бөлімінің коды.'],
    MNU:['Menu','Меню','Мәзір','MeNU → MNU: убрали гласную e. Код раздела меню.','MeNU → MNU: e дауысты әрпі алынды. Мәзір бөлімінің коды.'],
    PRD:['Product','Товар / страница напитка','Тауар / сусын беті','PRoDuct → PRD. Код страницы товара или правила о товаре.','PRoDuct → PRD. Тауар бетінің не тауар туралы талаптың коды.'],
    ORD:['Order','Заказ','Тапсырыс','ORDer → ORD: первые три буквы. Код оформления заказа.','ORDer → ORD: алғашқы үш әріп. Тапсырысты рәсімдеу коды.'],
    NAV:['Navigation','Навигация','Навигация','NAVigation → NAV. Переходы по страницам и ссылкам.','NAVigation → NAV. Беттер мен сілтемелер арқылы өту.'],
    CAT:['Catalog','Каталог','Каталог','CATalog → CAT. Например, CAT-02 — номер требования о каталоге.','CATalog → CAT. Мысалы, CAT-02 — каталог туралы талап нөмірі.'],
    LNG:['Language','Язык сайта','Сайт тілі','LaNGuage → LNG: метка языкового раздела.','LaNGuage → LNG: тіл бөліміне арналған белгі.'],
    SRC:['Search','Поиск','Іздеу','SeaRCh → SRC. В образце BUG-SRC-001 баг относится к поиску.','SeaRCh → SRC. BUG-SRC-001 мысалында баг іздеуге қатысты.'],
    REG:['Registration','Регистрация','Тіркелу','REGistration → REG. Возможная метка раздела регистрации.','REGistration → REG. Тіркелу бөлімінің ықтимал белгісі.'],
    BTN:['Button','Кнопка','Батырма','BuTtoN → BTN: убрали гласные и повтор t. Метка кнопки.','BuTtoN → BTN: дауыстылар мен қайталанған t алынды. Батырма белгісі.'],
    REV:['Review example','Учебное требование для разбора','Талдауға арналған оқу талабы','REV-1 и REV-2 в паре 7 — метки учебных требований для ревью.','7-сабақтағы REV-1 мен REV-2 — талдауға арналған оқу талаптарының белгілері.'],
    ID:['Identifier','Идентификатор','Идентификатор','Короткое имя или номер записи, чтобы на неё ссылаться.','Жазбаға сілтеме жасау үшін берілетін қысқа атау не нөмір.'],
    API:['Application Programming Interface','Интерфейс программ','Бағдарламалар интерфейсі','Способ, которым программы обращаются друг к другу.','Бағдарламалардың бір-біріне жүгіну тәсілі.'],
    HTTP:['Hypertext Transfer Protocol','Протокол HTTP','HTTP хаттамасы','Правила обмена запросами и ответами между клиентом и сервером.','Клиент пен сервер арасындағы сұрау және жауап алмасу ережелері.'],
    JSON:['JavaScript Object Notation','Формат данных JSON','JSON деректер пішімі','Текстовый формат данных: имена полей и их значения.','Өріс атаулары мен мәндері жазылатын мәтіндік деректер пішімі.'],
    UI:['User Interface','Интерфейс пользователя','Пайдаланушы интерфейсі','То, что человек видит на экране: кнопки, поля, тексты.','Адам экранда көретін батырмалар, өрістер мен мәтіндер.'],
    UX:['User Experience','Опыт пользователя','Пайдаланушы тәжірибесі','Насколько понятно и удобно выполнить задачу.','Тапсырманы орындау қаншалықты түсінікті және ыңғайлы.'],
    QA:['Quality Assurance','Обеспечение качества','Сапаны қамтамасыз ету','Работа команды, которая помогает предотвращать проблемы качества.','Сапа мәселелерінің алдын алуға көмектесетін команда жұмысы.'],
    CSS:['Cascading Style Sheets','Таблицы стилей','Стиль кестелері','Правила внешнего вида страницы: размеры, цвета, расположение.','Бет көрінісінің ережелері: өлшем, түс және орналасу.'],
    '3W':['What, Where, When','Что, где, после чего','Не, қайда, неден кейін','Три вопроса для понятного заголовка бага.','Багтың түсінікті тақырыбына арналған үш сұрақ.']
  };
  const areaCodes=new Set(['TC','BUG','CL','CRT','MNU','PRD','ORD','NAV','CAT','LNG','SRC','REG','BTN','REV']);
  const extraTerms=[
    ['Passed','Проверка пройдена','Тексеру өтті'],['Failed','Проверка не пройдена','Тексеру өтпеді'],
    ['Not run','Ещё не запускали','Әлі іске қосылмаған'],['Blocked','Проверка заблокирована','Тексеру бұғатталған'],
    ['Skipped','Проверка пропущена','Тексеру өткізіліп жіберілген'],
    ['New','Новый','Жаңа'],['Open','Открыт','Ашық'],['In Progress','В работе','Жұмыста'],
    ['Fixed','Исправлен','Түзетілді'],['Retest','Повторная проверка исправления','Түзетуді қайта тексеру'],
    ['Closed','Закрыт','Жабық'],['Reopened','Переоткрыт','Қайта ашылды'],['Rejected','Отклонён','Қабылданбады'],
    ['Duplicate','Дубликат','Қайталанған баг'],['Cannot Reproduce','Не получается повторить','Қайталау мүмкін емес'],
    ['Blocker','Блокирующая проблема','Жұмысты тоқтататын мәселе'],['Critical','Критическая проблема','Өте маңызды мәселе'],
    ['Major','Существенная проблема','Елеулі мәселе'],['Minor','Небольшая проблема','Шағын мәселе'],['Trivial','Мелкая проблема','Ұсақ мәселе'],
    ['High','Высокий','Жоғары'],['Medium','Средний','Орташа'],['Low','Низкий','Төмен'],
    ['Review','Проверка работы','Жұмысты тексеру'],['Smoke testing','Проверка главных функций','Негізгі функцияларды тексеру'],
    ['Regression testing','Регрессионное тестирование','Регрессиялық тестілеу']
  ];
  // Later project lessons have prose rather than a `terms` list. Keep their core words explicit;
  // matching words from assigned KB topics and status labels are appended below.
  const projectTerms={
    18:[['Feature map','Карта функций','Функциялар картасы'],['Risk','Риск','Тәуекел'],['Scope','Объём проверки','Тексеру қамтуы'],['Test plan','Тест-план','Тест-жоспар'],['Entry criteria','Критерии начала','Бастау критерийлері'],['Exit criteria','Критерии завершения','Аяқтау критерийлері']],
    19:[['Test case','Тест-кейс','Тест-кейс'],['Test suite','Набор тест-кейсов','Тест-кейстер жиыны'],['Checklist','Чек-лист','Чек-лист'],['Review','Проверка работы','Жұмысты тексеру'],['Expected result','Ожидаемый результат','Күтілетін нәтиже'],['Test data','Тестовые данные','Тест деректері']],
    20:[['Test run','Прогон проверок','Тексерулерді орындау'],['Functional testing','Функциональное тестирование','Функционалдық тестілеу'],['Smoke testing','Проверка главных функций','Негізгі функцияларды тексеру'],['Exploratory testing','Исследовательское тестирование','Зерттеу тестілеуі'],['Test charter','Задача исследования','Зерттеу тапсырмасы'],['Session','Сессия проверки','Тексеру сессиясы']],
    21:[['Cross-browser testing','Проверка в разных браузерах','Әртүрлі браузерде тексеру'],['Responsive design','Адаптивное оформление','Бейімделетін дизайн'],['Viewport','Область просмотра страницы','Бетті көру аймағы'],['Device mode','Режим телефона','Телефон режимі'],['Test environment','Тестовое окружение','Тест ортасы']],
    22:[['Automated test','Автотест','Автотест'],['Request','Запрос','Сұрау'],['Response','Ответ','Жауап'],['Assertion','Проверка в коде','Кодтағы тексеру'],['Log','Журнал событий','Оқиғалар журналы'],['Hypothesis','Предположение о причине','Себеп туралы жорамал']],
    23:[['Bug report','Баг-репорт','Баг-репорт'],['Duplicate','Дубликат','Қайталанған баг'],['Retesting','Проверка исправления','Түзетуді тексеру'],['Fixed build','Сборка с исправлением','Түзету бар жинақ'],['Closed','Закрыт','Жабық'],['Reopened','Переоткрыт','Қайта ашылды']],
    24:[['Regression testing','Регрессионное тестирование','Регрессиялық тестілеу'],['Regression test suite','Регрессионный набор','Регрессиялық жиын'],['Test metrics','Метрики тестирования','Тестілеу метрикалары'],['Pass rate','Процент пройденных проверок','Өткен тексерулер пайызы'],['Test coverage','Покрытие проверками','Тексерулермен қамту']],
    25:[['Test summary report / QA report','Отчёт о тестировании','Тестілеу есебі'],['Release recommendation','Рекомендация по выпуску','Шығару туралы ұсыныс'],['Known issues','Известные проблемы','Белгілі мәселелер'],['Evidence','Доказательство','Дәлел'],['Limitation','Ограничение проверки','Тексеру шектеуі'],['Next steps','Следующие действия','Келесі әрекеттер']],
    26:[['Demo','Показ работы','Жұмысты көрсету'],['Handover','Передача работы','Жұмысты тапсыру'],['Evidence','Доказательство','Дәлел'],['Scope','Объём проверки','Тексеру қамтуы'],['Feedback','Обратная связь','Кері байланыс'],['Untested','Не проверено','Тексерілмеген']]
  };

  const visibleFields=['intro','topic','learn','terms','why','explanation','examples','exampleLabels','sample','task','options','steps','tasks','template','whyTemplate','templateHints','prompt','remember'];
  function strings(value){
    if(typeof value==='string')return [value];
    if(value&&typeof value==='object')return Object.values(value).flatMap(strings);
    return [];
  }
  function lessonText(x){return visibleFields.flatMap(key=>strings(x[key])).join('\n');}
  const norm=value=>String(value).normalize('NFKC').toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
  const has=(text,term)=>(' '+norm(text)+' ').includes(' '+norm(term)+' ');
  function build(d,route,lang){
    const x=d[lang],index=lang==='kz'?2:1,text=lessonText(x),glossary=[],seen=new Set();
    function add(local,en){
      const key=norm(en);if(!local||!en||seen.has(key))return;
      seen.add(key);glossary.push({local,en});
    }
    // Two-level lessons own their core vocabulary. Do not pull unrelated KB topics into them.
    for(const term of x.referenceTerms||x.terms||[])add(term[0],term[1]);
    if(!glossary.length){
      const n=Number(route.split('-').pop());
      for(const term of projectTerms[n]||[])add(term[index],term[0]);
      const related=(window.STUDY_CONTENT?.topics||[]).filter(t=>t.pairs?.qa?.includes(n));
      for(const topic of related)for(const term of topic.terms||[]){
        if(has(text,term[index])||term[0].split(/\s*\/\s*/).some(part=>has(text,part)))add(term[index],term[0]);
      }
    }
    for(const term of extraTerms)if(has(text,term[0]))add(term[index],term[0]);
    // ID labels inside a displayed diagram are also words used in the lesson.
    const pictureCodes=(window.LEARN_ILLUSTRATIONS?.[route]?.[lang]||[]).flatMap(row=>row.referenceCodes||[]);
    const used=Object.keys(codes).filter(code=>{
      const pattern=new RegExp(`(^|[^\\p{L}\\p{N}_])${code}($|[^\\p{L}\\p{N}_])`,'u');
      return pattern.test(text.replace(/QA Portal/g,''))||pictureCodes.includes(code);
    });
    const abbreviations=used.map(code=>({code,en:codes[code][0],local:codes[code][index],why:codes[code][lang==='kz'?4:3],area:areaCodes.has(code)}));
    for(const row of abbreviations)if(row.area&&row.code!=='REV')add(row.local,row.en);
    const id=text.match(/\b(?:TC|BUG|CL)-[A-Z]{2,4}-\d{2,3}\b/);
    const example=id?{id:id[0],parts:id[0].split('-').map((part,i)=>i===2?part:codes[part]?.[index]||part)}:null;
    return {glossary,abbreviations,example};
  }
  function render(d,route,lang){
    const model=build(d,route,lang),kz=lang==='kz';
    const words=model.glossary.map(row=>`<div class="lr-word"><dt>${esc(row.local)}</dt><dd lang="en">${esc(row.en)}</dd></div>`).join('');
    const left=`<aside class="lr-side lr-left" aria-label="${kz?'Сабақ сөздігі':'Словарь пары'}"><details class="lr-panel" data-reference-panel open><summary>${kz?'Сабақ сөздігі':'Словарь пары'}<span class="lr-count">${model.glossary.length}</span></summary><div class="lr-content" tabindex="0" aria-label="${kz?'Сөз аудармалары':'Переводы слов'}"><p class="lr-note">${kz?'Қазақша → English':'Русский → English'}</p><dl>${words}</dl></div></details></aside>`;
    if(!model.abbreviations.length)return {left,right:'',model};
    const entries=model.abbreviations.map(row=>`<div class="lr-code"><dt><strong>${esc(row.code)}</strong><span lang="en">${esc(row.en)}</span></dt><dd><b>${esc(row.local)}</b><p>${esc(row.why)}</p></dd></div>`).join('');
    const example=model.example?`<div class="lr-id-example"><b>${kz?'ID-ді оқимыз':'Читаем ID'}</b><code>${esc(model.example.id)}</code><p>${model.example.parts.map(esc).join(' → ')}</p><p>${kz?'Соңындағы сан — жазбаның реттік нөмірі.':'Число в конце — порядковый номер записи.'}</p></div>`:'';
    const note=model.abbreviations.some(row=>row.area)?`<p class="lr-note">${kz?'ID-дегі бөлім кодтары — осы жобаның келісімі. Басқа командада өзгеше болуы мүмкін.':'Коды разделов в ID — договорённость этого проекта. В другой команде они могут отличаться.'}</p>`:'';
    const right=`<aside class="lr-side lr-right" aria-label="${kz?'Сабақ қысқартулары':'Сокращения пары'}"><details class="lr-panel" data-reference-panel open><summary>${kz?'Қысқартулар':'Сокращения пары'}<span class="lr-count">${model.abbreviations.length}</span></summary><div class="lr-content" tabindex="0" aria-label="${kz?'Қысқартулардың мағынасы':'Расшифровки сокращений'}">${note}${example}<dl>${entries}</dl></div></details></aside>`;
    return {left,right,model};
  }
  function mount(root,d,route,lang){
    const content=root.querySelector('.ln-first');
    if(!content)return;
    const refs=render(d,route,lang),frame=document.createElement('div');
    frame.className='lr-layout'+(refs.right?'':' lr-without-right');
    // Keep the existing lesson nodes: moving them preserves inputs, gallery state and listeners.
    content.replaceWith(frame);frame.insertAdjacentHTML('beforeend',refs.left+refs.right);frame.append(content);
    const small=window.matchMedia('(max-width: 1199px)');
    const adapt=()=>frame.querySelectorAll('[data-reference-panel]').forEach(panel=>{panel.open=!small.matches;});
    adapt();
    // A resize never accumulates global listeners after lesson/level navigation.
    if(window.LEARN_REFERENCE._mediaCleanup)window.LEARN_REFERENCE._mediaCleanup();
    small.addEventListener('change',adapt);
    window.LEARN_REFERENCE._mediaCleanup=()=>small.removeEventListener('change',adapt);
  }
  function dispose(){
    if(window.LEARN_REFERENCE._mediaCleanup)window.LEARN_REFERENCE._mediaCleanup();
    window.LEARN_REFERENCE._mediaCleanup=null;
  }
  window.LEARN_REFERENCE={build,render,mount,dispose,lessonText};
})();
