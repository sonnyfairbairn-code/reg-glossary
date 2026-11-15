// All 118 chemical elements. Row: [symbol, english, japanese, reading, alt?] in atomic-number order.
const rows = [
  ['H', 'hydrogen', '水素', 'すいそ'], ['He', 'helium', 'ヘリウム'], ['Li', 'lithium', 'リチウム'], ['Be', 'beryllium', 'ベリリウム'],
  ['B', 'boron', 'ホウ素', 'ホウそ'], ['C', 'carbon', '炭素', 'たんそ'], ['N', 'nitrogen', '窒素', 'ちっそ'], ['O', 'oxygen', '酸素', 'さんそ'],
  ['F', 'fluorine', 'フッ素', 'フッそ'], ['Ne', 'neon', 'ネオン'], ['Na', 'sodium', 'ナトリウム'], ['Mg', 'magnesium', 'マグネシウム'],
  ['Al', 'aluminium', 'アルミニウム'], ['Si', 'silicon', 'ケイ素', 'ケイそ'], ['P', 'phosphorus', 'リン'], ['S', 'sulfur', '硫黄', 'いおう'],
  ['Cl', 'chlorine', '塩素', 'えんそ'], ['Ar', 'argon', 'アルゴン'], ['K', 'potassium', 'カリウム'], ['Ca', 'calcium', 'カルシウム'],
  ['Sc', 'scandium', 'スカンジウム'], ['Ti', 'titanium', 'チタン'], ['V', 'vanadium', 'バナジウム'], ['Cr', 'chromium', 'クロム'],
  ['Mn', 'manganese', 'マンガン'], ['Fe', 'iron', '鉄', 'てつ'], ['Co', 'cobalt', 'コバルト'], ['Ni', 'nickel', 'ニッケル'],
  ['Cu', 'copper', '銅', 'どう'], ['Zn', 'zinc', '亜鉛', 'あえん'], ['Ga', 'gallium', 'ガリウム'], ['Ge', 'germanium', 'ゲルマニウム'],
  ['As', 'arsenic', 'ヒ素', 'ヒそ'], ['Se', 'selenium', 'セレン'], ['Br', 'bromine', '臭素', 'しゅうそ'], ['Kr', 'krypton', 'クリプトン'],
  ['Rb', 'rubidium', 'ルビジウム'], ['Sr', 'strontium', 'ストロンチウム'], ['Y', 'yttrium', 'イットリウム'], ['Zr', 'zirconium', 'ジルコニウム'],
  ['Nb', 'niobium', 'ニオブ'], ['Mo', 'molybdenum', 'モリブデン'], ['Tc', 'technetium', 'テクネチウム'], ['Ru', 'ruthenium', 'ルテニウム'],
  ['Rh', 'rhodium', 'ロジウム'], ['Pd', 'palladium', 'パラジウム'], ['Ag', 'silver', '銀', 'ぎん'], ['Cd', 'cadmium', 'カドミウム'],
  ['In', 'indium', 'インジウム'], ['Sn', 'tin', 'スズ', 'スズ', '錫'], ['Sb', 'antimony', 'アンチモン'], ['Te', 'tellurium', 'テルル'],
  ['I', 'iodine', 'ヨウ素', 'ヨウそ'], ['Xe', 'xenon', 'キセノン'], ['Cs', 'caesium', 'セシウム'], ['Ba', 'barium', 'バリウム'],
  ['La', 'lanthanum', 'ランタン'], ['Ce', 'cerium', 'セリウム'], ['Pr', 'praseodymium', 'プラセオジム'], ['Nd', 'neodymium', 'ネオジム'],
  ['Pm', 'promethium', 'プロメチウム'], ['Sm', 'samarium', 'サマリウム'], ['Eu', 'europium', 'ユウロピウム'], ['Gd', 'gadolinium', 'ガドリニウム'],
  ['Tb', 'terbium', 'テルビウム'], ['Dy', 'dysprosium', 'ジスプロシウム'], ['Ho', 'holmium', 'ホルミウム'], ['Er', 'erbium', 'エルビウム'],
  ['Tm', 'thulium', 'ツリウム'], ['Yb', 'ytterbium', 'イッテルビウム'], ['Lu', 'lutetium', 'ルテチウム'], ['Hf', 'hafnium', 'ハフニウム'],
  ['Ta', 'tantalum', 'タンタル'], ['W', 'tungsten', 'タングステン'], ['Re', 'rhenium', 'レニウム'], ['Os', 'osmium', 'オスミウム'],
  ['Ir', 'iridium', 'イリジウム'], ['Pt', 'platinum', '白金', 'はっきん', 'プラチナ'], ['Au', 'gold', '金', 'きん'], ['Hg', 'mercury', '水銀', 'すいぎん'],
  ['Tl', 'thallium', 'タリウム'], ['Pb', 'lead', '鉛', 'なまり'], ['Bi', 'bismuth', 'ビスマス'], ['Po', 'polonium', 'ポロニウム'],
  ['At', 'astatine', 'アスタチン'], ['Rn', 'radon', 'ラドン'], ['Fr', 'francium', 'フランシウム'], ['Ra', 'radium', 'ラジウム'],
  ['Ac', 'actinium', 'アクチニウム'], ['Th', 'thorium', 'トリウム'], ['Pa', 'protactinium', 'プロトアクチニウム'], ['U', 'uranium', 'ウラン'],
  ['Np', 'neptunium', 'ネプツニウム'], ['Pu', 'plutonium', 'プルトニウム'], ['Am', 'americium', 'アメリシウム'], ['Cm', 'curium', 'キュリウム'],
  ['Bk', 'berkelium', 'バークリウム'], ['Cf', 'californium', 'カリホルニウム'], ['Es', 'einsteinium', 'アインスタイニウム'], ['Fm', 'fermium', 'フェルミウム'],
  ['Md', 'mendelevium', 'メンデレビウム'], ['No', 'nobelium', 'ノーベリウム'], ['Lr', 'lawrencium', 'ローレンシウム'], ['Rf', 'rutherfordium', 'ラザホージウム'],
  ['Db', 'dubnium', 'ドブニウム'], ['Sg', 'seaborgium', 'シーボーギウム'], ['Bh', 'bohrium', 'ボーリウム'], ['Hs', 'hassium', 'ハッシウム'],
  ['Mt', 'meitnerium', 'マイトネリウム'], ['Ds', 'darmstadtium', 'ダームスタチウム'], ['Rg', 'roentgenium', 'レントゲニウム'], ['Cn', 'copernicium', 'コペルニシウム'],
  ['Nh', 'nihonium', 'ニホニウム'], ['Fl', 'flerovium', 'フレロビウム'], ['Mc', 'moscovium', 'モスコビウム'], ['Lv', 'livermorium', 'リバモリウム'],
  ['Ts', 'tennessine', 'テネシン'], ['Og', 'oganesson', 'オガネソン'],
];

