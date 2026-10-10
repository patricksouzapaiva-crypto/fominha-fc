# Créditos de som

Os arquivos ficam em `assets/snd/`, em mono, 22050 Hz, Ogg Vorbis. Cada um entra só quando a tela precisa dele: a interface e a música no primeiro toque, a torcida e os efeitos de campo quando a partida abre. Não há ruído nem oscilador gerado no código. Se um arquivo não carregar, aquele som simplesmente não toca.

A mixagem deixa a música abaixo da torcida ambiente, e a torcida ambiente abaixo de apito, chute, rede e explosão de gol. Os cliques de botão ficam bem mais baixos que a arquibancada. O volume geral e o mudo ficam no aparelho (`localStorage`, chave `ffsom`). A música só começa depois do primeiro toque.

| Arquivo | Uso | Origem | Licença |
| --- | --- | --- | --- |
| `music.ogg` | trilha do menu, em loop com crossfade | Trex0n (Cal McEachern), [Beach Sports Theme loop](https://opengameart.org/content/beach-sports-theme-loop), arquivo `ogg_beachtheme_3.ogg` | CC0 |
| `crowd.ogg` | ambiente contínuo de estádio, em loop com crossfade | Gregor Quendel, “10 Ambience”, pacote [Free Crowd Cheering Sounds](https://opengameart.org/content/free-crowd-cheering-sounds) | CC BY 4.0. Crédito: Gregor Quendel, [gregorquendel.com](https://www.gregorquendel.com) |
| `roar.ogg` | explosão de gol | Gregor Quendel, “04 Strong cheering II Short”, mesmo pacote | CC BY 4.0 |
| `chant.ogg` | canto em lance de pressão | Gregor Quendel, “08 Rhythmic cheering”, mesmo pacote | CC BY 4.0 |
| `groan.ogg` | “uuuh” de chance perdida | Gregor Quendel, “06 Soft cheering II”, mesmo pacote | CC BY 4.0 |
| `boo.ogg` | vaia leve | deleted_user_2104797, [Crowd Boo](https://freesound.org/people/deleted_user_2104797/sounds/324893/), trecho a partir de 18,9 s | CC0 |
| `whistle.ogg` | apito curto | SpliceSound, [Referee whistle blow, gymnasium](https://freesound.org/people/SpliceSound/sounds/218318/) | CC0 |
| `whistle-long.ogg` | apito de intervalo e de fim | o mesmo apito do SpliceSound, duas vezes, com uma pausa curta no meio | CC0 |
| `kick.ogg` | chute | Joseph Sardin, [Ball Kicked S1044](https://bigsoundbank.com/ball-kicked-s1044.html), BigSoundBank, um dos chutes do arquivo | CC0 |
| `post.ogg` | bola na trave | outro impacto do mesmo arquivo S1044, com corte agudo | CC0 |
| `net.ogg` | bola na rede | Luisa_Sanchez, [Soccer net](https://freesound.org/people/Luisa_Sanchez/sounds/813410/) | CC0 |
| `click.ogg` | toque | Kenney, [Interface Sounds](https://kenney.nl/assets/interface-sounds), `click_001.ogg` | CC0 |
| `back.ogg` | voltar | Kenney, Interface Sounds, `back_001.ogg` | CC0 |
| `confirm.ogg` | confirmar | Kenney, Interface Sounds, `confirmation_001.ogg` | CC0 |
| `pack.ogg` | abrir pacote | Kenney, Interface Sounds, `open_002.ogg` | CC0 |
| `card.ogg` | abrir ou jogar carta | Kenney, Interface Sounds, `select_001.ogg` | CC0 |
| `fanfare.ogg` | título e mentor | Kenney, Interface Sounds, `confirmation_002.ogg` | CC0 |

Os arquivos da Freesound usados aqui são o preview em alta do próprio som publicado em CC0. A trave não é uma gravação separada de travessão: é outro chute do mesmo take CC0, filtrado para ficar mais seco. Os sons de interface da Kenney foram desenhados no GameSynth e publicados por ele em CC0; entram só como clique de botão, bem abaixo da torcida.

## Ícones das cartas

Os ícones das cartas, dos quatro tipos (ataque, defesa, tática, especial) e das relíquias são desenhos originais em SVG, feitos para este jogo. Não vêm de biblioteca nem de fonte de ícones. A cor da moldura segue o tipo da carta ou a raridade da relíquia.
