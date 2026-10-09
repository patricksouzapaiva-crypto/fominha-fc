/* Fominha FC · som procedural. Só Web Audio API, sem arquivos. */
(function (root) {
  const KEY = 'ffsom';
  let AC = null, master = null, noiseBuf = null, crowd = null, crowdGain = null, unlocked = false;
  let settings = { on: true, vol: 0.25 };
  try {
    const s = JSON.parse((typeof localStorage !== 'undefined' && localStorage.getItem(KEY)) || 'null');
    if (s && typeof s.vol === 'number') settings = { on: s.on !== false, vol: Math.max(0, Math.min(1, s.vol)) };
  } catch (e) { /* segue o padrão */ }

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
    const len = AC.sampleRate * 2;
    noiseBuf = AC.createBuffer(1, len, AC.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return AC;
  }
  function live() {
    if (!settings.on || settings.vol <= 0.001) return null;
    const c = ctx();
    if (!c) return null;
    if (c.state === 'suspended') c.resume();
    return c;
  }
  function envGain(t, a, peak, d) {
    const g = AC.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
    g.connect(master);
    return g;
  }
  function tone(freq, dur, type, peak, delay) {
    const c = live(); if (!c) return;
    const t = c.currentTime + (delay || 0);
    const o = c.createOscillator();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t);
    o.connect(envGain(t, 0.012, peak == null ? 0.2 : peak, dur));
    o.start(t); o.stop(t + dur + 0.05);
  }
  function noise(dur, peak, bp, delay) {
    const c = live(); if (!c) return;
    const t = c.currentTime + (delay || 0);
    const s = c.createBufferSource();
    s.buffer = noiseBuf;
    s.loop = true;
    let node = s;
    if (bp) {
      const f = c.createBiquadFilter();
      f.type = 'bandpass'; f.frequency.value = bp.f; f.Q.value = bp.q || 0.7;
      s.connect(f); node = f;
    }
    node.connect(envGain(t, 0.01, peak == null ? 0.15 : peak, dur));
    s.start(t); s.stop(t + dur + 0.02);
  }
  function chord(freqs, dur, peak) {
    freqs.forEach((f, i) => tone(f, dur, 'triangle', (peak || 0.12) * (1 - i * 0.15), i * 0.045));
  }

  const FFAudio = {
    settings() { return { on: settings.on, vol: settings.vol }; },
    setOn(v) { settings.on = !!v; if (master) master.gain.value = settings.on ? settings.vol : 0; if (!settings.on) FFAudio.crowdStop(); save(); },
    setVol(v) { settings.vol = Math.max(0, Math.min(1, +v || 0)); if (master) master.gain.value = settings.on ? settings.vol : 0; save(); },
    unlock() {
      const c = ctx(); if (!c) return;
      if (c.state === 'suspended') c.resume();
      unlocked = true;
    },
    click() { tone(640, 0.04, 'sine', 0.045); },
    flip() { noise(0.07, 0.12, { f: 1800, q: 0.6 }); tone(420, 0.05, 'square', 0.04); },
    pack() { noise(0.25, 0.14, { f: 900, q: 0.5 }); tone(520, 0.12, 'sawtooth', 0.05); tone(780, 0.16, 'triangle', 0.07, 0.08); },
    playCard() { tone(330, 0.07, 'triangle', 0.1); tone(494, 0.09, 'sine', 0.08, 0.05); },
    energy() { tone(880, 0.04, 'sine', 0.06); },
    counter() { tone(196, 0.12, 'sawtooth', 0.1); tone(392, 0.14, 'square', 0.05, 0.04); },
    combo() { chord([523, 659, 784], 0.16, 0.1); },
    level() { chord([523, 659, 784, 1046], 0.22, 0.11); },
    record() { chord([392, 494, 587, 784], 0.38, 0.12); },
    whistle(kind) {
      const hi = kind === 'full' ? 2100 : kind === 'card' ? 1700 : 1900;
      tone(hi, kind === 'full' ? 0.28 : 0.16, 'sine', 0.09);
      tone(hi * 1.01, kind === 'full' ? 0.28 : 0.12, 'triangle', 0.04, 0.02);
    },
    net() { noise(0.12, 0.16, { f: 600, q: 0.8 }); },
    post() {
      tone(240, 0.18, 'square', 0.08);
      tone(180, 0.22, 'sawtooth', 0.06, 0.02);
      noise(0.15, 0.1, { f: 1400, q: 2 });
      FFAudio.uuh();
    },
    uuh() { noise(0.45, 0.1, { f: 500, q: 0.6 }); },
    goal() { FFAudio.crowdSwell(0.22); chord([262, 330, 392, 523], 0.32, 0.13); noise(0.2, 0.12, { f: 800, q: 0.5 }); },
    concede() { FFAudio.crowdSwell(0.08); noise(0.35, 0.12, { f: 280, q: 0.5 }); tone(140, 0.25, 'sawtooth', 0.05); },
    stinger() { chord([349, 440, 523], 0.28, 0.1); },
    fanfare() { chord([523, 659, 784, 1046], 0.42, 0.12); },
    crowdStart() {
      const c = live(); if (!c || crowd) return;
      const s = c.createBufferSource();
      s.buffer = noiseBuf; s.loop = true;
      const bp = c.createBiquadFilter();
      bp.type = 'bandpass'; bp.frequency.value = 480; bp.Q.value = 0.55;
      crowdGain = c.createGain();
      crowdGain.gain.value = 0.022;
      s.connect(bp); bp.connect(crowdGain); crowdGain.connect(master);
      s.start();
      crowd = s;
    },
    crowdSwell(level) {
      if (!crowdGain || !AC) { FFAudio.crowdStart(); }
      if (!crowdGain || !AC) return;
      const t = AC.currentTime;
      const peak = Math.max(0.04, Math.min(0.2, level || 0.1));
      crowdGain.gain.cancelScheduledValues(t);
      crowdGain.gain.setValueAtTime(Math.max(0.02, crowdGain.gain.value), t);
      crowdGain.gain.linearRampToValueAtTime(peak, t + 0.12);
      crowdGain.gain.linearRampToValueAtTime(0.022, t + 1.1);
    },
    crowdStop() {
      if (crowd) { try { crowd.stop(); } catch (e) { /* já parou */ } }
      crowd = null; crowdGain = null;
    },
    unlocked: () => unlocked
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = FFAudio;
  root.FFAudio = FFAudio;
})(typeof window !== 'undefined' ? window : this);
