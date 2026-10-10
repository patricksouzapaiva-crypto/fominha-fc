// A carta não pode esmagar o texto, vazar da moldura nem sobrepor custo e "uso único".
// Pacote, loja, mão, carta ampliada e duelo, em 360x740, 390x844 e 430x932.
const { chromium } = require('playwright-core');
const path = require('path');
const FILE = 'file://' + path.join(__dirname, '..', 'copa-relampago.html');
const VIEWPORTS = [[360, 740], [390, 844], [430, 932]];

function audit() {
  const overlap = (a, b) => a.width > 0 && b.width > 0 && a.left < b.right - 1 && a.right > b.left + 1 && a.top < b.bottom - 1 && a.bottom > b.top + 1;
  const inside = (inner, outer) => inner.width > 0 && inner.left >= outer.left - 1 && inner.right <= outer.right + 1 && inner.top >= outer.top - 1 && inner.bottom <= outer.bottom + 1;
  const problems = [];
  const root = document.querySelector('.modal') || document;
  root.querySelectorAll('.cface').forEach(face => {
    const label = face.getAttribute('aria-label') || '';
    const fr = face.getBoundingClientRect();
    if (fr.width < 96 || fr.height < 120) problems.push('moldura estreita ' + Math.round(fr.width) + 'x' + Math.round(fr.height) + ' · ' + label);
    const bits = {
      custo: face.querySelector('.cost'),
      duracao: face.querySelector('.dur'),
      icone: face.querySelector('.art'),
      nome: face.querySelector('b'),
      tipo: face.querySelector('small'),
      estrelas: face.querySelector('em')
    };
    Object.entries(bits).forEach(([k, el]) => {
      if (!el) { problems.push(k + ' ausente · ' + label); return; }
      const r = el.getBoundingClientRect();
      if (r.width < 8 || r.height < 8) problems.push(k + ' sem área · ' + label);
      if (!inside(r, fr)) problems.push(k + ' vaza da moldura · ' + label);
    });
    const tipo = bits.tipo && bits.tipo.querySelector('span');
    if (bits.nome && bits.nome.scrollWidth > bits.nome.clientWidth + 2) problems.push('nome estoura na horizontal · ' + label);
    if (bits.duracao && bits.duracao.scrollWidth > bits.duracao.clientWidth + 2) problems.push('duração cortada · ' + bits.duracao.textContent + ' · ' + label);
    if (tipo && tipo.scrollWidth > tipo.clientWidth + 2) problems.push('tipo cortado · ' + tipo.textContent + ' · ' + label);
    [['custo', 'duracao'], ['custo', 'icone'], ['duracao', 'icone'], ['icone', 'nome'], ['nome', 'tipo'], ['nome', 'duracao'], ['tipo', 'estrelas'], ['nome', 'estrelas']].forEach(([a, b]) => {
      if (bits[a] && bits[b] && overlap(bits[a].getBoundingClientRect(), bits[b].getBoundingClientRect())) problems.push(a + ' sobrepõe ' + b + ' · ' + label);
    });
  });
  (root.querySelectorAll ? root : document).querySelectorAll('.offer.cardoffer').forEach(offer => {
    const face = offer.querySelector('.cface');
    const slot = offer.querySelector('.offercard');
    if (!face || !slot) { problems.push('oferta sem mini-carta'); return; }
    const fr = face.getBoundingClientRect();
    const sr = slot.getBoundingClientRect();
    if (Math.abs(fr.width / fr.height - 120 / 158) > 0.04) problems.push('proporção ' + Math.round(fr.width) + 'x' + Math.round(fr.height) + ' · ' + face.getAttribute('aria-label'));
    if (fr.left < sr.left - 1 || fr.right > sr.right + 1 || fr.top < sr.top - 1 || fr.bottom > sr.bottom + 1) problems.push('mini-carta vaza do encaixe · ' + face.getAttribute('aria-label'));
    offer.querySelectorAll('.ot,.on,.od,.xs').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.width > 4 && overlap(fr, r)) problems.push('texto da oferta sobrepõe a carta · ' + el.textContent.slice(0, 48));
    });
  });
  return problems;
}

