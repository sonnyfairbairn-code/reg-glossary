const test = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('./app');
const { toRomaji } = require('./romaji');
const data = require('./data/terms');

let server, base;
test.before(async () => {
  server = createApp().listen(0);
  await new Promise((r) => server.once('listening', r));
  base = `http://localhost:${server.address().port}`;
});
test.after(() => { server.closeAllConnections(); server.close(); });

const get = async (p) => {
  const r = await fetch(base + p);
  return { status: r.status, body: r.headers.get('content-type').includes('json') ? await r.json() : await r.text() };
};

test('romaji conversion', () => {
  assert.equal(toRomaji('しんさほうこくしょ'), 'shinsahoukokusho');
  assert.equal(toRomaji('やっきょくほう'), 'yakkyokuhou');
  assert.equal(toRomaji('ワクチン'), 'wakuchin');
  assert.equal(toRomaji('ちゅうしゃざい'), 'chuushazai');
  assert.equal(toRomaji('ウィッティヒ'), 'wittihi');
  assert.equal(toRomaji('フィッシャーエステルか'), 'fisshaaesuteruka');
});

test('data has unique terms, valid categories and kana-only readings', () => {
  const seen = new Set();
  for (const [en, , category, level, , tr] of data.terms) {
    assert.ok(!seen.has(en), `duplicate: ${en}`);
    seen.add(en);
    assert.ok(data.categories[category], `bad category: ${en}`);
    assert.ok([1, 2, 3].includes(level));
    assert.match(tr.ja[1], /^[぀-ヿ・]+$/, `reading not kana: ${en}`);
  }
});

test('meta lists languages and counts', async () => {
  const { body } = await get('/api/meta');
  assert.equal(body.total, data.terms.length);
  assert.ok(body.languages.find((l) => l.code === 'ja' && l.enabled));
});

test('search works in English, kanji, kana, katakana and romaji', async () => {
  for (const q of ['review report', '審査報告書', 'しんさほうこくしょ', 'shinsahoukokusho']) {
    const { body } = await get(`/api/terms?q=${encodeURIComponent(q)}`);
    assert.equal(body.results[0].slug, 'review-report', q);
  }
  const kata = await get(`/api/terms?q=${encodeURIComponent('ゲンヤク')}`);
  assert.equal(kata.body.results[0].slug, 'drug-substance');
  for (const [q, slug] of [['Fe', 'iron'], ['ニホニウム', 'nihonium'], ['gabriel', 'gabriel-synthesis'], ['フィッシャーエステル化', 'fischer-esterification'], ['sn2', 'sn2-reaction']]) {
    const { body } = await get(`/api/terms?q=${encodeURIComponent(q)}`);
    assert.equal(body.results[0].slug, slug, q);
  }
  const elements = await get('/api/terms?category=elements&limit=1');
  assert.equal(elements.body.total, 118);
  const abbr = await get('/api/terms?q=gmp');
  assert.equal(abbr.body.results[0].abbr, 'GMP');
});

test('filters, disabled languages, 404 and export', async () => {
  const { body } = await get('/api/terms?level=1&category=biology&limit=100');
  assert.ok(body.total > 0 && body.results.every((r) => r.level === 1 && r.category === 'biology'));
  assert.equal((await get('/api/terms?lang=fr')).status, 400);
  assert.equal((await get('/api/terms/nope')).status, 404);
  const tsv = await get('/api/export.tsv?level=3');
  assert.match(tsv.body, /審査報告書\[しんさほうこくしょ\]\treview report/);
});
