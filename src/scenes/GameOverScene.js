// Tela de Game Over (v0.2.2): o Gol destruído continua sendo a peça central, agora com um
// placar de fim de partida no estilo arcade. Tudo o que aparece aqui vem de dados reais da
// partida (ScoreSystem.stats) e do recorde salvo no aparelho; nada é inventado.
// A imagem é a versão derivada do gol_destruido.png original, sem os textos incorporados
// (gerada por tools/process-assets.js; o original não é alterado).
import { GAME_W, GAME_H } from '../data/config.js';
import { CHARACTERS } from '../data/dialogues.js';
import { pickConversation } from '../systems/DialogueSystem.js';
import { getHighScore, setHighScore } from '../utils/storage.js';
import { Audio } from '../systems/AudioSystem.js';
import { makeButton, makeText, FONT } from '../ui/Button.js';

// Layout em coordenadas do jogo (540x960). Os botões ficam onde sempre estiveram (RETRY 780–850, MENU 872–928).
const IMAGE_BOX = { top: 58, bottom: 366, maxW: GAME_W - 120 };
const PANEL = { x: 36, w: GAME_W - 72, top: 492, rowH: 30 };
const QUOTE = { top: 702, h: 68 };

const pad7 = (n) => String(Math.max(0, Math.floor(n))).padStart(7, '0');
const km = (m) => `${(m / 1000).toFixed(2)} KM`;
const clock = (sec) => `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, '0')}`;

export class GameOverScene extends Phaser.Scene {
  constructor() { super('GameOver'); }

  init(stats) { this.stats = stats; }

  create() {
    this.leaving = false; // a instância da cena é reaproveitada: sem isso os botões travam na 2ª visita
    this.input.enabled = true;
    const s = this.stats;
    this.cameras.main.fadeIn(300);
    // Mesma estrada do menu, bem escurecida: mantém a identidade sem competir com o placar
    this.add.tileSprite(0, 0, GAME_W, GAME_H, 'road').setOrigin(0);
    this.add.rectangle(0, 0, GAME_W, GAME_H, 0x070912, 0.9).setOrigin(0);
    Audio.sfx('gameOver');

    // Recorde: compara com o valor ANTERIOR a esta partida e salva igual a antes
    const hs = getHighScore();
    const newScore = s.score > hs.score;
    const newDist = s.distance > hs.distance;
    if (newScore || newDist) {
      setHighScore({ score: Math.max(s.score, hs.score), distance: Math.max(s.distance, hs.distance) });
    }
    const best = { score: Math.max(s.score, hs.score), distance: Math.max(s.distance, hs.distance) };

    this.buildHeader(s.cause);
    this.buildImage();
    this.buildScore(s.score, best.score, newScore, hs.score > 0);
    this.buildStats(s, best.distance, newDist);
    this.buildQuote(s.cause);

    // Botões por último (acima de tudo na ordem de desenho e de toque)
    makeButton(this, GAME_W / 2, 815, 'RETRY', () => this.go('Game'), { w: 320, h: 70, fontSize: 26 }).setDepth(10);
    makeButton(this, GAME_W / 2, 900, 'MAIN MENU', () => this.go('Menu'), { w: 320, h: 56, color: 0x3a3f4b, fontSize: 16 }).setDepth(10);
    this.input.keyboard?.once('keydown-ENTER', () => this.go('Game'));
  }

  // Causa real do fim da partida (batida ou polícia). Não usa WASTED nem os textos da arte original.
  buildHeader(cause) {
    const busted = cause === 'busted';
    const label = busted ? 'PEGARAM VOCÊS' : 'PERDA TOTAL';
    const color = busted ? '#5a8bff' : '#ff3b3b';
    const t = makeText(this, GAME_W / 2, 30, label, 20, color).setOrigin(0.5).setStroke('#000', 6);
    const g = this.add.graphics();
    const half = t.width / 2 + 16;
    g.fillStyle(Phaser.Display.Color.HexStringToColor(color).color, 0.8);
    g.fillRect(24, 28, GAME_W / 2 - half - 24, 4).fillRect(GAME_W / 2 + half, 28, GAME_W / 2 - half - 24, 4);
  }

  // Gol destruído: escala uniforme (sem deformar), centralizado na faixa de cima
  buildImage() {
    const img = this.add.image(GAME_W / 2, 0, 'gol_destruido').setAlpha(0);
    const areaH = IMAGE_BOX.bottom - IMAGE_BOX.top;
    const scale = Math.min(IMAGE_BOX.maxW / img.width, areaH / img.height);
    img.setScale(scale * 1.08).setY(IMAGE_BOX.top + areaH / 2);
    this.tweens.add({ targets: img, alpha: 1, scale, duration: 450, ease: 'Cubic.easeOut' });
  }

