/* Fominha FC · Copa Relâmpago · interface v3 */
(function () {
'use strict';
const E = window.FFEngine;
const M = window.FFMeta;
const $ = s => document.querySelector(s);
const app = $('#app');
const STORE_KEY = 'fominhafc_copa_relampago_v1';
const TRAIT = { C: 'CAB', F: 'CHU', V: 'VEL', X: 'CRU' };
const TRAIT_FULL = { C: 'Cabeceador', F: 'Chute de fora / bola parada', V: 'Velocista', X: 'Cruzador' };
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const RM = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const fmtN = n => Math.round(n).toLocaleString('pt-BR');
const pad = n => String(n).padStart(2, '0');

// ---------- ícones SVG inline ----------
const ICON = {
  coin: '<circle cx="12" cy="12" r="9"/><path d="M10 8h5M10 12h4M10 8v8"/>',
  trophy: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>',
  ball: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5l4 2.9-1.5 4.6h-5L8 10.4zM12 3v4.5M16 10.4l4.3-1.4M14.5 15l2.6 3.8M9.5 15l-2.6 3.8M8 10.4L3.7 9"/>',
  play: '<path d="M7 4.5l12.5 7.5L7 19.5z"/>',
  dice: '<rect x="3.5" y="3.5" width="17" height="17" rx="4"/><circle cx="8.5" cy="8.5" r="1.2"/><circle cx="15.5" cy="15.5" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="15.5" cy="8.5" r="1.2"/><circle cx="8.5" cy="15.5" r="1.2"/>',
  whistle: '<circle cx="9" cy="14" r="5"/><path d="M12.5 10.5L21 7v4l-6.5 2.5M9 14h.01"/>',
  coach: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V2.8h6V4M8.5 10l2 2 4-4M8.5 16h7"/>',
  card: '<rect x="5" y="3" width="14" height="18" rx="2.5"/><path d="M12 7.5l1.4 2.9 3.1.4-2.3 2.1.6 3.1-2.8-1.5-2.8 1.5.6-3.1-2.3-2.1 3.1-.4z"/>',
  gem: '<path d="M6.5 3.5h11l3.5 5.5-9 12-9-12zM3 9h18M9.5 3.5L12 9l2.5-5.5M12 9v12"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>',
  atk: '<path d="M5 19L19 5M12 5h7v7M5 13l6 6"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2"/>',
  flag: '<path d="M6 21V3M6 4h11l-3 4 3 4H6"/>',
  flame: '<path d="M12 3c1 4 6 6 6 11a6 6 0 0 1-12 0c0-3 2-4.5 2-7.5 2 1 3 3 3 5 1.2-2 1-5.5 1-8.5z"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>',
  home: '<path d="M3 11l9-8 9 8M5.5 9.5V20h13V9.5"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.6v.4"/>',
  share: '<path d="M12 3v12M7 8l5-5 5 5M5 14v6h14v-6"/>',
  cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
  rank: '<path d="M4 20v-8M10 20V5M16 20v-11M2 20h20"/>',
  hanger: '<path d="M10 6a2 2 0 1 1 2.6 1.9c-.4.1-.6.5-.6.9V10l9 6.5V18H3v-1.5L12 10"/>',
  gift: '<rect x="3.5" y="8" width="17" height="13" rx="1.5"/><path d="M3.5 12h17M12 8v13M12 8C10 4 6.5 4 6.5 6.2S12 8 12 8s5.5.6 5.5-1.8S14 4 12 8"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  post: '<path d="M4 20V5h16v15M4 9h16"/>',
  miss: '<path d="M6 6l12 12M18 6L6 18"/>',
  radio: '<rect x="3" y="8" width="18" height="12" rx="2"/><path d="M7 8l10-5"/><circle cx="8.5" cy="14" r="2.5"/><path d="M14 12h4M14 16h4"/>',
  star: '<path d="M12 3l2.6 5.6 6.1.7-4.5 4.1 1.2 6L12 16.4 6.6 19.4l1.2-6-4.5-4.1 6.1-.7z"/>',
  fast: '<path d="M4 6l7 6-7 6zM13 6l7 6-7 6z"/>',
  bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.6 1 2.5h6c0-.9.2-1.7 1-2.5A6 6 0 0 0 12 3z"/>',
  pause: '<rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  swap: '<path d="M4 8h14l-4-4M20 16H6l4 4"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.5 3.3-5 6.5-5s5.7 1.5 6.5 5M16 4.6a3.5 3.5 0 0 1 0 6.8M18 15c2 .6 3.2 2.2 3.6 5"/>',
  vol: '<path d="M4 10v4h3l4 4V6L7 10zM15.5 9.2a3.6 3.6 0 0 1 0 5.6M18 7a6.5 6.5 0 0 1 0 10"/>',
  mute: '<path d="M4 10v4h3l4 4V6L7 10zM16 10l5 5M21 10l-5 5"/>'
};
const FILLED = { play: 1, fast: 1, pause: 1 };
function ic(n, cls) { return `<svg class="svg ${FILLED[n] ? 'f' : ''} ${cls || ''}" viewBox="0 0 24 24" aria-hidden="true">${ICON[n] || ''}</svg>`; }
const ATTR_IC = { atk: 'atk', def: 'shield', mei: 'target', bol: 'flag', mot: 'flame', est: 'coach' };


// ---------- bola de futebol (imagem WebP embutida com fundo transparente; ver tools_ball.py) ----------
function ballSvg(cls, label) {
  return `<img class="fball ${cls || ''}" src="${cls === 'logo' ? BALL_IMG : BALL_ICON}" ${label ? `alt="${label}"` : 'alt="" aria-hidden="true"'} draggable="false" decoding="async">`;
}
// ---------- persistência ----------
const DEF_STORE = () => ({ best: null, unlocked: 1, runs: 0, titles: 0, level: 1, record: 0, ranking: [], daily: {}, tips: {}, tipsOff: false });
function loadStore() {
  try { return Object.assign(DEF_STORE(), JSON.parse(localStorage.getItem(STORE_KEY) || '{}')); }
  catch (e) { return DEF_STORE(); }
}
function saveStore() { try { localStorage.setItem(STORE_KEY, JSON.stringify(G.store)); } catch (e) { /* modo privado */ } }

const G = { albumPage: 'inicio', cosTab: 'kit', store: loadStore(), screen: 'home', run: null, match: null, offers: null, shop: null, result: null, speed: 1, pendingSeed: '', pendingDaily: null, timer: null, verdict: null, newRecord: false };
function gc(path, title) {
  try { if (window.ffGc && window.ffGc.event) window.ffGc.event(path, title); } catch (e) { /* sem analytics */ }
}
function noteSeasons(before) {
  const after = (G.career && G.career.seasons) || 0;
  if (before < 5 && after >= 5) gc('carreira-temporada-5', 'Temporada 5');
  if (before < 10 && after >= 10) gc('carreira-temporada-10', 'Temporada 10');
  if (before < 20 && after >= 20) gc('carreira-temporada-20', 'Temporada 20');
}

M.cosStore(G.store); M.ligaSync(G.store); M.missionState(G.store);
function toast(msg) {
  const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; document.body.appendChild(t);
  setTimeout(() => t.remove(), 2000);
}
function rc(rar) { return E.RARITIES[rar] ? `var(--r-${rar})` : 'var(--r-comum)'; }
function selOf(run) {
  if (run && run.clubKit) return { flag: run.clubFlag || '🏳️', curto: run.clubShort || 'Clube', nome: run.clubName || 'Clube', kit: run.clubKit, id: 'clube', cor: run.clubKit[0], perk: { nome: 'Comissão', desc: '' } };
  return E.SELECOES[run.selecao];
}
function oppShort(op) { return op.boss ? op.apelido : op.nome.replace(/ \d{4}$/, ''); }

// ---------- desafio do dia ----------
function todayKey(d) { d = d || new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
function todayLabel() { const d = new Date(); return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`; }
const MESES = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
function dailySeed(k) { const r = E.rngFor('fominha-desafio-do-dia', k || todayKey()); return 'D' + E.randomSeed(r.next).slice(0, 5); }
function dailyInfo() { const k = todayKey(); return Object.assign({ best: null, tries: 0 }, G.store.daily[k] || {}); }

// ---------- pontuação da campanha (só apresentação) ----------
function runPoints(run) {
  const h = run.history;
  const V = h.filter(x => x.outcome === 'W').length, Em = h.filter(x => x.outcome === 'D').length;
  const gf = run.totalGF, ga = run.totalGA, saldo = gf - ga;
  const champ = run.status === 'champion' ? 250 : 0;
  const base = 100 * V + 40 * Em + 15 * gf + 10 * saldo + champ;
  const mult = 1 + 0.25 * (run.level - 1);
  return { V, E: Em, gf, ga, saldo, champ, base, mult, total: Math.max(0, Math.round(base * mult)) };
}

// ---------- componentes ----------
function tierOf(r) { return r >= 85 ? 'lenda' : r >= 75 ? 'ouro' : r >= 65 ? 'prata' : 'bronze'; }
function shirt(c1, c2) { return `<svg class="sh" viewBox="0 0 24 24"><path d="M8 3l-5 3 2 5 2-1v11h10V10l2 1 2-5-5-3c-.5 1.5-2 2.5-4 2.5S8.5 4.5 8 3z" fill="${c1}" stroke="${c2}" stroke-width="1.3"/></svg>`; }
function futCard(p, opts) {
  opts = opts || {};
  const t = tierOf(p.rating);
  const k = opts.kit || ['#ffffff', '#333333'];
  return `<div class="fut ${t} ${opts.size || ''}" title="${esc(p.nome)} · ${p.pos} ${p.rating}"><span class="r">${p.rating}</span><span class="ps">${p.pos}</span>${shirt(k[0], k[1])}
    ${opts.star ? `<span class="star">🌟</span>` : ''}<span class="nm">${esc(p.nome)}</span><span class="tt">${p.traits.split('').filter(Boolean).map(x => `<i>${TRAIT[x]}</i>`).join('')}</span></div>`;
}
const GLYPH = {
  ataque: '<path d="M8 36c2-14 16-18 24-8l14-4c8-2 16 6 12 14l2 10H16z"/><path d="M14 48h44v8H14z"/>',
  defesa: '<path d="M32 4l24 10v18c0 16-10 26-24 30C18 58 8 48 8 32V14z"/>',
  tatica: '<path d="M16 16h10V8h12v8h10v42H16z"/><path d="M24 6h16v12H24z"/>',
  especial: '<path d="M32 4l6 22 22 6-22 6-6 22-6-22-22-6 22-6z"/>',
  pressao: '<path d="M38 4L14 34h16L22 60l32-38H36z"/>',
  casinha: '<path fill-rule="evenodd" d="M6 32L32 8l26 24v28H6zM26 40h12v20H26z"/>',
  contra: '<path d="M4 26h28V12l26 20-26 20V38H4z"/>',
  chuveirinho: '<path d="M16 30a10 10 0 0 1 8-16 12 12 0 0 1 22 8 8 8 0 0 1 2 16z"/><circle cx="20" cy="48" r="4"/><circle cx="34" cy="52" r="4"/><circle cx="48" cy="46" r="4"/>',
  craque: '<polygon points="32,4 39,24 60,24 43,36 50,56 32,44 14,56 21,36 4,24 25,24"/>',
  paredao: '<path d="M8 10h48v14H8zm0 18h22v14H8zm26 0h22v14H34zM8 46h48v12H8z"/>',
  submagica: '<path d="M6 20h28v-8l18 14-18 14v-8H6z"/><path d="M58 36H30v8L12 30l18-14v8h28z"/>',
  catimba: '<path fill-rule="evenodd" d="M10 24c0-12 10-16 22-16s22 4 22 16v12c0 16-10 24-22 24S10 52 10 36zM22 30a5 5 0 1 0 .1 0zM42 30a5 5 0 1 0 .1 0zM22 44h20v6H22z"/>',
  longe: '<circle cx="14" cy="48" r="9"/><path d="M24 42L46 18l8 7L32 50z"/><path d="M42 8l18 6-14 16z"/>',
  peixinho: '<circle cx="50" cy="24" r="8"/><path d="M42 30L12 40l6 12 22-8-2 12 12-4 2-14z"/><circle cx="14" cy="18" r="7"/>',
  toque: '<circle cx="14" cy="46" r="8"/><circle cx="32" cy="16" r="8"/><circle cx="50" cy="46" r="8"/><path d="M20 40L26 24M38 22L44 40" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>',
  bolaparada: '<path d="M16 6v52" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round"/><path d="M16 10h34L36 26l14 16H16z"/>',
  linha: '<path d="M4 46h56v8H4z"/><circle cx="20" cy="26" r="7"/><path d="M16 34h8v12h-8z"/><circle cx="46" cy="26" r="7"/><path d="M42 34h8v12h-8z"/>',
  grito: '<path d="M8 24h16l24-14v44L24 40H8z"/><path d="M52 22c8 6 8 14 0 20" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>',
  cabeca_ouro: '<path d="M14 24l6-14 8 10 6-12 6 12 8-10 6 14z"/><circle cx="32" cy="42" r="16"/>',
  luva_ofensiva: '<path d="M18 36c0-12 12-18 16-8 3-10 16-8 18 4 8-2 14 8 10 16v8c0 10-8 14-20 14h-6c-12 0-18-6-18-16z"/>',
  escanteio_nunca: '<path d="M14 6v52" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round"/><path d="M14 10h32L34 24l12 14H14z"/><circle cx="46" cy="48" r="8"/>',
  paredao_fala: '<path d="M6 8h52v14H6zm0 18h24v14H6zm28 0h24v14H34zM6 44h52v14H6z"/>',
  retranca: '<path fill-rule="evenodd" d="M32 6a20 20 0 1 0 .1 0zM18 28h28v10H18z"/>',
  promessa: '<path d="M32 2l4 12 12 2-10 7 4 12-10-7-10 7 4-12-10-7 12-2z"/><circle cx="32" cy="46" r="8"/><path d="M22 56h20l-4-8H26z"/>',
  cofrinho: '<ellipse cx="30" cy="38" rx="20" ry="14"/><circle cx="14" cy="30" r="7"/><ellipse cx="48" cy="40" rx="7" ry="5"/><path d="M22 22h14v6H22z"/>',
  pe_coelho: '<circle cx="32" cy="42" r="16"/><path d="M18 30L12 6l16 20z"/><path d="M46 30L52 6 36 26z"/>',
  bola_quadrada: '<path fill-rule="evenodd" d="M10 16a8 8 0 0 1 8-8h28a8 8 0 0 1 8 8v32a8 8 0 0 1-8 8H18a8 8 0 0 1-8-8zM32 32m-11 0a11 11 0 1 0 22 0a11 11 0 1 0-22 0"/>',
  juiz_ladrao: '<path fill-rule="evenodd" d="M8 34h24s6-14 18-12c8 2 8 16 0 18-8 2-14-4-18-2H8zM46 34a5 5 0 1 0 .1 0z"/>',
  energia: '<path d="M38 4L14 34h16L22 60l32-38H36z"/>'
};
function markSvg(id) {
  return `<svg class="mk" viewBox="0 0 64 64" fill="currentColor" aria-hidden="true">${GLYPH[id] || ''}</svg>`;
}
function typeMark(tipo) {
  const t = E.CARD_TYPES[tipo];
  return `<svg class="tmark" viewBox="0 0 64 64" fill="currentColor" aria-hidden="true" style="color:${t.cor}">${GLYPH[tipo] || ''}</svg>`;
}
function boltSvg() {
  return `<svg class="bolt" viewBox="0 0 64 64" fill="currentColor" aria-hidden="true">${GLYPH.energia}</svg>`;
}
function nrgPips(left, max) {
  let s = '';
  for (let i = 0; i < max; i++) s += `<i class="${i < left ? 'on' : ''}"></i>`;
  return `<span class="pips" title="Energia do técnico">${s}</span>`;
}
function cardFace(id, run, opts) {
  opts = opts || {};
  const c = E.CARDS[id], t = E.CARD_TYPES[c.tipo];
  const lv = opts.lv || E.cardLevel(run || G.run, id);
  const hints = opts.compact || !run ? [] : E.comboHints(run, id);
  const tag = opts.btn === false ? 'div' : 'button';
  const label = `${c.nome}, ${t.nome}, nível ${lv}, custa ${c.cost} de energia`;
  return `<${tag} class="cface tipo-${c.tipo} rar-${c.rar} lv${lv} ${opts.on ? 'on' : ''} ${opts.dim ? 'dim' : ''}" style="--tc:${t.cor}" ${tag === 'button' ? 'type="button"' : 'role="img"'} aria-label="${esc(label)}" ${opts.act ? `data-act="${opts.act}" data-c="${id}" data-k="card" data-id="${id}"` : ''}>
    <span class="cmeta"><i class="cost">${boltSvg()}${c.cost}</i><i class="dur">${esc(c.dur)}</i></span><span class="art">${markSvg(id)}</span>
    <b>${esc(c.nome)}</b><small>${typeMark(c.tipo)} <span>${esc(t.nome)}${lv > 1 ? ' · Nv' + lv : ''}</span></small><em aria-hidden="true">${'★'.repeat(lv)}${'☆'.repeat(3 - lv)}</em>
    ${hints.length ? `<div class="hintline">Combo: ${esc(hints.join(', '))}</div>` : ''}</${tag}>`;
}
function chanceBars(id) {
  if (!G.match || !E.CARDS[id]) return '';
  const p = E.previewCard(G.match, id);
  const row = (lbl, a, b, them) => `<div class="cbar ${them ? 'them' : ''}"><span>${lbl}</span><i><b style="width:${Math.round(a * 100)}%"></b><b class="n" style="width:${Math.round(b * 100)}%"></b></i><small>${Math.round(a * 100)}% → ${Math.round(b * 100)}%</small></div>`;
  return `<div class="prev">${row('Seu gol', p.you0, p.you1)}${row('Gol deles', p.them0, p.them1, true)}</div>`;
}
function itemHtml(kind, id, opts) {
  opts = opts || {};
  if (kind === 'card') return cardFace(id, G.run, { act: 'info', btn: true });
  const d = E.RELICS[id];
  return `<button class="item ${kind} ${d.rar} ${opts.cls || ''}" style="--rc:${rc(d.rar)}" data-act="info" data-k="${kind}" data-id="${id}" aria-label="${esc(d.nome)}: ver detalhes">
    <span class="med plate" style="--tc:${rc(d.rar)}">${markSvg(id)}</span><div class="in">${esc(d.nome)}</div><div class="rr">Relíquia · ${E.RARITIES[d.rar].nome}</div>${opts.desc ? `<div class="id">${esc(d.desc)}</div>` : ''}</button>`;
}
function invPanels(run, desc) {
  const cards = run.cards.map(c => itemHtml('card', c, { desc })).join('') + (run.cards.length < E.MAX_CARDS ? `<div class="item empty">vaga de carta</div>` : '');
  const rels = run.relics.map(r => itemHtml('relic', r, { desc })).join('') + (run.relics.length < E.MAX_RELICS ? `<div class="item empty">vaga de relíquia</div>` : '');
  return `<div class="panel"><div class="ph">${ic('card')} Cartas <span class="r">${run.cards.length}/${E.MAX_CARDS}</span></div><div class="items">${cards}</div></div>
  <div class="panel"><div class="ph">${ic('gem')} Relíquias <span class="r">${run.relics.length}/${E.MAX_RELICS}</span></div><div class="items">${rels}</div><div class="xs mut" style="margin-top:8px">Toque em uma carta ou relíquia pra ver o que ela faz.</div></div>`;
}
function topbar(run, extra) {
  return `<div class="topbar"><span class="fichas" id="fichas" title="Fichas">${ic('coin')} ${run.fichas}</span><span class="chip">${selOf(run).flag} ${esc(selOf(run).curto)}</span>${run.daily ? `<span class="chip" style="color:var(--gold)">${ic('cal')} Desafio</span>` : ''}${run.legend ? `<span class="chip" style="color:var(--gold)">${E.LEGENDS[run.legend].flag} Lendário</span>` : ''}${run.duel ? `<span class="chip" style="color:var(--gold)">${ic('users')} Duelo</span>` : ''}<span class="sp"></span><span class="chip">Nv ${run.level} · ${esc(run.seed)}</span>${extra || ''}</div>`;
}
function rtClass(r) { return r >= 88 ? 't4' : r >= 80 ? 't3' : r >= 70 ? 't2' : 't1'; }
function ovrTier(o) { return o >= 85 ? 'lenda' : o >= 78 ? 'ouro' : o >= 70 ? 'prata' : 'bronze'; }
function radarSvg(vals, size) {
  const S = 160, c = S / 2, R = 54, n = 6;
  const f = v => Math.max(0.08, (v - 40) / 59);
  const pt = (i, k) => { const a = -Math.PI / 2 + i * 2 * Math.PI / n; return [c + Math.cos(a) * R * k, c + Math.sin(a) * R * k]; };
  let g = '';
  [0.25, 0.5, 0.75, 1].forEach(k => { g += `<polygon points="${[...Array(n)].map((_, i) => pt(i, k).join(',')).join(' ')}" fill="${k === 1 ? 'rgba(255,255,255,.04)' : 'none'}" stroke="rgba(255,255,255,.14)" stroke-width="1"/>`; });
  for (let i = 0; i < n; i++) { const [x, y] = pt(i, 1); g += `<line x1="${c}" y1="${c}" x2="${x}" y2="${y}" stroke="rgba(255,255,255,.1)"/>`; }
  const has = vals.some(v => v != null);
  if (has) {
    const poly = vals.map((v, i) => pt(i, f(v == null ? 40 : v)).join(',')).join(' ');
    g += `<polygon points="${poly}" fill="rgba(58,160,255,.35)" stroke="#7cc4ff" stroke-width="2" stroke-linejoin="round"/>`;
    vals.forEach((v, i) => { if (v != null) { const [x, y] = pt(i, f(v)); g += `<circle cx="${x}" cy="${y}" r="3" fill="#fff"/>`; } });
  }
  E.COACH_ATTRS.forEach((a, i) => {
    const [x, y] = pt(i, 1.28); const v = vals[i];
    g += `<text x="${x}" y="${y - 2}" text-anchor="middle">${a.curto}</text><text x="${x}" y="${y + 9}" text-anchor="middle" style="font-size:10.5px;fill:${v == null ? '#5d7a69' : '#fff'}">${v == null ? '—' : v}</text>`;
  });
  return `<svg class="radar" viewBox="0 0 ${S} ${S}" style="max-width:${size || 160}px" role="img" aria-label="Radar de atributos do técnico">${g}</svg>`;
}
function slotsOVR(slots) { const v = E.COACH_ATTR_IDS.map(a => slots[a] && slots[a].rating).filter(x => x != null); return v.length ? Math.round(v.reduce((a, b) => a + b, 0) / v.length) : null; }
function ovrBadge(o, lbl) { return `<div class="ovrbadge ${o == null ? '' : ovrTier(o)}"><div><b>${o == null ? '—' : o}</b><small>${lbl || 'OVR'}</small></div></div>`; }
function coachCardHtml(nome, slots, opts) {
  opts = opts || {};
  const c = E.makeCoach(nome, slots);
  const full = Object.keys(slots).length === 6;
  const ovr = slotsOVR(slots);
  return `<div class="coachcard ${opts.cls || ''}">
    <div class="coachhero">${ovrBadge(ovr, full ? 'OVR' : 'PARCIAL')}<div style="flex:1;min-width:0">
      <div class="eyebrow" style="color:#8fcbff">Seu técnico</div>
      ${opts.edit ? `<input id="coachName" class="cname" maxlength="24" value="${esc(nome)}" aria-label="Nome do técnico">` : `<div class="cnm" id="coachTitleName">${esc(nome)}</div>`}
      <div class="ctitle">${full ? '“' + esc(E.coachTitle(c)) + '”' : `Montando... ${Object.keys(slots).length}/6 atributos`}</div></div></div>
    <div class="cgrid"><div class="cslots">${E.COACH_ATTRS.map(a => {
      const sl = slots[a.id];
      return `<div class="cslot ${sl ? '' : 'off'}"><span class="ci">${ic(ATTR_IC[a.id])}</span><b>${a.curto}</b><span class="cf">${sl ? esc(sl.from) : 'vazio'}</span><b class="rt ${sl ? rtClass(sl.rating) : ''}" style="font-size:16px">${sl ? sl.rating : '—'}</b></div>`;
    }).join('')}</div>${radarSvg(E.COACH_ATTRS.map(a => slots[a.id] ? slots[a.id].rating : null), opts.cls === 'mini' ? 120 : 150)}</div>
    ${opts.fx && full ? `<div style="margin-top:8px">${E.COACH_ATTRS.map(a => `<div class="cfx"><b>${a.curto}</b> ${esc(a.fx(E.coachS(slots[a.id].rating)))}</div>`).join('')}</div>` : ''}
  </div>`;
}

// ---------- telas ----------
function render() {
  clearTimeout(G.timer); clearInterval(G.decT); clearInterval(G.spinT);
  document.querySelectorAll('.tip,.sheet,.modal,.epicfx,.walkout,.penshoot').forEach(x => x.remove()); SIM.epic = null; G.penSkip = null; G.held = false;
  if (G.screen !== 'match' && window.FFAudio) FFAudio.crowdStop();
  window.scrollTo(0, 0);
  app.classList.toggle('career', String(G.screen || '').indexOf('car') === 0);
  if (window.FFCareer && FFCareer.view && String(G.screen || '').indexOf('car') === 0) { renderCareer(); syncTabbar(); saveStore(); app.classList.remove('enter'); void app.offsetWidth; app.classList.add('enter'); return; }
  ({ home: renderHome, daily: renderDaily, selecao: renderSelecao, coach: renderCoach, hub: renderHub, match: renderMatch, result: renderResult, reward: renderReward, shop: renderShop, verdict: renderVerdict, desafios: renderDesafios, album: renderAlbum, tecnicos: renderTecnicos, perfil: renderPerfil, duelo: renderDuelo, chave: renderChave, espera: renderEspera, caiu: renderCaiu })[G.screen]();
  syncTabbar(); saveStore();
  app.classList.remove('enter'); void app.offsetWidth; app.classList.add('enter');
}
function go(screen) {
  if (screen === 'hub' && G.run && G.run.cupRole != null && G.cup) {
    syncCupKo();
    if (G.run.status !== 'playing' && G.run.stage < 6) screen = 'caiu';
    else if (G.run.stage === 6 && G.run.status === 'playing') screen = G.cup.status === 'off' ? (armOfflineFinal(), 'hub') : 'espera';
    else if (G.run.stage >= 3 && !G.cup.koSeen) { G.cup.koSeen = true; G.cup.mode = 'ko'; screen = 'chave'; }
  }
  G.screen = screen; render();
  if (G.cup && G.run) { saveSnap(); cupPublish(); }
}

// ---------- dicas (onboarding) ----------
const TIPS = {
  coach: { n: 1, t: 'Monte seu técnico', p: 'Cada sorteio traz um técnico real. Toque em UMA qualidade dele pra preencher esse atributo do seu técnico. Quanto maior a nota, mais ela ajuda o time.' },
  hub: { n: 2, t: 'Caminho da Copa', p: 'São 3 jogos de grupo (precisa de 4 pontos) e 4 mata-matas até a final. Compare as barras com o rival e toque nas cartas e relíquias pra ver o que fazem.' },
  decision: { n: 3, t: 'Energia do técnico', p: 'Você tem 3 de energia (4 se o Estrategista for 90+). Dá pra jogar mais de uma carta se a energia alcançar. Pressão ganha da Posse, Posse ganha do Contra-ataque, Contra-ataque ganha da Pressão: isso é CONTRA-GOLPE. Pares certos viram combo.', top: true },
  reward: { n: 4, t: 'Abra o pacote', p: 'Depois de cada vitória você abre um pacote e escolhe 1 de 3. A cor mostra a raridade: prata, azul, roxo e ouro.' },
  nav: { nv: 1, t: 'Novidades na Copa!', p: 'Use a barra de baixo: Desafios (sequência, missões, Técnico Lendário, bolão), Álbum de figurinhas, Galeria de técnicos e Perfil com divisões e cosméticos. Nas partidas, fique de olho nos LANCES ÉPICOS e no clima.' },
  desafios: { nv: 1, t: 'Volte todo dia', p: 'Jogar o Desafio do dia mantém sua sequência 🔥. As 3 missões trocam à meia-noite e dão Fominhas 🪙 e cosméticos. Toda semana tem um Técnico Lendário novo na final.' },
  wx: { nv: 1, t: 'Clima do jogo', p: 'Cada jogo tem clima e estádio. Chuva, calor, neblina e altitude mudam um pouco as chances (pros dois times). O efeito aparece aqui e no campinho.' }
};
function showTip(key) {
  const st = G.store;
  if (st.tipsOff || st.tips[key] || window.__noTips || document.querySelector('.tip')) return;
  const t = TIPS[key];
  const d = document.createElement('div'); d.className = 'tip' + (t.top ? ' top' : ''); d.setAttribute('role', 'dialog');
  d.innerHTML = `<div class="th">${ic('bulb')} ${esc(t.t)}<span class="n">${t.nv ? 'NOVIDADE' : `DICA ${t.n}/4`}</span></div><p>${esc(t.p)}</p>
    <div class="row"><button class="btn ghost" data-act="tipskip">Pular dicas</button><button class="btn blue" data-act="tipok" data-k="${key}">Entendi</button></div>`;
  document.body.appendChild(d);
}

// ---------- início ----------
function logoSvg() { return `<div class="ballwrap">${ballSvg('logo', 'Bola de futebol')}<i class="bshadow"></i></div>`; }
function rankHtml(list, hlTs) {
  if (!list.length) return `<div class="empty">Nenhuma campanha ainda. Jogue e entre no ranking!</div>`;
  return `<div class="rank">${list.slice(0, 5).map((r, i) => `<div class="rk ${r.ts === hlTs ? 'me' : ''}"><span class="p">${i + 1}º</span><div class="n">${r.flag} ${esc(r.sel)} · ${esc(r.chegou)}<small>${r.daily ? '📅 Desafio ' + esc(r.daily.slice(8, 10) + '/' + r.daily.slice(5, 7)) + ' · ' : ''}Nv ${r.level} · semente ${esc(r.seed)}</small></div><span class="s num">${fmtN(r.score)}</span></div>`).join('')}</div>`;
}
function renderHome() {
  const st = G.store, lv = Math.min(st.level || 1, st.unlocked), di = dailyInfo(), ds = dailySeed(), now = new Date();
  app.innerHTML = `
  <div class="menuhead">${sndDockHtml()}</div>
  <div class="hero"><div class="logo">${logoSvg()}<div class="wm">Fominha<span>FUTEBOL CLUBE</span></div></div>
    <div class="modetag">${ic('bolt')} COPA RELÂMPAGO</div>
    <p class="tagline">7 jogos. Perdeu, acabou. Monte combos absurdos com cartas, relíquias e um técnico lendário.</p></div>
  <div class="daily">
    <div class="cal"><i>${MESES[now.getMonth()]}</i><b>${pad(now.getDate())}</b></div>
    <div class="eyebrow g">Mesma Copa pra todo mundo hoje</div>
    <div class="dt">${ic('cal')} Desafio do dia</div>
    <div class="meta"><span class="chip">${ic('dice')} ${ds}</span><span class="chip">Nível 1</span><span class="chip" style="color:var(--gold)">${ic('trophy')} ${di.best != null ? fmtN(di.best) + ' pts' : 'sem pontos'}</span></div>
    ${(() => { const s = M.streakOf(st); return s.cur ? `<div class="srow ${s.status}">🔥 <b>${s.cur} dia${s.cur > 1 ? 's' : ''}</b> ${s.status === 'risco' ? '· jogue hoje ou a sequência acaba!' : s.status === 'feito' ? '· sequência garantida hoje ✓' : ''}</div>` : ''; })()}
    <button class="btn gold" data-act="daily">${ic('cal')} Desafio do dia</button>
  </div>
  <button class="lgchip" data-act="tab" data-t="perfil">${divBadge(M.ligaSync(st).div, 'sm')}<span>${fmtN(M.ligaProgress(st.liga).score)} pts na semana</span>${ic('arrow')}</button>
  <div class="statsrow"><div class="stat"><b class="num" style="color:var(--lime)">${fmtN(st.record || 0)}</b><span>Recorde</span></div><div class="stat"><b class="num">${st.runs}</b><span>Campanhas</span></div><div class="stat"><b class="num" style="color:var(--gold)">${st.titles}</b><span>Títulos</span></div></div>
  <div class="panel hl"><div class="ph">${ballSvg('ico')} Nova campanha</div>
    <div class="seg">${E.LEVELS.map(l => {
      const lock = l.locked || l.n > st.unlocked;
      return `<button class="${l.n === lv ? 'on' : ''} ${lock ? 'lock' : ''}" data-act="level" data-n="${l.n}" aria-pressed="${l.n === lv}">${lock ? ic('lock') + ' ' : ''}${l.n}. ${l.nome}<small>${l.n === 1 ? '×1,00' : '×' + (1 + 0.25 * (l.n - 1)).toFixed(2).replace('.', ',')} pts</small></button>`;
    }).join('')}</div>
    <p class="small mut" style="margin:8px 0 10px">${esc(E.LEVELS[lv - 1].desc)}${st.unlocked < E.MAX_PLAYABLE_LEVEL ? ' Seja campeão pra liberar o próximo nível.' : ''}</p>
    <input class="seed" id="seedIn" maxlength="12" placeholder="SEMENTE (OPCIONAL)" value="${esc(G.pendingSeed)}" autocomplete="off" autocapitalize="characters" aria-label="Semente para desafiar amigo">
    <p class="xs mut" style="margin:6px 0 12px">Vazio = Copa aleatória. Cole a semente de um amigo pra jogar a mesma Copa e comparar a pontuação.</p>
    <button class="btn shine" data-act="start">${ic('play')} Começar a Copa</button>
    <button class="btn sec" style="margin-top:8px" data-act="liveDuel">${ic('users')} Duelo ao vivo <small>mesma Copa, só se encontram na final</small></button>
    <button class="btn sec" style="margin-top:8px" data-act="carOpen">Modo Carreira <small>20 temporadas, da Série D à elite</small></button></div>
  <div class="panel"><div class="ph">${ic('rank')} Ranking local <span class="r">melhores campanhas</span></div>${rankHtml(st.ranking || [])}</div>
  <div class="row"><button class="btn ghost" data-act="howto">${ic('info')} Como jogar</button></div>
  <p class="xs mut gcnote">Contamos visitas de forma anônima, sem cookies.</p>`;
  if (DEBUG.week) { const d = G.store.liga.div; G.store.liga.anim = { from: DEBUG.week === 'down' ? Math.min(4, d + 1) : Math.max(0, d), to: DEBUG.week === 'down' ? d : Math.min(4, d + 1), week: M.isoWeek(new Date(Date.now() - 7 * 864e5)), score: DEBUG.week === 'down' ? 240 : 1720 }; DEBUG.week = null; }
  if (!ligaAnimModal()) showTip('nav');
}
function howtoModal() {
  const m = document.createElement('div'); m.className = 'modal';
  m.innerHTML = `<div class="box howto"><div class="grab" style="width:44px;height:5px;border-radius:5px;background:rgba(255,255,255,.25);margin:0 auto 10px"></div><h3 class="ttl" style="margin-top:0">Como jogar</h3><ol>
    <li><div><b>Escolha a seleção e monte o técnico.</b> São 6 sorteios de técnicos reais. Em cada um, você pega uma qualidade (nota de 55 a 95).</div></li>
    <li><div><b>Fase de grupos:</b> 3 jogos. Vitória vale 3 pontos e empate vale 1. Precisa de <b>${E.GROUP_PTS_NEEDED} pontos</b>.</div></li>
    <li><div><b>Mata-mata:</b> oitavas, quartas, semi e final contra <b>A Mão Divina</b>. Empate vai pros pênaltis. Perdeu, acabou.</div></li>
    <li><div><b>Na partida</b> o jogo pausa em 3 momentos. Cada carta custa energia (3 por jogo, 4 com Estrategista 90+). Dá pra gastar mais de uma no mesmo momento.</div></li>
    <li><div><b>Depois de vencer</b> você abre um pacote: 1 de 3 entre jogador, carta ou relíquia. No Vestiário (jogos 2, 4 e 6) dá pra comprar com Fichas.</div></li>
    <li><div><b>Pontos:</b> 100 por vitória, 40 por empate, 15 por gol, 10 por saldo e +250 pelo título, tudo vezes o multiplicador do nível.</div></li></ol>
    <p class="xs mut gcnote">Contamos visitas de forma anônima, sem cookies.</p>
    <button class="btn" data-x="1">Bora!</button></div>`;
  m.addEventListener('click', ev => { if (ev.target === m || ev.target.closest('[data-x]')) m.remove(); });
  document.body.appendChild(m);
}
function renderDaily() {
  const di = dailyInfo(), ds = dailySeed(), k = todayKey(), now = new Date();
  const list = (G.store.ranking || []).filter(r => r.daily === k);
  app.innerHTML = `<div class="topbar"><button class="chip" data-act="home">${ic('back')} Início</button><span class="sp"></span><span class="chip">${ic('cal')} ${todayLabel()}</span></div>
  <div class="daily" style="margin-top:4px">
    <div class="cal"><i>${MESES[now.getMonth()]}</i><b>${pad(now.getDate())}</b></div>
    <div class="eyebrow g">Desafio do dia · ${todayLabel()}</div>
    <div class="dt" style="font-size:26px">${ic('cal')} Mesma Copa<br>pra todo mundo</div>
    <p class="small" style="margin:8px 0 0;color:#f1e6c4">Hoje todo mundo joga a mesma semente: mesmas seleções, mesmos técnicos sorteados, mesmos rivais e as mesmas recompensas. Ganha quem fizer mais pontos.</p>
  </div>
  <div class="panel" style="text-align:center"><div class="eyebrow">Semente de hoje</div><div class="disp" style="font-size:40px;color:var(--lime);letter-spacing:4px;margin:4px 0">${ds}</div>
    <div class="row" style="margin-top:6px"><div class="stat"><b class="num" style="color:var(--gold)">${di.best != null ? fmtN(di.best) : '—'}</b><span>Seu melhor hoje</span></div><div class="stat"><b class="num">${di.tries}</b><span>Tentativas</span></div></div></div>
  <div class="panel"><div class="ph">${ic('info')} Regras</div>
    <div class="small" style="display:grid;gap:6px"><div>• Nível 1 (Várzea) fixo, igual pra todos.</div><div>• Pontos: 100 por vitória, 40 por empate, 15 por gol, 10 por saldo e +250 pelo título.</div><div>• Pode jogar quantas vezes quiser. Vale o melhor resultado.</div><div>• No final, compartilhe o card e desafie o grupo.</div></div></div>
  <div class="panel"><div class="ph">${ic('rank')} Suas tentativas de hoje</div>${rankHtml(list)}</div>
  <div class="mctrl"><button class="btn gold shine" data-act="playDaily">${ic('play')} Apostar no bolão e jogar</button></div>`;
}

function startRun(seed, daily) {
  const lv = Math.min(G.store.level || 1, G.store.unlocked);
  G.pendingSeed = E.normalizeSeed(seed) || E.randomSeed();
  G.pendingLevel = daily ? 1 : lv;
  G.pendingDaily = daily || null; G.pendingLegend = null; G.pendingDuel = null;
  go('selecao');
}
function renderSelecao() {
  const ids = E.selecaoChoices(G.pendingSeed);
  app.innerHTML = `<div class="topbar"><button class="chip" data-act="home">${ic('back')} Início</button><span class="sp"></span>${G.pendingDaily ? `<span class="chip" style="color:var(--gold)">${ic('cal')} Desafio</span>` : ''}${G.pendingLegend ? `<span class="chip" style="color:var(--gold)">${E.LEGENDS[G.pendingLegend].flag} Lendário</span>` : ''}${G.pendingDuel ? `<span class="chip" style="color:var(--gold)">${ic('users')} Duelo</span>` : ''}<span class="chip">${ic('dice')} ${esc(G.pendingSeed)}</span><span class="chip">Nv ${G.pendingLevel}</span></div>
  <h2 class="ttl">Escolha sua seleção</h2>
  <p class="sub">Você começa com 7 jogadores modestos e 2 cartas. Os craques chegam nos pacotes.</p>
  ${ids.map(id => {
    const s = E.SELECOES[id];
    const avgR = Math.round(s.titulares.reduce((a, p) => a + p.rating, 0) / 7);
    return `<div class="selcard" style="--c1:${s.cor}55" data-act="pick" data-id="${id}" role="button" tabindex="0" aria-label="Escolher ${esc(s.nome)}">
      <div class="top"><span class="fl">${s.flag}</span><div><div class="nm">${esc(s.nome)}</div><div class="xs mut" style="margin-top:3px">Uniforme <span style="display:inline-block;width:10px;height:10px;border-radius:3px;background:${s.kit[0]};vertical-align:-1px"></span> <span style="display:inline-block;width:10px;height:10px;border-radius:3px;background:${s.kit[1]};vertical-align:-1px"></span></div></div><div class="ovr">${avgR}<small>FORÇA</small></div></div>
      <div class="perk"><b>${ic('star')} ${esc(s.perk.nome)}:</b> ${esc(s.perk.desc)}</div>
      <div class="minisquad">${s.titulares.map(p => futCard(p, { size: 'sm', kit: s.kit })).join('')}</div></div>`;
  }).join('')}`;
}

// ---------- Monte seu Técnico ----------
function spinCoach() {
  if (RM()) { G.justDrew = true; renderCoach(); return; }
  G.spin = true; renderCoach();
  const els = { n: $('#rl .rn'), f: $('#rl .rf') };
  let i = 0;
  G.spinT = setInterval(() => {
    const c = E.COACHES[(i * 7 + Math.floor(Math.random() * 5)) % E.COACHES.length]; i++;
    if (els.n) { els.n.textContent = c.nome; els.f.textContent = c.flag; }
  }, 70);
  setTimeout(() => { clearInterval(G.spinT); if (G.screen !== 'coach') return; G.spin = false; G.justDrew = true; renderCoach(); }, 850);
}
function renderCoach() {
  const d = G.draft, run = G.run;
  const nome = G.store.coachName || 'Professor Fominha';
  let draw = '';
  if (!d.done && G.spin) {
    draw = `<div class="roulette" id="rl" aria-live="polite"><div><div class="eyebrow" style="color:#8fcbff">Sorteando técnico ${d.draw + 1}/6...</div><div class="rf">🎲</div><div class="rn">...</div></div></div>`;
  } else if (!d.done) {
    const c = E.COACH_BY_ID[d.current];
    const free = E.COACH_ATTR_IDS.filter(a => !d.slots[a]);
    const bestA = free.reduce((x, a) => c.s[a] > c.s[x] ? a : x, free[0]);
    draw = `<div class="drawcard ${G.justDrew ? 'reveal' : ''}">
      <div class="coachhero">${ovrBadge(E.coachOVR(c))}<div style="flex:1;min-width:0"><div class="eyebrow g">Sorteio ${d.draw + 1}/6</div><div class="cn">${esc(c.nome)} <span class="fl">${c.flag}</span></div><div class="xs mut">${esc(c.fama)}</div></div></div>
      <div class="small" style="margin:10px 0 0;font-weight:800">Escolha <span style="color:var(--lime)">UMA</span> qualidade dele:</div>
      <div class="attrs">${E.COACH_ATTRS.map(a => {
        const taken = d.slots[a.id], r = c.s[a.id];
        return `<button class="attr ${taken ? 'taken' : ''} ${!taken && a.id === bestA ? 'best' : ''}" ${taken ? 'disabled' : `data-act="cpick" data-a="${a.id}"`} aria-label="${a.nome} ${r}">
          <span class="ai">${ic(ATTR_IC[a.id])}</span><span class="an">${a.nome}<small>${taken ? 'já preenchido: ' + esc(taken.from) + ' ' + taken.rating : esc(a.desc)}</small></span><span class="rt ${rtClass(r)}">${r}</span></button>`;
      }).join('')}</div>
      <button class="btn sec" style="margin-top:10px" data-act="creroll" ${d.rolls <= 0 ? 'disabled' : ''}>${ic('dice')} Re-sortear técnico <small>(${d.rolls} restante${d.rolls === 1 ? '' : 's'})</small></button>
    </div>`;
  }
  G.justDrew = false;
  app.innerHTML = `<div class="topbar"><span class="chip">${selOf(run).flag} ${esc(selOf(run).curto)}</span><span class="sp"></span><span class="chip">${ic('dice')} ${d.rolls} re-sorteio${d.rolls === 1 ? '' : 's'}</span><span class="chip">${Math.min(d.draw + (d.done ? 0 : 1), 6)}/6</span></div>
  <h2 class="ttl">${ic('coach')} Monte seu técnico</h2>
  <p class="sub">${d.done ? 'Técnico pronto! Dá pra mudar o nome dele. Veja abaixo o efeito de cada atributo no jogo.' : 'Em cada sorteio, pegue uma nota para um atributo vazio. Notas vão de 55 a 95, estilo FUT.'}</p>
  ${draw}
  ${coachCardHtml(nome, d.slots, { edit: true, fx: d.done })}
  ${d.done ? `<div class="mctrl"><button class="btn shine" data-act="cdone">${ic('play')} Começar a Copa</button></div>` : ''}`;
  if (!G.spin) showTip('coach');
}

// ---------- hub ----------
function bracketHtml(run) {
  return `<div class="bracket">${E.STAGES.map((s, i) => {
    const h = run.history.filter(x => x.stage === i).pop();
    const cur = i === run.stage && run.status === 'playing';
    const lbl = h ? `${h.gf}-${h.ga}` : (i === 6 ? ic('trophy') : cur ? ballSvg('bk') : '');
    return `<div class="bk ${h ? h.outcome : ''} ${cur ? 'cur' : ''} ${i === 6 ? 'boss' : ''}"><div class="d">${lbl}</div>${s.curto}</div>`;
  }).join('')}</div><div class="phasebar"><span>GRUPOS</span><span>MATA-MATA</span></div>`;
}
function linesCmp(me, op) {
  const rows = [['ATQ', 'atk'], ['MEI', 'mid'], ['DEF', 'def'], ['GOL', 'gk']];
  const w = v => Math.max(4, Math.min(100, (v - 35) * 1.6));
  return `<div class="cmp">${rows.map(([l, k]) => {
    const a = Math.round(me[k]), b = Math.round(op[k]);
    return `<b class="v ${a > b ? 'adv' : a < b ? 'dis' : ''}">${a}</b><div class="bar me"><i style="width:${w(me[k])}%"></i></div><span class="l">${l}</span><div class="bar op"><i style="width:${w(op[k])}%"></i></div><b class="v">${b}</b>`;
  }).join('')}</div>`;
}
const FORM_HUB = { GOL: [[50, 88]], ZAG: [[28, 66], [72, 66]], MEI: [[28, 41], [72, 41]], ATA: [[28, 16], [72, 16]] };
function formationHtml(run) {
  const pi = E.promessaIndex(run), sel = { kit: myKit(run) };
  const cnt = { GOL: 0, ZAG: 0, MEI: 0, ATA: 0 };
  const slots = run.players.map((p, i) => {
    const pos = FORM_HUB[p.pos][cnt[p.pos]++] || [50, 50];
    return `<div class="slot" style="left:${pos[0]}%;top:${pos[1]}%">${futCard(p, { size: 'sm', kit: sel.kit, star: i === pi })}</div>`;
  }).join('');
  return `<div class="formation"><svg class="lines" viewBox="0 0 100 102" preserveAspectRatio="none"><g fill="none" stroke="rgba(255,255,255,.45)" stroke-width=".6"><rect x="3" y="3" width="94" height="96"/><line x1="3" y1="3" x2="97" y2="3"/><circle cx="50" cy="3" r="12"/><rect x="25" y="81" width="50" height="18"/><rect x="38" y="92" width="24" height="7"/></g></svg>${slots}</div>`;
}
function teamAvg(l) { return Math.round((l.atk + l.mid + l.def + l.gk) / 4); }
function renderHub() {
  const run = G.run, st = E.STAGES[run.stage], op = E.opponentInfo(run), me = E.teamLines(run, run.stage), sel = selOf(run);
  const pts = runPoints(run);
  const diff = (me.atk + me.mid + me.def + me.gk) - (op.lines.atk + op.lines.mid + op.lines.def + op.lines.gk);
  const edge = diff >= 14 ? ['Você é favorito', 'var(--lime)'] : diff >= 4 ? ['Leve vantagem sua', 'var(--lime)'] : diff > -4 ? ['Jogo parelho', 'var(--gold)'] : diff > -14 ? ['Rival um pouco melhor', '#ff9a9d'] : ['Zebra à vista: rival bem mais forte', '#ff9a9d'];
  const grp = !st.ko ? `<span>Grupo: <b style="color:#fff">${run.groupPts} pts</b> (precisa de ${E.GROUP_PTS_NEEDED})</span>` : `<span style="color:var(--gold)">Mata-mata: empate vai pros pênaltis</span>`;
  app.innerHTML = `${topbar(run)}
  ${bracketHtml(run)}
  <div class="grpline">${grp}<span class="sep">|</span><span>Pontos: <b style="color:var(--lime)">${fmtN(pts.total)}</b></span></div>
  <div class="vs ${op.boss ? 'boss' : ''}" style="--c0:${myKit(run)[0]};--c1:${oppKit(op)[0]}">
    <div class="stg"><span class="eyebrow ${op.boss ? 'g' : 'l'}">${esc(st.nome)} · Próximo jogo</span></div>
    <div class="vh"><div class="tm"><div class="f">${sel.flag}</div><div class="n">${esc(sel.curto)}</div><div class="o">Força ${teamAvg(me)}</div></div>
      <div class="x">VS</div>
      <div class="tm"><div class="f">${op.flag}</div><div class="n">${esc(oppShort(op))}</div><div class="o">Força ${teamAvg(op.lines)}</div></div></div>
    ${op.boss ? `<div class="bossrule">${ic('bolt')} <b>Regra do chefe:</b> ${esc(op.regra)}</div>` : `<div class="xs mut" style="text-align:center;margin-top:6px">Perigo: ${op.scorers.slice(0, 3).map(esc).join(', ')}</div>`}
    ${linesCmp(me, op.lines)}
    <div class="edge" style="color:${edge[1]}">${edge[0]}</div>
    ${(() => { const w = E.WEATHER[wxOf(run)]; return `<div class="wxline wx-${w.id}"><span class="wi">${w.icon}</span><div><b>${esc(w.nome)} <span class="mut" style="font-weight:700">· 🏟️ ${esc(stadiumFor(run, run.stage, w.id))}</span></b><small>${esc(w.desc)}</small></div></div>`; })()}
  </div>
  ${run.coach ? coachCardHtml(run.coach.nome, run.coach.slots, { cls: 'mini' }) : ''}
  <div class="panel"><div class="ph">${ic('users')} Seu time <span class="r" style="color:var(--gold)">${esc(sel.perk.nome)}</span></div>${formationHtml(run)}
    <div class="perkline"><b>${esc(sel.perk.nome)}:</b> ${esc(sel.perk.desc)} Juros: +1 a cada 5 Fichas (máx +${E.maxInterest(run)}).</div></div>
  ${invPanels(run)}
  <div class="mctrl"><button class="btn ${op.boss ? 'gold' : ''} shine" data-act="play">${ic('play')} ${op.boss ? 'Encarar ' + esc(op.legend ? op.tecnico : 'a Mão Divina') : 'Bora pro jogo'}</button></div>`;
  if (G.store.tips.hub) showTip('wx'); showTip('hub');
}
const OPP_KITS = [['#e63946', '#ffffff'], ['#f1f1f1', '#1d3557'], ['#1d4ed8', '#ffffff'], ['#ffb703', '#1d3557'], ['#0f9d58', '#ffffff'], ['#7c3aed', '#ffffff'], ['#111827', '#f59e0b']];
function oppKit(op) {
  if (op.kit) return op.kit;
  if (op.boss) return ['#75aadb', '#ffffff'];
  let h = 0; for (const ch of op.nome) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const mine = G.run ? myKit(G.run)[0].toLowerCase() : '';
  let k = OPP_KITS[h % OPP_KITS.length];
  if (k[0].toLowerCase() === mine || (mine === '#ffd21f' && k[0] === '#ffb703') || (mine === '#e2231a' && k[0] === '#e63946')) k = OPP_KITS[(h + 1) % OPP_KITS.length];
  return k;
}

// ---------- partida ----------
const FORM = [[6, 50], [20, 30], [20, 70], [34, 36], [34, 64], [46, 28], [46, 72]]; // GOL, ZAG, ZAG, MEI, MEI, ATA, ATA
const NUMS = [1, 3, 4, 5, 8, 11, 9];
const NARR = {
  mine: ['{p} domina no meio-campo e levanta a cabeça...', 'Toca {p} para {q}, que gira o jogo.', 'Lá vai {p} pela direita, conduzindo com categoria...', '{p} recebe, ajeita e devolve pra {q}.', 'Bola no pé de {p}, a seleção constrói com paciência.', 'Lançamento longo de {p}... a zaga afasta de cabeça.', '{p} carrega a bola e passa do meio-campo!', 'Troca de passes envolvente, a torcida canta olé!', 'Tabelinha de {p} com {q} pela esquerda...', 'Dividida forte no meio, {p} fica com a bola.', '{p} abre o jogo para {q}, que vem livre pelo lado.', '{p} tenta o drible, perde, mas recupera na raça!'],
  opp: ['O rival sai jogando com {p}.', '{p} tenta a enfiada, a zaga corta.', 'Pressão adversária, {p} cai pela ponta...', '{p} faz o pivô e segura a bola.', 'Falta no meio-campo, nada de perigo. {p} cobra rápido.', '{p} gira em cima da marcação e toca de lado.', 'O adversário rondando a área, {p} procura espaço...'],
  geral: ['Que jogo, minha gente! Que jogo!', 'A bola rola, o relógio corre e o coração aperta...', 'Joga a torcida, joga o coração!', 'Olha o tempo, olha o tempo!', 'Jogo estudado no meio-campo, ninguém quer errar.'],
  build0: ['Lá vem {T}! {q} arranca pelo meio e procura {p}...', 'Atenção, que vai {T} pro ataque! {q} levanta a cabeça...', 'Perigo! {q} toca e a bola chega em {p}...', 'Abre o olho, defesa! {q} vem com a bola dominada...'],
  build1: ['Cuidado! {q} sai com a bola e acha {p}...', 'Contra-ataque perigoso deles, {p} pede a bola...', '{q} avança pela ponta, a zaga recua...', 'Lá vem eles! {p} se apresenta na frente...']
};
const SIM = { on: false };
function nameList(side) {
  const run = G.run, m = G.match;
  return side === 0 ? run.players.filter(p => p.pos !== 'GOL').map(p => p.nome) : m.opp.scorers.concat(['o volante', 'o lateral']);
}
function narr(kind, side, who) {
  const ns = nameList(side), p = who || ns[Math.floor(Math.random() * ns.length)];
  const others = ns.filter(n => n !== p); const q = others.length ? others[Math.floor(Math.random() * others.length)] : p;
  const T = side === 0 ? selOf(G.run).curto : G.match.opp.nome.replace(/ \d{4}$/, '');
  const arr = NARR[kind];
  const out = arr[Math.floor(Math.random() * arr.length)].replace('{p}', p).replace('{q}', q).replace('{T}', T);
  return out.charAt(0).toUpperCase() + out.slice(1);
}
function lum(hex) { const n = parseInt(hex.slice(1), 16); return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255; }
function pitchLines() {
  return `<svg class="lines" viewBox="0 0 155 100" preserveAspectRatio="none" aria-hidden="true"><g fill="none" stroke="rgba(255,255,255,.6)" stroke-width=".7">
    <rect x="3" y="3" width="149" height="94" rx=".5"/><line x1="77.5" y1="3" x2="77.5" y2="97"/><circle cx="77.5" cy="50" r="12"/>
    <rect x="3" y="24" width="22" height="52"/><rect x="130" y="24" width="22" height="52"/><rect x="3" y="38" width="8" height="24"/><rect x="144" y="38" width="8" height="24"/>
    <path d="M25 41a12 12 0 0 1 0 18M130 41a12 12 0 0 0 0 18"/></g>
    <g fill="rgba(255,255,255,.75)"><circle cx="77.5" cy="50" r="1"/><circle cx="17" cy="50" r=".9"/><circle cx="138" cy="50" r=".9"/></g>
    <rect x="0" y="43" width="3" height="14" fill="rgba(255,255,255,.35)" stroke="#fff" stroke-width=".5"/><rect x="152" y="43" width="3" height="14" fill="rgba(255,255,255,.35)" stroke="#fff" stroke-width=".5"/></svg>`;
}
function renderMatch() {
  const mine = G.run, m = G.match, run = m && m.pvp ? m.run : mine, sel0 = selOf(run), sel = { ...sel0, kit: myKit(run) }, op = m.opp, ok = oppKit(op), wx = E.WEATHER[m.weather] || E.WEATHER.sol;
  const homeCrest = run.careerClubId && window.FFCareer ? FFCareer.badge(run.careerClubId, 'sm') : sel.flag;
  const awayCrest = run.careerFoeId && window.FFCareer ? FFCareer.badge(run.careerFoeId, 'sm') : op.flag;
  let toks = '';
  const tc = c => lum(c) > 0.6 ? '#111' : '#fff';
  for (let i = 0; i < 7; i++) toks += `<div class="tok t0 ${i === 0 ? 'gk' : ''}" style="background:${i === 0 ? '#1f2937' : sel.kit[0]};border-color:${sel.kit[1]};color:${i === 0 ? '#fff' : tc(sel.kit[0])}">${NUMS[i]}</div>`;
  for (let i = 0; i < 7; i++) toks += `<div class="tok t1 ${i === 0 ? 'gk' : ''}" style="background:${i === 0 ? '#facc15' : ok[0]};border-color:${ok[1]};color:${i === 0 ? '#111' : tc(ok[0])}">${NUMS[i]}</div>`;
  let trail = ''; for (let i = 0; i < 5; i++) trail += `<div class="trail"></div>`;
  app.innerHTML = `
  <div class="mc">
    <div class="sb">
      <div class="tm"><div class="crest" style="--kc:${sel.kit[0]}">${homeCrest}</div><div class="tn">${esc(sel.curto)}${m.pvp && G.cup && G.cup.role === 0 ? ' · você' : ''}</div></div>
      <div class="mid"><div class="score" id="sc">${m.score[0]}<i>:</i>${m.score[1]}</div><span class="clock"><span class="live"></span><span id="clk">${m.minute}'</span></span></div>
      <div class="tm"><div class="crest" style="--kc:${ok[0]}">${awayCrest}</div><div class="tn">${esc(oppShort(op))}${m.pvp && G.cup && G.cup.role === 1 ? ' · você' : ''}</div></div>
    </div>
    <div class="prog"><i id="prog" style="width:${Math.min(100, m.minute / 90 * 100)}%"></i></div>
    <div class="stagelbl"><span>${esc(run.careerLabel || E.STAGES[m.stage].nome)}</span>${run.coach ? `<span>${ic('coach')} ${esc(run.coach.nome)}</span>` : ''}<span title="${esc(wx.desc)} · ${esc(stadiumFor(run, m.stage, wx.id))}">${wx.icon} ${esc(wx.nome)}</span>${op.boss ? `<span class="bossr">${ic('bolt')} ${esc(op.regra)}</span>` : ''}</div>
  </div>
  <div class="momentum"><div class="mh"><span style="color:var(--lime)">▲ ${esc(sel.curto)}</span><span>Momentum</span><span style="color:#ff9a9d">${esc(oppShort(op))} ▼</span></div>
    <svg id="mom" viewBox="0 0 300 46" preserveAspectRatio="none" role="img" aria-label="Gráfico de pressão por minuto"></svg>
    <div class="mstats" id="mstats"></div></div>
  <div class="stadium"><div class="stands" aria-hidden="true"><i></i><i></i><i></i><i></i></div><div class="floods" aria-hidden="true"><b></b><b></b><b></b><b></b></div>
  <div class="pitch wx-${wx.id}" id="pitch"><div class="pz" id="pz">${pitchLines()}${toks}${trail}<div class="ball" id="ball">${ballSvg('pitch')}</div></div><div class="wx" aria-hidden="true"></div></div></div>
  <div class="fxbar" id="fxbar"></div>
  <div class="feedhead"><span class="eyebrow l">${ic('radio')} Narração ao vivo</span><div class="sndrow">${sndDockHtml()}${m.pvp ? '<span class="chip">mesma final</span>' : `<button class="chip" data-act="speed" id="spd" aria-label="Mudar velocidade">${ic('fast')} ${G.speed}x</button>`}</div></div>
  <div class="feed" id="feed" aria-live="polite"></div>`;
  G.queue = []; G.shownScore = m.score.slice();
  G.mom = Array.from({ length: 30 }, () => [0, 0]); G.goalMarks = []; G.mst = { poss: [1, 1], shots: [0, 0], saves: [0, 0] };
  initSim();
  updateFx(); drawMomentum(); drawStats();
  if (window.FFAudio) FFAudio.crowdStart();
  if (!RM() && G.speed === 1 && (run.careerMatch || run.stage === 0 || (m.stage >= 5 && m.minute === 0))) showWalkout();
  if (m.pvp && G.holdKick && Date.now() < G.holdKick) G.timer = setTimeout(tick, Math.max(200, G.holdKick - Date.now()));
  else G.timer = setTimeout(tick, 700);
}
function addMom(side, min, v) { const b = Math.min(29, Math.floor(Math.max(0, min - 1) / 3)); G.mom[b][side] += v; }
function drawMomentum() {
  const svg = $('#mom'); if (!svg) return;
  const cur = Math.min(29, Math.floor(Math.max(0, G.match.minute - 1) / 3));
  let s = `<rect x="0" y="0" width="${(cur + 1) * 10}" height="46" fill="rgba(255,255,255,.03)"/><line x1="0" y1="23" x2="300" y2="23" stroke="rgba(255,255,255,.18)" stroke-width="1"/><line x1="150" y1="0" x2="150" y2="46" stroke="rgba(255,255,255,.12)" stroke-dasharray="2 2"/>`;
  G.mom.forEach((b, i) => {
    const v = b[0] - b[1]; if (!v) return;
    const h = Math.min(21, Math.abs(v) * 6);
    s += v > 0 ? `<rect x="${i * 10 + 1.5}" y="${23 - h}" width="7" height="${h}" rx="1.5" fill="#c6ff3d"/>` : `<rect x="${i * 10 + 1.5}" y="23" width="7" height="${h}" rx="1.5" fill="#ff5a5f"/>`;
  });
  G.goalMarks.forEach(g => { const x = Math.min(29, Math.floor(Math.max(0, g.min - 1) / 3)) * 10 + 5; s += `<circle cx="${x}" cy="${g.side === 0 ? 4 : 42}" r="3.2" fill="#fff" stroke="${g.side === 0 ? '#c6ff3d' : '#ff5a5f'}" stroke-width="1.5"/>`; });
  svg.innerHTML = s;
}
function drawStats() {
  const el = $('#mstats'); if (!el) return;
  const st = G.mst, pt = st.poss[0] + st.poss[1], p0 = Math.round(st.poss[0] / pt * 100);
  const row = (a, b, lbl, wa, wb) => `<div class="ms"><b>${a}</b><div class="bar me"><i style="width:${wa}%"></i></div><span>${lbl}</span><div class="bar op"><i style="width:${wb}%"></i></div><b>${b}</b></div>`;
  const pc = (x, y) => (x + y) ? Math.round(x / (x + y) * 100) : 0;
  el.innerHTML = row(p0 + '%', (100 - p0) + '%', 'Posse', p0, 100 - p0) + row(st.shots[0], st.shots[1], 'Finalizações', pc(st.shots[0], st.shots[1]), pc(st.shots[1], st.shots[0])) + row(st.saves[0], st.saves[1], 'Defesas', pc(st.saves[0], st.saves[1]), pc(st.saves[1], st.saves[0]));
}

// ----- campinho vivo (requestAnimationFrame + interpolação) -----
function initSim() {
  const pitch = $('#pitch');
  const els = [...pitch.querySelectorAll('.tok')];
  SIM.on = true; SIM.pitch = pitch; SIM.ballEl = $('#ball'); SIM.trailEls = [...pitch.querySelectorAll('.trail')]; SIM.hist = [];
  SIM.toks = els.map((el, k) => {
    const side = k < 7 ? 0 : 1, i = k % 7, f = FORM[i];
    const x = side === 0 ? f[0] : 100 - f[0], y = side === 0 ? f[1] : 100 - f[1];
    return { el, side, i, x, y, seed: Math.random() * 100, spd: 0.85 + Math.random() * 0.3 };
  });
  SIM.ball = { x: 50, y: 50 };
  SIM.poss = 0; SIM.holder = SIM.toks[3]; SIM.passAt = 0; SIM.shot = null; SIM.celebrate = -1; SIM.last = performance.now();
  measure();
  requestAnimationFrame(simFrame);
}
function measure() { if (SIM.pitch) { SIM.W = SIM.pitch.clientWidth; SIM.H = SIM.pitch.clientHeight; } }
window.addEventListener('resize', measure);
function setPoss(side, preferForward) {
  SIM.poss = side;
  const cands = SIM.toks.filter(t => t.side === side && t.i !== 0);
  SIM.holder = preferForward ? cands.filter(t => t.i >= 3)[Math.floor(Math.random() * 4)] : cands[Math.floor(Math.random() * cands.length)];
  SIM.shot = null; SIM.passAt = performance.now() + 500;
}
function shoot(side, kind) {
  const gx = side === 0 ? 100 : 0;
  const y = kind === 'goal' ? 44 + Math.random() * 12 : kind === 'post' ? (Math.random() < .5 ? 42 : 58) : kind === 'save' ? 42 + Math.random() * 16 : (Math.random() < .5 ? 18 : 82);
  const x = kind === 'save' ? (side === 0 ? 94 : 6) : kind === 'post' ? (side === 0 ? 98.5 : 1.5) : gx;
  SIM.holder = null; SIM.shot = { x, y };
}
function simFrame(now) {
  if (!SIM.on || G.screen !== 'match' || !SIM.pitch || !document.body.contains(SIM.pitch)) { SIM.on = false; return; }
  const dt = Math.min(0.05, (now - SIM.last) / 1000); SIM.last = now;
  const sp = G.speed, b = SIM.ball;
  if (!SIM.W) measure();
  if (G.held) { SIM.last = now; requestAnimationFrame(simFrame); return; }
  if (SIM.holder && now > SIM.passAt && SIM.celebrate < 0) {
    const dir = SIM.poss === 0 ? 1 : -1;
    const mates = SIM.toks.filter(t => t.side === SIM.poss && t !== SIM.holder && t.i !== 0);
    const fw = mates.filter(t => (t.x - SIM.holder.x) * dir > -6);
    const pool = fw.length && Math.random() < .75 ? fw : mates;
    SIM.holder = pool[Math.floor(Math.random() * pool.length)];
    SIM.passAt = now + (650 + Math.random() * 900) / sp;
  }
  let bt;
  if (SIM.shot) bt = SIM.shot;
  else if (SIM.holder) { const dir = SIM.holder.side === 0 ? 1 : -1; bt = { x: SIM.holder.x + dir * 1.6, y: SIM.holder.y + 0.8 }; }
  else bt = { x: 50, y: 50 };
  const bk = SIM.shot ? 9 : 7;
  let bscale = 1;
  if (SIM.epic) { const k = Math.min(1, (now - SIM.epic.t0) / SIM.epic.dur), ease = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2, p = epicPos(SIM.epic.id, ease); b.x = p.x; b.y = p.y; bscale = 1 + p.h * 1.3; }
  else {
  b.x += (bt.x - b.x) * Math.min(1, dt * bk * Math.max(1, sp * 0.8));
  b.y += (bt.y - b.y) * Math.min(1, dt * bk * Math.max(1, sp * 0.8));
  }
  const shiftX = (b.x - 50) * 0.42, pullY = (b.y - 50) * 0.18;
  let chaser = null, cd = 1e9;
  for (const t of SIM.toks) { if (t.side === SIM.poss || t.i === 0) continue; const d = (t.x - b.x) ** 2 + (t.y - b.y) ** 2; if (d < cd) { cd = d; chaser = t; } }
  const tt = now / 1000;
  for (const t of SIM.toks) {
    const f = FORM[t.i];
    let tx = t.side === 0 ? f[0] : 100 - f[0], ty = t.side === 0 ? f[1] : 100 - f[1];
    if (t.i !== 0) {
      tx += shiftX + (t.side === SIM.poss ? (t.side === 0 ? 7 : -7) : (t.side === 0 ? -3 : 3));
      ty += pullY * (t.i >= 3 ? 1.2 : 0.7);
    } else { ty += (b.y - 50) * 0.25; tx += (t.side === 0 ? 1 : -1) * Math.max(0, (t.side === 0 ? 50 - b.x : b.x - 50)) * 0.06; }
    tx += Math.sin(tt * 1.7 * t.spd + t.seed) * 1.6 + Math.sin(tt * 0.6 + t.seed * 2) * 1.2;
    ty += Math.cos(tt * 1.3 * t.spd + t.seed) * 1.8;
    if (SIM.celebrate >= 0) {
      if (t.side === SIM.celebrate && t.i !== 0) { const cx = SIM.celebrate === 0 ? 88 : 12; tx = cx + Math.sin(tt * 9 + t.seed) * 3; ty = 12 + (t.i * 3) + Math.cos(tt * 11 + t.seed) * 3; }
      else if (t.side !== SIM.celebrate && t.i !== 0) { tx = (t.side === 0 ? f[0] : 100 - f[0]) + (t.side === 0 ? -4 : 4); ty = t.side === 0 ? f[1] : 100 - f[1]; }
    } else if (SIM.epic && SIM.epic.save && t.side === 0 && t.i === 0) { tx = b.x < 12 ? b.x + 1 : 4; ty = b.y < 12 ? 40 : b.y; }
    else if (t === SIM.holder) { const dir = t.side === 0 ? 1 : -1; tx = t.x + dir * 6; ty = t.y + (50 - t.y) * 0.05; }
    else if (t === chaser) { tx = b.x; ty = b.y; }
    tx = clampN(tx, 3, 97); ty = clampN(ty, 6, 94);
    const k = (t === chaser || t === SIM.holder ? 3.2 : 2.2) * t.spd * Math.max(1, sp * 0.7);
    t.x += (tx - t.x) * Math.min(1, dt * k); t.y += (ty - t.y) * Math.min(1, dt * k);
    const jump = SIM.celebrate === t.side && t.i !== 0 ? Math.abs(Math.sin(tt * 10 + t.seed)) * -6 : 0;
    t.el.style.transform = `translate(${t.x / 100 * SIM.W}px, ${t.y / 100 * SIM.H + jump}px) translate(-50%,-50%)`;
  }
  SIM.ballEl.style.transform = `translate(${b.x / 100 * SIM.W}px, ${b.y / 100 * SIM.H}px) translate(-50%,-50%) scale(${bscale})`;
  // rastro da bola: some quando a bola está parada
  SIM.hist.unshift([b.x, b.y]); if (SIM.hist.length > 16) SIM.hist.pop();
  SIM.trailEls.forEach((el, i) => {
    const h = SIM.hist[Math.min(SIM.hist.length - 1, (i + 1) * 3)];
    const d = Math.hypot(h[0] - b.x, h[1] - b.y);
    el.style.opacity = Math.min(0.45, d * 0.06) * (1 - i / 5.5);
    el.style.transform = `translate(${h[0] / 100 * SIM.W}px, ${h[1] / 100 * SIM.H}px) translate(-50%,-50%) scale(${1 - i * 0.14})`;
  });
  requestAnimationFrame(simFrame);
}
function clampN(x, a, b) { return Math.max(a, Math.min(b, x)); }

function updateFx() {
  const m = G.match, f = m.fx, run = G.run, min = m.minute, bar = $('#fxbar');
  if (!bar) return;
  const c = [];
  c.push(nrgPips(m.nrgLeft == null ? 3 : m.nrgLeft, m.nrgMax || 3));
  if (m.fxOpp && m.fxOpp.style && min <= m.fxOpp.styleUntil) c.push(`Rival: ${E.STYLE_NAME[m.fxOpp.style]}`);
  const fxChip = (id, text) => `<span class="chip c">${markSvg(id)} ${text}</span>`;
  if (min <= f.pressaoUntil) c.push(fxChip('pressao', `Pressão até ${f.pressaoUntil}'`));
  if (min <= f.casinhaUntil) c.push(fxChip('casinha', f.casinhaUntil > 120 ? 'Casinha até o fim' : `Casinha até ${f.casinhaUntil}'`));
  if (min <= f.chuvaUntil) c.push(fxChip('chuveirinho', `Chuveirinho até ${f.chuvaUntil}'`));
  if (min <= f.longeUntil) c.push(fxChip('longe', `Longe até ${f.longeUntil}'`));
  if (min <= f.contraUntil) c.push(fxChip('contra', `Contra-ataque até ${f.contraUntil}'`));
  if (min <= f.toqueUntil) c.push(fxChip('toque', `Posse até ${f.toqueUntil}'`));
  if (min <= f.paredaoUntil) c.push(fxChip('paredao', `Paredão até ${f.paredaoUntil}'`));
  if (f.craque) c.push(fxChip('craque', 'Craque armado'));
  if (f.peixinho) c.push(fxChip('peixinho', 'Peixinho armado'));
  if (f.sub) c.push(fxChip('submagica', `Reserva +${Math.round(f.sub * 10) / 10}`));
  if (f.paredaoMult > 1) c.push(fxChip('paredao_fala', `+${Math.round((f.paredaoMult - 1) * 100)}% força`));
  if (f.fadigaUntil >= min && !f.blitz) c.push(`😮‍💨 Cansaço −${Math.round((f.fadigaPct || 0) * 100)}%`);
  if (m.weather !== 'sol') c.push(`${E.WEATHER[m.weather].icon} ${E.WEATHER[m.weather].nome}`);
  bar.innerHTML = c.map(x => x.indexOf('class="chip c"') >= 0 ? x : `<span class="chip c">${x}</span>`).join('') + run.relics.map(r => `<button class="chip plate" style="--tc:${rc(E.RELICS[r].rar)};min-height:30px;padding:3px 8px" data-act="info" data-k="relic" data-id="${r}" title="${esc(E.RELICS[r].nome)}" aria-label="${esc(E.RELICS[r].nome)}">${markSvg(r)}</button>`).join('');
}
const RELIC_RX = new RegExp(Object.values(E.RELICS).map(r => r.nome.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'));
function feedClass(e) {
  const all = e.text + ' ' + (e.sub || '');
  if (e.epic) return ['epic' + (e.kind === 'goal' ? ' goal' + e.side : ''), '⚡ ' + e.epic.nome.toUpperCase(), e.kind === 'goal' ? 'ball' : 'shield'];
  if (e.kind === 'goal') return ['goal' + e.side, e.gtype === 'mao' ? 'MÃO!' : e.side === 0 ? 'GOL' : 'GOL DELES', 'ball'];
  if (e.kind === 'card') return ['card', 'CARTA', 'card'];
  if (e.kind === 'counter') return ['card', 'CONTRA-GOLPE', 'bolt'];
  if (e.kind === 'combo') return ['card', 'COMBO', 'star'];
  if (e.kind === 'coach' || e.coach || /estilo |Prancheta de /.test(all)) return ['coach', 'TÉCNICO', 'coach'];
  if (RELIC_RX.test(all)) return ['relic', 'RELÍQUIA', 'gem'];
  if (e.kind === 'ambient') return ['amb', '', ''];
  if (e.kind === 'build') return ['build', '', 'arrow'];
  if (e.kind === 'info' || e.kind === 'half' || e.kind === 'end') return ['info', '', 'whistle'];
  const rk = resultKind(e), icn = rk === 'save' ? 'shield' : rk === 'post' ? 'post' : 'miss';
  return [e.hl ? 'hl' : '', '', icn];
}
function pushFeed(e) {
  const feed = $('#feed'); if (!feed) return;
  const d = document.createElement('div');
  const [cls, badge, icn] = feedClass(e);
  d.className = 'fe ' + cls;
  d.innerHTML = `<span class="m">${e.min}'</span><span class="ic">${icn === 'ball' ? ballSvg('ico') : icn ? ic(icn) : '·'}</span><span>${badge ? `<b class="badge">${badge}</b>` : ''}${esc(e.text)}${e.sub ? `<span class="sub">${esc(e.sub)}</span>` : ''}</span>`;
  feed.prepend(d);
  feed.scrollTop = 0;
  while (feed.children.length > 120) feed.lastChild.remove();
}
function goalFx(e) {
  const fx = document.createElement('div');
  const mine = (G.match && G.match.pvp && G.cup) ? e.side === G.cup.role : e.side === 0;
  fx.className = 'goalfx ' + (e.gtype === 'mao' ? 'mao' : mine ? '' : 'rival');
  const title = e.gtype === 'mao' ? '✋ LA MANO<br>DE DIOS' : mine ? (e.value > 1 ? `GOOOL!<br>+${e.value}` : 'GOOOL!') : 'GOL DELES';
  const sub = e.gtype === 'mao' ? 'O juiz valida o gol irregular!' : (e.label && mine && e.label !== 'GOOOL!' ? e.label + ' ' : '') + (e.scorer || '') + (e.sub ? ' · ' + e.sub : '');
  const hold = G.speed > 1;
  fx.innerHTML = `<div class="gt">${title}<small>${esc(sub)}</small></div>${hold ? '<button class="tapgo" data-act="tapgo">Toque para continuar</button>' : ''}`;
  if (hold) fx.classList.add('hold');
  document.body.appendChild(fx);
  if (!hold) setTimeout(() => fx.remove(), 1700);
  const p = $('#pitch'); if (p) { p.classList.remove('flash', 'shake'); void p.offsetWidth; p.classList.add(mine ? 'flash' : 'shake'); }
  const sc = $('#sc'); if (sc) { sc.classList.remove('bump'); void sc.offsetWidth; sc.classList.add('bump'); }
  if (mine) celebrateFx([myKit(G.run)[0], myKit(G.run)[1], '#c6ff3d', '#ffffff', '#ffc83d']);
  if (navigator.vibrate && mine) try { navigator.vibrate([30, 40, 60]); } catch (er) { /* sem vibração */ }
}
// ritmo (ms no 1x): partida de ~60-75 s no 1x
const PACE = { minute: 195, ambient: 1000, build: 900, result: 1150, goal: 2200, info: 850, card: 1200 };
function resultKind(e) {
  if (e.kind === 'goal') return 'goal';
  if (/TRAVE|travessão/.test(e.text)) return 'post';
  if (/Defesa|defesa|espalma|milagre|voa|pega o pênalti|PAREDÃO|travado|nas mãos/.test(e.text)) return 'save';
  return 'miss';
}
function enqueue(evs) {
  const m = G.match;
  for (const e of evs) {
    if (e.kind === 'decision') { G.queue.push({ t: 'decision' }); continue; }
    if ((e.kind === 'lance' || e.kind === 'goal') && e.gtype !== 'mao') {
      G.queue.push({ t: 'build', side: e.side, min: e.min, who: e.scorer && !/^o /.test(e.scorer) ? e.scorer : null });
      G.queue.push({ t: 'event', e });
    } else G.queue.push({ t: 'event', e });
  }
  if (!m.pvp && !evs.length && m.minute > 1 && m.minute < 90 && Math.random() < 0.14) {
    const side = Math.random() < 0.55 ? SIM.poss : 1 - SIM.poss;
    G.queue.push({ t: 'ambient', side, min: m.minute });
  }
}
function setClock(min) { const c = $('#clk'); if (c) c.textContent = `${min}'`; const p = $('#prog'); if (p) p.style.width = Math.min(100, min / 90 * 100) + '%'; }
function tick() {
  const m = G.match;
  if (!m || G.screen !== 'match') return;
  const sp = G.speed;
  if (!G.queue.length) {
    if (m.done) { G.timer = setTimeout(endMatch, 1400 / sp); return; }
    enqueue(E.stepMatch(m));
    setClock(m.minute);
    if (m.minute === 46) setPoss(1);
    if (m.minute % 3 === 0) drawMomentum();
    if (!G.queue.length) { G.timer = setTimeout(tick, PACE.minute / sp); return; }
  }
  const it = G.queue.shift();
  let wait = PACE.minute;
  if (it.t === 'decision') { G.timer = setTimeout(showDecision, 300 / sp); return; }
  if (it.t === 'ambient') {
    const kind = Math.random() < 0.18 ? 'geral' : it.side === 0 ? 'mine' : 'opp';
    setPoss(it.side, false); G.mst.poss[it.side] += 1; addMom(it.side, it.min, 0.3);
    pushFeed({ min: it.min, kind: 'ambient', text: narr(kind, it.side) }); wait = PACE.ambient;
  } else if (it.t === 'build') {
    setPoss(it.side, true); G.mst.poss[it.side] += 1.5; addMom(it.side, it.min, 0.7);
    pushFeed({ min: it.min, kind: 'build', text: narr('build' + it.side, it.side, it.who) }); wait = PACE.build;
    if (window.FFAudio && it.side === 0) FFAudio.crowdSwell(0.06);
  } else {
    const e = it.e;
    if (e.kind === 'counter' || e.kind === 'combo') { flashBanner(e); if (window.FFAudio) { if (e.kind === 'combo') FFAudio.combo(); else FFAudio.counter(); } }
    if (window.FFAudio) {
      if (e.kind === 'goal') { if (e.side === 0) FFAudio.goal(); else FFAudio.concede(); }
      else if (e.kind === 'lance' && /TRAVE|travessão/i.test(e.text || '')) FFAudio.post();
      else if (e.kind === 'lance') { FFAudio.kick(); if (/fora|cima|bloqueia|Fraquinho|Defesa|espelma|milagre/i.test(e.text || '')) FFAudio.uuh(); }
      else if (e.kind === 'card') FFAudio.playCard();
      else if (e.kind === 'half') FFAudio.whistle('half');
      else if (e.kind === 'end') FFAudio.whistle('full');
    }
    pushFeed(e);
    let hold = false;
    if (e.epic) {
      if (e.kind === 'goal') { G.shownScore[e.side] += e.value; G.goalMarks.push({ side: e.side, min: e.min }); addMom(e.side, e.min, 2.5); G.mst.shots[e.side]++; }
      else { G.mst.shots[e.side]++; G.mst.saves[1 - e.side]++; addMom(1 - e.side, e.min, 1.5); }
      wait = epicFx(e, sp) * sp;
      if (sp > 1) hold = true;
    } else if (e.kind === 'goal') {
      G.shownScore[e.side] += e.value; G.goalMarks.push({ side: e.side, min: e.min }); addMom(e.side, e.min, 2);
      if (e.gtype !== 'mao') G.mst.shots[e.side]++;
      shoot(e.side, 'goal');
      if (sp > 1) {
        setTimeout(() => { if (G.screen === 'match') { SIM.celebrate = e.side; goalFx(e); } }, 160);
        hold = true;
      } else {
        setTimeout(() => { SIM.celebrate = e.side; goalFx(e); }, 250 / sp);
        setTimeout(() => { SIM.celebrate = -1; SIM.ball.x = 50; SIM.ball.y = 50; setPoss(1 - e.side); }, PACE.goal / sp);
      }
      wait = PACE.goal;
    } else if (e.kind === 'lance') {
      const k = resultKind(e); shoot(e.side, k);
      G.mst.shots[e.side]++; if (k === 'save') G.mst.saves[1 - e.side]++; addMom(e.side, e.min, e.hl ? 1.4 : 1);
      setTimeout(() => { if (G.screen === 'match') { const gkTok = SIM.toks.find(t => t.side === 1 - e.side && t.i === 0); SIM.poss = 1 - e.side; SIM.holder = gkTok; SIM.shot = null; SIM.passAt = performance.now() + 700 / sp; } }, 700 / sp);
      wait = PACE.result;
    } else if (e.kind === 'card') wait = PACE.card;
    else if (e.kind === 'half') { SIM.ball.x = 50; SIM.ball.y = 50; wait = PACE.info; }
    else wait = PACE.info;
    if ((e.kind === 'counter' || e.kind === 'combo') && sp > 1) hold = true;
    const sc = $('#sc'); if (sc) sc.innerHTML = `${G.shownScore[0]}<i>:</i>${G.shownScore[1]}`;
    setClock(e.min);
    updateFx(); drawMomentum(); drawStats();
    if (hold) { G.held = true; return; }
  }
  G.timer = setTimeout(tick, wait / sp);
}
const DEC_SECS = 20;
function showDecision() {
  if (G.match && G.match.pvp) return showPvpDecision();
  G.hand = [];
  const box = document.createElement('div'); box.className = 'sheet'; box.id = 'decision';
  box.innerHTML = `<div class="inner" id="dinn" role="dialog" aria-label="Momento decisivo"></div>`;
  document.body.appendChild(box);
  paintDecision();
  showTip('decision');
  if (G.speed > 1) return;
  const C = 2 * Math.PI * 18;
  let left = DEC_SECS * 10;
  G.decT = setInterval(() => {
    if (!document.body.contains(box)) { clearInterval(G.decT); return; }
    if (document.querySelector('.tip') || document.querySelector('.modal')) return;
    left--;
    const r = $('#dring'), s = $('#dsec');
    if (r) r.setAttribute('stroke-dashoffset', String(C * (1 - left / (DEC_SECS * 10))));
    if (s) s.textContent = Math.ceil(left / 10);
    if (left <= 0) { clearInterval(G.decT); useCard(G.hand.length ? G.hand.slice() : ''); toast(G.hand.length ? 'Tempo esgotado: cartas escolhidas entram' : 'Tempo esgotado: cartas guardadas'); }
  }, 100);
}
function paintDecision() {
  const inn = $('#dinn'); if (!inn || !G.match) return;
  const m = G.match, run = G.run, spent = (G.hand || []).reduce((s, id) => s + E.CARDS[id].cost, 0);
  const left = m.nrgLeft - spent;
  const focus = G.hand.length ? G.hand[G.hand.length - 1] : (run.cards.find(c => m.used.indexOf(c) < 0) || run.cards[0]);
  const d = focus && E.CARDS[focus];
  const t = d && E.CARD_TYPES[d.tipo];
  const opp = m.fxOpp && m.fxOpp.style && m.minute <= m.fxOpp.styleUntil ? m.fxOpp.style : null;
  const beat = opp && Object.keys(E.BEATS).find(k => E.BEATS[k] === opp);
  inn.innerHTML = `<div class="grab"></div>
    <div class="dhead">${ic('pause')}<div><div class="eyebrow g">${m.minute}' · ${G.shownScore[0]} x ${G.shownScore[1]}</div><div class="t">Energia ${nrgPips(Math.max(0, left), m.nrgMax || 3)}</div></div>
    ${G.speed > 1 ? '<div class="tapnote">Toque para continuar</div>' : `<div class="dtimer"><svg viewBox="0 0 44 44"><circle cx="22" cy="22" r="18" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="4"/><circle id="dring" cx="22" cy="22" r="18" fill="none" stroke="#ffc83d" stroke-width="4" stroke-linecap="round" stroke-dasharray="${2 * Math.PI * 18}" stroke-dashoffset="0"/></svg><b id="dsec">${DEC_SECS}</b></div>`}</div>
    <div class="dctx">Toque pra marcar. Dá pra jogar várias se a energia alcançar. Sem escolha, a carta fica guardada.</div>
    ${opp ? `<p class="xs">Rival está em <b>${esc(E.STYLE_NAME[opp])}</b>. ${beat ? esc(E.STYLE_NAME[beat]) + ' dá CONTRA-GOLPE!' : ''}</p>` : ''}
    <div class="dcards">${run.cards.map(c => {
      const on = G.hand.indexOf(c) >= 0, used = m.used.indexOf(c) >= 0, afford = !used && (on || E.CARDS[c].cost <= left);
      return cardFace(c, run, { act: afford ? 'queue' : '', on, dim: !afford, btn: true });
    }).join('')}</div>
    ${d ? `<p class="small"><b>${typeMark(d.tipo)} ${esc(d.nome)}</b> · ${esc(E.cardText(focus, E.cardLevel(run, focus)))}</p><p class="xs" style="color:var(--gold)">Melhor quando: ${esc(d.tip)}</p>${chanceBars(focus)}` : ''}
    <button class="btn shine" style="margin-top:8px" data-act="usecard" data-c="go">${G.hand.length ? 'Jogar ' + G.hand.length + ' carta' + (G.hand.length > 1 ? 's' : '') : 'Escolha uma carta'}</button>
    <button class="btn sec" style="margin-top:8px" data-act="usecard" data-c="">${ic('arrow')} Guardar e seguir</button>`;
}
function toggleHand(id) {
  G.hand = G.hand || [];
  const i = G.hand.indexOf(id);
  if (i >= 0) G.hand.splice(i, 1);
  else G.hand.push(id);
  paintDecision();
}
function useCard(c) {
  clearInterval(G.decT);
  const d = $('#decision'); if (d) d.remove();
  document.querySelectorAll('.tip').forEach(x => x.remove());
  const ids = c === 'go' ? (G.hand || []).slice() : (Array.isArray(c) ? c : (c ? [c] : []));
  const evs = E.playCards(G.match, ids);
  evs.forEach(e => G.queue.push({ t: 'event', e }));
  G.hand = [];
  G.timer = setTimeout(tick, 300 / G.speed);
}
function flashBanner(e) {
  const d = document.createElement('div');
  const hold = G.speed > 1;
  d.className = 'banner ' + (e.kind === 'combo' ? 'combo' : 'golpe') + (hold ? ' hold' : '');
  d.innerHTML = `<b>${e.kind === 'combo' ? 'COMBO' : 'CONTRA-GOLPE!'}</b><span>${esc(e.text)}</span>${hold ? '<button class="tapgo" data-act="tapgo">Toque para continuar</button>' : ''}`;
  document.body.appendChild(d);
  if (!hold) setTimeout(() => d.remove(), 1700);
}
function showWalkout() {
  const run = G.run, m = G.match; if (!run || !m || RM()) return;
  const d = document.createElement('div'); d.className = 'walkout';
  d.innerHTML = `<div class="wk"><div class="eyebrow">Entrada em campo</div><b>${esc(selOf(run).curto)}</b><i>x</i><b>${esc(oppShort(m.opp))}</b><small>${esc(run.careerLabel || (E.STAGES[m.stage] && E.STAGES[m.stage].nome) || '')}</small></div>`;
  document.body.appendChild(d);
  if (window.FFAudio) FFAudio.whistle('kick');
  setTimeout(() => d.remove(), 1200);
}
function endMatch() {
  SIM.on = false;
  if (window.FFAudio) FFAudio.crowdStop();
  if (G.match && G.match.pvp) return endPvp();
  if (G.run && G.run.careerMatch) {
    const m = G.match, gf = m.score[0], ga = m.score[1];
    const outcome = gf > ga ? 'W' : gf < ga ? 'L' : 'D';
    G.careerPending = { gf, ga };
    G.result = { outcome, gf, ga, pens: null, fichas: [], ganho: 0, why: [`Placar do jogo decisivo: ${gf} a ${ga}.`], groupMsg: '', reward: false, shop: false, status: 'playing', stage: m.stage, mGoals: (m.goals || []).slice(), epics: (m.epics || []).slice(), weather: m.weather, used: (m.used || []).slice(), career: true };
    if (G.run.careerKo && gf === ga && window.FFCareer && FFCareer.peekPens) {
      const peek = FFCareer.peekPens(G.career);
      if (peek) {
        G.result.outcome = peek.ourWin ? 'W' : 'L';
        G.result.pens = { kicks: peek.kicks, score: peek.score, win: peek.ourWin };
        const foe = G.run.careerFoeId ? FFCareer.clubOf(G.run.careerFoeId).curto : oppShort(m.opp);
        return showShootout({ kicks: peek.kicks, leftName: selOf(G.run).curto, rightName: foe, onDone: () => go('result') });
      }
    }
    return go('result');
  }
  G.result = E.finishMatch(G.run, G.match);
  if (G.run && G.run.cupRole != null && G.run.status === 'eliminated' && G.run.stage < 6) { finalizeRun(); return go('caiu'); }
  if (G.run.status !== 'playing') finalizeRun();
  if (G.result.pens && G.result.pens.kicks && G.result.pens.kicks.length) {
    return showShootout({ kicks: G.result.pens.kicks, leftName: selOf(G.run).curto, rightName: oppShort(G.match.opp), onDone: () => go('result') });
  }
  go('result');
}
function showShootout(opts) {
  document.querySelectorAll('.penshoot').forEach(x => x.remove());
  const kicks = opts.kicks || [];
  const box = document.createElement('div');
  box.className = 'penshoot';
  box.innerHTML = `<div class="penstage">
    <div class="penhead"><b>${esc(opts.leftName || 'Nós')}</b><span id="pensc">0 × 0</span><b>${esc(opts.rightName || 'Eles')}</b></div>
    <div class="pendots" id="pendots"></div>
    <div class="penpitch"><div class="pengoal"></div><div class="penkeeper" id="penk"></div><div class="penball" id="penb"></div><div class="pentaker" id="pent"></div></div>
    <div class="penwho" id="penwho"></div>
    <p class="xs mut" id="pensudden"></p>
    <button class="btn sec" data-act="penskip">Pular cobranças</button>
  </div>`;
  document.body.appendChild(box);
  let i = 0, us = 0, them = 0, timer = null, dead = false;
  const dots = [[], []];
  const paint = () => {
    const sc = $('#pensc'), dd = $('#pendots');
    if (sc) sc.textContent = us + ' × ' + them;
    if (dd) dd.innerHTML = `<span>${dots[0].map(ok => ok ? '●' : '○').join(' ')}</span><i></i><span>${dots[1].map(ok => ok ? '●' : '○').join(' ')}</span>`;
    const sud = $('#pensudden');
    if (sud) sud.textContent = dots[0].length > 5 && dots[0].length === dots[1].length ? 'Morte súbita' : '';
  };
  const finish = () => { dead = true; clearTimeout(timer); box.remove(); G.penSkip = null; if (opts.onDone) opts.onDone(); };
  G.penSkip = finish;
  const showKick = (k) => {
    const who = $('#penwho'), ball = $('#penb'), taker = $('#pent'), keeper = $('#penk');
    if (who) who.innerHTML = `<b>${esc(k.nome)}</b><small>${k.side === 0 ? esc(opts.leftName || '') : esc(opts.rightName || '')} · ${esc(k.keeper || 'goleiro na trave')}</small>`;
    if (keeper) keeper.className = 'penkeeper';
    if (taker) taker.className = 'pentaker ' + (k.side === 0 ? 'l' : 'r');
    if (ball) { ball.className = 'penball'; void ball.offsetWidth; ball.classList.add('go', k.ok ? 'in' : 'miss'); }
    if (taker) { void taker.offsetWidth; taker.classList.add('go'); }
    if (keeper) keeper.classList.add(k.ok ? 'beat' : 'save');
  };
  const step = () => {
    if (dead) return;
    if (opts.pauseAt != null && i >= opts.pauseAt) { paint(); return; }
    if (i >= kicks.length) { timer = setTimeout(finish, 640); return; }
    const k = kicks[i++];
    showKick(k);
    timer = setTimeout(() => {
      if (dead) return;
      if (k.ok) { if (k.side === 0) us++; else them++; }
      dots[k.side].push(!!k.ok);
      paint();
      timer = setTimeout(step, 380);
    }, 720);
  };
  if (opts.pauseAt > 0) {
    while (i < opts.pauseAt && i < kicks.length) {
      const k = kicks[i++];
      if (k.ok) { if (k.side === 0) us++; else them++; }
      dots[k.side].push(!!k.ok);
    }
    paint();
    if (i < kicks.length) showKick(kicks[i]);
    return;
  }
  paint();
  step();
}

// ---------- resultado ----------
function renderResult() {
  const r = G.result, m = G.match;
  const pvp = !!(m && m.pvp && G.cup);
  const role = pvp ? G.cup.role : 0;
  const run = pvp ? (role === 0 ? m.run : m.away) : G.run;
  const oppFlag = pvp && role === 1 ? E.SELECOES[m.run.selecao].flag : m.opp.flag;
  const kicks = (r.pens && r.pens.kicks) || [];
  const pscore = r.pens && r.pens.score ? (role === 0 ? r.pens.score : [r.pens.score[1], r.pens.score[0]]) : null;
  const title = r.pens ? (r.outcome === 'W' ? 'Nos pênaltis!' : 'Caiu nos pênaltis') : { W: 'Vitória!', D: 'Empate', L: 'Derrota' }[r.outcome];
  const pk = (k, mine) => `<span class="pk ${k.ok ? 'ok' : 'no'} ${mine && k.coach ? 'c' : ''}" title="${esc(k.nome || '')}">${k.ok ? '✓' : '✕'}</span>`;
  const pens = pscore ? `<div class="panel"><div class="ph">${ic('target')} Pênaltis <span class="r disp" style="color:#fff">${pscore[0]} x ${pscore[1]}</span></div>
     <div class="pens"><span style="font-size:22px">${selOf(run).flag}</span><div>${kicks.filter(k => k.side === role).map(k => pk(k, true)).join('')}</div><span style="font-size:22px">${oppFlag}</span><div>${kicks.filter(k => k.side !== role).map(k => pk(k)).join('')}</div></div>
     ${kicks.some(k => k.coach) ? `<div class="xs mut" style="margin-top:6px">Contorno azul = cobrança salva pela Mentalidade do técnico.</div>` : ''}</div>` : '';
  const goals = (r.mGoals || []).map(g => `<div class="gl"><span class="m">${g.min}'</span><span>${ballSvg('ico')}</span><span><b style="color:${g.side === role ? '#fff' : '#ff9a9d'}">${esc(g.scorer)}</b> ${g.type === 'mao' ? '<span class="mut">(mão!)</span>' : g.value > 1 ? `<span style="color:var(--gold)">(vale ${g.value})</span>` : ''}</span></div>`).join('');
  const next = r.career ? ['Voltar à temporada', 'gold'] : r.status === 'playing' ? (r.reward ? [ic('gift') + ' Abrir pacote', ''] : r.shop ? [ic('hanger') + ' Ir pro Vestiário', ''] : [ic('play') + ' Continuar', '']) : [ic('trophy') + ' Ver o veredito', 'gold'];
  app.innerHTML = `${topbar(run)}
    <div class="reshero"><div class="eyebrow">${esc((run && run.careerLabel) || E.STAGES[r.stage].nome)}</div><div class="big ${r.outcome}">${title}</div></div>
    <div class="resscore"><span class="f">${selOf(run).flag}</span><span class="s">${r.gf} <span class="mut" style="font-size:34px">x</span> ${r.ga}</span><span class="f">${oppFlag}</span></div>
    ${r.groupMsg ? `<p style="text-align:center;font-weight:800;margin:4px 0 10px">${esc(r.groupMsg)}</p>` : ''}
    ${pens}
    <div class="panel"><div class="ph">${ic('whistle')} Por que ${r.outcome === 'W' ? 'você ganhou' : r.outcome === 'L' ? 'você perdeu' : 'empatou'}</div><ul class="why">${r.why.map(w => `<li>${ic('check')}<span>${esc(w)}</span></li>`).join('')}</ul></div>
    ${r.epics && r.epics.length ? `<div class="panel epicp"><div class="ph">⚡ Card de lance épico <span class="r">${r.epics.length > 1 ? r.epics.length + ' lances' : 'replay'}</span></div>
      ${r.epics.length > 1 ? `<div class="pages">${r.epics.map((e, i) => `<button class="${i === (G.epicIdx || 0) ? 'on' : ''}" data-act="epicSel" data-i="${i}">${e.icon} ${esc(e.nome)}</button>`).join('')}</div>` : ''}
      ${epicCanvasHtml(Math.min(G.epicIdx || 0, r.epics.length - 1))}<button class="btn gold" style="margin-top:10px" data-act="epicPng" data-i="${Math.min(G.epicIdx || 0, r.epics.length - 1)}">${ic('share')} Baixar card do lance (PNG)</button></div>` : ''}
    ${goals ? `<div class="panel"><div class="ph">${ballSvg('ico')} Gols</div>${goals}</div>` : ''}
    ${r.career ? '' : `<div class="panel"><div class="ph">${ic('coin')} Fichas ganhas</div>${r.fichas.map(f => `<div class="fline"><span>${esc(f.label)}</span><b>+${f.v}</b></div>`).join('') || '<div class="small mut">Nenhuma desta vez.</div>'}<div class="fline t"><span>Total</span><b style="font-size:18px">+${r.ganho} ${ic('coin')}</b></div></div>`}
    <div class="mctrl"><button class="btn ${next[1]} shine" data-act="afterResult">${next[0]}</button></div>`;
  const f = $('#fichas'); if (f && r.ganho > 0) { f.classList.add('bump'); }
  if (r.epics && r.epics.length) startEpicCanvases(r.epics.map(e => ({ ...e, seed: run.seed })));
}
function afterResult() {
  const r = G.result; G.epicIdx = 0;
  if (r && r.career && G.career && G.careerPending) {
    const before = G.career.seasons || 0;
    const back = FFCareer.applyLive(G.career, G.careerPending.gf, G.careerPending.ga);
    noteSeasons(before);
    FFCareer.persist(G.career);
    G.careerPending = null;
    if (back.msg) toast(back.msg);
    return go(back.screen || 'carHub');
  }
  if (G.run.status !== 'playing') return go('verdict');
  if (r.reward) { G.offers = E.genRewards(G.run); G.packOpen = false; return go('reward'); }
  if (r.shop) { G.shop = E.genShop(G.run); return go('shop'); }
  go('hub');
}

// ---------- recompensas / loja ----------
function offerHtml(it, i, act, price, flip) {
  const can = price == null || G.run.fichas >= price;
  const priceHtml = price != null ? `<span class="price">${price} ${ic('coin')}</span>` : '';
  const anim = flip ? `flip" style="animation-delay:${i * 0.28}s;` : '" style="';
  if (it.type === 'player') {
    const p = it.player;
    const tg = E.needsTarget(G.run, it);
    const worst = tg.map(x => G.run.players[x]).sort((a, b) => a.rating - b.rating)[0];
    const diff = p.rating - worst.rating;
    const rar = p.rating >= 85 ? 'lendaria' : p.rating >= 78 ? 'rara' : p.rating >= 70 ? 'incomum' : 'comum';
    return `<div class="offer ${rar} ${it.sold ? 'sold' : ''} ${can ? '' : 'cant'} ${anim}--rc:${rc(rar)}" data-act="${act}" data-i="${i}" role="button" tabindex="0">
      ${futCard(p, { kit: selOf(G.run).kit })}<div><div class="ot">Jogador · ${esc(p.era)}</div><div class="on">${esc(p.nome)}</div>
      <div class="od">${p.pos}${p.traits ? ' · ' + p.traits.split('').map(t => TRAIT_FULL[t]).join(', ') : ''}</div>
      <span class="up ${diff > 0 ? 'p' : 'n'}">${diff > 0 ? '▲ +' + diff : '▼ ' + diff} vs ${esc(worst.nome)} (${worst.rating})</span></div>${priceHtml}${it.sold ? '<span class="soldtag">VENDIDO</span>' : ''}</div>`;
  }
  if (it.type === 'card') {
    const d = E.CARDS[it.id], t = E.CARD_TYPES[d.tipo];
    const owned = G.run.cards.indexOf(it.id) >= 0;
    const lv = E.cardLevel(G.run, it.id);
    const showLv = owned ? Math.min(3, lv + 1) : 1;
    return `<div class="offer cardoffer ${d.rar} ${it.sold ? 'sold' : ''} ${can ? '' : 'cant'} ${anim}--rc:${t.cor}" data-act="${act}" data-i="${i}" role="button" tabindex="0">
      <div class="offercard">${cardFace(it.id, G.run, { btn: false, lv: showLv, compact: true })}</div>
      <div><div class="ot">${typeMark(d.tipo)} ${t.nome} · ${owned ? 'sobe para Nv' + showLv : 'Nv1'} · ${boltSvg()}${d.cost}</div>
      <div class="on">${esc(d.nome)}</div>
      <div class="od">${esc(E.cardText(it.id, showLv))}</div>
      <div class="xs" style="color:var(--gold);margin-top:4px">Melhor quando: ${esc(d.tip)}</div></div>${priceHtml}${it.sold ? '<span class="soldtag">VENDIDO</span>' : ''}</div>`;
  }
  const d = E.RELICS[it.id];
  return `<div class="offer ${d.rar} ${it.sold ? 'sold' : ''} ${can ? '' : 'cant'} ${anim}--rc:${rc(d.rar)}" data-act="${act}" data-i="${i}" role="button" tabindex="0">
    <span class="med plate" style="--tc:${rc(d.rar)}" aria-hidden="true">${markSvg(it.id)}</span><div><div class="ot">Relíquia · ${E.RARITIES[d.rar].nome}</div><div class="on">${esc(d.nome)}</div><div class="od">${esc(d.desc)}</div></div>${priceHtml}${it.sold ? '<span class="soldtag">VENDIDO</span>' : ''}</div>`;
}
function renderReward() {
  const run = G.run;
  const cost = E.rerollRewardsCost(run);
  if (!G.packOpen) {
    app.innerHTML = `${topbar(run)}<h2 class="ttl">${ic('gift')} Pacote da vitória</h2><p class="sub">Toque no pacote pra abrir. Dentro tem 3 itens e você fica com 1.</p>
    <div class="packwrap"><button class="pack" data-act="openPack" aria-label="Abrir pacote"><span class="pi">${ic('star')}<b>Fominha<br>Pack</b><small>3 itens · escolha 1</small></span></button></div>
    <div class="xs mut" style="text-align:center;margin-top:8px">Raridade: <span style="color:var(--r-comum)">● Comum</span> <span style="color:var(--r-incomum)">● Incomum</span> <span style="color:var(--r-rara)">● Rara</span> <span style="color:var(--r-lendaria)">● Lendária</span></div>
    ${invPanels(run)}`;
    showTip('reward');
    return;
  }
  const flip = G.flipNow && !RM(); G.flipNow = false;
  app.innerHTML = `${topbar(run)}<h2 class="ttl">${ic('gift')} Escolha 1</h2><p class="sub">Jogador entra no lugar do pior da mesma posição (ou você escolhe quem sai).</p>
  <div class="offers">${G.offers.map((it, i) => offerHtml(it, i, 'takeReward', null, flip)).join('')}</div>
  <div class="row" style="margin-top:14px"><button class="btn sec stack" data-act="rerollReward" ${run.fichas < cost ? 'disabled' : ''}><span>${ic('dice')} Re-sortear</span><small>custa ${cost} fichas</small></button><button class="btn sec stack" data-act="skipReward"><span>Pular</span><small>ganha +1 ficha</small></button></div>
  ${invPanels(run)}`;
}
function askTarget(it, done) {
  const run = G.run;
  const opts = E.needsTarget(run, it);
  if (!opts) return done(undefined);
  if (it.type === 'player' && opts.length === 1) return done(opts[0]);
  const m = document.createElement('div'); m.className = 'modal';
  let title, list;
  if (it.type === 'player') { title = `Quem sai pra entrar ${esc(it.player.nome)} (${it.player.rating})?`; list = opts.map(i => { const p = run.players[i]; return `<div class="opt" data-t="${i}">${futCard(p, { size: 'sm', kit: selOf(run).kit })}<div><b>${esc(p.nome)}</b><div class="xs mut">${p.pos} · nota ${p.rating}</div></div><span style="margin-left:auto;color:var(--lime);font-weight:900">+${it.player.rating - p.rating}</span></div>`; }); }
  else if (it.type === 'card') { title = `Mão cheia (${E.MAX_CARDS}). Qual carta sai?`; list = opts.map(c => `<div class="opt" data-t="${c}">${cardFace(c, run, { btn: false })}<div class="xs mut" style="margin-top:4px">${esc(E.cardText(c, E.cardLevel(run, c)))}</div></div>`); }
  else { title = `Relíquias cheias (${E.MAX_RELICS}). Qual sai?`; list = opts.map(r => `<div class="opt" data-t="${r}"><span class="med plate" style="--tc:${rc(E.RELICS[r].rar)}">${markSvg(r)}</span><div><b>${esc(E.RELICS[r].nome)}</b><div class="xs mut">${esc(E.RELICS[r].desc)}</div></div></div>`); }
  m.innerHTML = `<div class="box"><h3>${title}</h3>${list.join('')}<button class="btn sec" style="margin-top:8px" data-x="1">Cancelar</button></div>`;
  m.addEventListener('click', ev => {
    const o = ev.target.closest('[data-t]'); const x = ev.target.closest('[data-x]') || ev.target === m;
    if (o) { m.remove(); const t = o.dataset.t; done(it.type === 'player' ? +t : t); }
    else if (x) m.remove();
  });
  document.body.appendChild(m);
}
function describeTake(it) {
  if (it.type === 'player') return `${it.player.nome} chegou!`;
  if (it.type === 'card') { const lv = E.cardLevel(G.run, it.id); return E.CARDS[it.id].nome + (lv > 1 ? ` agora é Nv${lv}!` : ' é sua!'); }
  return E.RELICS[it.id].nome + ' é sua!';
}
function takeReward(i) {
  const it = G.offers[i];
  askTarget(it, t => {
    E.applyItem(G.run, it, t); M.albumCollect(G.store, G.run.players); saveStore();
    toast('✅ ' + describeTake(it));
    if (G.result && G.result.shop) { G.shop = E.genShop(G.run); go('shop'); } else go('hub');
  });
}
function renderShop() {
  const run = G.run;
  const cost = E.rerollShopCost(run);
  app.innerHTML = `${topbar(run)}
  <div class="shopsign">${ic('hanger')}<div><div class="disp" style="font-size:22px;font-style:italic;text-transform:uppercase">Vestiário</div><div class="xs mut">Guardar Fichas rende juros: +1 a cada 5 (máx +${E.maxInterest(run)})</div></div></div>
  <div class="offers">${G.shop.map((it, i) => offerHtml(it, i, 'buy', it.price)).join('')}</div>
  <button class="btn sec" style="margin-top:12px" data-act="rerollShop" ${run.fichas < cost ? 'disabled' : ''}>${ic('dice')} Re-sortear vitrine <small>${cost} fichas</small></button>
  ${run.relics.length ? `<div class="panel"><div class="ph">${ic('coin')} Vender relíquia <span class="r">metade do preço</span></div>${run.relics.map(r => `<div class="sellrow" data-act="sell" data-id="${r}" role="button" tabindex="0" aria-label="Vender ${esc(E.RELICS[r].nome)}"><span class="med plate" style="--tc:${rc(E.RELICS[r].rar)}">${markSvg(r)}</span><b style="font-size:13.5px">${esc(E.RELICS[r].nome)}</b><span class="p chip coin">+${Math.floor(E.RELIC_PRICE[E.RELICS[r].rar] / 2)} ${ic('coin')}</span></div>`).join('')}</div>` : ''}
  ${invPanels(run)}
  <div class="mctrl"><button class="btn" data-act="leaveShop">${ic('play')} Sair do Vestiário</button></div>`;
}
function buy(i) {
  const it = G.shop[i];
  if (it.sold) return;
  if (G.run.fichas < it.price) return toast('Fichas insuficientes');
  askTarget(it, t => { if (E.buyItem(G.run, it, t)) { M.albumCollect(G.store, G.run.players); saveStore(); toast('🛒 ' + describeTake(it)); renderShop(); const f = $('#fichas'); if (f) f.classList.add('bump'); } });
}

// ---------- fim da run ----------
function finalizeRun() {
  const run = G.run, st = G.store;
  st.runs++;
  const pts = runPoints(run);
  const label = E.stageReachedLabel(run);
  const chegou = label === 'CAMPEÃO' ? 'Campeão' : label;
  if (run.status === 'champion') gc('copa-campeao', 'Campeão');
  else if (run.status === 'eliminated') gc('copa-eliminado', label);
  G.points = pts;
  G.prevRecord = st.record || 0;
  G.newRecord = pts.total > (st.record || 0);
  if (G.newRecord) st.record = pts.total;
  if (!st.best || pts.total > (st.best.points || 0)) st.best = { points: pts.total, label: chegou, selecao: selOf(run).nome, flag: selOf(run).flag, seed: run.seed, level: run.level };
  const entry = { ts: Date.now(), score: pts.total, flag: selOf(run).flag, sel: selOf(run).curto, chegou, seed: run.seed, level: run.level, daily: run.daily || null };
  st.ranking = (st.ranking || []).concat([entry]).sort((a, b) => b.score - a.score || a.ts - b.ts).slice(0, 20);
  G.rankEntry = entry.ts;
  G.rankPos = st.ranking.findIndex(x => x.ts === entry.ts) + 1;
  if (run.daily) {
    const d = st.daily[run.daily] || { best: null, tries: 0 };
    d.tries++; G.dailyBest = d.best == null || pts.total > d.best; if (G.dailyBest) d.best = pts.total;
    st.daily = { [run.daily]: d }; // guarda só o dia atual
  }
  G.unlockedNow = null;
  if (run.status === 'champion') {
    st.titles++;
    if (run.level >= st.unlocked && st.unlocked < E.MAX_PLAYABLE_LEVEL) { st.unlocked = run.level + 1; st.level = st.unlocked; G.unlockedNow = E.LEVELS[st.unlocked - 1]; }
  }
  G.metaRes = metaFinalize(run, pts.total);
  saveStore();
  G.verdict = E.verdict(run);
  G.verdict.points = pts.total; G.verdict.daily = run.daily || null;
}
function countUp(el, to) {
  if (!el) return;
  if (RM() || to <= 0) { el.textContent = fmtN(to); return; }
  const t0 = performance.now(), D = 1300;
  const f = now => { const k = Math.min(1, (now - t0) / D), e = 1 - Math.pow(1 - k, 3); el.textContent = fmtN(to * e); if (k < 1 && document.body.contains(el)) requestAnimationFrame(f); };
  requestAnimationFrame(f);
}
function renderVerdict() {
  const v = G.verdict, run = G.run, champ = run.status === 'champion', P = G.points || runPoints(run);
  const best = v.best ? `${v.best.gf} x ${v.best.ga} ${v.best.flag || ''}` : '—';
  const w = P.V, d = P.E, l = v.history.filter(h => h.outcome === 'L').length;
  const multTxt = '×' + P.mult.toFixed(2).replace('.', ',');
  if (v.points == null) v.points = P.total;
  app.innerHTML = `
  ${champ ? '<div class="trophy">🏆</div>' : ''}
  ${G.newRecord ? `<span class="newrec">${ic('star')} Novo recorde! ${ic('star')}</span>` : ''}
  <div class="scorebox"><div class="sl">PONTUAÇÃO DA CAMPANHA</div><div class="sv" id="pts">0</div>
    <div class="rankpos">${G.rankPos ? `${ic('rank')} ${G.rankPos}º no seu ranking local` : ''}${v.daily ? ' · desafio do dia' + (G.dailyBest ? ' (seu melhor hoje!)' : '') : ''}</div>
    <div class="formula num">
      <span>Vitórias ${w} × 100</span><b>${fmtN(w * 100)}</b>
      <span>Empates ${d} × 40</span><b>${fmtN(d * 40)}</b>
      <span>Gols pró ${P.gf} × 15</span><b>${fmtN(P.gf * 15)}</b>
      <span>Saldo ${P.saldo >= 0 ? '+' : ''}${P.saldo} × 10</span><b>${fmtN(P.saldo * 10)}</b>
      ${P.champ ? `<span>Bônus de campeão</span><b>+250</b>` : ''}
      <span>Nível ${run.level} (multiplicador)</span><b>${multTxt}</b>
      <span class="tot">Total</span><b class="tot" style="color:var(--lime)">${fmtN(P.total)}</b>
    </div>${!G.newRecord && G.prevRecord ? `<div class="xs mut" style="margin-top:6px">Seu recorde: ${fmtN(G.prevRecord)}</div>` : ''}</div>
  <div class="vcard ${champ ? '' : 'lose'} ${(G.store.cos || {}).mold || ''}" id="vcard" style="--c1:${v.selecao.cor}55">
    <div class="brand"><span>FOMINHA FC · COPA RELÂMPAGO</span><span style="color:var(--gold)">${v.daily ? '📅 DESAFIO ' + v.daily.slice(8, 10) + '/' + v.daily.slice(5, 7) : 'NÍVEL ' + v.level}</span></div>
    <div class="vsel"><span class="f">${v.selecao.flag}</span><div><div class="disp" style="font-size:21px;text-transform:uppercase;font-style:italic">${esc(v.selecao.nome)}</div><div class="small mut">Nível ${v.level} · ${esc(E.LEVELS[v.level - 1].nome)}</div></div></div>
    <div class="reach" style="color:${champ ? 'var(--gold)' : '#fff'}">${champ ? 'Campeão!' : esc(v.chegou)}</div>
    <div class="vt">“${esc(v.titulo)}”</div>
    <div class="vf">${esc(v.frase)}</div>
    ${v.coach ? `<div class="vcoach">${ovrBadge(slotsOVR(v.coach.slots))}<div style="min-width:0"><div style="font-weight:900;font-size:14px">${esc(v.coach.nome)} <span style="color:var(--gold)">“${esc(v.coach.titulo)}”</span></div><div class="vcatt">${E.COACH_ATTRS.map(a => `<span>${a.curto} <b>${v.coach.slots[a.id].rating}</b> ${esc(v.coach.slots[a.id].from)}</span>`).join('')}</div></div></div>` : ''}
    <div class="vgrid">
      <div><div class="k">Artilheiro</div><div class="v">${v.artilheiro ? `${esc(v.artilheiro.nome)} (${v.artilheiro.gols})` : 'Ninguém 😬'}</div></div>
      <div><div class="k">Placar mais bonito</div><div class="v">${best}</div></div>
      <div><div class="k">Campanha</div><div class="v">${w}V ${d}E ${l}D</div></div>
      <div><div class="k">Gols</div><div class="v">${v.gf} pró · ${v.ga} contra</div></div>
    </div>
    <div style="margin-top:10px"><div class="k eyebrow" style="font-size:9.5px">Relíquias</div><div class="relicline">${v.relics.length ? v.relics.map(r => `<span class="ri">${markSvg(r)} ${esc(E.RELICS[r].nome)}</span>`).join('') : 'Nenhuma: na raça!'}</div></div>
    <div class="vpath">${v.history.map(h => `<span class="${h.outcome}">${E.STAGES[h.stage].curto} ${h.flag} ${h.gf}-${h.ga}${h.pens ? ` (p ${h.pens[0]}-${h.pens[1]})` : ''}</span>`).join('')}</div>
    ${run.bolao && G.metaRes && G.metaRes.bolao ? `<div class="vbolao">🎯 Bolão: palpite <b>${esc(M.BOLAO[run.bolao.guess].nome)}</b> · chegou <b>${esc(M.BOLAO[G.metaRes.bolao.reach].nome)}</b> ${bolaoMark(G.metaRes.bolao)}</div>` : ''}
    <div class="vbottom"><div><small>SEMENTE PRO DESAFIO</small><b>${esc(v.seed)}</b></div><div class="sc"><small>PONTOS</small><b class="num">${fmtN(P.total)}</b></div></div>
  </div>
  ${metaVerdictHtml(G.metaRes, run)}
  ${G.unlockedNow ? `<div class="panel unlock">${ic('lock')} <b>Nível ${G.unlockedNow.n} · ${esc(G.unlockedNow.nome)} liberado!</b><div class="small mut">${esc(G.unlockedNow.desc)}</div></div>` : ''}
  <div style="display:flex;flex-direction:column;gap:12px;margin-top:14px">
    <button class="btn gold shine" data-act="share">${ic('share')} Compartilhar card</button>
    <button class="btn sec" data-act="duelLink">${ic('users')} ${G.cup && G.cup.status === 'off' ? 'Comparar por link <small>o ao vivo não conectou</small>' : 'Duelo: desafiar amigo <small>copia o link</small>'}</button>
    <button class="btn" data-act="again">${ic('play')} Jogar de novo</button>
    <div class="row"><button class="btn sec" data-act="sameSeed">${ic('dice')} Mesma semente</button><button class="btn sec" data-act="home">${ic('home')} Início</button></div>
  </div>`;
  countUp($('#pts'), P.total);
  if (G.metaRes && G.metaRes.duel && !RM()) setTimeout(() => confettiBurst(['#ffc83d', '#c6ff3d', '#fff'], G.metaRes.duel.w === 0 ? 30 : 0), 400);
}
const SITE = 'https://fominha-fc.github.io/';
function onPublishedSite() {
  try { return new URL(location.href).hostname === 'fominha-fc.github.io'; } catch (e) { return false; }
}
function pageUrl() {
  if (onPublishedSite()) return SITE;
  try { return location.href.split('#')[0]; } catch (e) { return SITE; }
}
function publicPath() {
  if (onPublishedSite()) return '/' + (location.search || '');
  return location.pathname + location.search;
}
function shareText(v) {
  return `⚡ Fominha FC · Copa Relâmpago${v.daily ? ' · Desafio do dia ' + v.daily.slice(8, 10) + '/' + v.daily.slice(5, 7) : ''}\n${v.selecao.flag} ${v.selecao.nome}: ${v.chegou === 'CAMPEÃO' ? '🏆 CAMPEÃO' : v.chegou} · ${fmtN(v.points || 0)} pts\n“${v.titulo}”: ${v.frase}\n${v.artilheiro ? `Artilheiro: ${v.artilheiro.nome} (${v.artilheiro.gols})\n` : ''}${v.coach ? `Técnico: ${v.coach.nome} (“${v.coach.titulo}”, OVR ${slotsOVR(v.coach.slots)})\n` : ''}Duvido você fazer mais pontos! Semente: ${v.seed} (nível ${v.level})\n${SITE}`;
}
async function copyText(t) {
  try { await navigator.clipboard.writeText(t); return true; } catch (e) {
    const ta = document.createElement('textarea'); ta.value = t; document.body.appendChild(ta); ta.select();
    let ok = false; try { ok = document.execCommand('copy'); } catch (e2) { /* sem cópia */ } ta.remove(); return ok;
  }
}
function wrapText(ctx, text, x, y, maxW, lh) {
  const words = text.split(' '); let line = '';
  for (const w of words) { const t = line ? line + ' ' + w : w; if (ctx.measureText(t).width > maxW && line) { ctx.fillText(line, x, y); y += lh; line = w; } else line = t; }
  if (line) ctx.fillText(line, x, y);
  return y + lh;
}
function rrect(x, X, Y, W, H, R) { x.beginPath(); x.moveTo(X + R, Y); x.arcTo(X + W, Y, X + W, Y + H, R); x.arcTo(X + W, Y + H, X, Y + H, R); x.arcTo(X, Y + H, X, Y, R); x.arcTo(X, Y, X + W, Y, R); x.closePath(); }
function drawCard(v) {
  const W = 1080, H = 1920, c = document.createElement('canvas'); c.width = W; c.height = H;
  const x = c.getContext('2d');
  const champ = v.chegou === 'CAMPEÃO';
  const F = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif', FE = F + ', "Noto Color Emoji", "Apple Color Emoji"';
  const g = x.createLinearGradient(0, 0, W, H); g.addColorStop(0, v.selecao.cor); g.addColorStop(.32, '#0f4a26'); g.addColorStop(1, '#04100a');
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  x.globalAlpha = .06; x.fillStyle = '#fff'; for (let i = 0; i < 12; i += 2) x.fillRect(0, i * 160, W, 160); x.globalAlpha = 1;
  x.strokeStyle = moldStroke(x, W, H, champ ? '#ffc83d' : '#6f9c84'); x.lineWidth = 14; rrect(x, 30, 30, W - 60, H - 60, 44); x.stroke();
  x.textAlign = 'center'; x.fillStyle = '#c6ff3d'; x.font = `900 40px ${F}`; x.fillText('FOMINHA FC · COPA RELÂMPAGO', W / 2, 120);
  if (v.daily) { x.fillStyle = '#ffc83d'; x.font = `900 34px ${FE}`; x.fillText(`📅 DESAFIO DO DIA ${v.daily.slice(8, 10)}/${v.daily.slice(5, 7)}`, W / 2, 172); }
  x.font = `170px ${FE}`; x.fillText(champ ? '🏆' : v.selecao.flag, W / 2, 360);
  x.fillStyle = '#fff'; x.font = `italic 900 68px ${F}`; x.fillText((champ ? v.selecao.flag + ' ' : '') + v.selecao.nome.toUpperCase(), W / 2, 455);
  if (v.coach) { x.fillStyle = '#8fcbff'; x.font = `800 36px ${F}`; x.fillText(`Técnico ${v.coach.nome} · OVR ${slotsOVR(v.coach.slots)} · “${v.coach.titulo}”`, W / 2, 515); }
  x.font = `italic 900 104px ${F}`; x.fillStyle = champ ? '#ffc83d' : '#fff';
  let y = wrapText(x, champ ? 'CAMPEÃO!' : v.chegou.toUpperCase(), W / 2, 630, W - 140, 108);
  x.fillStyle = '#ffc83d'; x.font = `900 52px ${F}`; x.fillText('“' + v.titulo + '”', W / 2, y + 6);
  x.fillStyle = '#e6f6ea'; x.font = `italic 500 40px ${F}`;
  y = wrapText(x, v.frase, W / 2, y + 80, W - 180, 54);
  y = Math.max(y + 10, 1000);
  const box = (bx, by, k, val) => { x.fillStyle = 'rgba(0,0,0,.35)'; rrect(x, bx, by, 470, 150, 24); x.fill(); x.fillStyle = '#9db5a6'; x.font = `900 28px ${F}`; x.textAlign = 'left'; x.fillText(k, bx + 28, by + 50); x.fillStyle = '#fff'; x.font = `900 40px ${FE}`; wrapText(x, val, bx + 28, by + 105, 420, 42); x.textAlign = 'center'; };
  const w = v.history.filter(h => h.outcome === 'W').length, d = v.history.filter(h => h.outcome === 'D').length, l = v.history.filter(h => h.outcome === 'L').length;
  box(60, y, 'ARTILHEIRO', v.artilheiro ? `${v.artilheiro.nome} (${v.artilheiro.gols})` : '—');
  box(550, y, 'PLACAR MAIS BONITO', v.best ? `${v.best.gf} x ${v.best.ga} ${v.best.opp.replace(/ \d{4}$/, '')}` : '—');
  box(60, y + 170, 'CAMPANHA', `${w}V ${d}E ${l}D`);
  box(550, y + 170, 'GOLS', `${v.gf} pró · ${v.ga} contra`);
  y += 400;
  x.fillStyle = '#9db5a6'; x.font = `900 28px ${F}`; x.fillText('RELÍQUIAS', W / 2, y);
  x.fillStyle = '#fff'; x.font = `700 36px ${FE}`;
  y = wrapText(x, v.relics.length ? v.relics.map(r => E.RELICS[r].nome).join(' · ') : 'Nenhuma: na raça!', W / 2, y + 50, W - 160, 48);
  x.font = `800 32px ${F}`; x.fillStyle = '#d6efd9';
  y = wrapText(x, v.history.map(h => `${E.STAGES[h.stage].curto} ${h.gf}-${h.ga}`).join('  ·  '), W / 2, Math.min(y + 16, H - 380), W - 160, 42);
  const extra = [];
  if (G.run && G.run.bolao && G.metaRes && G.metaRes.bolao) extra.push(`🎯 Bolão: palpite ${M.BOLAO[G.run.bolao.guess].nome} · chegou ${M.BOLAO[G.metaRes.bolao.reach].nome} ${G.metaRes.bolao.hit ? '✅' : G.metaRes.bolao.beyond ? '↩️' : '❌'}`);
  if (G.run && G.run.epics && G.run.epics.length) extra.push(`⚡ ${G.run.epics.length} lance${G.run.epics.length > 1 ? 's' : ''} épico${G.run.epics.length > 1 ? 's' : ''}: ${G.run.epics.slice(0, 3).map(e => e.icon + ' ' + e.nome).join(' · ')}`);
  x.font = `800 30px ${FE}`; x.fillStyle = '#ffc83d'; extra.forEach((t, i) => x.fillText(t, W / 2, Math.min(y + 10 + i * 44, H - 320 + i * 0), W - 140));
  // rodapé: semente + pontos
  x.fillStyle = 'rgba(0,0,0,.42)'; rrect(x, 80, H - 290, 450, 190, 28); x.fill(); rrect(x, 550, H - 290, 450, 190, 28); x.fill();
  x.fillStyle = '#9db5a6'; x.font = `900 26px ${F}`; x.fillText('SEMENTE PRO DESAFIO', 305, H - 232); x.fillText('PONTOS', 775, H - 232);
  x.fillStyle = '#c6ff3d'; x.font = `900 76px ${F}`; x.fillText(v.seed, 305, H - 140);
  x.fillStyle = '#ffc83d'; x.fillText(fmtN(v.points || 0), 775, H - 140);
  return c;
}
async function shareCard() {
  const v = G.verdict, text = shareText(v);
  const canvas = drawCard(v);
  const blob = await new Promise(r => canvas.toBlob(r, 'image/png'));
  const file = blob && typeof File !== 'undefined' ? new File([blob], `fominha-fc-${v.seed}.png`, { type: 'image/png' }) : null;
  try {
    if (file && navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], text, title: 'Fominha FC' }); gc('compartilhou-card', 'Compartilhou o card'); return; }
  } catch (e) { if (e && e.name === 'AbortError') return; }
  if (blob) { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `fominha-fc-${v.seed}.png`; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); }
  await copyText(text);
  gc('compartilhou-card', 'Compartilhou o card');
  toast('Card baixado e texto copiado! 📋');
}

// ---------- info (toque) ----------
function showInfo(k, id) {
  let rar = 'comum', icon = '', nome = '', tipo = '', desc = '';
  if (k === 'card') {
    const d = E.CARDS[id], t = E.CARD_TYPES[d.tipo], lv = E.cardLevel(G.run, id);
    const m = document.createElement('div'); m.className = 'modal';
    const hints = G.run ? E.comboHints(G.run, id) : [];
    m.innerHTML = `<div class="box info" style="--rc:${t.cor}"><div style="max-width:220px;margin:0 auto 10px">${cardFace(id, G.run, { btn: false })}</div>
      <p class="d"><b>${typeMark(d.tipo)} ${t.nome}</b> · custa ${d.cost} · ${esc(d.dur)} · Nv${lv}</p>
      <p class="d">${esc(E.cardText(id, lv))}</p>
      <p class="d" style="color:var(--gold)">Melhor quando: ${esc(d.tip)}</p>
      ${d.style ? `<p class="xs">Estilo ${E.STYLE_NAME[d.style]}. ${E.BEATS[d.style] ? 'Ganha de ' + E.STYLE_NAME[E.BEATS[d.style]] + '.' : ''}</p>` : ''}
      ${hints.length ? `<p class="hintline">Combo com o que você tem: ${esc(hints.join(', '))}</p>` : ''}
      <button class="btn sec" data-x="1">Fechar</button></div>`;
    m.addEventListener('click', ev => { if (ev.target === m || ev.target.closest('[data-x]')) m.remove(); });
    document.body.appendChild(m);
    return;
  }
  else if (k === 'relic') { const d = E.RELICS[id]; rar = d.rar; icon = markSvg(id); nome = d.nome; tipo = 'Relíquia · ' + E.RARITIES[d.rar].nome; desc = d.desc + ' Relíquias funcionam sozinhas, o tempo todo.'; }
  else return;
  const m = document.createElement('div'); m.className = 'modal';
  m.innerHTML = `<div class="box info" style="--rc:${rc(rar)}"><div class="big"><div class="ii plate" style="--tc:${rc(rar)}" role="img" aria-label="${esc(nome)}">${icon}</div><div><div class="eyebrow" style="color:var(--rc)">${esc(tipo)}</div><h3 class="disp" style="font-size:22px;font-style:italic;text-transform:uppercase;margin:2px 0 0">${esc(nome)}</h3></div></div>
    <p class="d">${esc(desc)}</p><button class="btn sec" data-x="1">Fechar</button></div>`;
  m.addEventListener('click', ev => { if (ev.target === m || ev.target.closest('[data-x]')) m.remove(); });
  document.body.appendChild(m);
}

// =================== v4: meta-jogo, lances épicos, clima ===================
// ---------- debug (só por URL, invisível pro jogador): ?debug=epic:bicicleta,wx:chuva,week:promote ----------
const DEBUG = (() => { const o = {}; try { (new URLSearchParams(location.search).get('debug') || '').split(',').forEach(p => { const [k, v] = p.split(':'); if (k) o[k] = v || '1'; }); } catch (e) { /* sem URL */ } return o; })();
function wxOf(run, stage) { return DEBUG.wx && E.WEATHER[DEBUG.wx] ? DEBUG.wx : E.weatherFor(run, stage); }
const STADIUMS = ['Maracanã · Rio', 'Morumbi · São Paulo', 'Mineirão · BH', 'Centenário · Montevidéu', 'Monumental · Buenos Aires', 'Wembley · Londres', 'San Siro · Milão', 'Bernabéu · Madri', 'Rose Bowl · Pasadena', 'Stade de France · Paris', 'Olímpico · Berlim', 'Soccer City · Joanesburgo'];
const STADIUMS_ALT = ['Azteca · Cidade do México', 'Hernando Siles · La Paz', 'Atahualpa · Quito'];
function stadiumFor(run, stage, wx) { const r = E.rngFor(run.seed, 'estadio', stage == null ? run.stage : stage); return r.pick(wx === 'altitude' ? STADIUMS_ALT : STADIUMS); }
function applyDebug(m) {
  if (DEBUG.wx && E.WEATHER[DEBUG.wx]) m.weather = DEBUG.wx;
  if (DEBUG.epic && E.EPICS[DEBUG.epic]) { m.forceEpic = DEBUG.epic; if (DEBUG.epic !== 'penalti') m.debugGoal = true; }
}
function myKit(run) { const c = M.COSMETICS[(G.store.cos || {}).kit]; return c && c.cores ? c.cores : selOf(run).kit; }
const TABS = { home: ['play', 'Jogar'], desafios: ['flame', 'Desafios'], album: ['card', 'Álbum'], tecnicos: ['coach', 'Técnicos'], perfil: ['star', 'Perfil'] };
function syncTabbar() {
  let tb = document.getElementById('tabbar');
  if (!TABS[G.screen]) { if (tb) tb.remove(); return; }
  if (!tb) { tb = document.createElement('nav'); tb.id = 'tabbar'; tb.className = 'tabbar'; tb.setAttribute('aria-label', 'Menu principal'); document.body.appendChild(tb); }
  const st = G.store, sk = M.streakOf(st), ms = M.missionState(st);
  const dot = { desafios: sk.status === 'risco' || ms.ids.some(id => !ms.done[id]) };
  tb.innerHTML = Object.keys(TABS).map(k => `<button class="${G.screen === k ? 'on' : ''}" data-act="tab" data-t="${k}" aria-current="${G.screen === k ? 'page' : 'false'}">${k === 'home' ? ballSvg('ico') : ic(TABS[k][0])}<span>${TABS[k][1]}</span>${dot[k] ? '<i class="dot"></i>' : ''}</button>`).join('');
}
function divBadge(div, cls) { const d = M.DIVS[div]; return `<span class="divb ${d.id} ${cls || ''}" style="--dc:${d.cor}"><span>${d.icon}</span><b>${d.nome}</b></span>`; }
function ligaBar(st) {
  const L = M.ligaSync(st), p = M.ligaProgress(L), dl = M.weekEnds();
  return `<div class="liga" style="--dc:${p.div.cor}"><div class="lh">${divBadge(L.div)}<span class="sp"></span><span class="xs mut">${dl === 0 ? 'semana acaba hoje' : `semana acaba em ${dl} dia${dl > 1 ? 's' : ''}`}</span></div>
    <div class="lbar"><i style="width:${p.pct}%"></i>${p.stay ? `<em style="left:${Math.min(100, p.stay / (p.div.up || p.stay * 1.5) * 100)}%" title="mínimo pra não cair"></em>` : ''}</div>
    <div class="ll"><b class="num">${fmtN(p.score)}</b> pts na semana ${p.next ? (p.falta ? `· faltam <b>${fmtN(p.falta)}</b> pra ${p.next.icon} ${p.next.nome}` : `· <b style="color:var(--lime)">subida pra ${p.next.icon} ${p.next.nome} garantida ✓</b>`) : '· topo da liga!'}${p.risco ? ` <span style="color:#ff9a9d">· abaixo de ${fmtN(p.stay)}: risco de cair</span>` : ''}</div></div>`;
}

// ---------- telas do menu ----------
function pageHead(t, sub) { return `<h2 class="ttl" style="margin-top:6px">${t}</h2>${sub ? `<p class="sub">${sub}</p>` : ''}`; }
function streakHtml(st) {
  const s = M.streakOf(st);
  const next = M.STREAK_BADGES.find(b => !s.badges[b.n]) || null;
  const warn = s.status === 'risco' ? `<div class="swarn">${ic('bolt')} Sua sequência acaba hoje! Jogue o Desafio do dia pra manter os ${s.cur} dias.</div>` : s.status === 'perdeu' && s.lost ? `<div class="swarn lost">A sequência de ${s.lost} dias acabou. Comece outra hoje!</div>` : '';
  return `<div class="streak ${s.status}"><div class="fire">🔥</div><div style="flex:1;min-width:0"><div class="eyebrow g">Sequência do Desafio</div><div class="sn"><b class="num">${s.cur}</b> dia${s.cur === 1 ? '' : 's'}</div>
    <div class="xs mut">${s.status === 'feito' ? 'Desafio de hoje feito ✓' : 'Jogue 1 Desafio por dia'} · recorde ${s.best || 0}</div></div></div>
    ${warn}<div class="badges">${M.STREAK_BADGES.map(b => `<div class="bdg ${s.badges[b.n] ? 'on' : ''}"><span>${b.icon}</span><b>${b.n} dias</b><small>${esc(b.nome)}</small>${!s.badges[b.n] && next === b ? `<i style="width:${Math.min(100, s.cur / b.n * 100)}%"></i>` : ''}</div>`).join('')}</div>`;
}
function cosChip(id) { const c = M.COSMETICS[id]; return c ? `<span class="cchip">${cosSwatch(id)} ${esc(c.nome)}</span>` : ''; }
function cosSwatch(id) {
  const c = M.COSMETICS[id];
  if (c.tipo === 'kit') return `<i class="sw" style="background:linear-gradient(135deg,${(c.cores || ['#ffd21f', '#1f4fbf'])[0]} 55%,${(c.cores || ['#ffd21f', '#1f4fbf'])[1]} 55%)"></i>`;
  if (c.tipo === 'moldura') return `<i class="sw fr ${c.cor === 'holo' ? 'holo' : c.cor === 'fogo' ? 'fogo' : ''}" style="border-color:${c.cor && c.cor[0] === '#' ? c.cor : '#6f9c84'}"></i>`;
  return `<i class="sw fx">${{ fx_confete: '🎊', fx_fogos: '🎆', fx_estrelas: '⭐', fx_bolas: '⚽', fx_raio: '⚡' }[id] || '✨'}</i>`;
}
function missionsHtml(st) {
  const ms = M.missionState(st), cd = M.cosOfDay(st, ms.day);
  return `<div class="panel"><div class="ph">${ic('target')} Missões do dia <span class="r">${Object.keys(ms.done).length}/3</span></div>
    ${ms.ids.map((id, i) => { const done = ms.done[id], rw = M.MISSION_REWARD[i];
      const rwh = rw === 'cos' ? (ms.cosDay ? cosChip(ms.cosDay) : cd ? cosChip(cd) : `<span class="cchip">🪙 80</span>`) : `<span class="cchip">🪙 ${rw}</span>`;
      return `<div class="mis ${done ? 'ok' : ''}"><span class="mk">${done ? ic('check') : ['I', 'II', 'III'][i]}</span><div style="flex:1;min-width:0"><b>${esc(M.MISSIONS[id].txt)}</b><small>${['Fácil', 'Média', 'Difícil'][i]} · vale em qualquer campanha de hoje</small></div>${rwh}</div>`; }).join('')}
    <div class="xs mut" style="margin-top:8px">Novas missões à meia-noite. Recompensas são só visuais (uniformes, molduras e efeitos de gol) ou Fominhas 🪙.</div></div>`;
}
function renderDesafios() {
  const st = G.store, di = dailyInfo(), wk = M.isoWeek(), lid = M.legendOfWeek(wk), L = E.LEGENDS[lid], ls = st.lenda && st.lenda.week === wk ? st.lenda : { best: null, tries: 0, beat: 0 };
  app.innerHTML = `<div class="topbar"><span class="chip">🪙 ${fmtN(st.fominhas)} Fominhas</span><span class="sp"></span><span class="chip">${ic('cal')} ${todayLabel()}</span></div>
  ${pageHead('Desafios', 'Volte todo dia: sequência, missões, o chefe lendário da semana e duelos com os amigos.')}
  ${streakHtml(st)}
  <div class="daily"><div class="cal"><i>${MESES[new Date().getMonth()]}</i><b>${pad(new Date().getDate())}</b></div><div class="eyebrow g">Mesma Copa pra todo mundo</div><div class="dt">${ic('cal')} Desafio do dia</div>
    <div class="meta"><span class="chip">${ic('dice')} ${dailySeed()}</span><span class="chip" style="color:var(--gold)">${ic('trophy')} ${di.best != null ? fmtN(di.best) + ' pts' : 'sem pontos'}</span><span class="chip">🎯 Bolão</span></div>
    <button class="btn gold" data-act="playDaily">${ic('play')} Apostar no bolão e jogar</button></div>
  ${missionsHtml(st)}
  <div class="legend" style="--lc:${L.kit[0]}"><div class="eyebrow g">Técnico Lendário da semana · ${wk.slice(5)}</div>
    <div class="lgh"><span class="lf">${L.flag}</span><div><div class="disp lgn">${esc(L.tecnico)}</div><div class="small">${esc(L.apelido)} · ${esc(L.nome)}</div></div></div>
    <div class="bossrule">${ic('bolt')} <b>Regra na final:</b> ${esc(L.regra)}</div>
    <div class="row" style="margin:10px 0"><div class="stat"><b class="num" style="color:var(--gold)">${ls.best != null ? fmtN(ls.best) : '—'}</b><span>Recorde da semana</span></div><div class="stat"><b class="num">${ls.tries}</b><span>Tentativas</span></div><div class="stat"><b class="num" style="color:var(--lime)">${ls.beat}</b><span>Vitórias</span></div></div>
    <button class="btn shine" data-act="playLegend">${ic('play')} Encarar ${esc(L.tecnico.split(' ').pop())}</button><div class="xs mut" style="text-align:center;margin-top:8px">Semente da semana ${M.legendSeed(wk)} · nível 1 · troca toda segunda</div></div>
  <div class="panel"><div class="ph">${ic('users')} Modo Duelo</div><p class="small" style="margin:0 0 8px">No fim de qualquer campanha, toque em <b>Duelo</b> e mande o link. Seu amigo joga a mesma Copa, vê o placar rodada a rodada lado a lado e pode devolver o desafio.</p>
    ${(st.duels || []).length ? `<div class="rank">${st.duels.slice(0, 5).map(d => `<div class="rk ${d.win === 1 ? 'me' : ''}"><span class="p">${d.win === 1 ? '🏆' : d.win === 0 ? '❌' : '🤝'}</span><div class="n">vs ${esc(d.vs)}<small>semente ${esc(d.seed)}</small></div><span class="s num">${fmtN(d.me)} x ${fmtN(d.them)}</span></div>`).join('')}</div>` : `<div class="empty">Nenhum duelo ainda.</div>`}</div>`;
  showTip('desafios');
}
function renderAlbum() {
  const st = G.store, a = st.album || {}, S = M.albumStats(st);
  const pi = Math.max(0, M.ALBUM.findIndex(p => p.id === G.albumPage));
  const pg = M.ALBUM[pi], ps = S.pages[pi], kitId = 'retro_' + pg.id, owned = M.ownsCos(st, kitId);
  app.innerHTML = `<div class="topbar"><span class="chip">${ic('card')} ${S.have}/${S.total} figurinhas</span><span class="sp"></span><span class="chip">${Math.round(S.have / S.total * 100)}%</span></div>
  ${pageHead('Álbum de figurinhas', 'Todo jogador que passou pelo seu time vira figurinha. Complete uma página e ganhe o uniforme retrô dela.')}
  <div class="lbar big"><i style="width:${S.have / S.total * 100}%"></i></div>
  <div class="pages">${M.ALBUM.map((p, i) => `<button class="${i === pi ? 'on' : ''} ${S.pages[i].have === S.pages[i].total ? 'done' : ''}" data-act="apage" data-p="${p.id}">${p.icon} ${esc(p.nome)} <small>${S.pages[i].have}/${S.pages[i].total}</small></button>`).join('')}</div>
  <div class="panel apage"><div class="ph">${pg.icon} ${esc(pg.nome)} <span class="r">${ps.have}/${ps.total}</span></div>
    <div class="stickers">${pg.players.map((p, i) => a[p.nome] ? `<div class="stk">${futCard(p, { size: 'sm', kit: pg.cores })}${a[p.nome] > 1 ? `<i class="rep">×${a[p.nome]}</i>` : ''}</div>` : `<div class="stk miss"><b>${i + 1}</b><span>?</span><small>${p.pos} · ${esc(p.era.replace(/^\D+/, '') || p.era)}</small></div>`).join('')}</div>
    <div class="akit ${owned ? 'on' : ''}">${shirt(pg.cores[0], pg.cores[1])}<div><b>Uniforme ${esc(M.COSMETICS[kitId].nome)}</b><small>${owned ? 'Liberado! Equipe no Perfil.' : `Complete a página (${ps.total - ps.have} faltando)`}</small></div></div></div>`;
  const on = document.querySelector('.pages button.on'); if (on && on.scrollIntoView) on.parentNode.scrollLeft = on.offsetLeft - 14;
}
function coachRow(g, i, hof) {
  return `<div class="gcoach ${hof ? 'hof h' + i : ''}">${hof ? `<span class="pos">${['🥇', '🥈', '🥉'][i]}</span>` : ''}${ovrBadge(g.ovr)}<div style="flex:1;min-width:0"><div class="gn">${esc(g.nome)} <span class="xs" style="color:var(--gold)">“${esc(g.titulo)}”</span></div>
    <div class="gat">${E.COACH_ATTRS.map(a => `<span>${a.curto} <b class="${rtClass(g.slots[a.id].rating)}">${g.slots[a.id].rating}</b></span>`).join('')}</div>
    <div class="gst"><span>${g.flag} ${g.campanhas} campanha${g.campanhas > 1 ? 's' : ''}</span><span>🏆 ${g.titulos}</span><span>Melhor: ${M.REACH[g.bestReach]} · ${fmtN(g.best)} pts</span></div></div></div>`;
}
function renderTecnicos() {
  const st = G.store, list = (st.coaches || []).slice().sort((a, b) => (b.last || b.ts) - (a.last || a.ts)), hof = M.hallOfFame(st);
  app.innerHTML = `<div class="topbar"><span class="chip">${ic('coach')} ${list.length} técnico${list.length === 1 ? '' : 's'}</span><span class="sp"></span></div>
  ${pageHead('Galeria de técnicos', 'Cada técnico que você montou fica guardado aqui, com notas, campanhas e títulos.')}
  <div class="panel hl"><div class="ph">${ic('trophy')} Hall da Fama</div>${hof.length ? hof.map((g, i) => coachRow(g, i, true)).join('') : '<div class="empty">Termine uma campanha pra entrar no Hall da Fama.</div>'}</div>
  <div class="panel"><div class="ph">${ic('users')} Todos <span class="r">mais recentes</span></div>${list.length ? list.map(g => coachRow(g)).join('') : '<div class="empty">Nenhum técnico ainda.</div>'}</div>`;
}
function renderPerfil() {
  const st = G.store, cos = M.cosStore(st), tab = G.cosTab || 'kit';
  const rank = k => { const c = M.COSMETICS[k]; return M.ownsCos(st, k) ? 0 : c.preco ? 1 : c.missao ? 2 : 3; };
  const items = Object.keys(M.COSMETICS).filter(k => M.COSMETICS[k].tipo === tab).sort((a, b) => rank(a) - rank(b));
  const eq = { kit: cos.kit, moldura: cos.mold, efeito: cos.fx }[tab];
  const S = M.albumStats(st), sk = M.streakOf(st);
  app.innerHTML = `<div class="topbar"><span class="chip">🪙 ${fmtN(st.fominhas)} Fominhas</span><span class="sp"></span>${divBadge(M.ligaSync(st).div, 'sm')}</div>
  ${pageHead('Perfil', 'Sua divisão semanal, conquistas e cosméticos.')}
  <div class="panel"><div class="ph">${ic('rank')} Divisão da semana <span class="r">5 melhores campanhas</span></div>${ligaBar(st)}
    <div class="divs">${M.DIVS.map((d, i) => `<div class="${i === st.liga.div ? 'on' : ''}" style="--dc:${d.cor}"><span>${d.icon}</span><small>${d.nome}</small><b>${d.up ? fmtN(d.up) : '★'}</b></div>`).join('')}</div>
    <div class="xs mut" style="margin-top:6px">Na virada da semana (segunda): soma ≥ meta sobe de divisão; abaixo do mínimo da divisão, cai. Vale qualquer campanha.</div></div>
  <div class="statsrow"><div class="stat"><b class="num" style="color:var(--lime)">${fmtN(st.record || 0)}</b><span>Recorde</span></div><div class="stat"><b class="num">🔥${sk.best || 0}</b><span>Maior sequência</span></div><div class="stat"><b class="num" style="color:var(--gold)">${S.have}</b><span>Figurinhas</span></div></div>
  <div class="panel"><div class="ph">${ic('gem')} Cosméticos <span class="r">só visual</span></div>
    <div class="seg3">${[['kit', 'Uniformes'], ['moldura', 'Molduras'], ['efeito', 'Efeitos de gol']].map(([k, n]) => `<button class="${tab === k ? 'on' : ''}" data-act="costab" data-t="${k}">${n}</button>`).join('')}</div>
    <div class="cosgrid">${items.map(id => { const c = M.COSMETICS[id], own = M.ownsCos(st, id), on = eq === id;
      const how = own ? (on ? '<span class="eq">EQUIPADO</span>' : `<button class="mini" data-act="equip" data-id="${id}">Equipar</button>`) : c.preco ? `<button class="mini buy" data-act="buycos" data-id="${id}" ${st.fominhas < c.preco ? 'disabled' : ''}>🪙 ${c.preco}</button>` : `<span class="lockm">${ic('lock')} ${c.album ? 'Álbum' : 'Missão'}</span>`;
      return `<div class="cos ${own ? '' : 'locked'} ${on ? 'on' : ''}"><div class="cprev">${cosSwatch(id)}</div><b>${esc(c.nome)}</b><small>${esc(c.desc)}</small>${how}</div>`; }).join('')}</div></div>
  <div class="panel"><div class="ph">${ic('star')} Conquistas</div><div class="badges">${M.STREAK_BADGES.map(b => `<div class="bdg ${sk.badges[b.n] ? 'on' : ''}"><span>${b.icon}</span><b>${b.n} dias</b><small>${esc(b.nome)}</small></div>`).join('')}</div></div>
  <button class="btn ghost" data-act="howto">${ic('info')} Como jogar</button>
  <p class="xs mut gcnote">Contamos visitas de forma anônima, sem cookies.</p>`;
}
// ---------- divisões: animação de virada da semana ----------
function ligaAnimModal() {
  const L = G.store.liga; if (!L || !L.anim) return false;
  const a = L.anim, up = a.to > a.from, down = a.to < a.from;
  const m = document.createElement('div'); m.className = 'modal ligam';
  m.innerHTML = `<div class="box ${up ? 'up' : down ? 'down' : ''}"><div class="eyebrow g">Fim da semana ${esc(String(a.week).slice(5))}</div>
    <h3 class="disp" style="font-size:28px;font-style:italic;margin:4px 0 2px">${up ? 'SUBIU DE DIVISÃO!' : down ? 'Caiu de divisão' : 'Ficou na divisão'}</h3>
    <div class="small mut">${fmtN(a.score)} pts nas 5 melhores campanhas</div>
    <div class="dtrans"><div class="from">${divBadge(a.from)}</div><div class="arr">${up ? '▲' : down ? '▼' : '='}</div><div class="to">${divBadge(a.to, 'big')}</div></div>
    <p class="small">${up ? 'Nova semana, nova meta. Bora pra próxima!' : down ? 'Faça 5 boas campanhas essa semana pra voltar.' : 'Faça mais pontos essa semana pra subir.'}</p>
    <button class="btn ${up ? 'gold' : ''}" data-x="1">Bora!</button></div>`;
  m.addEventListener('click', ev => { if (ev.target.closest('[data-x]')) { delete G.store.liga.anim; saveStore(); m.remove(); } });
  document.body.appendChild(m);
  if (up && !RM()) setTimeout(() => confettiBurst(['#ffc83d', '#c6ff3d', '#fff', M.DIVS[a.to].cor], 40), 650);
  return true;
}
function confettiBurst(cols, n) {
  for (let i = 0; i < n; i++) {
    const c = document.createElement('div'); c.className = 'conf';
    c.style.left = Math.random() * 100 + 'vw'; c.style.background = cols[i % cols.length];
    c.style.animationDelay = Math.random() * .4 + 's'; c.style.animationDuration = 1.2 + Math.random() + 's';
    document.body.appendChild(c); setTimeout(() => c.remove(), 2700);
  }
}
// efeitos de gol equipáveis
function celebrateFx(cols) {
  if (RM()) return;
  const fx = (G.store.cos || {}).fx || 'fx_confete';
  if (fx === 'fx_confete') return confettiBurst(cols, 36);
  if (fx === 'fx_raio') { const r = document.createElement('div'); r.className = 'boltfx'; r.innerHTML = '<svg viewBox="0 0 60 200"><path d="M38 0L8 110h20L14 200 54 70H32L46 0z"/></svg>'; document.body.appendChild(r); setTimeout(() => r.remove(), 1100); return confettiBurst(['#fff', '#ffe14d'], 14); }
  const ch = { fx_bolas: null, fx_estrelas: '⭐', fx_fogos: null }[fx];
  if (fx === 'fx_fogos') {
    for (let k = 0; k < 4; k++) setTimeout(() => {
      const cx = 15 + Math.random() * 70, cy = 15 + Math.random() * 35, col = ['#ffc83d', '#c6ff3d', '#ff5a5f', '#7cc4ff'][k];
      for (let i = 0; i < 18; i++) { const s = document.createElement('div'); s.className = 'spark'; const a = i / 18 * Math.PI * 2; s.style.left = cx + 'vw'; s.style.top = cy + 'vh'; s.style.background = col; s.style.setProperty('--dx', Math.cos(a) * 90 + 'px'); s.style.setProperty('--dy', Math.sin(a) * 90 + 'px'); document.body.appendChild(s); setTimeout(() => s.remove(), 1000); }
    }, k * 260);
    return;
  }
  for (let i = 0; i < 22; i++) {
    const c = document.createElement('div'); c.className = 'conf emo'; c.innerHTML = ch || ballSvg('ico');
    c.style.left = Math.random() * 100 + 'vw'; c.style.animationDelay = Math.random() * .5 + 's'; c.style.animationDuration = 1.3 + Math.random() + 's';
    document.body.appendChild(c); setTimeout(() => c.remove(), 2900);
  }
}

// ---------- LANCES ÉPICOS: cinemática ----------
const EPIC_PATHS = {
  olimpico: { segs: [[[99, 4], [84, 24], [99.5, 46]]], lift: .5 },
  bicicleta: { segs: [[[80, 88], [84, 26], [90, 45]], [[90, 45], [95, 46], [99.5, 51]]], lift: .7 },
  golaco: { segs: [[[62, 60], [84, 14], [99.5, 44]]], lift: .45 },
  cobertura: { segs: [[[82, 54], [93, 18], [99.5, 50]]], lift: 1.1 },
  calcanhar: { segs: [[[94, 40], [92, 45], [88, 50]], [[88, 50], [95, 54], [99.5, 52]]], lift: .12 },
  goleiro: { segs: [[[5, 50], [52, 0], [99.5, 47]]], lift: 1.2 },
  hattrick: { segs: [[[78, 64], [90, 44], [99.5, 48]]], lift: .25 },
  virada: { segs: [[[74, 38], [88, 64], [99.5, 52]]], lift: .3 },
  placa: { segs: [[[82, 28], [92, 42], [99.5, 49]]], lift: .25 },
  penalti: { segs: [[[12, 50], [7, 47], [2.5, 42]], [[2.5, 42], [6, 30], [15, 14]]], lift: .15, save: true }
};
function bez(s, t) { const u = 1 - t; return [u * u * s[0][0] + 2 * u * t * s[1][0] + t * t * s[2][0], u * u * s[0][1] + 2 * u * t * s[1][1] + t * t * s[2][1]]; }
function epicPos(id, k) {
  k = Math.max(0, Math.min(1, k || 0));
  const P = EPIC_PATHS[id] || EPIC_PATHS.hattrick, n = P.segs.length, f = Math.min(n - 1e-9, k * n), i = Math.floor(f), t = f - i;
  const xy = bez(P.segs[i], t);
  return { x: xy[0], y: xy[1], h: P.lift * Math.sin(Math.PI * t) * (i === n - 1 || n === 1 ? 1 : .6) };
}
function epicScene(id) {
  const sky = `<defs><linearGradient id="esky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#07121c"/><stop offset="1" stop-color="#12301c"/></linearGradient><radialGradient id="eflood" cx="50%" cy="0%" r="70%"><stop offset="0" stop-color="rgba(255,244,200,.55)"/><stop offset="1" stop-color="rgba(255,244,200,0)"/></radialGradient></defs>
    <rect width="390" height="280" fill="url(#esky)"/><rect width="390" height="120" fill="url(#eflood)"/>
    <g fill="#0a2014">${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(i => `<circle cx="${18 + i * 32}" cy="${48 + (i % 3) * 10}" r="7" fill="${i % 2 ? '#c52626' : '#f2f2f2'}"/>`).join('')}</g>
    <path d="M20 150 Q195 120 370 150 L370 250 L20 250 Z" fill="#176b32"/><path d="M20 168 H370" stroke="rgba(255,255,255,.35)" stroke-width="2"/>
    <rect x="300" y="118" width="78" height="46" fill="none" stroke="#fff" stroke-width="3"/><rect x="300" y="132" width="78" height="18" fill="none" stroke="rgba(255,255,255,.7)" stroke-width="2"/>`;
  const figs = {
    bicicleta: `<g transform="translate(168 150) rotate(-78)"><ellipse cx="0" cy="18" rx="16" ry="7" fill="rgba(0,0,0,.35)"/><circle cx="0" cy="-6" r="9" fill="#f0c9a0"/><path d="M-8 2 h22 l6 28 h-16 z" fill="#c52626"/><path d="M-2 28 l-16 18 M8 28 l18 8" stroke="#111" stroke-width="5" stroke-linecap="round"/><circle cx="28" cy="-8" r="8" fill="#fff" stroke="#111"/></g>`,
    cobertura: `<g transform="translate(150 168)"><circle cx="0" cy="-8" r="9" fill="#f0c9a0"/><path d="M-12 0 h20 l8 34 h-18 z" fill="#fff"/><path d="M-4 34 l-8 22 M8 34 l14 16" stroke="#111" stroke-width="5" stroke-linecap="round"/></g><g transform="translate(250 176)"><circle cx="0" cy="0" r="8" fill="#ffd76a"/><path d="M-14 8 h22 l-4 28 h-14 z" fill="#111"/></g><circle cx="230" cy="92" r="9" fill="#fff" stroke="#111"/><path d="M170 150 Q210 70 230 92" fill="none" stroke="#ffd76a" stroke-width="2" stroke-dasharray="4 3"/>`,
    olimpico: `<g transform="translate(70 150)"><circle cx="0" cy="0" r="8" fill="#f0c9a0"/><path d="M-10 8 h18 l4 30 h-16 z" fill="#0d80bf"/></g><path d="M80 140 Q200 40 330 150" fill="none" stroke="#ffd76a" stroke-width="3"/><circle cx="330" cy="150" r="8" fill="#fff" stroke="#111"/>`,
    calcanhar: `<g transform="translate(210 160) scale(-1 1)"><circle cx="0" cy="-6" r="9" fill="#f0c9a0"/><path d="M-8 4 h20 l4 30 h-16 z" fill="#006437"/><path d="M6 32 l16 8" stroke="#111" stroke-width="5" stroke-linecap="round"/></g><circle cx="168" cy="188" r="8" fill="#fff" stroke="#111"/>`,
    golaco: `<g transform="translate(120 156)"><circle cx="0" cy="-4" r="9" fill="#f0c9a0"/><path d="M-10 6 h20 l6 32 h-16 z" fill="#ffd100"/></g><path d="M140 150 Q220 80 340 140" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="5 4"/><circle cx="340" cy="140" r="8" fill="#fff"/>`,
    goleiro: `<g transform="translate(80 160)"><circle cx="0" cy="0" r="9" fill="#f0c9a0"/><path d="M-14 8 h24 l-2 32 h-16 z" fill="#facc15"/></g><path d="M90 150 H340" stroke="#ffd76a" stroke-width="2" stroke-dasharray="6 4"/><circle cx="330" cy="148" r="8" fill="#fff"/>`,
    penalti: `<g transform="translate(250 168)"><circle cx="0" cy="-10" r="9" fill="#f0c9a0"/><path d="M-16 0 h28 l-6 30 h-16 z" fill="#111"/><path d="M8 -6 l22 -16" stroke="#111" stroke-width="5" stroke-linecap="round"/></g><circle cx="210" cy="150" r="8" fill="#fff" stroke="#111"/>`,
    placa: `<text x="40" y="150" font-size="54" font-family="Arial Black,sans-serif" fill="#ffd76a">4×0</text>`,
    hattrick: `<g transform="translate(180 150)"><circle cx="0" cy="0" r="9" fill="#f0c9a0"/><path d="M-12 10 h24 l2 32 h-22 z" fill="#c52626"/></g><text x="40" y="70" font-size="28" font-family="Arial Black,sans-serif" fill="#ffd76a">3º</text>`,
    virada: `<text x="36" y="90" font-size="42" font-family="Arial Black,sans-serif" fill="#fff">90+2</text><circle cx="250" cy="160" r="10" fill="#fff"/>`
  };
  return `<div class="escene" aria-hidden="true"><svg viewBox="0 0 390 280">${sky}${figs[id] || figs.golaco}<g stroke="#ffd76a" stroke-width="2" fill="none" opacity=".8"><path d="M40 40 l18 6 M60 28 l8 16 M330 36 l-16 10"/></g></svg></div>`;
}
function epicFx(e, sp) {
  const ep = e.epic, P = EPIC_PATHS[ep.id] || EPIC_PATHS.hattrick, rm = RM(), mine = e.side === 0 || P.save;
  const slow = 1 / Math.min(sp, 1.5), DUR = 1700 * slow, END = P.segs[P.segs.length - 1][2];
  const pz = $('#pz');
  const box = document.createElement('div'); box.className = 'epicfx' + (rm ? ' rm' : ''); box.setAttribute('role', 'status');
  box.innerHTML = `${epicScene(ep.id)}<i class="lb t"></i><i class="lb b"></i><div class="rec">● REPLAY · CÂMERA LENTA</div><div class="eflash"></div>
    <div class="ebox"><div class="ek">⚡ LANCE ÉPICO</div><div class="ei">${ep.icon}</div><div class="en">${esc(ep.nome.toUpperCase())}!</div><div class="es">${esc(ep.scorer || '')} · ${ep.min}' · ${ep.score ? ep.score[0] + ' x ' + ep.score[1] : ''}</div><div class="ef">📻 “${esc(ep.frase)}”</div></div>`;
  document.body.appendChild(box);
  if (pz && !rm) { pz.style.transformOrigin = `${END[0]}% ${END[1]}%`; pz.classList.add('ez'); }
  SIM.trailEls.forEach(t => t.classList.add('hot')); if (SIM.ballEl) SIM.ballEl.classList.add('hot');
  if (pz && !rm) { const r = $('#pitch').getBoundingClientRect(), top = window.innerHeight * .11 + 6; if (r.top < top || r.bottom > window.innerHeight * .55) window.scrollBy({ top: r.top - top, behavior: 'smooth' }); }
  if (!rm) SIM.epic = { id: ep.id, t0: performance.now(), dur: DUR, save: !!P.save };
  else { SIM.ball.x = END[0]; SIM.ball.y = END[1]; SIM.shot = { x: END[0], y: END[1] }; }
  SIM.holder = null;
  setTimeout(() => {
    box.classList.add('hit');
    const p = $('#pitch'); if (p && !rm) { p.classList.remove('flash', 'shake'); void p.offsetWidth; p.classList.add('shake'); }
    if (e.kind === 'goal') { SIM.celebrate = e.side; const sc = $('#sc'); if (sc) { sc.classList.remove('bump'); void sc.offsetWidth; sc.classList.add('bump'); } }
    if (mine) celebrateFx([myKit(G.run)[0], myKit(G.run)[1], '#c6ff3d', '#ffc83d', '#ffffff']);
    if (navigator.vibrate) try { navigator.vibrate([40, 50, 90]); } catch (er) { /* sem vibração */ }
  }, rm ? 100 : DUR + 60);
  const total = rm ? 2600 : DUR + 2600 * slow;
  setTimeout(() => {
    if (!document.body.contains(box)) return;
    if (pz) pz.classList.remove('ez');
    SIM.epic = null; if (SIM.trailEls) SIM.trailEls.forEach(t => t.classList.remove('hot')); if (SIM.ballEl) SIM.ballEl.classList.remove('hot');
    if (G.speed > 1) {
      box.classList.add('hold', 'hit');
      if (!box.querySelector('.tapgo')) box.insertAdjacentHTML('beforeend', '<button class="tapgo" data-act="tapgo">Toque para continuar</button>');
      return;
    }
    box.classList.add('out'); setTimeout(() => box.remove(), 350);
    SIM.celebrate = -1; if (SIM.ball) { SIM.ball.x = 50; SIM.ball.y = 50; } setPoss(e.kind === 'goal' ? 1 - e.side : 0);
  }, total);
  if (!G.seenEpic) { G.seenEpic = true; }
  return total + 250;
}

// ---------- card do lance épico (canvas animado + PNG) ----------
function moldStroke(x, W, H, fallback) {
  const c = M.COSMETICS[(G.store.cos || {}).mold] || {};
  if (c.cor === 'holo') { const g = x.createLinearGradient(0, 0, W, H); ['#ff5af1', '#7cc4ff', '#c6ff3d', '#ffe14d', '#ff5a5f'].forEach((k, i) => g.addColorStop(i / 4, k)); return g; }
  if (c.cor === 'fogo') { const g = x.createLinearGradient(0, H, 0, 0); g.addColorStop(0, '#ff3d00'); g.addColorStop(.5, '#ff9a1f'); g.addColorStop(1, '#ffe14d'); return g; }
  return c.cor || fallback;
}
function drawEpic(x, W, H, ep, k, ghosts) {
  const F = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif', FE = F + ', "Noto Color Emoji", "Apple Color Emoji"';
  const g = x.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#1a3d10'); g.addColorStop(.5, '#0b2416'); g.addColorStop(1, '#04100a');
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  const rg = x.createRadialGradient(W / 2, 140, 10, W / 2, 140, W * .7); rg.addColorStop(0, 'rgba(255,200,61,.28)'); rg.addColorStop(1, 'rgba(255,200,61,0)'); x.fillStyle = rg; x.fillRect(0, 0, W, H);
  x.strokeStyle = moldStroke(x, W, H, '#ffc83d'); x.lineWidth = 16; rrect(x, 24, 24, W - 48, H - 48, 40); x.stroke();
  x.textAlign = 'center'; x.fillStyle = '#c6ff3d'; x.font = `900 34px ${F}`; x.fillText('FOMINHA FC · LANCE ÉPICO', W / 2, 96);
  { const tf = `italic 900 ${ep.nome.length > 22 ? 52 : ep.nome.length > 16 ? 62 : 76}px ${F}`, tt = ep.nome.toUpperCase() + '!';
    x.font = tf; const tw = Math.min(W - 260, x.measureText(tt).width), x0 = (W - (tw + 104)) / 2;
    x.textAlign = 'left'; x.font = `80px ${FE}`; x.fillText(ep.icon, x0, 210);
    x.fillStyle = '#ffc83d'; x.font = tf; x.fillText(tt, x0 + 104, 206, W - 260); x.textAlign = 'center'; }
  x.fillStyle = '#fff'; x.font = `800 36px ${FE}`; x.fillText(`${ep.scorer || ''} · ${ep.min}' · ${ep.oppFlag || ''} ${(ep.opp || '').replace(/ \d{4}$/, '')}${ep.score ? ' · ' + ep.score[0] + ' x ' + ep.score[1] : ''}`, W / 2, 268, W - 120);
  // campinho
  const pw = ghosts && ghosts.length ? W - 240 : W - 140, px = (W - pw) / 2, py = 310, ph = Math.round(pw / 1.55);
  for (let i = 0; i < 10; i++) { x.fillStyle = i % 2 ? '#2f8a3e' : '#2a7e38'; x.fillRect(px + i * pw / 10, py, pw / 10 + 1, ph); }
  x.strokeStyle = 'rgba(255,255,255,.7)'; x.lineWidth = 4; x.strokeRect(px + 10, py + 10, pw - 20, ph - 20);
  x.beginPath(); x.moveTo(px + pw / 2, py + 10); x.lineTo(px + pw / 2, py + ph - 10); x.stroke();
  x.beginPath(); x.arc(px + pw / 2, py + ph / 2, ph * .13, 0, Math.PI * 2); x.stroke();
  x.strokeRect(px + 10, py + ph * .24, pw * .14, ph * .52); x.strokeRect(px + pw - 10 - pw * .14, py + ph * .24, pw * .14, ph * .52);
  x.fillStyle = 'rgba(255,255,255,.5)'; x.fillRect(px, py + ph * .43, 10, ph * .14); x.fillRect(px + pw - 10, py + ph * .43, 10, ph * .14);
  const map = p => [px + p.x / 100 * pw, py + p.y / 100 * ph];
  // trajetória (tracejada) até k
  x.setLineDash([14, 12]); x.strokeStyle = 'rgba(255,200,61,.9)'; x.lineWidth = 6; x.beginPath();
  for (let i = 0; i <= 60; i++) { const t = i / 60 * k, [X, Y] = map(epicPos(ep.id, t)); if (!i) x.moveTo(X, Y); else x.lineTo(X, Y); }
  x.stroke(); x.setLineDash([]);
  // quadros-fantasma (sequência) e rastro
  (ghosts || []).forEach((t, i) => { if (t > k) return; const p = epicPos(ep.id, t), [X, Y] = map(p); x.globalAlpha = .28 + i * .08; x.fillStyle = '#fff'; x.beginPath(); x.arc(X, Y, 13 + p.h * 14, 0, 7); x.fill(); x.globalAlpha = 1; x.fillStyle = '#0b2416'; x.font = `900 20px ${F}`; x.fillText(String(i + 1), X, Y + 7); });
  for (let i = 8; i >= 1; i--) { const t = Math.max(0, k - i * .025), p = epicPos(ep.id, t), [X, Y] = map(p); x.globalAlpha = (1 - i / 9) * .5; x.fillStyle = '#ffe58a'; x.beginPath(); x.arc(X, Y, (14 + p.h * 16) * (1 - i / 14), 0, 7); x.fill(); }
  x.globalAlpha = 1;
  const p = epicPos(ep.id, k), [BX, BY] = map(p), R = 16 + p.h * 18;
  x.fillStyle = 'rgba(0,0,0,.35)'; x.beginPath(); x.ellipse(BX + p.h * 22, BY + 6 + p.h * 26, R * .9, R * .45, 0, 0, 7); x.fill();
  const bg = x.createRadialGradient(BX - R * .3, BY - R * .3, 2, BX, BY, R); bg.addColorStop(0, '#fff'); bg.addColorStop(.7, '#e6e6e6'); bg.addColorStop(1, '#9a9a9a');
  x.shadowColor = 'rgba(255,230,140,.9)'; x.shadowBlur = 26; x.fillStyle = bg; x.beginPath(); x.arc(BX, BY, R, 0, 7); x.fill(); x.shadowBlur = 0;
  x.fillStyle = '#222'; x.beginPath(); for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i * Math.PI * 2 / 5; x.lineTo(BX + Math.cos(a) * R * .38, BY + Math.sin(a) * R * .38); } x.fill();
  if (k >= .98) { x.globalAlpha = .9; x.fillStyle = '#c6ff3d'; x.font = `italic 900 54px ${F}`; x.fillText(ep.id === 'penalti' ? 'DEFENDEU!' : 'GOOOL!', px + pw / 2, py + 70); x.globalAlpha = 1; }
  // frase
  x.fillStyle = '#e6f6ea'; x.font = `italic 600 38px ${FE}`;
  let y = wrapText(x, '📻 “' + ep.frase + '”', W / 2, py + ph + 74, W - 150, 48);
  // sequência de quadros (4 mini-campos)
  if (ghosts && ghosts.length && y < H - 250) {
    const fw = (pw - 3 * 18) / 4, fh = fw / 1.55, fy = y + 6;
    [.25, .5, .75, 1].forEach((t, i) => {
      const fx = px + i * (fw + 18);
      x.fillStyle = '#2a7e38'; rrect(x, fx, fy, fw, fh, 10); x.fill();
      x.strokeStyle = 'rgba(255,255,255,.55)'; x.lineWidth = 2; x.strokeRect(fx + 5, fy + 5, fw - 10, fh - 10);
      x.beginPath(); x.moveTo(fx + fw / 2, fy + 5); x.lineTo(fx + fw / 2, fy + fh - 5); x.stroke();
      x.setLineDash([6, 5]); x.strokeStyle = 'rgba(255,200,61,.95)'; x.lineWidth = 3; x.beginPath();
      for (let j = 0; j <= 24; j++) { const q = epicPos(ep.id, j / 24 * t); const X = fx + q.x / 100 * fw, Y = fy + q.y / 100 * fh; if (!j) x.moveTo(X, Y); else x.lineTo(X, Y); }
      x.stroke(); x.setLineDash([]);
      const q = epicPos(ep.id, t); x.fillStyle = '#fff'; x.shadowColor = '#ffc83d'; x.shadowBlur = 12; x.beginPath(); x.arc(fx + q.x / 100 * fw, fy + q.y / 100 * fh, 7 + q.h * 6, 0, 7); x.fill(); x.shadowBlur = 0;
      x.fillStyle = 'rgba(0,0,0,.55)'; rrect(x, fx + 8, fy + 8, 34, 28, 8); x.fill(); x.fillStyle = '#ffc83d'; x.font = `900 20px ${F}`; x.fillText(String(i + 1), fx + 25, fy + 29);
    });
    y = fy + fh + 30;
  }
  x.fillStyle = '#9db5a6'; x.font = `800 28px ${F}`; x.fillText(`Copa Relâmpago · semente ${ep.seed || (G.run && G.run.seed) || ''}`, W / 2, Math.min(H - 64, Math.max(y + 10, H - 100)));
}
function epicCanvasHtml(i) { return `<div class="ecard"><canvas class="ecv" data-i="${i}" width="540" height="675" aria-label="Replay do lance épico"></canvas></div>`; }
function startEpicCanvases(list) {
  document.querySelectorAll('canvas.ecv').forEach(cv => {
    const ep = list[+cv.dataset.i]; if (!ep) return;
    const x = cv.getContext('2d'); x.setTransform(.5, 0, 0, .5, 0, 0);
    if (RM()) { drawEpic(x, 1080, 1350, ep, 1, [.2, .4, .6, .8]); return; }
    const t0 = performance.now();
    const f = now => { if (!document.body.contains(cv)) return; const c = ((now - t0) / 1000) % 3.6, k = Math.min(1, c / 2.2), e = 1 - Math.pow(1 - k, 2); drawEpic(x, 1080, 1350, ep, e, []); requestAnimationFrame(f); };
    requestAnimationFrame(f);
  });
}
function epicPNG(ep) { const c = document.createElement('canvas'); c.width = 1080; c.height = 1350; drawEpic(c.getContext('2d'), 1080, 1350, ep, 1, [.2, .4, .6, .8]); return c; }
async function downloadEpic(ep) {
  const c = epicPNG(ep), blob = await new Promise(r => c.toBlob(r, 'image/png'));
  const name = `fominha-lance-${ep.id}-${ep.seed || ''}.png`, text = `${ep.icon} ${ep.nome}! ${ep.scorer || ''} aos ${ep.min}' · Fominha FC · Copa Relâmpago (semente ${ep.seed || ''})`;
  const file = blob && typeof File !== 'undefined' ? new File([blob], name, { type: 'image/png' }) : null;
  try { if (file && navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], text, title: 'Lance épico' }); return; } } catch (e) { if (e && e.name === 'AbortError') return; }
  if (blob) { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); }
  toast('Card do lance baixado! 🎬');
}
function epicModal(ep) {
  const m = document.createElement('div'); m.className = 'modal';
  m.innerHTML = `<div class="box">${epicCanvasHtml(0)}<div class="row" style="margin-top:10px"><button class="btn gold" data-act="epicPng" data-i="m">${ic('share')} Baixar PNG</button><button class="btn sec" data-x="1">Fechar</button></div></div>`;
  m.addEventListener('click', ev => { if (ev.target === m || ev.target.closest('[data-x]')) m.remove(); });
  document.body.appendChild(m); G.epicModal = ep; startEpicCanvases([ep]);
}

