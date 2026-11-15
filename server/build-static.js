// Builds a backend-free copy of the site in docs/ for static hosts such as GitHub Pages.
// The frontend detects the missing API and searches docs/data.json in the browser instead.

const fs = require('node:fs');
const path = require('node:path');
const { createApp } = require('./app');

(async () => {
  const server = createApp().listen(0);
  await new Promise((r) => server.once('listening', r));
  const get = async (p) => (await fetch(`http://localhost:${server.address().port}${p}`)).json();

  const meta = await get('/api/meta');
  const terms = {};
  for (const { code } of meta.languages.filter((l) => l.enabled)) {
    terms[code] = [];
    for (let offset = 0; ; offset += 100) {
      const page = await get(`/api/terms?lang=${code}&limit=100&offset=${offset}`);
      terms[code].push(...page.results);
      if (terms[code].length >= page.total) break;
    }
  }
  server.closeAllConnections();
  server.close();

  const out = path.join(__dirname, '..', 'docs');
  fs.rmSync(out, { recursive: true, force: true });
  fs.cpSync(path.join(__dirname, '..', 'public'), out, { recursive: true });
  fs.writeFileSync(path.join(out, 'data.json'), JSON.stringify({ meta, terms }));
  fs.writeFileSync(path.join(out, '.nojekyll'), '');
  console.log(`Wrote docs/ with ${Object.values(terms).map((t) => t.length).join(', ')} terms`);
})();
