// Dois clientes no mesmo canal: broadcast de carta, lock e a mesma final.
const { createClient } = require('@supabase/supabase-js');
const C = require('../src/config.js');
const L = require('../src/live.js');
const E = require('../src/engine.js');

function client() {
  return createClient(C.SUPABASE_URL, C.SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    realtime: { params: { eventsPerSecond: 8 } }
  });
}
function waitFor(pred, ms, label) {
  const t0 = Date.now();
  return new Promise((resolve, reject) => {
    const iv = setInterval(() => {
      if (pred()) { clearInterval(iv); resolve(); }
      else if (Date.now() - t0 > ms) { clearInterval(iv); reject(new Error('timeout ' + label)); }
    }, 40);
  });
}

(async () => {
  const id = ('T' + Date.now().toString(36)).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
  const room = 'fominha-duel-' + id;
  const seed = 'RT' + id;
  const a = client(), b = client();
  const inboxA = [], inboxB = [];
  const ca = a.channel(room, { config: { broadcast: { self: false } } });
  const cb = b.channel(room, { config: { broadcast: { self: false } } });
  ca.on('broadcast', { event: 'msg' }, ({ payload }) => inboxA.push(payload));
  cb.on('broadcast', { event: 'msg' }, ({ payload }) => inboxB.push(payload));
  await new Promise((resolve, reject) => {
    let n = 0;
    const up = st => { if (st === 'SUBSCRIBED' && ++n === 2) resolve(); if (st === 'CHANNEL_ERROR' || st === 'TIMED_OUT') reject(new Error(st)); };
    ca.subscribe(up); cb.subscribe(up);
  });
  const ping = await ca.send({ type: 'broadcast', event: 'msg', payload: { t: 'ping', id } });
  if (ping !== 'ok') throw new Error('send ' + ping);
  await waitFor(() => inboxB.some(p => p.t === 'ping' && p.id === id), 12000, 'ping');

  const homePack = L.packSquad(Object.assign(E.newRun('HH11', 1, 'bra82', E.flatCoach(76, 'Casa')), { cards: ['pressao', 'craque'] }), 'Casa');
  const awayPack = L.packSquad(Object.assign(E.newRun('AA11', 1, 'cam90', E.flatCoach(74, 'Fora')), { cards: ['casinha', 'longe'] }), 'Fora');
  const ma = E.createPvpMatch(L.unpackSquad(homePack, seed), L.unpackSquad(awayPack, seed), seed);
  const mb = E.createPvpMatch(L.unpackSquad(JSON.parse(JSON.stringify(homePack)), seed), L.unpackSquad(JSON.parse(JSON.stringify(awayPack)), seed), seed);
  const applied = [];
  let guard = 0;
  while (!ma.done && guard++ < 500) {
    if (!ma.awaiting) { E.stepMatch(ma); continue; }
    while (!mb.done && !mb.awaiting) E.stepMatch(mb);
    if (!mb.awaiting || mb.minute !== ma.minute) throw new Error('pausa divergente ' + ma.minute + ' vs ' + (mb.awaiting ? mb.minute : 'fim'));
    const mark = inboxA.length + inboxB.length;
    const c0 = E.pvpCards(ma, 0)[0] || null;
    const c1 = L.aiCard(mb, 1);
    const sa = await ca.send({ type: 'broadcast', event: 'msg', payload: { t: 'card', min: ma.minute, side: 0, card: c0 } });
    const sb = await cb.send({ type: 'broadcast', event: 'msg', payload: { t: 'card', min: ma.minute, side: 1, card: c1 } });
    if (sa !== 'ok' || sb !== 'ok') throw new Error('card send');
    await waitFor(() => inboxB.some(p => p.t === 'card' && p.side === 0 && p.min === ma.minute) && inboxA.some(p => p.t === 'card' && p.side === 1 && p.min === ma.minute), 12000, 'cards ' + ma.minute);
    const got0 = inboxB.filter(p => p.t === 'card' && p.min === ma.minute && p.side === 0).pop();
    const got1 = inboxA.filter(p => p.t === 'card' && p.min === ma.minute && p.side === 1).pop();
    const lock = { t: 'lock', min: ma.minute, c0: got0.card, c1: got1.card };
    if ((await ca.send({ type: 'broadcast', event: 'msg', payload: lock })) !== 'ok') throw new Error('lock send');
    await waitFor(() => inboxB.some(p => p.t === 'lock' && p.min === ma.minute), 12000, 'lock ' + ma.minute);
    const seen = inboxB.filter(p => p.t === 'lock' && p.min === ma.minute).pop();
    if (seen.c0 !== c0 || seen.c1 !== c1) throw new Error('lock alterado ' + JSON.stringify(seen));
    E.applyPvpCards(ma, seen.c0, seen.c1);
    E.applyPvpCards(mb, seen.c0, seen.c1);
    applied.push({ min: ma.minute, c0: seen.c0, c1: seen.c1, n: inboxA.length + inboxB.length - mark });
  }
  while (!mb.done) E.stepMatch(mb);
  const ra = E.pvpResult(ma), rb = E.pvpResult(mb);
  if (ra.score[0] !== rb.score[0] || ra.score[1] !== rb.score[1] || ra.winner !== rb.winner) throw new Error('placar ' + ra.score + ' vs ' + rb.score);
  if (JSON.stringify(ra.epics) !== JSON.stringify(rb.epics)) throw new Error('epicos divergiram');
  const again = L.playFinal(homePack, awayPack, seed, applied.map(x => ({ c0: x.c0, c1: x.c1 })));
  if (again.score[0] !== ra.score[0] || again.score[1] !== ra.score[1] || again.winner !== ra.winner) throw new Error('replay divergiu');
  const db = await a.from('duels').select('id').eq('id', id).maybeSingle();
  const table = db.error ? 'ausente (' + (db.error.code || '') + ' ' + db.error.message + ')' : 'ok';
  await a.removeChannel(ca); await b.removeChannel(cb);
  a.realtime.disconnect(); b.realtime.disconnect();
  console.log('realtime: OK ping · pausas', applied.map(x => x.min + ':' + (x.c0 || '-') + '/' + (x.c1 || '-')).join(', '), '· final', ra.score.join(' x '), 'vencedor', ra.winner, '· tabela duels:', table);
})().catch(e => { console.error(e); process.exit(1); });
