/* In-lesson worksheets. Drafts stay in this browser; example results are never submitted as the student's work. */
(function () {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const tr = (lang, ru, kz) => lang === 'kz' ? kz : ru;

  function render(x, lang) {
    const sheet = x.worksheet;
    const text = tr(lang, 'Работа прямо в уроке', 'Сабақтағы жұмыс');
    const controls = `<div class="ln-work-actions"><button type="button" class="btn ln-work-copy">${tr(lang,'Скопировать работу','Жұмысты көшіру')}</button><span class="ln-work-status" role="status" aria-live="polite"></span></div>`;
    if (!sheet?.sections) {
      return `<div class="ln-work" data-work-editor><label for="lesson-work-text">${text}</label><p class="ln-work-help">${tr(lang,'Замени подсказки в круглых скобках своим ответом и убери сами скобки. Неизвестное не придумывай: напиши, что нужно уточнить.','Дөңгелек жақшадағы нұсқауларды өз жауабыңмен ауыстырып, жақшалардың өзін өшір. Белгісізді ойдан қоспа: нені нақтылау керегін жаз.')}</p><textarea id="lesson-work-text" class="ln-work-text" data-work-text rows="10" spellcheck="false">${esc(x.template)}</textarea>${controls}</div>`;
    }
    return `<div class="ln-work" data-work-editor><p class="ln-work-title">${text}</p><p class="ln-work-help">${tr(lang,'Поля со звёздочкой нужны для этой работы. Предусловия и тестовые данные заполняй только при необходимости. Пустые поля не считаются ответом.','Жұлдызшалы өрістер осы жұмысқа қажет. Алғышарттар мен тест деректерін тек қажет болса толтыр. Бос өріс жауап болып саналмайды.')}</p>${sheet.sections.map((section, i) => `<details class="ln-work-record"${i === 0 ? ' open' : ''}><summary>${esc(section.title)}</summary><div class="ln-work-fields">${section.fields.map(field => {
      const id = `work-${field.key}`;
      const attrs = `id="${esc(id)}" data-work-field="${esc(field.key)}"${field.required ? ' aria-required="true"' : ''}${field.help ? ` aria-describedby="${esc(id)}-help"` : ''}`;
      const input = field.options ? `<select ${attrs}>${field.options.map(option => `<option value="${esc(option)}"${option === field.value ? ' selected' : ''}>${esc(option || tr(lang,'Выбери','Таңда'))}</option>`).join('')}</select>`
        : field.multiline ? `<textarea ${attrs} rows="${field.rows || 3}" placeholder="${esc(field.placeholder || '')}">${esc(field.value || '')}</textarea>`
          : `<input ${attrs} type="text" value="${esc(field.value || '')}" placeholder="${esc(field.placeholder || '')}"${field.readOnly ? ' readonly' : ''}>`;
      return `<div class="ln-work-field${field.multiline ? ' ln-work-wide' : ''}"><label for="${esc(id)}">${esc(field.label)}${field.required ? ' *' : ''}</label>${input}${field.help ? `<small id="${esc(id)}-help">${esc(field.help)}</small>` : ''}</div>`;
    }).join('')}</div></details>`).join('')}${controls}</div>`;
  }

  function bind(root, x, lang, route) {
    const editor = root.querySelector('[data-work-editor]');
    if (!editor) return;
    const status = editor.querySelector('.ln-work-status');
    const plain = editor.querySelector('[data-work-text]');
    const fields = [...editor.querySelectorAll('[data-work-field]')];
    const definitions = x.worksheet?.sections?.flatMap(s => s.fields) || [];
    // A lesson may set draftVersion after a template change, so old drafts do not hide the new template.
    const key = `qaPortal.lessonDraft.k1-20261027.${route}.${lang}${x.draftVersion ? "." + x.draftVersion : ""}`;
    let restored = false;
    try {
      const draft = JSON.parse(localStorage.getItem(key) || 'null');
      if (draft?.text !== undefined && plain) { plain.value = draft.text; restored = true; }
      for (const field of fields) {
        if (typeof draft?.values?.[field.dataset.workField] === 'string') {
          const definition = definitions.find(d => d.key === field.dataset.workField);
          if (!definition?.readOnly) field.value = draft.values[field.dataset.workField];
          restored = true;
        }
      }
    } catch (_) { /* The editor still works if storage is unavailable. */ }
    const values = () => Object.fromEntries(fields.map(field => [field.dataset.workField, field.value]));
    const serialize = () => {
      if (plain) return plain.value;
      const current = values();
      return x.worksheet.sections.map(section => section.title + '\n' + section.fields.flatMap(field => {
        const value = (current[field.key] || '').trim();
        if (!value && !field.required) return [];
        return [field.label + ': ' + (value || tr(lang,'(не заполнено)','(толтырылмаған)'))];
      }).join('\n')).join('\n\n');
    };
    const save = () => {
      try {
        localStorage.setItem(key, JSON.stringify(plain ? {text: plain.value} : {values: values()}));
        status.textContent = tr(lang,'Черновик сохранён в этом браузере.','Жоба осы браузерде сақталды.');
      } catch (_) {
        status.textContent = tr(lang,'Сохранение недоступно. Скопируй работу в заметки.','Сақтау қолжетімсіз. Жұмысты жазбаларға көшір.');
      }
    };
    editor.addEventListener('input', save);
    editor.addEventListener('change', save);
    if (restored) status.textContent = tr(lang,'Восстановлен твой черновик.','Жұмыс жобаңыз қалпына келтірілді.');
    editor.querySelector('.ln-work-copy').addEventListener('click', async () => {
      const text = serialize();
      const current = values();
      // Check only explicit template hints: real content such as «(₸)» is a valid answer.
      const unfinished = value => /<[^>]+>/.test(value) || (x.templateHints || []).some(hint => value.includes(hint));
      const missing = plain ? unfinished(text) : definitions.some(field => (field.required && (!(current[field.key] || '').trim() || unfinished(current[field.key]))) || (field.mustRun && current[field.key] === 'Not run'));
      try {
        if (!navigator.clipboard) throw new Error('clipboard unavailable');
        await navigator.clipboard.writeText(text);
        status.textContent = missing ? tr(lang,'Черновик скопирован. Перед сдачей заполни оставшиеся поля.','Жоба көшірілді. Тапсырар алдында қалған өрістерді толтыр.') : tr(lang,'Работа скопирована. Вставь её в свою ветку Discord.','Жұмыс көшірілді. Discord-та өз тармағыңа қой.');
      } catch (_) {
        prompt(tr(lang,'Скопируй работу: Ctrl+C или «Копировать»','Жұмысты көшір: Ctrl+C не «Көшіру»'), text);
      }
    });
  }
  window.LEARN_PRACTICE = {render, bind};
})();
