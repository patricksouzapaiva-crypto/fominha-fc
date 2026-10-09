/* Fominha FC · Modo Carreira. Simulação determinística por semente. */
(function (root) {
  const E = (typeof module !== 'undefined' && module.exports) ? require('./engine.js') : root.FFEngine;
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const avg = a => a.reduce((s, x) => s + x, 0) / (a.length || 1);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));

  const BAL = {
    divBase: [56, 60, 64, 69],
    home: 2.5,
    xgBase: 1.02,
    xgPer: 0.092,
    sackAt: 16,
    trustStart: 70,
    passiveTrain: 6,
    goodTrain: 12,
    midTrain: 4
  };
  const ORDER = ['atk', 'def', 'mei', 'bol', 'mot', 'est'];
  const AN = { atk: 'Ataque', def: 'Defesa', mei: 'Posse', bol: 'Bola Parada', mot: 'Mentalidade', est: 'Estrategista' };
  const DIVN = ['Série D', 'Série C', 'Série B', 'Série A'];
  const AMBN = {
    evitar: 'Evitar o rebaixamento', subir: 'Subir de divisão', campeao: 'Ser campeão',
    libertadores: 'Vaga na Libertadores', champions: 'Brigar pela Champions', selecao: 'Ser campeão com a Seleção'
  };
  const LEGEND_W = { guardiola: 2, ferguson: 2, cruyff: 2, tele: 2 };
  const FAME = { flamengo: 3, palmeiras: 3, corinthians: 3, saopaulo: 2, gremio: 2, internacional: 2, atleticomg: 2, santos: 2, vasco: 2, fluminense: 2, cruzeiro: 2, botafogo: 1 };
  const DERBY = {
    flamengo: ['fluminense', 'vasco', 'botafogo'], palmeiras: ['corinthians', 'saopaulo', 'santos'],
    corinthians: ['palmeiras', 'saopaulo', 'santos'], saopaulo: ['palmeiras', 'corinthians', 'santos'],
    santos: ['saopaulo', 'palmeiras', 'corinthians'], gremio: ['internacional'], internacional: ['gremio'],
    atleticomg: ['cruzeiro'], cruzeiro: ['atleticomg'], bahia: ['vitoria'], vitoria: ['bahia'],
    sport: ['nautico', 'santacruz'], nautico: ['sport', 'santacruz'], santacruz: ['sport', 'nautico'],
    fluminense: ['flamengo', 'vasco', 'botafogo'], vasco: ['flamengo', 'fluminense', 'botafogo'],
    botafogo: ['flamengo', 'fluminense', 'vasco'], goias: ['atleticogo'], atleticogo: ['goias'],
    ceara: ['fortaleza'], fortaleza: ['ceara'], athletico: ['coritiba'], coritiba: ['athletico']
  };
  const NM1 = ['João', 'Pedro', 'Lucas', 'Gabriel', 'Matheus', 'Rafael', 'Bruno', 'Diego', 'André', 'Felipe', 'Caio', 'Igor', 'Hugo', 'Vitor', 'Daniel', 'Marcos', 'Leandro', 'Thiago', 'Renato', 'Eduardo', 'Fernando', 'Paulo', 'Carlos', 'Rodrigo', 'Gustavo', 'Alex', 'Davi', 'Murilo', 'Samuel', 'Henrique'];
  const NM2 = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Lima', 'Costa', 'Pereira', 'Ferreira', 'Almeida', 'Ribeiro', 'Carvalho', 'Gomes', 'Martins', 'Araújo', 'Melo', 'Barbosa', 'Cardoso', 'Teixeira', 'Correia', 'Nunes', 'Moreira', 'Mendes', 'Freitas', 'Rocha', 'Dias'];
  const CLUBS = {
    flamengo: ['Flamengo', 'FLA', '#c52626', '#111111'], palmeiras: ['Palmeiras', 'PAL', '#006437', '#ffffff'],
    saopaulo: ['São Paulo', 'SAO', '#c20a2d', '#111111'], corinthians: ['Corinthians', 'COR', '#111111', '#ffffff'],
    gremio: ['Grêmio', 'GRE', '#0d80bf', '#111111'], internacional: ['Internacional', 'INT', '#c40a2e', '#ffffff'],
    atleticomg: ['Atlético-MG', 'CAM', '#111111', '#ffffff'], fluminense: ['Fluminense', 'FLU', '#7a1f3d', '#006437'],
    botafogo: ['Botafogo', 'BOT', '#111111', '#ffffff'], bahia: ['Bahia', 'BAH', '#005ca9', '#ffffff'],
    fortaleza: ['Fortaleza', 'FOR', '#0a3d91', '#c52626'], athletico: ['Athletico-PR', 'CAP', '#c52626', '#111111'],
    cruzeiro: ['Cruzeiro', 'CRU', '#003399', '#ffffff'], vasco: ['Vasco', 'VAS', '#111111', '#ffffff'],
    bragantino: ['Bragantino', 'RBB', '#c52626', '#ffffff'], juventude: ['Juventude', 'JUV', '#006437', '#ffffff'],
    atleticogo: ['Atlético-GO', 'ACG', '#111111', '#ffffff'], criciuma: ['Criciúma', 'CRI', '#ffd100', '#111111'],
    vitoria: ['Vitória', 'VIT', '#c52626', '#111111'], cuiaba: ['Cuiabá', 'CUI', '#006437', '#ffd100'],
    santos: ['Santos', 'SAN', '#ffffff', '#111111'], sport: ['Sport', 'SPT', '#c52626', '#111111'],
    ceara: ['Ceará', 'CEA', '#111111', '#ffffff'], goias: ['Goiás', 'GOI', '#006437', '#ffffff'],
    coritiba: ['Coritiba', 'CFC', '#006437', '#ffffff'], avai: ['Avaí', 'AVA', '#005ca9', '#ffffff'],
    ponte: ['Ponte Preta', 'PON', '#111111', '#ffffff'], guarani: ['Guarani', 'GUA', '#006437', '#ffffff'],
    americamg: ['América-MG', 'AMG', '#006437', '#ffffff'], chapecoense: ['Chapecoense', 'CHA', '#006437', '#ffffff'],
    crb: ['CRB', 'CRB', '#c52626', '#ffffff'], nautico: ['Náutico', 'NAU', '#c52626', '#ffffff'],
    operario: ['Operário-PR', 'OPE', '#111111', '#ffffff'], novorizontino: ['Novorizontino', 'NOV', '#ffd100', '#111111'],
    vilanova: ['Vila Nova', 'VIL', '#c52626', '#006437'], paysandu: ['Paysandu', 'PAY', '#005ca9', '#ffffff'],
    botafogosp: ['Botafogo-SP', 'BSP', '#111111', '#c52626'], amazonas: ['Amazonas', 'AMA', '#ffd100', '#005ca9'],
    athletic: ['Athletic', 'ATH', '#111111', '#ffffff'], londrina: ['Londrina', 'LON', '#005ca9', '#ffffff'],
    figueirense: ['Figueirense', 'FIG', '#111111', '#ffffff'], joinville: ['Joinville', 'JOI', '#c52626', '#ffffff'],
    csa: ['CSA', 'CSA', '#005ca9', '#ffffff'], santacruz: ['Santa Cruz', 'STC', '#c52626', '#111111'],
    remo: ['Remo', 'REM', '#005ca9', '#ffffff'], sampaio: ['Sampaio Corrêa', 'SAM', '#ffd100', '#c52626'],
    confianca: ['Confiança', 'CON', '#005ca9', '#ffd100'], botafogopb: ['Botafogo-PB', 'BPB', '#111111', '#c52626'],
    ferroviario: ['Ferroviário', 'FER', '#c52626', '#111111'], saobernardo: ['São Bernardo', 'SBE', '#ffd100', '#111111'],
    ypiranga: ['Ypiranga', 'YPI', '#ffd100', '#c52626'], tombense: ['Tombense', 'TOM', '#ffffff', '#c52626'],
    voltaredonda: ['Volta Redonda', 'VOL', '#ffd100', '#111111'], ituano: ['Ituano', 'ITU', '#c52626', '#111111'],
    abc: ['ABC', 'ABC', '#111111', '#ffffff'], americarn: ['América-RN', 'ARN', '#c52626', '#ffffff'],
    brasilpel: ['Brasil de Pelotas', 'BPE', '#c52626', '#111111'], portuguesa: ['Portuguesa', 'POR', '#c52626', '#006437'],
    caxias: ['Caxias', 'CAX', '#111111', '#ffffff'], floresta: ['Floresta', 'FLO', '#006437', '#ffffff'],
    retro: ['Retrô', 'RET', '#c52626', '#111111'], maranhao: ['Maranhão', 'MAR', '#005ca9', '#c52626'],
    jacuipense: ['Jacuipense', 'JAC', '#006437', '#ffffff'], saoraimundo: ['São Raimundo', 'SRA', '#005ca9', '#ffffff'],
    brasiliense: ['Brasiliense', 'BRA', '#ffd100', '#006437'], gama: ['Gama', 'GAM', '#006437', '#ffffff'],
    capital: ['Capital-DF', 'CAPD', '#111111', '#ffffff'], tunaluso: ['Tuna Luso', 'TUN', '#005ca9', '#ffffff'],
    riobrancoes: ['Rio Branco-ES', 'RBE', '#111111', '#ffffff'], serra: ['Serra', 'SER', '#c52626', '#111111'],
    desportiva: ['Desportiva', 'DES', '#7a1f3d', '#ffffff'], realnoroeste: ['Real Noroeste', 'RNO', '#ffd100', '#006437'],
    noviguacu: ['Nova Iguaçu', 'NIG', '#ff8c00', '#111111'], audax: ['Audax Rio', 'AUD', '#ff6a00', '#111111'],
    saobento: ['São Bento', 'BEN', '#005ca9', '#ffffff'], riobrancoac: ['Rio Branco-AC', 'RBA', '#c52626', '#ffffff'],
    humaita: ['Humaitá', 'HUM', '#006437', '#ffffff'], altos: ['Altos', 'ALT', '#005ca9', '#ffffff'],
    sousa: ['Sousa', 'SOU', '#c52626', '#ffffff'], anapolis: ['Anápolis', 'ANA', '#c52626', '#111111']
  };
  const EURO = {
    benfica: ['Benfica', 'BEN', '#c52626', '#ffffff'], porto: ['Porto', 'POR', '#003399', '#ffffff'],
    ajax: ['Ajax', 'AJX', '#c52626', '#ffffff'], sevilla: ['Sevilla', 'SEV', '#ffffff', '#c52626'],
    lyon: ['Lyon', 'LYO', '#ffffff', '#003399'], bruges: ['Bruges', '#003399', '#003399', '#ffd100'],
    celtic: ['Celtic', 'CEL', '#006437', '#ffffff'], rangers: ['Rangers', 'RAN', '#005ca9', '#ffffff'],
    feyenoord: ['Feyenoord', 'FEY', '#c52626', '#ffffff'], galatasaray: ['Galatasaray', 'GAL', '#c52626', '#ffd100']
  };
  // fix bruges tuple - I made a mistake with 4 fields. Let me fix below if needed.
  EURO.bruges = ['Bruges', 'BRU', '#003399', '#ffd100'];
  const NATIONS = {
    bra: ['Brasil', 'BRA', '#ffd100', '#006437'], arg: ['Argentina', 'ARG', '#75aadb', '#ffffff'],
    fra: ['França', 'FRA', '#003399', '#c52626'], ger: ['Alemanha', 'ALE', '#ffffff', '#111111'],
    esp: ['Espanha', 'ESP', '#c52626', '#ffd100'], eng: ['Inglaterra', 'ING', '#ffffff', '#c52626']
  };
  const BY_DIV = [
    ['retro', 'maranhao', 'jacuipense', 'saoraimundo', 'brasiliense', 'gama', 'capital', 'tunaluso', 'riobrancoes', 'serra', 'desportiva', 'realnoroeste', 'noviguacu', 'audax', 'saobento', 'riobrancoac', 'humaita', 'altos', 'sousa', 'anapolis'],
    ['figueirense', 'joinville', 'csa', 'santacruz', 'remo', 'sampaio', 'confianca', 'botafogopb', 'ferroviario', 'saobernardo', 'ypiranga', 'tombense', 'voltaredonda', 'ituano', 'abc', 'americarn', 'brasilpel', 'portuguesa', 'caxias', 'floresta'],
    ['santos', 'sport', 'ceara', 'goias', 'coritiba', 'avai', 'ponte', 'guarani', 'americamg', 'chapecoense', 'crb', 'nautico', 'operario', 'novorizontino', 'vilanova', 'paysandu', 'botafogosp', 'amazonas', 'athletic', 'londrina'],
    ['flamengo', 'palmeiras', 'saopaulo', 'corinthians', 'gremio', 'internacional', 'atleticomg', 'fluminense', 'botafogo', 'bahia', 'fortaleza', 'athletico', 'cruzeiro', 'vasco', 'bragantino', 'juventude', 'atleticogo', 'criciuma', 'vitoria', 'cuiaba']
  ];
  const CUP_AT = [8, 16, 24, 32, 36];
  const LIB_AT = [12, 20, 28, 35];
  const KEY = 'ff-carreira-v1';

  function clubOf(id) {
    const t = CLUBS[id] || EURO[id] || NATIONS[id];
    if (!t) return { id, nome: id, curto: '???', c1: '#145c32', c2: '#ffffff' };
    return { id, nome: t[0], curto: t[1], c1: t[2], c2: t[3] };
  }
  function R(seed, ...k) { return E.rngFor(seed, ...k); }
  function poisson(rng, lam) {
    const L = Math.exp(-lam);
    let k = 0, p = 1;
    do { k++; p *= rng.next(); } while (p > L && k < 12);
    return k - 1;
  }
  function xg(att, opp) { return clamp(BAL.xgBase + (att - opp) * BAL.xgPer, 0.2, 3.2); }
  function playGame(h, a, rng) {
    return [poisson(rng, xg(h + BAL.home, a)), poisson(rng, xg(a, h + BAL.home))];
  }
  function roundRobin(ids) {
    const t = ids.slice();
    if (t.length % 2) t.push(null);
    const m = t.length, rounds = [];
    for (let r = 0; r < m - 1; r++) {
      const games = [];
      for (let i = 0; i < m / 2; i++) {
        const a = t[i], b = t[m - 1 - i];
        if (!a || !b) continue;
        games.push((r + i) % 2 ? [b, a] : [a, b]);
      }
      rounds.push(games);
      const last = t.pop();
      t.splice(1, 0, last);
    }
    return rounds.concat(rounds.map(gs => gs.map(([a, b]) => [b, a])));
  }
  function person(rng) { return rng.pick(NM1) + ' ' + rng.pick(NM2); }
  function makeSquad(seed, tag, base) {
    const r = R(seed, 'el', tag);
    const plan = ['GOL', 'GOL', 'ZAG', 'ZAG', 'ZAG', 'ZAG', 'ZAG', 'ZAG', 'MEI', 'MEI', 'MEI', 'MEI', 'MEI', 'MEI', 'ATA', 'ATA', 'ATA', 'ATA', 'ATA', 'ATA'];
    return plan.map(pos => {
      const age = r.int(18, 33);
      let rating = Math.round(base + r.int(-5, 4));
      if (age <= 21) rating -= 3;
      if (age >= 32) rating -= 2;
      const traits = pos !== 'GOL' && r.chance(0.16) ? r.pick(['C', 'F', 'X']) : '';
      return { nome: person(r), pos, age, rating: clamp(rating, 46, 88), traits };
    });
  }
  function bestXI(squad) {
    const take = (pos, n) => squad.filter(p => p.pos === pos).slice().sort((a, b) => b.rating - a.rating).slice(0, n);
    return [].concat(take('GOL', 1), take('ZAG', 4), take('MEI', 4), take('ATA', 3));
  }
  function squadStr(squad) { return avg(bestXI(squad).map(p => p.rating)); }
  function trainXI(squad, n, cap) {
    cap = cap || 93;
    for (let k = 0; k < n; k++) {
      const xi = bestXI(squad).filter(p => p.rating < cap);
      if (!xi.length) break;
      xi.sort((a, b) => a.rating - b.rating);
      xi[0].rating++;
    }
  }
  function clipSquad(squad, cap) {
    squad.forEach(p => { if (p.rating > cap) p.rating = cap; });
  }
  function slotsFrom(nums) {
    const sl = {};
    ORDER.forEach(a => { sl[a] = { rating: clamp(nums[a] | 0, 55, 99), from: 'Carreira', fromId: '' }; });
    return sl;
  }
  function blankNums() { const o = {}; ORDER.forEach(a => { o[a] = 60; }); return o; }
  function starterNums(seed, policy) {
    const s = blankNums();
    const r = R(seed, 'pontos');
    if (policy === 'bad') s.est = 78;
    else if (policy === 'avg') ORDER.forEach(a => { s[a] = 63; });
    else {
      const a = r.pick(['atk', 'def', 'mei', 'mot']);
      s[a] = 72;
      s[r.pick(ORDER.filter(x => x !== a))] = 66;
    }
    return s;
  }
  function npcSide(id) {
    const r = R('npc', id);
    return { scorers: [0, 1, 2, 3].map(() => person(r)), scorerW: [4, 2, 2, 1], gk: person(r) };
  }
  function linesFrom(str) {
    const s = Math.round(str);
    return { atk: s + 1, mid: s, def: s, gk: s - 1 };
  }
  function emptyTitles() { return { D: 0, C: 0, B: 0, A: 0, copa: 0, lib: 0, euro: 0, selecao: 0 }; }
  function freshWorld(seed) {
    const members = BY_DIV.map(list => list.slice());
    const str = {};
    members.forEach((list, d) => list.forEach(id => {
      const r = R(seed, 'forca', id);
      str[id] = BAL.divBase[d] + r.int(-3, 3) + (FAME[id] || 0);
    }));
    return { members, str };
  }
  function startClubs(world, seed) {
    const d = world.members[0].slice().sort((a, b) => world.str[a] - world.str[b]);
    return R(seed, 'opcoes').shuffle(d.slice(5, 15)).slice(0, 3);
  }

  function create(opts) {
    opts = opts || {};
    const seed = E.normalizeSeed(opts.seed) || 'FOMINHA';
    const policy = opts.policy || 'good';
    const world = freshWorld(seed);
    const choices = startClubs(world, seed);
    const clubId = opts.clubId && clubOf(opts.clubId).nome ? opts.clubId : choices[0];
    const nums = opts.nums || starterNums(seed, policy);
    const c = {
      v: 1, seed, policy, slot: opts.slot | 0, nome: String(opts.nome || 'Professor').slice(0, 24),
      age: 40, year: 1, seasons: 0, comp: 'br', div: 0,
      members: world.members, str: world.str, clubId,
      coach: { nome: String(opts.nome || 'Professor').slice(0, 24), slots: slotsFrom(nums) },
      squad: makeSquad(seed, clubId + ':0', world.str[clubId]),
      budget: 42, trust: BAL.trustStart, fans: 58, rep: 18,
      job: { yearsLeft: 2, ambition: 'subir', salary: 4, fanPressure: 36 },
      titles: emptyTitles(), mentors: [], timeline: [], clubs: [], feed: [], form: [],
      played: [[], [], [], []], fix: [null, null, null, null],
      round: 0, rounds: 38, midDone: false, liveCount: 0,
      copaRound: 0, copaAlive: true, libRound: 0, libAlive: false,
      phase: 'season', queue: [], offers: [], pendingJob: null,
      bonus: {}, noMentor: !!opts.noMentor, unemployed: false, done: false,
      summary: null, decision: null, mentorRoll: null, reachedA: null, sacked: false,
      peak: 0, side: null, returnTo: null
    };
    c.clubs.push({ id: clubId, from: 1, div: 0 });
    c.timeline.push({ y: 1, t: 'Estreia no ' + clubOf(clubId).nome + ' (Série D).' });
    beginFix(c);
    return c;
  }
  function myMembers(c) {
    if (c.comp === 'br') return c.members[c.div];
    return c.side.members;
  }
  function myStr(c, id) {
    if (id === c.clubId) return squadStr(c.squad);
    if (c.comp !== 'br' && c.side && c.side.str[id] != null) return c.side.str[id];
    return c.str[id] || 60;
  }
  function beginFix(c) {
    if (c.comp === 'br') {
      c.rounds = 38;
      for (let d = 0; d < 4; d++) {
        const ids = R(c.seed, 'cal', c.year, d).shuffle(c.members[d].slice());
        c.fix[d] = roundRobin(ids);
        c.played[d] = [];
      }
    } else {
      const ids = R(c.seed, 'cal', c.comp, c.year).shuffle(c.side.members.slice());
      c.side.fix = roundRobin(ids);
      c.side.played = [];
      c.rounds = c.side.fix.length;
    }
    c.round = 0; c.midDone = false; c.liveCount = 0;
    c.copaRound = 0; c.copaAlive = c.comp === 'br';
    c.libRound = 0; c.libAlive = c.comp === 'br' && !!c.qualifiedLib;
    c.qualifiedLib = false;
    c.cupMark = ''; c.libMark = '';
  }
  function tableFrom(ids, games, strOf) {
    const rows = {};
    ids.forEach(id => { rows[id] = { id, j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, pts: 0, nome: clubOf(id).nome }; });
    games.forEach(g => {
      if (!rows[g.h] || !rows[g.a]) return;
      add(rows[g.h], g.hg, g.ag); add(rows[g.a], g.ag, g.hg);
    });
    return Object.keys(rows).map(k => rows[k]).sort((a, b) => (b.pts - a.pts) || ((b.gp - b.gc) - (a.gp - a.gc)) || (b.gp - a.gp) || a.nome.localeCompare(b.nome, 'pt'));
    function add(row, gf, ga) {
      row.j++; row.gp += gf; row.gc += ga;
      if (gf > ga) { row.v++; row.pts += 3; } else if (gf === ga) { row.e++; row.pts += 1; } else row.d++;
    }
  }
  function table(c, div) {
    if (c.comp !== 'br') return tableFrom(c.side.members, c.side.played, id => myStr(c, id));
    const d = div == null ? c.div : div;
    return tableFrom(c.members[d], c.played[d]);
  }
  function myPlace(c) {
    const t = table(c);
    const i = t.findIndex(r => r.id === c.clubId);
    return { i, n: t.length, row: t[i], table: t };
  }
  function fixture(c) {
    const rounds = c.comp === 'br' ? c.fix[c.div] : c.side.fix;
    const games = rounds && rounds[c.round];
    if (!games) return null;
    return games.find(([h, a]) => h === c.clubId || a === c.clubId) || null;
  }
  function isDerby(a, b) { return (DERBY[a] || []).indexOf(b) >= 0; }
  function contention(c) {
    const p = myPlace(c);
    if (p.i < 0) return true;
    if (p.i < 6 || p.i >= p.n - 6) return true;
    const me = p.row, fourth = p.table[Math.min(3, p.n - 1)], rel = p.table[Math.max(0, p.n - 4)];
    if (fourth && fourth.pts - me.pts <= 3) return true;
    if (rel && me.pts - rel.pts <= 3) return true;
    return false;
  }
  function cupDue(c) {
    if (c.comp !== 'br' || !c.copaAlive) return false;
    const at = CUP_AT[c.copaRound];
    return at != null && c.round === at && c.cupMark !== c.year + ':c' + c.copaRound;
  }
  function libDue(c) {
    if (c.comp !== 'br' || !c.libAlive) return false;
    const at = LIB_AT[c.libRound];
    return at != null && c.round === at && c.libMark !== c.year + ':l' + c.libRound;
  }
  function isKey(c) {
    const f = fixture(c);
    if (!f) return false;
    const foe = f[0] === c.clubId ? f[1] : f[0];
    const last = c.round >= c.rounds - 1;
    const late = c.round >= c.rounds - 3;
    if (last) return true;
    if (c.liveCount >= 6) return false;
    if (late && contention(c)) return true;
    if (isDerby(c.clubId, foe) && c.liveCount < 2) return true;
    return false;
  }
  function cupIsLive(c) {
    if (cupDue(c) && c.copaRound >= 3) return true;
    if (libDue(c) && c.libRound >= 2) return true;
    return false;
  }
  function recordGame(list, h, a, hg, ag) { list.push({ h, a, hg, ag }); }
  function noteForm(c, gf, ga) {
    const k = gf > ga ? 'W' : gf < ga ? 'L' : 'D';
    c.form.push(k); if (c.form.length > 5) c.form.shift();
    const nome = '';
    return k;
  }
  function resultLine(c, foe, gf, ga, tag) {
    const k = gf > ga ? 'Vitória' : gf < ga ? 'Derrota' : 'Empate';
    const line = (tag ? tag + ' · ' : '') + k + ' ' + gf + ' a ' + ga + ' contra ' + clubOf(foe).nome;
    c.feed.unshift(line); if (c.feed.length > 6) c.feed.pop();
    noteForm(c, gf, ga);
    return line;
  }
  function simPair(c, div, h, a, key) {
    const rng = R(c.seed, 'j', c.year, div, c.round, h, a, key || 0);
    const sc = playGame(myStr(c, h), myStr(c, a), rng);
    return sc;
  }
  function simRoundDiv(c, div) {
    const games = c.fix[div][c.round];
    if (!games) return;
    games.forEach(([h, a]) => {
      if (div === c.div && (h === c.clubId || a === c.clubId) && c._liveScore) {
        const sc = c._liveScore; c._liveScore = null;
        recordGame(c.played[div], h, a, sc[0], sc[1]);
        return;
      }
      const sc = simPair(c, 'd' + div, h, a);
      recordGame(c.played[div], h, a, sc[0], sc[1]);
    });
  }
  function myScoreFromRound(c) {
    const games = c.comp === 'br' ? c.played[c.div] : c.side.played;
    for (let i = games.length - 1; i >= 0; i--) {
      const g = games[i];
      if (g.h === c.clubId) return { foe: g.a, gf: g.hg, ga: g.ag, home: true };
      if (g.a === c.clubId) return { foe: g.h, gf: g.ag, ga: g.hg, home: false };
    }
    return null;
  }
  function simLeagueRound(c, liveScore) {
    if (c.comp === 'br') {
      c._liveScore = liveScore || null;
      if (liveScore) {
        const f = fixture(c);
        const home = f[0] === c.clubId;
        c._liveScore = home ? liveScore : [liveScore[1], liveScore[0]];
      }
      simRoundDiv(c, c.div);
      c._liveScore = null;
    } else {
      const games = c.side.fix[c.round];
      games.forEach(([h, a]) => {
        if (liveScore && (h === c.clubId || a === c.clubId)) {
          const home = h === c.clubId;
          const sc = home ? liveScore : [liveScore[1], liveScore[0]];
          recordGame(c.side.played, h, a, sc[0], sc[1]);
          return;
        }
        const rng = R(c.seed, 'j', c.comp, c.year, c.round, h, a);
        const sc = playGame(myStr(c, h), myStr(c, a), rng);
        recordGame(c.side.played, h, a, sc[0], sc[1]);
      });
    }
    const mine = myScoreFromRound(c);
    c.round++;
    if (c.round === 19 && c.rounds >= 30 && !c.midDone) c._mid = true;
    return mine ? resultLine(c, mine.foe, mine.gf, mine.ga, 'Rodada ' + c.round) : '';
  }
  function cupFoe(c, kind, idx) {
    const r = R(c.seed, kind, c.year, idx);
    let div = c.div;
    if (kind === 'copa') div = Math.min(3, c.div + Math.max(0, idx - 1));
    if (kind === 'lib') div = 3;
    const pool = c.members[div].filter(id => id !== c.clubId);
    const id = r.pick(pool);
    let str = c.str[id];
    if (kind === 'lib') str = Math.max(str, BAL.divBase[3] + 4 + idx);
    if (kind === 'copa' && idx >= 3) str = Math.max(str, BAL.divBase[Math.min(3, c.div + 1)] + 1);
    return { id, str, home: idx % 2 === 0 };
  }
  function simCupGame(c, kind, liveScore) {
    const idx = kind === 'copa' ? c.copaRound : c.libRound;
    const foe = cupFoe(c, kind, idx);
    let gf, ga;
    if (liveScore) { gf = liveScore[0]; ga = liveScore[1]; }
    else {
      const rng = R(c.seed, kind, 'pl', c.year, idx);
      const h = foe.home ? squadStr(c.squad) : foe.str;
      const a = foe.home ? foe.str : squadStr(c.squad);
      const sc = playGame(h, a, rng);
      gf = foe.home ? sc[0] : sc[1];
      ga = foe.home ? sc[1] : sc[0];
      if (gf === ga) { if (rng.chance(0.5 + (c.coach.slots.mot.rating - 70) / 200)) gf++; else ga++; }
    }
    if (gf === ga) {
      const rng = R(c.seed, kind, 'pen', c.year, idx);
      if (rng.chance(0.5 + (c.coach.slots.mot.rating - 70) / 220)) gf++; else ga++;
      c.feed.unshift('Decidido nos pênaltis.');
    }
    const won = gf > ga;
    const label = kind === 'copa' ? ['Copa 32-avos', 'Copa oitavas', 'Copa quartas', 'Copa semi', 'Copa final'][idx] : ['Libertadores oitavas', 'Libertadores quartas', 'Libertadores semi', 'Libertadores final'][idx];
    const line = resultLine(c, foe.id, gf, ga, label);
    if (kind === 'copa') {
      c.cupMark = c.year + ':c' + c.copaRound;
      c.copaRound++;
      if (!won) c.copaAlive = false;
      else if (c.copaRound >= 5) { c.titles.copa++; c.copaTitleThis = true; c.timeline.push({ y: c.year, t: 'Campeão da Copa do Brasil.' }); c.copaAlive = false; }
    } else {
      c.libMark = c.year + ':l' + c.libRound;
      c.libRound++;
      if (!won) c.libAlive = false;
      else if (c.libRound >= 4) { c.titles.lib++; c.timeline.push({ y: c.year, t: 'Campeão da Libertadores.' }); c.libAlive = false; }
    }
    if (liveScore || (kind === 'copa' && idx >= 3) || (kind === 'lib' && idx >= 2)) c.liveCount++;
    c._cupFoe = null;
    return line;
  }
  function maybeMid(c) {
    if (!c._mid) return false;
    c._mid = false; c.midDone = true;
    const formPts = c.form.reduce((s, k) => s + (k === 'W' ? 3 : k === 'D' ? 1 : 0), 0);
    const hot = formPts >= 10 || myPlace(c).i <= 3;
    if (hot && R(c.seed, 'meio', c.year).chance(0.55) && c.comp === 'br') {
      c.offers = buildOffers(c, 'meio');
      if (c.offers.length) { c.phase = 'inbox'; c.inboxBack = 'season'; return true; }
    }
    c.decision = makeDecision(c, 'meio');
    c.phase = 'decision'; c.inboxBack = 'season';
    return true;
  }
  function devCap(c) {
    if (c.comp !== 'br') return 78;
    return BAL.divBase[c.div] + 5;
  }
  function ageSquad(c) {
    const r = R(c.seed, 'idade', c.year);
    const cap = devCap(c);
    const next = [];
    c.squad.forEach(p => {
      p.age++;
      if (p.age <= 23 && p.rating < cap && r.chance(0.55)) p.rating++;
      else if (p.age >= 32) p.rating = Math.max(46, p.rating - 1);
      if (p.age < 36) next.push(p);
    });
    while (next.length < 20) {
      const pos = r.pick(['ZAG', 'MEI', 'ATA', 'GOL']);
      next.push({ nome: person(r), pos, age: r.int(18, 20), rating: clamp(Math.round(squadStr(next.length ? next : c.squad) - 6), 48, 70), traits: '' });
    }
    c.squad = next;
  }
  function applyGrowth(c) {
    const slots = c.coach.slots;
    const focus = ORDER.slice().sort((a, b) => slots[b].rating - slots[a].rating || ORDER.indexOf(a) - ORDER.indexOf(b))[0];
    const low = ORDER.slice().sort((a, b) => slots[a].rating - slots[b].rating || ORDER.indexOf(a) - ORDER.indexOf(b))[0];
    const counts = {};
    c.mentors.forEach(m => { if (m.stat) counts[m.stat] = (counts[m.stat] || 0) + 1; });
    ORDER.forEach(stat => {
      const n = counts[stat] || 0;
      let base = 0;
      if (stat === focus) base = 1;
      else if (stat === low && slots[stat].rating < 74) base = 1;
      if (n && base === 0) base = 1;
      const mult = n ? Math.min(3, 1 + n) : 1;
      const bonus = (c.bonus && c.bonus[stat]) || 0;
      let gain = n ? base * mult + bonus : base + Math.min(1, bonus);
      if (c.age >= 56 && stat === 'mot') gain = Math.max(0, gain - 1);
      gain = Math.min(3, Math.max(0, gain));
      slots[stat].rating = Math.min(99, slots[stat].rating + gain);
    });
    c.bonus = {};
  }
  function ambitionDelta(c, pos, n, promoted, relegated, champ) {
    const a = (c.job && c.job.ambition) || 'evitar';
    if (a === 'evitar') return relegated ? -10 : 4;
    if (a === 'subir') return promoted ? 8 : (pos < n / 2 ? 0 : -4);
    if (a === 'campeao') return champ ? 10 : (pos < 4 ? 2 : -7);
    if (a === 'libertadores' || a === 'champions' || a === 'selecao') return (champ || (c.comp === 'br' && c.div === 3 && pos < 4)) ? 8 : -5;
    return 0;
  }
  function endSeason(c) {
    const p = myPlace(c);
    const pos = p.i, n = p.n, champ = pos === 0;
    let promoted = false, relegated = false, toDiv = c.div;
    if (c.comp === 'br') {
      if (champ) c.titles[['D', 'C', 'B', 'A'][c.div]]++;
      if (c.div < 3 && pos < 4) { promoted = true; toDiv = c.div + 1; }
      if (c.div > 0 && pos >= n - 4) { relegated = true; toDiv = c.div - 1; }
      if (c.div === 3 && pos < 4) c.qualifiedLib = true;
      if (c.copaTitleThis) c.qualifiedLib = true;
      c.copaTitleThis = false;
    } else if (c.comp === 'euro') {
      if (champ) c.titles.euro++;
    } else if (c.comp === 'sel') {
      if (champ) c.titles.selecao++;
    }
    const trustBefore = c.trust;
    let td = 0;
    if (pos < 4) td += 6; else if (pos < 8) td += 2; else if (pos >= n - 4) td -= 12; else if (pos >= n - 8) td -= 5; else td -= 1;
    if (champ) td += 6;
    if (relegated) td -= 6;
    if (promoted) td += 4;
    td += ambitionDelta(c, pos, n, promoted, relegated, champ);
    c.trust = clamp(c.trust + td, 0, 100);
    c.fans = clamp(c.fans + (champ ? 12 : promoted ? 8 : relegated ? -14 : pos < 6 ? 4 : -2), 0, 100);
    c.rep = clamp(c.rep + (champ ? 6 : promoted ? 4 : relegated ? -4 : pos < 4 ? 2 : 0) + 1, 0, 100);
    if (c.comp === 'br' && toDiv === 3 && c.reachedA == null) c.reachedA = c.seasons + 1;
    c.peak = Math.max(c.peak, c.comp === 'br' ? toDiv : c.peak);
    ageSquad(c);
    const saved = c.trainBank || 0;
    let bank = saved + BAL.passiveTrain + (c.budget >= 34 ? 4 : 0);
    if (c.budget >= 34) c.budget -= 8;
    c.trainBank = 0;
    const sqNow = squadStr(c.squad);
    if (c.comp === 'br' && c.div < 3 && saved >= 8 && sqNow < BAL.divBase[c.div] + 3) bank += 12;
    const cap = devCap(c);
    trainXI(c.squad, bank, cap);
    clipSquad(c.squad, cap);
    if (champ && c.comp === 'br') clipSquad(c.squad, cap - 1);
    if (bank > BAL.passiveTrain) c.feed.unshift('A semana de treino subiu o nível do time.');
    c.budget = clamp(c.budget + 16 + (c.comp === 'br' ? c.div * 4 : 10) + (pos < 4 ? 8 : 0) - (10 + (c.job.salary || 4)), 0, 120);
    c.age++;
    applyGrowth(c);
    c.peakAttr = c.peakAttr || [];
    c.peakAttr.push(Math.max.apply(null, ORDER.map(a => c.coach.slots[a].rating)));
    if (c.job) c.job.yearsLeft = Math.max(0, c.job.yearsLeft - 1);
    const sack = c.trust <= BAL.sackAt && c.comp === 'br';
    if (sack) {
      c.sacked = true; c.wasSacked = true; c.unemployed = true; c.rep = clamp(c.rep - 6, 0, 100);
      c.timeline.push({ y: c.year, t: 'Demitido pelo ' + clubOf(c.clubId).nome + '.' });
      const last = c.clubs[c.clubs.length - 1]; if (last) last.to = c.year;
    }
    c.summary = {
      table: p.table.slice(0, 8), full: p.table, pos, n, champ, promoted, relegated,
      div: c.div, toDiv, comp: c.comp, trustDelta: c.trust - trustBefore,
      year: c.year, clubId: c.clubId, fire: promoted || champ
    };
    c.seasonsLog = c.seasonsLog || [];
    c.seasonsLog.push({ y: c.year, div: c.comp === 'br' ? c.summary.div : c.comp, pos, pts: p.row ? p.row.pts : 0, sq: Math.round(squadStr(c.squad)), trust: c.trust, prom: promoted, rel: relegated, champ, amb: c.job && c.job.ambition });
    if (promoted) c.timeline.push({ y: c.year, t: 'Acesso à ' + DIVN[toDiv] + '.' });
    if (champ && c.comp === 'br') c.timeline.push({ y: c.year, t: 'Campeão da ' + DIVN[c.div] + '.' });
    if (champ && c.comp !== 'br') c.timeline.push({ y: c.year, t: 'Campeão: ' + (c.comp === 'euro' ? 'Liga Europeia' : 'Seleção Brasileira') + '.' });
    if (c.comp === 'br' && !sack) movePyramid(c);
    c.seasons++;
    c.offers = [];
    c.pendingJob = null;
    if (c.seasons >= 20 || c.age >= 60) {
      c.queue = ['summary', 'retire'];
    } else if (sack) {
      c.offers = buildOffers(c, 'demitido');
      c.queue = ['summary', 'inbox'].concat(c.seasons % 5 === 0 && !c.noMentor ? ['mentor'] : []).concat(['next']);
    } else if (c.comp === 'sel') {
      c.offers = buildOffers(c, 'fim');
      c.queue = ['summary', 'inbox', 'next'];
    } else {
      c.offers = buildOffers(c, 'fim');
      const q = ['summary', 'inbox'];
      if (c.seasons % 5 === 0 && !c.noMentor) q.push('mentor');
      q.push('decision', 'decision', 'next');
      c.queue = q;
    }
    c.phase = 'summary';
    c.decision = null;
  }
  function movePyramid(c) {
    const tables = [0, 1, 2, 3].map(d => d === c.summary.div ? c.summary.full : simNpcTable(c, d));
    const dest = {};
    for (let d = 0; d < 4; d++) {
      tables[d].forEach((row, i) => {
        let nd = d;
        if (d < 3 && i < 4) nd = d + 1;
        else if (d > 0 && i >= tables[d].length - 4) nd = d - 1;
        dest[row.id] = nd;
      });
    }
    const toDiv = c.summary.promoted ? c.summary.div + 1 : c.summary.relegated ? Math.max(0, c.summary.div - 1) : c.summary.div;
    dest[c.clubId] = toDiv;
    BY_DIV.forEach(list => list.forEach(id => { if (dest[id] == null) dest[id] = Math.max(0, BY_DIV.findIndex(L => L.indexOf(id) >= 0)); }));
    const next = [[], [], [], []];
    Object.keys(dest).forEach(id => { const d = clamp(dest[id], 0, 3); if (next[d].indexOf(id) < 0) next[d].push(id); });
    for (let guard = 0; guard < 80; guard++) {
      const lens = next.map(a => a.length);
      if (lens.every(n => n === 20)) break;
      let big = 0, small = 0;
      lens.forEach((n, i) => { if (n > lens[big]) big = i; if (n < lens[small]) small = i; });
      if (lens[big] === lens[small]) break;
      let idx = next[big].length - 1;
      if (next[big][idx] === c.clubId) idx--;
      if (idx < 0) break;
      next[small].push(next[big].splice(idx, 1)[0]);
    }
    c.members = next;
    c.div = 0;
    for (let d = 0; d < 4; d++) if (c.members[d].indexOf(c.clubId) >= 0) c.div = d;
    c.str[c.clubId] = Math.round(squadStr(c.squad));
  }
  function simNpcTable(c, div) {
    const ids = c.members[div].slice();
    const fix = roundRobin(R(c.seed, 'npcfix', c.year, div).shuffle(ids));
    const games = [];
    fix.forEach((round, ri) => round.forEach(([h, a]) => {
      if (h === c.clubId || a === c.clubId) return;
      const rng = R(c.seed, 'npc', c.year, div, ri, h);
      const sc = playGame(c.str[h] || 60, c.str[a] || 60, rng);
      games.push({ h, a, hg: sc[0], ag: sc[1] });
    }));
    // player's already-played games count in HIS division only; other divs are full NPC
    if (div === c.summary.div) return c.summary.full;
    return tableFrom(ids, games);
  }
  function rankedStats(card) {
    return ORDER.slice().sort((a, b) => card.s[b] - card.s[a] || ORDER.indexOf(a) - ORDER.indexOf(b));
  }
  function mentorStat(card, slots) {
    const rank = rankedStats(card);
    for (let i = 0; i < rank.length; i++) if (slots[rank[i]].rating < 99) return rank[i];
    return null;
  }
  function rollMentor(c) {
    const r = R(c.seed, 'mentor', c.seasons);
    return r.weighted(E.COACHES, coach => LEGEND_W[coach.id] || 8);
  }
  function mentorMult(c, stat) {
    if (!stat) return 0;
    const n = c.mentors.filter(m => m.stat === stat).length;
    return Math.min(3, 1 + n);
  }
  function mentorText(c, m) {
    if (!m.stat) return 'Mentor: ' + E.COACH_BY_ID[m.coachId].curto + ' → troféu (todos os atributos já estão em 99)';
    const n = c.mentors.filter(x => x.stat === m.stat).length;
    const mult = Math.min(3, 1 + Math.max(1, n));
    return 'Mentor: ' + E.COACH_BY_ID[m.coachId].curto + ' → ' + AN[m.stat] + ' cresce ' + mult + 'x mais rápido';
  }
  function enterMentor(c) {
    c.mentorRoll = rollMentor(c);
    c.mentorPick = mentorStat(c.mentorRoll, c.coach.slots);
    c.phase = 'mentor';
  }
  function lockMentor(c) {
    const card = c.mentorRoll || rollMentor(c);
    const stat = c.mentorPick != null ? c.mentorPick : mentorStat(card, c.coach.slots);
    const n = stat ? c.mentors.filter(m => m.stat === stat).length + 1 : 0;
    const mult = stat ? Math.min(3, 1 + n) : 0;
    const m = { coachId: card.id, stat, mult, season: c.seasons, trophy: !stat };
    c.mentors.push(m);
    c.timeline.push({ y: c.year, t: mentorText(c, m) });
    c.mentorRoll = null; c.mentorPick = null;
    advanceQueue(c);
    return m;
  }
  function offerId(c, i) { return 'o' + c.year + '-' + c.seasons + '-' + i + '-' + (c.offers ? c.offers.length : 0); }
  function ambitionFor(div, rank, kind) {
    if (kind === 'selecao') return 'selecao';
    if (kind === 'euro') return 'champions';
    if (div >= 3 && rank < 6) return 'libertadores';
    if (rank < 5) return 'campeao';
    if (div < 3 && rank < 12) return 'subir';
    return 'evitar';
  }
  function buildOffers(c, when) {
    const r = R(c.seed, 'ofertas', c.seasons, when);
    const out = [];
    const dest = c.summary ? c.summary.toDiv : c.div;
    const here = c.comp === 'br' ? (c.unemployed ? Math.max(0, (c.summary ? c.summary.div : c.div) - 1) : dest) : (c.returnTo ? c.returnTo.div : 0);
    if (when === 'meio') {
      const pool = c.members[c.div].filter(id => id !== c.clubId);
      const id = r.pick(pool);
      out.push(makeOffer(c, r, id, 'brasil', c.div, when));
      return out;
    }
    if (when === 'demitido') {
      const div = clamp((c.summary ? c.summary.div : 0) - r.int(0, 1), 0, 3);
      const pool = c.members[div].filter(id => id !== c.clubId);
      r.shuffle(pool).slice(0, 3).forEach(id => out.push(makeOffer(c, r, id, 'brasil', div, when)));
      return out;
    }
    if (c.comp === 'br' && !c.unemployed && c.clubId) {
      out.push(makeOffer(c, r, c.clubId, 'renew', dest, when));
    }
    const poolDiv = c.comp === 'br' ? dest : here;
    const pool = (c.members[poolDiv] || []).filter(id => id !== c.clubId);
    const n = when === 'meio' ? 1 : (c.rep >= 45 ? 2 : 1);
    r.shuffle(pool).slice(0, n).forEach(id => out.push(makeOffer(c, r, id, 'brasil', poolDiv, when)));
    if (c.rep >= 74 && c.seasons >= 8 && c.age < 58 && (c.titles.A || c.titles.lib || c.titles.copa) && r.chance(0.65)) {
      const id = r.pick(Object.keys(EURO));
      out.push(makeEuro(c, r, id));
    }
    if (c.rep >= 82 && c.seasons >= 10 && c.age < 59 && (c.titles.A || c.titles.lib) && r.chance(0.55)) {
      out.push(makeSelecao(c, r));
    }
    return out;
  }
  function makeOffer(c, r, id, kind, div, when) {
    const cl = clubOf(id);
    const rank = (c.members[div] || []).indexOf(id);
    const amb = kind === 'renew' ? ((c.job && c.job.ambition) || ambitionFor(div, myPlace(c).i, 'brasil')) : ambitionFor(div, rank < 0 ? 10 : rank, 'brasil');
    const fame = FAME[id] || 0;
    const budget = Math.round(28 + div * 10 + fame * 6 + r.int(0, 10));
    const fan = clamp(28 + fame * 14 + (amb === 'campeao' || amb === 'libertadores' ? 12 : 0) + r.int(-4, 6), 20, 92);
    return {
      id: 'o' + c.seasons + kind + id + when + r.int(0, 999),
      clubId: id, nome: cl.nome, curto: cl.curto, c1: cl.c1, c2: cl.c2,
      div, divNome: DIVN[div], ambition: amb, ambitionLabel: AMBN[amb],
      budget, squadStr: Math.round(c.str[id] || squadStr(c.squad)), yourStr: Math.round(squadStr(c.squad)),
      salary: 3 + div + fame, prestige: 10 + div * 8 + fame * 6,
      fanPressure: fan, years: r.int(1, 3), from: 'brasil', kind, negotiated: false, when
    };
  }
  function makeEuro(c, r, id) {
    const cl = clubOf(id);
    return {
      id: 'eu' + c.seasons + id, clubId: id, nome: cl.nome, curto: cl.curto, c1: cl.c1, c2: cl.c2,
      div: 4, divNome: 'Liga Europeia', ambition: 'champions', ambitionLabel: AMBN.champions,
      budget: 70 + r.int(0, 15), squadStr: 78, yourStr: Math.round(squadStr(c.squad)),
      salary: 12, prestige: 70, fanPressure: 68, years: 2, from: 'euro', kind: 'euro', negotiated: false, when: 'fim'
    };
  }
  function makeSelecao(c, r) {
    const cl = clubOf('bra');
    return {
      id: 'sel' + c.seasons, clubId: 'bra', nome: 'Seleção Brasileira', curto: cl.curto, c1: cl.c1, c2: cl.c2,
      div: 5, divNome: 'Eliminatórias relâmpago', ambition: 'selecao', ambitionLabel: AMBN.selecao,
      budget: 40, squadStr: 82, yourStr: Math.round(squadStr(c.squad)),
      salary: 8, prestige: 90, fanPressure: 80, years: 1, from: 'selecao', kind: 'selecao', negotiated: false, when: 'fim'
    };
  }
  function negotiate(c, id) {
    const o = (c.offers || []).find(x => x.id === id);
    if (!o || o.negotiated) return null;
    o.budget = Math.round(o.budget * 1.28);
    o.years = Math.max(1, o.years - 1);
    o.salary += 1;
    o.negotiated = true;
    o.note = 'Caixa maior, contrato mais curto.';
    return o;
  }
  function acceptOffer(c, id) {
    const o = (c.offers || []).find(x => x.id === id);
    if (!o) return false;
    if (c.job && c.job.yearsLeft > 0 && o.clubId !== c.clubId && !c.unemployed && o.kind !== 'renew' && c.inboxBack !== 'season') {
      c.rep = clamp(c.rep - 5, 0, 100);
      c.feed.unshift('Saiu no meio do contrato. A reputação sentiu.');
    }
    if (o.when === 'meio') {
      c.pendingJob = o;
      c.feed.unshift('Combinado com ' + o.nome + ' para a próxima temporada.');
      c.phase = 'season';
      return true;
    }
    c.pendingJob = o;
    c.feed.unshift('Aceitou ' + o.nome + '.');
    return true;
  }
  function rejectOffer(c, id) {
    const o = (c.offers || []).find(x => x.id === id);
    if (!o) return;
    if (!c.unemployed && o.kind !== 'renew' && c.job && c.job.yearsLeft > 0) {
      c.trust = clamp(c.trust + 2, 0, 100);
      c.rep = clamp(c.rep + 1, 0, 100);
    }
    c.offers = c.offers.filter(x => x.id !== id);
    if (c.pendingJob && c.pendingJob.id === id) c.pendingJob = null;
  }
  function applyPending(c) {
    const o = c.pendingJob;
    c.pendingJob = null;
    if (!o) {
      if (c.unemployed || (c.job && c.job.yearsLeft <= 0 && c.comp !== 'sel')) {
        c.unemployed = true;
        return false;
      }
      if (c.comp === 'sel') returnFromSpecial(c);
      return true;
    }
    if (o.kind === 'euro') return startEuro(c, o);
    if (o.kind === 'selecao') return startSelecao(c, o);
    return joinBrasil(c, o);
  }
  function joinBrasil(c, o) {
    if (c.comp !== 'br') {
      c.comp = 'br'; c.side = null;
    }
    const moved = o.clubId !== c.clubId;
    if (moved) {
      c.str[c.clubId] = Math.round(squadStr(c.squad));
      const last = c.clubs[c.clubs.length - 1]; if (last && !last.to) last.to = c.year;
      // find div
      let div = o.div;
      for (let d = 0; d < 4; d++) if (c.members[d].indexOf(o.clubId) >= 0) div = d;
      c.clubId = o.clubId; c.div = div;
      const keep = squadStr(c.squad);
      const cap = BAL.divBase[div] + 5;
      const target = Math.min(cap, Math.max(keep, Math.min(c.str[o.clubId] || keep, keep + 2)));
      c.squad = makeSquad(c.seed, o.clubId + ':' + c.year, target);
      clipSquad(c.squad, cap);
      c.clubs.push({ id: o.clubId, from: c.year + 1, div });
      c.timeline.push({ y: c.year + 1, t: 'Assumiu o ' + o.nome + ' (' + DIVN[div] + ').' });
    }
    c.job = { yearsLeft: o.years, ambition: o.ambition, salary: o.salary, fanPressure: o.fanPressure };
    c.budget = Math.max(c.budget, Math.round(o.budget * 0.7));
    if (moved) c.trust = clamp(Math.round(c.trust * 0.4 + (74 - o.fanPressure / 10) * 0.6), 28, 86);
    else c.trust = clamp(c.trust + 2, 0, 100);
    c.fans = clamp(c.fans * 0.5 + (58 - o.fanPressure / 20), 25, 90);
    c.rep = clamp(c.rep + Math.round(o.prestige / 30), 0, 100);
    c.unemployed = false; c.sacked = false;
    return true;
  }
  function snapshotReturn(c) {
    c.returnTo = { clubId: c.clubId, div: c.div, squad: c.squad.map(p => ({ ...p })), job: c.job, budget: c.budget, comp: 'br' };
  }
  function startEuro(c, o) {
    if (c.comp === 'br') snapshotReturn(c);
    const ids = Object.keys(EURO);
    const str = {};
    ids.forEach((id, i) => { str[id] = 76 + (i % 5) - 1; });
    str[o.clubId] = Math.min(str[o.clubId], squadStr(c.squad) + 3);
    c.squad = makeSquad(c.seed, 'euro' + c.year, str[o.clubId]);
    c.side = { members: ids, str, played: [], fix: null };
    c.comp = 'euro'; c.clubId = o.clubId;
    c.job = { yearsLeft: o.years, ambition: 'champions', salary: o.salary, fanPressure: o.fanPressure };
    c.budget = o.budget; c.trust = 64; c.fans = 55; c.unemployed = false;
    c.timeline.push({ y: c.year + 1, t: 'Foi treinar o ' + o.nome + ' na Europa.' });
    c.clubs.push({ id: o.clubId, from: c.year + 1, div: 4 });
    return true;
  }
  function startSelecao(c, o) {
    if (c.comp === 'br') snapshotReturn(c);
    const ids = Object.keys(NATIONS);
    const str = { bra: 80, arg: 79, fra: 80, ger: 79, esp: 78, eng: 78 };
    c.squad = makeSquad(c.seed, 'sel' + c.year, 81);
    c.side = { members: ids, str, played: [], fix: null };
    c.comp = 'sel'; c.clubId = 'bra';
    c.job = { yearsLeft: 1, ambition: 'selecao', salary: 8, fanPressure: 80 };
    c.budget = 30; c.trust = 70; c.fans = 75; c.unemployed = false;
    c.timeline.push({ y: c.year + 1, t: 'Convocado para a Seleção Brasileira.' });
    return true;
  }
  function returnFromSpecial(c) {
    const back = c.returnTo;
    c.side = null; c.comp = 'br';
    if (!back) { c.unemployed = true; return; }
    c.clubId = back.clubId; c.div = back.div; c.squad = back.squad; c.job = back.job; c.budget = back.budget;
    c.returnTo = null;
    if (c.members[c.div].indexOf(c.clubId) < 0) {
      let found = -1;
      for (let d = 0; d < 4; d++) if (c.members[d].indexOf(c.clubId) >= 0) found = d;
      if (found >= 0) c.div = found;
    }
    c.timeline.push({ y: c.year + 1, t: 'Voltou ao ' + clubOf(c.clubId).nome + '.' });
  }
  const DECS = [
    { id: 'base', t: 'A base pede passagem', d: 'O coordenador quer saber onde vai o pouco dinheiro.', opts: [
      { tx: 'Treinar a garotada', tag: 'g', train: BAL.goodTrain, budget: -6, fans: 3, trust: 2 },
      { tx: 'Meio-termo', tag: 'm', train: BAL.midTrain, budget: 2, trust: 1 },
      { tx: 'Medalhão emergencial', tag: 'b', train: 4, budget: -16, trust: -3, fans: 2 }
    ] },
    { id: 'grupo', t: 'Clima no vestiário', d: 'O elenco discutiu depois do último resultado.', opts: [
      { tx: 'Blindar o capitão', tag: 'g', trust: 5, fans: 2, train: 4 },
      { tx: 'Deixar quieto', tag: 'm', trust: 1 },
      { tx: 'Lavar roupa suja', tag: 'b', trust: -8, fans: 3, rep: 1 }
    ] },
    { id: 'imprensa', t: 'Coletiva quente', d: 'Perguntam se a diretoria atrapalha.', opts: [
      { tx: 'Responder com calma', tag: 'g', trust: 3, fans: 2, train: 4 },
      { tx: 'Desconversar', tag: 'm', trust: 0 },
      { tx: 'Cobrar a diretoria', tag: 'b', trust: -6, rep: 3 }
    ] },
    { id: 'estilo', t: 'Semana de treino', d: 'Dá para afiar o que o seu técnico já faz melhor.', opts: [
      { tx: 'Insistir no ponto forte', tag: 'g', focus: 1, train: 8 },
      { tx: 'Treino leve', tag: 'm', train: 2 },
      { tx: 'Mudar a filosofia', tag: 'b', focus: -1, low: 1, trust: -2 }
    ] },
    { id: 'elenco', t: 'Proposta por um titular', d: 'Querem o seu melhor jogador. O caixa agradece, a torcida nem tanto.', opts: [
      { tx: 'Renovar com o líder', tag: 'g', fans: 4, trust: 2, budget: -4, train: 6 },
      { tx: 'Segurar e pronto', tag: 'm', trust: 1 },
      { tx: 'Vender agora', tag: 'b', sell: 1, budget: 16, fans: -8, trust: -2 }
    ] },
    { id: 'torcida', t: 'Arquibancada', d: 'A torcida cobrou o time na saída do estádio.', opts: [
      { tx: 'Abrir um treino', tag: 'g', fans: 6, budget: -3, trust: 1, train: 6 },
      { tx: 'Nota oficial', tag: 'm', fans: 1 },
      { tx: 'Ignorar o barulho', tag: 'b', fans: -7, trust: -3 }
    ] }
  ];
  function makeDecision(c, slot) {
    const r = R(c.seed, 'dec', c.year, slot, c.seasons);
    const used = c._usedDec || [];
    let pick = DECS[r.int(0, DECS.length - 1)];
    for (let i = 0; i < 6 && used.indexOf(pick.id) >= 0; i++) pick = DECS[r.int(0, DECS.length - 1)];
    c._usedDec = used.concat(pick.id);
    return { id: pick.id, t: pick.t, d: pick.d, opts: pick.opts, slot };
  }
  function applyOpt(c, opt) {
    if (!opt) return;
    if (opt.train) c.trainBank = (c.trainBank || 0) + opt.train;
    if (opt.budget) c.budget = clamp(c.budget + opt.budget, 0, 140);
    if (opt.trust) c.trust = clamp(c.trust + opt.trust, 0, 100);
    if (opt.fans) c.fans = clamp(c.fans + opt.fans, 0, 100);
    if (opt.rep) c.rep = clamp(c.rep + opt.rep, 0, 100);
    if (opt.focus) {
      const slots = c.coach.slots;
      const focus = ORDER.slice().sort((a, b) => slots[b].rating - slots[a].rating)[0];
      c.bonus[focus] = (c.bonus[focus] || 0) + opt.focus;
      if (opt.focus < 0) slots[focus].rating = clamp(slots[focus].rating - 1, 55, 99);
    }
    if (opt.low) {
      const slots = c.coach.slots;
      const low = ORDER.slice().sort((a, b) => slots[a].rating - slots[b].rating)[0];
      c.bonus[low] = (c.bonus[low] || 0) + opt.low;
    }
    if (opt.sell) {
      const xi = bestXI(c.squad).slice().sort((a, b) => b.rating - a.rating);
      if (xi[0]) xi[0].rating = Math.max(50, xi[0].rating - 8);
    }
    c.feed.unshift(opt.tx + '.');
  }
  function policyIndex(dec, policy) {
    const want = policy === 'bad' ? 'b' : policy === 'avg' ? 'm' : 'g';
    const i = dec.opts.findIndex(o => o.tag === want);
    return i < 0 ? 0 : i;
  }
  function offerFit(c, o) {
    const sq = squadStr(c.squad);
    const base = o.kind === 'euro' ? 76 : o.kind === 'selecao' ? 78 : BAL.divBase[o.div] || 60;
    if (o.kind === 'euro') return c.rep >= 74 && sq >= base - 4 && !!(c.titles.A || c.titles.lib);
    if (o.kind === 'selecao') return c.rep >= 82 && !!(c.titles.A || c.titles.lib);
    if (o.ambition === 'campeao' && sq < base + 2) return false;
    if (o.ambition === 'libertadores' && sq < base + 1) return false;
    if (o.fanPressure >= 78 && sq < base + 1) return false;
    if (o.div > (c.summary ? c.summary.toDiv : c.div) + 0 && o.kind === 'brasil' && o.clubId !== c.clubId) {
      if (sq + 3 < (c.str[o.clubId] || base)) return false;
    }
    return true;
  }
  function autoInbox(c, policy) {
    const offers = (c.offers || []).slice();
    if (policy === 'good') {
      const pool = offers.filter(o => offerFit(c, o));
      const renew = pool.find(o => o.kind === 'renew');
      const fame = id => FAME[id] || 0;
      const better = pool.filter(o => o.kind === 'brasil' && o.clubId !== c.clubId && o.budget >= c.budget + 16 && o.fanPressure <= 58 && fame(o.clubId) > fame(c.clubId));
      const dream = pool.find(o => o.kind === 'euro' || o.kind === 'selecao');
      const pick = dream || better.sort((a, b) => b.budget - a.budget)[0] || renew || null;
      if (pick) {
        if (pick.budget < 48 && !pick.negotiated) negotiate(c, pick.id);
        acceptOffer(c, pick.id);
      }
    } else if (policy === 'avg') {
      const pick = offers.find(o => o.kind === 'renew') || offers[0];
      acceptOffer(c, pick.id);
    } else {
      const pick = offers.slice().sort((a, b) => (b.prestige || 0) - (a.prestige || 0))[0];
      acceptOffer(c, pick.id);
    }
    if (mustSign(c) && !c.pendingJob) {
      if (offers[0]) acceptOffer(c, offers[0].id);
      else { retire(c, 'sem-clube'); return; }
    }
    if (!closeInbox(c)) {
      if (c.offers && c.offers[0] && !c.pendingJob) acceptOffer(c, c.offers[0].id);
      if (!closeInbox(c)) retire(c, 'sem-clube');
    }
  }
  function mustSign(c) {
    if (c.pendingJob) return false;
    if (c.unemployed) return true;
    if (c.job && c.job.yearsLeft <= 0 && c.comp !== 'sel') return true;
    return false;
  }
  function closeInbox(c) {
    if (c.phase !== 'inbox') return true;
    if (c.inboxBack === 'season') { c.phase = 'season'; c.inboxBack = null; return true; }
    if (mustSign(c)) return false;
    advanceQueue(c);
    return true;
  }
  function advanceQueue(c) {
    c.queue.shift();
    const n = c.queue[0];
    if (!n || n === 'next') { beginSeason(c); return; }
    if (n === 'summary') { c.phase = 'summary'; return; }
    if (n === 'inbox') { c.phase = 'inbox'; c.inboxBack = null; return; }
    if (n === 'mentor') { enterMentor(c); return; }
    if (n === 'decision') { c._usedDec = []; c.decision = makeDecision(c, 'fim' + c.queue.length); c.phase = 'decision'; return; }
    if (n === 'retire') { retire(c, 'idade'); return; }
    beginSeason(c);
  }
  function ackSummary(c) {
    if (c.queue[0] === 'summary') advanceQueue(c);
    else beginSeason(c);
  }
  function chooseDecision(c, index) {
    const d = c.decision; if (!d) return;
    applyOpt(c, d.opts[index] || d.opts[0]);
    c.decision = null;
    if (c.inboxBack === 'season' || d.slot === 'meio') { c.phase = 'season'; c.inboxBack = null; return; }
    advanceQueue(c);
  }
  function beginSeason(c) {
    if (c.done) return;
    if (!applyPending(c) && c.unemployed) {
      c.offers = buildOffers(c, 'demitido');
      c.phase = 'inbox'; c.queue = ['inbox', 'next'];
      return;
    }
    if (c.comp === 'sel' && !c.pendingJob && c.queue[0] === 'next') {
      /* return already handled if no pending */
    }
    c.year++;
    if (c.seasons >= 20 || c.age >= 60) { retire(c, 'fim'); return; }
    if (c.summary && c.summary.promoted && c.comp === 'br') {
      const floor = Math.min(devCap(c), BAL.divBase[c.div] + 3);
      if (squadStr(c.squad) < floor) trainXI(c.squad, 20, floor);
    }
    beginFix(c);
    c.phase = 'season'; c.queue = []; c.summary = null;
    c.feed.unshift('Temporada ' + c.year + ' começou.');
  }
  function retire(c, why) {
    c.done = true; c.phase = 'done'; c.retireWhy = why || 'pedido';
    const last = c.clubs[c.clubs.length - 1]; if (last && !last.to) last.to = c.year;
    c.doc = documentary(c);
    const mus = loadStore();
    mus.museum.unshift(c.doc);
    mus.museum = mus.museum.slice(0, 12);
    if (c.slot >= 0 && c.slot < 3) mus.slots[c.slot] = null;
    saveStore(mus);
    c.timeline.push({ y: c.year, t: 'Fim de carreira.' });
  }
  function documentary(c) {
    const t = c.titles;
    const cups = t.A + t.B + t.C + t.D + t.copa + t.lib + t.euro + t.selecao;
    let titulo = 'O Professor da Estrada';
    let frase = 'Não levantou taça, mas deixou elenco, vestiário e umas histórias boas de arquibancada.';
    if (t.selecao) { titulo = 'O Técnico da Amarelinha'; frase = 'Chegou na Seleção e ainda voltou para contar.'; }
    else if (t.lib) { titulo = 'Rei da América'; frase = 'A Libertadores entrou no museu. O resto é conversa.'; }
    else if (t.A) { titulo = 'Campeão Brasileiro'; frase = 'Subiu a pirâmide e ainda ficou com a taça da Série A.'; }
    else if (t.copa) { titulo = 'Carrasco da Copa'; frase = 'A Copa do Brasil coube na prateleira.'; }
    else if (c.reachedA) { titulo = 'Chegou na Elite'; frase = 'A Série A deixou de ser poster e virou calendário.'; }
    else if (c.sacked && cups === 0) { titulo = 'O Técnico sem Banco'; frase = 'A diretoria perdeu a paciência antes da taça chegar.'; }
    else if (cups) { titulo = 'Caçador de Acesso'; frase = 'Levantou taça no caminho. A pirâmide é longa de propósito.'; }
    const mentors = c.mentors.map(m => mentorText(c, m));
    return {
      nome: c.nome, age: c.age, seasons: c.seasons, seed: c.seed, titulo, frase,
      titles: c.titles, mentors, timeline: c.timeline.slice(), clubs: c.clubs.slice(),
      peak: c.peak, reachedA: c.reachedA, rep: c.rep, sacked: !!c.sacked, year: c.year
    };
  }
  function divLabel(c) {
    if (c.comp === 'euro') return 'Liga Europeia';
    if (c.comp === 'sel') return 'Seleção';
    return DIVN[c.div] || 'Série D';
  }
  function liveRun(c) {
    let foeId, label, home = true, oppStr, ko = false;
    if (cupDue(c) && c.copaRound >= 3) {
      const f = cupFoe(c, 'copa', c.copaRound); foeId = f.id; oppStr = f.str; home = f.home; ko = true;
      label = ['Copa do Brasil · 32-avos', 'Copa · oitavas', 'Copa · quartas', 'Copa · semifinal', 'Copa do Brasil · final'][c.copaRound];
      c._liveKind = 'copa';
    } else if (libDue(c) && c.libRound >= 2) {
      const f = cupFoe(c, 'lib', c.libRound); foeId = f.id; oppStr = f.str; home = f.home; ko = true;
      label = ['Libertadores · oitavas', 'Libertadores · quartas', 'Libertadores · semifinal', 'Libertadores · final'][c.libRound];
      c._liveKind = 'lib';
    } else {
      const f = fixture(c);
      if (!f) return null;
      foeId = f[0] === c.clubId ? f[1] : f[0];
      home = f[0] === c.clubId;
      oppStr = myStr(c, foeId);
      label = divLabel(c) + ' · Rodada ' + (c.round + 1);
      c._liveKind = 'liga';
    }
    const foe = clubOf(foeId);
    const npc = npcSide(foeId);
    const xi = bestXI(c.squad);
    const me = clubOf(c.clubId);
    const opp = {
      nome: foe.nome, flag: '🏳️', boss: false, kit: [foe.c1, foe.c2],
      scorers: npc.scorers, scorerW: npc.scorerW, gk: npc.gk, lines: linesFrom(oppStr)
    };
    const run = {
      v: 1, seed: c.seed + '-J' + c.year + '-' + c.round + '-' + (c._liveKind || ''),
      level: 1, selecao: 'bra82',
      clubKit: [me.c1, me.c2], clubFlag: '🏳️', clubShort: me.curto, clubName: me.nome,
      players: xi.map(p => ({ nome: p.nome, pos: p.pos, rating: p.rating, traits: p.traits || '', id: p.nome })),
      cards: c.coach.slots.def.rating >= c.coach.slots.atk.rating ? ['casinha', 'pressao'] : ['pressao', 'casinha'],
      relics: [], fichas: 0, stage: ko ? 3 : 0, history: new Array(Math.max(1, c.round)).fill(0).map(() => ({})),
      opponents: [{ nome: foe.nome, flag: '🏳️', baseStr: Math.round(oppStr), jit: { atk: 0, mid: 0, def: 0, gk: 0 }, scorers: npc.scorers, scorerW: npc.scorerW, gk: npc.gk }],
      careerOpp: opp, careerKo: ko, careerHome: home, careerLabel: label,
      coach: c.coach, status: 'playing', nrgPenalty: c.age >= 58 ? 1 : 0,
      goalsBy: {}, goalTypes: {}, cardLv: {}, cardLog: {}, epics: [], careerMatch: true,
      groupPts: 0, totalGF: 0, totalGA: 0, rewardRerolls: 0, shopRerolls: 0
    };
    c.liveCount++;
    return run;
  }
  function applyLive(c, gf, ga) {
    const kind = c._liveKind || 'liga';
    let msg = '';
    if (kind === 'copa' || kind === 'lib') msg = simCupGame(c, kind === 'copa' ? 'copa' : 'lib', [gf, ga]);
    else msg = simLeagueRound(c, [gf, ga]);
    if (maybeMid(c)) return { screen: screenFor(c), msg };
    if (c.round >= c.rounds && c.phase === 'season') { endSeason(c); return { screen: screenFor(c), msg }; }
    return { screen: 'carHub', msg };
  }
  function screenFor(c) {
    if (!c || c.done) return 'carDoc';
    if (c.phase === 'summary') return 'carFim';
    if (c.phase === 'inbox') return 'carInbox';
    if (c.phase === 'mentor') return 'carMentor';
    if (c.phase === 'decision') return 'carDec';
    return 'carHub';
  }
  function pump(c, mode) {
    const jump = mode !== 'one';
    let msg = '', steps = 0;
    while (steps++ < 90) {
      if (c.done) return { screen: 'carDoc', msg };
      if (c.phase !== 'season') return { screen: screenFor(c), msg };
      if (cupDue(c) && c.copaRound >= 3) return { screen: 'carHub', msg: msg || 'Semifinal ou final no caminho.', live: true };
      if (libDue(c) && c.libRound >= 2) return { screen: 'carHub', msg: msg || 'Jogo grande da Libertadores.', live: true };
      if (cupDue(c)) { msg = simCupGame(c, 'copa'); if (!jump) return { screen: 'carHub', msg }; continue; }
      if (libDue(c)) { msg = simCupGame(c, 'lib'); if (!jump) return { screen: 'carHub', msg }; continue; }
      if (c.round >= c.rounds) { endSeason(c); return { screen: screenFor(c), msg }; }
      if (isKey(c)) return { screen: 'carHub', msg: msg || keyBlurb(c), live: true };
      msg = simLeagueRound(c);
      if (maybeMid(c)) return { screen: screenFor(c), msg };
      if (!jump) return { screen: 'carHub', msg };
    }
    return { screen: 'carHub', msg };
  }
  function keyBlurb(c) {
    const f = fixture(c);
    if (!f) return 'Jogo decisivo.';
    const foe = f[0] === c.clubId ? f[1] : f[0];
    const classic = isDerby(c.clubId, foe) ? 'Clássico. ' : '';
    return classic + divLabel(c) + ' · rodada ' + (c.round + 1) + ' contra ' + clubOf(foe).nome + '.';
  }
  function simulate(seed, policy, opts) {
    opts = opts || {};
    const c = create({ seed, policy, noMentor: opts.mentors === false, nums: opts.nums, clubId: opts.clubId, nome: opts.nome || 'Sim' });
    c.policy = policy;
    let guard = 0;
    while (!c.done && guard++ < 9000) {
      if (c.phase === 'season') {
        if (cupDue(c)) { simCupGame(c, 'copa'); continue; }
        if (libDue(c)) { simCupGame(c, 'lib'); continue; }
        if (c.round >= c.rounds) { endSeason(c); continue; }
        simLeagueRound(c);
        if (c._mid) {
          c._mid = false; c.midDone = true;
          const d = makeDecision(c, 'meio');
          applyOpt(c, d.opts[policyIndex(d, policy)]);
          c.phase = 'season';
        }
      } else if (c.phase === 'summary') ackSummary(c);
      else if (c.phase === 'inbox') autoInbox(c, policy);
      else if (c.phase === 'mentor') lockMentor(c);
      else if (c.phase === 'decision') {
        const d = c.decision || makeDecision(c, 'x');
        chooseDecision(c, policyIndex(d, policy));
      } else break;
    }
    return c;
  }
  function focusOf(c) {
    const sl = c.coach.slots;
    return ORDER.slice().sort((a, b) => sl[b].rating - sl[a].rating)[0];
  }
  function balance(n) {
    n = n || 24;
    const pols = ['good', 'avg', 'bad'];
    const out = {};
    pols.forEach(p => {
      const rows = [];
      for (let i = 0; i < n; i++) {
        const seed = 'B' + p + i;
        const c = simulate(seed, p, {});
        const aS = (c.seasonsLog || []).filter(s => s.div === 3).length;
        rows.push({
          a: c.reachedA, sack: !!c.wasSacked, seasons: c.seasons,
          titles: c.titles, peak: c.peak, aS,
          moves: Math.max(0, c.clubs.length - 1),
          abroad: c.clubs.some(x => x.div >= 4) || c.titles.euro > 0 || c.titles.selecao > 0
        });
      }
      const reach = rows.filter(r => r.a != null).map(r => r.a).sort((x, y) => x - y);
      const inA = rows.reduce((s, r) => s + r.aS, 0);
      const tA = rows.reduce((s, r) => s + r.titles.A, 0);
      out[p] = {
        n: rows.length,
        reachA: reach.length,
        medianToA: median(reach),
        minToA: reach[0] == null ? null : reach[0],
        maxToA: reach.length ? reach[reach.length - 1] : null,
        sack: rows.filter(r => r.sack).length,
        titleD: rows.reduce((s, r) => s + r.titles.D, 0),
        titleA: tA,
        titleCopa: rows.reduce((s, r) => s + r.titles.copa, 0),
        titleLib: rows.reduce((s, r) => s + r.titles.lib, 0),
        aTitleRate: inA ? Math.round(tA / inA * 100) : 0,
        moves: rows.reduce((s, r) => s + r.moves, 0),
        abroad: rows.filter(r => r.abroad).length
      };
    });
    const deltas = [];
    for (let i = 0; i < n; i++) {
      const a = simulate('M' + i, 'good', {});
      const b = simulate('M' + i, 'good', { mentors: false });
      const stat = (a.mentors.find(m => m.stat) || {}).stat;
      if (stat) deltas.push(a.coach.slots[stat].rating - b.coach.slots[stat].rating);
    }
    out.mentor = { n: deltas.length, medianDelta: median(deltas) };
    return out;
  }
  function median(a) {
    if (!a.length) return null;
    const s = a.slice().sort((x, y) => x - y);
    return s[Math.floor((s.length - 1) / 2)];
  }

  function loadStore() {
    try {
      const raw = (typeof localStorage !== 'undefined') ? localStorage.getItem(KEY) : (root.__ffcar || null);
      const j = raw ? JSON.parse(raw) : null;
      if (j && j.slots) return j;
    } catch (e) { /* vazio */ }
    return { slots: [null, null, null], museum: [] };
  }
  function saveStore(st) {
    const raw = JSON.stringify(st);
    try { if (typeof localStorage !== 'undefined') localStorage.setItem(KEY, raw); } catch (e) { /* cheio */ }
    root.__ffcar = raw;
  }
  function persist(c) {
    if (!c || c.done) return;
    const st = loadStore();
    const slot = clamp(c.slot | 0, 0, 2);
    st.slots[slot] = c;
    saveStore(st);
  }
  function badge(id, cls) {
    const cl = clubOf(id);
    const letter = (cl.curto || '?').slice(0, 1);
    return `<svg class="badge ${cls || ''}" viewBox="0 0 64 72" aria-hidden="true"><path d="M32 4 58 14 v22 c0 18-12 28-26 32C18 64 6 54 6 36 V14 Z" fill="${cl.c1}" stroke="${cl.c2}" stroke-width="3"/><text x="32" y="42" text-anchor="middle" font-size="20" font-family="Arial Black,sans-serif" fill="${cl.c2}">${esc(letter)}</text></svg>`;
  }
  function meter(lbl, v, col) {
    return `<div class="meter"><span>${lbl}</span><i><b style="width:${clamp(v, 0, 100)}%;background:${col || 'var(--lime)'}"></b></i><em>${Math.round(v)}</em></div>`;
  }
  function tableHtml(rows, me, n, start) {
    const from = start || 0;
    const lim = n == null ? rows.length - from : n;
    return `<div class="ctable">${rows.slice(from, from + lim).map((r, i) => {
      const pos = from + i;
      const z = pos < 4 ? 'up' : pos >= rows.length - 4 ? 'dn' : '';
      return `<div class="ctr ${r.id === me ? 'me' : ''} ${z}"><span>${pos + 1}</span><span>${esc(r.nome)}</span><b>${r.pts}</b><small>${r.j}</small><small>${r.gp - r.gc}</small></div>`;
    }).join('')}</div>`;
  }
  function coachBlock(c) {
    const sl = c.coach.slots;
    const lines = [];
    const by = {};
    c.mentors.forEach(m => { if (!m.stat) return; by[m.stat] = (by[m.stat] || []).concat(E.COACH_BY_ID[m.coachId].curto); });
    Object.keys(by).forEach(stat => {
      const mult = Math.min(3, 1 + by[stat].length);
      lines.push('Mentor: ' + by[stat].join(', ') + ' → ' + AN[stat] + ' cresce ' + mult + 'x mais rápido');
    });
    return `<div class="panel"><div class="ph">Técnico ${esc(c.nome)} <span class="r">${c.age} anos</span></div>
      <div class="gat">${ORDER.map(a => `<span>${AN[a].slice(0, 3).toUpperCase()} <b>${sl[a].rating}</b></span>`).join('')}</div>
      ${lines.map(t => `<p class="mentorline">${esc(t)}</p>`).join('') || '<p class="xs mut">Sem mentor ainda. A cada 5 temporadas sai um pacote.</p>'}</div>`;
  }
  function viewHub(c) {
    const p = myPlace(c);
    const f = fixture(c);
    const foe = f ? (f[0] === c.clubId ? f[1] : f[0]) : null;
    const live = c.phase === 'season' && (isKey(c) || cupIsLive(c));
    const me = clubOf(c.clubId);
    const spot = Math.max(0, p.table.findIndex(r => r.id === c.clubId));
    const win = Math.min(7, p.table.length);
    const from = Math.max(0, Math.min(spot - 2, p.table.length - win));
    return `<div class="topbar"><button class="chip" data-act="carHome">${esc(me.curto)}</button><span class="sp"></span><button class="chip" data-act="som">Som</button><span class="chip">${esc(divLabel(c))}</span></div>
      <div class="cclub">${badge(c.clubId)}<div><div class="eyebrow">${esc(divLabel(c))} · temporada ${c.year}</div><h2 class="ttl" style="margin:0">${esc(me.nome)}</h2><p class="sub" style="margin:2px 0 0">${esc(c.nome)} · ${c.age} anos · rep ${c.rep}</p></div></div>
      ${meter('Confiança', c.trust, '#7dffb3')}${meter('Torcida', c.fans, '#ffc83d')}${meter('Caixa', Math.min(100, c.budget), '#3aa0ff')}
      <div class="panel cfix hl"><div class="eyebrow g">${live ? 'Jogo decisivo' : 'Próximo'}</div><div class="bigfix">${foe ? badge(foe, 'sm') : ''}<div><b>${foe ? esc(clubOf(foe).nome) : 'Fim da temporada'}</b><small>${live ? 'Você entra em campo' : 'A tabela anda sozinha'} · rodada ${Math.min(c.rounds, c.round + 1)}</small></div></div>
        ${(c.feed || []).slice(0, 3).map(t => `<div class="feedline">${esc(t)}</div>`).join('')}</div>
      <div class="panel"><div class="ph">Perto de você <span class="r">${p.i + 1}º · ${p.row ? p.row.pts : 0} pts</span></div>
        <div class="ctr h"><span>#</span><span>Clube</span><b>P</b><small>J</small><small>SG</small></div>
        ${tableHtml(p.table, c.clubId, win, from)}
        <p class="xs mut">Faixa verde sobe. Faixa vermelha cai.</p></div>
      ${coachBlock(c)}
      <div class="mctrl">
        ${live ? `<button class="btn gold shine" data-act="carLive">Jogar ao vivo</button><button class="btn sec" data-act="carSkip">Simular este jogo</button>` : `<button class="btn shine" data-act="carJump">Simular até o jogo decisivo</button><button class="btn sec" data-act="carOne">Só esta rodada</button>`}
        <div class="row" style="margin-top:8px"><button class="btn sec" data-act="carTabela">Tabela</button><button class="btn sec" data-act="carInboxBtn">Propostas${(c.offers && c.offers.length && c.phase === 'inbox') ? ' · ' + c.offers.length : ''}</button></div>
        ${c.seasons >= 15 ? `<button class="btn ghost" data-act="carRetire">Encerrar a carreira</button>` : ''}
      </div>`;
  }
  function viewCriar(d) {
    const nums = d.nums;
    return `<div class="topbar"><button class="chip" data-act="home">Início</button><span class="sp"></span><span class="chip">${d.left} pontos</span></div>
      <h2 class="ttl">Modo Carreira</h2><p class="sub">Vinte temporadas, da Série D à elite. Você joga os jogos grandes. O resto da tabela anda sozinho.</p>
      <div class="panel"><div class="ph">Seu nome</div><input class="seed" id="carName" maxlength="24" value="${esc(d.nome)}" aria-label="Nome do técnico"></div>
      <div class="panel"><div class="ph">Atributos <span class="r">60 a 78 · ${d.left} para distribuir</span></div>
        ${ORDER.map(a => `<div class="prow"><span>${AN[a]}</span><button data-act="carMinus" data-a="${a}" ${nums[a] <= 60 ? 'disabled' : ''}>−</button><b>${nums[a]}</b><button data-act="carPlus" data-a="${a}" ${(nums[a] >= 78 || d.left <= 0) ? 'disabled' : ''}>+</button></div>`).join('')}
      </div>
      <div class="panel"><div class="ph">Três projetos na Série D</div>
        ${d.clubs.map(id => { const cl = clubOf(id); const on = d.clubId === id ? 'on' : ''; return `<button class="clubpick ${on}" data-act="carClub" data-id="${id}">${badge(id, 'sm')}<span><b>${esc(cl.nome)}</b><small>Subir de divisão · elenco ${Math.round(d.world.str[id])}</small></span></button>`; }).join('')}
      </div>
      <div class="mctrl"><button class="btn gold shine" data-act="carStart" ${d.left !== 0 ? 'disabled' : ''}>Assinar e começar</button></div>`;
  }
  function viewDec(c) {
    const d = c.decision;
    if (!d) return viewHub(c);
    return `<div class="topbar"><span class="chip">Temporada ${c.year}</span><span class="sp"></span><span class="chip">${esc(divLabel(c))}</span></div>
      <div class="eyebrow g">Decisão</div><h2 class="ttl">${esc(d.t)}</h2><p class="sub">${esc(d.d)}</p>
      ${d.opts.map((o, i) => `<button class="optbig" data-act="carOpt" data-i="${i}"><b>${esc(o.tx)}</b><small>${esc(optHint(o))}</small></button>`).join('')}`;
  }
  function optHint(o) {
    const bits = [];
    if (o.train) bits.push('evolui o elenco');
    if (o.trust > 0) bits.push('sobe a confiança');
    if (o.trust < 0) bits.push('desgasta a diretoria');
    if (o.fans > 0) bits.push('agrada a torcida');
    if (o.fans < 0) bits.push('irrita a torcida');
    if (o.budget > 0) bits.push('encaixa dinheiro');
    if (o.budget < 0) bits.push('gasta caixa');
    if (o.focus > 0) bits.push('afina o seu ponto forte');
    if (o.sell) bits.push('vende o craque');
    if (o.rep > 0) bits.push('mexe com a reputação');
    return bits.join(' · ') || 'segue o jogo';
  }
  function viewInbox(c) {
    const list = c.offers || [];
    return `<div class="topbar"><button class="chip" data-act="carBackHub">Voltar</button><span class="sp"></span><span class="chip">Caixa de propostas</span></div>
      <h2 class="ttl">Propostas</h2><p class="sub">${c.unemployed ? 'Você está sem clube. Escolha um banco ou encerre.' : 'Dá para negociar um termo: mais caixa, contrato mais curto.'}</p>
      ${c.pendingJob ? `<div class="panel hl"><b>Combinado:</b> ${esc(c.pendingJob.nome)} · ${esc(c.pendingJob.ambitionLabel)}</div>` : ''}
      ${list.length ? list.map(o => `<article class="job ${o.from}">${badge(o.clubId, 'sm')}<div><div class="eyebrow">${esc(o.divNome)} · ${esc(o.from === 'euro' ? 'Europa' : o.from === 'selecao' ? 'Seleção' : 'Brasil')}</div><h3>${esc(o.nome)}</h3>
        <p>${esc(o.ambitionLabel)}</p>
        <p class="xs">Caixa ${o.budget} · salário ${o.salary} · prestígio ${o.prestige} · pressão ${o.fanPressure} · ${o.years} ano${o.years > 1 ? 's' : ''}${o.negotiated ? ' · negociado' : ''}</p>
        <p class="xs mut">Elenco deles ${o.squadStr} · o seu ${o.yourStr}. ${o.note ? esc(o.note) : ''}</p>
        <div class="jobacts"><button class="btn" data-act="carAccept" data-id="${esc(o.id)}">Aceitar</button><div class="row"><button class="btn sec" data-act="carNeg" data-id="${esc(o.id)}" ${o.negotiated ? 'disabled' : ''}>Negociar</button><button class="btn ghost" data-act="carReject" data-id="${esc(o.id)}">Recusar</button></div></div>
      </div></article>`).join('') : '<div class="empty">Nenhuma proposta agora.</div>'}
      <div class="mctrl"><button class="btn shine" data-act="carInboxOk">${mustSign(c) ? 'Precisa de um clube' : 'Continuar'}</button>
        ${mustSign(c) ? '<button class="btn ghost" data-act="carRetire">Encerrar a carreira</button>' : ''}</div>`;
  }
  function viewMentor(c) {
    const card = c.mentorRoll;
    const stat = c.mentorPick;
    const fakeN = stat ? c.mentors.filter(m => m.stat === stat).length + 1 : 0;
    const mult = stat ? Math.min(3, 1 + fakeN) : 0;
    const line = !card ? '' : !stat ? ('Mentor: ' + card.curto + ' → troféu (seus atributos já estão em 99)') : ('Mentor: ' + card.curto + ' → ' + AN[stat] + ' cresce ' + mult + 'x mais rápido');
    const strip = E.COACHES.map(co => `<div class="rcard ${card && co.id === card.id ? 'win' : ''}"><b>${esc(co.curto)}</b><small>${esc(co.flag)} ${co.s[rankedStats(co)[0]]}</small></div>`).join('');
    return `<div class="topbar"><span class="chip">Temporada ${c.seasons}</span><span class="sp"></span><span class="chip">Pacote de mentor</span></div>
      <div class="eyebrow g">A cada 5 temporadas</div><h2 class="ttl">Técnico lendário</h2>
      <p class="sub">O atributo mais alto dele acelera o seu. Se você já está em 99, vale o próximo.</p>
      <div class="roulette"><div class="strip">${strip}</div><i class="pin"></i></div>
      ${card ? `<article class="mcard"><div class="eyebrow">${esc(card.flag)} Lenda</div><h3 class="disp">${esc(card.nome)}</h3><p class="xs">${esc(card.fama)}</p><div class="gat">${ORDER.map(a => `<span class="${stat === a ? 'hot' : ''}">${AN[a].slice(0, 3).toUpperCase()} <b>${card.s[a]}</b></span>`).join('')}</div><p class="mentorline">${esc(line)}</p></article>` : ''}
      <div class="mctrl"><button class="btn gold shine" data-act="carMentorOk">Levar esse mentor</button></div>`;
  }
  function viewFim(c) {
    const s = c.summary || { table: [], pos: 0, n: 20, year: c.year, div: c.div, toDiv: c.div, clubId: c.clubId, champ: false, promoted: false, relegated: false, fire: false, trustDelta: 0 };
    const title = s.champ ? 'CAMPEÃO' : s.promoted ? 'ACESSO' : s.relegated ? 'REBAIXADO' : 'TEMPORADA';
    return `<div class="topbar"><span class="chip">Temporada ${s.year}</span><span class="sp"></span>${s.fire ? '<span class="chip">Fogos</span>' : ''}</div>
      <div class="seasonend ${s.promoted || s.champ ? 'up' : ''} ${s.relegated ? 'dn' : ''}">${s.fire ? '<div class="fw" aria-hidden="true"></div><div class="fw d2"></div><div class="fw d3"></div>' : ''}
        <div class="eyebrow">${esc(s.comp === 'br' ? DIVN[s.div] : divLabel(c))}</div>
        <h2 class="ttl lift">${title}</h2>
        <p class="sub">${esc(clubOf(s.clubId).nome)} · ${s.pos + 1}º de ${s.n}${s.promoted ? ' · sobe para a ' + DIVN[s.toDiv] : ''}${s.relegated ? ' · cai para a ' + DIVN[s.toDiv] : ''}</p>
        ${s.champ ? '<div class="trophy" aria-hidden="true">🏆</div>' : ''}
      </div>
      <div class="panel"><div class="ph">Confiança ${s.trustDelta >= 0 ? '+' : ''}${s.trustDelta}</div>
        <div class="ctr h"><span>#</span><span>Clube</span><b>P</b><small>J</small><small>SG</small></div>
        ${tableHtml(s.full || s.table, s.clubId, 20)}</div>
      <div class="mctrl"><button class="btn gold shine" data-act="carAck">Continuar</button>${c.seasons >= 15 ? '<button class="btn ghost" data-act="carRetire">Me aposentar</button>' : ''}</div>`;
  }
  function viewDoc(c) {
    const d = (c && c.doc) || c;
    if (!d || !d.titulo) return '<div class="empty">Nenhuma carreira encerrada.</div>';
    const t = d.titles || emptyTitles();
    return `<div class="topbar"><button class="chip" data-act="home">Início</button><span class="sp"></span><button class="chip" data-act="carMuseu">Museu</button></div>
      <div class="doc"><div class="eyebrow g">Documentário</div><h2 class="ttl">${esc(d.titulo)}</h2>
        <p class="sub">${esc(d.nome)} · ${d.seasons} temporadas · ${d.age} anos</p>
        <p>${esc(d.frase)}</p>
        <div class="statsrow"><div class="stat"><b>${t.D + t.C + t.B + t.A}</b><span>Títulos de liga</span></div><div class="stat"><b>${t.copa}</b><span>Copa</span></div><div class="stat"><b>${t.lib}</b><span>Liberta</span></div></div>
        ${(d.mentors || []).map(m => `<p class="mentorline">${esc(m)}</p>`).join('')}
        <div class="timeline">${(d.timeline || []).map(ev => `<div><b>${ev.y}</b><span>${esc(ev.t)}</span></div>`).join('')}</div>
      </div>
      <div class="mctrl"><button class="btn gold" data-act="carShare">Compartilhar retrospectiva</button><button class="btn sec" data-act="home">Voltar ao início</button></div>`;
  }
  function viewMuseu(list, c) {
    const items = list || [];
    return `<div class="topbar"><button class="chip" data-act="carHome">Carreira</button><span class="sp"></span><span class="chip">Museu</span></div>
      <h2 class="ttl">Museu da Carreira</h2><p class="sub">Títulos, mentores e os bancos por onde você passou.</p>
      ${c && !c.done ? coachBlock(c) : ''}
      ${items.length ? items.map(d => `<article class="panel"><div class="ph">${esc(d.nome)} <span class="r">${esc(d.titulo)}</span></div><p class="small">${esc(d.frase)}</p><p class="xs mut">${(d.mentors || []).slice(0, 3).map(esc).join(' · ') || 'Sem mentor'}</p></article>`).join('') : '<div class="empty">O museu abre quando uma carreira termina.</div>'}
      ${c && c.timeline ? `<div class="panel"><div class="ph">Linha do tempo</div><div class="timeline">${c.timeline.map(ev => `<div><b>${ev.y}</b><span>${esc(ev.t)}</span></div>`).join('')}</div></div>` : ''}`;
  }
  function viewHome(st) {
    const slots = st.slots || [null, null, null];
    return `<div class="topbar"><button class="chip" data-act="home">Início</button><span class="sp"></span><button class="chip" data-act="som">Som</button></div>
      <h2 class="ttl">Modo Carreira</h2><p class="sub">Uma pirâmide brasileira, copas e, de vez em quando, um mentor lendário.</p>
      ${slots.map((s, i) => s && !s.done ? `<button class="clubpick" data-act="carCont" data-i="${i}">${badge(s.clubId, 'sm')}<span><b>${esc(s.nome)} · ${esc(clubOf(s.clubId).nome)}</b><small>${esc(divLabel(s))} · temporada ${s.year}</small></span></button>` : `<button class="clubpick" data-act="carNew" data-i="${i}"><span><b>Novo jogo · vaga ${i + 1}</b><small>Começa na Série D, aos 40 anos</small></span></button>`).join('')}
      <button class="btn sec" style="margin-top:12px" data-act="carMuseu">Museu da Carreira</button>`;
  }
  function view(screen, c, extra) {
    if (screen === 'carHome') return viewHome(extra || loadStore());
    if (screen === 'carCriar') return viewCriar(extra);
    if (!c) return viewHome(loadStore());
    if (screen === 'carTabela') {
      const p = myPlace(c);
      return `<div class="topbar"><button class="chip" data-act="carBackHub">Hub</button><span class="sp"></span><span class="chip">${esc(divLabel(c))}</span></div><h2 class="ttl">Tabela</h2><div class="ctr h"><span>#</span><span>Clube</span><b>P</b><small>J</small><small>SG</small></div>${tableHtml(p.table, c.clubId)}`;
    }
    if (screen === 'carDec') return viewDec(c);
    if (screen === 'carInbox') return viewInbox(c);
    if (screen === 'carMentor') return viewMentor(c);
    if (screen === 'carFim') return viewFim(c);
    if (screen === 'carDoc') return viewDoc(c.doc || c);
    if (screen === 'carMuseu') return viewMuseu((extra && extra.museum) || loadStore().museum, c);
    return viewHub(c);
  }
  function draftNew(seed) {
    const world = freshWorld(E.normalizeSeed(seed) || 'FOMINHA');
    const clubs = startClubs(world, E.normalizeSeed(seed) || 'FOMINHA');
    return { nome: 'Professor', nums: blankNums(), left: 18, clubs, clubId: clubs[0], world, seed: E.normalizeSeed(seed) || 'FOMINHA' };
  }
  function shareText(d) {
    const t = d.titles || emptyTitles();
    return `Fominha FC · ${d.titulo}\n${d.nome} · ${d.seasons} temporadas\nLigas ${t.D + t.C + t.B + t.A} · Copa ${t.copa} · Liberta ${t.lib}\n${(d.mentors || []).slice(0, 2).join(' | ')}`;
  }

  function skipLive(c) {
    let msg = '';
    if (cupDue(c) && c.copaRound >= 3) msg = simCupGame(c, 'copa');
    else if (libDue(c) && c.libRound >= 2) msg = simCupGame(c, 'lib');
    else msg = simLeagueRound(c);
    if (maybeMid(c)) return { screen: screenFor(c), msg };
    if (c.phase === 'season' && c.round >= c.rounds) { endSeason(c); return { screen: screenFor(c), msg }; }
    return { screen: screenFor(c), msg };
  }
  function demo(which) {
    if (which === 'criar') return { screen: 'carCriar', extra: draftNew('FOMINHA') };
    const c = create({ seed: 'TELA01', nome: 'Patrick', policy: 'good' });
    const want = which;
    const stop = () => {
      if (want === 'hub' || want === 'tabela' || want === 'jogo') return c.phase === 'season' && c.round >= 11;
      if (want === 'decisao') return c.phase === 'decision';
      if (want === 'fim') return c.phase === 'summary';
      if (want === 'fogos') return c.phase === 'summary' && c.summary && c.summary.fire;
      if (want === 'mentor') return c.phase === 'mentor';
      if (want === 'propostas') return c.phase === 'inbox' && c.offers && c.offers.length > 0;
      if (want === 'doc') return !!c.done;
      if (want === 'museu') return c.seasons >= 3;
      return true;
    };
    let g = 0;
    while (!stop() && g++ < 9000) {
      if (c.done) break;
      if (c.phase === 'season') {
        if (cupDue(c)) { simCupGame(c, 'copa'); continue; }
        if (libDue(c)) { simCupGame(c, 'lib'); continue; }
        if (c.round >= c.rounds) { endSeason(c); continue; }
        simLeagueRound(c);
        if (c._mid && want !== 'decisao') {
          c._mid = false; c.midDone = true;
          const d = makeDecision(c, 'meio'); applyOpt(c, d.opts[0]); c.phase = 'season';
        } else if (c._mid) maybeMid(c);
      } else if (c.phase === 'summary' && !(want === 'fim' || (want === 'fogos' && c.summary && c.summary.fire))) ackSummary(c);
      else if (c.phase === 'inbox' && want !== 'propostas') autoInbox(c, 'good');
      else if (c.phase === 'mentor' && want !== 'mentor') lockMentor(c);
      else if (c.phase === 'decision' && want !== 'decisao') chooseDecision(c, 0);
      else break;
    }
    const screen = { tabela: 'carTabela', decisao: 'carDec', fim: 'carFim', fogos: 'carFim', mentor: 'carMentor', propostas: 'carInbox', doc: 'carDoc', museu: 'carMuseu', jogo: 'carHub' }[want] || 'carHub';
    const extra = want === 'museu' ? { museum: [documentary(c)] } : null;
    return { screen, career: c, extra };
  }
  const FFCareer = {
    BAL, DIVN, ORDER, AN, CLUBS, create, simulate, balance, pump, screenFor, liveRun, applyLive,
    view, draftNew, badge, clubOf, persist, loadStore, saveStore, shareText,
    rollMentor, mentorStat, rankedStats, applyGrowth, mentorText, lockMentor,
    negotiate, acceptOffer, rejectOffer, closeInbox, chooseDecision, ackSummary, retire, skipLive, demo,
    squadStr, bestXI, trainXI, roundRobin, table, myPlace, offerFit, buildOffers,
    startClubs, freshWorld, fixture, isKey
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = FFCareer;
  else root.FFCareer = FFCareer;
})(typeof window !== 'undefined' ? window : globalThis);
