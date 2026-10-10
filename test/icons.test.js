// Cartas, tipos e relíquias não usam emoji como ícone.
const fs = require('fs');
const path = require('path');
const engine = fs.readFileSync(path.join(__dirname, '..', 'src', 'engine.js'), 'utf8');
const ui = fs.readFileSync(path.join(__dirname, '..', 'src', 'ui.js'), 'utf8');
const cardBlock = engine.slice(engine.indexOf('const RELICS'), engine.indexOf('const COACH_ATTRS'));
const banned = ['🟥', '🟦', '🟨', '🟪', '⚡', '🔒', '🌧️', '⭐', '🛡️', '🔄', '🎭', '🚀', '🐟', '🎯', '🚩', '📏', '📣', '👑', '🧤', '🧱', '💰', '🌟', '🐷', '🐰', '🟧', '🃏'];
banned.forEach(ch => {
  if (cardBlock.indexOf(ch) >= 0) throw new Error('emoji ainda na definição de carta/relíquia: ' + ch);
});
if (ui.indexOf('function markSvg') < 0 || ui.indexOf('aria-label=') < 0) throw new Error('ícone ou rótulo ausente');
const ids = ['pressao', 'casinha', 'contra', 'chuveirinho', 'craque', 'paredao', 'submagica', 'catimba', 'longe', 'peixinho', 'toque', 'bolaparada', 'linha', 'grito', 'cabeca_ouro', 'luva_ofensiva', 'escanteio_nunca', 'paredao_fala', 'retranca', 'promessa', 'cofrinho', 'pe_coelho', 'bola_quadrada', 'juiz_ladrao', 'ataque', 'defesa', 'tatica', 'especial'];
ids.forEach(id => {
  if (ui.indexOf(id + ':') < 0) throw new Error('sem glifo ' + id);
});
const html = fs.readFileSync(path.join(__dirname, '..', 'copa-relampago.html'), 'utf8');
if (html.indexOf('markSvg') < 0) throw new Error('html sem os ícones novos');
banned.forEach(ch => {
  const face = html.indexOf('const RELICS');
  const coach = html.indexOf('const COACH_ATTRS');
  if (html.slice(face, coach).indexOf(ch) >= 0) throw new Error('html ainda tem emoji de carta: ' + ch);
});
console.log('icons ok', ids.length);
