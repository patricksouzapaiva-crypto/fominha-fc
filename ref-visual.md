# Referências visuais e de UX · Fominha FC (Copa Relâmpago)

Pesquisa feita em 09/10/2026 via busca web e leitura de análises públicas. As capturas automáticas de sites (7a0 e Sofascore) foram interrompidas, então as notas abaixo vêm das descrições oficiais e de análises de terceiros.

## 7a0 (7a0.com.br) e Sete a Zero (seteazero.net)
- Um passo por vez: o tabuleiro mostra um sorteio, um elenco e uma decisão. Cada tela tem um único botão principal.
- O sorteio (dado) é o momento de suspense. Os re-sorteios são poucos e contados (3 no Clássico, 1 no Almanaque) e ficam visíveis na tela.
- A campanha é uma estrada fixa: 3 jogos de grupo e depois 4 mata-matas. No fim sai um card compartilhável com o XI e os placares, mais o link para desafiar.
- Fica no Fominha: roleta do técnico com contador de re-sorteios, chaveamento visual de 7 nós e card final com semente.

## Copero
- A carreira inteira vira um "veredito" com frase de efeito, feito para compartilhar.
- Fica no Fominha: título e frase no card, score da campanha e convite para desafiar com a semente.

## Balatro
- Juice no resultado: a pontuação acontece em sequência (pop do item, número colorido, acumulador subindo). Nada aparece de uma vez só.
- Loja e coleção usam um modelo único de objeto (cartas e relíquias como peças iguais). O preço fica impresso no item, o re-sorteio mostra o custo, que sobe +1, e a venda sai da própria fileira.
- Acessibilidade: tem modo "Reduced Motion" e controle de velocidade. A crítica mais frequente é texto pequeno demais, então o mínimo aqui é 12-13 px no corpo.
- Fica no Fominha: contagem animada do score, peças colecionáveis iguais para cartas e relíquias, loja com etiqueta de preço, `prefers-reduced-motion` e velocidade 1x/2x/3x.

## EA FC Ultimate Team (cartas e abertura de pacote)
- A raridade é lida pela cor antes do texto: bronze, prata e ouro, com brilho especial para os "ícones". A carta tem nota grande no canto, posição embaixo e nome na faixa inferior.
- Pacote em etapas: a revelação parcial gera suspense, depois a carta aparece e a nota "sobe". As cartas boas ganham uma animação mais longa (boards 81-85, walkout 86+).
- Fica no Fominha: carta de jogador estilo FUT com tiers por nota (bronze < 65, prata 65-74, ouro 75-84, lenda 85+), pacote de recompensa que abre e vira as cartas uma a uma, e brilho extra para as lendas.

## Sofascore / FotMob (match center)
- Attack Momentum: barras por minuto, para cima para um time e para baixo para o outro, mostrando quem pressiona. Os gols aparecem marcados na linha do tempo.
- Placar grande com escudos, relógio em destaque, timeline de eventos com ícone por tipo e estatísticas comparadas (posse, finalizações) em barras de duas cores.
- Fica no Fominha: barra de momentum ao vivo, mini-stats (posse, ataques, defesas), feed com ícone por tipo e placar com bandeiras.

## Top Eleven / Football Manager Mobile
- Formação no campinho com as cartas dos jogadores nas posições e comparação de força com o adversário antes do jogo.
- Fica no Fominha: hub com formação 1-2-2-2 em cartas e barras de força ATQ/MEI/DEF/GOL contra o rival.

## Clash Royale / Marvel Snap (recompensa, raridade e juice)
- A recompensa é um objeto físico (baú ou pacote) que você toca para abrir. Brilho e partículas ficam proporcionais à raridade, e botões grandes "afundam" no toque.
- Onboarding em poucas dicas contextuais, que aparecem na hora em que a mecânica surge. Tudo pode ser pulado.
- Fica no Fominha: 4 dicas contextuais (técnico, hub, carta na partida, pacote), botão "Pular dicas" e feedback de toque em todos os botões.

## Sistema visual do Fominha FC (decisões)
- Paleta: fundo "noite de estádio" (#06140c → #0b2616), destaque lima-neon #C6FF3D (seu time / ação principal), ouro #FFC83D (recompensas / recordes), coral #FF5A5F (rival / perigo), azul #3AA0FF (técnico / info).
- Raridades: Comum prata #A9B4C0 · Incomum azul #3AA0FF · Rara roxo #B26BFF · Lendária ouro #FFB800 · Amaldiçoada vermelho #FF3B4F.
- Tipografia: só fontes do sistema. Títulos em 900 itálico caixa-alta e números tabulares.
- Ícones: SVG inline para a interface (moeda, troféu, apito, prancheta etc.). Emojis só para bandeiras e ícones temáticos de itens.
- Toque mínimo de 44 px, contraste AA no texto e `prefers-reduced-motion` desliga animações não essenciais.
