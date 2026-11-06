import { GAME_W, GAME_H } from './data/config.js';
import { BootScene } from './scenes/BootScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { GameScene } from './scenes/GameScene.js';
import { GameOverScene } from './scenes/GameOverScene.js';

// A fonte "Press Start 2P" não tem maiúsculas acentuadas (desenha a minúscula no lugar).
// Como nos arcades antigos, maiúsculas perdem o acento: "POLÍCIA" → "POLICIA".
// Minúsculas acentuadas existem na fonte e ficam intactas.
const UPPER_ACCENTS = { Á: 'A', À: 'A', Â: 'A', Ã: 'A', É: 'E', Ê: 'E', Í: 'I', Ó: 'O', Ô: 'O', Õ: 'O', Ú: 'U', Ü: 'U', Ç: 'C' };
const setText = Phaser.GameObjects.Text.prototype.setText;
Phaser.GameObjects.Text.prototype.setText = function (value) {
  if (typeof value === 'string') value = value.replace(/[ÁÀÂÃÉÊÍÓÔÕÚÜÇ]/g, (c) => UPPER_ACCENTS[c]);
  return setText.call(this, value);
};

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: GAME_W,
  height: GAME_H,
  backgroundColor: '#05070d',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  input: { activePointers: 2 },
  render: { antialias: true, roundPixels: false },
  scene: [BootScene, MenuScene, GameScene, GameOverScene],
});

// Atalho para depuração no console do navegador
window.__game = game;

// iOS Safari ignora parte do touch-action: bloqueia pinça, zoom por duplo toque e
// rolagem elástica da página (o jogo trata todos os toques).
for (const ev of ['gesturestart', 'gesturechange', 'gestureend', 'dblclick']) {
  document.addEventListener(ev, (e) => e.preventDefault(), { passive: false });
}
document.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });

// PWA: Service Worker só funciona em HTTPS (ou localhost, para desenvolvimento)
const secure = location.protocol === 'https:' || ['localhost', '127.0.0.1'].includes(location.hostname);
if ('serviceWorker' in navigator && secure) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch((err) => console.warn('Service Worker não registrado:', err));
  });
}
