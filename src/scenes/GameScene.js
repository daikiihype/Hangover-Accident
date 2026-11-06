// Partida: estrada infinita, Gol, tráfego, polícia, HUD, diálogos e efeitos.
import { GAME_W, GAME_H, ROAD, PLAYER, SCORE } from '../data/config.js';
import { Player } from '../entities/Player.js';
import { Traffic } from '../entities/Traffic.js';
import { Police } from '../entities/Police.js';
import { DifficultySystem } from '../systems/DifficultySystem.js';
import { ScoreSystem } from '../systems/ScoreSystem.js';
import { DialogueSystem } from '../systems/DialogueSystem.js';
import { Audio } from '../systems/AudioSystem.js';
import { getHighScore, countRun } from '../utils/storage.js';
import { makeButton, makeText, FONT } from '../ui/Button.js';

const COUNTDOWN = 2.4;

export class GameScene extends Phaser.Scene {
  constructor() { super('Game'); }

  create() {
    this.cameras.main.fadeIn(250);
    // A cena é reaproveitada entre partidas: garante relógio e tweens despausados
    this.time.paused = false;
    this.tweens.resumeAll();
    this.state = 'countdown';
    this.countdown = COUNTDOWN;
    this.paused = false;
    this.highScore = getHighScore();
    this.recordAnnounced = false;
    this.firstPeugeot = true;
    this.extremeAnnounced = false;
    // v0.2: marcos de pontuação e easter eggs (tudo zerado a cada partida)
    this.milestoneIdx = 0;
    this.eggs = new Set();
    this.pauseTimes = [];
    this.edgeTime = 0;
    this.lastNearMissAt = 0;
    this.runNumber = countRun();

    this.road = this.add.tileSprite(0, 0, GAME_W, GAME_H, 'road').setOrigin(0).setDepth(0);
    this.speedLines = [];

    this.player = new Player(this);
    this.difficulty = new DifficultySystem((stage, i) => this.onStageChange(stage, i));
    this.score = new ScoreSystem();
    this.traffic = new Traffic(this, {
      onSpawn: (v) => this.onSpawn(v),
      onPassed: (v) => { if (v.kind === 'peugeot') this.score.peugeotsDodged++; },
      onNearMiss: (v) => this.onNearMiss(v),
    });
    this.police = new Police(this, {
      onArrive: () => {
        this.banner('POLÍCIA!', '#ff3b3b');
        this.dialogue.trigger('police_arrive', { force: true });
        this.updateMusic();
      },
      onEscape: () => {
        const bonus = 500 * this.score.multiplier;
        this.score.score += bonus;
        this.banner(`DESPISTAMOS!\n+${bonus}`, '#8bff6a');
        this.dialogue.trigger('police_escape', { force: true });
        this.updateMusic();
      },
      onClose: () => this.dialogue.trigger('police_close'),
      onCritical: () => this.dialogue.trigger('police_critical'),
      onBusted: () => this.gameOver('busted'),
    });
    this.dialogue = new DialogueSystem(this, { contextProvider: () => ({ chasing: this.police.active }) });

    this.buildHud();
    this.startCountdown();

    Audio.unlock();
    Audio.startMusic(0);
    Audio.setIntensity(0);
    Audio.startEngine();

    this.input.keyboard?.on('keydown-P', () => this.togglePause());
    this.input.keyboard?.on('keydown-ESC', () => this.togglePause());
    this.onHidden = () => { if (document.hidden && this.state === 'running' && !this.paused) this.togglePause(); };
    document.addEventListener('visibilitychange', this.onHidden);
    this.events.once('shutdown', () => {
      document.removeEventListener('visibilitychange', this.onHidden);
      Audio.resume(); // saiu pelo MENU da pausa: libera o áudio para a próxima cena
      Audio.stopEngine();
      this.police.stop();
    });
  }