  buildScore(score, bestScore, isNew, hadRecord) {
    makeText(this, GAME_W / 2, 386, 'PONTUAÇÃO', 12, '#9fb0d0').setOrigin(0.5);
    const scoreText = this.add.text(GAME_W / 2, 422, pad7(0), { fontFamily: FONT, fontSize: '40px', color: '#ffd23f' })
      .setOrigin(0.5).setStroke('#000', 8).setShadow(4, 4, '#000', 0, true, true);
    this.tweens.addCounter({
      from: 0, to: score, delay: 350, duration: score > 0 ? 1000 : 1, ease: 'Cubic.easeOut',
      onUpdate: (tw) => scoreText.setText(pad7(tw.getValue())),
      onComplete: () => scoreText.setText(pad7(score)),
    });

    if (isNew && score > 0) {
      const badge = makeText(this, GAME_W / 2, 464, hadRecord ? 'NOVO RECORDE!' : 'PRIMEIRO RECORDE!', 14, '#ffd23f')
        .setOrigin(0.5).setStroke('#000', 6).setAlpha(0);
      this.time.delayedCall(1400, () => {
        badge.setAlpha(1).setScale(1.4);
        this.tweens.add({ targets: badge, scale: 1, duration: 260, ease: 'Back.easeOut' });
        this.tweens.add({ targets: badge, alpha: 0.35, yoyo: true, repeat: -1, duration: 420, delay: 300 });
        Audio.sfx('record');
      });
    } else {
      makeText(this, GAME_W / 2, 464, `RECORDE  ${pad7(bestScore)}`, 12, '#cfd8ff').setOrigin(0.5);
    }
  }

  // Tabela estilo fliperama: rótulo, pontilhado e valor, entrando linha a linha
  buildStats(s, bestDistance, newDist) {
    const rows = [
      ['DISTÂNCIA', km(s.distance), '#ffffff'],
      ['TEMPO', clock(s.time), '#ffffff'],
      ['NEAR MISS', String(s.nearMisses), '#8bff6a'],
      ['VEL. MÁXIMA', `${s.maxKmh} KM/H`, '#ffffff'],
      ['PEUGEOTS DESVIADOS', String(s.peugeotsDodged), '#cfd3da'],
      [newDist ? 'NOVA MELHOR DISTÂNCIA' : 'MELHOR DISTÂNCIA', km(bestDistance), newDist ? '#ffd23f' : '#9fb0d0'],
    ];
    const { x, w, top, rowH } = PANEL;
    const h = rows.length * rowH + 22;
    const box = this.add.graphics();
    box.fillStyle(0x05070d, 0.85).fillRect(x, top, w, h);
    box.lineStyle(3, 0xffffff, 0.9).strokeRect(x, top, w, h);
    box.lineStyle(1, 0x000000, 1).strokeRect(x + 3, top + 3, w - 6, h - 6);
    // Separador antes do recorde de distância
    const sepY = top + 11 + (rows.length - 1) * rowH;
    box.fillStyle(0xffffff, 0.25).fillRect(x + 16, sepY - 1, w - 32, 2);

    rows.forEach(([label, value, color], i) => {
      const y = top + 11 + i * rowH + rowH / 2 + (i === rows.length - 1 ? 2 : 0);
      const isRecordRow = i === rows.length - 1;
      const l = makeText(this, x + 18, y, label, 12, isRecordRow ? color : '#9fb0d0').setOrigin(0, 0.5);
      const v = makeText(this, x + w - 18, y, value, 14, color).setOrigin(1, 0.5);
      const dots = this.add.graphics();
      dots.fillStyle(0xffffff, 0.22);
      for (let dx = l.x + l.width + 10; dx < v.x - v.width - 10; dx += 8) dots.fillRect(dx, y + 4, 2, 2);
      const parts = [l, v, dots];
      parts.forEach((o) => o.setAlpha(0));
      this.time.delayedCall(450 + i * 150, () => {
        parts.forEach((o) => o.setAlpha(1));
        v.setScale(1.25);
        this.tweens.add({ targets: v, scale: 1, duration: 160 });
        Audio.sfx('click');
      });
    });
  }

  // Última fala da partida: usa as falas de fim de jogo que já existiam na biblioteca
  buildQuote(cause) {
    const conv = pickConversation(cause === 'busted' ? 'busted' : 'game_over');
    if (!conv) return;
    const [who, text] = conv[0];
    const ch = CHARACTERS[who];
    const { top, h } = QUOTE;
    const x = PANEL.x, w = PANEL.w, size = 52;
    const c = this.add.container(0, 0).setAlpha(0);
    const g = this.add.graphics();
    g.fillStyle(0x070b16, 0.88).fillRect(x, top, w, h);
    g.lineStyle(2, 0xffffff, 0.7).strokeRect(x, top, w, h);
    const col = Phaser.Display.Color.HexStringToColor(ch.color).color;
    const px = x + 8, py = top + (h - size) / 2;
    g.lineStyle(3, col, 1).strokeRect(px - 2, py - 2, size + 4, size + 4);
    const portrait = this.add.image(px + size / 2, py + size / 2, ch.portrait).setDisplaySize(size, size);
    const tx = px + size + 12;
    const name = this.add.text(tx, top + 8, ch.name, { fontFamily: FONT, fontSize: '11px', color: ch.color });
    const msg = this.add.text(tx, top + 26, text, {
      fontFamily: FONT, fontSize: '11px', color: '#f4f4f4', lineSpacing: 5, wordWrap: { width: x + w - tx - 10 },
    });
    c.add([g, portrait, name, msg]);
    this.time.delayedCall(1500, () => this.tweens.add({ targets: c, alpha: 1, duration: 250 }));
  }

  go(scene) {
    if (this.leaving) return;
    this.leaving = true;
    this.input.enabled = false; // nada mais é clicável durante a transição (evita duplo toque)
    this.cameras.main.fadeOut(200, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start(scene));
  }
}
