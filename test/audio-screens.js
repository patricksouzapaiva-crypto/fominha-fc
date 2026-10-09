// Mudo, volume e carregamento das gravações, sem erro de áudio.
const { chromium } = require('playwright-core');
const http = require('http');
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

function serve() {
  const types = { '.html': 'text/html; charset=utf-8', '.ogg': 'audio/ogg', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml' };
  return new Promise(resolve => {
    const srv = http.createServer((req, res) => {
      const url = decodeURIComponent(req.url.split('?')[0]);
      const rel = url === '/' ? 'copa-relampago.html' : url.replace(/^\/+/, '');
      const fp = path.normalize(path.join(root, rel));
      if (!fp.startsWith(root)) { res.writeHead(403); res.end(); return; }
      fs.readFile(fp, (err, data) => {
        if (err) { res.writeHead(404); res.end('no'); return; }
        res.writeHead(200, { 'Content-Type': types[path.extname(fp)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
        res.end(data);
      });
    });
    srv.listen(0, '127.0.0.1', () => resolve(srv));
  });
}

(async () => {
  const srv = await serve();
  const port = srv.address().port;
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'pt-BR' });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push('page ' + e.message));
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push('console ' + msg.text());
  });
  await page.goto('http://127.0.0.1:' + port + '/copa-relampago.html');
  await page.waitForSelector('.snddock');
  const home = await page.evaluate(() => ({
    dock: !!document.querySelector('.snddock [data-act=somToggle]'),
    range: !!document.querySelector('.snddock [data-act=somVol]'),
    unlocked: window.FFAudio.unlocked()
  }));
  if (!home.dock || !home.range) throw new Error('menu sem controle ' + JSON.stringify(home));
  if (home.unlocked) throw new Error('a música armou antes do primeiro toque');

  await page.click('[data-act=somToggle]');
  const muted = await page.evaluate(() => JSON.parse(localStorage.getItem('ffsom')));
  if (!muted || muted.on !== false) throw new Error('mudo não gravou ' + JSON.stringify(muted));
  const labelOff = await page.locator('.snddock [data-act=somToggle]').getAttribute('aria-label');
  if (labelOff !== 'Ligar o som') throw new Error('botão mudo ' + labelOff);

  await page.click('[data-act=somToggle]');
  const on = await page.evaluate(() => ({ store: JSON.parse(localStorage.getItem('ffsom')), go: window.FFAudio.unlocked() }));
  if (!on.store.on || !on.go) throw new Error('não religou ' + JSON.stringify(on));

  await page.locator('.snddock [data-act=somVol]').fill('40');
  const vol = await page.evaluate(() => JSON.parse(localStorage.getItem('ffsom')).vol);
  if (Math.abs(vol - 0.4) > 0.011) throw new Error('volume ' + vol);
  await page.waitForFunction(() => window.FFAudio.ready('music'), null, { timeout: 8000 });

  await page.evaluate(() => window.FFUI.previewCareer('jogo'));
  await page.waitForSelector('.feedhead .snddock');
  await page.evaluate(() => { document.querySelectorAll('.sheet,.tip,.modal').forEach(x => x.remove()); });
  await page.locator('.feedhead .snddock').scrollIntoViewIfNeeded();
  const matchDock = await page.evaluate(() => document.querySelectorAll('.snddock').length);
  if (matchDock < 1) throw new Error('partida sem controle');
  await page.click('.feedhead [data-act=somToggle]');
  await page.click('.feedhead [data-act=somToggle]');
  await page.waitForFunction(() => window.FFAudio.ready('crowd') && window.FFAudio.ready('kick') && window.FFAudio.ready('whistle') && window.FFAudio.ready('net'), null, { timeout: 8000 });
  const played = await page.evaluate(() => {
    const A = window.FFAudio;
    A.goal(); A.concede(); A.kick(); A.uuh(); A.whistle('full'); A.click();
    return A.settings();
  });
  if (!played.on) throw new Error('eventos com som desligado');
  await page.waitForTimeout(400);
  if (errors.length) throw new Error(errors.join('\n'));
  await browser.close();
  srv.close();
  console.log('audio browser ok');
})().catch(err => { console.error(err); process.exit(1); });