// ---------- bolão ----------
function bolaoSheet() {
  const st = G.store, box = document.createElement('div'); box.className = 'sheet'; box.id = 'bolao';
  G.bolaoPick = G.bolaoPick || { guess: 1, stake: Math.min(25, st.fominhas >= 25 ? 25 : st.fominhas >= 10 ? 10 : 0) };
  const draw = () => {
    const b = G.bolaoPick, prize = b.stake ? Math.round(b.stake * M.BOLAO[b.guess].mult) : 0;
    box.innerHTML = `<div class="inner" role="dialog" aria-label="Bolão"><div class="grab"></div>
      <div class="eyebrow g">Bolão do Desafio · ${todayLabel()}</div><h3 class="disp" style="font-size:26px;font-style:italic;margin:2px 0 4px">Até onde você vai?</h3>
      <p class="small mut" style="margin:0 0 10px">Aposte Fominhas 🪙 (moeda só de cosméticos). Acertou em cheio: ganha o multiplicador. Foi além do palpite: recebe a aposta de volta.</p>
      <div class="bgrid">${M.BOLAO.map((o, i) => `<button class="${b.guess === i ? 'on' : ''}" data-act="bguess" data-i="${i}"><b>${esc(o.nome)}</b><small>×${String(o.mult).replace('.', ',')}</small></button>`).join('')}</div>
      <div class="eyebrow" style="margin:12px 0 6px">Aposta · saldo 🪙 ${fmtN(st.fominhas)}</div>
      <div class="seg3">${[0].concat(M.STAKES).map(s => `<button class="${b.stake === s ? 'on' : ''}" data-act="bstake" data-s="${s}" ${s > st.fominhas ? 'disabled' : ''}>${s ? '🪙 ' + s : 'Sem aposta'}</button>`).join('')}</div>
      <div class="bprize">${b.stake ? `Acertou <b>${esc(M.BOLAO[b.guess].nome)}</b>: recebe <b style="color:var(--gold)">🪙 ${prize}</b>` : 'Jogando sem aposta.'}</div>
      <button class="btn gold shine" data-act="bgo">${ic('play')} ${b.stake ? 'Apostar e jogar' : 'Jogar o desafio'}</button></div>`;
  };
  draw(); G.bolaoDraw = draw;
  box.addEventListener('click', ev => { if (ev.target === box) box.remove(); });
  document.body.appendChild(box);
}

