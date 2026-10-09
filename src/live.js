/* Final ao vivo: mesma semente, mesmos elencos e as mesmas cartas nos mesmos minutos. */
(function (root) {
  'use strict';
  const E = typeof module !== 'undefined' && module.exports ? require('./engine.js') : root.FFEngine;

  function packSquad(run, nome) {
    return {
      nome: String(nome || (run.coach && run.coach.nome) || 'Fominha').slice(0, 24),
      selecao: run.selecao,
      players: run.players.map(p => ({ nome: p.nome, pos: p.pos, rating: p.rating, traits: p.traits || '' })),
      cards: (run.cards || []).slice(),
      relics: (run.relics || []).slice(),
      coach: run.coach ? { nome: run.coach.nome, slots: JSON.parse(JSON.stringify(run.coach.slots)) } : null,
      level: run.level || 1,
      fichas: run.fichas || 0,
      cardLv: run.cardLv || {}
    };
  }
  function unpackSquad(sq, seed) {
    const coach = sq.coach ? E.makeCoach(sq.coach.nome, sq.coach.slots) : null;
    const run = E.newRun(seed || 'FINAL', sq.level || 1, sq.selecao, coach);
    run.players = (sq.players || run.players).map(p => ({ nome: p.nome, pos: p.pos, rating: p.rating, traits: p.traits || '', id: p.nome, origem: '' }));
    run.cards = (sq.cards || []).slice();
    run.relics = (sq.relics || []).slice();
    run.fichas = sq.fichas || 0;
    run.stage = 6;
    run.cardLog = {};
    run.cardLv = sq.cardLv || {};
    return run;
  }
  function aiCard(m, side) {
    const cards = E.pvpCards(m, side);
    if (!cards.length) return null;
    const losing = m.score[side] < m.score[1 - side];
    const opp = side === 0 ? m.fxAway : m.fx;
    const style = opp && opp.style && m.minute <= opp.styleUntil ? opp.style : null;
    const beat = style && Object.keys(E.BEATS).find(s => E.BEATS[s] === style);
    if (beat) { const hit = cards.find(id => E.CARDS[id].style === beat); if (hit) return hit; }
    const prefer = losing
      ? ['pressao', 'grito', 'craque', 'peixinho', 'chuveirinho', 'longe', 'contra', 'submagica', 'paredao', 'casinha', 'toque', 'linha', 'bolaparada', 'catimba']
      : ['casinha', 'paredao', 'linha', 'catimba', 'contra', 'craque', 'pressao', 'grito', 'peixinho', 'longe', 'chuveirinho', 'toque', 'bolaparada', 'submagica'];
    return prefer.find(c => cards.indexOf(c) >= 0) || null;
  }
  // choices: lista na ordem das pausas, { c0, c1 } ou null pra guardar. Sem escolha = guarda.
  function playFinal(home, away, seed, choices, aiSides) {
    const h = home && home.opponents ? home : unpackSquad(home, seed);
    const a = away && away.opponents ? away : unpackSquad(away, seed);
    const m = E.createPvpMatch(h, a, seed);
    const events = [];
    const used = [];
    let i = 0, guard = 0;
    while (!m.done && guard++ < 500) {
      if (m.awaiting) {
        const spec = (choices && choices[i]) || null;
        i++;
        let c0 = spec && spec.c0 !== undefined ? spec.c0 : null;
        let c1 = spec && spec.c1 !== undefined ? spec.c1 : null;
        if (aiSides && aiSides[0] && (c0 == null)) c0 = aiCard(m, 0);
        if (aiSides && aiSides[1] && (c1 == null)) c1 = aiCard(m, 1);
        used.push({ min: m.minute, c0: c0 || null, c1: c1 || null });
        events.push(...E.applyPvpCards(m, c0, c1));
        continue;
      }
      events.push(...E.stepMatch(m));
    }
    const res = E.pvpResult(m);
    return {
      score: res.score, winner: res.winner, pens: res.pens ? res.pens.score : null,
      epics: res.epics, choices: used,
      texts: events.map(e => e.min + '|' + e.kind + '|' + (e.side == null ? '' : e.side) + '|' + (e.card || '') + '|' + e.text)
    };
  }
  function sameFinal(x, y) {
    return x.score[0] === y.score[0] && x.score[1] === y.score[1] && x.winner === y.winner
      && JSON.stringify(x.choices) === JSON.stringify(y.choices)
      && JSON.stringify(x.epics) === JSON.stringify(y.epics)
      && JSON.stringify(x.texts) === JSON.stringify(y.texts);
  }

  const L = { packSquad, unpackSquad, aiCard, playFinal, sameFinal };
  if (typeof module !== 'undefined' && module.exports) module.exports = L;
  else root.FFLive = L;
})(typeof window !== 'undefined' ? window : this);
