/* Fominha FC · visitas anônimas via GoatCounter. Sem cookie e sem dado pessoal. */
(function (root) {
  const HOST = 'fominha-fc.github.io';
  const IGNORE_KEY = 'goatcounter-ignore';
  const SESSION_KEY = 'ffgc';

  function hasNogc(search) {
    const q = String(search || '');
    try { return new URLSearchParams(q).has('nogc'); }
    catch (e) { return /(^|[?&])nogc(=|&|$)/.test(q); }
  }

  function create(env) {
    const mem = Object.create(null);
    const queue = [];
    let paged = false;
    let hardened = false;
    env = env || {};

    function pageOk() {
      try {
        if (env.protocol && env.protocol() === 'file:') return false;
        if (!env.hostname || env.hostname() !== HOST) return false;
        if (env.webdriver && env.webdriver()) return false;
        if (hasNogc(env.search ? env.search() : '')) {
          try { if (env.localStorage) env.localStorage.setItem(IGNORE_KEY, '1'); } catch (e) { /* modo privado */ }
          return false;
        }
        try { if (env.localStorage && env.localStorage.getItem(IGNORE_KEY)) return false; } catch (e) { /* segue */ }
        return true;
      } catch (e) { return false; }
    }

    function once(path) {
      if (mem[path]) return false;
      try {
        const session = env.sessionStorage;
        if (session) {
          const raw = session.getItem(SESSION_KEY);
          const list = raw ? JSON.parse(raw) : [];
          const arr = Array.isArray(list) ? list : [];
          if (arr.indexOf(path) >= 0) { mem[path] = 1; return false; }
          arr.push(path);
          session.setItem(SESSION_KEY, JSON.stringify(arr));
        }
      } catch (e) { /* vale só nesta carga da página */ }
      mem[path] = 1;
      return true;
    }

    function counter() {
      try { return env.goatcounter ? env.goatcounter() : null; } catch (e) { return null; }
    }

    function harden(gc) {
      if (!gc || hardened || typeof gc.get_data !== 'function') return;
      const orig = gc.get_data;
      gc.get_data = function (vars) {
        const data = orig(vars);
        if (!data) return data;
        if (!data.e && data.p != null) data.p = '/';
        data.q = '';
        return data;
      };
      hardened = true;
    }

    function deliver(payload) {
      const gc = counter();
      if (!gc || typeof gc.count !== 'function') { queue.push(payload); return; }
      harden(gc);
      try { gc.count(payload); } catch (e) { /* script bloqueado */ }
    }

    function event(path, title) {
      try {
        if (!pageOk() || !path) return false;
        ready();
        if (!once(path)) return false;
        deliver({ path: String(path), title: title ? String(title) : String(path), event: true });
        return true;
      } catch (e) { return false; }
    }

    function ready() {
      try {
        const gc = counter();
        if (!gc || typeof gc.count !== 'function') return false;
        harden(gc);
        if (!paged && pageOk()) {
          paged = true;
          const title = env.title ? env.title() : '';
          try { gc.count({ path: '/', title: title || undefined }); } catch (e) { /* ignora */ }
        }
        while (queue.length) {
          const payload = queue.shift();
          try { gc.count(payload); } catch (e) { /* ignora */ }
        }
        return true;
      } catch (e) { return false; }
    }

    const settings = {
      no_onload: true,
      path: function () { return pageOk() ? '/' : null; }
    };

    return { pageOk: pageOk, event: event, ready: ready, settings: settings };
  }

  function install(win) {
    let local = null, session = null;
    try { local = win.localStorage; } catch (e) { local = null; }
    try { session = win.sessionStorage; } catch (e) { session = null; }
    const api = create({
      hostname: function () { return win.location.hostname; },
      protocol: function () { return win.location.protocol; },
      search: function () { return win.location.search; },
      title: function () { return win.document.title; },
      webdriver: function () { return !!(win.navigator && win.navigator.webdriver); },
      localStorage: local,
      sessionStorage: session,
      goatcounter: function () { return win.goatcounter; }
    });
    win.goatcounter = api.settings;
    win.ffGc = { event: api.event, ready: api.ready, pageOk: api.pageOk };
    let n = 0;
    (function tick() {
      if (api.ready()) return;
      if (++n > 80) return;
      win.setTimeout(tick, 250);
    })();
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = { create: create, install: install, HOST: HOST };
  if (root && root.document) {
    try { install(root); } catch (e) { /* analytics não pode quebrar o jogo */ }
  }
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