// ---------- duelo ao vivo (chave compartilhada) ----------
function syncCupKo() {
  const run = G.run;
  if (!run || run.cupRole == null || run.cupKo || run.stage < 3 || !G.cup) return;
  const games = [0, 1, 2].map(s => { const h = run.history.find(x => x.stage === s); return h ? [h.gf, h.ga] : null; });
  if (games.some(g => !g)) return;
  const cup = G.cup.built || (G.cup.built = FFBracket.buildCup(run.seed));
  const prep = FFBracket.prepareKo(cup, run.cupRole, games);
  run.cupRank = prep.rank; run.cupPts = prep.pts; run.cupQualified = prep.qualified;
  if (prep.ko) { prep.ko.forEach((o, i) => { run.opponents[i + 3] = o; }); run.cupKo = true; }
}
function armOfflineFinal() {
  if (!G.run || G.run.opponents[6] || !G.cup) return;
  const cup = G.cup.built || FFBracket.buildCup(G.run.seed);
  const other = G.cup.role === 0 ? 1 : 0;
  const t = cup.ko[other][0].qf || cup.ko[other][0].r16;
  if (t) G.run.opponents[6] = FFBracket.asOpponent(t, 6);
  G.cup.offlineFinal = true;
}
function saveSnap() {
  if (!G.cup || !G.run) return;
  try { sessionStorage.setItem('ffcupSnap', JSON.stringify({ id: G.cup.id, role: G.cup.role, koSeen: !!G.cup.koSeen, run: G.run, final: G.cup.final || null })); } catch (e) { /* modo privado */ }
}
function restoreSnap() {
  try {
    const s = JSON.parse(sessionStorage.getItem('ffcupSnap') || 'null');
    if (!s || !G.cup || s.id !== G.cup.id) return;
    G.run = s.run; G.cup.koSeen = !!s.koSeen; if (s.final) G.cup.final = s.final;
  } catch (e) { /* ignora */ }
}
function presenceBody() {
  const run = G.run, c = G.cup;
  let phase = 'lobby';
  if (run) {
    if (run.status !== 'playing' && run.stage < 6) phase = 'caiu';
    else if (G.match && G.match.pvp && !G.match.done) phase = 'final';
    else if (run.stage >= 6 && run.status === 'playing') phase = 'espera';
    else if (run.stage >= 3) phase = 'mata';
    else phase = 'grupo';
  }
  const squad = (phase === 'espera' || phase === 'final') && run ? FFLive.packSquad(run, G.store.coachName || c.host) : null;
  return { role: c.role, name: (G.store.coachName || c.host || 'Fominha').slice(0, 24), coach: run && run.coach ? run.coach.nome : '', selecao: run ? run.selecao : '', phase, stage: run ? run.stage : 0, status: run ? run.status : 'lobby', pts: run ? run.groupPts : 0, hist: run ? run.history.map(h => [h.stage, h.gf, h.ga, h.outcome]) : [], squad, locks: (c.final && c.final.locks) || [] };
}
function cupPublish() { if (G.cup && window.FFNet && G.cup.status === 'on') FFNet.track(presenceBody()); }
function cupConnect() {
  if (!G.cup || !window.FFNet) { if (G.cup) G.cup.status = 'off'; return; }
  G.cup.status = 'connecting';
  FFNet.join({
    id: G.cup.id, role: G.cup.role, state: presenceBody(),
    onStatus(st) { if (!G.cup) return; G.cup.status = st; if (['chave', 'espera', 'caiu'].indexOf(G.screen) >= 0) render(); },
    onPresence(list) { onCupPresence(list); },
    onEvent(p) { onCupEvent(p); }
  }).then(() => { if (G.cup && G.cup.status === 'on') FFNet.load(G.cup.id).then(st => { if (st && st.final && G.cup && !G.match) resumeFinal(st.final); }); });
}
function onCupPresence(list) {
  if (!G.cup) return;
  G.cup.friend = list.find(p => p.role !== G.cup.role) || null;
  G.cup.online = list.map(p => p.role);
  if (['chave', 'espera', 'caiu'].indexOf(G.screen) >= 0) render();
  const host = list.find(p => p.role === 0);
  if (host && host.locks && host.locks.length) host.locks.forEach(lock => applyLock(lock));
  if (!G.match && host && host.phase === 'final' && host.squad && host.locks && host.locks.length && G.run && G.run.stage >= 6 && G.run.status === 'playing') {
    const me = FFLive.packSquad(G.run, G.store.coachName || G.cup.host);
    resumeFinal({ home: host.role === 0 ? host.squad : me, away: host.role === 0 ? me : host.squad, locks: host.locks });
  }
  maybeKick();
}
function maybeKick() {
  const f = G.cup && G.cup.friend, run = G.run;
  if (!f || !run || G.cup.role !== 0 || G.cup.kicked || G.cup.status !== 'on') return;
  if (run.stage < 6 || run.status !== 'playing' || f.phase !== 'espera' || !f.squad) return;
  G.cup.kicked = true;
  const home = FFLive.packSquad(run, G.store.coachName || 'Fominha');
  const startAt = Date.now() + 900;
  FFNet.send({ t: 'kick', startAt, home, away: f.squad });
  beginFinal(home, f.squad, startAt);
}
function onCupEvent(p) {
  if (!p || !G.cup) return;
  if (p.t === 'kick' && G.cup.role === 1) beginFinal(p.home, p.away, p.startAt);
  if (p.t === 'card' && G.match && G.match.pvp) { G.pvpPick = G.pvpPick || [undefined, undefined]; G.pvpPick[p.side] = p.card; paintFriendPick(); if (G.cup.role === 0) maybeSendLock(); }
  if (p.t === 'lock') applyLock(p);
}
function beginFinal(home, away, startAt) {
  if (!G.cup || (G.match && G.match.pvp && !G.match.done)) return;
  gc('duelo-final-ao-vivo', 'Final ao vivo');
  const h = FFLive.unpackSquad(home, G.cup.seed), a = FFLive.unpackSquad(away, G.cup.seed);
  G.speed = 1;
  G.match = E.createPvpMatch(h, a, G.cup.seed + 'F');
  G.cup.final = { home, away, locks: (G.cup.final && G.cup.final.locks) || [] };
  G.cup.pendingLocks = [];
  G.holdKick = startAt || Date.now();
  saveSnap();
  go('match');
}
function resumeFinal(final) {
  if (!final || !final.home || !final.away || !G.cup) return;
  if (G.match && G.match.pvp && !G.match.done) return;
  gc('duelo-final-ao-vivo', 'Final ao vivo');
  const h = FFLive.unpackSquad(final.home, G.cup.seed), a = FFLive.unpackSquad(final.away, G.cup.seed);
  G.speed = 1;
  G.match = E.createPvpMatch(h, a, G.cup.seed + 'F');
  (final.locks || []).forEach(lock => { while (!G.match.done && !G.match.awaiting) E.stepMatch(G.match); if (G.match.awaiting && G.match.minute === lock.min) E.applyPvpCards(G.match, lock.c0, lock.c1); });
  G.cup.final = final;
  G.cup.pendingLocks = [];
  if (G.match.done) { endPvp(); return; }
  G.screen = 'match'; render();
}
function showPvpDecision() {
  if (drainPendingLock()) return;
  const m = G.match, role = G.cup.role;
  G.pvpPick = [undefined, undefined]; G.pvpLocked = false; G.pvpHand = [];
  const box = document.createElement('div'); box.className = 'sheet'; box.id = 'decision';
  box.innerHTML = `<div class="inner" id="dinn" role="dialog" aria-label="Carta da final"></div>`;
  document.body.appendChild(box);
  paintPvp();
  if (!m.awaitingSides[role]) { G.pvpPick[role] = null; if (window.FFNet) FFNet.send({ t: 'card', min: m.minute, side: role, card: null }); maybeSendLock(); }
  const secs = 12, C = 2 * Math.PI * 18;
  let left = secs * 10;
  G.decT = setInterval(() => {
    if (!document.body.contains(box)) { clearInterval(G.decT); return; }
    left--;
    const r = $('#dring'), s = $('#dsec');
    if (r) r.setAttribute('stroke-dashoffset', String(C * (1 - left / (secs * 10))));
    if (s) s.textContent = Math.ceil(left / 10);
    if (left <= 0) { clearInterval(G.decT); pvpTimeout(); }
  }, 100);
}
function paintPvp() {
  const inn = $('#dinn'); if (!inn || !G.match || !G.cup) return;
  const m = G.match, role = G.cup.role, mine = role === 0 ? m.run : m.away;
  const bag = role === 0 ? m.used : m.usedAway;
  const pool = m.nrgLeft != null && role === 0 ? m.nrgLeft : (role === 1 ? m.nrgAway : 3);
  const max = role === 0 ? (m.nrgMax || 3) : (m.nrgMaxAway || 3);
  const spent = (G.pvpHand || []).reduce((s, id) => s + E.CARDS[id].cost, 0);
  const left = pool - spent;
  const focus = (G.pvpHand && G.pvpHand[0]) || (mine.cards || [])[0];
  inn.innerHTML = `<div class="grab"></div>
    <div class="dhead">${ic('pause')}<div><div class="eyebrow g">${m.minute}' · ${m.score[0]} x ${m.score[1]}</div><div class="t">Final · ${nrgPips(Math.max(0, left), max)}</div></div>
    <div class="dtimer"><svg viewBox="0 0 44 44"><circle cx="22" cy="22" r="18" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="4"/><circle id="dring" cx="22" cy="22" r="18" fill="none" stroke="#ffc83d" stroke-width="4" stroke-linecap="round" stroke-dasharray="${2 * Math.PI * 18}"/></svg><b id="dsec">12</b></div></div>
    <div class="dctx" style="border-left:3px solid var(--gold)">Os dois escolhem ao mesmo tempo. Sem escolha, a carta fica guardada. <span id="fpick">Amigo escolhendo...</span></div>
    <div class="dcards">${(mine.cards || []).map(c => {
      const on = (G.pvpHand || []).indexOf(c) >= 0, used = bag.indexOf(c) >= 0, afford = !used && (on || E.CARDS[c].cost <= left);
      return cardFace(c, mine, { act: afford && m.awaitingSides[role] ? 'pvpcard' : '', on, dim: !afford, btn: true });
    }).join('')}</div>
    ${focus ? chanceBars(focus) : ''}
    <button class="btn shine" style="margin-top:8px" data-act="pvpcard" data-c="go">Confirmar</button>
    <button class="btn sec" style="margin-top:8px" data-act="pvpcard" data-c="">Guardar e seguir</button>`;
  paintFriendPick();
}
function paintFriendPick() {
  const el = $('#fpick'); if (!el || !G.cup) return;
  const side = 1 - G.cup.role, card = G.pvpPick && G.pvpPick[side];
  const nome = card == null || card === '' ? '' : (Array.isArray(card) ? card.map(id => E.CARDS[id] ? E.CARDS[id].nome : id).join(' + ') : (E.CARDS[card] ? E.CARDS[card].nome : ''));
  el.textContent = card === undefined ? 'Amigo escolhendo...' : nome ? ('Amigo: ' + nome) : 'Amigo guardou a carta.';
}
function pvpChoose(card) {
  if (!G.match || !G.match.awaiting || G.pvpPick[G.cup.role] !== undefined) return;
  if (card !== 'go' && card !== '') {
    G.pvpHand = G.pvpHand || [];
    const i = G.pvpHand.indexOf(card);
    if (i >= 0) G.pvpHand.splice(i, 1); else G.pvpHand.push(card);
    paintPvp();
    return;
  }
  const ids = card === 'go' ? (G.pvpHand || []).slice() : [];
  G.pvpPick[G.cup.role] = ids.length ? ids : null;
  if (window.FFNet) FFNet.send({ t: 'card', min: G.match.minute, side: G.cup.role, card: ids.length ? ids : null });
  maybeSendLock();
}
function cupAuthority() {
  if (!G.cup) return false;
  if (G.cup.role === 0) return true;
  return (G.cup.online || []).indexOf(0) < 0;
}
function maybeSendLock() {
  const m = G.match; if (!m || !m.awaiting || !cupAuthority() || G.pvpLocked) return;
  const ready = [0, 1].every(s => !m.awaitingSides[s] || (G.pvpPick && G.pvpPick[s] !== undefined));
  if (!ready) return;
  const lock = { t: 'lock', min: m.minute, c0: G.pvpPick[0] || null, c1: G.pvpPick[1] || null };
  if (window.FFNet && G.cup.status === 'on') FFNet.send(lock);
  applyLock(lock);
}
function pvpTimeout() {
  const m = G.match; if (!m || !m.awaiting) return;
  G.pvpPick = G.pvpPick || [undefined, undefined];
  if (G.pvpPick[G.cup.role] === undefined) G.pvpPick[G.cup.role] = null;
  if (window.FFNet && G.cup.status === 'on') FFNet.send({ t: 'card', min: m.minute, side: G.cup.role, card: G.pvpPick[G.cup.role] });
  if (cupAuthority()) { hostLockNow(false); return; }
  G.decT = setTimeout(() => { if (m.awaiting && !G.pvpLocked) hostLockNow((G.cup.online || []).indexOf(0) < 0); }, 2500);
}
function hostLockNow(aiForMissing) {
  const m = G.match; if (!m || !m.awaiting) return;
  if (!cupAuthority() && !aiForMissing) return;
  G.pvpPick = G.pvpPick || [undefined, undefined];
  [0, 1].forEach(s => {
    if (!m.awaitingSides[s]) { G.pvpPick[s] = null; return; }
    if (G.pvpPick[s] !== undefined) return;
    const online = s === G.cup.role || (G.cup.online || []).indexOf(s) >= 0;
    G.pvpPick[s] = online ? null : FFLive.aiCard(m, s);
  });
  if (!cupAuthority()) {
    const lock = { t: 'lock', min: m.minute, c0: G.pvpPick[0] || null, c1: G.pvpPick[1] || null };
    applyLock(lock);
    return;
  }
  maybeSendLock();
}
function drainPendingLock() {
  const m = G.match;
  if (!m || !m.awaiting || !G.cup || !G.cup.pendingLocks) return false;
  const i = G.cup.pendingLocks.findIndex(l => l.min === m.minute);
  if (i < 0) return false;
  applyLock(G.cup.pendingLocks.splice(i, 1)[0]);
  return true;
}
function applyLock(lock) {
  const m = G.match;
  if (!lock || !m || !m.pvp || !G.cup) return;
  if ((G.cup.final && (G.cup.final.locks || []).some(l => l.min === lock.min)) || (G.pvpLocked && m.minute === lock.min)) return;
  if (!m.awaiting || lock.min !== m.minute) {
    G.cup.pendingLocks = G.cup.pendingLocks || [];
    if (!G.cup.pendingLocks.some(l => l.min === lock.min)) G.cup.pendingLocks.push(lock);
    return;
  }
  G.pvpLocked = true; clearInterval(G.decT); clearTimeout(G.decT);
  const d = $('#decision'); if (d) d.remove();
  const evs = E.applyPvpCards(m, lock.c0, lock.c1);
  evs.forEach(e => G.queue.push({ t: 'event', e }));
  G.cup.final = G.cup.final || {};
  G.cup.final.locks = (G.cup.final.locks || []).concat([{ min: lock.min, c0: lock.c0, c1: lock.c1 }]);
  if (window.FFNet) FFNet.save(G.cup.id, { final: G.cup.final });
  saveSnap(); cupPublish();
  G.timer = setTimeout(tick, 280);
}
function endPvp() {
  SIM.on = false;
  const m = G.match, res = E.pvpResult(m), role = G.cup.role;
  const gf = res.score[role], ga = res.score[1 - role];
  const outcome = res.winner === role ? 'W' : 'L';
  const oppName = role === 0 ? E.SELECOES[m.away.selecao].nome : E.SELECOES[m.run.selecao].nome;
  const oppFlag = role === 0 ? E.SELECOES[m.away.selecao].flag : E.SELECOES[m.run.selecao].flag;
  G.run.history.push({ stage: 6, opp: oppName, flag: oppFlag, gf, ga, pens: res.pens ? (role === 0 ? res.pens.score : [res.pens.score[1], res.pens.score[0]]) : null, outcome, weather: m.weather, epics: m.epics.map(e => e.id), trailed: false, cards: (role === 0 ? m.used : m.usedAway).length });
  G.run.status = outcome === 'W' ? 'champion' : 'eliminated';
  G.run.totalGF += gf; G.run.totalGA += ga;
  if (outcome === 'W') G.run.maxStage = 7;
  G.result = { outcome, gf, ga, pens: res.pens, fichas: outcome === 'W' ? [{ label: 'Vitória na final ao vivo', v: 3 }] : [], ganho: outcome === 'W' ? 3 : 0, why: [outcome === 'W' ? 'A final ao vivo ficou com você. Os dois viram o mesmo jogo.' : 'A final ao vivo ficou com o seu amigo. Os dois viram o mesmo jogo.'], groupMsg: '', reward: false, shop: false, status: G.run.status, stage: 6, mGoals: m.goals.slice(), epics: m.epics.slice(), weather: m.weather };
  if (outcome === 'W') G.run.fichas += 3;
  if (G.cup.friend) G.cup.friend.phase = 'fim';
  finalizeRun(); cupPublish();
  if (res.pens && res.pens.kicks && res.pens.kicks.length) {
    const kicks = res.pens.kicks.map(k => ({ side: k.side === role ? 0 : 1, nome: k.nome, ok: k.ok, coach: k.coach, keeper: 'goleiro' }));
    return showShootout({ kicks, leftName: selOf(G.run).curto, rightName: oppName, onDone: () => go('result') });
  }
  go('result');
}
function friendRole() {
  const f = G.cup && G.cup.friend;
  if (f && (f.role === 0 || f.role === 1)) return f.role;
  return G.cup && G.cup.role === 0 ? 1 : 0;
}
function gamesFromHist(hist) {
  return [0, 1, 2].map(s => {
    const h = (hist || []).find(x => Array.isArray(x) ? x[0] === s : x.stage === s);
    if (!h) return null;
    return Array.isArray(h) ? [h[1], h[2]] : [h.gf, h.ga];
  });
}
function histFor(role) {
  if (G.run && G.cup.role === role) return G.run.history;
  if (G.cup.friend && friendRole() === role) return G.cup.friend.hist;
  return [];
}
function stageFor(role) {
  if (G.run && G.cup.role === role) return G.run.stage;
  if (G.cup.friend && friendRole() === role) return G.cup.friend.stage || 0;
  return 0;
}
function cupView() {
  const base = G.cup.built || (G.cup.built = FFBracket.buildCup(G.cup.seed));
  const cup = JSON.parse(JSON.stringify(base));
  [0, 1].forEach(role => {
    const games = gamesFromHist(histFor(role));
    if (games.every(Boolean)) FFBracket.recordHuman(cup, role, games);
  });
  return cup;
}
function pathInfo(cup, role) {
  const games = gamesFromHist(histFor(role));
  const stage = stageFor(role);
  if (games.every(Boolean)) {
    const prep = FFBracket.prepareKo(cup, role, games);
    if (!prep.qualified || !prep.ko) return { out: true, pts: prep.pts, rank: prep.rank, stage, bits: [] };
    return { out: false, rank: prep.rank, stage, bits: [{ nome: 'Oitavas', team: prep.ko[0] }, { nome: 'Quartas', team: prep.ko[1] }, { nome: 'Semi', team: prep.ko[2] }] };
  }
  const known = cup.ko && cup.ko[role] ? cup.ko[role][0] : {};
  return { out: false, rank: null, stage, bits: [{ nome: 'Oitavas', team: known.r16 }, { nome: 'Quartas', team: known.qf }, { nome: 'Semi', team: known.sf }] };
}
function groupRows(group) {
  const rows = FFBracket.table(group.teams, group.played);
  return rows.map(r => {
    const t = r.t, you = t.human === G.cup.role, pal = t.human != null && !you;
    const nome = you ? ('Você · ' + (G.store.coachName || 'Fominha')) : pal ? (((G.cup.friend && G.cup.friend.name) || 'Amigo') + (G.cup.friend && G.cup.friend.coach ? ' · ' + G.cup.friend.coach : '')) : t.nome;
    return `<div class="grow ${you ? 'you' : ''} ${pal ? 'pal' : ''}"><b>${t.flag && t.flag !== '⚽' ? t.flag + ' ' : ''}${esc(nome)}</b><span class="pts">${r.pts}</span></div>`;
  }).join('');
}
function pathNodes(role, on) {
  const info = pathInfo(cupView(), role);
  if (info.out) return `<div class="pnode ${on} out"><b>Grupos</b>caiu antes da final · ${info.pts} pts</div>`;
  return info.bits.map((b, i) => {
    const round = i + 3;
    const cls = info.stage > round ? 'done' : info.stage === round ? 'now' : '';
    const team = b.team ? (b.team.flag ? b.team.flag + ' ' : '') + b.team.nome : 'sai do grupo';
    return `<div class="pnode ${on} ${cls}"><b>${b.nome}${info.stage > round ? ' ✓' : ''}</b>${esc(team)}</div>`;
  }).join('');
}
function renderChave() {
  const c = G.cup; if (!c) return go('home');
  const cup = cupView();
  const fr = c.friend;
  const offline = c.status === 'off';
  const meName = G.store.coachName || 'Você';
  const frName = (fr && fr.name) || 'Amigo';
  const mineG = FFBracket.humanGroup(c.role), palG = FFBracket.humanGroup(1 - c.role);
  const meInfo = pathInfo(cup, c.role), palInfo = pathInfo(cup, 1 - c.role);
  const col = (role, on, nome, info) => `<div class="pathcol"><div class="pathlbl ${on}">${esc(nome)}${info.rank ? ' · ' + info.rank + 'º' : ''}<small>Grupo ${FFBracket.LETTERS[FFBracket.humanGroup(role)]}</small></div>${pathNodes(role, on === 'you' ? 'on' : 'pal')}</div>`;
  app.innerHTML = `<div class="topbar"><button class="chip" data-act="home">${ic('back')} Início</button><span class="sp"></span><span class="chip">${ic('dice')} ${esc(c.seed)}</span><span class="chip">${c.role === 0 ? 'Anfitrião' : 'Convidado'}</span></div>
    ${pageHead('Chave da Copa', 'Mesma semente, grupos opostos. Vocês só se encontram na final.')}
    <div class="cupnote ${offline ? 'off' : ''}">${offline ? 'Sem conexão com o duelo ao vivo. A chave continua valendo e, no fim, o comparativo clássico por link.' : (fr ? `${ic('users')} ${esc(frName)} está ${fr.phase === 'espera' ? 'esperando na final' : fr.phase === 'caiu' ? 'eliminado' : 'no jogo'} · ${esc(E.STAGES[Math.min(6, fr.stage || 0)].curto)}` : 'Manda o link. A chave atualiza quando o amigo entrar.')}</div>
    <div class="panel"><div class="ph">${ic('flag')} Caminho até a final ${c.mode === 'ko' ? '<span class="r">mata-mata</span>' : ''}</div>
      <div class="paths">${col(c.role, 'you', 'Você · ' + meName, meInfo)}<div class="finalmeet">FINAL<br>vocês dois</div>${col(1 - c.role, 'pal', frName, palInfo)}</div>
      <p class="xs mut" style="margin:8px 0 0">Oitavas e quartas já mostram os CPUs. A semi fecha quando o grupo acaba. Os dois lados só se cruzam na final.</p>
      ${fr && fr.hist && fr.hist.length ? `<div class="friendprog">${esc(frName)} ao vivo: ${fr.hist.map(h => E.STAGES[h[0]].curto + ' ' + h[1] + '-' + h[2]).join(' · ')}</div>` : ''}
    </div>
    <div class="ggrid">${cup.groups.map(g => `<div class="gcard ${g.index === mineG ? 'me' : ''} ${g.index === palG ? 'them' : ''}"><div class="gh">Grupo ${g.id}${g.index === mineG ? ' · ' + esc(meName) : ''}${g.index === palG ? ' · ' + esc(frName) : ''}</div>${groupRows(g)}</div>`).join('')}</div>
    <div class="mctrl">${G.run && G.run.status === 'playing' ? `<button class="btn shine" data-act="cupBack">${ic('play')} Voltar pro meu jogo</button>` : `<button class="btn gold shine" data-act="cupTeam">${ic('play')} Montar meu time</button>`}
      ${c.role === 0 ? `<button class="btn sec" data-act="cupCopy">${ic('share')} Copiar link do duelo</button>` : ''}</div>`;
}
function renderEspera() {
  const fr = G.cup && G.cup.friend, nome = (fr && fr.name) || 'seu amigo';
  const where = !fr ? 'ainda não entrou na sala' : fr.phase === 'caiu' ? 'caiu antes da final' : fr.phase === 'espera' ? 'também chegou na final' : `está em ${E.STAGES[Math.min(6, fr.stage || 0)].nome}`;
  app.innerHTML = `<div class="topbar"><button class="chip" data-act="cupBoard">${ic('flag')} Chave</button><span class="sp"></span><span class="chip">${ic('users')} Final</span></div>
    <div class="waitbig"><div class="eyebrow g">Sala de espera</div><div class="disp" style="font-size:34px;font-style:italic;text-transform:uppercase">A final te espera</div>
      <p class="small">${esc(nome)} ${esc(where)}.</p>
      ${fr && fr.phase === 'caiu' ? `<p class="friendprog">Seu amigo caiu antes da final.</p><button class="btn gold huge" data-act="cupRetry" style="margin-top:12px">Tentar de novo</button>` : `<p class="friendprog">${fr && fr.hist ? fr.hist.map(h => E.STAGES[h[0]].curto + ' ' + h[1] + '-' + h[2]).join(' · ') : 'A final começa sozinha quando os dois estiverem aqui.'}</p>`}
    </div>
    <button class="btn sec" data-act="cupBoard">${ic('flag')} Ver a chave de novo</button>`;
}
function renderCaiu() {
  const fr = G.cup && G.cup.friend;
  const waited = fr && (fr.phase === 'espera' || fr.phase === 'final');
  app.innerHTML = `<div class="topbar"><button class="chip" data-act="home">${ic('back')} Início</button><span class="sp"></span><span class="chip">${ic('users')} Duelo</span></div>
    <div class="caiubig"><div class="eyebrow" style="color:#ff9a9d">Fim da linha</div>
      <div class="disp" style="font-size:32px;font-style:italic;text-transform:uppercase;line-height:1.05">${waited ? 'Seu amigo te esperou na final!' : 'Você caiu antes da final'}</div>
      <p class="small">${waited ? 'Ele já está lá. A taça ficou esperando vocês dois.' : 'A final era o único lugar em que vocês podiam se encontrar.'}</p>
      ${fr ? `<p class="friendprog">${esc(fr.name || 'Amigo')}: ${esc(fr.phase === 'espera' ? 'esperando na final' : fr.phase === 'caiu' ? 'também caiu' : E.STAGES[Math.min(6, fr.stage || 0)].nome)}</p>` : ''}
    </div>
    <button class="btn gold huge shine" data-act="cupRetry">Tentar de novo</button>
    <button class="btn sec" style="margin-top:8px" data-act="cupBoard">${ic('flag')} Ver a chave</button>`;
}
function cupRetry() {
  const c = G.cup; if (!c) return go('home');
  G.run = null; G.match = null; G.result = null; c.koSeen = false; c.kicked = false; c.mode = 'start'; c.final = null; c.built = FFBracket.buildCup(c.seed);
  try { sessionStorage.removeItem('ffcupSnap'); } catch (e) { /* ignora */ }
  go('chave');
}
function openLiveDuel(seed) {
  const s = E.normalizeSeed(seed || '') || E.randomSeed();
  const d = { v: 2, id: E.randomSeed(), s, l: Math.min(G.store.level || 1, E.MAX_PLAYABLE_LEVEL), host: G.store.coachName || 'Fominha' };
  G.cup = { id: d.id, seed: d.s, level: d.l, host: d.host, role: 0, mode: 'start', koSeen: false, status: 'connecting', friend: null };
  try { sessionStorage.setItem('ffcup', d.id); } catch (e) { /* ignora */ }
  const url = duelLink(d); G.lastDuelLink = url;
  copyText(`⚔️ Duelo ao vivo no Fominha FC! Mesma Copa, grupos opostos, a gente só se encontra na final: ${url}`);
  history.replaceState(null, '', publicPath() + '#duelo=' + M.duelEncode(d));
  gc('duelo-criado', 'Duelo criado');
  go('chave'); cupConnect();
}
function previewDuel(which) {
  window.__noTips = true;
  const cup = FFBracket.buildCup('SCREEN1');
  G.store.coachName = 'Patrick';
  G.cup = { id: 'SCREEN1', seed: 'SCREEN1', level: 1, role: 0, host: 'Patrick', status: 'on', mode: which === 'ko' ? 'ko' : 'start', koSeen: true, built: cup, friend: { role: 1, name: 'Amigo', coach: 'Felipão', selecao: 'cam90', phase: which === 'wait' ? 'mata' : which === 'out' ? 'espera' : 'grupo', stage: which === 'wait' ? 4 : 1, status: 'playing', pts: 4, hist: [[0, 2, 1, 'W'], [1, 1, 0, 'W']] } };
  if (which === 'start' || which === 'ko') {
    if (which === 'ko') {
      const slots = E.flatCoach(80, 'Patrick').slots;
      G.run = E.newRun('SCREEN1', 1, 'bra82', E.makeCoach('Patrick', slots));
      G.run.cupRole = 0; G.run.stage = 4; G.run.groupPts = 7; G.run.cupRank = 1; G.run.status = 'playing';
      G.run.history = [{ stage: 0, gf: 2, ga: 0, outcome: 'W' }, { stage: 1, gf: 1, ga: 0, outcome: 'W' }, { stage: 2, gf: 3, ga: 1, outcome: 'W' }, { stage: 3, gf: 2, ga: 1, outcome: 'W' }];
      G.cup.friend.phase = 'mata'; G.cup.friend.stage = 3; G.cup.friend.hist = [[0, 1, 0, 'W'], [1, 2, 2, 'D'], [2, 1, 0, 'W']];
    }
    G.screen = 'chave'; render(); return;
  }
  if (which === 'wait') {
    G.run = E.newRun('SCREEN1', 1, 'bra82', E.makeCoach('Patrick', E.flatCoach(80, 'Patrick').slots));
    G.run.cupRole = 0; G.run.stage = 6; G.run.status = 'playing';
    G.cup.friend.phase = 'mata'; G.cup.friend.stage = 4;
    G.screen = 'espera'; render(); return;
  }
  if (which === 'out') {
    G.run = E.newRun('SCREEN1', 1, 'bra82', E.makeCoach('Patrick', E.flatCoach(80, 'Patrick').slots));
    G.run.cupRole = 0; G.run.stage = 4; G.run.status = 'eliminated';
    G.cup.friend.phase = 'espera';
    G.screen = 'caiu'; render(); return;
  }
  if (which === 'final') {
    const home = E.newRun('SCREEN1', 1, 'bra82', E.makeCoach('Patrick', E.flatCoach(80, 'Patrick').slots));
    const away = E.newRun('SCREEN1', 1, 'cam90', E.makeCoach('Amigo', E.flatCoach(77, 'Amigo').slots));
    home.cards = ['pressao', 'craque', 'paredao']; away.cards = ['casinha', 'longe'];
    G.run = home; G.run.cupRole = 0;
    G.match = E.createPvpMatch(home, away, 'SCREEN1');
    G.match.minute = 23; G.match.score = [1, 0]; G.match.awaiting = true; G.match.awaitingSides = [true, true];
    G.screen = 'match'; render();
    clearTimeout(G.timer); SIM.on = false; showPvpDecision();
  }
}