  // ---------------- HUD ----------------
  buildHud() {
    const hud = this.add.graphics().setDepth(800);
    hud.fillStyle(0x05070d, 0.78).fillRect(0, 0, GAME_W, 70);
    hud.fillStyle(0xffffff, 0.9).fillRect(0, 70, GAME_W, 2);
    this.scoreText = makeText(this, 14, 12, '0000000', 22, '#ffd23f').setDepth(801);
    this.multText = makeText(this, 14, 44, 'x1', 14, '#ffffff').setDepth(801);
    this.speedText = makeText(this, GAME_W - 74, 12, '0 KM/H', 16, '#fff').setOrigin(1, 0).setDepth(801);
    this.distText = makeText(this, GAME_W - 74, 42, '0.00 KM', 12, '#9fb0d0').setOrigin(1, 0).setDepth(801);

    // Pausa
    const pb = this.add.container(GAME_W - 34, 35).setDepth(802);
    const pg = this.add.graphics();
    pg.fillStyle(0xffffff, 0.12).fillRect(-26, -26, 52, 52).lineStyle(2, 0xffffff, 0.8).strokeRect(-26, -26, 52, 52);
    pg.fillStyle(0xffffff).fillRect(-10, -12, 7, 24).fillRect(3, -12, 7, 24);
    pb.add(pg).setSize(60, 60).setInteractive();
    pb.on('pointerdown', (p, x, y, e) => { e.stopPropagation(); this.player.drag = null; this.togglePause(); });

    // Indicador de perseguição (aparece com a polícia)
    this.heatUi = this.add.container(0, 0).setDepth(801).setAlpha(0);
    const hb = this.add.graphics();
    hb.fillStyle(0x05070d, 0.8).fillRect(12, 172, GAME_W - 24, 26);
    hb.lineStyle(2, 0xffffff, 0.9).strokeRect(12, 172, GAME_W - 24, 26);
    this.heatBar = this.add.graphics();
    this.heatLabel = makeText(this, 20, 179, 'POLÍCIA', 11, '#fff');
    this.heatUi.add([hb, this.heatBar, this.heatLabel]);
  }

  updateHud() {
    const s = this.score;
    this.scoreText.setText(String(Math.floor(s.score)).padStart(7, '0'));
    this.multText.setText(`x${s.multiplier}`).setColor(['#ffffff', '#ffffff', '#8bff6a', '#5ad1ff', '#ffd23f', '#ff3b3b'][s.multiplier]);
    this.speedText.setText(`${this.difficulty.kmh} KM/H`);
    this.distText.setText(`${(s.distance / 1000).toFixed(2)} KM`);

    const visible = this.police.state !== 'off' && this.police.state !== 'cooldown';
    this.heatUi.setAlpha(Phaser.Math.Linear(this.heatUi.alpha, visible ? 1 : 0, 0.15));
    if (visible) {
      const h = this.police.heat / 100;
      const x0 = 120, w = GAME_W - 24 - 116;
      const blink = h > 0.75 && Math.floor(this.time.now / 150) % 2 === 0;
      this.heatBar.clear();
      this.heatBar.fillStyle(0x222634).fillRect(x0, 178, w, 14);
      this.heatBar.fillStyle(blink ? 0xffffff : h > 0.75 ? 0xff3b3b : h > 0.45 ? 0xffa53b : 0x5ad1ff).fillRect(x0, 178, w * h, 14);
      const flash = Math.floor(this.time.now / 250) % 2 === 0;
      this.heatLabel.setColor(flash ? '#ff3b3b' : '#5a8bff');
    }
  }

  // ---------------- fluxo ----------------
  startCountdown() {
    this.countText = this.add.text(GAME_W / 2, GAME_H / 2 - 60, '3', { fontFamily: FONT, fontSize: '72px', color: '#ffd23f' })
      .setOrigin(0.5).setStroke('#000', 10).setDepth(950);
    this.dialogue.trigger('run_start', { force: true });
  }

