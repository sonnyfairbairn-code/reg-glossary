const path = require('node:path');
const express = require('express');
const { openDb } = require('./db');
const { toHiragana } = require('./romaji');

function createApp(dbFile) {
  const db = openDb(dbFile);
  const app = express();
  app.disable('x-powered-by');

  const enabledLang = (code) =>
    db.prepare('SELECT code FROM languages WHERE code = ? AND enabled = 1').get(code || 'ja');

  // Builds the shared WHERE clause for search, list and export.
  function buildQuery({ q = '', lang, level, category }) {
    const where = ['tr.lang = :lang'];
    const params = { lang };
    if (level) { where.push('t.level = :level'); params.level = Number(level); }
    if (category) { where.push('t.category = :category'); params.category = String(category); }

    let rank = '3';
    const rankParams = {};
    const text = String(q).trim().toLowerCase().slice(0, 100);
    if (text) {
      // Katakana input also matches hiragana readings (and vice versa).
      const kana = toHiragana(text);
      Object.assign(params, { like: `%${text}%`, kana: `%${kana}%` });
      Object.assign(rankParams, { exact: text, prefix: `${text}%`, kanaExact: kana });
      where.push(`(
        lower(t.en) LIKE :like OR lower(t.abbr) LIKE :like OR lower(t.definition) LIKE :like
        OR lower(tr.term) LIKE :like OR lower(tr.alt) LIKE :like
        OR tr.reading LIKE :like OR tr.reading_h LIKE :kana OR tr.romaji LIKE :like
      )`);
      rank = `CASE
        WHEN lower(t.en) = :exact OR lower(t.abbr) = :exact OR lower(tr.term) = :exact
          OR tr.reading_h = :kanaExact OR tr.romaji = :exact OR lower(tr.alt) = :exact THEN 0
        WHEN lower(t.en) LIKE :prefix OR lower(tr.term) LIKE :prefix OR tr.romaji LIKE :prefix THEN 1
        WHEN lower(t.definition) LIKE :like AND lower(t.en) NOT LIKE :like AND lower(tr.term) NOT LIKE :like THEN 3
        ELSE 2 END`;
    }
    return { where: where.join(' AND '), params, rank, rankParams };
  }

  // Hiragana-normalised reading column for kana-insensitive search.
  db.exec('ALTER TABLE translations ADD COLUMN reading_h TEXT NOT NULL DEFAULT ""');
  const setH = db.prepare('UPDATE translations SET reading_h = ? WHERE term_id = ? AND lang = ?');
  for (const r of db.prepare('SELECT term_id, lang, reading FROM translations').all()) {
    setH.run(toHiragana(r.reading), r.term_id, r.lang);
  }

  const SELECT = `
    SELECT t.slug, t.en, t.abbr, t.category, c.name AS categoryName, t.level, l.name AS levelName,
           t.definition, t.note, tr.term, tr.reading, tr.romaji, tr.alt
    FROM terms t
    JOIN translations tr ON tr.term_id = t.id
    JOIN categories c ON c.id = t.category
    JOIN levels l ON l.id = t.level`;

  app.get('/api/meta', (_req, res) => {
    res.json({
      languages: db.prepare('SELECT * FROM languages ORDER BY enabled DESC, name').all(),
      levels: db.prepare(
        'SELECT l.*, (SELECT count(*) FROM terms t WHERE t.level = l.id) AS count FROM levels l ORDER BY l.id'
      ).all(),
      categories: db.prepare(
        `SELECT c.*, count(t.id) AS count, min(t.level) AS level
         FROM categories c JOIN terms t ON t.category = c.id GROUP BY c.id ORDER BY level, c.rowid`
      ).all(),
      total: db.prepare('SELECT count(*) AS n FROM terms').get().n,
    });
  });

  app.get('/api/terms', (req, res) => {
    const lang = enabledLang(req.query.lang);
    if (!lang) return res.status(400).json({ error: 'Language not available yet' });
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);
    const { where, params, rank, rankParams } = buildQuery({ ...req.query, lang: lang.code });

    const total = db.prepare(
      `SELECT count(*) AS n FROM terms t JOIN translations tr ON tr.term_id = t.id WHERE ${where}`
    ).get(params).n;
    const results = db.prepare(
      `${SELECT} WHERE ${where} ORDER BY ${rank}, t.level, t.id LIMIT :limit OFFSET :offset`
    ).all({ ...params, ...rankParams, limit, offset });
    res.json({ total, offset, limit, results });
  });

  app.get('/api/terms/:slug', (req, res) => {
    const lang = enabledLang(req.query.lang);
    if (!lang) return res.status(400).json({ error: 'Language not available yet' });
    const term = db.prepare(`${SELECT} WHERE t.slug = ? AND tr.lang = ?`).get(req.params.slug, lang.code);
    if (!term) return res.status(404).json({ error: 'Term not found' });
    res.json(term);
  });

  app.get('/api/random', (req, res) => {
    const lang = enabledLang(req.query.lang);
    if (!lang) return res.status(400).json({ error: 'Language not available yet' });
    res.json(db.prepare(`${SELECT} WHERE tr.lang = ? ORDER BY random() LIMIT 1`).get(lang.code));
  });

  // Tab-separated export that Anki imports directly (front, back, tags).
  app.get('/api/export.tsv', (req, res) => {
    const lang = enabledLang(req.query.lang);
    if (!lang) return res.status(400).json({ error: 'Language not available yet' });
    const { where, params } = buildQuery({ ...req.query, lang: lang.code });
    const rows = db.prepare(`${SELECT} WHERE ${where} ORDER BY t.level, t.id`).all(params);
    const clean = (s) => String(s).replace(/[\t\r\n]+/g, ' ');
    const body = rows.map((r) => {
      const front = r.reading && r.reading !== r.term ? `${r.term}[${r.reading}]` : r.term;
      const back = `${r.en}${r.abbr ? ` (${r.abbr})` : ''}<br>${r.definition}`;
      return [front, back, `level${r.level} ${r.category}`].map(clean).join('\t');
    }).join('\n');
    res.set('Content-Type', 'text/tab-separated-values; charset=utf-8');
    res.set('Content-Disposition', `attachment; filename="reg-glossary-${lang.code}.tsv"`);
    res.send(`#separator:tab\n#html:true\n#tags column:3\n${body}\n`);
  });

  app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }));
  app.use(express.static(path.join(__dirname, '..', 'public')));
  return app;
}

module.exports = { createApp };