// ---------- duelo ----------
function duelLink(d) { return pageUrl() + '#duelo=' + M.duelEncode(d); }
function duelSideHtml(s, win, lbl) {
  const sel = E.SELECOES[s.sel];
  return `<div class="dside ${win ? 'win' : ''}">${win ? '<div class="crown">👑</div>' : ''}<div class="eyebrow">${esc(lbl)}</div><div class="dn">${esc(s.n)}</div><div class="df">${sel.flag} ${esc(sel.curto)}</div><div class="dp num">${fmtN(s.p)}</div><div class="xs mut">${M.REACH[s.r]} · ${s.gf}-${s.ga}</div></div>`;
}
function duelCmpHtml(a, b, la, lb) {
  const w = M.duelWinner(a, b);
  const cell = (s, i) => { const h = s.h.find(x => x[0] === i); if (!h) return `<span class="dc no">—</span>`; const o = h[1] > h[2] || (h[3] != null && h[3] > h[4]) ? 'W' : h[1] < h[2] || (h[3] != null && h[3] < h[4]) ? 'L' : 'D'; return `<span class="dc ${o}">${h[1]}-${h[2]}${h[3] != null ? `<small>p ${h[3]}-${h[4]}</small>` : ''}</span>`; };
  return `<div class="duel"><div class="dhead2">${duelSideHtml(a, w === 0, la)}<div class="dvs">VS</div>${duelSideHtml(b, w === 1, lb)}</div>
    <div class="drows">${E.STAGES.map((s, i) => `<div class="dr">${cell(a, i)}<span class="dl">${s.curto}</span>${cell(b, i)}</div>`).join('')}</div>
    <div class="dwin">${w === -1 ? '🤝 Empate técnico!' : `🏆 ${esc((w === 0 ? a : b).n)} venceu o duelo!`}</div></div>`;
}
function renderDuelo() {
  const d = G.duelIn;
  if (!d) return go('home');
  if (d.b) {
    app.innerHTML = `<div class="topbar"><button class="chip" data-act="home">${ic('back')} Início</button><span class="sp"></span><span class="chip">${ic('dice')} ${esc(d.s)} · Nv ${d.l}</span></div>
    ${pageHead('Resultado do duelo', `${esc(d.a.n)} aceitou o desafio e devolveu. Rodada a rodada:`)}
    ${duelCmpHtml(d.b, d.a, 'Desafiante', 'Respondeu')}
    <div class="mctrl"><div class="row"><button class="btn sec" data-act="home">${ic('home')} Início</button><button class="btn gold" data-act="duelAccept">${ic('play')} Revanche</button></div></div>`;
    return;
  }
  const sel = E.SELECOES[d.a.sel];
  app.innerHTML = `<div class="topbar"><button class="chip" data-act="home">${ic('back')} Início</button><span class="sp"></span><span class="chip">${ic('users')} Duelo</span></div>
  <div class="duelin"><div class="eyebrow g">Você foi desafiado!</div><div class="disp" style="font-size:30px;font-style:italic;text-transform:uppercase;margin:4px 0">${esc(d.a.n)}</div>
    <p class="small" style="margin:0">jogou a Copa <b>${esc(d.s)}</b> (nível ${d.l}) com ${sel.flag} ${esc(sel.nome)} e fez</p>
    <div class="dp num" style="font-size:54px">${fmtN(d.a.p)}</div><div class="small">${M.REACH[d.a.r]} · ${d.a.h.length} jogos</div></div>
  <div class="panel"><div class="ph">${ic('info')} Como funciona</div><div class="small" style="display:grid;gap:6px"><div>• Mesma semente: mesmas seleções, técnicos sorteados, rivais e clima.</div><div>• O placar dele fica escondido até você terminar. Depois vem o comparativo rodada a rodada.</div><div>• Aí é só devolver o link com o seu resultado.</div></div></div>
  <div class="mctrl"><button class="btn gold shine" data-act="duelAccept">${ic('play')} Aceitar o duelo</button></div>`;
}

