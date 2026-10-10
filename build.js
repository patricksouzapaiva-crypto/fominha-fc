const fs = require('fs'), p = f => fs.readFileSync(__dirname + '/src/' + f, 'utf8');
let html = p('index.html');
const ball = p('ball-data.js'), fav = ball.match(/BALL_ICON = '([^']+)'/)[1];
html = html.replace('/*FAVICON*/', () => fav).replace('/*BALL*/', () => ball);
html = html.replace('/*ANALYTICS*/', () => p('analytics.js')).replace('/*CSS*/', () => p('style.css')).replace('/*CONFIG*/', () => p('config.js')).replace('/*ENGINE*/', () => p('engine.js')).replace('/*BRACKET*/', () => p('bracket.js')).replace('/*LIVE*/', () => p('live.js')).replace('/*META*/', () => p('meta.js')).replace('/*NET*/', () => p('net.js')).replace('/*AUDIO*/', () => p('audio.js')).replace('/*BADGES*/', () => p('badges.js')).replace('/*CAREER*/', () => p('career.js')).replace('/*UI*/', () => p('ui.js'));
fs.writeFileSync(__dirname + '/copa-relampago.html', html);
fs.writeFileSync(__dirname + '/index.html', html);
console.log('ok', html.length, 'bytes → copa-relampago.html, index.html');
