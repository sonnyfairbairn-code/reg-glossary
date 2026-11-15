const $ = (id) => document.getElementById(id);
const PAGE = 20;

const state = { q: '', level: '', cat: '', lang: 'ja', offset: 0, total: 0 };
let meta = { languages: [], levels: [], categories: [], total: 0 };
let requestId = 0;

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Escape, then wrap case-insensitive matches of the query in <mark>.
function hl(text) {
  const q = state.q.trim();
  if (!q) return esc(text);
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0) return esc(text);
  return esc(text.slice(0, i)) + '<mark>' + esc(text.slice(i, i + q.length)) + '</mark>' + esc(text.slice(i + q.length));
}

function readUrl() {
  const p = new URLSearchParams(location.search);
  state.q = p.get('q') || '';
  state.level = p.get('level') || '';
  state.cat = p.get('cat') || '';
  let saved = null;
  try { saved = localStorage.getItem('lang'); } catch {}
  state.lang = p.get('lang') || saved || 'ja';
}

function writeUrl(push = true) {
  const p = new URLSearchParams();
  if (state.q) p.set('q', state.q);
  if (state.level) p.set('level', state.level);
  if (state.cat) p.set('cat', state.cat);
  if (state.lang !== 'ja') p.set('lang', state.lang);
  const url = p.toString() ? `?${p}` : location.pathname;
  history[push ? 'pushState' : 'replaceState'](null, '', url);
}

const apiParams = () => {
  const p = new URLSearchParams({ lang: state.lang });
  if (state.q) p.set('q', state.q);
  if (state.level) p.set('level', state.level);
  if (state.cat) p.set('category', state.cat);
  return p;
};

function entryHtml(t) {
  const showReading = t.reading && t.reading !== t.term;
  const extras = [];
  if (t.alt) extras.push(`Also: <span lang="${state.lang}">${hl(t.alt)}</span>`);
  if (t.note) extras.push(esc(t.note));
  return `
    <article class="entry l${t.level}">
      <div class="word" lang="${state.lang}">
        <div class="reading">${showReading ? hl(t.reading) : ''}</div>
        <div class="term${t.term.length > 9 ? ' long' : ''}">${hl(t.term)}</div>
        ${t.romaji ? `<div class="romaji" lang="en">${hl(t.romaji)}</div>` : ''}
        <div class="tags" lang="en">
          <button class="tag l${t.level}" data-level="${t.level}">${esc(t.levelName)}</button>
          <button class="tag" data-cat="${esc(t.category)}">${esc(t.categoryName)}</button>
        </div>
      </div>
      <div class="meaning">
        <p class="en">${hl(t.en)}${t.abbr ? `<span class="abbr">${hl(t.abbr)}</span>` : ''}</p>
        <p class="def">${hl(t.definition)}</p>
        ${extras.map((e) => `<p class="extra">${e}</p>`).join('')}
      </div>
    </article>`;
}

function renderFilters() {
  $('levels').innerHTML =
    `<button data-level="" aria-pressed="${!state.level}">All<span class="n">${meta.total}</span></button>` +
    meta.levels.map((l) =>
      `<button data-level="${l.id}" aria-pressed="${String(l.id) === state.level}" title="${esc(l.blurb)}">${esc(l.name)}<span class="n">${l.count}</span></button>`
    ).join('');
  $('cats').innerHTML = meta.categories.map((c) =>
    `<li><button data-cat="${esc(c.id)}" aria-pressed="${c.id === state.cat}"><span>${esc(c.name)}</span><span class="n">${c.count}</span></button></li>`
  ).join('');
  $('export').href = `/api/export.tsv?${apiParams()}`;
}