// ---------- fechamento da campanha: meta-jogo ----------
function metaFinalize(run, pts) {
  const st = G.store, R = { fom: Math.max(1, Math.floor(pts / 100)) };
  M.cosStore(st);
  st.fominhas += R.fom;
  R.liga = M.ligaAdd(st, pts);
  if (run.daily) R.streak = M.streakPlay(st, run.daily);
  R.missions = M.missionsCheck(st, run);
  R.album = M.albumCollect(st, run.players);
  R.coach = M.galleryAdd(st, run, pts);
  if (run.bolao) { R.bolao = M.bolaoSettle(run.bolao, M.reachIdx(run)); st.fominhas += R.bolao.payout; }
  if (run.legend) {
    const wk = run.legendWeek || M.isoWeek();
    if (!st.lenda || st.lenda.week !== wk) st.lenda = { week: wk, best: null, tries: 0, beat: 0 };
    st.lenda.tries++; if (st.lenda.best == null || pts > st.lenda.best) { st.lenda.best = pts; R.lendaRec = true; }
    if (run.status === 'champion') st.lenda.beat++;
  }
  if (run.duel) {
    const me = M.duelSide(run, st.coachName || 'Fominha', pts), them = run.duel.a, w = M.duelWinner(me, them);
    R.duel = { me, them, w };
    st.duels = [{ ts: Date.now(), vs: them.n, seed: run.seed, me: pts, them: them.p, win: w === 0 ? 1 : w === 1 ? 0 : -1 }].concat(st.duels || []).slice(0, 10);
  }
  return R;
}
function bolaoMark(b) { return b.hit ? `✅ <b style="color:var(--lime)">+${b.net}</b>` : b.beyond ? '↩️ foi além: aposta devolvida' : `❌ −${b.stake}`; }
function metaVerdictHtml(R, run) {
  if (!R) return '';
  let h = '';
  if (R.duel) h += `<div class="panel hl"><div class="ph">${ic('users')} Duelo</div>${duelCmpHtml(R.duel.me, R.duel.them, 'Você', 'Desafiante')}<button class="btn gold" style="margin-top:10px" data-act="duelReturn">${ic('share')} Devolver o desafio <small>copia o link</small></button></div>`;
  if (run.epics && run.epics.length) h += `<div class="panel"><div class="ph">⚡ Lances épicos da campanha <span class="r">${run.epics.length}</span></div>${run.epics.map((e, i) => `<button class="eprow" data-act="epicCard" data-i="${i}"><span class="ei">${e.icon}</span><span style="flex:1;text-align:left"><b>${esc(e.nome)}</b><small>${esc(e.scorer || '')} · ${e.min}' · ${e.oppFlag || ''} ${esc((e.opp || '').replace(/ \d{4}$/, ''))}</small></span><span class="chip">Ver card</span></button>`).join('')}</div>`;
  const rows = [];
  rows.push(`<div class="fline"><span>🪙 Fominhas da campanha (1 a cada 100 pts)</span><b>+${R.fom}</b></div>`);
  if (R.bolao) rows.push(`<div class="fline"><span>🎯 Bolão: palpite <b>${esc(M.BOLAO[R.bolao.guess].nome)}</b> · chegou <b>${esc(M.BOLAO[R.bolao.reach].nome)}</b>${R.bolao.hit ? ' · ACERTOU!' : R.bolao.beyond ? ' · foi além, aposta de volta' : ''}</span><b style="color:${R.bolao.net > 0 ? 'var(--lime)' : R.bolao.net < 0 ? '#ff9a9d' : '#fff'}">${R.bolao.net > 0 ? '+' : ''}${R.bolao.net}</b></div>`);
  R.missions.forEach(m => rows.push(`<div class="fline"><span>${ic('check')} Missão: ${esc(M.MISSIONS[m.id].txt)}</span><b>${m.cos ? cosChip(m.cos) : '+' + m.fominhas}</b></div>`));
  if (R.streak) rows.push(`<div class="fline"><span>🔥 Sequência do Desafio</span><b>${R.streak.cur} dia${R.streak.cur > 1 ? 's' : ''}${R.streak.novo ? ' · ' + R.streak.novo.icon + ' ' + esc(R.streak.novo.nome) : ''}</b></div>`);
  if (R.album.novos.length) rows.push(`<div class="fline"><span>${ic('card')} Figurinhas novas no álbum</span><b>+${R.album.novos.length}</b></div>`);
  R.album.kits.forEach(k => rows.push(`<div class="fline"><span>👕 Página completa! Uniforme liberado</span><b>${cosChip(k)}</b></div>`));
  if (R.lendaRec) rows.push(`<div class="fline"><span>${ic('trophy')} Recorde da semana no Técnico Lendário</span><b>${fmtN(G.store.lenda.best)}</b></div>`);
  h += `<div class="panel"><div class="ph">${ic('gift')} Recompensas <span class="r">🪙 ${fmtN(G.store.fominhas)}</span></div>${rows.join('')}</div>`;
  h += `<div class="panel"><div class="ph">${ic('rank')} Divisão da semana</div>${ligaBar(G.store)}</div>`;
  return h;
}
// ---------- atalhos de teste (não aparecem pro jogador) ----------
function setupRun(o) {
  o = o || {};
  G.pendingSeed = E.normalizeSeed(o.seed || '') || E.randomSeed(); G.pendingLevel = o.level || 1; G.pendingDaily = o.daily || null; G.pendingLegend = o.legend || null; G.pendingDuel = o.duel || null; G.pendingBolao = o.bolao || null;
  newRunFromPending(E.selecaoChoices(G.pendingSeed)[o.sel || 0]);
  const d = E.coachDraftNew(G.run.seed);
  while (!d.done) { const c = E.COACH_BY_ID[d.current]; const free = E.COACH_ATTR_IDS.filter(a => !d.slots[a]); E.draftPick(d, free.reduce((x, a) => c.s[a] > c.s[x] ? a : x, free[0])); }
  G.run.coach = E.makeCoach(G.store.coachName || 'Professor Fominha', d.slots);
  if (o.stage) G.run.stage = o.stage;
  if (!o.noGo) go('hub');
}
function autoRun(o) {
  o = o || {}; setupRun({ ...o, noGo: true });
  let guard = 0;
  while (G.run.status === 'playing' && guard++ < 12) {
    const m = E.createMatch(G.run); applyDebug(m);
    E.simulateRest(m, mm => { const pl = E.playableCards(mm); return pl.length ? pl[0] : null; });
    G.match = m; G.result = E.finishMatch(G.run, m);
    if (G.result.reward && G.run.status === 'playing') { const off = E.genRewards(G.run); const it = off.find(x => x.type === 'player' || !E.needsTarget(G.run, x)); if (it) E.applyItem(G.run, it); }
  }
  finalizeRun(); go('verdict');
}
function quickMatch() { const m = E.createMatch(G.run); applyDebug(m); E.simulateRest(m, () => null); G.match = m; G.result = E.finishMatch(G.run, m); if (G.run.status !== 'playing') finalizeRun(); go('result'); }
function newRunFromPending(selId) {
  const st = G.store;
  G.run = E.newRun(G.pendingSeed, G.pendingLevel, selId, null, { legend: G.pendingLegend });
  G.run.daily = G.pendingDaily; G.run.legendWeek = G.pendingLegend ? M.isoWeek() : null; G.run.duel = G.pendingDuel || null;
  if (G.cup && G.cup.seed === G.run.seed) {
    G.run.cupRole = G.cup.role; G.run.cupId = G.cup.id;
    G.cup.built = FFBracket.buildCup(G.run.seed);
    FFBracket.groupOpponents(G.cup.built, G.cup.role).forEach((o, i) => { G.run.opponents[i] = o; });
    try { sessionStorage.setItem('ffcup', G.cup.id); } catch (e) { /* ignora */ }
  }
  if (G.pendingBolao && G.pendingDaily) { const b = G.pendingBolao; M.cosStore(st); if (b.stake > st.fominhas) b.stake = 0; st.fominhas -= b.stake; G.run.bolao = b; }
  G.pendingBolao = null;
  M.albumCollect(st, G.run.players); saveStore();
}

