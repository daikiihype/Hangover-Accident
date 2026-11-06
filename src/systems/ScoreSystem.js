// Pontuação: distância + tempo sobrevivido + near miss, tudo multiplicado.
import { SCORE } from '../data/config.js';

export class ScoreSystem {
  constructor() {
    this.score = 0;
    this.distance = 0;       // metros
    this.time = 0;
    this.multiplier = 1;
    this.multTimer = 0;
    this.nearMisses = 0;
    this.peugeotsDodged = 0;
    this.maxKmh = 0;
    this.streak = 0;         // near misses seguidos sem o multiplicador cair
  }

  update(dt, kmh) {
    this.time += dt;
    const meters = (kmh / 3.6) * dt;
    this.distance += meters;
    this.maxKmh = Math.max(this.maxKmh, kmh);
    this.score += (meters * SCORE.perMeter + dt * SCORE.survivalPerSec) * this.multiplier;
    if (this.multiplier > 1) {
      this.multTimer -= dt;
      if (this.multTimer <= 0) {
        this.multiplier--;
        this.streak = 0;
        this.multTimer = SCORE.multiplierDecay;
      }
    }
  }

  // Retorna { points, multiplierUp }
  nearMiss() {
    this.nearMisses++;
    this.streak++;
    const points = SCORE.nearMiss * this.multiplier;
    this.score += points;
    const before = this.multiplier;
    this.multiplier = Math.min(SCORE.multiplierMax, this.multiplier + 1);
    this.multTimer = SCORE.multiplierDecay;
    return { points, multiplierUp: this.multiplier > before };
  }

  get stats() {
    return {
      score: Math.floor(this.score),
      distance: this.distance,
      time: this.time,
      maxKmh: this.maxKmh,
      nearMisses: this.nearMisses,
      peugeotsDodged: this.peugeotsDodged,
    };
  }
}
