# Fominha FC · Copa Relâmpago

Jogo de navegador, offline e num arquivo só. Você monta o técnico, escala uma seleção histórica e disputa uma copa relâmpago: fase de grupos, mata-mata, cartas, relíquias e um card final com a semente da campanha para desafiar outra pessoa.

O código em `src/` é juntado pelo build. O HTML gerado não precisa de servidor, internet nem `node_modules` para jogar.

## Como gerar

```bash
node build.js
```

O comando grava dois arquivos iguais na raiz:

- `copa-relampago.html`
- `index.html` (o que o GitHub Pages serve na raiz do site)

Abra qualquer um deles no navegador.

## Como testar

Os testes de unidade rodam no Node, sem navegador:

```bash
npm test
```

Isso executa `test/sim.test.js`, `test/coach.test.js`, `test/relics.test.js`, `test/epic.test.js` e `test/meta.test.js`.

Os scripts `test/*.e2e.js`, `test/screens*.js`, `test/pace.js` e `test/share.js` usam Playwright e um Chromium instalado. Eles não entram no `npm test`.

## Onde está publicado

https://patricksouzapaiva-crypto.github.io/fominha-fc/

Cada push na `main` dispara `.github/workflows/pages.yml`: instala as dependências, roda `node build.js`, publica a pasta `_site/` com `index.html` via GitHub Actions (`actions/configure-pages` com `enablement: true`, `actions/upload-pages-artifact` e `actions/deploy-pages`).

O `index.html` commitado na raiz também cobre o modo **Deploy from a branch** (branch `main`, pasta `/`). O arquivo `.nojekyll` evita que o Jekyll reescreva o HTML.
