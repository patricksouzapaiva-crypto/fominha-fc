// Telas do Modo Carreira e do som, viewport 390×844.
const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');
const OUT = path.join(__dirname, '..', 'docs', 'screens');
const shots = {
  criar: 'carreira/criar.png',
  hub: 'carreira/hub.png',
  tabela: 'carreira/tabela.png',
  jogo: 'carreira/jogo.png',
  decisao: 'carreira/decisao.png',
  fim: 'carreira/fim.png',
  acesso: 'carreira/acesso.png',
  mentor: 'carreira/mentor.png',
  propostas: 'carreira/propostas.png',
  doc: 'carreira/doc.png',
  museu: 'carreira/museu.png',
  som: 'som/som.png'
};
(async () => {
  fs.mkdirSync(path.join(OUT, 'carreira'), { recursive: true });
  fs.mkdirSync(path.join(OUT, 'som'), { recursive: true });
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'pt-BR' });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  await page.goto('file://' + path.join(__dirname, '..', 'copa-relampago.html'));
  await page.waitForTimeout(400);

  // fluxo real: criar, distribuir pontos, simular até um jogo decisivo
  await page.click('[data-act=carOpen]');
  await page.click('[data-act=carNew]');
  for (let i = 0; i < 12; i++) await page.click('[data-act=carPlus][data-a=atk]');
  for (let i = 0; i < 6; i++) await page.click('[data-act=carPlus][data-a=def]');
  await page.screenshot({ path: path.join(OUT, shots.criar) });
  await page.click('[data-act=carStart]');
  await page.waitForSelector('[data-act=carJump], [data-act=carLive]');
  await page.screenshot({ path: path.join(OUT, shots.hub) });
  await page.click('[data-act=carTabela]');
  await page.waitForTimeout(100);
  const rows = await page.locator('.ctr:not(.h)').count();
  if (rows < 20) throw new Error('tabela curta ' + rows);
  await page.click('[data-act=carBackHub]');
  let landed = '';
  for (let i = 0; i < 12 && !landed; i++) {
    const act = await page.evaluate(() => {
      const b = document.querySelector('[data-act=carJump],[data-act=carLive],[data-act=carAck],[data-act=carOpt],[data-act=carInboxOk],[data-act=carMentorOk]');
      return b ? b.getAttribute('data-act') : '';
    });
    if (act === 'carLive') { landed = 'live'; break; }
    if (!act) break;
    await page.click('[data-act=' + act + ']');
    await page.waitForTimeout(80);
  }
  if (landed !== 'live') throw new Error('não chegou num jogo decisivo');
  await page.click('[data-act=carLive]');
  await page.waitForTimeout(400);
  const minute = await page.evaluate(() => window.FFUI.G.match && window.FFUI.G.match.minute);
  if (minute == null) throw new Error('partida da carreira não abriu');

  for (const which of Object.keys(shots)) {
    await page.evaluate(w => window.FFUI.previewCareer(w), which);
    await page.waitForTimeout(which === 'mentor' || which === 'acesso' ? 900 : 220);
    if (which === 'decisao') {
      const fit = await page.evaluate(() => [...document.querySelectorAll('.optbig')].every(b => b.getBoundingClientRect().bottom < window.innerHeight - 4));
      if (!fit) throw new Error('opções da decisão ficam fora da tela');
    }
    if (which === 'propostas') {
      const fit = await page.evaluate(() => {
        const b = document.querySelector('[data-act=carAccept]');
        const dock = document.querySelector('.mctrl');
        if (!b) return false;
        const r = b.getBoundingClientRect();
        const top = dock ? dock.getBoundingClientRect().top : window.innerHeight;
        return r.width > 40 && r.bottom <= top - 2 && r.right <= window.innerWidth - 2;
      });
      if (!fit) throw new Error('botão aceitar coberto');
    }
    if (which === 'fim' || which === 'acesso') {
      const cut = await page.evaluate(() => {
        const t = document.querySelector('.seasonend .ttl');
        return !t || t.scrollWidth > t.clientWidth + 2;
      });
      if (cut) throw new Error('título da temporada cortado');
    }
    await page.screenshot({ path: path.join(OUT, shots[which]) });
  }
  await browser.close();
  if (errors.length) {
    console.log(errors.join('\n'));
    process.exit(1);
  }
  console.log('career screens ok');
})().catch(e => { console.error(e); process.exit(1); });
