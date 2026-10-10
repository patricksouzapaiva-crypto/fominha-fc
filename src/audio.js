/* Fominha FC · só gravações. Sem oscilador e sem ruído gerado. */
(function (root) {
  const KEY = 'ffsom';
  let AC = null, master = null, musicGain = null, crowdGain = null, unlocked = false;
  let settings = { on: true, vol: 0.25 };
  try {
    const s = JSON.parse((typeof localStorage !== 'undefined' && localStorage.getItem(KEY)) || 'null');
    if (s && typeof s.vol === 'number') settings = { on: s.on !== false, vol: Math.max(0, Math.min(1, s.vol)) };
  } catch (e) { /* segue o padrão */ }

  const FILES = {
    music: 'music.ogg',
    crowd: 'crowd.ogg', roar: 'roar.ogg', groan: 'groan.ogg', boo: 'boo.ogg', chant: 'chant.ogg',
    whistle: 'whistle.ogg', 'whistle-long': 'whistle-long.ogg',
    kick: 'kick.ogg', net: 'net.ogg', post: 'post.ogg',
    click: 'click.ogg', back: 'back.ogg', confirm: 'confirm.ogg', pack: 'pack.ogg', card: 'card.ogg', fanfare: 'fanfare.ogg'
  };
  const UI = ['click', 'back', 'confirm', 'pack', 'card', 'fanfare'];
  const MATCH = ['crowd', 'roar', 'groan', 'boo', 'chant', 'whistle', 'whistle-long', 'kick', 'net', 'post'];
  const MIX = {
    music: 0.16, musicDuck: 0.03,
    crowd: 0.42, crowdDuck: 0.2,
    click: 0.1, back: 0.08, confirm: 0.12, pack: 0.14, card: 0.11, fanfare: 0.22,
    whistle: 0.72, kick: 0.64, net: 0.7, post: 0.55, roar: 0.88, groan: 0.5, boo: 0.42, chant: 0.3
  };
  const bufs = {};
  const inflight = {};
  const loops = {};

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(settings)); } catch (e) { /* modo privado */ }
  }
  function ctx() {
    if (AC) return AC;
    const C = root.AudioContext || root.webkitAudioContext;
    if (!C) return null;
    AC = new C();
    master = AC.createGain();
    master.gain.value = settings.on ? settings.vol : 0;
    master.connect(AC.destination);
    musicGain = AC.createGain();
    musicGain.gain.value = MIX.music;
    musicGain.connect(master);
    crowdGain = AC.createGain();
    crowdGain.gain.value = MIX.crowd;
    crowdGain.connect(master);
    return AC;
  }
  function live() {
    if (!unlocked || !settings.on || settings.vol <= 0.001) return null;
    const c = ctx();
    if (!c) return null;
    if (c.state === 'suspended') c.resume();
    return c;
  }
  function sampleBase() {
    try {
      if (typeof location === 'undefined' || !location.href || location.protocol === 'about:') return '';
      const u = new URL(location.href);
      if (u.hostname === 'fominha-fc.github.io') return 'https://fominha-fc.github.io/assets/snd/';
      u.hash = '';
      u.search = '';
      let path = u.pathname || '/';
      if (!path.endsWith('/')) path = path.slice(0, path.lastIndexOf('/') + 1) || '/';
      u.pathname = path + 'assets/snd/';
      return u.href;
    } catch (e) { return ''; }
  }
  function loadOne(name) {
    if (bufs[name]) return Promise.resolve(bufs[name]);
    if (inflight[name]) return inflight[name];
    const base = sampleBase();
    const c = ctx();
    if (!base || !c || !FILES[name] || typeof fetch !== 'function') return Promise.resolve(null);
    inflight[name] = fetch(base + FILES[name]).then(r => r.ok ? r.arrayBuffer() : null).then(ab => {
      if (!ab) return null;
      return c.decodeAudioData(ab);
    }).then(buf => {
      if (buf) bufs[name] = buf;
      delete inflight[name];
      return buf || null;
    }).catch(() => { delete inflight[name]; return null; });
    return inflight[name];
  }
  function playBuf(name, gain) {
    const buf = bufs[name];
    const c = live();
    if (!c) return null;
    if (!buf) { loadOne(name).then(b => { if (b && settings.on) playBuf(name, gain); }); return null; }
    const s = c.createBufferSource();
    s.buffer = buf;
    const g = c.createGain();
    g.gain.value = gain == null ? 0.5 : gain;
    s.connect(g); g.connect(master);
    s.start();
    return s;
  }
  function placeLoop(st, buf, dest, when, fade) {
    const dur = buf.duration;
    const xf = Math.min(fade, dur * 0.35);
    const s = AC.createBufferSource();
    s.buffer = buf;
    const g = AC.createGain();
    g.gain.setValueAtTime(0.0001, when);
    g.gain.linearRampToValueAtTime(1, when + xf);
    g.gain.setValueAtTime(1, Math.max(when + xf + 0.01, when + dur - xf));
    g.gain.linearRampToValueAtTime(0.0001, when + dur);
    s.connect(g); g.connect(dest);
    s.start(when);
    s.stop(when + dur + 0.03);
    st.srcs.push(s);
    s.onended = () => { const i = st.srcs.indexOf(s); if (i >= 0) st.srcs.splice(i, 1); };
    return dur - xf;
  }
  function armLoop(key, buf, dest, fade) {
    if (!buf || !AC || loops[key]) return;
    const st = { alive: true, srcs: [], timer: 0 };
    loops[key] = st;
    const kick = when => {
      if (!st.alive) return;
      const hop = placeLoop(st, buf, dest, when, fade);
      const wait = (when + hop - AC.currentTime) * 1000;
      st.timer = setTimeout(() => kick(when + hop), Math.max(40, wait));
    };
    kick(AC.currentTime + 0.04);
  }
  function disarm(key) {
    const st = loops[key];
    if (!st) return;
    st.alive = false;
    clearTimeout(st.timer);
    st.srcs.forEach(s => { try { s.stop(); } catch (e) { /* já parou */ } });
    delete loops[key];
  }
  function duck(node, floor, back, sec) {
    if (!node || !AC) return;
    const t = AC.currentTime;
    const now = node.gain.value;
    node.gain.cancelScheduledValues(t);
    node.gain.setValueAtTime(now, t);
    node.gain.linearRampToValueAtTime(floor, t + 0.07);
    node.gain.linearRampToValueAtTime(back, t + sec);
  }

  const FFAudio = {
    settings() { return { on: settings.on, vol: settings.vol }; },
    setOn(v) {
      settings.on = !!v;
      const c = ctx();
      if (master && c) {
        const t = c.currentTime;
        master.gain.cancelScheduledValues(t);
        master.gain.setValueAtTime(master.gain.value, t);
        master.gain.linearRampToValueAtTime(settings.on ? settings.vol : 0, t + 0.05);
      }
      if (!settings.on) { disarm('music'); disarm('crowd'); }
      save();
    },
    setVol(v) {
      settings.vol = Math.max(0, Math.min(1, +v || 0));
      if (master && settings.on) master.gain.value = settings.vol;
      save();
    },
    unlock() {
      const c = ctx(); if (!c) return;
      if (c.state === 'suspended') c.resume();
      unlocked = true;
      UI.forEach(loadOne);
      if (settings.on) loadOne('music').then(buf => { if (buf && settings.on && unlocked) FFAudio.musicStart(); });
    },
    musicStart() {
      const c = live(); if (!c || loops.music) return;
      loadOne('music').then(buf => {
        if (!buf || !settings.on || loops.music) return;
        musicGain.gain.cancelScheduledValues(c.currentTime);
        musicGain.gain.setValueAtTime(MIX.music, c.currentTime);
        armLoop('music', buf, musicGain, 0.22);
      });
    },
    musicStop() { disarm('music'); },
    ready(name) { return !!bufs[name]; },
    click() { playBuf('click', MIX.click); },
    back() { playBuf('back', MIX.back); },
    confirm() { playBuf('confirm', MIX.confirm); },
    flip() { playBuf('card', MIX.card); },
    pack() { playBuf('pack', MIX.pack); },
    playCard() { playBuf('card', MIX.card); },
    energy() { playBuf('click', MIX.click * 0.7); },
    counter() { playBuf('confirm', MIX.confirm); },
    combo() { playBuf('fanfare', MIX.fanfare * 0.7); },
    level() { playBuf('fanfare', MIX.fanfare); },
    record() { playBuf('fanfare', MIX.fanfare); },
    stinger() { playBuf('confirm', MIX.confirm); },
    fanfare() { playBuf('fanfare', MIX.fanfare); },
    whistle(kind) {
      duck(musicGain, MIX.musicDuck, MIX.music, 0.7);
      playBuf(kind === 'full' ? 'whistle-long' : 'whistle', MIX.whistle);
    },
    kick() {
      duck(musicGain, MIX.musicDuck, MIX.music, 0.45);
      playBuf('kick', MIX.kick);
    },
    net() { playBuf('net', MIX.net); },
    post() {
      duck(musicGain, MIX.musicDuck, MIX.music, 0.8);
      playBuf('post', MIX.post);
      FFAudio.uuh();
    },
    uuh() { playBuf('groan', MIX.groan); },
    goal() {
      duck(musicGain, MIX.musicDuck, MIX.music, 2.3);
      duck(crowdGain, MIX.crowdDuck, MIX.crowd, 1.7);
      playBuf('roar', MIX.roar);
      playBuf('net', MIX.net);
    },
    concede() {
      duck(musicGain, MIX.musicDuck, MIX.music, 1.6);
      playBuf('boo', MIX.boo);
    },
    crowdStart() {
      const c = live(); if (!c || loops.crowd) return;
      MATCH.forEach(loadOne);
      loadOne('crowd').then(buf => {
        if (!buf || !settings.on || loops.crowd) return;
        crowdGain.gain.cancelScheduledValues(AC.currentTime);
        crowdGain.gain.setValueAtTime(MIX.crowd, AC.currentTime);
        armLoop('crowd', buf, crowdGain, 1.05);
      });
    },
    crowdSwell(level) {
      if (!loops.crowd) FFAudio.crowdStart();
      duck(crowdGain, Math.min(0.7, MIX.crowd + (level || 0.08)), MIX.crowd, 1.15);
      if ((level || 0) > 0.05) playBuf('chant', MIX.chant);
    },
    crowdStop() { disarm('crowd'); },
    unlocked: () => unlocked
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = FFAudio;
  root.FFAudio = FFAudio;
})(typeof window !== 'undefined' ? window : this);