const inSet = (z, ...list) => list.includes(z);
const between = (z, a, b) => z >= a && z <= b;
function kind(z) {
  if (inSet(z, 3, 11, 19, 37, 55, 87)) return 'an alkali metal';
  if (inSet(z, 4, 12, 20, 38, 56, 88)) return 'an alkaline earth metal';
  if (inSet(z, 9, 17, 35, 53, 85, 117)) return 'a halogen';
  if (inSet(z, 2, 10, 18, 36, 54, 86, 118)) return 'a noble gas';
  if (between(z, 57, 71)) return 'a lanthanoid';
  if (between(z, 89, 103)) return 'an actinoid';
  if (inSet(z, 5, 14, 32, 33, 51, 52)) return 'a metalloid';
  if (inSet(z, 1, 6, 7, 8, 15, 16, 34)) return 'a nonmetal';
  if (between(z, 21, 30) || between(z, 39, 48) || between(z, 72, 80) || between(z, 104, 112)) return 'a transition metal';
  return 'a post-transition metal';
}

module.exports = rows.map(([symbol, en, ja, reading = ja, alt], i) => [
  en, symbol, 'elements', 1,
  `Chemical element with symbol ${symbol} and atomic number ${i + 1}; ${kind(i + 1)}.`,
  { ja: [ja, reading, alt] },
  symbol === 'Nh' ? 'Named after Japan (日本, Nihon); discovered at RIKEN.' : '',
]);
