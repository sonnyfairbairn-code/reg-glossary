# Sxlvery — Bilingual Regulatory Glossary (EN/JP)

A searchable glossary that links English and Japanese terms used in pharmaceutical regulatory affairs.

## The regulatory problem

Japan's PMDA publishes most review reports, notifications and package inserts in Japanese.
Reading them needs vocabulary that general dictionaries cover poorly (e.g. 一部変更承認申請, 再審査, GQP).
This glossary builds that vocabulary in three levels, so a learner moves from school science to regulatory language.

| Level | Scope | Terms |
|---|---|---|
| 1. Foundations | School chemistry, all 118 elements, biology | 190 |
| 2. Pharmaceutical science | Organic reactions and mechanisms, pharmacology, formulation | 141 |
| 3. Regulatory affairs | Approval, quality/GMP, clinical, safety/PV, agencies and law | 92 |

## Features

- **Search** in English, kanji, hiragana, katakana or romaji (e.g. `GMP`, `審査`, `ちけん`, `fukusayou`)
- **Filters** by level and category
- **Language toggle**: Japanese is live; other languages show as "soon" and need data only, no code changes
- **Anki export**: downloads the current filtered list as a `.tsv` file with furigana and tags
- **Shareable URLs**: search and filters are stored in the address bar

## Stack

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, vanilla JavaScript (no build step) |
| API | Node.js + Express |
| Database | SQLite (Node's built-in `node:sqlite`) |
| Tests | Node's built-in test runner |

## Run

Requires Node.js 22.5 or later.

```bash
npm install
```

```bash
npm start
```

Open http://localhost:3000.

```bash
npm test
```

## Deploy to GitHub Pages

GitHub Pages hosts static files only, so the site also ships as a backend-free copy in `docs/`.
In that copy the browser loads `docs/data.json` and runs the same search, filters and Anki export itself.

```bash
npm run build:static
```

Run this after any change to the terms or frontend, then commit `docs/`.
In the repo on GitHub: Settings → Pages → Deploy from a branch → `main` and `/docs`.

## API

| Endpoint | Purpose |
|---|---|
| `GET /api/meta` | Languages, levels and categories with counts |
| `GET /api/terms?q=&level=&category=&lang=&limit=&offset=` | Search and browse |
| `GET /api/terms/:slug` | One term |
| `GET /api/random` | A random term |
| `GET /api/export.tsv` | Anki export (accepts the same filters as `/api/terms`) |

## Project structure

```
server/
  data/terms.js   Source of truth for all terms, languages and categories
  data/elements.js  The 118 elements
  data/reactions.js Reaction types, mechanisms and named reactions
  db.js           SQLite schema and seeding
  romaji.js       Kana to romaji converter (enables romaji search)
  app.js          Express API
  build-static.js Builds docs/ for GitHub Pages
  api.test.js     Tests
public/           Frontend (source)
docs/             Static build of the frontend plus data.json (generated)
```

## Add a term

Add a row to `server/data/terms.js`:

```js
['english term', 'ABBR', 'category', 3, 'Plain-English definition.', j('日本語', 'にほんご', 'optional alt'), 'optional note'],
```

## Add a language

1. In `server/data/terms.js`, set the language's `enabled` to `1` (or add a new entry to `languages`).
2. Add that language's key to each term's translation object, e.g. `{ ja: [...], zh: ['原子', 'yuánzǐ'] }`.

The database, API and toggle pick it up on restart.

## Data provenance

Terms and Japanese equivalents follow usage in PMDA and MHLW publications, ICH guidelines and the Japanese Pharmacopoeia.
Definitions are the author's own plain-English summaries. Dataset compiled November 2026.

## Disclaimer

This is an educational project. It is not an official source and is not for regulatory decisions.
Verify terms against official PMDA, MHLW and ICH documents.
