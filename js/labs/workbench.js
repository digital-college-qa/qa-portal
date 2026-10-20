(function () {
  'use strict';
  const kz = (() => { try { return JSON.parse(localStorage.getItem('qc_lang')) === 'kz'; } catch (_) { return false; } })();
  const tr = (ru, kk) => kz ? kk : ru;
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const api = window.QATraining;
  const sampleTest = `import { test, expect } from '@playwright/test';\n\ntest('Открывается меню / Мәзір ашылады', async ({ page }) => {\n  await page.goto('menu.html');\n  await expect(page.getByRole('heading', { name: /^(Меню|Мәзір)$/, exact: true })).toBeVisible();\n});`;
  document.getElementById('app').innerHTML = `<section class="wrap lab">
    <h1>${tr('Практикум API и автотестов','API және автотесттер практикумы')}</h1>
    <p class="lab-note">${tr('Составляй учебные запросы без аккаунта во внешнем сервисе. Отправка запросов и запуск тестов станут доступны после подключения учебных стендов 1.5 и 2.0.','Сыртқы сервиске тіркелмей оқу сұраныстарын құрастыр. Сұраныс жіберу және тест іске қосу 1.5 пен 2.0 оқу стендтері қосылғанда қолжетімді болады.')}</p>
    <div class="lab-top"><label>${tr('Учебная версия','Оқу нұсқасы')} <select id="lab-version"><option>1.5</option><option>2.0</option></select></label>
    <a href="kb.html#api-client">${tr('Как заполнить поля API-клиента','API клиент өрістерін толтыру')}</a> · <a href="kb.html#playwright-basics">${tr('Первые тесты Playwright','Алғашқы Playwright тесттері')}</a></div>
    <div class="lab-grid">
      <section class="lab-panel"><h2>${tr('Конструктор запроса','Сұраныс құрастыру')}</h2>
        <div class="lab-method"><label>Method<select id="lab-method">${['GET','POST','PUT','PATCH','DELETE'].map(m=>`<option>${m}</option>`).join('')}</select></label>
        <label>URL<input id="lab-url" value="/products" spellcheck="false"></label></div>
        <label>Params (JSON)<textarea id="lab-params" spellcheck="false">{"category":"coffee"}</textarea></label>
        <label>Headers (JSON)<textarea id="lab-headers" spellcheck="false">{"Accept":"application/json"}</textarea></label>
        <label>Authorization · Bearer Token<input id="lab-token" type="password" autocomplete="off" placeholder="${tr('Только учебный токен; не сохраняется','Тек оқу токені; сақталмайды')}"></label>
        <label>Body · JSON<textarea id="lab-body" spellcheck="false"></textarea></label>
        <div class="lab-actions"><button class="btn" id="lab-preview" type="button">${tr('Собрать запрос','Сұранысты құрастыру')}</button><button class="btn btn-ghost" id="lab-send" disabled type="button">Send</button><button class="btn btn-ghost" id="lab-stop" disabled type="button">${tr('Остановить','Тоқтату')}</button></div>
        <p role="status" id="lab-message"></p>
      </section>
      <section class="lab-panel"><h2>${tr('Запрос и ответ','Сұраныс пен жауап')}</h2>
        <p class="lab-note">${tr('Проверь Method, URL и JSON перед отправкой. Токен скрыт в предпросмотре.','Жібермес бұрын Method, URL және JSON тексер. Алдын ала қарауда токен жасырылған.')}</p>
        <h3>${tr('Предпросмотр запроса','Сұранысты алдын ала қарау')}</h3><pre id="lab-request">${tr('Нажми «Собрать запрос».','«Сұранысты құрастыру» батырмасын бас.')}</pre>
        <h3>Response · Status / Time / Headers / Body</h3><pre id="lab-response">${tr('API-стенд пока не подключён. Ответов от сервера ещё нет.','API стенді әлі қосылмаған. Сервер жауабы әзірге жоқ.')}</pre>
      </section>
    </div>
    <section class="lab-panel" style="margin-top:20px"><h2>Playwright · ${tr('версия 2.0','2.0 нұсқа')}</h2>
      <p id="lab-runner-note" class="lab-note"></p>
      <label>${tr('Код теста (JavaScript)','Тест коды (JavaScript)')}<textarea id="lab-test" class="lab-code" spellcheck="false">${esc(sampleTest)}</textarea></label>
      <div class="lab-actions"><button id="lab-run" class="btn" disabled type="button">${tr('Запустить тест','Тестті іске қосу')}</button></div>
      <pre id="lab-test-result">${tr('Запуск ещё не выполнялся.','Тест әлі іске қосылмаған.')}</pre>
    </section></section>`;
  const el = id => document.getElementById(id);
  let controller = null;
  function request() { return api.buildRequest({ method:el('lab-method').value,path:el('lab-url').value,params:el('lab-params').value,headers:el('lab-headers').value,token:el('lab-token').value,body:el('lab-body').value }); }
  function preview() {
    const req = request(), display = { ...req, headers:{...req.headers} };
    Object.keys(display.headers).forEach(k => { if (/authorization|cookie|token|api.?key/i.test(k)) display.headers[k] = '[hidden]'; });
    el('lab-request').textContent = JSON.stringify(display,null,2);
    return req;
  }
  function refresh() {
    const auto = el('lab-version').value === '2.0';
    el('lab-send').disabled = !api.connected('api') || Boolean(controller);
    el('lab-run').disabled = !auto || !api.connected('playwright') || Boolean(controller);
    el('lab-runner-note').textContent = auto
      ? tr('Редактор готов. Для реального запуска нужен подключённый учебный runner Playwright.','Редактор дайын. Нақты іске қосу үшін оқу Playwright runner қосылуы керек.')
      : tr('В версии 1.5 доступен API-клиент. Автотесты предназначены для версии 2.0.','1.5 нұсқада API клиент бар. Автотесттер 2.0 нұсқаға арналған.');
  }
  el('lab-preview').addEventListener('click', () => { try {preview();el('lab-message').textContent=tr('Запрос собран. Отправка не выполнялась.','Сұраныс құрастырылды. Жіберілген жоқ.');} catch(e){el('lab-message').textContent=e.message;} });
  el('lab-version').addEventListener('change',refresh);
  el('lab-stop').addEventListener('click',()=>controller?.abort());
  async function run(kind, payload, output) {
    controller = new AbortController(); refresh(); el('lab-stop').disabled=false;
    try { const result=await api.execute(kind,el('lab-version').value,payload,controller.signal);el(output).textContent=JSON.stringify(result,null,2); }
    catch(e){el(output).textContent=e.name==='AbortError'?tr('Остановлено.','Тоқтатылды.'):e.message;}
    finally{controller=null;el('lab-stop').disabled=true;refresh();}
  }
  el('lab-send').addEventListener('click',()=>{try{run('api',preview(),'lab-response');}catch(e){el('lab-message').textContent=e.message;}});
  el('lab-run').addEventListener('click',()=>run('playwright',{code:el('lab-test').value},'lab-test-result'));
  refresh();
})();
