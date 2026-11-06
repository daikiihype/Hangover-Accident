// Perseguição policial: evento especial com sirene, viatura atrás do Gol e
// indicador de pressão ("heat"). Direção arriscada aumenta a pressão; dirigir
// limpo alivia. Aguentar até o fim da perseguição despista a viatura por um tempo.
// Pressão em 100% = viatura encosta no Gol = fim de jogo.
import { POLICE, PLAYER, GAME_W } from '../data/config.js';
import { Audio } from '../systems/AudioSystem.js';

export class Police {
  constructor(scene, { onArrive, onEscape, onClose, onCritical, onBusted }) {
    this.scene = scene;
    this.state = 'off';      // off → arriving → chasing → leaving → cooldown → arriving ...
    this.heat = 0;
    this.timer = 0;
    this.sinceNearMiss = 99;
    this.closeWarned = false;
    this.chases = 0;
    Object.assign(this, { onArrive, onEscape, onClose, onCritical, onBusted });
    this.criticalWarned = false;

    this.sprite = scene.add.image(GAME_W / 2, POLICE.offscreenY, 'police_top').setScale(PLAYER.scale).setDepth(45).setVisible(false);
    this.shadow = scene.add.image(0, 0, 'police_top').setScale(PLAYER.scale).setTint(0).setAlpha(0.35).setDepth(44).setVisible(false);
    // Giroflex: dois brilhos que piscam
    this.glowR = scene.add.image(0, 0, 'glow').setTint(0xff2a2a).setBlendMode(Phaser.BlendModes.ADD).setDepth(46).setVisible(false);
    this.glowB = scene.add.image(0, 0, 'glow').setTint(0x2a6bff).setBlendMode(Phaser.BlendModes.ADD).setDepth(46).setVisible(false);
    const H = scene.scale.gameSize.height, W = scene.scale.gameSize.width;
    this.edgeR = scene.add.image(0, H, 'glow').setTint(0xff2a2a).setBlendMode(Phaser.BlendModes.ADD).setScale(6, 4).setDepth(47).setVisible(false);
    this.edgeB = scene.add.image(W, H, 'glow').setTint(0x2a6bff).setBlendMode(Phaser.BlendModes.ADD).setScale(6, 4).setDepth(47).setVisible(false);
  }

  get active() { return this.state === 'arriving' || this.state === 'chasing'; }

  // Chamado pela GameScene quando o estágio de perseguição começa
  enable() {
    if (this.state === 'off') this.startChase();
  }

  startChase() {
    this.state = 'arriving';
    this.timer = 2;
    this.heat = POLICE.startHeat;
    this.closeWarned = false;
    this.criticalWarned = false;
    this.sinceNearMiss = 99;
    this.chases++;
    this.sprite.setVisible(true).setY(POLICE.offscreenY + 80);
    this.shadow.setVisible(true);
    this.glowR.setVisible(true);
    this.glowB.setVisible(true);
    this.edgeR.setVisible(true);
    this.edgeB.setVisible(true);
    Audio.startSiren();
    this.onArrive?.();
  }

  nearMiss() {
    this.sinceNearMiss = 0;
    if (this.state === 'chasing') this.heat = Math.min(100, this.heat + POLICE.heatNearMiss);
  }

  update(dt, player, isChaos) {
    this.sinceNearMiss += dt;
    switch (this.state) {
      case 'off':
        return;
      case 'arriving':
        this.timer -= dt;
        if (this.timer <= 0) { this.state = 'chasing'; this.timer = POLICE.chaseDuration + this.chases * 2; }
        break;
      case 'chasing': {
        this.timer -= dt;
        const rise = POLICE.heatRise * (isChaos ? 1.3 : 1);
        this.heat += (rise - (this.sinceNearMiss > POLICE.heatCalmAfter ? POLICE.heatCalm : 0)) * dt;
        this.heat = Phaser.Math.Clamp(this.heat, 5, 100);
        if (this.heat > 75 && !this.closeWarned) { this.closeWarned = true; this.onClose?.(); }
        if (this.heat < 55) this.closeWarned = false;
        if (this.heat > POLICE.criticalHeat && !this.criticalWarned) { this.criticalWarned = true; this.onCritical?.(); }
        if (this.heat < 70) this.criticalWarned = false;
        if (this.timer <= 0) {
          this.state = 'leaving';
          this.timer = 2.5;
          Audio.stopSiren(2.5);
          this.onEscape?.();
        }
        break;
      }
      case 'leaving':
        this.timer -= dt;
        this.heat = Math.max(0, this.heat - 40 * dt);
        if (this.timer <= 0) {
          this.state = 'cooldown';
          this.timer = isChaos ? POLICE.cooldown[1] : POLICE.cooldown[0];
          this.setVisible(false);
        }
        break;
      case 'cooldown':
        this.timer -= dt;
        if (this.timer <= 0) this.startChase();
        return;
    }

    // Posição: quanto maior a pressão, mais colada no Gol
    const contactY = PLAYER.y + player.sprite.displayHeight * 0.92;
    let targetY = Phaser.Math.Linear(POLICE.baseY, contactY, Math.pow(this.heat / 100, 1.3));
    if (this.state === 'leaving') targetY = POLICE.offscreenY + 120;
    const s = this.sprite;
    s.y += (targetY - s.y) * Math.min(1, dt * 2.5);
    s.x += (player.x - s.x) * Math.min(1, dt * 2.2);
    s.angle = Phaser.Math.Clamp((player.x - s.x) * 0.12, -10, 10);
    this.shadow.setPosition(s.x + 5, s.y + 7).setAngle(s.angle);

    const t = this.scene.time.now / 1000;
    const on = Math.floor(t * 6) % 2 === 0;
    const lightY = s.y + s.displayHeight * 0.12; // giroflex no teto da viatura
    this.glowR.setPosition(s.x - 14, lightY).setAlpha(on ? 0.9 : 0.15).setScale(on ? 1.3 : 0.8);
    this.glowB.setPosition(s.x + 14, lightY).setAlpha(on ? 0.15 : 0.9).setScale(on ? 0.8 : 1.3);
    Audio.setSirenVolume(0.03 + (this.heat / 100) * 0.05);
    // "Retrovisor": brilho vermelho/azul subindo do pé da tela, mais forte com a pressão
    const k = this.state === 'leaving' ? this.timer / 2.5 : 1;
    const edge = (0.25 + (this.heat / 100) * 0.55) * k;
    this.edgeR.setAlpha(on ? edge : edge * 0.2);
    this.edgeB.setAlpha(on ? edge * 0.2 : edge);

    if (this.state === 'chasing' && this.heat >= 100 && player.alive) {
      this.onBusted?.();
    }
  }

  setVisible(v) {
    this.sprite.setVisible(v);
    this.shadow.setVisible(v);
    this.glowR.setVisible(v);
    this.glowB.setVisible(v);
    this.edgeR.setVisible(v);
    this.edgeB.setVisible(v);
  }

  stop() {
    Audio.stopSiren(0.6);
  }
}
