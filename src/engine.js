/* Fominha FC · Copa Relâmpago · motor de simulação (puro, sem DOM) */
(function (root) {
'use strict';

// ---------- RNG com semente ----------
function hashStr(s) {
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < s.length; i++) {
    const ch = s.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761); h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h1 ^ h2) >>> 0;
}
function makeRng(seedNum) {
  let a = seedNum >>> 0;
  const next = function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const r = {
    next,
    int(a, b) { return a + Math.floor(next() * (b - a + 1)); },
    chance(p) { return next() < p; },
    pick(arr) { return arr[Math.floor(next() * arr.length)]; },
    shuffle(arr) { const c = arr.slice(); for (let i = c.length - 1; i > 0; i--) { const j = Math.floor(next() * (i + 1)); [c[i], c[j]] = [c[j], c[i]]; } return c; },
    weighted(items, wf) {
      let tot = 0; const ws = items.map(it => { const w = Math.max(0, wf(it)); tot += w; return w; });
      if (tot <= 0) return items[0];
      let x = next() * tot;
      for (let i = 0; i < items.length; i++) { x -= ws[i]; if (x < 0) return items[i]; }
      return items[items.length - 1];
    }
  };
  return r;
}
function rngFor(seed, ...keys) { return makeRng(hashStr(String(seed) + '|' + keys.join('|'))); }
const SEED_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function randomSeed(rnd) { rnd = rnd || Math.random; let s = ''; for (let i = 0; i < 6; i++) s += SEED_CHARS[Math.floor(rnd() * SEED_CHARS.length)]; return s; }
function normalizeSeed(s) { return String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12); }
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const avg = arr => arr.reduce((s, x) => s + x, 0) / (arr.length || 1);

// ---------- Dados ----------
// traços: C = cabeceador, F = chute de fora / bola parada, V = velocista, X = cruzador
function P(nome, pos, rating, traits, era) { return { nome, pos, rating, traits: traits || '', era: era || '' }; }

const SELECOES = {
  bra82: {
    id: 'bra82', nome: 'Brasil 1982', curto: 'Brasil', flag: '🇧🇷', cor: '#ffd21f', cor2: '#1f7a3a', kit: ['#ffd21f', '#1f4fbf'],
    perk: { nome: 'Jogo Bonito', desc: 'Chutes de fora da área têm +40% de chance de gol.' },
    titulares: [P('Waldir Peres', 'GOL', 55), P('Oscar', 'ZAG', 58, 'C'), P('Luizinho', 'ZAG', 56), P('Toninho Cerezo', 'MEI', 60), P('Paulo Isidoro', 'MEI', 57, 'X'), P('Serginho Chulapa', 'ATA', 58, 'C'), P('Éder', 'ATA', 60, 'F')],
    reservas: ['Edinho', 'Batista', 'Renato', 'Dirceu', 'Roberto Dinamite']
  },
  hol74: {
    id: 'hol74', nome: 'Holanda 1974', curto: 'Holanda', flag: '🇳🇱', cor: '#ff7a00', cor2: '#ffffff', kit: ['#ff7a00', '#ffffff'],
    perk: { nome: 'Futebol Total', desc: 'Começa com a carta Pressão alta, que dura o dobro e não cansa o time.' },
    titulares: [P('Jongbloed', 'GOL', 54), P('Rijsbergen', 'ZAG', 57), P('Arie Haan', 'ZAG', 58, 'F'), P('Wim Jansen', 'MEI', 58), P('Van Hanegem', 'MEI', 60, 'F'), P('Johnny Rep', 'ATA', 60, 'C'), P('Rensenbrink', 'ATA', 59, 'V')],
    reservas: ['De Jong', 'Israel', 'Keizer', 'René van de Kerkhof', 'Suurbier']
  },
  cam90: {
    id: 'cam90', nome: 'Camarões 1990', curto: 'Camarões', flag: '🇨🇲', cor: '#1fa64a', cor2: '#e2231a', kit: ['#e2231a', '#ffd21f'],
    perk: { nome: 'Leões Indomáveis', desc: '+6 de força em tudo enquanto estiver perdendo.' },
    titulares: [P("N'Kono", 'GOL', 58), P('Kundé', 'ZAG', 56, 'F'), P('Massing', 'ZAG', 57), P('Mbouh', 'MEI', 56), P('Makanaky', 'MEI', 58, 'V'), P('Omam-Biyik', 'ATA', 59, 'C'), P('Roger Milla', 'ATA', 62, 'V')],
    reservas: ['Ekéké', 'Maboang', "M'Fédé", 'Pagal', 'Tataw']
  }
};
const SELECAO_IDS = ['bra82', 'hol74', 'cam90'];

const POOL = [
  // goleiros
  P('Taffarel', 'GOL', 74, '', 'Brasil 94'), P('Zoff', 'GOL', 82, '', 'Itália 82'), P('Yashin', 'GOL', 89, '', 'URSS 66'),
  P('Gordon Banks', 'GOL', 84, '', 'Inglaterra 70'), P('Buffon', 'GOL', 86, '', 'Itália 06'), P('Higuita', 'GOL', 68, 'F', 'Colômbia 90'),
  P('Chilavert', 'GOL', 72, 'F', 'Paraguai 98'), P('Dida', 'GOL', 70, '', 'Brasil 98'), P('Marcos', 'GOL', 77, '', 'Brasil 02'),
  P('Schmeichel', 'GOL', 80, '', 'Dinamarca 98'), P('Kahn', 'GOL', 81, '', 'Alemanha 02'), P('Tomaszewski', 'GOL', 66, '', 'Polônia 74'),
  P('Ravelli', 'GOL', 64, '', 'Suécia 94'), P('Navas', 'GOL', 75, '', 'Costa Rica 14'),
  // defensores
  P('Beckenbauer', 'ZAG', 91, 'F', 'Alemanha 74'), P('Franco Baresi', 'ZAG', 86, '', 'Itália 94'), P('Maldini', 'ZAG', 87, 'X', 'Itália 94'),
  P('Carlos Alberto Torres', 'ZAG', 84, 'C', 'Brasil 70'), P('Krol', 'ZAG', 80, 'F', 'Holanda 74'), P('Bobby Moore', 'ZAG', 84, '', 'Inglaterra 66'),
  P('Cannavaro', 'ZAG', 84, '', 'Itália 06'), P('Lúcio', 'ZAG', 77, 'C', 'Brasil 02'), P('Júnior', 'ZAG', 79, 'X', 'Brasil 82'),
  P('Cafu', 'ZAG', 81, 'X', 'Brasil 02'), P('Roberto Carlos', 'ZAG', 82, 'XF', 'Brasil 02'), P('Nílton Santos', 'ZAG', 80, 'X', 'Brasil 58'),
  P('Thuram', 'ZAG', 80, '', 'França 98'), P('Passarella', 'ZAG', 79, 'C', 'Argentina 78'), P('Elías Figueroa', 'ZAG', 78, 'C', 'Chile 74'),
  P('Hierro', 'ZAG', 76, 'CF', 'Espanha 94'), P('Leandro', 'ZAG', 70, 'X', 'Brasil 82'), P('Aldair', 'ZAG', 72, '', 'Brasil 94'),
  P('Branco', 'ZAG', 70, 'XF', 'Brasil 94'), P('Materazzi', 'ZAG', 68, 'C', 'Itália 06'), P('Hong Myung-bo', 'ZAG', 66, '', 'Coreia 02'),
  P('Lalas', 'ZAG', 63, 'C', 'EUA 94'),
  // meio-campistas
  P('Zico', 'MEI', 91, 'F', 'Brasil 82'), P('Sócrates', 'MEI', 88, 'F', 'Brasil 82'), P('Falcão', 'MEI', 86, 'F', 'Brasil 82'),
  P('Gérson', 'MEI', 83, 'F', 'Brasil 70'), P('Rivellino', 'MEI', 86, 'F', 'Brasil 70'), P('Didi', 'MEI', 85, 'F', 'Brasil 58'),
  P('Neeskens', 'MEI', 84, '', 'Holanda 74'), P('Zidane', 'MEI', 93, 'C', 'França 98'), P('Platini', 'MEI', 89, 'F', 'França 86'),
  P('Pirlo', 'MEI', 86, 'F', 'Itália 06'), P('Xavi', 'MEI', 86, '', 'Espanha 10'), P('Iniesta', 'MEI', 87, '', 'Espanha 10'),
  P('Valderrama', 'MEI', 79, 'X', 'Colômbia 90'), P('Hagi', 'MEI', 84, 'F', 'Romênia 94'), P('Matthäus', 'MEI', 85, 'F', 'Alemanha 90'),
  P('Bobby Charlton', 'MEI', 86, 'F', 'Inglaterra 66'), P('Okocha', 'MEI', 76, 'F', 'Nigéria 98'), P('Scifo', 'MEI', 73, '', 'Bélgica 86'),
  P('Boban', 'MEI', 76, '', 'Croácia 98'), P('Dunga', 'MEI', 74, '', 'Brasil 94'), P('Kaká', 'MEI', 86, 'V', 'Brasil 06'),
  P('Rivaldo', 'MEI', 87, 'F', 'Brasil 02'), P('Deyna', 'MEI', 78, 'F', 'Polônia 74'), P('Michael Laudrup', 'MEI', 82, '', 'Dinamarca 86'),
  P('Mauro Silva', 'MEI', 70, '', 'Brasil 94'), P('Mazinho', 'MEI', 66, 'X', 'Brasil 94'), P('Letchkov', 'MEI', 70, 'C', 'Bulgária 94'),
  P('Fadiga', 'MEI', 64, 'X', 'Senegal 02'), P('Park Ji-sung', 'MEI', 68, 'V', 'Coreia 02'), P('Balakov', 'MEI', 72, 'F', 'Bulgária 94'),
  // atacantes
  P('Pelé', 'ATA', 97, 'CF', 'Brasil 70'), P('Garrincha', 'ATA', 91, 'VX', 'Brasil 62'), P('Romário', 'ATA', 90, 'V', 'Brasil 94'),
  P('Ronaldo', 'ATA', 93, 'V', 'Brasil 02'), P('Ronaldinho', 'ATA', 89, 'F', 'Brasil 02'), P('Jairzinho', 'ATA', 85, 'V', 'Brasil 70'),
  P('Tostão', 'ATA', 83, '', 'Brasil 70'), P('Gerd Müller', 'ATA', 88, 'C', 'Alemanha 74'), P('Eusébio', 'ATA', 89, 'F', 'Portugal 66'),
  P('Puskás', 'ATA', 90, 'F', 'Hungria 54'), P('Kocsis', 'ATA', 84, 'C', 'Hungria 54'), P('Cruyff', 'ATA', 94, 'V', 'Holanda 74'),
  P('Kempes', 'ATA', 84, 'F', 'Argentina 78'), P('Paolo Rossi', 'ATA', 82, 'C', 'Itália 82'), P('Roberto Baggio', 'ATA', 87, 'F', 'Itália 94'),
  P('Stoichkov', 'ATA', 84, 'F', 'Bulgária 94'), P('Lato', 'ATA', 77, 'V', 'Polônia 74'), P('Klose', 'ATA', 80, 'C', 'Alemanha 14'),
  P('Thierry Henry', 'ATA', 86, 'V', 'França 06'), P('Bebeto', 'ATA', 81, '', 'Brasil 94'), P('Careca', 'ATA', 80, 'V', 'Brasil 86'),
  P('Schillaci', 'ATA', 75, '', 'Itália 90'), P('Šuker', 'ATA', 81, 'F', 'Croácia 98'), P('Geoff Hurst', 'ATA', 78, 'C', 'Inglaterra 66'),
  P('Hugo Sánchez', 'ATA', 79, 'C', 'México 86'), P('Batistuta', 'ATA', 85, 'CF', 'Argentina 98'), P('Vavá', 'ATA', 79, 'C', 'Brasil 58'),
  P('Leônidas da Silva', 'ATA', 82, 'C', 'Brasil 38'), P('Lineker', 'ATA', 81, '', 'Inglaterra 86'), P("Samuel Eto'o", 'ATA', 80, 'V', 'Camarões 10'),
  P('Drogba', 'ATA', 82, 'C', 'Costa do Marfim 06'), P('Yekini', 'ATA', 70, 'C', 'Nigéria 94'), P('Ahn Jung-hwan', 'ATA', 66, 'C', 'Coreia 02'),
  P('Răducioiu', 'ATA', 69, '', 'Romênia 94'), P('Brolin', 'ATA', 71, 'F', 'Suécia 94'), P('Viola', 'ATA', 64, 'V', 'Brasil 94'),
  P('Müller', 'ATA', 67, 'V', 'Brasil 94'), P('Edmundo', 'ATA', 72, 'F', 'Brasil 98'), P('Amokachi', 'ATA', 66, 'V', 'Nigéria 94')
];

