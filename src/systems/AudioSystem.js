// Áudio 100% sintetizado com Web Audio (sem arquivos): trilha chiptune original
// em camadas, motor, sirene, efeitos e "vozes" (bipes) dos personagens.
// Música, efeitos e diálogos têm volumes independentes (ver storage.settings).
import { settings } from '../utils/storage.js';

const NOTE = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 };
function freq(name) {
  const m = /^([A-G]#?)(\d)$/.exec(name);
  const midi = (Number(m[2]) + 1) * 12 + NOTE[m[1]];
  return 440 * Math.pow(2, (midi - 69) / 12);
}

// ---- Trilha original: "BR Infinita" (Lá menor, 150 BPM, 8 compassos de 16 semicolcheias) ----
const BPM = 150;
const STEP = 60 / BPM / 4;
const CHORDS = ['Am', 'F', 'C', 'G', 'Am', 'F', 'G', 'E'];
const CHORD_TONES = {
  Am: ['A3', 'C4', 'E4'], F: ['F3', 'A3', 'C4'], C: ['C4', 'E4', 'G4'], G: ['G3', 'B3', 'D4'], E: ['E3', 'G#3', 'B3'],
};
const BASS_ROOT = { Am: 'A2', F: 'F2', C: 'C3', G: 'G2', E: 'E2' };
// '.' = pausa, '-' = segura a nota anterior
const LEAD = [
  'E5 - - E5 - - D5 - E5 - - G5 - - E5 -',
  'C5 - - C5 - - A4 - C5 - - D5 - - C5 -',
  'G4 - - G4 - - C5 - E5 - - G5 - - A5 -',
  'B5 - - A5 - - G5 - D5 - - B4 - D5 - -',
  'E5 - - E5 - - D5 - E5 - - A5 - - G5 -',
  'F5 - - E5 - - C5 - A4 - - C5 - - F5 -',
  'D5 - - D5 - - B4 - D5 - - G5 - - F5 -',
  'E5 - G#4 - B4 - E5 - G#5 - - - E5 - . .',
].map((bar) => bar.split(' '));

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.intensity = 0;      // 0..3 (camadas da música)
    this.musicOn = false;
    this.step = 0;
    this.nextTime = 0;
    this.timer = null;
    this.paused = false;     // pausa do jogo: nada volta a tocar até resume()
  }

  // Precisa ser chamado dentro de um gesto do usuário (toque/clique)
  unlock() {
    if (!this.ctx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      this.ctx = new Ctx();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.9;
      const comp = this.ctx.createDynamicsCompressor();
      this.master.connect(comp).connect(this.ctx.destination);
      this.musicBus = this.bus(settings.music * 0.55);
      this.sfxBus = this.bus(settings.sfx);
      this.voiceBus = this.bus(settings.voices * 0.6);
      this.noiseBuf = this.makeNoise();
      // Ciclo de vida (minimizar app, trocar de aba, bfcache do Safari)
      const hide = () => { if (this.ctx.state === 'running') this.ctx.suspend(); };
      const show = () => this.tryResume(); // se o jogo estiver pausado, continua mudo
      document.addEventListener('visibilitychange', () => (document.hidden ? hide() : show()));
      window.addEventListener('pagehide', hide);
      window.addEventListener('pageshow', show);
    }
    this.tryResume();
  }

  // Retoma se permitido. No iOS o estado pode ser 'interrupted' (ligação, Siri, troca de app),
  // não só 'suspended'. Se o navegador exigir gesto, o próximo toque (listener global abaixo) resolve.
  tryResume() {
    if (!this.ctx || this.paused || document.hidden) return;
    if (this.ctx.state !== 'running' && this.ctx.state !== 'closed') this.ctx.resume().catch(() => {});
  }

  // Pausa: congela o relógio de áudio inteiro. Música, motor, sirene e efeitos em
  // andamento param exatamente onde estão; o agendador da música não agenda nada
  // enquanto o relógio está parado, então ao retomar não há notas duplicadas.
  pause() {
    this.paused = true;
    if (this.ctx && this.ctx.state === 'running') this.ctx.suspend();
  }

  resume() {
    this.paused = false;
    this.tryResume();
  }

  // Para testes/depuração no console: window.__audio.debugState()
  debugState() {
    return {
      ctx: this.ctx ? this.ctx.state : 'none',
      paused: this.paused,
      musicOn: this.musicOn,
      musicTimer: this.timer !== null,
      intensity: this.intensity,
      engine: !!this.engine,
      siren: !!this.siren,
    };
  }

  bus(vol) {
    const g = this.ctx.createGain();
    g.gain.value = vol;
    g.connect(this.master);
    return g;
  }

  applyVolumes() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.musicBus.gain.setTargetAtTime(settings.music * 0.55, t, 0.05);
    this.sfxBus.gain.setTargetAtTime(settings.sfx, t, 0.05);
    this.voiceBus.gain.setTargetAtTime(settings.voices * 0.6, t, 0.05);
  }

  makeNoise() {
    const len = this.ctx.sampleRate;
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }

  // ---------- primitivas ----------
  tone(bus, type, f, t, dur, vol, { attack = 0.005, slideTo = null } = {}) {
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(bus);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  noise(bus, t, dur, vol, { type = 'highpass', freq: f = 6000, q = 0.7 } = {}) {
    const s = this.ctx.createBufferSource();
    s.buffer = this.noiseBuf;
    const filt = this.ctx.createBiquadFilter();
    filt.type = type;
    filt.frequency.value = f;
    filt.Q.value = q;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(filt).connect(g).connect(bus);
    s.start(t, Math.random() * 0.5);
    s.stop(t + dur + 0.02);
  }

  // ---------- música ----------
  startMusic(intensity = 0) {
    if (!this.ctx) return;
    this.intensity = intensity;
    if (this.musicOn) return;
    this.musicOn = true;
    this.step = 0;
    this.nextTime = this.ctx.currentTime + 0.08;
    const tick = () => {
      // Se o relógio de áudio andou enquanto o timer estava estrangulado (segundo plano),
      // descarta as notas atrasadas em vez de tocá-las todas de uma vez
      if (this.nextTime < this.ctx.currentTime - 0.05) this.nextTime = this.ctx.currentTime + 0.05;
      while (this.nextTime < this.ctx.currentTime + 0.12) {
        this.scheduleStep(this.step, this.nextTime);
        this.step = (this.step + 1) % (16 * LEAD.length);
        this.nextTime += STEP;
      }
    };
    tick();
    this.timer = setInterval(tick, 25);
  }

  stopMusic() {
    this.musicOn = false;
    clearInterval(this.timer);
    this.timer = null;
  }

  setIntensity(level) { this.intensity = level; }

  scheduleStep(step, t) {
    const bar = Math.floor(step / 16);
    const s = step % 16;
    const chord = CHORDS[bar];
    const lvl = this.intensity;
    const bus = this.musicBus;

    // Baixo: colcheias pulando oitava
    if (s % 2 === 0) {
      const root = freq(BASS_ROOT[chord]);
      this.tone(bus, 'square', s % 4 === 0 ? root : root * 2, t, STEP * 1.6, 0.13);
    }
    // Chimbal
    if (s % 2 === 0 || lvl >= 2) this.noise(bus, t, 0.03, s % 4 === 2 ? 0.09 : 0.05);
    // Bumbo e caixa (a partir da camada 1)
    if (lvl >= 1) {
      if (s === 0 || s === 8 || (lvl >= 2 && (s === 10 || s === 3))) this.tone(bus, 'sine', 140, t, 0.16, 0.5, { slideTo: 40 });
      if (s === 4 || s === 12) this.noise(bus, t, 0.12, 0.28, { type: 'bandpass', freq: 1800, q: 0.8 });
    }
    // Arpejo
    if (lvl >= 1) {
      const tones = CHORD_TONES[chord];
      const n = tones[s % 3];
      this.tone(bus, 'square', freq(n) * 2, t, STEP * 0.8, lvl >= 2 ? 0.045 : 0.03);
    }
    // Melodia principal
    const tok = LEAD[bar][s];
    if (tok !== '-' && tok !== '.') {
      let len = 1;
      while (s + len < 16 && LEAD[bar][s + len] === '-') len++;
      const vol = lvl === 0 ? 0.05 : 0.085;
      this.tone(bus, lvl >= 2 ? 'sawtooth' : 'square', freq(tok), t, STEP * len * 0.95, vol, { attack: 0.01 });
      if (lvl >= 2) this.tone(bus, 'square', freq(tok) * 1.005, t, STEP * len * 0.9, 0.03);
    }
    // Camada de tensão da polícia: pulsos agudos
    if (lvl >= 3 && (s === 6 || s === 14)) {
      this.tone(bus, 'square', freq('A5'), t, STEP * 0.6, 0.04);
      this.tone(bus, 'square', freq('D#6'), t + STEP, STEP * 0.6, 0.035);
    }
  }

  // ---------- motor ----------
  startEngine() {
    if (!this.ctx || this.engine) return;
    const o = this.ctx.createOscillator();
    const o2 = this.ctx.createOscillator();
    const filt = this.ctx.createBiquadFilter();
    const g = this.ctx.createGain();
    o.type = 'sawtooth';
    o2.type = 'square';
    filt.type = 'lowpass';
    filt.frequency.value = 500;
    g.gain.value = 0.0001;
    g.gain.setTargetAtTime(0.06, this.ctx.currentTime, 0.2);
    o.connect(filt); o2.connect(filt);
    filt.connect(g).connect(this.sfxBus);
    o.start(); o2.start();
    this.engine = { o, o2, filt, g };
    this.setEngine(0);
  }

  setEngine(speed01) {
    if (!this.engine) return;
    const t = this.ctx.currentTime;
    const f = 48 + speed01 * 85;
    this.engine.o.frequency.setTargetAtTime(f, t, 0.1);
    this.engine.o2.frequency.setTargetAtTime(f * 0.5, t, 0.1);
    this.engine.filt.frequency.setTargetAtTime(380 + speed01 * 900, t, 0.1);
  }

  stopEngine() {
    if (!this.engine) return;
    const { o, o2, g } = this.engine;
    const t = this.ctx.currentTime;
    g.gain.setTargetAtTime(0.0001, t, 0.05);
    o.stop(t + 0.3); o2.stop(t + 0.3);
    this.engine = null;
  }

  // ---------- sirene ----------
  startSiren() {
    if (!this.ctx || this.siren) return;
    const o = this.ctx.createOscillator();
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    const g = this.ctx.createGain();
    o.type = 'triangle';
    o.frequency.value = 760;
    lfo.type = 'square';
    lfo.frequency.value = 1.6;
    lfoGain.gain.value = 170;
    lfo.connect(lfoGain).connect(o.frequency);
    g.gain.value = 0.0001;
    g.gain.setTargetAtTime(0.05, this.ctx.currentTime, 0.4);
    o.connect(g).connect(this.sfxBus);
    o.start(); lfo.start();
    this.siren = { o, lfo, g };
  }

  setSirenVolume(v) {
    if (this.siren) this.siren.g.gain.setTargetAtTime(Math.max(0.0001, v), this.ctx.currentTime, 0.2);
  }

  stopSiren(fade = 1.2) {
    if (!this.siren) return;
    const { o, lfo, g } = this.siren;
    const t = this.ctx.currentTime;
    g.gain.setTargetAtTime(0.0001, t, fade / 4);
    o.stop(t + fade); lfo.stop(t + fade);
    this.siren = null;
  }

  // ---------- efeitos ----------
  sfx(name) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const b = this.sfxBus;
    switch (name) {
      case 'click':
        this.tone(b, 'square', 880, t, 0.06, 0.12);
        this.tone(b, 'square', 1320, t + 0.05, 0.06, 0.1);
        break;
      case 'nearMiss':
        this.noise(b, t, 0.25, 0.25, { type: 'bandpass', freq: 2500, q: 1.2 });
        this.tone(b, 'square', 660, t, 0.08, 0.12);
        this.tone(b, 'square', 990, t + 0.07, 0.12, 0.12);
        break;
      case 'multiplier':
        [523, 659, 784, 1047].forEach((f, i) => this.tone(b, 'square', f, t + i * 0.06, 0.1, 0.1));
        break;
      case 'horn':
        this.tone(b, 'sawtooth', 392, t, 0.35, 0.09);
        this.tone(b, 'sawtooth', 466, t, 0.35, 0.07);
        break;
      case 'stage':
        [392, 523, 659, 784].forEach((f, i) => this.tone(b, 'square', f, t + i * 0.09, 0.14, 0.11));
        break;
      case 'crash':
        this.noise(b, t, 1.2, 0.9, { type: 'lowpass', freq: 1400, q: 0.5 });
        this.noise(b, t + 0.05, 0.6, 0.5, { type: 'highpass', freq: 3000 });
        this.tone(b, 'sawtooth', 160, t, 0.7, 0.4, { slideTo: 30 });
        [0.15, 0.3, 0.42].forEach((d) => this.tone(b, 'square', 1800 + Math.random() * 1500, t + d, 0.05, 0.08));
        break;
      case 'gameOver':
        ['E4', 'D#4', 'D4', 'C#4'].forEach((n, i) => this.tone(b, 'square', freq(n), t + i * 0.32, 0.3, 0.12));
        this.tone(b, 'square', freq('C4'), t + 1.28, 0.9, 0.12, { slideTo: freq('C3') });
        break;
      case 'record':
        ['C5', 'E5', 'G5', 'C6', 'G5', 'C6'].forEach((n, i) => this.tone(b, 'square', freq(n), t + i * 0.08, 0.12, 0.1));
        break;
      case 'tire':
        this.noise(b, t, 0.18, 0.08, { type: 'bandpass', freq: 3500, q: 2 });
        break;
    }
  }

  // Bipe de "fala" de um personagem (estilo jogos antigos)
  voice(char, shout = false) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const f = char.pitch * (1 + (Math.random() - 0.5) * char.wobble) * (shout ? 1.25 : 1);
    this.tone(this.voiceBus, shout ? 'sawtooth' : 'square', f, t, 0.05, shout ? 0.14 : 0.09);
  }
}

export const Audio = new AudioEngine();
window.__audio = Audio;

// iOS/Safari e Chrome só liberam áudio dentro de um gesto do usuário. Qualquer toque,
// clique ou tecla em qualquer lugar da página cria/retoma o AudioContext (fase de captura,
// antes de o Phaser tratar o evento).
for (const ev of ['pointerup', 'touchend', 'click', 'keydown']) {
  window.addEventListener(ev, () => Audio.unlock(), { capture: true, passive: true });
}