async function setup(page, kind, level) {
  await page.evaluate(({ kind, level }) => {
    const E = window.FFEngine, U = window.FFUI;
    window.__noTips = true;
    clearTimeout(U.G.timer);
    const run = E.newRun('LAYOUT', 1, 'hol74', E.makeCoach('Patrick', E.flatCoach(82, 'Patrick').slots));
    run.fichas = 40;
    const ids = E.CARD_IDS.slice();
    const offer = kind === 'pacote' || kind === 'loja' || kind === 'troca';
    run.cardLv = {};
    ids.forEach(id => { run.cardLv[id] = offer ? (level === 1 ? 1 : level - 1) : level; });
    run.cards = offer && level === 1 ? [] : ids.slice();
    if (kind === 'troca') run.cards = ids.slice(0, E.MAX_CARDS);
    U.G.run = run;
    U.G.store.tipsOff = true;
    U.G.cup = null;
    const player = E.POOL.find(p => /uker/.test(p.nome));
    const cardOffers = (kind === 'troca' ? ids.filter(id => run.cards.indexOf(id) < 0).slice(0, 1) : ids).map(id => ({ type: 'card', id, price: 4, sold: false }));
    const offers = [{ type: 'player', player, price: 5, sold: false }].concat(cardOffers).concat([{ type: 'relic', id: 'juiz_ladrao', price: 4, sold: false }]);
    if (kind === 'pacote' || kind === 'troca') {
      U.G.offers = offers;
      U.G.packOpen = true;
      U.G.screen = 'reward';
      U.render();
    } else if (kind === 'loja') {
      U.G.shop = offers;
      U.G.screen = 'shop';
      U.render();
    } else if (kind === 'mao') {
      run.cards = ids;
      U.G.run = run;
      U.G.match = E.createMatch(run);
      U.G.match.minute = 23; U.G.match.score = [0, 1]; U.G.match.awaiting = true; U.G.match.nrgLeft = 12;
      U.G.shownScore = [0, 1];
      U.G.screen = 'match';
      U.render();
      clearTimeout(U.G.timer);
      const box = document.createElement('div'); box.className = 'sheet'; box.id = 'decision';
      box.innerHTML = '<div class="inner" id="dinn"></div>';
      document.body.appendChild(box);
      U.G.hand = [];
      U.paintDecision();
    } else if (kind === 'duelo') {
      run.cards = ids;
      const away = E.newRun('LAYOUTB', 1, 'bra82', E.makeCoach('Amigo', E.flatCoach(80, 'Amigo').slots));
      away.cards = ['casinha', 'pressao'];
      U.G.run = run;
      U.G.match = E.createPvpMatch(run, away, 'LAYOUT');
      U.G.match.minute = 40; U.G.match.score = [1, 0]; U.G.match.awaiting = true;
      U.G.match.awaitingSides = [true, true]; U.G.match.nrgLeft = 12;
      U.G.cup = { id: 'LAYOUT', seed: 'LAYOUT', level: 1, role: 0, host: 'Patrick', status: 'on' };
      U.G.pvpHand = []; U.G.pvpPick = [undefined, undefined];
      U.G.screen = 'match';
      U.render();
      clearTimeout(U.G.timer);
      const box = document.createElement('div'); box.className = 'sheet'; box.id = 'decision';
      box.innerHTML = '<div class="inner" id="dinn"></div>';
      document.body.appendChild(box);
      U.paintPvp();
    } else if (kind === 'info') {
      run.cards = ids;
      run.cardLv = {};
      ids.forEach(id => { run.cardLv[id] = level; });
      U.G.run = run;
      U.G.screen = 'hub';
      U.render();
    }
    document.querySelectorAll('.tip').forEach(n => n.remove());
  }, { kind, level });
}

(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const failures = [];
  for (const [w, h] of VIEWPORTS) {
    const page = await (await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'pt-BR' })).newPage();
    page.on('pageerror', e => failures.push('js @' + w + ' · ' + e.message));
    await page.goto(FILE);
    await page.waitForTimeout(120);
    for (const kind of ['pacote', 'loja', 'mao', 'duelo', 'troca']) {
      for (const level of [1, 2, 3]) {
        await setup(page, kind, level);
        if (kind === 'troca') {
          await page.locator('.offer.cardoffer').first().click();
          await page.waitForSelector('.modal .cface');
        }
        const count = await page.evaluate(() => (document.querySelector('.modal') || document).querySelectorAll('.cface').length);
        const min = kind === 'troca' ? 1 : 14;
        if (count < min) failures.push(kind + ' nv' + level + ' @' + w + ' tem ' + count + ' cartas');
        const problems = await page.evaluate(audit);
        problems.forEach(p => failures.push(kind + ' nv' + level + ' @' + w + 'x' + h + ' · ' + p));
        if (kind === 'troca') await page.evaluate(() => document.querySelectorAll('.modal').forEach(n => n.remove()));
      }
    }
    for (const level of [1, 2, 3]) {
      await setup(page, 'info', level);
      const ids = await page.evaluate(() => window.FFEngine.CARD_IDS.slice());
      for (const id of ids) {
        await page.evaluate(cardId => {
          document.querySelectorAll('.modal').forEach(n => n.remove());
          const el = document.querySelector('.items .cface[data-id="' + cardId + '"]');
          if (el) el.click();
        }, id);
        const opened = await page.locator('.modal .cface').count();
        if (!opened) { failures.push('info nv' + level + ' @' + w + ' não abriu ' + id); continue; }
        const problems = await page.evaluate(audit);
        problems.forEach(p => failures.push('info nv' + level + ' @' + w + 'x' + h + ' · ' + id + ' · ' + p));
      }
      await page.evaluate(() => document.querySelectorAll('.modal').forEach(n => n.remove()));
    }
    await page.close();
  }
  await browser.close();
  if (failures.length) {
    console.error(failures.slice(0, 50).join('\n'));
    console.error(failures.length + ' problemas');
    process.exit(1);
  }
  console.log('card layout ok');
})().catch(e => { console.error(e); process.exit(1); });
