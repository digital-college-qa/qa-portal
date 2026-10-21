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

function strings(value) {
  if (typeof value === 'string') return [value];
  return value && typeof value === 'object' ? Object.values(value).flatMap(strings) : [];
}

test('all handbook destinations exist and release-specific links use current versions', () => {
  const validVersions = new Set(['1.0', '1.5', '2.0']);
  for (const topic of topics) for (const language of ['ru', 'kz']) {
    for (const value of strings(topic[language])) {
      for (const [, href] of value.matchAll(/\]\(([^)]+)\)/g)) {
        if (/^https?:/.test(href)) continue;
        const url = new URL(href, 'https://training.invalid/kb.html');
        assert.ok(fs.existsSync(path.join(root, url.pathname.slice(1))), topic.id + ': ' + href);
        if (url.searchParams.has('version')) assert.ok(validVersions.has(url.searchParams.get('version')), href);
        if (url.pathname === '/kb.html' && url.hash) {
          const id = url.hash.slice(1);
          assert.ok(ids.has(id) || id === 'glossary' || id === 'home' || id.startsWith('catalog-'), topic.id + ': ' + href);
        }
      }
    }
  }
});

test('lesson terms resolve to their glossary and quizzes have a valid answer', () => {
  const lessons = vm.createContext({window: {LEARN_PAIRS: {}}});
  for (const file of fs.readdirSync(path.join(root, 'js/learn')).filter(f => /^k1-.*\.js$/.test(f))) {
    vm.runInContext(fs.readFileSync(path.join(root, 'js/learn', file), 'utf8'), lessons);
  }
  for (const [id, pair] of Object.entries(lessons.window.LEARN_PAIRS)) {
    const glossary = new Set(pair.glossary.map(row => row[0]));
    for (const language of ['ru', 'kz']) {
      for (const value of strings(pair[language])) for (const [, term] of value.matchAll(/\[\[([^\]]+)\]\]/g)) {
        assert.ok(glossary.has(term.split('@').at(-1)), id + ': ' + term);
      }
      for (const mode of ['s', 'd']) for (const [question, options, answer, explanation] of pair[language].quiz[mode]) {
        assert.ok(question && explanation && Number.isInteger(answer) && answer >= 0 && answer < options.length, id);
      }
    }
  }
});

test('published Playwright examples compile in the actual teaching runner', async () => {
  const {compile} = await import('../server/language.mjs');
  let checked = 0;
  for (const topic of topics) for (const language of ['ru', 'kz']) for (const value of strings(topic[language])) {
    for (const [, code] of value.matchAll(/```[^\n]*\n([\s\S]*?)```/g)) {
      if (!code.includes("from '@playwright/test'")) continue;
      assert.ok(compile(code).length, topic.id + ': ' + language);
      checked++;
    }
  }
  assert.ok(checked >= 4);
});
