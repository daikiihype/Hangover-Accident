// Tráfego: Peugeot prata (principal), outros carros e caminhões, em velocidades diferentes.
// Garante sempre uma faixa livre por "fileira" e evita veículos se atravessando.
import { ROAD, TRAFFIC } from '../data/config.js';

let nextId = 1;

export class Traffic {
  constructor(scene, { onNearMiss, onPassed, onSpawn }) {
    this.scene = scene;
    this.vehicles = [];
    this.spawnTimer = 1.2;
    this.onNearMiss = onNearMiss;
    this.onPassed = onPassed;
    this.onSpawn = onSpawn;
  }

  update(dt, worldSpeed, stage, player) {
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.trySpawn(stage, worldSpeed);
      // Spawn mais rápido em velocidade alta para manter a densidade na tela
      const k = 520 / Math.max(520, worldSpeed * 0.6);
      this.spawnTimer = Phaser.Math.FloatBetween(...stage.spawn) * (0.55 + 0.45 * k);
    }

    // Movimento por faixa, do veículo mais à frente (menor y) para o mais atrás.
    // speed = velocidade efetiva; desiredSpeed = a que o motorista quer (nunca muda).
    const byLane = {};
    for (const v of this.vehicles) (byLane[v.lane] ||= []).push(v);
    for (const lane of Object.values(byLane)) {
      lane.sort((a, b) => a.sprite.y - b.sprite.y);
      for (let i = 0; i < lane.length; i++) this.moveVehicle(lane[i], lane[i - 1], dt, worldSpeed);
    }

    const pb = player.hitbox;
    for (let i = this.vehicles.length - 1; i >= 0; i--) {
      const v = this.vehicles[i];

      if (player.alive) {
        const hb = this.hitbox(v);
        const vOverlap = hb.b > pb.t && hb.t < pb.b;
        if (vOverlap) {
          const gap = Math.max(hb.l - pb.r, pb.l - hb.r);
          if (gap < 0) return v; // colisão
          v.minGap = Math.min(v.minGap, gap);
        }
        if (!v.passed && hb.t > pb.b) {
          v.passed = true;
          this.onPassed?.(v);
          if (v.minGap < TRAFFIC.nearMissDist) this.onNearMiss?.(v);
        }
      }

      if (v.sprite.y - v.sprite.displayHeight > this.scene.scale.gameSize.height + 40) {
        v.sprite.destroy();
        v.shadow.destroy();
        this.vehicles.splice(i, 1);
      }
    }
    return null;
  }

  // ahead = veículo imediatamente à frente na mesma faixa (mais acima na tela), já movido neste frame
  moveVehicle(v, ahead, dt, worldSpeed) {
    let target = v.desiredSpeed;
    if (ahead) {
      const gap = this.gapTo(v, ahead);
      if (gap < TRAFFIC.followDist) {
        // Alcançou alguém mais lento: acompanha; se ficou perto demais, abre distância
        target = Math.min(target, ahead.speed);
        if (gap < TRAFFIC.safeGap) target = Math.min(target, ahead.speed - TRAFFIC.openUpSpeed);
      }
    }
    // Frenagem rápida, retomada gradual até a velocidade desejada
    const rate = target < v.speed ? TRAFFIC.brakeRate : TRAFFIC.accelRate;
    v.speed += (target - v.speed) * Math.min(1, dt * rate);
    v.sprite.y += (worldSpeed - v.speed) * dt;
    // Trava de segurança: nunca invade o veículo da frente
    if (ahead) {
      const gap = this.gapTo(v, ahead);
      if (gap < TRAFFIC.minGap) {
        v.sprite.y += TRAFFIC.minGap - gap;
        v.speed = Math.min(v.speed, ahead.speed);
      }
    }
    v.shadow.setPosition(v.sprite.x + 5, v.sprite.y + 7);
  }

  // Distância entre a traseira do veículo da frente e o para-choque de v
  gapTo(v, ahead) {
    return (v.sprite.y - v.sprite.displayHeight / 2) - (ahead.sprite.y + ahead.sprite.displayHeight / 2);
  }

  hitbox(v) {
    const hw = (v.sprite.displayWidth * v.hit.w) / 2;
    const hh = (v.sprite.displayHeight * v.hit.h) / 2;
    return { l: v.sprite.x - hw, r: v.sprite.x + hw, t: v.sprite.y - hh, b: v.sprite.y + hh };
  }

  trySpawn(stage, worldSpeed) {
    // Faixas ocupadas perto do topo (mesma "fileira")
    const nearTop = this.vehicles.filter((v) => v.sprite.y - v.sprite.displayHeight / 2 < TRAFFIC.spawnY + TRAFFIC.rowWindow);
    const rowLanes = new Set(nearTop.map((v) => v.lane));
    if (rowLanes.size >= Math.min(stage.maxPerRow, ROAD.lanes - 1)) return;

    const free = [];
    for (let l = 0; l < ROAD.lanes; l++) {
      if (rowLanes.has(l)) continue;
      const blocked = this.vehicles.some((v) => v.lane === l && v.sprite.y - v.sprite.displayHeight / 2 < TRAFFIC.spawnY + TRAFFIC.minLaneGap);
      if (!blocked) free.push(l);
    }
    if (!free.length) return;
    const lane = Phaser.Utils.Array.GetRandom(free);
    const denseRow = rowLanes.size + 1 >= 3; // fileira com 3 veículos (para diálogos de trânsito absurdo)

    const r = Math.random();
    let kind = 'car';
    if (r < stage.truck) kind = 'truck';
    else if (r < stage.truck + stage.peugeot) kind = 'peugeot';

    let sprite;
    let hit;
    let silver = false;
    if (kind === 'truck') {
      sprite = this.scene.add.image(0, 0, 'truck').setScale(TRAFFIC.truckScale);
      hit = { w: 0.86, h: 0.94 };
    } else {
      sprite = this.scene.add.image(0, 0, 'peugeot_top').setScale(TRAFFIC.carScale);
      if (kind === 'car') {
        const tint = Phaser.Utils.Array.GetRandom(TRAFFIC.otherCarTints);
        sprite.setTint(tint);
        silver = tint === 0xffffff; // sem tinta = prata, mas não é contado como Peugeot
      }
      hit = { w: 0.76, h: 0.88 };
    }
    // Pequena variação lateral dentro da faixa (sem invadir a vizinha)
    sprite.setPosition(ROAD.laneCenter(lane) + Phaser.Math.Between(-6, 6), TRAFFIC.spawnY).setDepth(40);
    const shadow = this.scene.add.image(sprite.x + 5, sprite.y + 7, sprite.texture.key)
      .setScale(sprite.scaleX).setTint(0x000000).setAlpha(0.35).setDepth(39);

    const frac = Phaser.Math.FloatBetween(...stage.carSpeed) * (kind === 'truck' ? 0.8 : 1);
    const desiredSpeed = worldSpeed * frac;
    const v = { id: nextId++, kind, lane, sprite, shadow, hit, desiredSpeed, speed: desiredSpeed, minGap: Infinity, passed: false, silver, denseRow };
    this.vehicles.push(v);
    this.onSpawn?.(v);
  }
}
