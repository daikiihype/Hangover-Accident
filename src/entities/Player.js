// O Gol vermelho. Controle por arrasto relativo (o dedo pode ficar em qualquer
// lugar da tela) + setas/A-D no teclado para testes no PC. Movimento suave, sem pular faixas.
import { PLAYER, ROAD } from '../data/config.js';

export class Player {
  constructor(scene) {
    this.scene = scene;
    this.sprite = scene.add.image(ROAD.laneCenter(1) + ROAD.laneW / 2, PLAYER.y, 'gol_top').setScale(PLAYER.scale).setDepth(50);
    this.shadow = scene.add.image(this.sprite.x + 5, PLAYER.y + 7, 'gol_top').setScale(PLAYER.scale).setTint(0x000000).setAlpha(0.35).setDepth(49);
    this.targetX = this.sprite.x;
    this.alive = true;
    this.touched = false; // jogador já deu algum comando nesta partida?
    this.halfW = (this.sprite.displayWidth * PLAYER.hitbox.w) / 2;
    this.halfH = (this.sprite.displayHeight * PLAYER.hitbox.h) / 2;
    this.minX = ROAD.left + this.sprite.displayWidth / 2 - 6;
    this.maxX = ROAD.right - this.sprite.displayWidth / 2 + 6;

    // Arrasto com Pointer Events nativos na janela inteira (v0.2):
    // - funciona também nas faixas fora do canvas (celulares mais altos que 9:16),
    //   onde o polegar costuma ficar;
    // - um dedo por vez; pointercancel/perda de foco encerram o arrasto;
    // - deslocamento em px de tela convertido para px do jogo pela escala atual.
    this.drag = null;
    const toGame = () => scene.scale.displayScale.x;
    this.onDown = (e) => {
      if (this.drag || (e.pointerType === 'mouse' && e.button !== 0)) return;
      this.drag = { id: e.pointerId, startX: e.clientX, carX: this.targetX };
      this.touched = true;
    };
    this.onMove = (e) => {
      if (!this.drag || this.drag.id !== e.pointerId) return;
      const dx = (e.clientX - this.drag.startX) * toGame();
      this.targetX = Phaser.Math.Clamp(this.drag.carX + dx * PLAYER.dragGain, this.minX, this.maxX);
      // Se bateu no limite, re-ancora para o carro voltar assim que o dedo voltar
      if (this.targetX === this.minX || this.targetX === this.maxX) this.drag = { id: e.pointerId, startX: e.clientX, carX: this.targetX };
    };
    this.onUp = (e) => { if (this.drag && this.drag.id === e.pointerId) this.drag = null; };
    this.onLost = () => { this.drag = null; };
    window.addEventListener('pointerdown', this.onDown);
    window.addEventListener('pointermove', this.onMove);
    window.addEventListener('pointerup', this.onUp);
    window.addEventListener('pointercancel', this.onUp);
    window.addEventListener('blur', this.onLost);
    scene.events.once('shutdown', () => this.destroy());

    this.keys = scene.input.keyboard?.addKeys('LEFT,RIGHT,A,D');
  }

  get x() { return this.sprite.x; }
  get y() { return this.sprite.y; }

  get hitbox() {
    return { l: this.sprite.x - this.halfW, r: this.sprite.x + this.halfW, t: this.sprite.y - this.halfH, b: this.sprite.y + this.halfH };
  }

  update(dt, speed01) {
    if (!this.alive) return;
    if (this.keys) {
      const dir = (this.keys.RIGHT.isDown || this.keys.D.isDown ? 1 : 0) - (this.keys.LEFT.isDown || this.keys.A.isDown ? 1 : 0);
      if (dir) this.touched = true;
      if (dir) this.targetX = Phaser.Math.Clamp(this.targetX + dir * PLAYER.keySpeed * dt, this.minX, this.maxX);
    }
    const before = this.sprite.x;
    this.sprite.x += (this.targetX - this.sprite.x) * Math.min(1, dt * PLAYER.follow);
    const vx = (this.sprite.x - before) / Math.max(dt, 0.001);
    const tilt = Phaser.Math.Clamp(vx * 0.02, -PLAYER.maxTilt, PLAYER.maxTilt);
    this.sprite.angle += (tilt - this.sprite.angle) * Math.min(1, dt * 12);
    // Leve trepidação em alta velocidade
    this.sprite.y = PLAYER.y + (speed01 > 0.5 ? (Math.random() - 0.5) * speed01 * 2 : 0);
    this.shadow.setPosition(this.sprite.x + 5, this.sprite.y + 7).setAngle(this.sprite.angle);
  }

  // Remove os listeners da janela (chamado no shutdown da cena: RETRY/MENU não acumulam listeners)
  destroy() {
    window.removeEventListener('pointerdown', this.onDown);
    window.removeEventListener('pointermove', this.onMove);
    window.removeEventListener('pointerup', this.onUp);
    window.removeEventListener('pointercancel', this.onUp);
    window.removeEventListener('blur', this.onLost);
    this.drag = null;
  }

  crash() {
    this.alive = false;
    this.sprite.setTint(0xff8080);
  }
}
