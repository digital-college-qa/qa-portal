const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const context = vm.createContext({window: {KB: []}});
for (const file of fs.readdirSync(path.join(root, 'js/kb')).filter(f => f.endsWith('.js'))) {
  vm.runInContext(fs.readFileSync(path.join(root, 'js/kb', file), 'utf8'), context, {filename: file});
}
const topics = context.window.KB;
const ids = new Set(topics.map(t => t.id));
test('knowledge topics have unique stable identifiers and both languages', () => {
  assert.equal(topics.length, ids.size);
  for (const topic of topics) {
    assert.match(topic.id, /^[a-z0-9-]+$/);
    for (const language of ['ru', 'kz']) {
      assert.ok(topic[language]?.title?.trim(), topic.id + ': title ' + language);
      assert.ok(topic[language]?.short?.trim(), topic.id + ': short ' + language);
    }
  }
});
test('practical tool guides have usable steps and working internal destinations', () => {
  const guides = topics.filter(t => t.block === 'toolkit');
  assert.ok(guides.length > 0);
  for (const guide of guides) {
    for (const language of ['ru', 'kz']) {
      const content = guide[language];
      assert.ok(content.steps.length >= 4, guide.id + ': steps ' + language);
      for (const step of content.steps) assert.ok(step.length === 2 && step.every(s => typeof s === 'string' && s.trim()));
      assert.ok(content.example && content.template && content.mistakes.length && content.check.length);
      for (const match of JSON.stringify(content).matchAll(/\]\(([^)]+)\)/g)) {
        const href = match[1];
        if (href.startsWith('#')) assert.ok(ids.has(href.slice(1)) || href === '#glossary', guide.id + ': ' + href);
        else if (!href.startsWith('https://')) assert.ok(fs.existsSync(path.join(root, href.split(/[?#]/)[0])), guide.id + ': ' + href);
      }
    }
    for (const [, source] of guide.sources || []) assert.equal(new URL(source).protocol, 'https:');
  }
});
test('beginner software comparison links to existing knowledge topics', () => {
  const overview = topics.find(t => t.id === 'tool-software-map');
  assert.ok(overview);
  for (const language of ['ru', 'kz']) {
    const links = [...overview[language].body.matchAll(/\]\(#([^)]+)\)/g)];
    assert.ok(links.length > 0);
    for (const [, target] of links) assert.ok(ids.has(target), 'Missing destination: ' + target);
  }
});