function renderLang() {
  const current = meta.languages.find((l) => l.code === state.lang);
  $('langCurrent').textContent = current ? current.native : state.lang;
  $('langMenu').innerHTML = meta.languages.map((l) => `
    <li role="option" data-code="${esc(l.code)}" aria-selected="${l.code === state.lang}" ${l.enabled ? 'tabindex="0"' : 'aria-disabled="true"'}>
      <span>${esc(l.native)} <small>${esc(l.name)}</small></span>${l.enabled ? '' : '<span class="soon">soon</span>'}
    </li>`).join('');
}

async function load(append = false) {
  if (!append) state.offset = 0;
  const id = ++requestId;
  const p = apiParams();
  p.set('limit', PAGE);
  p.set('offset', state.offset);
  let data;
  try {
    const res = await fetch(`/api/terms?${p}`);
    if (!res.ok) throw new Error((await res.json()).error || res.statusText);
    data = await res.json();
  } catch (err) {
    if (id !== requestId) return;
    $('heading').textContent = '';
    $('list').innerHTML = `<div class="empty">Could not load terms: ${esc(err.message)}</div>`;
    $('more').hidden = true;
    return;
  }
  if (id !== requestId) return; // a newer search has started
  state.total = data.total;

  const html = data.results.map(entryHtml).join('');
  if (append) $('list').insertAdjacentHTML('beforeend', html);
  else $('list').innerHTML = html || `<div class="empty">No terms match. Try a shorter word, kana, or clear the filters.</div>`;

  const n = `${data.total} term${data.total === 1 ? '' : 's'}`;
  $('heading').innerHTML = state.q ? `${n} for <b>${esc(state.q)}</b>` : n;
  $('more').hidden = state.offset + data.results.length >= data.total;
  renderFilters();
}

function update({ push = true } = {}) {
  $('q').value = state.q;
  writeUrl(push);
  load();
}

// ── Events ──
let timer;
$('q').addEventListener('input', (e) => {
  clearTimeout(timer);
  timer = setTimeout(() => { state.q = e.target.value.trim(); writeUrl(false); load(); }, 180);
});
$('searchForm').addEventListener('submit', (e) => {
  e.preventDefault();
  clearTimeout(timer);
  state.q = $('q').value.trim();
  update();
});

document.addEventListener('click', (e) => {
  const lv = e.target.closest('[data-level]');
  const cat = e.target.closest('[data-cat]');
  if (lv) {
    state.level = lv.dataset.level === state.level && lv.classList.contains('tag') ? '' : lv.dataset.level;
    update();
  } else if (cat) {
    state.cat = cat.dataset.cat === state.cat ? '' : cat.dataset.cat;
    update();
  }
  if (!e.target.closest('.lang')) toggleMenu(false);
});

$('more').addEventListener('click', () => { state.offset += PAGE; load(true); });

$('random').addEventListener('click', async () => {
  const t = await (await fetch(`/api/random?lang=${state.lang}`)).json();
  Object.assign(state, { q: t.en, level: '', cat: '' });
  update();
  window.scrollTo({ top: 0 });
});

function toggleMenu(open) {
  $('langMenu').hidden = !open;
  $('langBtn').setAttribute('aria-expanded', String(open));
}
$('langBtn').addEventListener('click', () => toggleMenu($('langMenu').hidden));
function pickLang(li) {
  if (!li || li.getAttribute('aria-disabled') === 'true') return;
  state.lang = li.dataset.code;
  try { localStorage.setItem('lang', state.lang); } catch {}
  toggleMenu(false);
  renderLang();
  update();
}
$('langMenu').addEventListener('click', (e) => pickLang(e.target.closest('li')));
$('langMenu').addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') pickLang(e.target.closest('li')); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') toggleMenu(false); });

window.addEventListener('popstate', () => { readUrl(); $('q').value = state.q; load(); });

// ── Boot ──
(async () => {
  readUrl();
  meta = await (await fetch('/api/meta')).json();
  if (!meta.languages.some((l) => l.code === state.lang && l.enabled)) state.lang = 'ja';
  $('q').value = state.q;
  renderLang();
  await load();
})();
