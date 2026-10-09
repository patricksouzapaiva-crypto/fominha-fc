/* Escudos originais, um por clube. Cores, listras, formato, iniciais e um símbolo simples.
   Não copia brasão, monograma registrado nem arte oficial. */
(function (root) {
  const RAW = {
    flamengo: 'shield h flame 1',
    palmeiras: 'circle solid palm 1',
    saopaulo: 'delta thirds none 0 #ffffff',
    corinthians: 'oval v cross 0',
    gremio: 'shield v none 3 #0d80bf #111111 #ffffff',
    internacional: 'shield solid none 2',
    atleticomg: 'shield v rooster 1',
    fluminense: 'shield thirds none 0 #ffffff',
    botafogo: 'shield solid star 1',
    bahia: 'shield thirds wave 0 #005ca9 #ffffff #c52626',
    fortaleza: 'shield half lion 1',
    athletico: 'shield h spiral 0',
    cruzeiro: 'circle solid cross 4',
    vasco: 'shield solid cross 0',
    bragantino: 'shield h bull 0',
    juventude: 'shield v leaf 1',
    atleticogo: 'shield v dragon 0',
    criciuma: 'hex h diamond 0',
    vitoria: 'shield v none 0',
    cuiaba: 'shield solid sun 0',
    santos: 'shield v fish 0',
    sport: 'shield h lion 1',
    ceara: 'shield v wave 0',
    goias: 'circle solid sun 0',
    coritiba: 'shield h none 0',
    avai: 'shield h lion 0',
    ponte: 'shield v bridge 0',
    guarani: 'shield solid leaf 0',
    americamg: 'shield v rabbit 0',
    chapecoense: 'shield solid bird 0',
    crb: 'shield h tower 0',
    nautico: 'circle v anchor 0',
    operario: 'hex solid wheel 0',
    novorizontino: 'shield solid sun 0',
    vilanova: 'shield v none 0',
    paysandu: 'shield v ship 2',
    botafogosp: 'oval solid star 1',
    amazonas: 'shield h wave 0',
    athletic: 'shield v none 0',
    londrina: 'shield solid tower 0',
    figueirense: 'oval v leaf 0',
    joinville: 'shield h ship 0',
    csa: 'circle solid tower 1',
    santacruz: 'shield h snake 0',
    remo: 'shield solid lion 1',
    sampaio: 'shield thirds none 0 #ffd100 #006437 #c52626',
    confianca: 'shield solid heart 0',
    botafogopb: 'shield solid star 1',
    ferroviario: 'hex solid wheel 0',
    saobernardo: 'shield solid tower 0',
    ypiranga: 'shield solid flame 0',
    tombense: 'shield v none 0',
    voltaredonda: 'circle solid wheel 0',
    ituano: 'shield solid key 0',
    abc: 'oval v none 0',
    americarn: 'circle h none 0',
    brasilpel: 'shield solid wave 0',
    portuguesa: 'shield thirds cross 0 #c52626 #ffffff #006437',
    caxias: 'shield v mountain 0',
    floresta: 'circle solid leaf 0',
    retro: 'oval h none 0',
    maranhao: 'shield solid moon 0',
    jacuipense: 'shield solid leaf 0',
    saoraimundo: 'shield solid cross 0',
    brasiliense: 'shield solid sun 0',
    gama: 'circle solid none 0',
    capital: 'pent solid tower 0',
    tunaluso: 'shield solid fish 0',
    riobrancoes: 'shield solid wave 0',
    serra: 'shield solid mountain 0',
    desportiva: 'oval solid none 0',
    realnoroeste: 'shield solid crown 0',
    noviguacu: 'shield solid flame 0',
    audax: 'hex solid arrow 0',
    saobento: 'shield solid cross 0',
    riobrancoac: 'shield solid wave 0',
    humaita: 'shield solid mountain 0',
    altos: 'shield solid mountain 0',
    sousa: 'shield solid crown 0',
    anapolis: 'circle solid sun 0',
    benfica: 'shield solid eagle 1',
    porto: 'circle solid dragon 0',
    ajax: 'shield v none 0',
    sevilla: 'oval v tower 0',
    lyon: 'shield solid lion 0',
    bruges: 'shield solid crown 0',
    celtic: 'circle hoop none 0',
    rangers: 'shield solid lion 0',
    feyenoord: 'shield half none 0',
    galatasaray: 'circle half lion 1',
    bra: 'diamond solid none 5',
    arg: 'shield v sun 3 #ffffff',
    fra: 'shield v rooster 0 #ffffff',
    ger: 'shield thirds eagle 0 #111111 #dd0000 #ffce00',
    esp: 'shield thirds crown 0 #c52626 #ffd100 #c52626',
    eng: 'shield solid lion 3'
  };

  let seq = 0;
  function parse(s) {
    const p = (s || 'shield solid none 0').split(/\s+/);
    const rest = p.slice(4).filter(x => x.charAt(0) === '#');
    return {
      sh: p[0], pat: p[1], sym: p[2] === 'none' ? '' : p[2], stars: +p[3] || 0,
      c3: rest.length === 1 ? rest[0] : '',
      cols: rest.length >= 3 ? rest.slice(0, 3) : null
    };
  }
  function hash(id) {
    let h = 0;
    for (let i = 0; i < id.length; i++) h = (h * 33 + id.charCodeAt(i)) >>> 0;
    const sh = ['shield', 'circle', 'oval', 'hex', 'pent'][h % 5];
    const pat = ['solid', 'h', 'v', 'sash'][(h >> 3) % 4];
    const sym = ['star', 'leaf', 'wave', 'tower', 'sun', 'flame'][(h >> 6) % 6];
    return { sh, pat, sym, stars: h % 2, c3: '', cols: null };
  }
  function specOf(id) { return RAW[id] ? parse(RAW[id]) : hash(id || '?'); }

  function shape(sh) {
    if (sh === 'circle') return 'M40 22 a20 20 0 1 0 .1 0 Z';
    if (sh === 'oval') return 'M40 16 C54 16 62 28 62 46 C62 68 52 78 40 78 C28 78 18 68 18 46 C18 28 26 16 40 16 Z';
    if (sh === 'hex') return 'M40 16 L60 28 V58 L40 74 L20 58 V28 Z';
    if (sh === 'delta') return 'M40 14 L66 76 H14 Z';
    if (sh === 'pent') return 'M40 14 L64 32 L56 74 H24 L16 32 Z';
    if (sh === 'diamond') return 'M40 14 L64 46 L40 78 L16 46 Z';
    return 'M40 14 L62 26 V48 C62 66 50 76 40 80 C30 76 18 66 18 48 V26 Z';
  }
  function symbol(name, fill) {
    const s = {
      star: `<polygon points="0,-11 2.8,-3.2 11,-3.2 4.4,1.4 6.6,9.2 0,4.6 -6.6,9.2 -4.4,1.4 -11,-3.2 -2.8,-3.2" fill="${fill}"/>`,
      flame: `<path d="M0 10 C-7 4 -6 -2 -1 -8 C0 -2 3 0 1 -5 C7 0 7 6 0 10Z" fill="${fill}"/>`,
      palm: `<path d="M0 10 V-1 M0 -1 C-8 -2 -9 -9 -2 -7 M0 -1 C8 -2 9 -9 2 -7 M0 -1 C-2 -9 4 -10 0 -4 M-3 10 H3" fill="none" stroke="${fill}" stroke-width="2.2" stroke-linecap="round"/>`,
      rooster: `<path d="M-6 6 C-9 0 -4 -5 1 -3 C2 -8 8 -7 5 -2 C10 0 8 6 1 7 Z M1 -3 L4 -9 L6 -3" fill="${fill}"/>`,
      cross: `<path d="M-3 -11 H3 V-3 H11 V3 H3 V11 H-3 V3 H-11 V-3 H-3 Z" fill="${fill}"/>`,
      wave: `<path d="M-11 1 Q-6 -5 -1 1 T9 1" fill="none" stroke="${fill}" stroke-width="2.6" stroke-linecap="round"/>`,
      anchor: `<circle cx="0" cy="-7" r="2.2" fill="none" stroke="${fill}" stroke-width="2"/><path d="M0 -5 V7 M-6 7 Q0 13 6 7 M-3.2 -7 H3.2" fill="none" stroke="${fill}" stroke-width="2.2" stroke-linecap="round"/>`,
      lion: `<circle cx="0" cy="2" r="5.2" fill="${fill}"/><path d="M-7 0 Q-9 -8 -2 -5 M7 0 Q9 -8 2 -5 M-3 -2 H3 M-2 5 H2" fill="none" stroke="${fill}" stroke-width="1.7" stroke-linecap="round"/>`,
      tower: `<path d="M-7 9 V-1 H-9 V-6 H-4 V-1 H4 V-6 H9 V-1 H7 V9 Z" fill="${fill}"/>`,
      sun: `<circle cx="0" cy="0" r="4.2" fill="${fill}"/><path d="M0 -9 V-6.2 M0 6.2 V9 M-9 0 H-6.2 M6.2 0 H9 M-6.4 -6.4 L-4.4 -4.4 M6.4 -6.4 L4.4 -4.4 M-6.4 6.4 L-4.4 4.4 M6.4 6.4 L4.4 4.4" stroke="${fill}" stroke-width="1.7" stroke-linecap="round"/>`,
      crown: `<path d="M-9 5 L-9 -2 L-4 2 L0 -7 L4 2 L9 -2 L9 5 Z" fill="${fill}"/>`,
      leaf: `<path d="M0 9 C-9 2 -7 -7 0 -9 C7 -7 9 2 0 9 M0 7 V-5" fill="${fill}"/>`,
      mountain: `<path d="M-11 8 L-3 -7 L2 1 L6 -4 L11 8 Z" fill="${fill}"/>`,
      wheel: `<circle cx="0" cy="0" r="7.5" fill="none" stroke="${fill}" stroke-width="2"/><path d="M0 -7.5 V7.5 M-7.5 0 H7.5 M-5 -5 L5 5 M5 -5 L-5 5" stroke="${fill}" stroke-width="1.4"/>`,
      ship: `<path d="M-9 3 H9 L6 8 H-6 Z M0 3 V-7 L8 2" fill="${fill}"/>`,
      diamond: `<path d="M0 -8 L7 0 L0 8 L-7 0 Z" fill="${fill}"/>`,
      arrow: `<path d="M-9 2 H5 L1 -3 M5 2 L1 7" fill="none" stroke="${fill}" stroke-width="2.3" stroke-linecap="round"/>`,
      fish: `<path d="M-9 0 Q0 -7 7 0 Q0 7 -9 0 Z M7 0 L11 -4 V4 Z M-2 -1.2 H1" fill="${fill}"/>`,
      heart: `<path d="M0 7 C-9 -2 -4 -9 0 -4 C4 -9 9 -2 0 7Z" fill="${fill}"/>`,
      key: `<circle cx="-3" cy="-2" r="4" fill="none" stroke="${fill}" stroke-width="2"/><path d="M0.5 1 L8 8 M5.5 8 H8 V5.5" stroke="${fill}" stroke-width="2" stroke-linecap="round"/>`,
      moon: `<path d="M3 -8 A8 8 0 1 0 3 8 A5.5 5.5 0 1 1 3 -8Z" fill="${fill}"/>`,
      spiral: `<path d="M0 0 A2 2 0 1 1 -1.2 1.4 A4.2 4.2 0 1 0 3.4 -2.2 A6.2 6.2 0 1 1 -4 3" fill="none" stroke="${fill}" stroke-width="2" stroke-linecap="round"/>`,
      bird: `<path d="M-9 3 Q-2 -7 7 -2 L2 2 L9 5 L0 4 Z" fill="${fill}"/>`,
      dragon: `<path d="M-9 5 Q-2 -7 5 -2 Q9 1 6 5 Q1 2 -2 7 Z M5 -2 L8 -6 L6 0" fill="${fill}"/>`,
      eagle: `<path d="M-11 2 Q-3 -9 0 -2 Q3 -9 11 2 Q3 0 0 5 Q-3 0 -11 2Z" fill="${fill}"/>`,
      bridge: `<path d="M-10 5 V-2 Q0 -9 10 -2 V5 M-10 5 H10 M-4 5 V1 M4 5 V1" fill="none" stroke="${fill}" stroke-width="2.2" stroke-linecap="round"/>`,
      bull: `<path d="M-8 2 Q-10 -6 -4 -2 L-2 -6 H2 L4 -2 Q10 -6 8 2 Q4 8 0 8 Q-4 8 -8 2Z" fill="${fill}"/>`,
      rabbit: `<ellipse cx="0" cy="2" rx="5" ry="6" fill="${fill}"/><path d="M-3 -2 L-5 -10 L-1 -3 M3 -2 L5 -10 L1 -3" fill="${fill}"/>`,
      snake: `<path d="M-10 4 Q-4 -4 0 2 T10 -2" fill="none" stroke="${fill}" stroke-width="2.4" stroke-linecap="round"/><circle cx="9" cy="-2" r="1.3" fill="${fill}"/>`,
      horse: `<path d="M-6 7 L-4 -2 L0 -7 L3 -2 L7 2 L2 7 Z" fill="${fill}"/>`
    };
    return s[name] || '';
  }
  function stars(n, y) {
    if (!n) return '';
    const gap = n > 4 ? 8 : 10;
    const w = (n - 1) * gap;
    let o = '';
    for (let i = 0; i < n; i++) {
      const x = 40 - w / 2 + i * gap;
      o += `<polygon points="${x},${y} ${x + 1.5},${y + 2.4} ${x + 4},${y + 2.6} ${x + 2},${y + 4.3} ${x + 2.6},${y + 7} ${x},${y + 5.4} ${x - 2.6},${y + 7} ${x - 2},${y + 4.3} ${x - 4},${y + 2.6} ${x - 1.5},${y + 2.4}" fill="#ffd76a" stroke="#8a5a00" stroke-width=".4"/>`;
    }
    return o;
  }
  function bands(spec, c1, c2, c3) {
    const a = c1, b = c2, d = c3 || '#ffffff';
    if (spec.pat === 'h' || spec.pat === 'hoop') {
      const n = spec.pat === 'hoop' ? 8 : 6, h = 70 / n;
      let o = '';
      for (let i = 0; i < n; i++) o += `<rect x="8" y="${12 + i * h}" width="64" height="${h + 0.8}" fill="${i % 2 ? b : a}"/>`;
      return o;
    }
    if (spec.pat === 'v') {
      const cols = spec.c3 || spec.cols ? [a, d, b] : [a, b, a, b, a];
      const w = 64 / cols.length;
      return cols.map((c, i) => `<rect x="${8 + i * w}" y="12" width="${w + 0.8}" height="72" fill="${c}"/>`).join('');
    }
    if (spec.pat === 'thirds') {
      return [a, d, b].map((c, i) => `<rect x="8" y="${12 + i * 24}" width="64" height="25" fill="${c}"/>`).join('');
    }
    if (spec.pat === 'sash') return `<rect x="8" y="12" width="64" height="72" fill="${a}"/><polygon points="8,12 36,12 8,52" fill="${b}"/><polygon points="72,84 44,84 72,44" fill="${b}"/>`;
    if (spec.pat === 'half') return `<rect x="8" y="12" width="32" height="72" fill="${a}"/><rect x="40" y="12" width="32" height="72" fill="${b}"/>`;
    return `<rect x="6" y="10" width="68" height="76" fill="${a}"/>`;
  }

  function badge(club, cls) {
    const id = (club && club.id) || 'x';
    const sp = specOf(id);
    let c1 = (club && club.c1) || '#145c32';
    let c2 = (club && club.c2) || '#ffffff';
    if (sp.cols) { c1 = sp.cols[0]; c2 = sp.cols[2]; }
    const c3 = sp.cols ? sp.cols[1] : sp.c3;
    const init = String((club && club.curto) || '?').replace(/[^A-Za-z0-9]/g, '').slice(0, 3).toUpperCase();
    const clip = 'bd' + (++seq) + id.replace(/[^a-z0-9]/gi, '');
    const small = cls === 'sm';
    const symFill = sp.pat === 'solid' ? (c2 === c1 ? '#ffffff' : c2) : '#ffffff';
    const big = { star: 1.55, cross: 1.35, eagle: 1.15, lion: 1.05, rooster: 1.08, palm: 1.12, fish: 1.15 };
    const sc = big[sp.sym] || 1;
    const sym = sp.sym ? symbol(sp.sym, symFill) : '';
    const name = (club && club.nome) || init;
    if (small) {
      return `<svg class="badge sm" viewBox="0 0 64 76" role="img" aria-label="${name}">
        ${stars(Math.min(sp.stars, 5), 2)}
        <defs><clipPath id="${clip}"><path d="${shape(sp.sh)}"/></clipPath></defs>
        <g clip-path="url(#${clip})">${bands(sp, c1, c2, c3)}</g>
        <path d="${shape(sp.sh)}" fill="none" stroke="${c2}" stroke-width="2.4"/>
        <path d="${shape(sp.sh)}" fill="none" stroke="rgba(0,0,0,.45)" stroke-width="1"/>
        ${sym ? `<g transform="translate(40 40) scale(.72)">${sym}</g>` : ''}
        <text x="40" y="66" text-anchor="middle" font-size="${init.length > 2 ? 11 : 14}" font-family="Arial Black,Impact,sans-serif" fill="#fff" stroke="#111" stroke-width="1.6" paint-order="stroke">${init}</text>
      </svg>`;
    }
    const ySym = sp.stars ? 40 : 42;
    return `<svg class="badge" viewBox="0 0 80 92" role="img" aria-label="${name}">
      ${stars(Math.min(sp.stars, 5), 2)}
      <defs><clipPath id="${clip}"><path d="${shape(sp.sh)}"/></clipPath></defs>
      <g clip-path="url(#${clip})">${bands(sp, c1, c2, c3)}<path d="${shape(sp.sh)}" fill="rgba(255,255,255,.08)"/></g>
      <path d="${shape(sp.sh)}" fill="none" stroke="#f4e4b0" stroke-width="2.2"/>
      <path d="${shape(sp.sh)}" fill="none" stroke="rgba(0,0,0,.55)" stroke-width="1"/>
      ${sym ? `<g transform="translate(40 ${ySym}) scale(${sc})">${sp.pat === 'solid' ? '' : '<circle r="12" fill="rgba(0,0,0,.28)"/>'}${sym}</g>` : ''}
      <g>
        <rect x="18" y="62" width="44" height="14" rx="3" fill="rgba(0,0,0,.55)"/>
        <text x="40" y="73" text-anchor="middle" font-size="${init.length > 2 ? 11 : 13}" font-family="Arial Black,Impact,sans-serif" fill="#fff">${init}</text>
      </g>
    </svg>`;
  }

  const api = { badge, specOf, RAW };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.FFBadges = api;
})(typeof window !== 'undefined' ? window : globalThis);
