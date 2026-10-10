// GoatCounter só no site publicado, sem cookie, sem query de duelo e sem evento repetido na sessão.
const fs = require('fs');
const path = require('path');
const { create } = require('../src/analytics.js');

function mem() {
  const box = {};
  return {
    getItem(k) { return Object.prototype.hasOwnProperty.call(box, k) ? box[k] : null; },
    setItem(k, v) { box[k] = String(v); }
  };
}

function harness(opts) {
  opts = opts || {};
  const sent = [];
  let gc = opts.gc === undefined ? null : opts.gc;
  const local = opts.local || mem();
  const session = opts.session || mem();
  if (!gc && opts.online) {
    gc = {
      count(vars) { sent.push(vars); },
      get_data(vars) {
        vars = vars || {};
        return {
          p: vars.path === undefined ? '/index.html?duelo=ZZ' : vars.path,
          r: vars.referrer === undefined ? 'https://l.threads.net/abc' : vars.referrer,
          t: vars.title || 'Fominha FC',
          e: !!vars.event,
          q: '?duelo=ZZ'
        };
      }
    };
  }
  const api = create({
    hostname: function () { return opts.hostname == null ? 'fominha-fc.github.io' : opts.hostname; },
    protocol: function () { return opts.protocol || 'https:'; },
    search: function () { return opts.search || ''; },
    title: function () { return 'Fominha FC · Copa Relâmpago'; },
    webdriver: function () { return !!opts.webdriver; },
    localStorage: opts.throwStore ? { getItem() { throw new Error('bloqueado'); }, setItem() { throw new Error('bloqueado'); } } : local,
    sessionStorage: opts.throwStore ? { getItem() { throw new Error('bloqueado'); }, setItem() { throw new Error('bloqueado'); } } : session,
    goatcounter: function () { return gc; }
  });
  return { api, sent, local, session, setGc(next) { gc = next; } };
}

function assert(cond, msg) { if (!cond) throw new Error(msg); }

const live = harness({ online: true });
assert(live.api.pageOk(), 'site publicado conta');
assert(live.api.settings.no_onload === true, 'não conta sozinho no onload');
assert(live.api.settings.path() === '/', 'pageview fixo em /');
assert(live.api.ready(), 'script pronto envia a visita');
assert(live.sent.length === 1 && live.sent[0].path === '/' && live.sent[0].event !== true, 'uma pageview');
assert(live.sent[0].referrer === undefined, 'referrer fica com o padrão do script');
const data = (function () {
  const h = harness({ online: true });
  let gc;
  h.setGc(gc = {
    count() {},
    get_data(vars) {
      vars = vars || {};
      return {
        p: vars.path === undefined ? '/?duelo=ZZ' : vars.path,
        r: vars.referrer === undefined ? 'https://l.instagram.com/' : vars.referrer,
        t: vars.title || 't',
        e: !!vars.event,
        q: '?duelo=ZZ'
      };
    }
  });
  h.api.ready();
  return gc.get_data({});
})();
assert(data.p === '/' && data.q === '' && data.r === 'https://l.instagram.com/' && data.e === false, 'query do duelo some e o referrer fica: ' + JSON.stringify(data));

const evWrap = (function () {
  const h = harness({ online: true });
  let gc;
  h.setGc(gc = {
    count() {},
    get_data(vars) {
      vars = vars || {};
      return { p: vars.path, r: vars.referrer === undefined ? 'https://web.whatsapp.com/' : vars.referrer, t: vars.title, e: !!vars.event, q: '?x=1' };
    }
  });
  h.api.ready();
  return gc.get_data({ path: 'copa-eliminado', title: 'Caiu nas oitavas', event: true });
})();
assert(evWrap.p === 'copa-eliminado' && evWrap.e === true && evWrap.q === '' && evWrap.r === 'https://web.whatsapp.com/', 'evento não vira página');

['localhost', '127.0.0.1', ''].forEach(host => {
  const h = harness({ hostname: host, online: true });
  assert(!h.api.pageOk() && h.api.settings.path() === null, 'não conta em ' + (host || 'arquivo'));
  h.api.ready();
  h.api.event('copa-iniciada', 'Copa iniciada');
  assert(h.sent.length === 0, 'nenhum hit em ' + host);
});
assert(!harness({ protocol: 'file:', online: true }).api.pageOk(), 'file:// não conta');
assert(!harness({ webdriver: true, online: true }).api.pageOk(), 'Playwright não conta');

const nogc = harness({ search: '?nogc', online: true });
assert(!nogc.api.pageOk(), '?nogc não conta');
assert(nogc.local.getItem('goatcounter-ignore') === '1', '?nogc grava o opt-out');
const again = harness({ local: nogc.local, online: true });
assert(!again.api.pageOk(), 'localStorage goatcounter-ignore não conta');

const quiet = harness({ throwStore: true });
assert(quiet.api.pageOk(), 'storage quebrado não derruba a visita');
assert(quiet.api.event('copa-iniciada', 'Copa iniciada') === true, 'evento enfileira sem script');
assert(quiet.api.event('copa-iniciada', 'Copa iniciada') === false, 'não repete na sessão');
let late = [];
quiet.setGc({
  count(vars) { late.push(vars); },
  get_data(vars) { return { p: (vars && vars.path) || '/', r: 'https://l.threads.net/', t: '', e: !!(vars && vars.event), q: '' }; }
});
assert(quiet.api.ready(), 'flush quando o script chega');
assert(late.some(v => v.path === '/' && !v.event), 'pageview atrasada');
assert(late.filter(v => v.path === 'copa-iniciada').length === 1, 'evento atrasado uma vez');

const session = mem();
const a = harness({ session, online: true });
assert(a.api.event('copa-campeao', 'Campeão') === true, 'primeiro campeão');
const b = harness({ session, online: true });
assert(b.api.event('copa-campeao', 'Campeão') === false, 'mesma sessão não infla');
assert(a.sent.filter(v => v.path === 'copa-campeao').length === 1, 'um só campeão enviado');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const html2 = fs.readFileSync(path.join(root, 'copa-relampago.html'), 'utf8');
[html, html2].forEach(src => {
  if (src.indexOf('data-goatcounter="https://fominha-fc.goatcounter.com/count"') < 0) throw new Error('endpoint ausente');
  if (src.indexOf('async src="https://gc.zgo.at/count.js"') < 0) throw new Error('count.js ausente');
  if (src.indexOf('no_onload') < 0) throw new Error('onload automático ainda ligado');
  if (src.indexOf('Contamos visitas de forma anônima, sem cookies.') < 0) throw new Error('aviso de privacidade ausente');
});
const ui = fs.readFileSync(path.join(root, 'src', 'ui.js'), 'utf8');
['copa-iniciada', 'copa-campeao', 'copa-eliminado', 'carreira-iniciada', 'carreira-temporada-5', 'carreira-temporada-10', 'carreira-temporada-20', 'tecnico-criado', 'duelo-criado', 'duelo-entrou-pelo-link', 'duelo-final-ao-vivo', 'compartilhou-card', 'desafio-do-dia'].forEach(name => {
  if (ui.indexOf("'" + name + "'") < 0) throw new Error('evento ausente: ' + name);
});
if (ui.indexOf('document.cookie') >= 0) throw new Error('a interface não pode gravar cookie');
console.log('analytics ok');
