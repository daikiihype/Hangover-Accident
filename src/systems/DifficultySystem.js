// Velocidade progressiva e estágios de dificuldade (valores em data/config.js).
import { SPEED, STAGES } from '../data/config.js';

export class DifficultySystem {
  constructor(onStageChange) {
    this.time = 0;
    this.stageIndex = 0;
    this.speed = SPEED.start;
    this.onStageChange = onStageChange;
  }

  get stage() { return STAGES[this.stageIndex]; }
  get speed01() { return (this.speed - SPEED.start) / (SPEED.max - SPEED.start); }
  get kmh() { return Math.round(this.speed * SPEED.kmhPerPx); }

  update(dt) {
    this.time += dt;
    this.speed = Math.min(SPEED.max, SPEED.start + this.time * SPEED.accel);
    const next = STAGES[this.stageIndex + 1];
    if (next && this.time >= next.at) {
      this.stageIndex++;
      this.onStageChange?.(this.stage, this.stageIndex);
    }
  }
}
