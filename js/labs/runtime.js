/* Extension points for teaching tools. The shop and API/Playwright runners
   are independent. No simulated result is presented as a real test run. */
(function (root) {
  'use strict';
  const versions = Object.freeze({
    '1.0': Object.freeze({ api: false, playwright: false }),
    '1.5': Object.freeze({ api: true, playwright: false }),
    '2.0': Object.freeze({ api: true, playwright: true })
  });
  const adapters = { api: null, playwright: null };
  const parseObject = (value, field) => {
    const result = typeof value === 'string' ? JSON.parse(value || '{}') : (value || {});
    if (!result || Array.isArray(result) || typeof result !== 'object') throw new Error(field + ': JSON object required');
    return result;
  };
  function buildRequest(input) {
    const method = String(input.method || 'GET').toUpperCase();
    if (!['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) throw new Error('Unsupported method');
    const path = String(input.path || '').trim();
    if (!path.startsWith('/') || path.startsWith('//') || /[\\#]/.test(path) || /(?:^|\/)\.\.(?:\/|$)/.test(path)) throw new Error('URL: use a relative API path, e.g. /products');
    const parsedPath = new URL(path, 'https://training.invalid');
    if (parsedPath.pathname.split('/').some(part => part === '..') || /%2e|%2f|%5c/i.test(path)) throw new Error('URL: invalid path');
    const params = parseObject(input.params, 'Params');
    const headers = parseObject(input.headers, 'Headers');
    const url = new URL(path, 'https://training.invalid');
    Object.entries(params).forEach(([key, value]) => {
      if (!['string', 'number', 'boolean'].includes(typeof value)) throw new Error('Params: scalar values required');
      url.searchParams.set(key, String(value));
    });
    Object.entries(headers).forEach(([key, value]) => {
      if (typeof value !== 'string' || /[\r\n]/.test(key + value)) throw new Error('Headers: string values without line breaks required');
    });
    const token = String(input.token || '').trim();
    if (/[\r\n]/.test(token)) throw new Error('Authorization: invalid token');
    if (token) {
      Object.keys(headers).forEach(key => { if (key.toLowerCase() === 'authorization') delete headers[key]; });
      headers.Authorization = 'Bearer ' + token;
    }
    let body;
    if (input.body && String(input.body).trim()) {
      if (method === 'GET') throw new Error('GET: put parameters in Params, not Body');
      body = JSON.stringify(JSON.parse(input.body));
      if (!Object.keys(headers).some(k => k.toLowerCase() === 'content-type')) headers['Content-Type'] = 'application/json';
    }
    return { method, path: url.pathname + url.search, headers, ...(body === undefined ? {} : { body }) };
  }
  function attach(kind, adapter) {
    if (!(kind in adapters)) throw new Error('Unknown adapter');
    if (adapter !== null && (typeof adapter !== 'object' || typeof adapter.execute !== 'function')) throw new Error('Adapter must implement execute');
    adapters[kind] = adapter;
  }
  async function execute(kind, version, payload, signal) {
    if (!versions[version] || !versions[version][kind]) throw new Error('Tool unavailable for this version');
    if (!adapters[kind]) throw new Error('Учебный стенд пока не подключён / Оқу стенді әлі қосылмаған');
    return adapters[kind].execute({ version, payload, signal });
  }
  // A future endpoint adapter must route paths inside its dedicated API prefix,
  // return actual status/headers/body/duration/requestId, and support AbortSignal.
  // A Playwright adapter must run @playwright/test in an isolated runner and
  // return runId, status, test results and artifacts. Never evaluate tests here.
  root.QATraining = Object.freeze({ versions, buildRequest, attach, execute, connected: kind => Boolean(adapters[kind]) });
})(typeof window === 'undefined' ? globalThis : window);
