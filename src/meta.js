// Fominha FC · meta-jogo (sem DOM): datas, sequência, missões, cosméticos, divisões,
// duelo por link, bolão, álbum e galeria de técnicos. Tudo local (localStorage) e determinístico.
(function (root) {
'use strict';
const E = typeof module !== 'undefined' && module.exports ? require('./engine.js') : root.FFEngine;
const pad = n => String(n).padStart(2, '0');

// ---------- datas ----------
function dayKey(d) { d = d || new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
function parseDay(k) { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d, 12); }
function addDays(k, n) { const d = parseDay(k); d.setDate(d.getDate() + n); return dayKey(d); }
function dayDiff(a, b) { return Math.round((parseDay(b) - parseDay(a)) / 864e5); }
// semana ISO (segunda a domingo): 'AAAA-Wnn' + índice contínuo pra contar semanas puladas
function isoWeek(d) {
  d = d || new Date();
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const wd = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - wd);
  const y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  const w = Math.ceil(((t - y0) / 864e5 + 1) / 7);
  return `${t.getUTCFullYear()}-W${pad(w)}`;
}
function weekIndex(d) {
  d = d || new Date();
  const t = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  const wd = (new Date(t).getUTCDay() + 6) % 7; // 0 = segunda
  return Math.floor((t - wd * 864e5 - Date.UTC(1970, 0, 5)) / (7 * 864e5));
}
function weekEnds(d) { d = d || new Date(); const wd = (d.getDay() + 6) % 7; return 6 - wd; } // dias até domingo

// ---------- até onde chegou ----------
const REACH = ['Grupos', 'Oitavas', 'Quartas', 'Semi', 'Final', 'Campeão'];
function reachIdx(run) { // 0 = caiu nos grupos ... 5 = campeão
  if (run.status === 'champion') return 5;
  const last = run.history[run.history.length - 1];
  const st = last ? last.stage : 0;
  return st <= 2 ? 0 : st - 2;
}

// ---------- sequência do desafio ----------
const STREAK_BADGES = [{ n: 7, nome: 'Fominha de Ferro', icon: '🥉' }, { n: 30, nome: 'Viciado em Bola', icon: '🥈' }, { n: 100, nome: 'Lenda da Várzea', icon: '🏅' }];
function streakOf(st, today) {
  const s = st.streak || { cur: 0, best: 0, last: null, badges: {} };
  today = today || dayKey();
  if (!s.last) return { cur: 0, best: s.best || 0, status: 'novo', badges: s.badges || {} };
  const d = dayDiff(s.last, today);
  if (d <= 0) return { cur: s.cur, best: s.best, status: 'feito', badges: s.badges || {} };
  if (d === 1) return { cur: s.cur, best: s.best, status: 'risco', badges: s.badges || {} };
  return { cur: 0, best: s.best, status: 'perdeu', lost: s.cur, badges: s.badges || {} };
}
function streakPlay(st, today) {
  today = today || dayKey();
  const s = st.streak = st.streak || { cur: 0, best: 0, last: null, badges: {} };
  s.badges = s.badges || {};
  if (s.last === today) return { cur: s.cur, novo: null };
  s.cur = s.last && dayDiff(s.last, today) === 1 ? s.cur + 1 : 1;
  s.last = today; s.best = Math.max(s.best || 0, s.cur);
  let novo = null;
  STREAK_BADGES.forEach(b => { if (s.cur >= b.n && !s.badges[b.n]) { s.badges[b.n] = today; novo = b; } });
  return { cur: s.cur, novo };
}

// ---------- cosméticos ----------
const COSMETICS = {
  kit_padrao: { tipo: 'kit', nome: 'Uniforme da seleção', desc: 'O uniforme oficial da seleção escolhida.', cores: null, preco: 0 },
  kit_neon: { tipo: 'kit', nome: 'Neon Lima', desc: 'Verde-limão elétrico.', cores: ['#c6ff3d', '#0b1f14'], preco: 120 },
  kit_noite: { tipo: 'kit', nome: 'Noite Roxa', desc: 'Roxo com detalhes lilás.', cores: ['#7c3aed', '#f5d0fe'], preco: 150 },
  kit_real: { tipo: 'kit', nome: 'Branco Real', desc: 'Branco com friso dourado.', cores: ['#f8fafc', '#c9a227'], missao: true },
  kit_ouro: { tipo: 'kit', nome: 'Retrô Ouro', desc: 'Amarelo-ouro com gola marrom.', cores: ['#ffc83d', '#5b3a00'], missao: true },
  kit_fogo: { tipo: 'kit', nome: 'Fogo', desc: 'Laranja-fogo com amarelo.', cores: ['#ff5a2a', '#ffd166'], missao: true },
  mold_padrao: { tipo: 'moldura', nome: 'Clássica', desc: 'Moldura padrão do card.', cor: null, preco: 0 },
  mold_neon: { tipo: 'moldura', nome: 'Neon', desc: 'Moldura verde-limão brilhante.', cor: '#c6ff3d', preco: 80 },
  mold_ouro: { tipo: 'moldura', nome: 'Ouro', desc: 'Moldura dourada de campeão.', cor: '#ffc83d', preco: 100 },
  mold_holo: { tipo: 'moldura', nome: 'Holográfica', desc: 'Moldura arco-íris holográfica.', cor: 'holo', missao: true },
  mold_fogo: { tipo: 'moldura', nome: 'Fogo', desc: 'Moldura em chamas.', cor: 'fogo', missao: true },
  fx_confete: { tipo: 'efeito', nome: 'Confete', desc: 'Chuva de papel picado nas cores do time.', preco: 0 },
  fx_fogos: { tipo: 'efeito', nome: 'Fogos', desc: 'Fogos de artifício no gol.', preco: 90 },
  fx_estrelas: { tipo: 'efeito', nome: 'Estrelas', desc: 'Estrelas douradas caindo.', preco: 120 },
  fx_bolas: { tipo: 'efeito', nome: 'Chuva de bolas', desc: 'Choveu bola na comemoração!', missao: true },
  fx_raio: { tipo: 'efeito', nome: 'Raio', desc: 'Um raio cai no estádio a cada gol.', missao: true }
};
// álbum: páginas por seleção/Copa; completar a página libera um uniforme retrô
const ALBUM_PAGES = [
  { id: 'inicio', nome: 'Elencos iniciais', icon: '🎒', cores: ['#2b2b2b', '#c6ff3d'], from: 'titulares' },
  { id: 'bra1', nome: 'Brasil · Copas 38 a 70', icon: '🇧🇷', cores: ['#ffd21f', '#0b7a3b'], match: e => /^Brasil (38|58|62|70)$/.test(e) },
  { id: 'bra2', nome: 'Brasil · Copas 82 a 98', icon: '🇧🇷', cores: ['#1f4fbf', '#ffd21f'], match: e => /^Brasil (82|86|94|98)$/.test(e) },
  { id: 'bra3', nome: 'Brasil · Copas 2002+', icon: '🇧🇷', cores: ['#ffe14d', '#1d6b34'], match: e => /^Brasil (02|06|10|14)$/.test(e) },
  { id: 'ita', nome: 'Itália', icon: '🇮🇹', cores: ['#1f5fbf', '#ffffff'], match: e => /^Itália/.test(e) },
  { id: 'ger', nome: 'Alemanha e Holanda', icon: '🇩🇪', cores: ['#f2f2f2', '#111111'], match: e => /^(Alemanha|Holanda)/.test(e) },
  { id: 'eur', nome: 'Europa Ocidental', icon: '🇫🇷', cores: ['#0b2a7a', '#e63946'], match: e => /^(França|Inglaterra|Espanha|Portugal|Bélgica)/.test(e) },
  { id: 'les', nome: 'Leste e Norte da Europa', icon: '🇭🇺', cores: ['#b3122e', '#f5f5f5'], match: e => /^(URSS|Polônia|Hungria|Romênia|Bulgária|Croácia|Suécia|Dinamarca)/.test(e) },
  { id: 'ame', nome: 'Américas', icon: '🇦🇷', cores: ['#75aadb', '#ffffff'], match: e => /^(Argentina|Colômbia|Paraguai|Chile|Costa Rica|EUA|México)/.test(e) },
  { id: 'afa', nome: 'África e Ásia', icon: '🌍', cores: ['#0f9d58', '#ffd21f'], match: e => /^(Nigéria|Camarões|Senegal|Costa do Marfim|Coreia)/.test(e) }
];
const ALBUM = (function () {
  const pages = ALBUM_PAGES.map(p => ({ ...p, players: [] }));
  E.SELECAO_IDS.forEach(id => E.SELECOES[id].titulares.forEach(pl => pages[0].players.push({ ...pl, era: E.SELECOES[id].nome })));
  E.POOL.forEach(pl => { const pg = pages.find(p => p.match && p.match(pl.era)) || pages[pages.length - 1]; pg.players.push(pl); });
  pages.forEach(p => { p.players.sort((a, b) => b.rating - a.rating); COSMETICS['retro_' + p.id] = { tipo: 'kit', nome: 'Retrô ' + p.nome, desc: 'Libera ao completar a página "' + p.nome + '" do álbum.', cores: p.cores, album: p.id }; });
  return pages;
})();
const stickerKey = p => p.nome;
function albumCollect(st, players) {
  st.album = st.album || {}; const novos = [];
  players.forEach(p => { const k = stickerKey(p); if (!st.album[k]) { st.album[k] = 1; novos.push(p.nome); } else st.album[k]++; });
  const kits = [];
  ALBUM.forEach(pg => { const id = 'retro_' + pg.id; if (!ownsCos(st, id) && pg.players.every(p => st.album[stickerKey(p)])) { cosStore(st).owned[id] = 1; kits.push(id); } });
  return { novos, kits };
}
function albumStats(st) {
  const a = st.album || {}; let have = 0, total = 0;
  const pages = ALBUM.map(pg => { const h = pg.players.filter(p => a[stickerKey(p)]).length; have += h; total += pg.players.length; return { id: pg.id, have: h, total: pg.players.length }; });
  return { have, total, pages };
}
function cosStore(st) {
  st.cos = st.cos || {}; st.cos.owned = st.cos.owned || {};
  ['kit_padrao', 'mold_padrao', 'fx_confete'].forEach(k => { st.cos.owned[k] = 1; });
  st.cos.kit = st.cos.kit || 'kit_padrao'; st.cos.mold = st.cos.mold || 'mold_padrao'; st.cos.fx = st.cos.fx || 'fx_confete';
  if (st.fominhas == null) st.fominhas = 100;
  return st.cos;
}
function ownsCos(st, id) { return !!cosStore(st).owned[id]; }
function buyCos(st, id) {
  const c = COSMETICS[id]; cosStore(st);
  if (!c || ownsCos(st, id) || !c.preco || st.fominhas < c.preco) return false;
  st.fominhas -= c.preco; st.cos.owned[id] = 1; return true;
}
function equipCos(st, id) {
  const c = COSMETICS[id]; if (!c || !ownsCos(st, id)) return false;
  st.cos[{ kit: 'kit', moldura: 'mold', efeito: 'fx' }[c.tipo]] = id; return true;
}

// ---------- missões do dia ----------
const won = h => h.outcome === 'W';
const MISSIONS = {
  desafio: { tier: 0, txt: 'Jogue o Desafio do dia', ok: s => !!s.daily },
  oitavas: { tier: 0, txt: 'Passe da fase de grupos', ok: s => s.reach >= 1 },
  vence3: { tier: 0, txt: 'Vença um jogo por 3 gols de diferença', ok: s => s.history.some(h => h.gf - h.ga >= 3) },
  clima: { tier: 0, txt: 'Vença um jogo com chuva, calor, neblina ou altitude', ok: s => s.history.some(h => won(h) && /chuva|calor|neblina|altitude/.test(h.weather)) },
  semcarta: { tier: 0, txt: 'Vença um jogo sem usar nenhuma carta', ok: s => s.history.some(h => won(h) && h.cards === 0) },
  quartas: { tier: 1, txt: 'Chegue às quartas de final', ok: s => s.reach >= 2 },
  zero2: { tier: 1, txt: 'Termine 2 jogos sem sofrer gol', ok: s => s.history.filter(h => h.ga === 0).length >= 2 },
  gols12: { tier: 1, txt: 'Marque 12 gols numa campanha', ok: s => s.totalGF >= 12 },
  epico: { tier: 1, txt: 'Faça um lance épico', ok: s => s.epics > 0 },
  invicto: { tier: 1, txt: 'Passe da fase de grupos sem perder', ok: s => s.history.length >= 3 && s.history.slice(0, 3).every(h => h.outcome !== 'L') && s.reach >= 1 },
  tecnico80: { tier: 1, txt: 'Passe dos grupos com técnico de OVR 80+', ok: s => s.coachOVR >= 80 && s.reach >= 1 },
  semi: { tier: 2, txt: 'Chegue à semifinal', ok: s => s.reach >= 3 },
  final: { tier: 2, txt: 'Chegue à final', ok: s => s.reach >= 4 },
  virada: { tier: 2, txt: 'Vença um jogo de virada', ok: s => s.history.some(h => won(h) && h.trailed) },
  penaltis: { tier: 2, txt: 'Vença uma disputa de pênaltis', ok: s => s.history.some(h => won(h) && h.pens) }
};
const MISSION_REWARD = [20, 40, 'cos'];
function missionsFor(day) {
  const r = E.rngFor('fominha-missoes', day);
  return [0, 1, 2].map(t => r.pick(Object.keys(MISSIONS).filter(k => MISSIONS[k].tier === t)));
}
function cosOfDay(st, day) {
  const pool = Object.keys(COSMETICS).filter(k => COSMETICS[k].missao && !ownsCos(st, k));
  return pool.length ? E.rngFor('fominha-cosmetico', day).pick(pool) : null;
}
function runSummary(run) {
  return { history: run.history, reach: reachIdx(run), totalGF: run.totalGF, epics: (run.epics || []).length, daily: !!run.daily, coachOVR: run.coach ? E.coachOVR(run.coach) : 0 };
}
function missionState(st, day) {
  day = day || dayKey();
  if (!st.missions || st.missions.day !== day) st.missions = { day, ids: missionsFor(day), done: {}, cosDay: null };
  return st.missions;
}
// avalia a campanha que acabou de terminar e entrega as recompensas
function missionsCheck(st, run, day) {
  const ms = missionState(st, day), s = runSummary(run), got = [];
  cosStore(st);
  ms.ids.forEach((id, i) => {
    if (ms.done[id] || !MISSIONS[id].ok(s)) return;
    ms.done[id] = 1;
    const rw = MISSION_REWARD[i];
    if (rw === 'cos') {
      const c = cosOfDay(st, ms.day);
      if (c) { st.cos.owned[c] = 1; ms.cosDay = c; got.push({ id, cos: c }); } else { st.fominhas += 80; got.push({ id, fominhas: 80 }); }
    } else { st.fominhas += rw; got.push({ id, fominhas: rw }); }
  });
  return got;
}

// ---------- Técnico Lendário semanal ----------
function legendOfWeek(wk) { wk = wk || isoWeek(); return E.rngFor('fominha-lendario', wk).pick(E.LEGEND_IDS); }
function legendSeed(wk) { wk = wk || isoWeek(); return 'L' + E.randomSeed(E.rngFor('fominha-lendario-semente', wk).next).slice(0, 5); }

// ---------- divisões (pontuação semanal = soma das 5 melhores campanhas) ----------
const DIVS = [
  { id: 'bronze', nome: 'Bronze', icon: '🥉', cor: '#d08a4f', up: 1500, stay: 0 },
  { id: 'prata', nome: 'Prata', icon: '🥈', cor: '#c9d3dc', up: 3000, stay: 800 },
  { id: 'ouro', nome: 'Ouro', icon: '🥇', cor: '#ffc83d', up: 4500, stay: 2000 },
  { id: 'diamante', nome: 'Diamante', icon: '💎', cor: '#7fe3ff', up: 6000, stay: 3200 },
  { id: 'lenda', nome: 'Lenda', icon: '👑', cor: '#c084fc', up: null, stay: 4500 }
];
function weekScore(scores) { return (scores || []).slice().sort((a, b) => b - a).slice(0, 5).reduce((a, b) => a + b, 0); }
function rollover(div, score) {
  const d = DIVS[div];
  if (d.up != null && score >= d.up) return div + 1;
  if (div > 0 && score < d.stay) return div - 1;
  return div;
}
function ligaSync(st, now) {
  now = now || new Date();
  const wi = weekIndex(now), wk = isoWeek(now);
  if (!st.liga) st.liga = { wi, week: wk, div: 0, scores: [] };
  const L = st.liga;
  if (L.wi !== wi) {
    const from = L.div, score = weekScore(L.scores);
    let div = rollover(L.div, score);
    const skipped = Math.min(4, Math.max(0, wi - L.wi - 1));
    for (let i = 0; i < skipped; i++) div = rollover(div, 0);
    L.anim = { from, to: div, week: L.week, score };
    L.hist = (L.hist || []).concat([{ week: L.week, div: from, score }]).slice(-12);
    L.div = div; L.wi = wi; L.week = wk; L.scores = [];
  }
  return L;
}
function ligaAdd(st, pts, now) {
  const L = ligaSync(st, now);
  L.scores = L.scores.concat([pts]).sort((a, b) => b - a).slice(0, 5);
  return weekScore(L.scores);
}
function ligaProgress(L) {
  const d = DIVS[L.div], s = weekScore(L.scores);
  return { div: d, score: s, next: d.up != null ? DIVS[L.div + 1] : null, pct: d.up ? Math.min(100, Math.round(s / d.up * 100)) : 100, falta: d.up ? Math.max(0, d.up - s) : 0, risco: L.div > 0 && s < d.stay, stay: d.stay };
}

// ---------- duelo por link ----------
function b64e(s) {
  const b = typeof Buffer !== 'undefined' ? Buffer.from(s, 'utf8').toString('base64') : btoa(unescape(encodeURIComponent(s)));
  return b.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function b64d(s) {
  s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '=';
  return typeof Buffer !== 'undefined' ? Buffer.from(s, 'base64').toString('utf8') : decodeURIComponent(escape(atob(s)));
}
function duelSide(run, nome, pts) {
  return { n: String(nome || 'Fominha').slice(0, 24), sel: run.selecao, p: pts, r: reachIdx(run), gf: run.totalGF, ga: run.totalGA, h: run.history.map(h => [h.stage, h.gf, h.ga].concat(h.pens ? h.pens : [])) };
}
function duelEncode(d) { return b64e(JSON.stringify(d)); }
function duelDecode(code) {
  try {
    const d = JSON.parse(b64d(String(code)));
    if (d && d.v === 2) {
      if (!/^[A-Z0-9]{4,12}$/.test(String(d.id || ''))) return null;
      if (!E.normalizeSeed(d.s) || !(d.l >= 1 && d.l <= 6)) return null;
      d.s = E.normalizeSeed(d.s);
      d.host = String(d.host || 'Fominha').slice(0, 24);
      d.id = String(d.id);
      return d;
    }
    const okSide = x => x && typeof x.n === 'string' && E.SELECOES[x.sel] && Number.isFinite(x.p) && Array.isArray(x.h) && x.h.length <= 7;
    if (d.v !== 1 || !E.normalizeSeed(d.s) || !(d.l >= 1 && d.l <= 6) || !okSide(d.a) || (d.b && !okSide(d.b))) return null;
    d.s = E.normalizeSeed(d.s); return d;
  } catch (e) { return null; }
}
function duelWinner(a, b) { // 0 = a, 1 = b, -1 empate
  if (a.p !== b.p) return a.p > b.p ? 0 : 1;
  if (a.r !== b.r) return a.r > b.r ? 0 : 1;
  const sa = a.gf - a.ga, sb = b.gf - b.ga;
  return sa === sb ? -1 : sa > sb ? 0 : 1;
}

// ---------- bolão offline ----------
const BOLAO = [{ nome: 'Cai nos grupos', mult: 1.5 }, { nome: 'Oitavas', mult: 2 }, { nome: 'Quartas', mult: 3 }, { nome: 'Semi', mult: 4 }, { nome: 'Final (vice)', mult: 5 }, { nome: 'Campeão', mult: 8 }];
const STAKES = [10, 25, 50];
function bolaoSettle(b, reach) {
  if (!b) return null;
  const hit = b.guess === reach, beyond = reach > b.guess;
  const payout = hit ? Math.round(b.stake * BOLAO[b.guess].mult) : beyond ? b.stake : 0;
  return { guess: b.guess, stake: b.stake, reach, hit, beyond, payout, net: payout - b.stake };
}

// ---------- galeria de técnicos ----------
function coachKey(c) { return c.nome + '|' + E.COACH_ATTR_IDS.map(a => c.slots[a].rating).join('.'); }
function galleryAdd(st, run, pts) {
  if (!run.coach) return null;
  st.coaches = st.coaches || [];
  const k = coachKey(run.coach);
  let g = st.coaches.find(x => x.key === k);
  if (!g) { g = { key: k, nome: run.coach.nome, slots: run.coach.slots, ovr: E.coachOVR(run.coach), titulo: E.coachTitle(run.coach), campanhas: 0, titulos: 0, best: 0, bestReach: 0, flag: E.SELECOES[run.selecao].flag, ts: Date.now() }; st.coaches.push(g); }
  g.campanhas++; if (run.status === 'champion') g.titulos++;
  g.best = Math.max(g.best, pts); g.bestReach = Math.max(g.bestReach, reachIdx(run)); g.last = Date.now();
  if (st.coaches.length > 60) st.coaches = st.coaches.sort((a, b) => b.titulos - a.titulos || b.best - a.best).slice(0, 60);
  return g;
}
function hallOfFame(st) { return (st.coaches || []).slice().sort((a, b) => b.titulos - a.titulos || b.best - a.best || b.ovr - a.ovr).slice(0, 3); }

const M = { dayKey, addDays, dayDiff, isoWeek, weekIndex, weekEnds, REACH, reachIdx, STREAK_BADGES, streakOf, streakPlay, COSMETICS, ALBUM, albumCollect, albumStats, cosStore, ownsCos, buyCos, equipCos,
  MISSIONS, MISSION_REWARD, missionsFor, cosOfDay, missionState, missionsCheck, runSummary, legendOfWeek, legendSeed, DIVS, weekScore, rollover, ligaSync, ligaAdd, ligaProgress,
  duelSide, duelEncode, duelDecode, duelWinner, BOLAO, STAKES, bolaoSettle, coachKey, galleryAdd, hallOfFame };
if (typeof module !== 'undefined' && module.exports) module.exports = M; else root.FFMeta = M;
})(this);
