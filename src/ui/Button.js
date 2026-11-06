// Botão arcade com área de toque confortável.
import { Audio } from '../systems/AudioSystem.js';

export const FONT = '"Press Start 2P", monospace';

export function makeButton(scene, x, y, label, onClick, { w = 300, h = 64, color = 0xd62828, fontSize = 20 } = {}) {
  const c = scene.add.container(x, y);
  const g = scene.add.graphics();
  const draw = (pressed) => {
    g.clear();
    const off = pressed ? 4 : 0;
    g.fillStyle(0x000000).fillRect(-w / 2 + 6, -h / 2 + 6, w, h);
    g.fillStyle(color).fillRect(-w / 2 + off, -h / 2 + off, w, h);
    g.fillStyle(0xffffff, 0.22).fillRect(-w / 2 + off, -h / 2 + off, w, 6);
    g.lineStyle(3, 0xffffff).strokeRect(-w / 2 + off, -h / 2 + off, w, h);
    text.setPosition(off, off);
  };
  const text = scene.add.text(0, 0, label, { fontFamily: FONT, fontSize: `${fontSize}px`, color: '#fff' })
    .setOrigin(0.5).setShadow(2, 2, '#000', 0, false, true);
  c.add([g, text]);
  draw(false);
  // Área de toque = face do botão (a sombra é só visual)
  c.setSize(w, h).setInteractive({ useHandCursor: true });
  // Só dispara se o MESMO dedo/cursor apertou e soltou neste botão. Evita:
  // - soltar sobre o botão um dedo que já estava pressionado (ex.: arrastando o carro na batida);
  // - apertar um botão e soltar em outro.
  let armed = null;
  c.on('pointerdown', (p) => { armed = p.id; draw(true); });
  c.on('pointerout', () => { armed = null; draw(false); });
  c.on('pointerup', (p) => {
    const ok = armed === p.id;
    armed = null;
    draw(false);
    if (!ok) return;
    Audio.unlock();
    Audio.sfx('click');
    onClick();
  });
  c.label = text;
  return c;
}

export function makeText(scene, x, y, str, size = 14, color = '#fff', extra = {}) {
  return scene.add.text(x, y, str, { fontFamily: FONT, fontSize: `${size}px`, color, ...extra }).setShadow(2, 2, '#000', 0, false, true);
}
