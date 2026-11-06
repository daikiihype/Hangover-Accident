# HANGOVER ACCIDENT

*ONE GOL. THREE FRIENDS. TOO MANY PEUGEOTS.*

Arcade vertical (endless runner) em Phaser 3, baseado no GDD v0.1. Versão atual: **0.2**. Roda no navegador (Android, iPhone, desktop) e pode ser instalado como app (PWA).

## Como rodar

O jogo precisa ser servido por HTTP: abrir o `index.html` direto não funciona, porque o navegador bloqueia o carregamento das imagens.

```bash
npm start        # ou: node tools/serve.js
```

- PC: abra http://localhost:8080 (setas ou A/D para dirigir, P/ESC para pausar)
- Celular: com o PC e o celular na mesma rede Wi-Fi, abra o endereço `http://<IP>:8080` que o servidor mostra no terminal.
  Isso serve para jogar, mas **não** instala como app: pelo IP da rede é HTTP comum, e o Service Worker só funciona em HTTPS ou em `localhost`.

## Publicar com HTTPS e compartilhar o link

O projeto é 100% estático (sem servidor próprio, sem build). Basta publicar a pasta inteira em qualquer hospedagem com HTTPS. Exemplos gratuitos:

- **GitHub Pages:** suba o repositório no GitHub → Settings → Pages → Branch `main`, pasta `/ (root)`. O link fica `https://<usuario>.github.io/<repositorio>/`.
- **Netlify:** arraste a pasta do projeto para https://app.netlify.com/drop. Sai um link `https://<nome>.netlify.app`.
- **Cloudflare Pages / Vercel:** importe o repositório, sem comando de build e com diretório de saída `/`.

Os caminhos são todos relativos, então funciona também em subpasta (como no GitHub Pages).

**Ao publicar uma versão nova**, troque o nome do cache em `sw.js` (`const CACHE = 'hangover-accident-v0.2.1'`), para os aparelhos descartarem o cache antigo. Se criar arquivos novos, acrescente-os à lista `PRECACHE` para funcionarem offline.

## Instalar como app (PWA)

- **Android (Chrome):** abra o link → menu ⋮ → *Instalar app* (ou *Adicionar à tela inicial*).
- **iPhone (Safari):** abra o link → botão Compartilhar → *Adicionar à Tela de Início*.

Depois do primeiro carregamento com internet, o jogo abre offline. A orientação vertical é pedida no manifest, mas nenhum navegador é obrigado a travar a tela: se o aparelho girar, o jogo só se reajusta.

**Limitações conhecidas do iPhone:**
- Com a chave de silencioso ligada, o iOS pode silenciar o Web Audio.
- O som só começa depois do primeiro toque na tela, por regra do Safari.

## Estrutura

```text
index.html              página, meta tags iOS/PWA, efeito CRT
manifest.json           manifest do PWA (nome, ícones, standalone, retrato)
sw.js                   Service Worker (rede primeiro, cache como reserva/offline)
src/main.js             configuração do Phaser
src/scenes/             Boot, Menu, Game, GameOver
src/entities/           Player (Gol), Traffic (Peugeot/carros/caminhões), Police
src/systems/            Dialogue, Difficulty, Score, Audio
src/data/config.js      TODOS os números de calibragem (velocidade, estágios, polícia…)
src/data/dialogues.js   biblioteca de falas (editar aqui não muda a lógica)
src/ui/Button.js        botões e textos
assets/                 sprites gerados a partir das artes originais
assets/icons/           ícones do PWA e apple-touch-icon (gerados da arte do Gol)
assets/fonts/           Press Start 2P (SIL OFL, ver OFL.txt), local para funcionar offline
assets/ui/gol_destruido_limpo.png  Game Over: derivada do gol_destruido.png original, sem os textos (npm run assets)
tools/process-assets.js recorta/remove fundo das artes originais → assets/
tools/serve.js          servidor local sem dependências
vendor/phaser.min.js    Phaser 3.80.1 (local, funciona offline)
```

As artes originais na raiz **não são modificadas**. Para regenerar os sprites:

```bash
npm install
npm run assets
```

## Adicionando falas

Abra `src/data/dialogues.js`. Cada evento (`near_miss`, `police_arrive`, `chat`…) tem uma lista de conversas:

```js
[['joao', 'Fala do João.'], ['selva', 'Resposta da Selva.'], ['lucas', 'GRITO DO LUCAS.']]
```

Falas TODAS EM MAIÚSCULAS fazem a caixa tremer. Nenhuma conversa se repete até todas as outras do mesmo evento terem tocado.

Os eventos `egg_*` são easter eggs raros. As condições de cada um estão em `GameScene.checkEasterEggs()` e descritas no comentário de cada evento.

## Áudio

Toda a música e os efeitos são sintetizados em tempo real (Web Audio), sem arquivos de áudio:

- Trilha original "BR Infinita", em chiptune, com camadas que entram conforme a dificuldade e a polícia.
- Motor, sirene, buzina, batida, near miss e "vozes" em bipes para cada personagem.
- Volumes de música, efeitos e diálogos são independentes (menu SOM).
