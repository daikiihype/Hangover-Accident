// Menu principal: logo, Gol vermelho, PLAY, recorde, som e créditos.
import { GAME_W, GAME_H } from '../data/config.js';
import { settings, saveSettings, getHighScore } from '../utils/storage.js';
import { Audio } from '../systems/AudioSystem.js';
import { makeButton, makeText, FONT } from '../ui/Button.js';

export class MenuScene extends Phaser.Scene {
  constructor() { super('Menu'); }

  create() {
    this.leaving = false; // a instância da cena é reaproveitada: sem isso os botões travam na 2ª visita
    this.road = this.add.tileSprite(0, 0, GAME_W, GAME_H, 'road').setOrigin(0);
    this.add.rectangle(0, 0, GAME_W, GAME_H, 0x05070d, 0.62).setOrigin(0);

    // Logo
    const title1 = this.add.text(GAME_W / 2, 118, 'HANGOVER', { fontFamily: FONT, fontSize: '46px', color: '#ff3b3b' })
      .setOrigin(0.5).setStroke('#000', 10).setShadow(6, 6, '#000', 0, true, true);
    const title2 = this.add.text(GAME_W / 2, 178, 'ACCIDENT', { fontFamily: FONT, fontSize: '46px', color: '#ffd23f' })
      .setOrigin(0.5).setStroke('#000', 10).setShadow(6, 6, '#000', 0, true, true);
    this.tweens.add({ targets: [title1, title2], scale: { from: 1, to: 1.04 }, yoyo: true, repeat: -1, duration: 700, ease: 'Sine.easeInOut' });
    makeText(this, GAME_W / 2, 232, 'ONE GOL. THREE FRIENDS.\nTOO MANY PEUGEOTS.', 12, '#cfd8ff', { align: 'center', lineSpacing: 8 }).setOrigin(0.5, 0);

    const gol = this.add.image(GAME_W / 2, 425, 'gol_front').setScale(0.95);
    this.tweens.add({ targets: gol, y: 431, yoyo: true, repeat: -1, duration: 260, ease: 'Sine.easeInOut' });

    makeButton(this, GAME_W / 2, 620, 'PLAY', () => this.startGame(), { w: 320, h: 78, fontSize: 30 });
    const hs = getHighScore();
    makeText(this, GAME_W / 2, 690, `HIGH SCORE  ${String(hs.score).padStart(7, '0')}`, 16, '#ffd23f').setOrigin(0.5);
    makeText(this, GAME_W / 2, 718, `MELHOR DISTÂNCIA  ${(hs.distance / 1000).toFixed(2)} KM`, 11, '#9fb0d0').setOrigin(0.5);
    makeButton(this, GAME_W / 2, 790, 'SOM', () => this.openSound(), { w: 320, h: 56, color: 0x2b59c3, fontSize: 18 });
    makeButton(this, GAME_W / 2, 866, 'CRÉDITOS', () => this.openCredits(), { w: 320, h: 56, color: 0x3a3f4b, fontSize: 18 });
    makeText(this, GAME_W - 10, GAME_H - 10, 'v0.2.1', 10, '#59607a').setOrigin(1, 1);

    // Música começa no primeiro toque (exigência dos navegadores)
    this.input.once('pointerdown', () => { Audio.unlock(); Audio.startMusic(0); Audio.setIntensity(0); });
    if (Audio.ctx) { Audio.startMusic(0); Audio.setIntensity(0); }
    this.input.keyboard?.once('keydown-ENTER', () => this.startGame());
    this.input.keyboard?.once('keydown-SPACE', () => this.startGame());
  }

  update(_, delta) {
    this.road.tilePositionY -= delta * 0.12;
  }

  startGame() {
    if (this.leaving) return;
    this.leaving = true;
    Audio.unlock();
    this.cameras.main.fadeOut(220, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('Game'));
  }

  overlay(titleStr) {
    const c = this.add.container(0, 0).setDepth(100);
    const bg = this.add.rectangle(0, 0, GAME_W, GAME_H, 0x000000, 0.88).setOrigin(0).setInteractive();
    const title = makeText(this, GAME_W / 2, 150, titleStr, 26, '#ffd23f').setOrigin(0.5);
    c.add([bg, title]);
    c.add(makeButton(this, GAME_W / 2, 830, 'VOLTAR', () => c.destroy(), { w: 280, h: 60, fontSize: 18 }));
    return c;
  }

  openSound() {
    const c = this.overlay('SOM');
    const rows = [['MÚSICA', 'music'], ['EFEITOS', 'sfx'], ['DIÁLOGOS', 'voices']];
    rows.forEach(([label, key], i) => {
      const y = 280 + i * 150;
      c.add(makeText(this, GAME_W / 2, y - 40, label, 16).setOrigin(0.5));
      const bar = this.add.graphics();
      const draw = () => {
        bar.clear();
        for (let k = 0; k < 10; k++) {
          bar.fillStyle(k < Math.round(settings[key] * 10) ? 0x8bff6a : 0x2a2f3a).fillRect(GAME_W / 2 - 125 + k * 25, y - 14, 20, 28);
        }
      };
      draw();
      const change = (d) => {
        settings[key] = Phaser.Math.Clamp(Math.round((settings[key] + d) * 10) / 10, 0, 1);
        saveSettings();
        Audio.applyVolumes();
        draw();
        if (key === 'voices') Audio.voice({ pitch: 330, wobble: 0.1 });
      };
      c.add(bar);
      c.add(makeButton(this, GAME_W / 2 - 185, y, '-', () => change(-0.1), { w: 64, h: 56, color: 0x3a3f4b, fontSize: 22 }));
      c.add(makeButton(this, GAME_W / 2 + 185, y, '+', () => change(0.1), { w: 64, h: 56, color: 0x3a3f4b, fontSize: 22 }));
    });
  }

  openCredits() {
    const c = this.overlay('CRÉDITOS');
    const lines = [
      ['ESTRELANDO', '#ffd23f'],
      ['JOÃO  ·  SELVA  ·  LUCAS', '#fff'],
      ['', ''],
      ['E O GOL VERMELHO', '#ff3b3b'],
      ['', ''],
      ['PARTICIPAÇÃO ESPECIAL', '#ffd23f'],
      ['MUITOS PEUGEOT PRATA', '#cfd3da'],
      ['', ''],
      ['TRILHA ORIGINAL', '#ffd23f'],
      ['"BR INFINITA" (CHIPTUNE)', '#fff'],
      ['', ''],
      ['BASEADO EM UMA HISTÓRIA REAL', '#9fb0d0'],
      ['(MAIS OU MENOS)', '#59607a'],
      ['', ''],
      ['FEITO COM PHASER 3', '#59607a'],
    ];
    lines.forEach(([t, col], i) => c.add(makeText(this, GAME_W / 2, 230 + i * 34, t, 13, col || '#fff').setOrigin(0.5)));
  }
}