  update(_, deltaMs) {
    const dt = Math.min(deltaMs / 1000, 1 / 20); // evita saltos após travadas
    if (this.paused) return;

    if (this.state === 'countdown') {
      this.countdown -= dt;
      const n = Math.ceil(this.countdown / (COUNTDOWN / 3));
      const label = this.countdown > 0 ? String(n) : 'VAI!';
      if (this.countText.text !== label) {
        this.countText.setText(label).setScale(1.6);
        this.tweens.add({ targets: this.countText, scale: 1, duration: 250, ease: 'Back.easeOut' });
        Audio.sfx(label === 'VAI!' ? 'stage' : 'click');
      }
      if (this.countdown <= -0.4) {
        this.countText.destroy();
        this.state = 'running';
      }
      this.player.update(dt, 0);
      this.road.tilePositionY -= 140 * dt;
      this.dialogue.update(dt);
      return;
    }

    if (this.state === 'crashed') {
      this.dialogue.update(dt);
      return;
    }

    const d = this.difficulty;
    d.update(dt);
    this.road.tilePositionY -= d.speed * dt;
    this.player.update(dt, d.speed01);
    this.score.update(dt, d.kmh);
    Audio.setEngine(d.speed01);

    const hit = this.traffic.update(dt, d.speed, d.stage, this.player);
    if (hit) return this.gameOver('crash', hit);

    this.police.update(dt, this.player, d.stage.id === 'caos');
    if (this.state !== 'running') return;
    this.dialogue.update(dt);
    this.updateSpeedLines(dt, d);
    this.checkMilestones(d);
    this.checkEasterEggs(dt, d);
    this.updateHud();
  }

  checkMilestones(d) {
    if (!this.extremeAnnounced && d.speed01 > 0.72) {
      this.extremeAnnounced = true;
      this.dialogue.trigger('speed_extreme');
    }
    if (!this.recordAnnounced && this.highScore.score > 0 && this.score.score > this.highScore.score) {
      this.recordAnnounced = true;
      Audio.sfx('record');
      this.banner('NOVO RECORDE!', '#ffd23f');
      this.dialogue.trigger('record');
    }
    const MILESTONES = [10000, 25000, 50000, 100000, 200000];
    if (this.milestoneIdx < MILESTONES.length && this.score.score >= MILESTONES[this.milestoneIdx]) {
      this.milestoneIdx++;
      this.dialogue.trigger('score_milestone');
    }
  }

  // Easter egg: toca no máximo uma vez por partida, com chance extra opcional
  egg(event, chance = 1) {
    if (this.eggs.has(event)) return;
    this.eggs.add(event);
    if (Math.random() < chance) this.dialogue.trigger(event, { force: true });
  }

  checkEasterEggs(dt, d) {
    const t = this.score.time;
    const p = this.player;
    if (t > 25 && !p.touched) this.egg('egg_no_touch');
    this.edgeTime = (p.x <= p.minX + 2 || p.x >= p.maxX - 2) ? this.edgeTime + dt : 0;
    // Raros de propósito: condição específica + sorteio (consumido na 1ª vez que a condição ocorre)
    if (this.edgeTime > 20) this.egg('egg_shoulder', 0.25);
    if (t > 90 && t - this.lastNearMissAt > 90 && d.stageIndex >= 2) this.egg('egg_clean_minute', 0.15);
    if (d.kmh >= 222 && d.kmh <= 224) this.egg('egg_222', 0.08);
    if (t > 7 && t < 8) {
      if (new Date().getHours() === 0) this.egg('egg_midnight', 0.5);
      if (this.runNumber % 10 === 0) this.egg('egg_tenth_run', 0.5);
    }
  }

  onStageChange(stage, index) {
    Audio.sfx('stage');
    this.banner(stage.label, index >= 3 ? '#ff3b3b' : '#ffd23f');
    if (stage.id === 'perseguicao') this.police.enable();
    else this.dialogue.trigger('speed_up');
    this.updateMusic();
  }

