// Minimal kana → Hepburn-style romaji converter, used so learners can search by romaji.

const BASE = {
  あ: 'a', い: 'i', う: 'u', え: 'e', お: 'o',
  か: 'ka', き: 'ki', く: 'ku', け: 'ke', こ: 'ko',
  さ: 'sa', し: 'shi', す: 'su', せ: 'se', そ: 'so',
  た: 'ta', ち: 'chi', つ: 'tsu', て: 'te', と: 'to',
  な: 'na', に: 'ni', ぬ: 'nu', ね: 'ne', の: 'no',
  は: 'ha', ひ: 'hi', ふ: 'fu', へ: 'he', ほ: 'ho',
  ま: 'ma', み: 'mi', む: 'mu', め: 'me', も: 'mo',
  や: 'ya', ゆ: 'yu', よ: 'yo',
  ら: 'ra', り: 'ri', る: 'ru', れ: 're', ろ: 'ro',
  わ: 'wa', を: 'o', ん: 'n',
  が: 'ga', ぎ: 'gi', ぐ: 'gu', げ: 'ge', ご: 'go',
  ざ: 'za', じ: 'ji', ず: 'zu', ぜ: 'ze', ぞ: 'zo',
  だ: 'da', ぢ: 'ji', づ: 'zu', で: 'de', ど: 'do',
  ば: 'ba', び: 'bi', ぶ: 'bu', べ: 'be', ぼ: 'bo',
  ぱ: 'pa', ぴ: 'pi', ぷ: 'pu', ぺ: 'pe', ぽ: 'po',
  ゔ: 'vu',
  ぁ: 'a', ぃ: 'i', ぅ: 'u', ぇ: 'e', ぉ: 'o',
};
const SMALL_Y = { ゃ: 'ya', ゅ: 'yu', ょ: 'yo' };
const SMALL_V = { ぁ: 'a', ぃ: 'i', ぅ: 'u', ぇ: 'e', ぉ: 'o' };

const toHiragana = (s) =>
  s.replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60));

function toRomaji(kana) {
  const s = toHiragana(kana);
  let out = '';
  let double = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    const next = s[i + 1];
    let syl;
    if (c === 'っ') { double = true; continue; }
    if (c === 'ー') { out += out.slice(-1); continue; }
    if (BASE[c] && SMALL_Y[next]) {
      const b = BASE[c];
      // し→sh, ち→ch, じ→j drop the "y"; others replace final "i" with "y…"
      syl = /^(sh|ch|j)i$/.test(b) ? b.slice(0, -1) + SMALL_Y[next].slice(1) : b.slice(0, -1) + SMALL_Y[next];
      i++;
    } else if (BASE[c] && SMALL_V[next] && !SMALL_V[c]) {
      const b = BASE[c];
      syl = (b === 'fu' ? 'f' : b === 'vu' ? 'v' : b === 'u' ? 'w' : b.slice(0, -1)) + SMALL_V[next];
      i++;
    } else if (BASE[c]) {
      syl = BASE[c];
    } else {
      syl = /[・\s]/.test(c) ? ' ' : c;
    }
    if (double && /^[a-z]/.test(syl)) out += syl[0] === 'c' ? 't' : syl[0];
    double = false;
    out += syl;
  }
  return out.replace(/\s+/g, ' ').trim();
}

module.exports = { toRomaji, toHiragana };
