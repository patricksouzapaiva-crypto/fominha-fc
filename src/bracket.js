/* Chave compartilhada do duelo. Os dois humanos ficam em metades opostas e só podem se cruzar na final. */
(function (root) {
  'use strict';
  const E = typeof module !== 'undefined' && module.exports ? require('./engine.js') : root.FFEngine;
  const LETTERS = 'ABCDEFGH';
  const TIER_STR = { A: 52, B: 57, C: 62, D: 66 };
  const EXTRA = [
    { nome: 'México 1986', flag: '🇲🇽', scorers: ['Hugo Sánchez', 'Negrete', 'Boy'], gk: 'Larios', tier: 'B' },
    { nome: 'Bélgica 1986', flag: '🇧🇪', scorers: ['Ceulemans', 'Scifo', 'Claesen'], gk: 'Pfaff', tier: 'C' },
    { nome: 'Colômbia 1994', flag: '🇨🇴', scorers: ['Valderrama', 'Asprilla', 'Rincón'], gk: 'Córdoba', tier: 'B' },
    { nome: 'Irlanda 1990', flag: '🇮🇪', scorers: ['Aldridge', 'Houghton', 'McGrath'], gk: 'Bonner', tier: 'A' },
    { nome: 'Rússia 2018', flag: '🇷🇺', scorers: ['Dzyuba', 'Cheryshev', 'Golovin'], gk: 'Akinfeev', tier: 'B' },
    { nome: 'Marrocos 2022', flag: '🇲🇦', scorers: ['En-Nesyri', 'Ziyech', 'Hakimi'], gk: 'Bounou', tier: 'C' },
    { nome: 'Japão 2022', flag: '🇯🇵', scorers: ['Mitoma', 'Maeda', 'Doan'], gk: 'Gonda', tier: 'B' }
  ];
  // Oitavas: metade esquerda (grupos A–D) e metade direita (E–H) não se cruzam antes da final.
  const R16 = [
    [{ g: 0, rank: 1 }, { g: 1, rank: 2 }],
    [{ g: 2, rank: 1 }, { g: 3, rank: 2 }],
    [{ g: 1, rank: 1 }, { g: 0, rank: 2 }],
    [{ g: 3, rank: 1 }, { g: 2, rank: 2 }],
    [{ g: 4, rank: 1 }, { g: 5, rank: 2 }],
    [{ g: 6, rank: 1 }, { g: 7, rank: 2 }],
    [{ g: 5, rank: 1 }, { g: 4, rank: 2 }],
    [{ g: 7, rank: 1 }, { g: 6, rank: 2 }]
  ];
  const QF = [[0, 1], [2, 3], [4, 5], [6, 7]];
  const SF = [[0, 1], [2, 3]];
  const HUMAN_GROUP = [0, 4];

  function pool() {
    const out = [];
    Object.keys(E.OPPONENTS).forEach(tier => E.OPPONENTS[tier].forEach(o => out.push({ ...o, str: TIER_STR[tier], scorerW: o.scorerW || [3, 2, 1] })));
    EXTRA.forEach(o => out.push({ ...o, str: TIER_STR[o.tier], scorerW: [3, 2, 1] }));
    return out;
  }
  function slotsOf(group, rank) {
    const r16 = R16.findIndex(p => p.some(x => x.g === group && x.rank === rank));
    const qf = QF.findIndex(p => p.indexOf(r16) >= 0);
    const sf = SF.findIndex(p => p.indexOf(qf) >= 0);
    return { r16, qf, sf, final: 0 };
  }
  function cpuPlay(seed, a, b, key) {
    const r = E.rngFor(seed, 'cpu', key);
    const d = ((a.str || 55) - (b.str || 55)) / 10;
    let gf = 0, ga = 0;
    for (let i = 0; i < 5; i++) {
      if (r.chance(Math.max(0.06, Math.min(0.42, 0.16 + d * 0.02)))) gf++;
      if (r.chance(Math.max(0.06, Math.min(0.42, 0.16 - d * 0.02)))) ga++;
    }
    if (gf === ga) { if (r.chance(0.5 + d * 0.04)) gf++; else ga++; }
    return [gf, ga];
  }
  function table(teams, played) {
    const rows = teams.map((t, i) => ({ i, t, pts: 0, gf: 0, ga: 0 }));
    for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) {
      const sc = played[i + '-' + j];
      if (!sc) continue;
      rows[i].gf += sc[0]; rows[i].ga += sc[1];
      rows[j].gf += sc[1]; rows[j].ga += sc[0];
      if (sc[0] > sc[1]) rows[i].pts += 3;
      else if (sc[1] > sc[0]) rows[j].pts += 3;
      else { rows[i].pts++; rows[j].pts++; }
    }
    rows.sort((a, b) => b.pts - a.pts || (b.gf - b.ga) - (a.gf - a.ga) || b.gf - a.gf || a.i - b.i);
    return rows;
  }
  function buildCup(seed) {
    seed = E.normalizeSeed(seed) || 'COPA';
    const r = E.rngFor(seed, 'chave');
    const cpus = r.shuffle(pool()).slice(0, 30);
    let k = 0;
    const groups = [];
    for (let g = 0; g < 8; g++) {
      const teams = [];
      for (let s = 0; s < 4; s++) {
        if ((g === 0 && s === 0) || (g === 4 && s === 0)) teams.push({ human: g === 0 ? 0 : 1, nome: g === 0 ? 'Você' : 'Amigo', flag: '⚽', str: 60, scorers: [], gk: '', placeholder: true });
        else teams.push({ ...cpus[k++], human: null });
      }
      const played = {};
      for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) {
        if (teams[i].human != null || teams[j].human != null) continue;
        played[i + '-' + j] = cpuPlay(seed, teams[i], teams[j], 'g' + g + '-' + i + '-' + j);
      }
      groups.push({ id: LETTERS[g], index: g, half: g < 4 ? 0 : 1, teams, played });
    }
    const cup = { seed, groups, letters: LETTERS };
    cup.ko = [0, 1].map(role => [1, 2].map(rank => koPath(cup, role, rank)));
    return cup;
  }