  updateMusic() {
    const i = this.difficulty.stageIndex;
    let level = i === 0 ? 0 : i <= 2 ? 1 : 2;
    if (this.police.active) level = 3;
    Audio.setIntensity(level);
  }

  onSpawn(v) {
    if (v.kind === 'peugeot') {
      if (this.firstPeugeot) {
        this.firstPeugeot = false;
        // Espera um pouco para o Peugeot aparecer na tela antes do comentário
        this.time.delayedCall(700, () => this.state === 'running' && this.dialogue.trigger('first_peugeot', { force: true }));
      } else {
        this.dialogue.trigger('peugeot');
      }
    } else if (v.silver) {
      this.dialogue.trigger('silver_car');
    } else if (v.kind === 'truck') {
      if (Math.random() < 0.5) this.time.delayedCall(400, () => this.state === 'running' && Audio.sfx('horn'));
      this.dialogue.trigger('truck');
    }
    if (v.denseRow) this.dialogue.trigger('traffic_absurd');
  }

  onNearMiss(v) {
    const { points, multiplierUp } = this.score.nearMiss();
    this.lastNearMissAt = this.score.time;
    this.police.nearMiss();
    Audio.sfx(multiplierUp ? 'multiplier' : 'nearMiss');
    this.cameras.main.shake(90, 0.004);
    const x = (v.sprite.x + this.player.x) / 2;
    this.popup(x, PLAYER.y - 90, 'NEAR MISS!', '#8bff6a', 16);
    this.popup(x, PLAYER.y - 64, `+${points}`, '#ffffff', 14, 80);
    if (multiplierUp) this.popup(GAME_W / 2, PLAYER.y - 150, `MULTIPLIER x${this.score.multiplier}`, '#ffd23f', 18, 120);
    // Uma reação por near miss, da mais específica para a mais genérica
    // (cada uma tem cooldown próprio; se não puder tocar, cai para a próxima)
    const s = this.score;
    const options = [];
    if (multiplierUp && s.multiplier === SCORE.multiplierMax) options.push('multiplier_max');
    if (s.streak >= 5) options.push('near_miss_chain');
    if (s.streak >= 3) options.push('near_miss_streak');
    else options.push('near_miss'); // em sequência não cai para a genérica: frequência igual à v0.1
    options.some((ev) => this.dialogue.trigger(ev));
  }

  // ---------------- efeitos ----------------
  popup(x, y, str, color, size = 16, delay = 0) {
    const t = makeText(this, x, y, str, size, color).setOrigin(0.5).setDepth(850).setAlpha(0);
    t.setStroke('#000', 6);
    this.tweens.add({
      targets: t, alpha: { from: 1, to: 0 }, y: y - 60, delay, duration: 900, ease: 'Cubic.easeOut',
      onStart: () => t.setAlpha(1), onComplete: () => t.destroy(),
    });
  }

  banner(str, color) {
    const t = this.add.text(GAME_W / 2, 420, str, { fontFamily: FONT, fontSize: '26px', color, align: 'center', lineSpacing: 10 })
      .setOrigin(0.5).setStroke('#000', 8).setDepth(860).setScale(0.2);
    this.tweens.add({ targets: t, scale: 1, duration: 280, ease: 'Back.easeOut' });
    this.tweens.add({ targets: t, alpha: 0, y: 380, delay: 1400, duration: 400, onComplete: () => t.destroy() });
  }

  updateSpeedLines(dt, d) {
    if (d.speed01 > 0.3 && Math.random() < d.speed01 * 0.9) {
      const xs = [ROAD.left - 12, ROAD.right + 12, ...Array.from({ length: ROAD.lanes - 1 }, (_, i) => ROAD.left + (i + 1) * ROAD.laneW)];
      const x = Phaser.Utils.Array.GetRandom(xs) + Phaser.Math.Between(-20, 20);
      const r = this.add.rectangle(x, -60, 2, Phaser.Math.Between(40, 110), 0xffffff, 0.25 + d.speed01 * 0.25).setDepth(30);
      this.speedLines.push(r);
    }
    for (let i = this.speedLines.length - 1; i >= 0; i--) {
      const r = this.speedLines[i];
      r.y += d.speed * 1.6 * dt;
      if (r.y > GAME_H + 120) { r.destroy(); this.speedLines.splice(i, 1); }
    }
  }