// ---------- ações ----------
document.addEventListener('click', onClick);
document.addEventListener('keydown', ev => { if ((ev.key === 'Enter' || ev.key === ' ') && ev.target.matches && ev.target.matches('[role=button][data-act]')) { ev.preventDefault(); ev.target.click(); } });
function renderCareer() {
  const C = window.FFCareer; if (!C) return;
  const extra = G.screen === 'carCriar' ? G.carDraft : G.screen === 'carMuseu' ? (G.carExtra || C.loadStore()) : G.screen === 'carHome' ? C.loadStore() : G.carExtra;
  app.innerHTML = C.view(G.screen, G.career, extra);
  if (G.screen === 'carHome') {
    const bar = app.querySelector('.topbar');
    if (bar && !bar.querySelector('.snddock')) bar.insertAdjacentHTML('beforeend', sndDockHtml());
  }
  app.classList.toggle('hasdock', !!app.querySelector('.mctrl'));
  if (G.screen === 'carFim' && G.career && G.career.summary && G.career.summary.fire && !RM()) {
    setTimeout(() => confettiBurst(['#ffc83d', '#c6ff3d', '#fff', '#ff5a5f'], 42), 180);
    if (window.FFAudio && !G.firePlayed) { G.firePlayed = G.career.year; FFAudio.fanfare(); }
  }
  if (G.screen !== 'carFim') G.firePlayed = 0;
  if (G.screen === 'carMentor') {
    const win = app.querySelector('.rcard.win');
    const strip = app.querySelector('.roulette .strip');
    if (win && strip) {
      const box = strip.parentElement.clientWidth || 320;
      const x = -Math.max(0, win.offsetLeft - (box - win.offsetWidth) / 2);
      strip.style.transition = 'none';
      strip.style.transform = 'translateX(' + (x - 70) + 'px)';
      void strip.offsetWidth;
      if (!RM()) strip.style.transition = '';
      strip.style.transform = 'translateX(' + x + 'px)';
    }
    if (window.FFAudio && G.mentorPlayed !== (G.career && G.career.seasons)) {
      G.mentorPlayed = G.career.seasons; FFAudio.pack(); setTimeout(() => FFAudio.fanfare(), RM() ? 0 : 700);
    }
  }
}
function sndDockHtml() {
  const s = window.FFAudio ? FFAudio.settings() : { on: true, vol: 0.25 };
  const on = s.on && s.vol > 0.001;
  return `<div class="snddock ${on ? '' : 'off'}"><button type="button" class="sndbtn" data-act="somToggle" aria-pressed="${on ? 'true' : 'false'}" aria-label="${on ? 'Silenciar' : 'Ligar o som'}">${ic(on ? 'vol' : 'mute')}</button><input data-act="somVol" type="range" min="0" max="100" value="${Math.round(s.vol * 100)}" aria-label="Volume"></div>`;
}
function paintSnd() {
  const s = window.FFAudio ? FFAudio.settings() : { on: true, vol: 0.25 };
  const on = s.on && s.vol > 0.001;
  document.querySelectorAll('.snddock').forEach(dock => {
    dock.classList.toggle('off', !on);
    const btn = dock.querySelector('[data-act=somToggle]');
    if (btn) {
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      btn.setAttribute('aria-label', on ? 'Silenciar' : 'Ligar o som');
      btn.innerHTML = ic(on ? 'vol' : 'mute');
    }
    const range = dock.querySelector('[data-act=somVol]');
    if (range && range !== document.activeElement) range.value = String(Math.round(s.vol * 100));
  });
}
function somSheet() {
  const A = window.FFAudio; if (!A) return;
  document.querySelectorAll('.modal.somm').forEach(x => x.remove());
  const s = A.settings();
  const m = document.createElement('div'); m.className = 'modal somm';
  m.innerHTML = `<div class="box sombox"><div class="eyebrow g">Som do estádio</div><h3 class="ttl" style="margin-top:4px">Arquibancada</h3>
    <p class="sub">Música, torcida, apito, chute e rede são gravações. O volume fica neste aparelho e a música só entra depois do primeiro toque.</p>
    ${sndDockHtml()}
    <button class="btn sec" data-x="1">Fechar</button></div>`;
  m.addEventListener('click', ev => { if (ev.target === m || ev.target.closest('[data-x]')) m.remove(); });
  document.body.appendChild(m);
}
function syncCarName() {
  const el = document.getElementById('carName');
  if (el && G.carDraft) G.carDraft.nome = el.value.slice(0, 24);
}
function patchDraft() {
  const d = G.carDraft;
  if (!d) return;
  const chip = app.querySelector('.topbar .chip:last-child');
  if (chip) chip.textContent = d.left + ' pontos';
  app.querySelectorAll('.panel .ph .r').forEach(r => {
    if (r.textContent.indexOf('60 a 78') === 0) r.textContent = '60 a 78 · ' + d.left + ' para distribuir';
  });
  app.querySelectorAll('.prow').forEach(row => {
    const minus = row.querySelector('[data-act=carMinus]');
    const plus = row.querySelector('[data-act=carPlus]');
    if (!minus) return;
    const a = minus.dataset.a;
    const b = row.querySelector('b');
    if (b) b.textContent = d.nums[a];
    minus.disabled = d.nums[a] <= 60;
    if (plus) plus.disabled = d.nums[a] >= 78 || d.left <= 0;
  });
  const start = app.querySelector('[data-act=carStart]');
  if (start) start.disabled = d.left !== 0;
}
function releaseHold() {
  G.held = false;
  document.querySelectorAll('.goalfx,.epicfx.hold,.banner.hold').forEach(x => x.remove());
  const pz = $('#pz'); if (pz) pz.classList.remove('ez');
  SIM.epic = null; SIM.celebrate = -1;
  if (SIM.ball) { SIM.ball.x = 50; SIM.ball.y = 50; }
  if (G.screen === 'match') tick();
}
function carGo(res) {
  if (!res) return;
  if (res.msg) toast(res.msg);
  FFCareer.persist(G.career);
  go(res.screen || FFCareer.screenFor(G.career));
}
function startCareerLive() {
  const run = FFCareer.liveRun(G.career);
  if (!run) return toast('Esse jogo já passou.');
  G.run = run;
  G.match = E.createMatch(run);
  if (run.careerHome) {
    const b = G.match.base[0];
    G.match.base[0] = { atk: b.atk + 1.4, mid: b.mid + 1.2, def: b.def + 1.1, gk: b.gk };
  }
  if (run.careerKo) G.match.ko = true;
  applyDebug(G.match);
  G.speed = 1;
  go('match');
}
function onClick(ev) {
  const el = ev.target.closest('[data-act]'); if (!el || el.disabled) return;
  const a = el.dataset.act;
  if (window.FFAudio) {
    FFAudio.unlock();
    const ownSound = { speed: 1, somVol: 1, somToggle: 1, somOn: 1, carMentorOk: 1 };
    const backActs = { home: 1, carHome: 1, carBackHub: 1, leaveShop: 1 };
    const confirmActs = { start: 1, daily: 1, play: 1, carStart: 1, carAccept: 1, afterResult: 1, cdone: 1, bgo: 1 };
    if (a === 'usecard' || a === 'carOpt' || a === 'carLive' || a === 'takeReward') FFAudio.playCard();
    else if (a === 'openPack') FFAudio.pack();
    else if (backActs[a]) FFAudio.back();
    else if (confirmActs[a]) FFAudio.confirm();
    else if (!ownSound[a]) FFAudio.click();
  }
  if (navigator.vibrate && !RM()) try { navigator.vibrate(8); } catch (er) { /* sem vibração */ }
  switch (a) {
    case 'level': {
      const n = +el.dataset.n, l = E.LEVELS[n - 1];
      if (l.locked) return toast('Em breve! 🔒');
      if (n > G.store.unlocked) return toast(`Seja campeão no nível ${n - 1} pra liberar 🔒`);
      G.pendingSeed = $('#seedIn') ? $('#seedIn').value : G.pendingSeed;
      G.store.level = n; saveStore(); renderHome(); break;
    }
    case 'start': startRun($('#seedIn') ? $('#seedIn').value : ''); break;
    case 'daily': go('daily'); break;
    case 'playDaily': bolaoSheet(); break;
    case 'bguess': G.bolaoPick.guess = +el.dataset.i; G.bolaoDraw(); break;
    case 'bstake': G.bolaoPick.stake = +el.dataset.s; G.bolaoDraw(); break;
    case 'bgo': { const b = { ...G.bolaoPick }; startRun(dailySeed(), todayKey()); G.pendingBolao = b.stake ? b : null; break; }
    case 'tab': go(el.dataset.t); break;
    case 'apage': G.albumPage = el.dataset.p; renderAlbum(); syncTabbar(); break;
    case 'costab': G.cosTab = el.dataset.t; renderPerfil(); break;
    case 'equip': if (M.equipCos(G.store, el.dataset.id)) { saveStore(); toast('Equipado! ✨'); renderPerfil(); } break;
    case 'buycos': if (M.buyCos(G.store, el.dataset.id)) { M.equipCos(G.store, el.dataset.id); saveStore(); toast('Comprado e equipado! 🪙'); renderPerfil(); } else toast('Fominhas insuficientes'); break;
    case 'playLegend': { const wk = M.isoWeek(); startRun(M.legendSeed(wk), null); G.pendingLegend = M.legendOfWeek(wk); G.pendingLevel = 1; render(); break; }
    case 'epicSel': G.epicIdx = +el.dataset.i; renderResult(); break;
    case 'epicPng': downloadEpic(el.dataset.i === 'm' ? G.epicModal : { ...G.result.epics[+el.dataset.i], seed: G.run.seed }); break;
    case 'epicCard': epicModal(G.run.epics[+el.dataset.i]); break;
    case 'liveDuel': openLiveDuel($('#seedIn') ? $('#seedIn').value : ''); break;
    case 'cupTeam': G.pendingSeed = G.cup.seed; G.pendingLevel = G.cup.level; G.pendingDaily = null; G.pendingLegend = null; G.pendingDuel = null; go('selecao'); break;
    case 'cupCopy': { const url = G.lastDuelLink || (pageUrl() + location.hash); copyText(url).then(ok => toast(ok ? 'Link do duelo copiado!' : url)); break; }
    case 'cupBack': go(G.run && G.run.stage >= 3 && !G.cup.koSeen ? 'chave' : 'hub'); break;
    case 'cupBoard': if (G.cup) { G.cup.mode = G.run && G.run.stage >= 3 ? 'ko' : 'start'; G.screen = 'chave'; render(); } break;
    case 'cupRetry': cupRetry(); break;
    case 'queue': toggleHand(el.dataset.c); break;
    case 'pvpcard': pvpChoose(el.dataset.c || ''); break;
    case 'duelLink': { const d = { v: 1, s: G.run.seed, l: G.run.level, a: M.duelSide(G.run, G.store.coachName || 'Fominha', G.verdict.points) }; const url = duelLink(d); G.lastDuelLink = url; copyText(`⚔️ Duelo no Fominha FC! Fiz ${fmtN(G.verdict.points)} pts na Copa ${G.run.seed}. Duvido você me passar: ${url}`).then(ok => toast(ok ? 'Link do duelo copiado! Manda no grupo ⚔️' : 'Não deu pra copiar o link')); break; }
    case 'duelReturn': { const R = G.metaRes.duel; const d = { v: 1, s: G.run.seed, l: G.run.level, a: R.me, b: R.them }; const url = duelLink(d); G.lastDuelLink = url; copyText(`⚔️ Respondi teu duelo no Fominha FC: ${fmtN(R.me.p)} x ${fmtN(R.them.p)}. Confere: ${url}`).then(ok => toast(ok ? 'Resposta copiada! Devolve pro amigo ⚔️' : 'Não deu pra copiar')); break; }
    case 'duelAccept': { const d = G.duelIn; const duel = d.b ? { v: 1, s: d.s, l: d.l, a: d.a } : d; startRun(d.s, null); G.pendingLevel = d.l; G.pendingDuel = duel; history.replaceState(null, '', publicPath()); render(); break; }
    case 'howto': howtoModal(); break;
    case 'home': G.pendingSeed = ''; go('home'); break;
    case 'pick': newRunFromPending(el.dataset.id); G.draft = E.coachDraftNew(G.run.seed); toast(`${selOf(G.run).flag} ${selOf(G.run).nome} na Copa!`); G.screen = 'coach'; render(); spinCoach(); break;
    case 'cpick': if (E.draftPick(G.draft, el.dataset.a)) { if (G.draft.done) { renderCoach(); toast('Técnico montado!'); } else spinCoach(); } break;
    case 'creroll': if (E.draftReroll(G.draft)) spinCoach(); break;
    case 'cdone': { const nm = ($('#coachName') && $('#coachName').value.trim()) || G.store.coachName || 'Professor Fominha'; G.store.coachName = nm; saveStore(); G.run.coach = E.makeCoach(nm, G.draft.slots); gc('tecnico-criado', 'Técnico criado'); gc('copa-iniciada', 'Copa iniciada'); if (G.run.daily) gc('desafio-do-dia', 'Desafio do dia'); go('hub'); break; }
    case 'play': G.match = E.createMatch(G.run); applyDebug(G.match); go('match'); break;
    case 'speed': G.speed = G.speed === 1 ? 2 : G.speed === 2 ? 3 : 1; el.innerHTML = `${ic('fast')} ${G.speed}x`; break;
    case 'usecard': useCard(el.dataset.c); break;
    case 'afterResult': afterResult(); break;
    case 'openPack': {
      el.classList.add('open'); G.packOpen = true; G.flipNow = true;
      setTimeout(() => { if (G.screen === 'reward') renderReward(); }, RM() ? 0 : 450); break;
    }
    case 'takeReward': takeReward(+el.dataset.i); break;
    case 'rerollReward': { const o = E.rerollRewards(G.run); if (o) { G.offers = o; G.flipNow = true; renderReward(); } break; }
    case 'skipReward': G.run.fichas += 1; toast('+1 ficha'); if (G.result && G.result.shop) { G.shop = E.genShop(G.run); go('shop'); } else go('hub'); break;
    case 'buy': buy(+el.dataset.i); break;
    case 'rerollShop': { const s = E.rerollShop(G.run); if (s) { G.shop = s; renderShop(); } break; }
    case 'sell': { const v = E.sellRelic(G.run, el.dataset.id); toast(`Vendida por ${v} fichas`); renderShop(); break; }
    case 'leaveShop': go('hub'); break;
    case 'share': shareCard(); break;
    case 'challenge': copyText(shareText(G.verdict)).then(ok => toast(ok ? 'Convite copiado! Manda no grupo 📲' : 'Semente: ' + G.verdict.seed)); break;
    case 'again': G.pendingSeed = ''; startRun(''); break;
    case 'sameSeed': startRun(G.run.seed, G.run.daily); break;
    case 'info': showInfo(el.dataset.k, el.dataset.id); break;
    case 'tipok': G.store.tips[el.dataset.k] = 1; saveStore(); el.closest('.tip').remove(); break;
    case 'tipskip': G.store.tipsOff = true; saveStore(); document.querySelectorAll('.tip').forEach(x => x.remove()); break;
    case 'som': somSheet(); break;
    case 'somToggle': {
      const A = window.FFAudio; if (!A) break;
      const s = A.settings();
      const sounding = s.on && s.vol > 0.001;
      if (sounding) A.setOn(false);
      else {
        if (s.vol <= 0.001) A.setVol(0.25);
        A.setOn(true);
        A.musicStart();
        if (G.screen === 'match') A.crowdStart();
        A.confirm();
      }
      paintSnd();
      break;
    }
    case 'somOn': { const A = window.FFAudio; if (!A) break; A.setOn(!A.settings().on); if (A.settings().on) { A.unlock(); A.musicStart(); A.confirm(); } somSheet(); break; }
    case 'carOpen': G.screen = 'carHome'; render(); break;
    case 'carNew': G.carSlot = +el.dataset.i || 0; G.carDraft = FFCareer.draftNew(G.pendingSeed || 'FOMINHA'); go('carCriar'); break;
    case 'carCont': { const st = FFCareer.loadStore(); G.career = st.slots[+el.dataset.i]; if (G.career) { G.career.slot = +el.dataset.i; go(FFCareer.screenFor(G.career)); } break; }
    case 'carMuseu': G.carExtra = FFCareer.loadStore(); go('carMuseu'); break;
    case 'carPlus': syncCarName(); { const d = G.carDraft, attr = el.dataset.a; if (d && d.left > 0 && d.nums[attr] < 78) { d.nums[attr]++; d.left--; patchDraft(); } break; }
    case 'carMinus': syncCarName(); { const d = G.carDraft, attr = el.dataset.a; if (d && d.nums[attr] > 60) { d.nums[attr]--; d.left++; patchDraft(); } break; }
    case 'carClub': if (G.carDraft) { G.carDraft.clubId = el.dataset.id; render(); } break;
    case 'carStart': {
      syncCarName(); const d = G.carDraft; if (!d || d.left !== 0) return toast('Distribua os 18 pontos.');
      G.career = FFCareer.create({ seed: d.seed, nome: d.nome || 'Professor', nums: d.nums, clubId: d.clubId, slot: G.carSlot || 0, policy: 'play' });
      gc('carreira-iniciada', 'Carreira iniciada');
      FFCareer.persist(G.career); go('carHub'); break;
    }
    case 'carJump': { const before = G.career ? G.career.seasons : 0; carGo(FFCareer.pump(G.career, 'jump')); noteSeasons(before); break; }
    case 'carOne': { const before = G.career ? G.career.seasons : 0; carGo(FFCareer.pump(G.career, 'one')); noteSeasons(before); break; }
    case 'carLive': startCareerLive(); break;
    case 'carSkip': { const before = G.career ? G.career.seasons : 0; carGo(FFCareer.skipLive(G.career)); noteSeasons(before); break; }
    case 'carTabela': go('carTabela'); break;
    case 'carInboxBtn': go('carInbox'); break;
    case 'carBackHub': go(G.career ? FFCareer.screenFor(G.career) : 'carHome'); break;
    case 'carHome': go('carHome'); break;
    case 'carOpt': FFCareer.chooseDecision(G.career, +el.dataset.i); FFCareer.persist(G.career); go(FFCareer.screenFor(G.career)); break;
    case 'carAccept': {
      FFCareer.acceptOffer(G.career, el.dataset.id);
      if (FFCareer.closeInbox(G.career)) { FFCareer.persist(G.career); go(FFCareer.screenFor(G.career)); }
      else { FFCareer.persist(G.career); render(); toast('Escolha um clube ou encerre a carreira.'); }
      break;
    }
    case 'carReject': FFCareer.rejectOffer(G.career, el.dataset.id); FFCareer.persist(G.career); render(); break;
    case 'carNeg': FFCareer.negotiate(G.career, el.dataset.id); render(); break;
    case 'carInboxOk': if (FFCareer.closeInbox(G.career)) { FFCareer.persist(G.career); go(FFCareer.screenFor(G.career)); } else toast('Escolha um clube ou encerre a carreira.'); break;
    case 'carMentorOk': FFCareer.lockMentor(G.career); FFCareer.persist(G.career); if (window.FFAudio) FFAudio.level(); go(FFCareer.screenFor(G.career)); break;
    case 'carAck': FFCareer.ackSummary(G.career); FFCareer.persist(G.career); go(FFCareer.screenFor(G.career)); break;
    case 'carRetire': FFCareer.retire(G.career, 'pedido'); go('carDoc'); break;
    case 'carShare': { const d = G.career && (G.career.doc || G.career); copyText(FFCareer.shareText(d)).then(ok => toast(ok ? 'Retrospectiva copiada!' : 'Não deu pra copiar')); break; }
    case 'carReport': go('carReport'); break;
    case 'carReportOk': go(G.career ? FFCareer.screenFor(G.career) : 'carHome'); break;
    case 'carPens': {
      const r = G.career && G.career.report;
      if (r && r.pens) showShootout({ kicks: r.pens, leftName: FFCareer.clubOf(G.career.clubId).curto, rightName: FFCareer.clubOf(r.foeId).curto });
      break;
    }
    case 'tapgo': releaseHold(); break;
    case 'penskip': if (G.penSkip) G.penSkip(); break;
  }
}
// expõe para testes/screenshot
function previewCards(which) {
  window.__noTips = true;
  const run = E.newRun('CARDS1', 1, 'bra82', E.makeCoach('Patrick', E.flatCoach(82, 'Patrick').slots));
  run.fichas = 20;
  G.store.coachName = 'Patrick';
  G.cup = null;
  const openMatch = (cards, hand) => {
    run.cards = cards;
    G.run = run;
    G.match = E.createMatch(run);
    G.match.minute = 23; G.match.score = [0, 1]; G.match.awaiting = true;
    G.shownScore = [0, 1]; G.goalMarks = []; G.mst = { poss: [1, 1], shots: [0, 0], saves: [0, 0] };
    G.screen = 'match'; render();
    clearTimeout(G.timer); SIM.on = false;
    showDecision();
    G.hand = hand.slice();
    paintDecision();
  };
  if (which === 'momento') { openMatch(['pressao', 'chuveirinho', 'casinha', 'toque'], ['chuveirinho']); return; }
  if (which === 'golpe') {
    openMatch(['pressao', 'contra', 'toque', 'casinha'], ['pressao']);
    G.match.fxOpp.style = 'posse'; G.match.fxOpp.styleUntil = 90; G.match.fxOpp.styleCard = 'toque';
    paintDecision();
    flashBanner({ kind: 'counter', text: 'CONTRA-GOLPE! Pressão Alta quebra Posse e ganha +10% de chance de gol por 10 min.' });
    return;
  }
  if (which === 'combo') {
    run.relics = ['cabeca_ouro'];
    openMatch(['pressao', 'submagica', 'chuveirinho', 'grito'], ['pressao']);
    flashBanner({ kind: 'combo', text: 'Blitz! A pressão segue e o cansaço não chega.' });
    return;
  }
  if (which === 'info') {
    run.cards = ['craque', 'pressao', 'paredao', 'catimba'];
    run.cardLv = { craque: 2 };
    G.run = run; G.screen = 'hub'; render();
    showInfo('card', 'craque');
    return;
  }
  if (which === 'pacote') {
    run.cards = ['casinha', 'submagica'];
    run.cardLv = {};
    G.run = run;
    G.offers = [{ type: 'card', id: 'pressao' }, { type: 'card', id: 'craque' }, { type: 'card', id: 'chuveirinho' }];
    G.packOpen = true; G.screen = 'reward'; render();
    return;
  }
  if (which === 'nivel') {
    run.cardLv = { pressao: 3, craque: 2 };
    openMatch(['pressao', 'craque', 'casinha', 'grito'], ['pressao']);
  }
}
function previewCareer(which) {
  window.__noTips = true;
  if (which === 'som') { G.screen = 'home'; render(); somSheet(); return; }
  if (which === 'relato') {
    const d = FFCareer.demo('hub');
    G.career = d.career;
    if (G.career && G.career.phase === 'season') FFCareer.skipLive(G.career);
    G.screen = 'carReport'; render(); return;
  }
  if (which === 'penaltis') {
    G.screen = 'home'; render();
    showShootout({
      pauseAt: 2, leftName: 'FLA', rightName: 'VAS',
      kicks: [
        { side: 0, nome: 'Pedro Alves', ok: true, keeper: 'Carlos Souza' },
        { side: 1, nome: 'Lucas Ribeiro', ok: true, keeper: 'João Silva' },
        { side: 0, nome: 'Caio Mendes', ok: false, keeper: 'Carlos Souza' },
        { side: 1, nome: 'Diego Costa', ok: true, keeper: 'João Silva' },
        { side: 0, nome: 'André Lima', ok: true, keeper: 'Carlos Souza' }
      ]
    });
    return;
  }
  if (which === 'overlay' || which === 'epic2') {
    const run = E.newRun('EPIC3', 1, 'bra82', E.makeCoach('Patrick', E.flatCoach(80, 'Patrick').slots));
    G.run = run; G.match = E.createMatch(run); G.speed = 3; G.screen = 'match'; G.shownScore = [1, 0];
    render(); clearTimeout(G.timer); SIM.on = false; G.held = true;
    const id = which === 'epic2' ? 'cobertura' : 'bicicleta';
    const nome = id === 'cobertura' ? 'Gol de Cobertura' : 'Gol de Bicicleta';
    epicFx({ epic: { id, nome, icon: id === 'cobertura' ? '🌈' : '🚲', scorer: 'Rafael Silva', min: 41, frase: nome.toUpperCase() + '! PODE PARAR O JOGO!', score: [1, 0] }, side: 0, kind: 'goal', min: 41 }, 3);
    return;
  }
  if (which === 'lesao' || which === 'protesto' || which === 'joia') {
    const d = FFCareer.demo('decisao');
    G.career = d.career;
    G.career.decision = FFCareer.sampleDecision(which);
    G.screen = 'carDec'; render(); return;
  }
  const d = FFCareer.demo(which === 'acesso' ? 'fogos' : which);
  G.career = d.career || null;
  G.carDraft = which === 'criar' ? d.extra : G.carDraft;
  G.carExtra = d.extra;
  if (which === 'jogo' && d.career) {
    G.career = d.career;
    let guard = 0;
    while (G.career.phase === 'season' && !FFCareer.isKey(G.career) && guard++ < 40) FFCareer.pump(G.career, 'one');
    startCareerLive();
    if (G.match) { G.match.minute = 28; G.match.score = [1, 0]; G.match.awaiting = true; G.shownScore = [1, 0]; }
    render();
    clearTimeout(G.timer); SIM.on = false;
    showDecision();
    return;
  }
  G.screen = d.screen; render();
}
window.FFUI = { G, M, go, render, runPoints, dailySeed, drawCard, autoRun, setupRun, quickMatch, epicPNG, saveStore, applyDebug, previewDuel, previewCards, previewCareer, somSheet, paintDecision, paintPvp };
document.addEventListener('input', ev => {
  const t = ev.target; if (!t) return;
  if (t.id === 'coachName') { G.store.coachName = t.value.trim() || 'Professor Fominha'; saveStore(); }
  if (t.dataset && t.dataset.act === 'somVol' && window.FFAudio) {
    const A = FFAudio;
    A.unlock();
    const v = Math.max(0, Math.min(1, (+t.value || 0) / 100));
    A.setVol(v);
    if (v > 0.001 && !A.settings().on) A.setOn(true);
    if (v > 0.001) { A.musicStart(); if (G.screen === 'match') A.crowdStart(); }
    paintSnd();
  }
});
function readDuelHash() {
  const h = location.hash.match(/duelo=([A-Za-z0-9_-]+)/);
  if (!h) return false;
  const d = M.duelDecode(h[1]);
  if (!d) { toast('Link de duelo inválido'); return false; }
  if (d.v === 2) {
    let role = 1;
    try { if (sessionStorage.getItem('ffcup') === d.id) role = 0; } catch (e) { /* ignora */ }
    G.cup = { id: d.id, seed: d.s, level: d.l, host: d.host, role, mode: 'start', koSeen: false, status: 'connecting', friend: null };
    if (role !== 0) gc('duelo-entrou-pelo-link', 'Entrou pelo link');
    restoreSnap();
    G.screen = 'chave';
    if (G.cup.final && G.cup.final.home && G.cup.final.locks && G.cup.final.locks.length && G.run && G.run.stage >= 6 && G.run.status === 'playing') setTimeout(() => resumeFinal(G.cup.final), 20);
    setTimeout(cupConnect, 40);
    return true;
  }
  G.duelIn = d; G.screen = 'duelo';
  gc('duelo-entrou-pelo-link', 'Entrou pelo link');
  return true;
}
window.addEventListener('hashchange', () => { if (readDuelHash()) render(); });
readDuelHash();
render();
})();
