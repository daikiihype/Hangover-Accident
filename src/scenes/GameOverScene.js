// Tela de Game Over (v0.2.1): somente a imagem do Gol destruído e os botões RETRY e MAIN MENU.
// A imagem é uma versão derivada do gol_destruido.png original, sem os textos incorporados
// (gerada por tools/process-assets.js; o original não é alterado). A própria imagem é a piada.
import { GAME_W, GAME_H } from '../data/config.js';
import { getHighScore, setHighScore } from '../utils/storage.js';
import { Audio } from '../systems/AudioSystem.js';
import { makeButton } from '../ui/Button.js';

// Área da imagem: de cima até logo acima do RETRY (topo do botão em y=780)
const IMAGE_BOX = { top: 12, bottom: 766, maxW: GAME_W - 24 };

export class GameOverScene extends Phaser.Scene {
  constructor() { super('GameOver'); }

  init(stats) { this.stats = stats; }

  create() {
    this.leaving = false; // a instância da cena é reaproveitada: sem isso os botões travam na 2ª visita
    this.input.enabled = true;
    const s = this.stats;
    this.cameras.main.fadeIn(300);
    this.add.rectangle(0, 0, GAME_W, GAME_H, 0x070912).setOrigin(0);
    Audio.sfx('gameOver');

    // O recorde continua sendo salvo (aparece no menu), sem mensagem nesta tela
    const hs = getHighScore();
    if (s.score > hs.score || s.distance > hs.distance) {
      setHighScore({ score: Math.max(s.score, hs.score), distance: Math.max(s.distance, hs.distance) });
    }

    // Gol destruído: escala uniforme (sem deformar), centralizado na área acima dos botões
    const img = this.add.image(GAME_W / 2, 0, 'gol_destruido').setAlpha(0);
    const areaH = IMAGE_BOX.bottom - IMAGE_BOX.top;
    img.setScale(Math.min(IMAGE_BOX.maxW / img.width, areaH / img.height));
    img.setY(IMAGE_BOX.top + areaH / 2);
    this.tweens.add({ targets: img, alpha: 1, duration: 500 });

    // Botões por último (acima de tudo na ordem de desenho e de toque)
    makeButton(this, GAME_W / 2, 815, 'RETRY', () => this.go('Game'), { w: 320, h: 70, fontSize: 26 }).setDepth(10);
    makeButton(this, GAME_W / 2, 900, 'MAIN MENU', () => this.go('Menu'), { w: 320, h: 56, color: 0x3a3f4b, fontSize: 16 }).setDepth(10);
    this.input.keyboard?.once('keydown-ENTER', () => this.go('Game'));
  }

  go(scene) {
    if (this.leaving) return;
    this.leaving = true;
    this.input.enabled = false; // nada mais é clicável durante a transição (evita duplo toque)
    this.cameras.main.fadeOut(200, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start(scene));
  }
}