const OPPONENTS = {
  A: [
    { nome: 'Coreia do Norte 1966', flag: '🇰🇵', scorers: ['Pak Doo-ik', 'Pak Seung-zin', 'Li Dong-woon'], gk: 'Lee Chang-myung' },
    { nome: 'Haiti 1974', flag: '🇭🇹', scorers: ['Sanon', 'Vorbe', 'Saint-Vil'], gk: 'Francillon' },
    { nome: 'EUA 1994', flag: '🇺🇸', scorers: ['Wynalda', 'Stewart', 'Lalas'], gk: 'Meola' },
    { nome: 'Costa Rica 1990', flag: '🇨🇷', scorers: ['Cayasso', 'Medford', 'Flores'], gk: 'Conejo' },
    { nome: 'Arábia Saudita 1994', flag: '🇸🇦', scorers: ['Al-Owairan', 'Al-Jaber', 'Amin'], gk: 'Al-Deayea' },
    { nome: 'Jamaica 1998', flag: '🇯🇲', scorers: ['Whitmore', 'Burton', 'Gayle'], gk: 'Barrett' }
  ],
  B: [
    { nome: 'Bulgária 1994', flag: '🇧🇬', scorers: ['Stoichkov', 'Letchkov', 'Kostadinov'], gk: 'Mikhailov' },
    { nome: 'Romênia 1994', flag: '🇷🇴', scorers: ['Hagi', 'Răducioiu', 'Dumitrescu'], gk: 'Prunea' },
    { nome: 'Senegal 2002', flag: '🇸🇳', scorers: ['Diouf', 'Bouba Diop', 'Fadiga'], gk: 'Tony Sylva' },
    { nome: 'Coreia do Sul 2002', flag: '🇰🇷', scorers: ['Ahn Jung-hwan', 'Park Ji-sung', 'Seol Ki-hyeon'], gk: 'Lee Woon-jae' },
    { nome: 'Nigéria 1994', flag: '🇳🇬', scorers: ['Yekini', 'Amunike', 'Amokachi'], gk: 'Rufai' },
    { nome: 'Suécia 1994', flag: '🇸🇪', scorers: ['Brolin', 'Dahlin', 'Kennet Andersson'], gk: 'Ravelli' },
    { nome: 'Polônia 1974', flag: '🇵🇱', scorers: ['Lato', 'Szarmach', 'Deyna'], gk: 'Tomaszewski' },
    { nome: 'Dinamarca 1986', flag: '🇩🇰', scorers: ['Elkjær', 'Michael Laudrup', 'Jesper Olsen'], gk: 'Rasmussen' }
  ],
  C: [
    { nome: 'Itália 1982', flag: '🇮🇹', scorers: ['Paolo Rossi', 'Tardelli', 'Altobelli'], gk: 'Zoff' },
    { nome: 'Inglaterra 1966', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', scorers: ['Geoff Hurst', 'Bobby Charlton', 'Roger Hunt'], gk: 'Gordon Banks' },
    { nome: 'Croácia 1998', flag: '🇭🇷', scorers: ['Šuker', 'Boban', 'Prosinečki'], gk: 'Ladić' },
    { nome: 'Uruguai 1950', flag: '🇺🇾', scorers: ['Ghiggia', 'Schiaffino', 'Míguez'], gk: 'Máspoli' },
    { nome: 'Portugal 1966', flag: '🇵🇹', scorers: ['Eusébio', 'José Torres', 'Simões'], gk: 'José Pereira' },
    { nome: 'Hungria 1954', flag: '🇭🇺', scorers: ['Puskás', 'Kocsis', 'Hidegkuti'], gk: 'Grosics' }
  ],
  D: [
    { nome: 'Alemanha 1974', flag: '🇩🇪', scorers: ['Gerd Müller', 'Breitner', 'Overath'], gk: 'Sepp Maier' },
    { nome: 'França 1998', flag: '🇫🇷', scorers: ['Zidane', 'Thierry Henry', 'Thuram'], gk: 'Barthez' },
    { nome: 'Itália 2006', flag: '🇮🇹', scorers: ['Pirlo', 'Del Piero', 'Materazzi'], gk: 'Buffon' },
    { nome: 'Espanha 2010', flag: '🇪🇸', scorers: ['Villa', 'Iniesta', 'Xavi'], gk: 'Casillas' },
    { nome: 'Argentina 1978', flag: '🇦🇷', scorers: ['Kempes', 'Luque', 'Bertoni'], gk: 'Fillol' }
  ]
};

const BOSS = {
  id: 'mao_divina', nome: 'Argentina 1986', apelido: 'A Mão Divina', flag: '🇦🇷',
  regra: 'Uma vez por jogo, o chefe marca um gol irregular que o juiz valida.',
  lines: { atk: 72, mid: 70, def: 66, gk: 65 },
  scorers: ['Maradona', 'Valdano', 'Burruchaga', 'Ruggeri'], scorerW: [5, 2, 2, 1], gk: 'Pumpido'
};

const STAGES = [
  { id: 'g1', nome: 'Grupo · Jogo 1', curto: 'G1', ko: false },
  { id: 'g2', nome: 'Grupo · Jogo 2', curto: 'G2', ko: false },
  { id: 'g3', nome: 'Grupo · Jogo 3', curto: 'G3', ko: false },
  { id: 'oit', nome: 'Oitavas de final', curto: 'OIT', ko: true },
  { id: 'qua', nome: 'Quartas de final', curto: 'QUA', ko: true },
  { id: 'sem', nome: 'Semifinal', curto: 'SEM', ko: true },
  { id: 'fin', nome: 'Final', curto: 'FIN', ko: true }
];
const STAGE_TIER = ['A', 'A', 'B', 'B', 'C', 'D'];
const STAGE_STR = [52, 55, 57, 57, 60, 63];
const GROUP_PTS_NEEDED = 4;

const LEVELS = [
  { n: 1, nome: 'Várzea', desc: 'Regras padrão.' },
  { n: 2, nome: 'Estadual', desc: 'Adversários do grupo +4 de força.' },
  { n: 3, nome: 'Série A', desc: 'Tudo do Estadual + Vestiário custa +1 Ficha.' },
  { n: 4, nome: 'Libertadores', desc: 'Tudo da Série A + juros máximos caem para +2.' },
  { n: 5, nome: 'Copa do Mundo', desc: 'Em breve: chefe também na semifinal.', locked: true },
  { n: 6, nome: 'Lenda', desc: 'Em breve: começa com relíquia amaldiçoada.', locked: true }
];
const MAX_PLAYABLE_LEVEL = 4;

const RARITIES = {
  comum: { nome: 'Comum', cor: '#9aa5b1' },
  incomum: { nome: 'Incomum', cor: '#2f9bff' },
  rara: { nome: 'Rara', cor: '#b05cff' },
  lendaria: { nome: 'Lendária', cor: '#ffb800' },
  amaldicoada: { nome: 'Amaldiçoada', cor: '#ff3b3b' }
};

const RELICS = {
  cabeca_ouro: { id: 'cabeca_ouro', nome: 'Cabeça de Ouro', rar: 'rara', icon: '👑', desc: 'Gol de cabeça vale 2.' },
  luva_ofensiva: { id: 'luva_ofensiva', nome: 'Luva Ofensiva', rar: 'rara', icon: '🧤', desc: 'O goleiro pode marcar: sobe nos escanteios e bate faltas e chutes de longe.' },
  escanteio_nunca: { id: 'escanteio_nunca', nome: 'Escanteio Curto Nunca', rar: 'incomum', icon: '🚩', desc: '+50% de escanteios e todo escanteio vira cabeçada na área.' },
  paredao_fala: { id: 'paredao_fala', nome: 'Paredão que Fala', rar: 'incomum', icon: '🧱', desc: 'Cada defesa difícil do seu goleiro dá +5% de força ao time até o fim do jogo.' },
  retranca: { id: 'retranca', nome: 'Retranca Rentável', rar: 'comum', icon: '💰', desc: 'Vitória por 1 a 0 dá +3 Fichas.' },
  promessa: { id: 'promessa', nome: 'Promessa Eterna', rar: 'lendaria', icon: '🌟', desc: 'O jogador mais fraco do time vira a Promessa: dobra a força no mata-mata.' },
  cofrinho: { id: 'cofrinho', nome: 'Cofrinho do Roupeiro', rar: 'comum', icon: '🐷', desc: 'Juros máximos +2 (de +3 para +5).' },
  pe_coelho: { id: 'pe_coelho', nome: 'Pé de Coelho', rar: 'comum', icon: '🐰', desc: 'A primeira bola na trave do seu time em cada jogo entra.' },
  bola_quadrada: { id: 'bola_quadrada', nome: 'Bola Quadrada', rar: 'amaldicoada', icon: '🟧', desc: 'Passes erram mais (menos lances) e sai mais chute de longe, mas gol de fora da área vale 2 pros DOIS times.' },
  juiz_ladrao: { id: 'juiz_ladrao', nome: 'Juiz Ladrão', rar: 'amaldicoada', icon: '🃏', desc: '1 vez por jogo o juiz marca um pênalti do nada: 60% pra você, 40% pro rival.' }
};
const RELIC_IDS = Object.keys(RELICS);
const RELIC_PRICE = { comum: 4, incomum: 5, rara: 7, lendaria: 9, amaldicoada: 4 };
const RELIC_WEIGHT = { comum: 40, incomum: 30, rara: 18, lendaria: 7, amaldicoada: 14 };

const CARD_TYPES = {
  ataque: { id: 'ataque', nome: 'Ataque', emoji: '🟥', cor: '#ff4d57', papel: 'mais chance de gol' },
  defesa: { id: 'defesa', nome: 'Defesa', emoji: '🟦', cor: '#3d8bff', papel: 'menos gols sofridos' },
  tatica: { id: 'tatica', nome: 'Tática', emoji: '🟨', cor: '#ffc83d', papel: 'muda o estilo de jogo' },
  especial: { id: 'especial', nome: 'Especial', emoji: '🟪', cor: '#c084fc', papel: 'rara e forte' }
};
const STYLE_NAME = { pressao: 'Pressão', posse: 'Posse', contra: 'Contra-ataque' };
// Pedra-papel-tesoura: Pressão ganha de Posse, Posse ganha de Contra-ataque, Contra-ataque ganha de Pressão.
const BEATS = { pressao: 'posse', posse: 'contra', contra: 'pressao' };
const pct = n => Math.round(n * 100) + '%';
function cardSpec(o) {
  o.desc = o.fx(1);
  return o;
}
const CARDS = {
  pressao: cardSpec({ id: 'pressao', nome: 'Pressão Alta', tipo: 'ataque', rar: 'comum', icon: '⚡', cost: 2, dur: '15 min', style: 'pressao', tip: 'Precisa do gol e o rival toca a bola.',
    lv: [{ roubo: 0.30, fadiga: 0.06, mins: 15 }, { roubo: 0.36, fadiga: 0.05, mins: 15 }, { roubo: 0.42, fadiga: 0.04, mins: 18 }],
    fx(lv) { const n = this.lv[lv - 1]; return `+${pct(n.roubo)} de roubadas no campo rival por ${n.mins} min. Depois −${pct(n.fadiga)} de força por 10 min.`; } }),
  casinha: cardSpec({ id: 'casinha', nome: 'Fechar a Casinha', tipo: 'defesa', rar: 'comum', icon: '🔒', cost: 1, dur: 'até o fim', style: null, tip: 'Ganhando por 1 depois dos 70 minutos.',
    lv: [{ them: 0.35, you: 0.05 }, { them: 0.40, you: 0.04 }, { them: 0.44, you: 0.03 }],
    fx(lv) { const n = this.lv[lv - 1]; return `Até o fim: rival −${pct(n.them)} de chance de gol, você −${pct(n.you)}.`; } }),
  contra: cardSpec({ id: 'contra', nome: 'Contra-Ataque Mortal', tipo: 'tatica', rar: 'incomum', icon: '⚡', cost: 2, dur: '20 min', style: 'contra', tip: 'O rival usou Pressão Alta.',
    lv: [{ q: 0.34, mins: 20 }, { q: 0.40, mins: 20 }, { q: 0.46, mins: 22 }],
    fx(lv) { const n = this.lv[lv - 1]; return `Por ${n.mins} min: −20% de posse. Roubada vira contra-ataque com +${pct(n.q)} de chance de gol.`; } }),
  chuveirinho: cardSpec({ id: 'chuveirinho', nome: 'Chuveirinho', tipo: 'ataque', rar: 'incomum', icon: '🌧️', cost: 1, dur: '15 min', style: null, tip: 'Tem cabeceador e a relíquia Cabeça de Ouro.',
    lv: [{ head: 0.20, mins: 15 }, { head: 0.24, mins: 15 }, { head: 0.28, mins: 18 }],
    fx(lv) { const n = this.lv[lv - 1]; return `+2 cruzamentos no período e cabeçada +${pct(n.head)} por ${n.mins} min.`; } }),
  craque: cardSpec({ id: 'craque', nome: 'Craque Decide', tipo: 'especial', rar: 'rara', icon: '⭐', cost: 3, dur: 'uso único', style: null, tip: 'O jogo está empatado e o seu melhor jogador está em campo.',
    lv: [{ q: 0.55 }, { q: 0.60 }, { q: 0.65 }],
    fx(lv) { const n = this.lv[lv - 1]; return `Uso único: jogada do melhor jogador com ${pct(n.q)} de chance de gol.`; } }),
  paredao: cardSpec({ id: 'paredao', nome: 'Paredão', tipo: 'defesa', rar: 'incomum', icon: '🛡️', cost: 2, dur: '10 min', style: null, tip: 'O rival finaliza muito ou tem pênalti à vista.',
    lv: [{ save: 0.30, pen: 0.50, mins: 10 }, { save: 0.36, pen: 0.55, mins: 10 }, { save: 0.42, pen: 0.60, mins: 12 }],
    fx(lv) { const n = this.lv[lv - 1]; return `Por ${n.mins} min: goleiro +${pct(n.save)} nas defesas. Pênalti: ${pct(n.pen)} de defesa.`; } }),
  submagica: cardSpec({ id: 'submagica', nome: 'Substituição Mágica', tipo: 'tatica', rar: 'comum', icon: '🔄', cost: 1, dur: 'uso único', style: null, tip: 'O time cansou depois da Pressão Alta.',
    lv: [{ add: 4 }, { add: 5 }, { add: 6 }],
    fx(lv) { const n = this.lv[lv - 1]; return `Uso único: zera o cansaço e entra um reserva com +${n.add} de força até o fim.`; } }),
  catimba: cardSpec({ id: 'catimba', nome: 'Catimba', tipo: 'especial', rar: 'rara', icon: '🎭', cost: 2, dur: 'uso único', style: null, tip: 'O rival ainda tem carta forte na mão.',
    lv: [{ }, { }, { }],
    fx() { return 'Uso único: cancela a próxima carta do adversário.'; } }),
  longe: cardSpec({ id: 'longe', nome: 'Chute de Longe', tipo: 'ataque', rar: 'incomum', icon: '🚀', cost: 1, dur: '15 min', style: null, tip: 'A defesa rival está fechada e sobra espaço fora da área.',
    lv: [{ q: 0.22, mins: 15 }, { q: 0.28, mins: 15 }, { q: 0.34, mins: 18 }],
    fx(lv) { const n = this.lv[lv - 1]; return `Por ${n.mins} min: chute de fora da área +${pct(n.q)} de chance de gol.`; } }),
  peixinho: cardSpec({ id: 'peixinho', nome: 'Peixinho', tipo: 'ataque', rar: 'rara', icon: '🐟', cost: 2, dur: 'uso único', style: null, tip: 'Acabou de armar a Bola Parada Ensaiada.',
    lv: [{ q: 0.28 }, { q: 0.34 }, { q: 0.40 }],
    fx(lv) { const n = this.lv[lv - 1]; return `Uso único: o próximo cruzamento vira peixinho com +${pct(n.q)} de chance de gol.`; } }),
  toque: cardSpec({ id: 'toque', nome: 'Toque de Bola', tipo: 'tatica', rar: 'comum', icon: '🎯', cost: 1, dur: '15 min', style: 'posse', tip: 'O rival abriu a marcação ou está no contra-ataque.',
    lv: [{ posse: 0.24, mins: 15 }, { posse: 0.30, mins: 15 }, { posse: 0.36, mins: 18 }],
    fx(lv) { const n = this.lv[lv - 1]; return `Posse paciente: +${pct(n.posse)} de posse por ${n.mins} min. Chance de gol −5%.`; } }),
  bolaparada: cardSpec({ id: 'bolaparada', nome: 'Bola Parada Ensaiada', tipo: 'ataque', rar: 'incomum', icon: '🚩', cost: 2, dur: '15 min', style: null, tip: 'O técnico tem Bola Parada alta ou você tem o Peixinho.',
    lv: [{ q: 0.22, mins: 15 }, { q: 0.28, mins: 15 }, { q: 0.34, mins: 18 }],
    fx(lv) { const n = this.lv[lv - 1]; return `Por ${n.mins} min: escanteio e falta +${pct(n.q)} de chance de gol.`; } }),
  linha: cardSpec({ id: 'linha', nome: 'Linha Alta', tipo: 'defesa', rar: 'incomum', icon: '📏', cost: 2, dur: '15 min', style: 'pressao', tip: 'O rival joga direto e pouco pela ponta.',
    lv: [{ cut: 0.18, mins: 15 }, { cut: 0.22, mins: 15 }, { cut: 0.26, mins: 18 }],
    fx(lv) { const n = this.lv[lv - 1]; return `Por ${n.mins} min: impedimento e linha alta, rival −${pct(n.cut)} de chance de gol.`; } }),
  grito: cardSpec({ id: 'grito', nome: 'Grito da Torcida', tipo: 'especial', rar: 'incomum', icon: '📣', cost: 2, dur: '10 min', style: null, tip: 'Vai usar o Craque Decide em seguida.',
    lv: [{ q: 0.12, mins: 10 }, { q: 0.16, mins: 10 }, { q: 0.20, mins: 12 }],
    fx(lv) { const n = this.lv[lv - 1]; return `Por ${n.mins} min: +${pct(n.q)} de chance de gol com a torcida em cima.`; } })
};
const CARD_IDS = Object.keys(CARDS);
const BASIC_CARDS = ['pressao', 'casinha', 'craque', 'submagica'];
const CARD_PRICE = { comum: 3, incomum: 4, rara: 6 };
const CARD_WEIGHT = { comum: 40, incomum: 35, rara: 20 };
const COMBOS = [
  { id: 'blitz', nome: 'Blitz', cards: ['pressao', 'submagica'], text: 'Blitz! A pressão segue e o cansaço não chega.' },
  { id: 'aereo', nome: 'Bombardeio Aéreo', cards: ['chuveirinho'], relic: 'cabeca_ouro', text: 'Bombardeio Aéreo! Chuveirinho com Cabeça de Ouro.' },
  { id: 'muralha', nome: 'Muralha', cards: ['casinha', 'paredao'], text: 'Muralha! Casinha e Paredão fecham o jogo.' },
  { id: 'armadilha', nome: 'Armadilha', cards: ['linha', 'contra'], text: 'Armadilha! A linha alta vira contra-ataque.' },
  { id: 'ensaio', nome: 'Ensaio Fino', cards: ['bolaparada', 'peixinho'], text: 'Ensaio Fino! A bola parada termina no peixinho.' },
  { id: 'estrela', nome: 'Estrela da Casa', cards: ['grito', 'craque'], text: 'Estrela da Casa! O grito empurra o craque.' }
];
function cardLevel(run, id) {
  const n = run && run.cardLv && run.cardLv[id];
  return n === 2 || n === 3 ? n : 1;
}
function cardNums(run, id) { return CARDS[id].lv[cardLevel(run, id) - 1]; }
function cardText(id, lv) { return CARDS[id].fx(lv || 1); }
function nrgMax(run) { return 3 + (run && cs(run, 'est') >= 3.5 ? 1 : 0); }
function comboHints(run, id) {
  return COMBOS.filter(c => c.cards.indexOf(id) >= 0 && (
    (c.relic && run.relics && run.relics.indexOf(c.relic) >= 0) ||
    c.cards.some(x => x !== id && run.cards && run.cards.indexOf(x) >= 0)
  )).map(c => c.nome);
}
const MAX_RELICS = 5, MAX_CARDS = 4;


// ---------- Técnico (Monte seu Técnico) ----------
// atributos: notas 55..99 estilo FUT; o efeito usa s = (nota - 55) / 10 (0..4, contínuo)
const CK = { atk: 0.0045, def: 0.02, mei: 0.0038, bol: 0.006, motLose: 0.22, motKO: 0.06, motPen: 0.006, estMin: 0.3, estQ: 0.004, estSub: 0.25 };
const pp = x => (x * 100).toFixed(1).replace('.', ',');
const n1 = x => x.toFixed(1).replace('.', ',');
const COACH_ATTRS = [
  { id: 'atk', nome: 'Ataque', icon: '⚔️', curto: 'ATQ', desc: 'Suas finalizações entram mais.', fx: s => `+${pp(s * CK.atk)} p.p. de chance de gol em cada chute seu` },
  { id: 'def', nome: 'Defesa', icon: '🛡️', curto: 'DEF', desc: 'O rival converte menos chutes.', fx: s => `−${pp(s * CK.def)}% na chance de gol de cada chute do rival` },
  { id: 'mei', nome: 'Posse', icon: '🎯', curto: 'POS', desc: 'Seu time fica mais com a bola e ataca mais.', fx: s => `+${pp(s * CK.mei)} p.p. de chance de cada lance ser seu` },
  { id: 'bol', nome: 'Bola Parada', icon: '🚩', curto: 'BPA', desc: 'Mais escanteios e faltas, e cabeçadas/cobranças mais perigosas.', fx: s => `+${pp(s * CK.bol)} p.p. em escanteio, falta e cruzamento; mais bolas paradas` },
  { id: 'mot', nome: 'Mentalidade', icon: '🔥', curto: 'MEN', desc: 'Reage quando está perdendo, cresce no mata-mata e nos pênaltis.', fx: s => `+${n1(s * CK.motLose)} de força perdendo, +${n1(s * CK.motKO)} no mata-mata, +${pp(s * CK.motPen)}% nos pênaltis` },
  { id: 'est', nome: 'Estrategista', icon: '📋', curto: 'EST', desc: 'Cartas duram mais. Com nota 90+, a Energia do Técnico sobe de 3 para 4.', fx: s => `cartas duram +${Math.round(s * CK.estMin)} min${s >= 3.5 ? ' e a energia da partida vai a 4' : ''}` }
];
const COACH_ATTR_IDS = COACH_ATTRS.map(a => a.id);
// notas estilo FUT (55-95): [ATQ, DEF, POS, BPA, MEN, EST]
function C(id, nome, curto, flag, s, fama) { return { id, nome, curto, flag, s: { atk: s[0], def: s[1], mei: s[2], bol: s[3], mot: s[4], est: s[5] }, fama }; }
const COACHES = [
  C('guardiola', 'Pep Guardiola', 'Guardiola', '🇪🇸', [87, 70, 95, 66, 79, 89], 'Tiki-taka e posse sufocante'),
  C('ancelotti', 'Carlo Ancelotti', 'Ancelotti', '🇮🇹', [79, 78, 80, 68, 94, 86], 'Rei da Champions e da gestão de grupo'),
  C('mourinho', 'José Mourinho', 'Mourinho', '🇵🇹', [68, 92, 66, 79, 88, 87], 'Estaciona o ônibus e ganha no detalhe'),
  C('klopp', 'Jürgen Klopp', 'Klopp', '🇩🇪', [92, 71, 78, 67, 93, 79], 'Heavy metal e gegenpressing'),
  C('zidane', 'Zinédine Zidane', 'Zidane', '🇫🇷', [86, 70, 79, 65, 91, 76], 'Três Champions seguidas na calma'),
  C('simeone', 'Diego Simeone', 'Simeone', '🇦🇷', [67, 94, 64, 85, 89, 80], 'Cholismo: partido a partido'),
  C('ferguson', 'Alex Ferguson', 'Ferguson', '🏴󠁧󠁢󠁳󠁣󠁴󠁿', [87, 77, 78, 70, 95, 78], 'Fergie Time e viradas no fim'),
  C('sacchi', 'Arrigo Sacchi', 'Sacchi', '🇮🇹', [79, 88, 85, 58, 68, 93], 'Zona e linha alta do Milan'),
  C('cruyff', 'Johan Cruyff', 'Cruyff', '🇳🇱', [93, 57, 94, 64, 77, 87], 'O pai do Dream Team do Barça'),
  C('michels', 'Rinus Michels', 'Michels', '🇳🇱', [86, 69, 92, 66, 79, 88], 'O General do Futebol Total'),
  C('tele', 'Telê Santana', 'Telê', '🇧🇷', [94, 66, 87, 68, 76, 77], 'Futebol-arte do Brasil de 82 e do São Paulo'),
  C('felipao', 'Luiz Felipe Scolari', 'Felipão', '🇧🇷', [78, 87, 67, 79, 94, 69], 'Família Scolari, penta em 2002'),
  C('parreira', 'Carlos Alberto Parreira', 'Parreira', '🇧🇷', [69, 86, 85, 67, 78, 86], 'Tetra em 94 com o time compacto'),
  C('zagallo', 'Mário Zagallo', 'Zagallo', '🇧🇷', [85, 78, 79, 69, 87, 77], 'Velho Lobo: vocês vão ter que me engolir'),
  C('tite', 'Tite', 'Tite', '🇧🇷', [78, 87, 84, 76, 70, 79], 'Organização e linhas compactas'),
  C('abel', 'Abel Ferreira', 'Abel', '🇵🇹', [77, 88, 68, 93, 80, 79], 'Bola parada e Libertadores no Palmeiras'),
  C('jorgejesus', 'Jorge Jesus', 'Jorge Jesus', '🇵🇹', [91, 67, 86, 66, 85, 78], 'O Mister do Flamengo de 2019'),
  C('dorival', 'Dorival Júnior', 'Dorival', '🇧🇷', [77, 76, 78, 68, 85, 76], 'Copa do Brasil e Libertadores com elenco feliz'),
  C('muricy', 'Muricy Ramalho', 'Muricy', '🇧🇷', [66, 91, 65, 86, 88, 68], 'Aqui é trabalho: tri brasileiro'),
  C('luxemburgo', 'Vanderlei Luxemburgo', 'Luxemburgo', '🇧🇷', [85, 70, 79, 77, 78, 90], 'O Pofexô dos cinco brasileiros'),
  C('conte', 'Antonio Conte', 'Conte', '🇮🇹', [79, 88, 77, 68, 92, 80], 'Três zagueiros e intensidade'),
  C('arteta', 'Mikel Arteta', 'Arteta', '🇪🇸', [80, 79, 86, 92, 70, 79], 'Arsenal mestre dos escanteios'),
  C('xabi', 'Xabi Alonso', 'Xabi Alonso', '🇪🇸', [86, 79, 87, 67, 79, 87], 'Leverkusen invicto'),
  C('bielsa', 'Marcelo Bielsa', 'Bielsa', '🇦🇷', [91, 58, 79, 57, 87, 92], 'El Loco: pressão e prancheta infinita'),
  C('low', 'Joachim Löw', 'Löw', '🇩🇪', [86, 77, 85, 69, 78, 79], 'O 7 a 1 e o título de 2014'),
  C('delbosque', 'Vicente del Bosque', 'Del Bosque', '🇪🇸', [78, 79, 91, 59, 86, 77], 'Espanha campeã de 2010'),
  C('scaloni', 'Lionel Scaloni', 'Scaloni', '🇦🇷', [77, 86, 79, 69, 93, 70], 'Argentina campeã de 2022'),
  C('menotti', 'César Luis Menotti', 'Menotti', '🇦🇷', [90, 68, 86, 58, 79, 77], 'El Flaco, Argentina de 78'),
  C('bilardo', 'Carlos Bilardo', 'Bilardo', '🇦🇷', [68, 87, 67, 86, 80, 94], 'El Narigón, estrategista de 86'),
  C('diniz', 'Fernando Diniz', 'Diniz', '🇧🇷', [85, 57, 93, 66, 77, 78], 'Dinizismo: posse aposicional'),
  C('renato', 'Renato Gaúcho', 'Renato', '🇧🇷', [87, 69, 68, 70, 92, 68], 'Resenha no vestiário e Libertadores 2017'),
  C('herrera', 'Helenio Herrera', 'Herrera', '🇦🇷', [66, 93, 68, 79, 78, 88], 'O Mago do catenaccio da Inter')
];
const COACH_BY_ID = Object.fromEntries(COACHES.map(c => [c.id, c]));
const COACH_DRAWS = 6, COACH_ROLLS = 2;

function coachDraftNew(seed) {
  const d = { seed: normalizeSeed(seed), draw: 0, rolls: COACH_ROLLS, shown: [], slots: {}, current: null, done: false };
  draftDraw(d); return d;
}
function draftDraw(d) {
  const r = rngFor(d.seed, 'tecnico', d.draw, d.shown.length);
  let cand = COACHES.filter(c => d.shown.indexOf(c.id) < 0);
  if (!cand.length) cand = COACHES;
  const c = r.pick(cand); d.current = c.id; d.shown.push(c.id); return c;
}
function draftPick(d, attr) {
  if (d.done || !d.current || d.slots[attr] || COACH_ATTR_IDS.indexOf(attr) < 0) return false;
  const c = COACH_BY_ID[d.current];
  d.slots[attr] = { rating: c.s[attr], from: c.curto, fromId: c.id };
  d.draw++;
  if (Object.keys(d.slots).length >= COACH_ATTR_IDS.length) { d.done = true; d.current = null; }
  else draftDraw(d);
  return true;
}
function draftReroll(d) {
  if (d.done || d.rolls <= 0) return false;
  d.rolls--; draftDraw(d); return true;
}
function makeCoach(nome, slots) { return { nome: String(nome || 'Professor Fominha').slice(0, 24), slots }; }
function flatCoach(rating, nome) { const sl = {}; COACH_ATTR_IDS.forEach(a => { sl[a] = { rating, from: 'Interino', fromId: '' }; }); return makeCoach(nome || 'Interino', sl); }
const COACH_MIN = 55;
function coachS(r) { return clamp((r - COACH_MIN) / 10, 0, 4); }
function coachOVR(x) { const sl = x && x.slots ? x.slots : null; const v = COACH_ATTR_IDS.map(a => sl ? (sl[a] ? sl[a].rating : COACH_MIN) : x.s[a]); return Math.round(v.reduce((p, q) => p + q, 0) / v.length); }
function cs(run, a) { const c = run && run.coach; return c && c.slots[a] ? coachS(c.slots[a].rating) : 0; }
function csrc(run, a) { const c = run && run.coach; return c && c.slots[a] ? c.slots[a].from : ''; }
function coachTitle(coach) {
  if (!coach) return 'Interino';
  const v = COACH_ATTR_IDS.map(a => coach.slots[a] ? coach.slots[a].rating : COACH_MIN);
  const ovr = v.reduce((x, y) => x + y, 0) / v.length;
  if (v.every(x => x >= 86)) return 'Gênio da Prancheta';
  if (ovr <= 66) return 'Técnico Interino';
  const mx = Math.max(...v);
  const tops = COACH_ATTR_IDS.filter((a, i) => v[i] >= mx - 1);
  if (tops.length >= 3) return 'Técnico Completo';
  const T2 = { atk: 'Ofensivo', def: 'Retranqueiro', mei: 'Dono da Posse', bol: 'Rei da Bola Parada', mot: 'Paizão Motivador', est: 'Professor Pardal' };
  if (tops.length === 2) {
    const k = tops.slice().sort().join('+');
    const combo = { 'atk+mot': 'Ofensivo e Raçudo', 'def+mot': 'Retranqueiro Raçudo', 'atk+mei': 'Futebol-Arte', 'def+est': 'Estrategista Retranqueiro', 'bol+def': 'Retranca de Bola Parada', 'est+mei': 'Professor da Posse', 'mei+mot': 'Maestro Raçudo', 'atk+def': 'Equilibrado', 'atk+est': 'Ofensivo Estrategista', 'bol+mot': 'Bola Parada na Raça', 'def+mei': 'Controle Total', 'atk+bol': 'Rolo Compressor', 'est+mot': 'Motivador Estrategista', 'bol+mei': 'Paciente e Letal', 'bol+est': 'Ensaiador de Jogadas', 'def+atk': 'Equilibrado' }[k];
    if (combo) return combo;
  }
  return T2[tops[0]];
}

// ---------- Lances épicos ----------
// Os lances épicos só re-narram gols/defesas que a simulação já produziu (stream de RNG separado):
// não mudam placar, chances nem a sequência aleatória principal.
const EPICS = {
  olimpico: { id: 'olimpico', nome: 'Gol Olímpico', icon: '🌀', frase: ['DIRETO DO ESCANTEIO! A BOLA FAZ A CURVA E MORRE NO GOL! É GOL OLÍMPICO, MINHA GENTE!', 'NINGUÉM TOCOU NA BOLA! GOL OLÍMPICO! O GOLEIRO FICOU OLHANDO!'] },
  bicicleta: { id: 'bicicleta', nome: 'Gol de Bicicleta', icon: '🚲', frase: ['DE BICICLETA! DE BICICLETA! QUE COISA LINDA! PODE PARAR O CAMPEONATO!', 'SE ATIROU DE COSTAS E... BICICLETA! É PRA EMOLDURAR!'] },
  golaco: { id: 'golaco', nome: 'Golaço no Ângulo', icon: '🎯', frase: ['ONDE A CORUJA DORME! QUE GOLAÇO! QUE COISA LINDA!', 'SEM-PULO NO ÂNGULO! O GOLEIRO SÓ VIU PASSAR! GOLAÇO!'] },
  cobertura: { id: 'cobertura', nome: 'Gol de Cobertura', icon: '🌈', frase: ['VIU O GOLEIRO ADIANTADO E... ENCOBRIU! QUE CATEGORIA!', 'POR CIMA DO GOLEIRO! UMA CAVADINHA DE MESTRE!'] },
  calcanhar: { id: 'calcanhar', nome: 'Gol de Calcanhar', icon: '🦶', frase: ['DE CALCANHAR! DE CALCANHAR, DO JEITO QUE O POVO GOSTA!', 'DE COSTAS PRO GOL, DE CALCANHAR! É MOLECAGEM!'] },
  goleiro: { id: 'goleiro', nome: 'Gol do Goleiro', icon: '🧤', frase: ['O GOLEIRO! O GOLEIRO FEZ O GOL! INACREDITÁVEL!', 'ATRAVESSOU O CAMPO E MARCOU! GOL DO GOLEIRO, É HISTÓRICO!'] },
  hattrick: { id: 'hattrick', nome: 'Hat-trick', icon: '🎩', frase: ['É O TERCEIRO DELE! HAT-TRICK! PEDE MÚSICA NO FANTÁSTICO!', 'TRÊS GOLS NO JOGO! LEVA A BOLA PRA CASA!'] },
  virada: { id: 'virada', nome: 'Virada no Fim', icon: '⏱️', frase: ['NO APAGAR DAS LUZES! VIRADA HISTÓRICA! O ESTÁDIO VEM ABAIXO!', 'ACABOU O DRAMA! VIROU NO FINALZINHO! QUE JOGO, MINHA GENTE!'] },
  placa: { id: 'placa', nome: 'Goleada Histórica', icon: '🪧', frase: ['É PLACA! É GOLEADA! PODE COLOCAR NO MUSEU!', 'CHOCOLATE! GOLEADA HISTÓRICA! O RIVAL NÃO VÊ A BOLA!'] },
  penalti: { id: 'penalti', nome: 'Pênalti Defendido', icon: '🧱', frase: ['NÃO É GOL! ELE PEGOU! ELE PEGOU! SÃO {g}!', 'VOOU NO CANTO E BUSCOU! QUE DEFESA DE PÊNALTI DE {g}!'] }
};
const EPIC_IDS = Object.keys(EPICS);
// chance de um gol já existente virar lance épico, por tipo de lance
const EPIC_RATE = { olimpico: 0.12, bicicleta: 0.06, golaco: 0.11, cobertura: 0.022, calcanhar: 0.014, hattrick: 0.25, penalti: 0.35 };

// ---------- Clima ----------
const WEATHER = {
  sol: { id: 'sol', nome: 'Sol', icon: '☀️', desc: 'Tempo bom. Sem efeito no jogo.' },
  noite: { id: 'noite', nome: 'Jogo à noite', icon: '🌙', desc: 'Refletores acesos. Sem efeito no jogo, só clima de decisão.' },
  chuva: { id: 'chuva', nome: 'Chuva', icon: '🌧️', desc: 'Bola pesada: chutes de fora e faltas entram 15% menos (pros dois times); mais escanteios.' },
  calor: { id: 'calor', nome: 'Calor forte', icon: '🥵', desc: 'Cansa mais: a Pressão alta derruba o meio em −6 (em vez de −4) e os dois times perdem 2 no meio depois dos 60\'.' },
  neblina: { id: 'neblina', nome: 'Neblina', icon: '🌫️', desc: 'Pouca visão: cruzamentos e escanteios entram 10% menos (pros dois times).' },
  altitude: { id: 'altitude', nome: 'Altitude', icon: '🏔️', desc: 'Ar rarefeito: a bola voa, chutes de fora entram 12% mais (pros dois times).' }
};
const WEATHER_W = { sol: 34, noite: 20, chuva: 18, calor: 12, neblina: 8, altitude: 8 };
function weatherFor(run, stage) {
  stage = stage == null ? run.stage : stage;
  const r = rngFor(run.seed, 'clima', stage);
  return r.weighted(Object.keys(WEATHER_W), k => WEATHER_W[k]);
}

// ---------- Desafio do Técnico Lendário (chefe semanal) ----------
const LEGENDS = {
  bra70: { id: 'bra70', kit: ['#ffd21f', '#0b7a3b'], nome: 'Brasil 1970', apelido: 'O Tri de Zagallo', tecnico: 'Zagallo', flag: '🇧🇷', rule: 'fora', regra: 'Jogo Bonito de 70: os chutes de fora deles entram bem mais.', lines: { atk: 74, mid: 71, def: 64, gk: 63 }, scorers: ['Pelé', 'Jairzinho', 'Tostão', 'Rivellino'], scorerW: [4, 3, 2, 2], gk: 'Félix' },
  ita82: { id: 'ita82', kit: ['#1f5fbf', '#ffffff'], nome: 'Itália 1982', apelido: 'O Ferrolho de Bearzot', tecnico: 'Enzo Bearzot', flag: '🇮🇹', rule: 'muralha', regra: 'Catenaccio: suas finalizações entram 10% menos.', lines: { atk: 68, mid: 68, def: 72, gk: 70 }, scorers: ['Paolo Rossi', 'Tardelli', 'Altobelli', 'Conti'], scorerW: [5, 2, 2, 1], gk: 'Zoff' },
  esp10: { id: 'esp10', kit: ['#c8102e', '#ffd21f'], nome: 'Espanha 2010', apelido: 'O Tiki-taka de Del Bosque', tecnico: 'Vicente del Bosque', flag: '🇪🇸', rule: 'posse', regra: 'Tiki-taka: eles ficam com a bola, você ataca menos.', lines: { atk: 70, mid: 75, def: 67, gk: 68 }, scorers: ['Villa', 'Iniesta', 'Xavi', 'Torres'], scorerW: [4, 3, 2, 2], gk: 'Casillas' },
  ale14: { id: 'ale14', kit: ['#ffffff', '#111111'], nome: 'Alemanha 2014', apelido: 'O 7 a 1 de Löw', tecnico: 'Joachim Löw', flag: '🇩🇪', rule: 'pressao', regra: 'Blitz alemã: nos primeiros 20 minutos eles pressionam forte.', lines: { atk: 73, mid: 71, def: 66, gk: 67 }, scorers: ['Müller', 'Klose', 'Kroos', 'Schürrle'], scorerW: [4, 3, 2, 2], gk: 'Neuer' },
  hol74: { id: 'hol74', kit: ['#ff7a00', '#ffffff'], nome: 'Holanda 1974', apelido: 'A Laranja de Michels', tecnico: 'Rinus Michels', flag: '🇳🇱', rule: 'virada', regra: 'Futebol Total: quando estão perdendo, ganham +6 de força.', lines: { atk: 71, mid: 72, def: 65, gk: 64 }, scorers: ['Cruyff', 'Neeskens', 'Rep', 'Rensenbrink'], scorerW: [4, 3, 2, 2], gk: 'Jongbloed' }
};
const LEGEND_IDS = Object.keys(LEGENDS);

// ---------- Run ----------
function selecaoChoices(seed) { return rngFor(seed, 'selecoes').shuffle(SELECAO_IDS); }

function opponentsFor(seed) {
  const r = rngFor(seed, 'adversarios');
  const used = new Set();
  const list = [];
  for (let s = 0; s < 6; s++) {
    const tier = OPPONENTS[STAGE_TIER[s]].filter(o => !used.has(o.nome));
    const o = r.pick(tier); used.add(o.nome);
    const S = STAGE_STR[s];
    const j = () => r.int(-3, 3);
    list.push({ ...o, stage: s, baseStr: S, jit: { atk: j(), mid: j(), def: j(), gk: j() }, scorerW: [3, 2, 1] });
  }
  return list;
}

function newRun(seed, level, selecaoId, coach, opts) {
  seed = normalizeSeed(seed) || randomSeed();
  level = clamp(level | 0 || 1, 1, MAX_PLAYABLE_LEVEL);
  const sel = SELECOES[selecaoId] || SELECOES.bra82;
  const r = rngFor(seed, 'inicio', sel.id);
  let cards;
  if (sel.id === 'hol74') cards = ['pressao', r.pick(BASIC_CARDS.filter(c => c !== 'pressao'))];
  else cards = r.shuffle(BASIC_CARDS).slice(0, 2);
  return {
    v: 1, seed, level, selecao: sel.id,
    players: sel.titulares.map(p => ({ ...p, id: p.nome, origem: sel.nome })),
    cards, relics: [], fichas: 4,
    stage: 0, groupPts: 0, history: [], goalsBy: {}, goalTypes: {},
    rewardRerolls: 0, shopRerolls: 0, offerSalt: 0, shopSalt: 0,
    opponents: opponentsFor(seed), status: 'playing', maxStage: 0,
    totalGF: 0, totalGA: 0, relicLog: [], cardLog: {}, cardLv: {}, coach: coach || null,
    legend: opts && LEGENDS[opts.legend] ? opts.legend : null, epics: [], weathers: []
  };
}

function has(run, relicId) { return run.relics.indexOf(relicId) >= 0; }
function isKO(stage) { return STAGES[stage] && STAGES[stage].ko; }

function promessaIndex(run) {
  if (!has(run, 'promessa')) return -1;
  let idx = 0;
  run.players.forEach((p, i) => { if (p.rating < run.players[idx].rating) idx = i; });
  return idx;
}
function effRating(run, i, stage) {
  const p = run.players[i];
  if (i === promessaIndex(run) && isKO(stage == null ? run.stage : stage)) return Math.min(99, p.rating * 2);
  return p.rating;
}
function teamLines(run, stage) {
  const rs = run.players.map((p, i) => ({ p, r: effRating(run, i, stage) }));
  const by = pos => rs.filter(x => x.p.pos === pos).map(x => x.r);
  const gk = avg(by('GOL')), zag = avg(by('ZAG')), mei = avg(by('MEI')), ata = avg(by('ATA'));
  return {
    gk: Math.round(gk),
    def: Math.round(zag * 0.75 + gk * 0.25),
    mid: Math.round(mei),
    atk: Math.round(ata * 0.65 + mei * 0.35)
  };
}
function oppLines(run, stage) {
  if (stage === 6 && run.cupRole != null && run.opponents[6]) {
    const o = run.opponents[6];
    return { atk: o.baseStr + o.jit.atk, mid: o.baseStr + o.jit.mid, def: o.baseStr + o.jit.def, gk: o.baseStr + o.jit.gk };
  }
  if (stage === 6) return { ...(run.legend ? LEGENDS[run.legend].lines : BOSS.lines) };
  const o = run.opponents[stage];
  const lvl = run.level >= 2 && stage <= 2 ? 4 : 0;
  const S = o.baseStr + lvl;
  return { atk: S + o.jit.atk, mid: S + o.jit.mid, def: S + o.jit.def, gk: S + o.jit.gk };
}
function opponentInfo(run, stage) {
  stage = stage == null ? run.stage : stage;
  if (stage === 6 && run.cupRole != null && run.opponents[6]) {
    const o = run.opponents[6];
    return { nome: o.nome, flag: o.flag, boss: false, scorers: o.scorers, scorerW: o.scorerW, gk: o.gk, lines: oppLines(run, 6) };
  }
  if (stage === 6 && run.legend) { const L = LEGENDS[run.legend]; return { nome: L.nome, flag: L.flag, kit: L.kit, boss: true, legend: L.id, rule: L.rule, tecnico: L.tecnico, apelido: L.apelido, regra: L.regra, scorers: L.scorers, scorerW: L.scorerW, gk: L.gk, lines: oppLines(run, 6) }; }
  if (stage === 6) return { nome: BOSS.nome, flag: BOSS.flag, boss: true, rule: 'mao', apelido: BOSS.apelido, regra: BOSS.regra, scorers: BOSS.scorers, scorerW: BOSS.scorerW, gk: BOSS.gk, lines: oppLines(run, 6) };
  const o = run.opponents[stage];
  return { nome: o.nome, flag: o.flag, boss: false, scorers: o.scorers, scorerW: o.scorerW, gk: o.gk, lines: oppLines(run, stage) };
}
function maxInterest(run) {
  let m = 3; if (has(run, 'cofrinho')) m += 2; if (run.level >= 4) m -= 1; return m;
}
function interestFor(run) { return Math.min(Math.floor(run.fichas / 5), maxInterest(run)); }

// ---------- Partida ----------
function createMatch(run) {
  const stage = run.stage;
  const r = rngFor(run.seed, 'partida', stage, run.history.length);
  const opp = opponentInfo(run, stage);
  const me = teamLines(run, stage);
  const m = {
    stage, ko: isKO(stage), opp, base: [me, opp.lines],
    rng: r, minute: 0, score: [0, 0], done: false, awaiting: false,
    pauses: [r.int(17, 25), r.int(47, 56), r.int(68, 78)].sort((a, b) => a - b),
    fx: blankFx(), fxOpp: blankFx(), nrgLeft: nrgMax(run), nrgMax: nrgMax(run),
    cpuDeck: r.shuffle(['pressao', 'casinha', 'contra', 'toque', 'chuveirinho', 'longe', 'paredao', 'linha', 'grito']).slice(0, 2),
    cpuUsed: [], cpuNrg: 2, combos: [],
    used: [], peCoelhoUsed: false,
    juizMin: has(run, 'juiz_ladrao') ? r.int(12, 84) : -1,
    maoMin: opp.boss ? r.int(28, 82) : -1, maoDone: false,
    goals: [], stats: { lances: [0, 0], shots: [0, 0], bigSaves: [0, 0], cardGoals: [], relicExtra: {}, posts: [0, 0] },
    lastPauseMin: -1, run, motShown: false,
    weather: weatherFor(run, stage), erng: rngFor(run.seed, 'epico', stage, run.history.length), epics: [], trailed: false, myGoalsBy: {}, placaDone: false
  };
  if (opp.rule && opp.rule !== 'mao') m.maoMin = -1;
  m.stats.coach = { atk: 0, def: 0, mei: 0, bol: 0, mot: 0, est: 0 };
  Object.defineProperty(m, 'run', { value: run, enumerable: false, writable: true });
  return m;
}

// Final ao vivo: os dois lados são campanhas de verdade. O placar é canônico
// (casa = jogador do grupo A, visitante = jogador do grupo E) pros dois celulares.
function blankFx() {
  return {
    pressaoUntil: -1, pressaoAdd: 0, pressaoFadiga: 0, casinhaUntil: -1, casinhaThem: 0, casinhaYou: 0,
    chuvaUntil: -1, chuvaHead: 0, longeUntil: -1, longeQ: 0, contraUntil: -1, contraQ: 0,
    toqueUntil: -1, toqueAdd: 0, linhaUntil: -1, linhaCut: 0, bolaUntil: -1, bolaQ: 0,
    gritoUntil: -1, gritoQ: 0, paredaoUntil: -1, paredaoCut: 0, penSave: 0,
    craque: false, craqueQ: 0.55, peixinho: false, peixinhoQ: 0.28, paredao: false,
    sub: 0, fatigue: 0, fadigaUntil: -1, fadigaPct: 0, paredaoMult: 1,
    style: null, styleUntil: -1, styleCard: null, golpeUntil: -1, catimba: false, blitz: false, aereo: false
  };
}
function createPvpMatch(home, away, seed) {
  seed = normalizeSeed(seed) || 'FINAL';
  const stage = 6;
  const r = rngFor(seed, 'final-ao-vivo');
  const out = run => run.players.filter(p => p.pos !== 'GOL').slice().sort((a, b) => b.rating - a.rating).slice(0, 4);
  const aw = out(away);
  const opp = {
    nome: SELECOES[away.selecao].nome, flag: SELECOES[away.selecao].flag, kit: SELECOES[away.selecao].kit,
    boss: false, scorers: aw.map(p => p.nome), scorerW: aw.map(p => Math.max(1, p.rating - 55)),
    gk: (away.players.find(p => p.pos === 'GOL') || { nome: 'Goleiro' }).nome, lines: teamLines(away, stage)
  };
  const m = {
    stage, ko: true, opp, base: [teamLines(home, stage), opp.lines],
    rng: r, minute: 0, score: [0, 0], done: false, awaiting: false, awaitingSides: [false, false],
    pauses: [r.int(17, 25), r.int(47, 56), r.int(68, 78)].sort((a, b) => a - b),
    fx: blankFx(), fxAway: blankFx(), nrgLeft: nrgMax(home), nrgAway: nrgMax(away), nrgMax: nrgMax(home), nrgMaxAway: nrgMax(away),
    used: [], usedAway: [], combos: [], combosAway: [], peCoelhoUsed: false, peCoelhoAway: false,
    juizMin: has(home, 'juiz_ladrao') ? r.int(20, 70) : -1,
    juizMinAway: has(away, 'juiz_ladrao') ? r.int(20, 70) : -1,
    maoMin: -1, maoDone: false,
    goals: [], stats: { lances: [0, 0], shots: [0, 0], bigSaves: [0, 0], cardGoals: [], relicExtra: {}, posts: [0, 0], coach: { atk: 0, def: 0, mei: 0, bol: 0, mot: 0, est: 0 }, coachAway: { atk: 0, def: 0, mei: 0, bol: 0, mot: 0, est: 0 } },
    lastPauseMin: -1, motShown: false, motShownAway: false, pvp: true,
    weather: rngFor(seed, 'final-clima').weighted(Object.keys(WEATHER_W), k => WEATHER_W[k]),
    erng: rngFor(seed, 'final-epico'), epics: [], trailed: false, myGoalsBy: {}, awayGoalsBy: {}, placaDone: false
  };
  Object.defineProperty(m, 'run', { value: home, enumerable: false, writable: true });
  Object.defineProperty(m, 'away', { value: away, enumerable: false, writable: true });
  return m;
}
function awayPlayable(m) {
  const left = m.nrgAway == null ? 99 : m.nrgAway;
  return (m.away && m.away.cards ? m.away.cards : []).filter(c => m.usedAway.indexOf(c) < 0 && CARDS[c] && CARDS[c].cost <= left);
}
function pvpCards(m, side) { return side === 0 ? playableCards(m) : awayPlayable(m); }

function lines(m, side) {
  const b = m.base[side];
  const hot = m.weather === 'calor' && m.minute > 60 ? 2 : 0;
  if (side === 1) {
    const vb = !m.pvp && m.opp.rule === 'virada' && m.score[1] < m.score[0] ? 6 : 0;
    if (!m.pvp) {
      const fo = m.fxOpp || {};
      const fad = fadMul(fo, m.minute);
      const add = fo.sub || 0;
      return { atk: (b.atk + vb + add) * fad, mid: (b.mid + vb - hot + add) * fad, def: (b.def + vb + add) * fad, gk: b.gk + vb + add };
    }
    const fa = m.fxAway, away = m.away;
    let add = fa.sub;
    if (away.selecao === 'cam90' && m.score[1] < m.score[0]) add += 6;
    const mot = cs(away, 'mot');
    if (mot) { if (m.score[1] < m.score[0]) add += CK.motLose * mot; add += CK.motKO * mot; }
    const fadA = fadMul(fa, m.minute);
    return { atk: (b.atk * fa.paredaoMult + add) * fadA, mid: (b.mid * fa.paredaoMult + add - fa.fatigue - hot) * fadA, def: (b.def * fa.paredaoMult + add) * fadA, gk: b.gk * fa.paredaoMult + add };
  }
  const run = m.run, f = m.fx;
  let add = f.sub - 0; let mult = f.paredaoMult;
  if (run.selecao === 'cam90' && m.score[0] < m.score[1]) add += 6;
  const mot = cs(run, 'mot');
  if (mot) { if (m.score[0] < m.score[1]) add += CK.motLose * mot; if (m.ko) add += CK.motKO * mot; }
  const fad = fadMul(f, m.minute);
  return {
    atk: (b.atk * mult + add) * fad, mid: (b.mid * mult + add - f.fatigue - hot) * fad, def: (b.def * mult + add) * fad, gk: b.gk * mult + add
  };
}
function fadMul(f, minute) {
  if (!f || f.blitz || !(f.fadigaUntil >= minute) || !f.fadigaPct) return 1;
  return 1 - f.fadigaPct;
}

function bestPlayer(run, stage, filter) {
  let best = -1, br = -1;
  run.players.forEach((p, i) => { if (filter && !filter(p)) return; const r = effRating(run, i, stage); if (r > br) { br = r; best = i; } });
  return best;
}

function pickMyScorer(m, type) {
  const run = m.run, r = m.rng, st = m.stage;
  const idxs = run.players.map((_, i) => i);
  let wf;
  if (type === 'cabeca') wf = i => { const p = run.players[i]; return p.pos === 'GOL' ? 0 : (p.traits.includes('C') ? 4 : 0) + (p.pos === 'ATA' ? 2 : p.pos === 'ZAG' ? 1.2 : 0.8); };
  else if (type === 'fora') wf = i => { const p = run.players[i]; return p.pos === 'GOL' ? 0 : (p.traits.includes('F') ? 4 : 0) + (p.pos === 'MEI' ? 2 : p.pos === 'ATA' ? 1.5 : 0.4); };
  else if (type === 'falta') wf = i => { const p = run.players[i]; return p.pos === 'GOL' ? 0 : (p.traits.includes('F') ? 6 : 0) + (p.pos === 'MEI' ? 1.5 : 0.6); };
  else if (type === 'penalti') return bestPlayer(run, st, p => p.pos !== 'GOL');
  else wf = i => { const p = run.players[i]; return p.pos === 'ATA' ? 4 + effRating(run, i, st) / 40 : p.pos === 'MEI' ? 1.6 : p.pos === 'ZAG' ? 0.3 : 0; };
  return r.weighted(idxs, wf);
}
function pickCrosser(m) {
  const run = m.run;
  const idxs = run.players.map((_, i) => i).filter(i => run.players[i].pos !== 'GOL');
  return m.rng.weighted(idxs, i => (run.players[i].traits.includes('X') ? 5 : 1));
}
function oppScorer(m) { return m.rng.weighted(m.opp.scorers.map((n, i) => i), i => m.opp.scorerW[i] || 1); }
function oppScorerRating(m, i) {
  const l = m.base[1];
  if (m.opp.boss && i === 0) return 95;
  return l.atk + (i === 0 ? 4 : i === 1 ? 1 : -3);
}
function crossBonus(m) { return m.run.players.filter(p => p.traits.includes('X')).length; }

const BALL = {
  me: () => [0, 0], // placeholder
};

function fmt(arr, r) { return r.pick(arr); }
const T = {
  jogada: ['{p} recebe na entrada da área, gira e bate...', '{p} tabela e invade a área...', 'Contra-ataque rápido! {p} sai na cara do goleiro...', '{p} dribla um, dribla dois e finaliza...'],
  jogadaOpp: ['{p} escapa pela ponta e chuta cruzado...', '{p} recebe livre na área...', 'Contra-ataque rival! {p} sai na frente...', '{p} faz fila e bate...'],
  cruz: ['{c} cruza na área, {p} sobe mais que todo mundo...', '{c} levanta na segunda trave, {p} cabeceia...', 'Cruzamento de {c}! {p} testa firme...'],
  cruzOpp: ['Cruzamento rival na área, {p} sobe de cabeça...', '{p} cabeceia após cruzamento na área...'],
  fora: ['{p} arrisca de fora da área...', '{p} solta a bomba de longe...', 'Sobra pra {p}, de primeira, de fora da área...'],
  foraOpp: ['{p} arrisca de longe...', 'Bomba de {p} de fora da área...'],
  escanteio: ['Escanteio! {c} cobra na área, {p} sobe...', 'Escanteio fechado, {p} se antecipa de cabeça...'],
  escanteioCurto: ['Escanteio... cobrado curtinho, a zaga afasta.', 'Escanteio na primeira trave, a zaga tira de cabeça.'],
  falta: ['Falta perigosa. {p} ajeita a bola... bateu!', 'Falta na meia-lua. {p} vai pra cobrança...'],
  penalti: ['PÊNALTI! Derrubaram o atacante na área! {p} vai pra bola...'],
  gkUp: ['O goleiro {p} subiu pra área no escanteio! Cabeceia...', 'Olha o goleiro {p} na área adversária! Testa...'],
  gkFalta: ['O goleiro {p} atravessa o campo pra bater a falta!', 'Quem vai cobrar? O GOLEIRO {p}! Bateu...'],
  gkLonge: ['O goleiro {p} sai jogando, passa do meio e arrisca!'],
  save: ['Defesaça de {g}!', '{g} voa e espalma!', 'Que milagre de {g}!'],
  miss: ['Pra fora, raspando.', 'Por cima do travessão.', 'A zaga bloqueia.', 'Fraquinho, nas mãos de {g}.'],
  post: ['NA TRAVE!', 'Explodiu no travessão!']
};

function tpl(s, o) { return s.replace(/\{(\w)\}/g, (_, k) => o[k] != null ? o[k] : ''); }

function ballFor(side, kind) {
  // posição da bola em % (x, y) no campinho; time 0 ataca para a direita
  // na final ao vivo o RNG da partida entra no lugar de Math.random, pra os dois celulares baterem
  const rnd = ballFor.rng || Math.random;
  const gx = side === 0 ? 90 : 10;
  const y = kind === 'goal' ? 50 : 30 + rnd() * 40;
  return [kind === 'goal' ? (side === 0 ? 99 : 1) : gx + (side === 0 ? -1 : 1) * rnd() * 8, y];
}

function stepMatch(m) {
  if (m.done || m.awaiting) return [];
  const ev = [];
  const r = m.rng, run = m.run, f = m.fx;
  m.minute++;
  const min = m.minute;
  if (min === 1) ev.push({ min, kind: 'info', text: `Rola a bola! ${SELECOES[run.selecao].curto} x ${m.opp.nome}.` });
  if (min === 46) ev.push({ min, kind: 'half', text: 'Intervalo rápido... começa o segundo tempo!' });
  ev.push(...pressaoDrop(m, f, run, min, ''));
  if (f.casinhaUntil === min) ev.push({ min, kind: 'info', text: 'O time destranca a casinha e volta a jogar.' });
  if (m.pvp) ev.push(...pressaoDrop(m, m.fxAway, m.away, min, SELECOES[m.away.selecao].curto + ': '));
  else if (m.fxOpp) ev.push(...pressaoDrop(m, m.fxOpp, null, min, 'Rival: '));

  // eventos roteirizados
  if (m.pvp && min === m.juizMinAway && min !== m.juizMin) {
    const mine = r.chance(0.4);
    ev.push({ min, kind: 'info', side: mine ? 1 : 0, text: `🃏 Juiz Ladrão de ${SELECOES[m.away.selecao].curto}! Pênalti do nada${mine ? ' a favor deles!' : ' contra eles!'}` });
    resolveLance(m, mine ? 1 : 0, 'penalti', ev, { juiz: true });
  } else if (min === m.juizMin) {
    const mine = r.chance(0.6);
    ev.push({ min, kind: 'info', side: mine ? 0 : 1, text: `🃏 Juiz Ladrão! O árbitro aponta a marca do pênalti do nada${mine ? ', pra você!' : '... pro rival!'}` });
    resolveLance(m, mine ? 0 : 1, 'penalti', ev, { juiz: true });
  } else if (min === m.maoMin && !m.maoDone) {
    m.maoDone = true;
    m.score[1] += 1;
    const g = { min, side: 1, scorer: 'Maradona', type: 'mao', value: 1 };
    m.goals.push(g); if (m.score[0] < m.score[1]) m.trailed = true;
    ev.push({ min, kind: 'goal', side: 1, big: true, gtype: 'mao', value: 1, scorer: 'Maradona',
      text: 'Maradona sobe com o goleiro e... A BOLA ENTRA! Foi com a mão!', sub: '✋ A MÃO DIVINA! O juiz valida o gol irregular.', ball: [1, 50] });
  } else {
    let forced = f.craque || f.peixinho;
    let lam = 15 / 90;
    if (has(run, 'bola_quadrada')) lam *= 0.85;
    if (min <= f.pressaoUntil || min <= f.chuvaUntil || min <= f.longeUntil) lam *= 1.3;
    if (forced || r.chance(lam)) {
      let side, posse = false;
      if (forced) side = 0;
      else {
        const a = lines(m, 0), b = lines(m, 1);
        let p = 0.5 + (a.mid - b.mid) * 0.012;
        if (min <= f.pressaoUntil) p += f.pressaoAdd || 0.14;
        if (min <= f.casinhaUntil) p -= 0.08;
        if (min <= f.contraUntil) p -= 0.10;
        if (min <= f.toqueUntil) p += f.toqueAdd || 0.10;
        if (min <= f.chuvaUntil || min <= f.longeUntil) p += 0.06;
        if (m.opp.rule === 'posse') p -= 0.06;
        if (m.opp.rule === 'pressao' && min <= 20) p -= 0.12;
        const p0 = clamp(p, 0.2, 0.82);
        p = clamp(p + CK.mei * cs(run, 'mei'), 0.2, 0.86);
        const oppF = m.pvp ? m.fxAway : m.fxOpp;
        if (oppF) {
          if (min <= oppF.pressaoUntil) p -= oppF.pressaoAdd || 0.14;
          if (min <= oppF.casinhaUntil) p += 0.06;
          if (min <= oppF.contraUntil) p += 0.08;
          if (min <= oppF.toqueUntil) p -= oppF.toqueAdd || 0.08;
          if (m.pvp) p = clamp(p - CK.mei * cs(m.away, 'mei'), 0.14, 0.86);
        }
        const xs = r.next();
        side = xs < p ? 0 : 1;
        if (side === 0 && xs >= p0) posse = true;
      }
      resolveLance(m, side, null, ev, { posse });
    }
  }

  if (!m.motShown && cs(run, 'mot') > 0 && m.score[0] < m.score[1] && min < 90) {
    m.motShown = true; m.stats.coach.mot++;
    ev.push({ min, kind: 'coach', attr: 'mot', text: `🔥 ${run.coach.nome} (garra de ${csrc(run, 'mot')}) incendeia o banco: +${n1(CK.motLose * cs(run, 'mot'))} de força enquanto estiver perdendo!` });
  }
  if (m.pvp && !m.motShownAway && cs(m.away, 'mot') > 0 && m.score[1] < m.score[0] && min < 90) {
    m.motShownAway = true; m.stats.coachAway.mot++;
    ev.push({ min, kind: 'coach', attr: 'mot', text: `🔥 ${m.away.coach.nome} incendeia o banco de ${SELECOES[m.away.selecao].curto} enquanto estiver perdendo!` });
  }
  if (m.pauses.indexOf(min) >= 0 && min < 90) {
    if (m.pvp) {
      const a = playableCards(m).length > 0, b = awayPlayable(m).length > 0;
      if (a || b) {
        m.awaiting = true; m.awaitingSides = [a, b]; m.lastPauseMin = min;
        ev.push({ min, kind: 'decision', sides: [a, b], text: 'Momento decisivo! Os dois técnicos podem usar uma carta.' });
      }
    } else if (playableCards(m).length > 0) {
      m.awaiting = true; m.lastPauseMin = min;
      ev.push({ min, kind: 'decision', text: 'Momento decisivo! Gaste energia numa carta ou guarde.' });
    } else ev.push(...cpuTurn(m));
  }
  if (min >= 90) {
    m.done = true;
    ev.push({ min: 90, kind: 'end', text: `Fim de jogo! ${m.score[0]} x ${m.score[1]}` });
  }
  return ev;
}

function chooseType(m, side) {
  const r = m.rng, run = m.run, f = m.fx, min = m.minute;
  if (side === 0 && f.peixinho) return 'cruz';
  if (side === 0 && f.craque) return 'jogada';
  const w = { jogada: 46, cruz: 16, fora: 14, escanteio: 12, falta: 6, penalti: 2.5 };
  if (side === 0) {
    w.cruz += crossBonus(m) * 4;
    if (min <= f.chuvaUntil) {
      if ((f.chuvaBonus || 0) < 2) { f.chuvaBonus = (f.chuvaBonus || 0) + 1; w.cruz += 400; }
      w.escanteio += 10;
    }
    if (min <= f.longeUntil) w.fora += 70;
    const bp = cs(run, 'bol'); w.escanteio += 0.6 * bp; w.falta += 0.4 * bp;
    if (has(run, 'escanteio_nunca')) w.escanteio *= 1.5;
  }
  const fxA = side === 0 ? null : (m.pvp ? m.fxAway : m.fxOpp);
  if (fxA && min <= fxA.chuvaUntil && (fxA.chuvaBonus || 0) < 2) { fxA.chuvaBonus = (fxA.chuvaBonus || 0) + 1; w.cruz += 400; }
  if (has(run, 'bola_quadrada')) { w.fora += 12; w.jogada -= 10; }
  if (m.weather === 'chuva') w.escanteio += 3;
  if (side === 1 && m.opp.rule === 'fora') w.fora += 10;
  const keys = Object.keys(w);
  return r.weighted(keys, k => w[k]);
}

function resolveLance(m, side, forcedType, ev, opts) {
  ballFor.rng = m.pvp ? () => m.rng.next() : null;
  const r = m.rng, run = m.run, f = m.fx, min = m.minute, st = m.stage;
  const type = forcedType || chooseType(m, side);
  const A = lines(m, side), D = lines(m, 1 - side);
  const teamName = side === 0 ? SELECOES[run.selecao].curto : m.opp.nome;
  const gkName = side === 0 ? m.opp.gk : run.players.find(p => p.pos === 'GOL').nome;
  m.stats.lances[side]++;
  let byCard = null;
  let q, scorerName, scorerRating, gtype = type, text, crossName = '', isGK = false, qNo = -1, atkB = 0, bolB = 0;
  const tagsHeader = [];

  if (side === 0) {
    let si;
    const gkI = run.players.findIndex(p => p.pos === 'GOL');
    if (f.craque) { si = bestPlayer(run, st, p => p.pos !== 'GOL'); byCard = 'craque'; f.craque = false; }
    else if (f.peixinho) { si = pickMyScorer(m, 'cabeca'); byCard = 'peixinho'; f.peixinho = false; }
    else if (type === 'escanteio' && has(run, 'luva_ofensiva') && r.chance(0.3)) { si = gkI; isGK = true; }
    else if (type === 'falta' && has(run, 'luva_ofensiva') && r.chance(0.35)) { si = gkI; isGK = true; }
    else if (type === 'fora' && has(run, 'luva_ofensiva') && r.chance(0.12)) { si = gkI; isGK = true; }
    else if (type === 'cruz' || type === 'escanteio') si = pickMyScorer(m, 'cabeca');
    else si = pickMyScorer(m, type);
    scorerName = run.players[si].nome; scorerRating = effRating(run, si, st);
    if (isGK) scorerRating = Math.max(scorerRating, 70);
    if (type === 'cruz' || type === 'escanteio') crossName = run.players[pickCrosser(m)].nome;
    if (crossName === scorerName) crossName = 'o lateral';
  } else {
    const oi = oppScorer(m);
    scorerName = m.opp.scorers[oi]; scorerRating = oppScorerRating(m, oi);
    crossName = 'o ponta';
  }

  const o = { p: scorerName, c: crossName, t: teamName, g: gkName };
  // base de qualidade por tipo
  if (type === 'jogada') { q = 0.28; text = tpl(r.pick(side === 0 ? T.jogada : T.jogadaOpp), o); gtype = 'normal'; if (byCard === 'craque') { q = f.craqueQ || 0.55; text = `⭐ Craque decide! ${scorerName} pega a bola e parte pra cima...`; } }
  else if (type === 'cruz') { q = 0.22 + (side === 0 ? crossBonus(m) * 0.02 : 0); gtype = 'cabeca'; text = tpl(r.pick(side === 0 ? T.cruz : T.cruzOpp), o);
    if (side === 0 && min <= f.chuvaUntil) { q *= 1 + (f.chuvaHead || 0.20); byCard = byCard || 'chuveirinho'; }
    if (byCard === 'peixinho') { q += f.peixinhoQ || 0.28; text = `🐟 PEIXINHO! ${crossName} cruza rasteiro e ${scorerName} se atira de cabeça...`; } }
  else if (type === 'fora') { q = 0.12; gtype = 'fora'; text = tpl(r.pick(side === 0 ? T.fora : T.foraOpp), o);
    if (side === 0 && min <= f.longeUntil) { q *= 1 + (f.longeQ || 0.22); byCard = 'longe'; }
    if (side === 0 && run.selecao === 'bra82') q *= 1.4;
    if (isGK) text = tpl(r.pick(T.gkLonge), o); }
  else if (type === 'escanteio') {
    const ecn = side === 0 && has(run, 'escanteio_nunca');
    if (!ecn && !isGK && r.chance(side === 0 ? 0.45 - 0.02 * cs(run, 'bol') : 0.45)) { ev.push({ min, kind: 'lance', side, scorer: scorerName, text: r.pick(T.escanteioCurto), ball: ballFor(side) }); return; }
    q = ecn ? 0.25 : 0.17; gtype = 'cabeca';
    if (side === 0 && min <= f.chuvaUntil) { q *= 1 + (f.chuvaHead || 0.12); byCard = byCard || 'chuveirinho'; }
    if (side === 0 && min <= f.bolaUntil) q *= 1 + (f.bolaQ || 0.22);
    text = isGK ? tpl(r.pick(T.gkUp), o) : tpl(r.pick(T.escanteio), o);
    if (ecn && !isGK) text = '🚩 Escanteio Curto Nunca! ' + text;
  }
  else if (type === 'falta') { q = 0.13; gtype = 'fora'; text = isGK ? tpl(r.pick(T.gkFalta), o) : tpl(r.pick(T.falta), o); if (side === 0 && run.selecao === 'bra82') q *= 1.4; if (side === 0 && min <= f.bolaUntil) q *= 1 + (f.bolaQ || 0.22); }
  else if (type === 'penalti') { q = 0.74; gtype = 'penalti'; text = opts.juiz ? `${scorerName} vai pra cobrança...` : tpl(T.penalti[0], o); }

  if (type !== 'penalti') {
    q += (A.atk - D.def) * 0.007 + (scorerRating - A.atk) * 0.003 - (D.gk - 65) * 0.003;
    const wq = { chuva: (type === 'fora' || type === 'falta') ? 0.85 : 1, neblina: (type === 'cruz' || type === 'escanteio') ? 0.9 : 1, altitude: type === 'fora' ? 1.12 : 1 }[m.weather] || 1;
    q *= wq;
    if (side === 1 && m.opp.rule === 'fora' && (type === 'fora' || type === 'falta')) q *= 1.35;
    if (side === 0 && m.opp.rule === 'muralha') q *= 0.9;
    if (side === 1 && min <= f.casinhaUntil) q *= 1 - (f.casinhaThem || 0.28);
    if (side === 0 && min <= f.casinhaUntil) q *= 1 - (f.casinhaYou || 0.16);
    if (side === 0 && min <= f.gritoUntil) q *= 1 + (f.gritoQ || 0);
    if (side === 0 && min <= f.golpeUntil) q *= 1.10;
    if (side === 0 && min <= f.toqueUntil) q *= 0.95;
    if (side === 0 && min <= f.contraUntil && (type === 'jogada' || type === 'fora')) q *= 1 + (f.contraQ || 0.28);
    if (side === 0 && (gtype === 'cabeca' || type === 'cruz' || type === 'escanteio') && f.aereo) q *= 1.10;
    if (side === 1 && min <= f.linhaUntil) q *= 1 - (f.linhaCut || 0.18);
    if (side === 1 && min <= f.paredaoUntil && type !== 'penalti') q *= 1 - (f.paredaoCut || 0.30);
    qNo = clamp(q, 0.03, 0.8);
    if (side === 0) {
      atkB = CK.atk * cs(run, 'atk');
      bolB = (type === 'escanteio' || type === 'falta' || type === 'cruz') ? CK.bol * cs(run, 'bol') : 0;
      q = clamp(q + atkB + bolB, 0.03, 0.8);
      if (m.pvp) q = clamp(q * (1 - CK.def * cs(m.away, 'def')), 0.03, 0.8);
      const oppF = m.pvp ? m.fxAway : m.fxOpp;
      if (oppF && min <= oppF.casinhaUntil) q *= 1 - (oppF.casinhaThem || 0.28);
      if (oppF && min <= oppF.linhaUntil) q *= 1 - (oppF.linhaCut || 0.18);
      if (oppF && min <= oppF.paredaoUntil && type !== 'penalti') q *= 1 - (oppF.paredaoCut || 0.30);
    } else {
      q = clamp(q * (1 - CK.def * cs(run, 'def')), 0.03, 0.8);
      if (!m.pvp && m.fxOpp) {
        const fo = m.fxOpp;
        if (fo.craque && (type === 'jogada' || forcedType === 'jogada')) { q = fo.craqueQ || 0.55; fo.craque = false; }
        if (min <= fo.casinhaUntil) q *= 1 - (fo.casinhaYou || 0.16);
        if (min <= fo.gritoUntil) q *= 1 + (fo.gritoQ || 0);
        if (min <= fo.golpeUntil) q *= 1.10;
        if (min <= fo.toqueUntil) q *= 0.95;
        if (min <= fo.contraUntil && (type === 'jogada' || type === 'fora')) q *= 1 + (fo.contraQ || 0.28);
      }
      if (m.pvp) {
        const ar = m.away;
        q = clamp(q + CK.atk * cs(ar, 'atk') + ((type === 'escanteio' || type === 'falta' || type === 'cruz') ? CK.bol * cs(ar, 'bol') : 0), 0.03, 0.8);
        if (m.fxAway.craque && (type === 'jogada' || forcedType === 'jogada')) { q = m.fxAway.craqueQ || 0.55; m.fxAway.craque = false; }
        if (min <= m.fxAway.casinhaUntil) q *= 1 - (m.fxAway.casinhaYou || 0.16);
        if (min <= m.fxAway.gritoUntil) q *= 1 + (m.fxAway.gritoQ || 0);
        if (min <= m.fxAway.golpeUntil) q *= 1.10;
        if (min <= m.fxAway.toqueUntil) q *= 0.95;
        if (min <= m.fxAway.contraUntil && (type === 'jogada' || type === 'fora')) q *= 1 + (m.fxAway.contraQ || 0.28);
        if (min <= f.linhaUntil) q *= 1 - (f.linhaCut || 0.18);
        if (min <= f.paredaoUntil && type !== 'penalti') q *= 1 - (f.paredaoCut || 0.30);
      }
    }
  } else {
    q = clamp(q + (scorerRating - D.gk) * 0.004, 0.55, 0.93);
    const wall = side === 1 ? f : (m.pvp ? m.fxAway : m.fxOpp);
    if (wall && min <= wall.paredaoUntil && wall.penSave) q = Math.min(q, 1 - wall.penSave);
  }
  m.stats.shots[side]++;

  // Paredão (carta). Na final ao vivo cada lado fecha o próprio gol.
  if (m.pvp && side === 0 && m.fxAway.paredao) {
    m.fxAway.paredao = false;
    m.stats.bigSaves[1]++;
    ev.push({ min, kind: 'lance', side, scorer: scorerName, text: text + ' 🛡️ PAREDÃO de ' + SELECOES[m.away.selecao].curto + '! ' + m.opp.gk + ' fecha o gol!', ball: ballFor(side), hl: true });
    return;
  }
  if (side === 1 && f.paredao) {
    f.paredao = false;
    m.stats.bigSaves[0]++;
    ev.push({ min, kind: 'lance', side, scorer: scorerName, text: text + ' 🛡️ PAREDÃO! ' + gkName + ' fecha o gol, como prometido!', ball: ballFor(side), hl: true });
    paredaoFala(m, ev);
    return;
  }
  if (opts.posse) { m.stats.coach.mei++; text = `🎯 Posse no estilo ${csrc(run, 'mei')}: o time roda a bola e chega. ` + text; }
  let x = r.next();
  if (side === 0 && m.debugGoal) { m.debugGoal = false; x = 0; }
  let goal = x < q, post = false;
  let coachAttr = null;
  if (side === 0 && goal && qNo >= 0 && x >= qNo) coachAttr = (bolB > 0 && x >= qNo + atkB) || atkB === 0 ? 'bol' : 'atk';
  if (side === 1 && !goal && qNo >= 0 && x < qNo) {
    m.stats.coach.def++;
    ev.push({ min, kind: 'lance', side, scorer: scorerName, coach: 'def', text: text + ` 🛡️ Defesa armada no estilo ${csrc(run, 'def')}: chute travado na hora H!`, ball: ballFor(side), hl: true });
    return;
  }
  if (!goal && x < q + 0.07 && type !== 'penalti') post = true;
  if (post) {
    m.stats.posts[side]++;
    if (side === 0 && has(run, 'pe_coelho') && !m.peCoelhoUsed) {
      m.peCoelhoUsed = true; goal = true;
      text += ' NA TRAVE... e ENTRA! 🐰 Pé de Coelho!';
    } else {
      ev.push({ min, kind: 'lance', side, scorer: scorerName, text: text + ' ' + r.pick(T.post), ball: ballFor(side), hl: true });
      return;
    }
  }
  if (goal) {
    let value = 1; const notes = [];
    if (isGK) gtype = gtype === 'cabeca' ? 'goleiro_cabeca' : 'goleiro';
    const header = gtype === 'cabeca' || gtype === 'goleiro_cabeca';
    const longShot = type === 'fora' || type === 'falta';
    if (side === 0 && header && has(run, 'cabeca_ouro')) { value = 2; notes.push('Vale 2 pela Cabeça de Ouro 👑'); addExtra(m, 'cabeca_ouro', 1); }
    if (longShot && has(run, 'bola_quadrada')) { value = Math.max(value, 2); notes.push('Gol de fora vale 2 pela Bola Quadrada 🟧'); if (side === 0) addExtra(m, 'bola_quadrada', 1); }
    if (isGK) notes.unshift('GOL DO GOLEIRO! 🧤 Luva Ofensiva');
    if (coachAttr && !(post)) { m.stats.coach[coachAttr]++; notes.push(coachAttr === 'atk' ? `⚔️ Ataque treinado no estilo ${csrc(run, 'atk')}` : `🚩 Bola parada ensaiada por ${csrc(run, 'bol')}`); }
    m.score[side] += value;
    const g = { min, side, scorer: scorerName, type: gtype, value, card: side === 0 ? byCard : null };
    m.goals.push(g);
    if (side === 0 && byCard) m.stats.cardGoals.push({ card: byCard, scorer: scorerName });
    const label = { normal: 'GOOOL!', cabeca: 'GOL DE CABEÇA!', fora: type === 'falta' ? 'GOL DE FALTA!' : 'GOLAÇO DE FORA DA ÁREA!', penalti: 'GOL DE PÊNALTI!', goleiro: 'GOL DO GOLEIRO!', goleiro_cabeca: 'GOL DE CABEÇA DO GOLEIRO!' }[gtype] || 'GOOOL!';
    let epic = null, etext = null;
    if (side === 0) {
      const before = [m.score[0] - value, m.score[1]];
      m.myGoalsBy[scorerName] = (m.myGoalsBy[scorerName] || 0) + 1;
      const er = m.erng.next();
      let id = null;
      if (isGK) id = 'goleiro';
      else if (value === 1 && type === 'escanteio' && er < EPIC_RATE.olimpico) id = 'olimpico';
      else if (value === 1 && type === 'cruz' && byCard !== 'peixinho' && er < EPIC_RATE.bicicleta) id = 'bicicleta';
      else if (m.myGoalsBy[scorerName] === 3 && m.erng.next() < EPIC_RATE.hattrick) id = 'hattrick';
      else if (min >= 85 && m.trailed && before[0] <= before[1] && m.score[0] > m.score[1]) id = 'virada';
      else if (type === 'fora' && er < EPIC_RATE.golaco) id = 'golaco';
      else if (type === 'jogada' && er < EPIC_RATE.cobertura) id = 'cobertura';
      else if (type === 'jogada' && er < EPIC_RATE.cobertura + EPIC_RATE.calcanhar) id = 'calcanhar';
      else if (!m.placaDone && m.score[0] >= 5 && m.score[0] - m.score[1] >= 4) { m.placaDone = true; if (m.erng.next() < 0.2) id = 'placa'; }
      if (m.forceEpic && m.forceEpic !== 'penalti') { id = m.forceEpic; m.forceEpic = null; if (id === 'goleiro' && !isGK) { scorerName = m.run.players.find(p => p.pos === 'GOL').nome; g.scorer = scorerName; } }
      if (id === 'goleiro') etext = `${scorerName} sai do gol, avança e solta a bomba lá do campo de defesa...`;
      if (id === 'placa') m.placaDone = true;
      if (id === 'olimpico') { scorerName = crossName && crossName !== 'o lateral' ? crossName : scorerName; g.scorer = scorerName; etext = `${scorerName} vai pro escanteio... bateu fechado, com efeito...`; }
      else if (id === 'bicicleta') etext = `${crossName || 'O lateral'} levanta na área, ${scorerName} está de costas pro gol... se atira no ar...`;
      else if (id === 'golaco') etext = `A bola sobra pra ${scorerName} fora da área... pegou de primeira, sem-pulo...`;
      else if (id === 'cobertura') etext = `${scorerName} recebe na intermediária, o goleiro ${gkName} está adiantado...`;
      else if (id === 'calcanhar') etext = `${scorerName} recebe de costas na pequena área... e tenta de calcanhar...`;
      if (id) { epic = epicEv(m, id, { g: gkName.toUpperCase(), scorer: scorerName, n: m.score[0] }); g.epic = id; }
    } else if (m.score[0] < m.score[1]) m.trailed = true;
    const txt = (etext || text) + ` ${side === 0 ? label : 'Gol deles (' + m.opp.nome.replace(/ \d{4}$/, '') + ').'} ${scorerName}!`;
    ev.push({ min, kind: 'goal', side, big: true, gtype, value, scorer: scorerName, text: epic ? (etext || text) + ' ' + epic.frase : txt, sub: notes.join(' · '), label: epic ? epic.nome.toUpperCase() + '!' : label, ball: [side === 0 ? 99 : 1, 50], epic });
    return;
  }
  // defesa ou pra fora
  if (x < q + 0.07 + 0.3) {
    m.stats.bigSaves[1 - side]++;
    let e = null;
    if (side === 1 && type === 'penalti' && m.erng.next() < EPIC_RATE.penalti) e = epicEv(m, 'penalti', { g: gkName.toUpperCase(), scorer: gkName });
    else if (side === 1 && m.forceEpic === 'penalti') { m.forceEpic = null; e = epicEv(m, 'penalti', { g: gkName.toUpperCase(), scorer: gkName }); }
    ev.push({ min, kind: 'lance', side, scorer: scorerName, text: text + ' ' + tpl(r.pick(T.save), o), ball: ballFor(side), hl: !!e, epic: e });
    if (side === 1) paredaoFala(m, ev);
  } else {
    if (type === 'penalti' && side === 1 && m.erng.next() < EPIC_RATE.penalti) { const e = epicEv(m, 'penalti', { g: gkName.toUpperCase(), scorer: gkName }); ev.push({ min, kind: 'lance', side, scorer: scorerName, text: text + ' ' + `PERDEU! ${gkName} pega o pênalti!`, ball: ballFor(side), hl: true, epic: e }); }
    else if (type === 'penalti') ev.push({ min, kind: 'lance', side, scorer: scorerName, text: text + ' ' + `PERDEU! ${gkName} pega o pênalti!`, ball: ballFor(side), hl: true });
    else ev.push({ min, kind: 'lance', side, scorer: scorerName, text: text + ' ' + tpl(r.pick(T.miss), o), ball: ballFor(side) });
  }
}
function epicEv(m, id, o) {
  const E0 = EPICS[id];
  const fr = tpl(E0.frase[Math.floor(m.erng.next() * E0.frase.length)], o || {});
  const e = { id, nome: E0.nome, icon: E0.icon, frase: fr, min: m.minute, scorer: (o && o.scorer) || '', stage: m.stage, opp: m.opp.nome, oppFlag: m.opp.flag, score: m.score.slice() };
  m.epics.push(e);
  return e;
}
function addExtra(m, id, n) { m.stats.relicExtra[id] = (m.stats.relicExtra[id] || 0) + n; }
function paredaoFala(m, ev) {
  if (!has(m.run, 'paredao_fala')) return;
  m.fx.paredaoMult *= 1.05;
  addExtra(m, 'paredao_fala', 1);
  ev.push({ min: m.minute, kind: 'info', text: `🧱 Paredão que Fala! O goleiro grita com a zaga: time +5% de força (agora +${Math.round((m.fx.paredaoMult - 1) * 100)}%).` });
}

function playableCards(m) {
  const left = m.nrgLeft == null ? 99 : m.nrgLeft;
  return (m.run.cards || []).filter(c => m.used.indexOf(c) < 0 && CARDS[c] && CARDS[c].cost <= left);
}
function pressaoDrop(m, f, run, min, prefix) {
  if (!f || f.pressaoUntil !== min) return [];
  if (f.blitz || (run && run.selecao === 'hol74') || !f.pressaoFadiga) {
    const livre = run && run.selecao === 'hol74';
    return [{ min, kind: 'info', text: (prefix || '') + (livre ? 'Futebol Total: a Pressão Alta acaba, mas ninguém cansou.' : 'A Pressão Alta acaba sem cansaço.') }];
  }
  const extra = m.weather === 'calor' ? 0.04 : 0;
  f.fadigaPct = Math.min(0.24, f.pressaoFadiga + extra);
  f.fadigaUntil = min + 10;
  return [{ min, kind: 'info', text: `${prefix || ''}Acabou o gás da Pressão Alta: −${pct(f.fadigaPct)} de força por 10 min${m.weather === 'calor' ? ' com esse calor' : ''}.` }];
}
function stampEffect(f, id, n, min, mins, run) {
  if (id === 'pressao') {
    const base = (run && run.selecao === 'hol74' ? n.mins * 2 : n.mins);
    f.pressaoUntil = min + minsOf(base, run);
    f.pressaoAdd = 0.5 * n.roubo;
    f.pressaoFadiga = run && run.selecao === 'hol74' ? 0 : n.fadiga;
  } else if (id === 'casinha') { f.casinhaUntil = 200; f.casinhaThem = n.them; f.casinhaYou = n.you; }
  else if (id === 'contra') { f.contraUntil = min + minsOf(n.mins, run); f.contraQ = n.q; }
  else if (id === 'chuveirinho') { f.chuvaUntil = min + minsOf(n.mins, run); f.chuvaHead = n.head; f.chuvaBonus = 0; }
  else if (id === 'craque') { f.craque = true; f.craqueQ = n.q; }
  else if (id === 'paredao') { f.paredaoUntil = min + minsOf(n.mins, run); f.paredaoCut = n.save; f.penSave = n.pen; }
  else if (id === 'submagica') { f.sub += n.add + (run ? CK.estSub * cs(run, 'est') : 0); f.fadigaPct = 0; f.fadigaUntil = -1; f.fatigue = 0; }
  else if (id === 'catimba') f.catimba = true;
  else if (id === 'longe') { f.longeUntil = min + minsOf(n.mins, run); f.longeQ = n.q; }
  else if (id === 'peixinho') { f.peixinho = true; f.peixinhoQ = n.q; }
  else if (id === 'toque') { f.toqueUntil = min + minsOf(n.mins, run); f.toqueAdd = 0.5 * n.posse; }
  else if (id === 'bolaparada') { f.bolaUntil = min + minsOf(n.mins, run); f.bolaQ = n.q; }
  else if (id === 'linha') { f.linhaUntil = min + minsOf(n.mins, run); f.linhaCut = n.cut; }
  else if (id === 'grito') { f.gritoUntil = min + minsOf(n.mins, run); f.gritoQ = n.q; }
  const c = CARDS[id];
  if (c.style) { f.style = c.style; f.styleUntil = min + (c.dur === 'uso único' ? 12 : (c.dur === 'até o fim' ? 80 : (n.mins || 15))); f.styleCard = id; }
}
function minsOf(base, run) { return base + (run ? Math.round(CK.estMin * cs(run, 'est')) : 0); }
function fxBag(m, side) { return side === 0 ? m.fx : (m.pvp ? m.fxAway : m.fxOpp); }
function sideRun(m, side) { return side === 0 ? m.run : (m.pvp ? m.away : null); }
function usedBag(m, side) { return side === 0 ? m.used : (m.pvp ? m.usedAway : m.cpuUsed); }
function nrgLeftOf(m, side) { return side === 0 ? m.nrgLeft : (m.pvp ? m.nrgAway : m.cpuNrg); }
function spendNrg(m, side, cost) {
  if (side === 0) m.nrgLeft -= cost;
  else if (m.pvp) m.nrgAway -= cost;
  else m.cpuNrg -= cost;
}
function castCard(m, side, id) {
  const ev = [];
  const min = m.minute;
  const c = CARDS[id];
  const run = sideRun(m, side);
  const bag = usedBag(m, side);
  const opp = fxBag(m, side === 0 ? 1 : 0);
  if (!c || bag.indexOf(id) >= 0 || nrgLeftOf(m, side) < c.cost) return ev;
  if (opp && opp.catimba) {
    opp.catimba = false;
    ev.push({ min, kind: 'info', side, text: `🎭 Catimba! A carta ${c.nome} do ${side === 0 ? 'seu time' : 'adversário'} foi anulada.` });
    bag.push(id); spendNrg(m, side, c.cost);
    return ev;
  }
  bag.push(id); spendNrg(m, side, c.cost);
  if (run) { run.cardLog = run.cardLog || {}; run.cardLog[id] = (run.cardLog[id] || 0) + 1; }
  const lv = run ? cardLevel(run, id) : 1;
  const n = c.lv[lv - 1];
  const f = fxBag(m, side);
  stampEffect(f, id, n, min, 0, run);
  if (run && cs(run, 'est') > 0 && id !== 'catimba') {
    if (side === 0) m.stats.coach.est++; else if (m.stats.coachAway) m.stats.coachAway.est++;
  }
  let who = 'Você';
  if (side === 1 && m.pvp) who = SELECOES[m.away.selecao].curto;
  else if (side === 1) who = 'Rival';
  else if (m.pvp) who = SELECOES[m.run.selecao].curto;
  let extra = '';
  if (id === 'craque' && run) { const bi = bestPlayer(run, m.stage, p => p.pos !== 'GOL'); extra = ` A bola vai pro ${run.players[bi].nome}.`; }
  if (id === 'submagica' && run) { const res = SELECOES[run.selecao].reservas; extra = ` Entra ${res[(bag.length + m.stage) % res.length]}.`; }
  if (id === 'paredao') extra = ' 🛡️ PAREDÃO!';
  ev.push({ min, kind: 'card', card: id, side: side === 0 ? 0 : 1, text: `${c.icon} ${who}: ${c.nome} (Nv${lv}, ${c.cost} energia). ${cardText(id, lv)}${extra}` });
  ev.push(...counterCheck(m, side, c));
  ev.push(...comboCheck(m, side));
  return ev;
}
function counterCheck(m, side, card) {
  if (!card.style) return [];
  const opp = fxBag(m, side === 0 ? 1 : 0);
  if (!opp || !opp.style || m.minute > opp.styleUntil || BEATS[card.style] !== opp.style) return [];
  const f = fxBag(m, side);
  f.golpeUntil = m.minute + 10;
  return [{ min: m.minute, kind: 'counter', side: side === 0 ? 0 : 1, text: `CONTRA-GOLPE! ${card.nome} quebra ${STYLE_NAME[opp.style]} e ganha +10% de chance de gol por 10 min.` }];
}
function comboCheck(m, side) {
  const run = sideRun(m, side);
  const bag = usedBag(m, side);
  const fired = side === 0 ? m.combos : (m.pvp ? m.combosAway : (m.cpuCombos = m.cpuCombos || []));
  const ev = [];
  COMBOS.forEach(c => {
    if (fired.indexOf(c.id) >= 0) return;
    if (c.relic && !(run && has(run, c.relic))) return;
    if (!c.cards.every(id => bag.indexOf(id) >= 0)) return;
    fired.push(c.id);
    const f = fxBag(m, side);
    if (c.id === 'blitz') { f.blitz = true; f.fadigaPct = 0; f.fadigaUntil = -1; f.fatigue = 0; f.pressaoFadiga = 0; }
    if (c.id === 'aereo') f.aereo = true;
    if (c.id === 'muralha') { f.paredaoUntil += 8; f.casinhaThem = Math.min(0.5, (f.casinhaThem || 0.28) + 0.06); }
    if (c.id === 'armadilha') f.contraQ = (f.contraQ || 0.28) + 0.10;
    if (c.id === 'ensaio') f.peixinhoQ = (f.peixinhoQ || 0.28) + 0.08;
    if (c.id === 'estrela') f.craqueQ = (f.craqueQ || 0.55) + 0.05;
    ev.push({ min: m.minute, kind: 'combo', side: side === 0 ? 0 : 1, combo: c.id, text: c.text });
  });
  return ev;
}
function cpuChoose(m) {
  const deck = (m.cpuDeck || []).filter(c => m.cpuUsed.indexOf(c) < 0 && CARDS[c] && CARDS[c].cost <= m.cpuNrg);
  if (!deck.length) return null;
  const ahead = m.score[1] > m.score[0], behind = m.score[1] < m.score[0];
  const st = m.fx.style && m.minute <= m.fx.styleUntil ? m.fx.style : null;
  const answer = deck.find(c => CARDS[c].style && BEATS[CARDS[c].style] === st);
  if (answer && m.rng.chance(0.8)) return answer;
  if (ahead && m.minute >= 60 && deck.indexOf('casinha') >= 0) return 'casinha';
  if (behind) {
    const atk = ['pressao', 'chuveirinho', 'longe', 'grito', 'contra'].find(c => deck.indexOf(c) >= 0);
    if (atk && m.rng.chance(0.5)) return atk;
  }
  if (m.rng.chance(0.16)) return m.rng.pick(deck);
  return null;
}
function cpuTurn(m) {
  if (m.pvp || !m.cpuDeck) return [];
  const id = cpuChoose(m);
  if (!id) return [];
  return castCard(m, 1, id);
}
function playCards(m, ids) {
  if (!m.awaiting) return [];
  const ev = [];
  const list = (ids || []).filter(Boolean);
  m.awaiting = false;
  if (!list.length) ev.push({ min: m.minute, kind: 'info', side: 0, text: m.pvp ? `${SELECOES[m.run.selecao].curto} guardou as cartas.` : 'Você guardou as cartas. Segue o jogo.' });
  else list.forEach(id => ev.push(...castCard(m, 0, id)));
  if (!m.pvp) ev.push(...cpuTurn(m));
  return ev;
}
function playCard(m, cardId) { return playCards(m, cardId ? [cardId] : []); }
function applyPvpCards(m, c0, c1) {
  if (!m.pvp || !m.awaiting) return [];
  const sides = m.awaitingSides || [false, false];
  const list = c => (c == null || c === '' ? [] : (Array.isArray(c) ? c.filter(Boolean) : [c]));
  const ev = [];
  m.awaiting = false;
  const a = list(c0), b = list(c1);
  // Catimba dos dois lados arma antes do resto, pra cancelar no mesmo momento sem depender de quem é a casa.
  if (sides[0]) a.filter(id => id === 'catimba').forEach(id => ev.push(...castCard(m, 0, id)));
  if (sides[1]) b.filter(id => id === 'catimba').forEach(id => ev.push(...castCard(m, 1, id)));
  const ra = a.filter(id => id !== 'catimba'), rb = b.filter(id => id !== 'catimba');
  if (sides[0] && ra.length) ra.forEach(id => ev.push(...castCard(m, 0, id)));
  else if (!a.length) ev.push({ min: m.minute, kind: 'info', side: 0, text: `${SELECOES[m.run.selecao].curto} guardou as cartas.` });
  if (sides[1] && rb.length) rb.forEach(id => ev.push(...castCard(m, 1, id)));
  else if (sides[1] && !b.length) ev.push({ min: m.minute, kind: 'info', side: 1, text: `${SELECOES[m.away.selecao].curto} guardou as cartas.` });
  return ev;
}
function previewCard(m, id) {
  const a = lines(m, 0), b = lines(m, 1);
  const you0 = clamp(0.22 + (a.atk - b.def) * 0.004, 0.08, 0.55);
  const them0 = clamp(0.20 + (b.atk - a.def) * 0.004, 0.08, 0.55);
  const c = CARDS[id];
  if (!c) return { you0, them0, you1: you0, them1: them0 };
  const n = c.lv[cardLevel(m.run, id) - 1];
  let you = you0, them = them0;
  if (id === 'pressao') you = clamp(you * (1 + n.roubo * 0.45), 0.05, 0.72);
  if (id === 'casinha') { them *= 1 - n.them; you *= 1 - n.you; }
  if (id === 'contra') you = clamp(you * (1 + n.q * 0.6), 0.05, 0.72);
  if (id === 'chuveirinho') you = clamp(you * (1 + n.head * 0.7), 0.05, 0.72);
  if (id === 'craque') you = n.q;
  if (id === 'paredao') them *= 1 - n.save;
  if (id === 'submagica') you = clamp(you + 0.03, 0.05, 0.72);
  if (id === 'catimba') them *= 0.9;
  if (id === 'longe') you = clamp(you * (1 + n.q * 0.45), 0.05, 0.72);
  if (id === 'peixinho') you = clamp(you + n.q * 0.35, 0.05, 0.75);
  if (id === 'toque') you *= 0.95;
  if (id === 'bolaparada') you = clamp(you * (1 + n.q * 0.4), 0.05, 0.72);
  if (id === 'linha') them *= 1 - n.cut;
  if (id === 'grito') you = clamp(you * (1 + n.q), 0.05, 0.72);
  return { you0, them0, you1: clamp(you, 0.04, 0.8), them1: clamp(them, 0.04, 0.8) };
}
function pvpResult(m) {
  let winner = m.score[0] > m.score[1] ? 0 : m.score[1] > m.score[0] ? 1 : -1;
  let pens = null;
  if (winner < 0) { pens = shootout(m); winner = pens.win ? 0 : 1; }
  return { score: m.score.slice(), winner, pens, epics: m.epics.map(e => ({ id: e.id, min: e.min, scorer: e.scorer, nome: e.nome })) };
}

function simulateRest(m, chooser) {
  // usado em testes: roda até o fim com uma função de escolha de carta (id, lista ou null)
  const all = [];
  let guard = 0;
  while (!m.done && guard++ < 500) {
    if (m.awaiting) {
      const pick = chooser ? chooser(m) : null;
      const ids = pick == null || pick === '' ? [] : (Array.isArray(pick) ? pick : [pick]);
      all.push(...playCards(m, ids));
      continue;
    }
    all.push(...stepMatch(m));
  }
  return all;
}

function shootout(m) {
  const run = m.run, r = m.rng;
  const takers = run.players.map((p, i) => ({ p, r: effRating(run, i, m.stage) })).filter(x => x.p.pos !== 'GOL').sort((a, b) => b.r - a.r);
  const myGK = lines(m, 0).gk, opGK = m.base[1].gk;
  const oppTakers = m.opp.scorers.concat(m.opp.boss ? ['Giusti', 'Enrique', 'Olarticoechea'] : ['o volante', 'o zagueiro', 'o lateral']);
  const kicks = [], sc = [0, 0], taken = [0, 0];
  for (let i = 0; i < 30; i++) {
    for (let side = 0; side < 2; side++) {
      let p, nm;
      let p0 = 0;
      if (side === 0) { const t = takers[i % takers.length]; nm = t.p.nome; p0 = clamp(0.75 + (t.r - opGK) * 0.004, 0.55, 0.92); p = clamp(p0 + CK.motPen * cs(run, 'mot'), 0.55, 0.95); }
      else { nm = oppTakers[i % oppTakers.length]; p = clamp(0.75 + (m.base[1].atk - myGK) * 0.004, 0.55, 0.92); }
      const xk = r.next(), ok = xk < p; if (ok) sc[side]++; taken[side]++;
      const byCoach = side === 0 && ok && xk >= p0;
      if (byCoach) m.stats.coach.mot++;
      kicks.push({ side, nome: nm, ok, coach: byCoach });
      if (i < 5) {
        const rem0 = 5 - taken[0], rem1 = 5 - taken[1];
        if (sc[0] > sc[1] + rem1 || sc[1] > sc[0] + rem0) return { kicks, score: sc, win: sc[0] > sc[1] };
      }
    }
    if (i >= 4 && sc[0] !== sc[1]) return { kicks, score: sc, win: sc[0] > sc[1] };
  }
  const win = r.chance(0.5); sc[win ? 0 : 1]++;
  return { kicks, score: sc, win };
}

function whyLines(run, m, outcome, pens) {
  const out = [];
  const me = m.base[0], op = m.base[1];
  const tot = m.stats.lances[0] + m.stats.lances[1] || 1;
  const share = Math.round(100 * m.stats.lances[0] / tot);
  const mao = m.goals.find(g => g.type === 'mao');
  if (mao && outcome !== 'W') out.push('✋ A Mão Divina fez das suas: aquele gol de mão pesou no placar.');
  if (pens) out.push(pens.win ? `Nos pênaltis, seus batedores tiveram sangue frio (${pens.score[0]} x ${pens.score[1]}).` : `Nos pênaltis a sorte foi pro outro lado (${pens.score[0]} x ${pens.score[1]}).`);
  for (const id in m.stats.relicExtra) {
    const n = m.stats.relicExtra[id];
    if (id === 'paredao_fala') out.push(`🧱 Paredão que Fala ativou ${n}x e deixou o time ${Math.round((m.fx.paredaoMult - 1) * 100)}% mais forte.`);
    else out.push(`${RELICS[id].icon} ${RELICS[id].nome} rendeu +${n} gol${n > 1 ? 's' : ''} extra${n > 1 ? 's' : ''} no placar.`);
  }
  if (m.stats.cardGoals.length) {
    const cg = m.stats.cardGoals[0];
    out.push(`${CARDS[cg.card].icon} Sua carta ${CARDS[cg.card].nome} virou gol de ${cg.scorer}.`);
  }
  if (outcome === 'W') {
    if (share >= 58) out.push(`Você mandou no meio: ${share}% dos ataques foram seus.`);
    else if (me.atk > op.def + 5) out.push(`Seu ataque (${me.atk}) foi demais pra defesa deles (${op.def}).`);
    else if (m.stats.bigSaves[0] >= 2) out.push(`Seu goleiro segurou a onda com ${m.stats.bigSaves[0]} defesas difíceis.`);
    else out.push('Vitória na raça: jogo parelho decidido nos detalhes.');
  } else {
    if (share <= 42) out.push(`O rival teve a bola: ${100 - share}% dos ataques foram dele (meio ${Math.round(op.mid)} x ${Math.round(me.mid)}).`);
    else if (op.atk > me.def + 5) out.push(`O ataque deles (${op.atk}) passou fácil pela sua defesa (${me.def}).`);
    else if (m.stats.shots[0] > m.stats.shots[1]) out.push(`Você finalizou mais (${m.stats.shots[0]} x ${m.stats.shots[1]}), mas a bola não quis entrar.`);
    else out.push('Faltou ataque: reforce o time nas recompensas e use as cartas na hora certa.');
  }
  const res = out.slice(0, 2);
  const cl = coachLine(run, m);
  if (cl) res.push(cl);
  return res;
}
function coachLine(run, m) {
  if (!run.coach) return '';
  const st = m.stats.coach, n = run.coach.nome;
  const parts = [];
  if (st.def) parts.push(`a Defesa (estilo ${csrc(run, 'def')}) travou ${st.def} chute${st.def > 1 ? 's' : ''} que ia${st.def > 1 ? 'm' : ''} entrar`);
  if (st.atk) parts.push(`o Ataque (estilo ${csrc(run, 'atk')}) rendeu ${st.atk} gol${st.atk > 1 ? 's' : ''}`);
  if (st.bol) parts.push(`a Bola Parada (estilo ${csrc(run, 'bol')}) rendeu ${st.bol} gol${st.bol > 1 ? 's' : ''}`);
  if (st.mei) parts.push(`a Posse (estilo ${csrc(run, 'mei')}) criou ${st.mei} ataque${st.mei > 1 ? 's' : ''} a mais`);
  if (st.mot) parts.push(`a Mentalidade (estilo ${csrc(run, 'mot')}) empurrou o time quando apertou`);
  if (st.est) parts.push(`a Prancheta (estilo ${csrc(run, 'est')}) turbinou ${st.est} carta${st.est > 1 ? 's' : ''}`);
  if (!parts.length) return `🧑‍💼 ${n}: desta vez a prancheta não fez diferença.`;
  return `🧑‍💼 ${n}: ` + parts.slice(0, 2).join(' e ') + '.';
}

function finishMatch(run, m) {
  const [gf, ga] = m.score;
  let outcome = gf > ga ? 'W' : gf < ga ? 'L' : 'D';
  let pens = null;
  if (m.ko && outcome === 'D') {
    pens = shootout(m); outcome = pens.win ? 'W' : 'L';
    const lk = pens.kicks[pens.kicks.length - 1];
    if (pens.win && lk && lk.side === 1 && !lk.ok) { const gk = run.players.find(p => p.pos === 'GOL').nome; const e = epicEv(m, 'penalti', { g: gk.toUpperCase(), scorer: gk }); e.decisive = true; e.nome = 'Defesa Decisiva nos Pênaltis'; }
  }
  const fichas = [];
  const juros = interestFor(run);
  if (juros > 0) fichas.push({ label: `Juros (${run.fichas} guardadas)`, v: juros });
  if (outcome === 'W') {
    fichas.push({ label: 'Vitória', v: 3 });
    if (gf - ga >= 2) fichas.push({ label: 'Vitória por 2+ gols', v: 1 });
    if (has(run, 'retranca') && gf === 1 && ga === 0) { fichas.push({ label: '💰 Retranca Rentável (1 a 0)', v: 3 }); run.relicLog.push('retranca'); }
  }
  if (ga === 0) fichas.push({ label: 'Sem sofrer gol', v: 1 });
  const ganho = fichas.reduce((s, x) => s + x.v, 0);
  run.fichas += ganho;
  m.goals.filter(g => g.side === 0).forEach(g => { run.goalsBy[g.scorer] = (run.goalsBy[g.scorer] || 0) + 1; run.goalTypes[g.type] = (run.goalTypes[g.type] || 0) + 1; });
  run.totalGF += gf; run.totalGA += ga;
  const opp = m.opp;
  run.history.push({ stage: m.stage, opp: opp.nome, flag: opp.flag, gf, ga, pens: pens ? pens.score : null, outcome, weather: m.weather, epics: m.epics.map(e => e.id), trailed: !!m.trailed, cards: m.used.length });
  run.epics = (run.epics || []).concat(m.epics.map(e => ({ ...e, seed: run.seed })));
  const why = whyLines(run, m, outcome, pens);
  let groupMsg = '';
  const stage = m.stage;
  if (!m.ko) {
    run.groupPts += outcome === 'W' ? 3 : outcome === 'D' ? 1 : 0;
    const played = stage + 1, left = 3 - played;
    if (run.groupPts + left * 3 < GROUP_PTS_NEEDED) { run.status = 'eliminated'; groupMsg = `Eliminado na fase de grupos: ${run.groupPts} ponto(s), precisava de ${GROUP_PTS_NEEDED}.`; }
    else if (played === 3) {
      if (run.groupPts >= GROUP_PTS_NEEDED) { groupMsg = `Classificado com ${run.groupPts} pontos! Agora é mata-mata: perdeu, acabou.`; run.stage++; }
      else { run.status = 'eliminated'; groupMsg = `Eliminado: ${run.groupPts} pontos, precisava de ${GROUP_PTS_NEEDED}.`; }
    } else {
      groupMsg = run.groupPts >= GROUP_PTS_NEEDED ? `${run.groupPts} pontos: já está classificado!` : `${run.groupPts} ponto(s). Precisa de ${GROUP_PTS_NEEDED} pra avançar.`;
      run.stage++;
    }
  } else {
    if (outcome === 'W') { if (stage === 6) run.status = 'champion'; else run.stage++; }
    else run.status = 'eliminated';
  }
  run.maxStage = Math.max(run.maxStage, run.status === 'champion' ? 7 : run.stage);
  const cont = run.status === 'playing';
  const reward = cont && outcome === 'W';
  const shop = cont && [2, 4, 6].indexOf(run.history.length) >= 0;
  return { outcome, gf, ga, pens, fichas, ganho, why, groupMsg, reward, shop, status: run.status, stage, mGoals: m.goals.slice(), epics: m.epics.slice(), weather: m.weather, used: m.used.slice() };
}

// ---------- Ofertas, loja ----------
function playerBand(stage) { return [62 + stage * 3, 73 + stage * 4]; }
function genPlayer(run, r, stage) {
  const [lo, hi] = playerBand(stage);
  const owned = new Set(run.players.map(p => p.nome));
  const pos = r.weighted(['GOL', 'ZAG', 'MEI', 'ATA'], p => ({ GOL: 1, ZAG: 2, MEI: 2, ATA: 2.2 }[p]));
  let cand = POOL.filter(p => p.pos === pos && !owned.has(p.nome) && p.rating >= lo && p.rating <= hi);
  if (!cand.length) cand = POOL.filter(p => !owned.has(p.nome) && p.rating >= lo - 6 && p.rating <= hi + 4);
  if (!cand.length) cand = POOL.filter(p => !owned.has(p.nome));
  const p = r.pick(cand);
  return { ...p, id: p.nome, origem: p.era };
}
function genCard(run, r) {
  const fresh = CARD_IDS.filter(c => run.cards.indexOf(c) < 0);
  const up = CARD_IDS.filter(c => run.cards.indexOf(c) >= 0 && cardLevel(run, c) < 3);
  const cand = fresh.concat(up);
  if (!cand.length) return null;
  return r.weighted(cand, c => CARD_WEIGHT[CARDS[c].rar] * (run.cards.indexOf(c) >= 0 ? 0.45 : 1));
}
function genRelic(run, r, exclude) {
  const cand = RELIC_IDS.filter(x => run.relics.indexOf(x) < 0 && (!exclude || exclude.indexOf(x) < 0));
  if (!cand.length) return null;
  return r.weighted(cand, x => RELIC_WEIGHT[RELICS[x].rar]);
}
function playerPrice(p, run) { return clamp(3 + Math.floor((p.rating - 60) / 6), 3, 8) + (run.level >= 3 ? 1 : 0); }
function itemPrice(run, it) {
  const extra = run.level >= 3 ? 1 : 0;
  if (it.type === 'player') return playerPrice(it.player, run);
  if (it.type === 'card') return CARD_PRICE[CARDS[it.id].rar] + extra;
  return RELIC_PRICE[RELICS[it.id].rar] + extra;
}
function genRewards(run) {
  const r = rngFor(run.seed, 'recompensa', run.history.length, run.offerSalt);
  const st = Math.min(run.stage, 6);
  const out = [{ type: 'player', player: genPlayer(run, r, st) }];
  const c = genCard(run, r); if (c) out.push({ type: 'card', id: c });
  const rel = genRelic(run, r); if (rel) out.push({ type: 'relic', id: rel });
  while (out.length < 3) out.push({ type: 'player', player: genPlayer(run, r, st) });
  return out;
}
function rerollRewardsCost(run) { return 2 + run.rewardRerolls; }
function rerollRewards(run) {
  const c = rerollRewardsCost(run);
  if (run.fichas < c) return null;
  run.fichas -= c; run.rewardRerolls++; run.offerSalt++;
  return genRewards(run);
}
function genShop(run) {
  const r = rngFor(run.seed, 'vestiario', run.history.length, run.shopSalt);
  const st = Math.min(run.stage + 1, 6);
  const items = [{ type: 'player', player: genPlayer(run, r, st) }];
  const c = genCard(run, r); if (c) items.push({ type: 'card', id: c });
  const rel = genRelic(run, r); if (rel) items.push({ type: 'relic', id: rel });
  const rel2 = genRelic(run, r, rel ? [rel] : []);
  if (rel2 && r.chance(0.5)) items.push({ type: 'relic', id: rel2 }); else items.push({ type: 'player', player: genPlayer(run, r, st) });
  items.forEach(it => { it.price = itemPrice(run, it); it.sold = false; });
  return items;
}
function rerollShopCost(run) { return 2 + run.shopRerolls + (run.level >= 3 ? 1 : 0); }
function rerollShop(run) {
  const c = rerollShopCost(run);
  if (run.fichas < c) return null;
  run.fichas -= c; run.shopRerolls++; run.shopSalt++;
  return genShop(run);
}
function needsTarget(run, it) {
  if (it.type === 'player') return run.players.map((p, i) => i).filter(i => run.players[i].pos === it.player.pos);
  if (it.type === 'card') {
    if (run.cards.indexOf(it.id) >= 0) return null;
    return run.cards.length >= MAX_CARDS ? run.cards.slice() : null;
  }
  if (it.type === 'relic') return run.relics.length >= MAX_RELICS ? run.relics.slice() : null;
  return null;
}
// target: índice de jogador (player) ou id de carta/relíquia a descartar
function applyItem(run, it, target) {
  if (it.type === 'player') {
    const opts = needsTarget(run, it);
    let idx = target != null ? target : opts.reduce((b, i) => run.players[i].rating < run.players[b].rating ? i : b, opts[0]);
    if (opts.indexOf(idx) < 0) idx = opts[0];
    const out = run.players[idx];
    run.players[idx] = { ...it.player };
    return { saiu: out.nome, entrou: it.player.nome };
  }
  if (it.type === 'card') {
    if (run.cards.indexOf(it.id) >= 0) {
      run.cardLv = run.cardLv || {};
      const lv = cardLevel(run, it.id);
      if (lv < 3) run.cardLv[it.id] = lv + 1;
      return { lv: cardLevel(run, it.id) };
    }
    if (run.cards.length >= MAX_CARDS) { const t = target && run.cards.indexOf(target) >= 0 ? target : run.cards[0]; run.cards.splice(run.cards.indexOf(t), 1); }
    run.cards.push(it.id); return {};
  }
  if (it.type === 'relic') {
    if (run.relics.length >= MAX_RELICS) { const t = target && run.relics.indexOf(target) >= 0 ? target : run.relics[0]; run.relics.splice(run.relics.indexOf(t), 1); }
    run.relics.push(it.id); return {};
  }
}
function buyItem(run, it, target) {
  if (it.sold || run.fichas < it.price) return false;
  run.fichas -= it.price; it.sold = true; applyItem(run, it, target); return true;
}
function sellRelic(run, id) {
  const i = run.relics.indexOf(id); if (i < 0) return 0;
  const v = Math.floor(RELIC_PRICE[RELICS[id].rar] / 2);
  run.relics.splice(i, 1); run.fichas += v; return v;
}

// ---------- Veredito ----------
function stageReachedLabel(run) {
  if (run.status === 'champion') return 'CAMPEÃO';
  const last = run.history[run.history.length - 1];
  const st = last ? last.stage : 0;
  if (st <= 2) return 'Caiu na fase de grupos';
  return 'Caiu ' + ({ 3: 'nas oitavas', 4: 'nas quartas', 5: 'na semifinal', 6: 'na final' }[st]);
}
function verdict(run) {
  const r = rngFor(run.seed, 'veredito', run.history.length, run.totalGF);
  const top = Object.entries(run.goalsBy).sort((a, b) => b[1] - a[1])[0];
  const wins = run.history.filter(h => h.outcome === 'W');
  let best = null;
  run.history.forEach(h => { if (h.gf > h.ga && (!best || (h.gf - h.ga) > (best.gf - best.ga) || ((h.gf - h.ga) === (best.gf - best.ga) && h.gf > best.gf))) best = h; });
  const types = run.goalTypes;
  const last = run.history[run.history.length - 1] || { stage: 0 };
  let titulo, frase;
  const heads = (types.cabeca || 0) + (types.goleiro_cabeca || 0);
  const gkGoals = (types.goleiro || 0) + (types.goleiro_cabeca || 0);
  if (run.status === 'champion') {
    titulo = r.pick(['O Rei da Copa Relâmpago', 'Campeão Mundial de Bolso', 'Lenda Instantânea']);
    frase = r.pick(['Nem a Mão Divina segurou: a taça é sua e o grupo vai ter que engolir.', 'Sete jogos, sete histórias. Maradona foi pra casa contando nos dedos.', 'Tirou a Argentina de 86 no grito. Pode mandar no grupo sem medo.']);
  } else if (last.stage === 6) {
    titulo = 'Vice com Gosto de Mão';
    frase = r.pick(['Bateu na trave... e a mão de Deus empurrou pra fora.', 'Chegou na final e descobriu que o juiz também joga.', 'Perdeu pra mão, não pro futebol. Revanche já!']);
  } else if (last.stage >= 4) {
    titulo = r.pick(['Quase Herói', 'O Time que Assustou']);
    frase = r.pick(['Assustou meio mundo, mas faltou fôlego na reta final.', 'Já dava pra sentir o cheiro da final. Só mais uma, vai.', 'A torcida acreditou. A defesa nem tanto.']);
  } else if (last.stage === 3) {
    titulo = 'Turista de Mata-Mata';
    frase = r.pick(['Passou do grupo, tirou foto no estádio e voltou pra casa.', 'Oitavas é o novo título, segundo o seu presidente.']);
  } else {
    titulo = r.pick(['Pé Frio de Grupo', 'Excursão Relâmpago']);
    frase = r.pick(['Voltou pra casa antes do primeiro boleto vencer.', 'Nem desfez a mala no hotel.', 'O ônibus da delegação nem desligou o motor.']);
  }
  if (gkGoals >= 2) frase += ' E o goleiro virou artilheiro, porque aqui é Fominha FC.';
  else if (heads >= 5) frase += ' Chuveirinho raiz: o cabeça de área agradece.';
  else if (has(run, 'bola_quadrada') && (types.fora || 0) >= 3) frase += ' Com a Bola Quadrada, cada chute de longe virou festa.';
  return {
    selecao: SELECOES[run.selecao], chegou: stageReachedLabel(run), titulo, frase,
    artilheiro: top ? { nome: top[0], gols: top[1] } : null,
    relics: run.relics.slice(), best, wins: wins.length, jogos: run.history.length,
    gf: run.totalGF, ga: run.totalGA, seed: run.seed, level: run.level, history: run.history.slice(),
    coach: run.coach ? { nome: run.coach.nome, titulo: coachTitle(run.coach), slots: run.coach.slots } : null
  };
}
function runScore(run) { return run.status === 'champion' ? 8 : (run.history.length ? run.history[run.history.length - 1].stage + (run.history[run.history.length - 1].stage >= 3 ? 0.5 : 0) : 0); }

const E = {
  hashStr, makeRng, rngFor, randomSeed, normalizeSeed,
  SELECOES, SELECAO_IDS, POOL, OPPONENTS, BOSS, STAGES, LEVELS, MAX_PLAYABLE_LEVEL, RARITIES, RELICS, RELIC_IDS, CARDS, CARD_IDS, BASIC_CARDS,
  CARD_TYPES, BEATS, STYLE_NAME, COMBOS, MAX_RELICS, MAX_CARDS, GROUP_PTS_NEEDED, RELIC_PRICE,
  selecaoChoices, newRun, teamLines, oppLines, opponentInfo, promessaIndex, effRating, maxInterest, interestFor,
  createMatch, stepMatch, playCard, playCards, playableCards, simulateRest, finishMatch, lines,
  cardLevel, cardText, cardNums, nrgMax, comboHints, previewCard,
  createPvpMatch, applyPvpCards, pvpCards, pvpResult, awayPlayable,
  genRewards, rerollRewards, rerollRewardsCost, genShop, rerollShop, rerollShopCost, needsTarget, applyItem, buyItem, sellRelic, itemPrice,
  verdict, stageReachedLabel, runScore, isKO, has,
  EPICS, EPIC_IDS, EPIC_RATE, WEATHER, WEATHER_W, weatherFor, LEGENDS, LEGEND_IDS,
  CK, COACH_ATTRS, COACH_ATTR_IDS, COACHES, COACH_BY_ID, COACH_DRAWS, COACH_ROLLS, coachDraftNew, draftPick, draftReroll, makeCoach, flatCoach, coachTitle, coachOVR, coachS, COACH_MIN, coachStars: cs, coachSrc: csrc
};
if (typeof module !== 'undefined' && module.exports) module.exports = E;
else root.FFEngine = E;
})(typeof window !== 'undefined' ? window : this);
