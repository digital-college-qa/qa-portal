const { test, afterEach } = require('node:test');
const assert = require('node:assert/strict');
require('../js/labs/runtime.js');
const lab = globalThis.QATraining;
afterEach(() => { lab.attach('api', null); lab.attach('playwright', null); });

test('builds query without a request body and encodes input', () => {
  const r = lab.buildRequest({path:'/products',params:'{"q":"кофе & чай","limit":5}'});
  const url = new URL(r.path, 'https://training.invalid');
  assert.equal(url.searchParams.get('q'), 'кофе & чай');
  assert.equal(url.searchParams.get('limit'), '5');
  assert.equal(r.method, 'GET'); assert.ok(!('body' in r));
});
test('builds JSON operation and normalizes bearer header', () => {
  const r = lab.buildRequest({method:'post',path:'/cart/items',body:'{"quantity":1}',headers:'{"authorization":"old"}',token:'demo'});
  assert.equal(r.method,'POST'); assert.equal(r.headers.Authorization,'Bearer demo');
  assert.equal(Object.keys(r.headers).filter(k=>k.toLowerCase()==='authorization').length,1);
  assert.equal(r.headers['Content-Type'],'application/json');
  assert.deepEqual(JSON.parse(r.body),{quantity:1});
});
test('rejects malformed JSON, GET bodies and non-object fields', () => {
  for (const input of [{path:'/x',params:'null'},{path:'/x',headers:'[]'},{path:'/x',body:'{}'},{method:'POST',path:'/x',body:'bad'},{path:'/x',params:'{"q":{}}'}]) assert.throws(()=>lab.buildRequest(input));
});
test('rejects external paths, traversal and header injection', () => {
  for (const path of ['https://example.com','//example.com','/../home.html','/%2e%2e/home','/x#fragment','/x\\y']) assert.throws(()=>lab.buildRequest({path}));
  assert.throws(()=>lab.buildRequest({path:'/x',token:'demo\nInjected: true'}));
  assert.throws(()=>lab.buildRequest({path:'/x',headers:'{"X-Test":"a\\nb"}'}));
});
test('does not manufacture API or test execution results when disconnected', async () => {
  await assert.rejects(lab.execute('api','1.5',{}),/пока не подключён/);
  await assert.rejects(lab.execute('playwright','2.0',{}),/пока не подключён/);
});
test('version gates and abort signal reach the future adapter', async () => {
  const controller = new AbortController();
  lab.attach('api',{execute:({version,payload,signal})=>({version,payload,sameSignal:signal===controller.signal})});
  await assert.rejects(lab.execute('api','1.0',{}),/unavailable/);
  await assert.rejects(lab.execute('playwright','1.5',{}),/unavailable/);
  const r = await lab.execute('api','1.5',{path:'/products'},controller.signal);
  assert.equal(r.sameSignal,true); assert.equal(r.version,'1.5');
});