function qualifier(cup, g, rank) {
  const group = cup.groups[g];
  const human = group.teams.findIndex(t => t.human != null);
  if (human >= 0 && [1, 2, 3].some(j => !group.played['0-' + j])) return null;
  const rows = table(group.teams, group.played);
  const row = rows[rank - 1];
  if (!row || row.t.human != null) return null;
  return row.t;
}
  function koPath(cup, role, rank) {
    const g = HUMAN_GROUP[role];
    const sl = slotsOf(g, rank);
    const pair = R16[sl.r16];
    const other = pair[0].g === g && pair[0].rank === rank ? pair[1] : pair[0];
    const r16 = qualifier(cup, other.g, other.rank);
    const qfPair = QF[sl.qf];
    const otherR16 = qfPair[0] === sl.r16 ? qfPair[1] : qfPair[0];
    const qf = winnerOfR16(cup, otherR16);
    const sfPair = SF[sl.sf];
    const otherQf = sfPair[0] === sl.qf ? sfPair[1] : sfPair[0];
    const sf = winnerOfQf(cup, otherQf, role);
    return { rank, slots: sl, r16, qf, sf };
  }
  function sidesOf(cup, idx) {
    const p = R16[idx];
    return [qualifier(cup, p[0].g, p[0].rank), qualifier(cup, p[1].g, p[1].rank)];
  }
  function winnerOfR16(cup, idx) {
    const [a, b] = sidesOf(cup, idx);
    if (!a || !b) return null;
    const sc = cpuPlay(cup.seed, a, b, 'r16-' + idx);
    return sc[0] >= sc[1] ? a : b;
  }
  function winnerOfQf(cup, qfIdx, skipRole) {
    const [i, j] = QF[qfIdx];
    const a = winnerOfR16(cup, i), b = winnerOfR16(cup, j);
    if (!a || !b) return null;
    const sc = cpuPlay(cup.seed, a, b, 'qf-' + qfIdx);
    return sc[0] >= sc[1] ? a : b;
  }
  function humanGroup(role) { return HUMAN_GROUP[role]; }
  function halfOf(role) { return role === 0 ? 0 : 1; }
  function recordHuman(cup, role, games) {
    const g = cup.groups[HUMAN_GROUP[role]];
    const opps = [1, 2, 3];
    games.forEach((sc, n) => { if (!sc) return; const j = opps[n]; g.played['0-' + j] = sc.slice(); });
    return table(g.teams, g.played);
  }
  function placement(cup, role, games) {
    const rows = recordHuman(cup, role, games);
    const me = rows.findIndex(x => x.i === 0);
    const row = rows[me];
    const rank = me + 1;
    const qualified = row.pts >= E.GROUP_PTS_NEEDED && rank <= 2;
    return { rows, rank, pts: row.pts, qualified };
  }
  // games: até 3 placares [gf, ga] do humano contra os rivais 1, 2 e 3. Não muta a copa.
  function placePlayer(cup, role, games) {
    const copy = JSON.parse(JSON.stringify(cup));
    copy.ko = cup.ko;
    const g = copy.groups[HUMAN_GROUP[role]];
    g.teams[0] = { ...g.teams[0] };
    return placement(copy, role, games || []);
  }
  function asOpponent(team, stage) {
    return {
      nome: team.nome, flag: team.flag, scorers: team.scorers || ['o atacante', 'o meia', 'o ponta'], gk: team.gk || 'o goleiro',
      scorerW: team.scorerW || [3, 2, 1], stage, baseStr: team.str || 57, jit: { atk: 0, mid: 0, def: 0, gk: 0 }
    };
  }
  function groupOpponents(cup, role) {
    const g = cup.groups[HUMAN_GROUP[role]];
    return [1, 2, 3].map((s, i) => asOpponent(g.teams[s], i));
  }
function koOpponents(cup, role, rank) {
  const path = koPath(cup, role, rank);
  if (!path.r16 || !path.qf || !path.sf) return null;
  return [path.r16, path.qf, path.sf].map((t, i) => asOpponent(t, i + 3));
}
  function prepareKo(cup, role, games) {
  const copy = JSON.parse(JSON.stringify(cup));
  const p = placement(copy, role, games || []);
  const ko = p.qualified ? koOpponents(copy, role, p.rank) : null;
  return { rank: p.rank, pts: p.pts, qualified: p.qualified, rows: p.rows.map(r => ({ i: r.i, pts: r.pts, gf: r.gf, ga: r.ga, nome: r.t.nome, human: r.t.human })), ko };
}
function meetOnlyInFinal(roleA, rankA, roleB, rankB) {
    const a = slotsOf(HUMAN_GROUP[roleA], rankA), b = slotsOf(HUMAN_GROUP[roleB], rankB);
    return a.sf !== b.sf && a.qf !== b.qf && a.r16 !== b.r16 && a.final === b.final;
  }

  const B = { LETTERS, R16, QF, SF, HUMAN_GROUP, buildCup, slotsOf, humanGroup, halfOf, groupOpponents, koOpponents, placePlayer, prepareKo, recordHuman, meetOnlyInFinal, asOpponent, table };
  if (typeof module !== 'undefined' && module.exports) module.exports = B;
  else root.FFBracket = B;
})(typeof window !== 'undefined' ? window : this);
