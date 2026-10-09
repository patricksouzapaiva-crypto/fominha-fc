/* Canal do duelo: presença + broadcast. A tabela `duels` é opcional (reconexão). */
(function (root) {
  'use strict';
  const C = typeof module !== 'undefined' && module.exports ? require('./config.js') : root.FFConfig;
  const CDN = 'https://esm.sh/@supabase/supabase-js@2.117.3';
  let client = null, channel = null, dbOk = null;

  function loadLib() {
    if (root.__ffSb) return Promise.resolve(root.__ffSb);
    return import(CDN).then(m => { root.__ffSb = m; return m; }).catch(() => null);
  }
  async function clientOrNull() {
    if (client) return client;
    const m = await loadLib();
    if (!m || !m.createClient) return null;
    client = m.createClient(C.SUPABASE_URL, C.SUPABASE_PUBLISHABLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
      realtime: { params: { eventsPerSecond: 8 } }
    });
    return client;
  }
  function leave() {
    if (channel && client) { try { client.removeChannel(channel); } catch (e) { /* já saiu */ } }
    channel = null;
  }
  async function join(opts) {
    leave();
    const sb = await clientOrNull();
    if (!sb) { opts.onStatus('off'); return null; }
    const name = 'fominha-duel-' + opts.id;
    const ch = sb.channel(name, { config: { broadcast: { self: false }, presence: { key: 'r' + opts.role } } });
    channel = ch;
    ch.on('broadcast', { event: 'msg' }, ({ payload }) => { if (opts.onEvent) opts.onEvent(payload); });
    ch.on('presence', { event: 'sync' }, () => { if (opts.onPresence) opts.onPresence(flatten(ch.presenceState())); });
    const status = await new Promise(resolve => {
      let done = false;
      const t = setTimeout(() => { if (!done) { done = true; resolve('off'); } }, 8000);
      ch.subscribe(st => {
        if (st === 'SUBSCRIBED' || st === 'CHANNEL_ERROR' || st === 'TIMED_OUT' || st === 'CLOSED') {
          if (done) return;
          done = true; clearTimeout(t);
          resolve(st === 'SUBSCRIBED' ? 'on' : 'off');
        }
      });
    });
    if (status !== 'on') { leave(); opts.onStatus('off'); return null; }
    opts.onStatus('on');
    if (opts.state) await ch.track(opts.state);
    if (opts.onPresence) opts.onPresence(flatten(ch.presenceState()));
    probeDb(sb, opts.id);
    return ch;
  }
  function flatten(state) {
    const out = [];
    Object.keys(state || {}).forEach(k => (state[k] || []).forEach(p => out.push(p)));
    return out;
  }
  async function track(state) { if (channel) { try { await channel.track(state); } catch (e) { /* offline */ } } }
  async function send(payload) {
    if (!channel) return false;
    const res = await channel.send({ type: 'broadcast', event: 'msg', payload });
    return res === 'ok';
  }
  async function probeDb(sb, id) {
    if (dbOk === false) return;
    const { error } = await sb.from('duels').select('id').eq('id', id).maybeSingle();
    dbOk = !error;
  }
  async function save(id, state) {
    if (dbOk === false) return false;
    const sb = await clientOrNull();
    if (!sb) return false;
    const { error } = await sb.from('duels').upsert({ id, state, updated_at: new Date().toISOString() });
    if (error) { dbOk = false; return false; }
    dbOk = true;
    return true;
  }
  async function load(id) {
    if (dbOk === false) return null;
    const sb = await clientOrNull();
    if (!sb) return null;
    const { data, error } = await sb.from('duels').select('state').eq('id', id).maybeSingle();
    if (error) { dbOk = false; return null; }
    return data ? data.state : null;
  }

  const N = { join, leave, track, send, save, load, clientOrNull };
  if (typeof module !== 'undefined' && module.exports) module.exports = N;
  else root.FFNet = N;
})(typeof window !== 'undefined' ? window : this);