  // ---------------- pausa ----------------
  togglePause() {
    if (this.state !== 'running') return;
    this.paused = !this.paused;
    if (this.paused) {
      Audio.pause();
      const now = this.score.time;
      this.pauseTimes = this.pauseTimes.filter((t) => now - t < 20).concat(now);
      this.tweens.pauseAll();
      this.time.paused = true;
      this.pauseUi = this.add.container(0, 0).setDepth(1000);
      this.pauseUi.add(this.add.rectangle(0, 0, GAME_W, GAME_H, 0x000000, 0.75).setOrigin(0).setInteractive());
      this.pauseUi.add(makeText(this, GAME_W / 2, 330, 'PAUSA', 36, '#ffd23f').setOrigin(0.5));
      this.pauseUi.add(makeButton(this, GAME_W / 2, 480, 'CONTINUAR', () => this.togglePause(), { w: 320 }));
      this.pauseUi.add(makeButton(this, GAME_W / 2, 580, 'MENU', () => this.scene.start('Menu'), { w: 320, color: 0x3a3f4b }));
    } else {
      this.tweens.resumeAll();
      this.time.paused = false;
      this.pauseUi.destroy();
      this.player.drag = null;
      Audio.resume();
      this.updateMusic(); // intensidade do estágio atual (e da polícia, se ativa)
      Audio.setEngine(this.difficulty.speed01);
      if (this.pauseTimes.length >= 3) this.egg('egg_pause_spam');
    }
  }

  // ---------------- fim de jogo ----------------
  gameOver(cause, vehicle) {
    if (this.state === 'crashed') return;
    this.state = 'crashed';
    this.player.crash();
    this.player.drag = null;
    Audio.stopEngine();
    Audio.stopMusic();
    this.police.stop();
    this.dialogue.stop();

    const p = this.player.sprite;
    if (cause === 'crash') {
      Audio.sfx('crash');
      this.cameras.main.shake(450, 0.02);
      this.cameras.main.flash(180, 255, 255, 255);
      this.add.particles(p.x, p.y - p.displayHeight / 2, 'px', {
        speed: { min: 120, max: 420 }, angle: { min: 180, max: 360 }, lifespan: 700, gravityY: 500,
        scale: { start: 1.6, end: 0.4 }, tint: [0xff3b3b, 0xffd23f, 0xcfd3da, 0x222222, 0xff8a3b], emitting: false,
      }).setDepth(70).explode(48);
      this.add.particles(p.x, p.y - 20, 'puff', {
        speed: { min: 20, max: 60 }, angle: { min: 240, max: 300 }, lifespan: 1400, frequency: 60,
        scale: { start: 1.2, end: 3 }, alpha: { start: 0.5, end: 0 }, tint: [0x333333, 0x555555],
      }).setDepth(69);
      this.tweens.add({ targets: [p, this.player.shadow], angle: Phaser.Math.Between(-35, 35), y: p.y + 30, duration: 500, ease: 'Cubic.easeOut' });
      if (vehicle) this.tweens.add({ targets: [vehicle.sprite, vehicle.shadow], angle: Phaser.Math.Between(-40, 40), y: vehicle.sprite.y - 40, duration: 500, ease: 'Cubic.easeOut' });
    } else {
      Audio.sfx('horn');
      this.banner('PEGARAM VOCÊS!', '#5a8bff');
      this.cameras.main.shake(200, 0.01);
    }

    const stats = { ...this.score.stats, cause };
    this.time.delayedCall(1500, () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('GameOver', stats));
    });
  }
}

