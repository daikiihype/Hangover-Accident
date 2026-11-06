// Carrega imagens, gera texturas procedurais (estrada, caminhão, efeitos) e espera a fonte pixel.
import { GAME_W, GAME_H, ROAD } from '../data/config.js';

export class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }

  preload() {
    const t = this.add.text(GAME_W / 2, GAME_H / 2, 'CARREGANDO...', { fontFamily: 'monospace', fontSize: '20px', color: '#fff' }).setOrigin(0.5);
    this.load.on('progress', (p) => t.setText(`CARREGANDO... ${Math.round(p * 100)}%`));
    this.load.image('gol_top', 'assets/cars/gol_top.png');
    this.load.image('peugeot_top', 'assets/cars/peugeot_top.png');
    this.load.image('police_top', 'assets/cars/police_top.png');
    this.load.image('gol_front', 'assets/cars/gol_front.png');
    this.load.image('portrait_joao', 'assets/characters/joao.png');
    this.load.image('portrait_selva', 'assets/characters/selva.png');
    this.load.image('portrait_lucas', 'assets/characters/lucas.png');
    // Game Over: versão derivada do gol_destruido.png original, sem os textos incorporados (v0.2.1)
    this.load.image('gol_destruido', 'assets/ui/gol_destruido_limpo.png');
  }

  create() {
    this.makeRoad();
    this.makeTruck();
    this.makeFx();
    const fontReady = document.fonts ? document.fonts.load('12px "Press Start 2P"') : Promise.resolve();
    const timeout = new Promise((r) => setTimeout(r, 2500)); // sem internet: segue com a fonte reserva
    Promise.race([fontReady, timeout]).then(() => this.scene.start('Menu'));
  }

  // Estrada em pixel art: mato, acostamento, asfalto e faixas. Repete verticalmente.
  makeRoad() {
    const H = 240; // múltiplo do período das faixas tracejadas (120)
    const g = this.add.graphics();
    const rnd = new Phaser.Math.RandomDataGenerator(['br-116']);
    const P = 4; // tamanho do "pixel"

    // Mato
    g.fillStyle(0x1f4d2b).fillRect(0, 0, GAME_W, H);
    for (let y = 0; y < H; y += P) for (let x = 0; x < GAME_W; x += P) {
      const r = rnd.frac();
      if (r < 0.12) g.fillStyle(0x2c6b3a).fillRect(x, y, P, P);
      else if (r < 0.18) g.fillStyle(0x173d22).fillRect(x, y, P, P);
    }
    // Moitas
    for (let i = 0; i < 6; i++) {
      const side = i % 2 === 0;
      const x = side ? rnd.between(6, ROAD.left - 50) : rnd.between(ROAD.right + 26, GAME_W - 30);
      const y = rnd.between(0, H - 24);
      g.fillStyle(0x0f2e18).fillRect(x, y + 4, 24, 16);
      g.fillStyle(0x3d8a4a).fillRect(x + 4, y, 16, 16);
      g.fillStyle(0x56a860).fillRect(x + 8, y + 4, 8, 4);
    }
    // Acostamento (terra/cascalho)
    const sh = 22;
    g.fillStyle(0x6b5a45).fillRect(ROAD.left - sh, 0, sh, H).fillRect(ROAD.right, 0, sh, H);
    for (let y = 0; y < H; y += P) for (const x0 of [ROAD.left - sh, ROAD.right]) {
      for (let x = x0; x < x0 + sh; x += P) if (rnd.frac() < 0.25) g.fillStyle(rnd.frac() < 0.5 ? 0x7d6a52 : 0x584a39).fillRect(x, y, P, P);
    }
    // Balizadores refletivos
    for (const y of [40, 160]) {
      g.fillStyle(0xe8e8e8).fillRect(ROAD.left - sh + 4, y, 4, 12).fillRect(ROAD.right + sh - 8, y, 4, 12);
      g.fillStyle(0xff9a1f).fillRect(ROAD.left - sh + 4, y, 4, 4).fillRect(ROAD.right + sh - 8, y, 4, 4);
    }
    // Asfalto
    g.fillStyle(0x34373d).fillRect(ROAD.left, 0, ROAD.width, H);
    for (let y = 0; y < H; y += P) for (let x = ROAD.left; x < ROAD.right; x += P) {
      const r = rnd.frac();
      if (r < 0.08) g.fillStyle(0x3d4047).fillRect(x, y, P, P);
      else if (r < 0.13) g.fillStyle(0x2c2e33).fillRect(x, y, P, P);
    }
    // Marcas de pneu escuras no meio das faixas
    for (let l = 0; l < ROAD.lanes; l++) {
      const c = ROAD.laneCenter(l);
      g.fillStyle(0x2e3035, 0.7).fillRect(c - 26, 0, 12, H).fillRect(c + 14, 0, 12, H);
    }
    // Linhas de borda (contínuas) e divisórias (tracejadas)
    g.fillStyle(0xf2f2f2).fillRect(ROAD.left + 4, 0, 6, H).fillRect(ROAD.right - 10, 0, 6, H);
    for (let l = 1; l < ROAD.lanes; l++) {
      const x = ROAD.left + l * ROAD.laneW - 3;
      const color = l === ROAD.lanes / 2 ? 0xf5c518 : 0xf2f2f2; // amarela no meio, cara de BR
      for (let y = 0; y < H; y += 120) g.fillStyle(color).fillRect(x, y, 6, 52);
    }
    g.generateTexture('road', GAME_W, H);
    g.destroy();
    this.textures.get('road').setFilter(Phaser.Textures.FilterMode.NEAREST);
  }

  // Caminhão (frente para cima), desenhado em baixa resolução e ampliado 2x
  makeTruck() {
    const g = this.add.graphics();
    const W = 38, H = 100;
    // pneus
    g.fillStyle(0x111111);
    for (const y of [10, 44, 54, 84, 92]) g.fillRect(0, y, 3, 7).fillRect(W - 3, y, 3, 7);
    // cabine
    g.fillStyle(0x000000).fillRect(2, 0, W - 4, 28);
    g.fillStyle(0xc9502a).fillRect(3, 1, W - 6, 26);
    g.fillStyle(0xe8743f).fillRect(5, 2, W - 10, 3);
    g.fillStyle(0x1b2a3a).fillRect(6, 6, W - 12, 6); // para-brisa
    g.fillStyle(0x3d5a78).fillRect(7, 7, 8, 2);
    g.fillStyle(0xa23d1f).fillRect(6, 16, W - 12, 8);  // teto
    g.fillStyle(0xffe680).fillRect(4, 0, 4, 2).fillRect(W - 8, 0, 4, 2); // faróis
    // engate
    g.fillStyle(0x222222).fillRect(16, 27, 6, 4);
    // baú
    g.fillStyle(0x000000).fillRect(1, 30, W - 2, H - 30);
    g.fillStyle(0xcfd4dc).fillRect(2, 31, W - 4, H - 32);
    g.fillStyle(0xe6e9ee).fillRect(3, 32, W - 6, 2);
    g.fillStyle(0xaab0ba);
    for (let y = 38; y < H - 2; y += 8) g.fillRect(2, y, W - 4, 1);
    g.fillStyle(0x2e5bd8).fillRect(6, 56, W - 12, 14); // faixa de "logo"
    g.fillStyle(0xffffff).fillRect(9, 61, W - 18, 4);
    g.fillStyle(0xff2a2a).fillRect(3, H - 3, 5, 2).fillRect(W - 8, H - 3, 5, 2); // lanternas
    g.generateTexture('truck', W, H);
    g.destroy();
    this.textures.get('truck').setFilter(Phaser.Textures.FilterMode.NEAREST);
  }

  makeFx() {
    let g = this.add.graphics();
    g.fillStyle(0xffffff).fillRect(0, 0, 4, 4);
    g.generateTexture('px', 4, 4);
    g.clear();
    for (let r = 32; r > 0; r -= 2) g.fillStyle(0xffffff, 0.06 + (1 - r / 32) * 0.12).fillCircle(32, 32, r);
    g.generateTexture('glow', 64, 64);
    g.clear();
    g.fillStyle(0xffffff).fillRect(4, 0, 8, 16).fillRect(0, 4, 16, 8);
    g.generateTexture('puff', 16, 16);
    g.destroy();
  }
}
