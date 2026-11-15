// SQLite schema + seeding. The DB is rebuilt from server/data/terms.js on every start,
// so the data file stays the single source of truth.

const { DatabaseSync } = require('node:sqlite');
const data = require('./data/terms');
const { toRomaji } = require('./romaji');

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function openDb(file = ':memory:') {
  const db = new DatabaseSync(file);
  db.exec(`
    DROP TABLE IF EXISTS translations;
    DROP TABLE IF EXISTS terms;
    DROP TABLE IF EXISTS languages;
    DROP TABLE IF EXISTS levels;
    DROP TABLE IF EXISTS categories;

    CREATE TABLE languages (
      code TEXT PRIMARY KEY, name TEXT NOT NULL, native TEXT NOT NULL, enabled INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE levels (id INTEGER PRIMARY KEY, name TEXT NOT NULL, blurb TEXT NOT NULL);
    CREATE TABLE categories (id TEXT PRIMARY KEY, name TEXT NOT NULL);
    CREATE TABLE terms (
      id INTEGER PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      en TEXT NOT NULL,
      abbr TEXT NOT NULL DEFAULT '',
      category TEXT NOT NULL REFERENCES categories(id),
      level INTEGER NOT NULL REFERENCES levels(id),
      definition TEXT NOT NULL,
      note TEXT NOT NULL DEFAULT ''
    );
    CREATE TABLE translations (
      term_id INTEGER NOT NULL REFERENCES terms(id),
      lang TEXT NOT NULL REFERENCES languages(code),
      term TEXT NOT NULL,
      reading TEXT NOT NULL DEFAULT '',
      romaji TEXT NOT NULL DEFAULT '',
      alt TEXT NOT NULL DEFAULT '',
      PRIMARY KEY (term_id, lang)
    );
    CREATE INDEX idx_terms_level ON terms(level);
    CREATE INDEX idx_terms_category ON terms(category);
  `);

  const insLang = db.prepare('INSERT INTO languages VALUES (?, ?, ?, ?)');
  const insLevel = db.prepare('INSERT INTO levels VALUES (?, ?, ?)');
  const insCat = db.prepare('INSERT INTO categories VALUES (?, ?)');
  const insTerm = db.prepare(
    'INSERT INTO terms (slug, en, abbr, category, level, definition, note) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );
  const insTr = db.prepare('INSERT INTO translations VALUES (?, ?, ?, ?, ?, ?)');

  db.exec('BEGIN');
  data.languages.forEach((l) => insLang.run(l.code, l.name, l.native, l.enabled));
  data.levels.forEach((l) => insLevel.run(l.id, l.name, l.blurb));
  Object.entries(data.categories).forEach(([id, name]) => insCat.run(id, name));
  for (const [en, abbr, category, level, definition, translations, note = ''] of data.terms) {
    const { lastInsertRowid } = insTerm.run(slugify(en), en, abbr, category, level, definition, note);
    for (const [lang, [term, reading = '', alt = '']] of Object.entries(translations)) {
      // Romaji only makes sense for kana readings.
      const romaji = lang === 'ja' ? toRomaji(reading) : '';
      insTr.run(lastInsertRowid, lang, term, reading, romaji, alt);
    }
  }
  db.exec('COMMIT');
  return db;
}

module.exports = { openDb };
