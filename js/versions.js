/* Release selection and storage shared by the shop, API client and runner. */
(function (root) {
  'use strict';
  const releases = Object.freeze({
    '1.0': { title: ['Первые шаги', 'Алғашқы қадамдар'], products: 6, api: false, playwright: false, coverage: '70%', stage: 'ready' },
    '1.5': { title: ['Проверяем по требованиям', 'Талаптар бойынша тексеру'], products: 12, api: true, playwright: false, coverage: '100%', stage: 'ready' },
    '2.0': { title: ['Расследуем вместе', 'Бірге зерттейміз'], products: 40, api: true, playwright: true, coverage: '100% разделов', stage: 'preview' }
  });
  const rawRead = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch (_) { return fallback; } };
  const rawWrite = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {} };
  let selected = rawRead('qc_version', '1.0');
  if (selected === '1.1') selected = '1.5';
  if (typeof location !== 'undefined') {
    const requested = new URLSearchParams(location.search).get('version');
    if (releases[requested]) selected = requested;
  }
  const current = releases[selected] ? selected : '1.0';
  rawWrite('qc_version', current);
  const scoped = key => key.startsWith('qc_') && !['qc_lang', 'qc_version'].includes(key);
  const keyFor = key => scoped(key) ? 'qc_v' + current + '_' + key.slice(3) : key;
  const read = (key, fallback) => key === 'qc_version' ? current : rawRead(keyFor(key), fallback);
  const write = (key, value) => rawWrite(keyFor(key), value);
  function select(version) { if (!releases[version]) throw Error('Unknown release'); rawWrite('qc_version', version); }
  root.QAVersions = Object.freeze({ releases, current, profile: releases[current], read, write, keyFor, select });
})(typeof window === 'undefined' ? globalThis : window);
