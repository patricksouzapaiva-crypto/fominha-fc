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

Isso executa `test/sim.test.js`, `test/coach.test.js`, `test/relics.test.js`, `test/epic.test.js`, `test/meta.test.js`, `test/bracket.test.js` e `test/live.test.js`.

`node test/realtime.test.js` abre dois clientes no Supabase (chave publishable) e confere o broadcast da final ao vivo. `node test/duel-screens.js` grava as telas do duelo em `docs/screens/duel/`.

## Duelo ao vivo

No início, **Duelo ao vivo** cria um link (`#duelo=`, versão 2). Quem abre entra na outra metade da mesma chave: um fica no grupo A e o outro no grupo E, e os dois só podem se cruzar na final. O resto da chave são seleções da semente.

A sala usa Supabase Realtime (broadcast + presence), só nesse modo. A Copa solo continua num arquivo só, sem rede. Se o Supabase não responder, a chave segue offline e o veredito oferece o comparativo antigo por link.

Quem chega na final primeiro espera o amigo e vê em que fase ele está. Os dois na final jogam o mesmo jogo, com o mesmo relógio e as mesmas cartas. Se um cair antes, a tela pede **Tentar de novo** na mesma semente.

A tabela `public.duels` é opcional (serve pra retomar a final depois de recarregar). Sem ela o duelo funciona na hora. Se quiser persistência, cole no SQL Editor o arquivo `supabase/migrations/001_duels.sql`.

Os scripts `test/*.e2e.js`, `test/screens*.js`, `test/pace.js` e `test/share.js` usam Playwright e um Chromium instalado. Eles não entram no `npm test`.

## Onde está publicado

https://patricksouzapaiva-crypto.github.io/fominha-fc/

Cada push na `main` dispara `.github/workflows/pages.yml`: instala as dependências, roda `node build.js`, publica a pasta `_site/` com `index.html` via GitHub Actions (`actions/configure-pages` com `enablement: true`, `actions/upload-pages-artifact` e `actions/deploy-pages`).

A origem do Pages é **GitHub Actions**.

O `index.html` commitado na raiz também cobre o modo **Deploy from a branch** (branch `main`, pasta `/`). O arquivo `.nojekyll` evita que o Jekyll reescreva o HTML.
