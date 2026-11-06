// Sistema de diálogos contextuais.
// - Eventos do jogo chamam trigger('evento'); as falas vêm de data/dialogues.js.
// - Prioridade: evento mais importante interrompe conversa menos importante.
// - Cooldown por evento + respiro global entre conversas.
// - "Saco embaralhado" por evento: nenhuma conversa repete até todas terem tocado.
// - Conversas espontâneas (chat/discussão/perseguição) quando o carro fica quieto.
import { CHARACTERS, DIALOGUES } from '../data/dialogues.js';
import { DIALOGUE, GAME_W } from '../data/config.js';
import { Audio } from './AudioSystem.js';

const BOX = { x: 12, y: 80, w: GAME_W - 24, h: 86, portrait: 70 };

// Sacos embaralhados persistem entre partidas (dentro da sessão) para variar mais
const bags = {};

export function pickConversation(event) {
  const def = DIALOGUES[event];
  if (!def || !def.conversations.length) return null;
  if (!bags[event] || !bags[event].length) {
    const idx = def.conversations.map((_, i) => i);
    for (let i = idx.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [idx[i], idx[j]] = [idx[j], idx[i]];
    }
    bags[event] = idx;
  }
  return def.conversations[bags[event].pop()];
}

export class DialogueSystem {
  constructor(scene, { contextProvider } = {}) {
    this.scene = scene;
    this.contextProvider = contextProvider || (() => ({}));
    this.current = null;       // { event, priority, lines, index }
    this.queued = null;
    this.lastPlayed = {};      // event -> tempo (s)
    this.time = 0;
    this.quietSince = 0;
    this.nextIdle = Phaser.Math.FloatBetween(...DIALOGUE.idleGap);
    this.buildUI();
  }

  buildUI() {
    const s = this.scene;
    const c = (this.ui = s.add.container(0, 0).setDepth(900).setAlpha(0));
    const bg = s.add.graphics();
    bg.fillStyle(0x070b16, 0.82).fillRect(BOX.x, BOX.y, BOX.w, BOX.h);
    bg.lineStyle(3, 0xffffff, 0.9).strokeRect(BOX.x, BOX.y, BOX.w, BOX.h);
    bg.lineStyle(1, 0x000000, 1).strokeRect(BOX.x + 3, BOX.y + 3, BOX.w - 6, BOX.h - 6);
    this.frame = s.add.graphics();
    this.portrait = s.add.image(BOX.x + 8 + BOX.portrait / 2, BOX.y + BOX.h / 2, 'portrait_joao');
    this.nameText = s.add.text(BOX.x + BOX.portrait + 20, BOX.y + 10, '', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '12px', color: '#fff',
    });
    this.msgText = s.add.text(BOX.x + BOX.portrait + 20, BOX.y + 30, '', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '12px', color: '#f4f4f4',
      lineSpacing: 6, wordWrap: { width: BOX.w - BOX.portrait - 34 },
    });
    c.add([bg, this.frame, this.portrait, this.nameText, this.msgText]);
  }

  // Tenta iniciar a conversa de um evento. Retorna true se tocou/entrou na fila.
  trigger(event, { force = false } = {}) {
    const def = DIALOGUES[event];
    if (!def) return false;
    const last = this.lastPlayed[event];
    if (!force) {
      if (last !== undefined && this.time - last < def.cooldown) return false;
      if (Math.random() > def.chance) return false;
    }
    if (this.current) {
      if (def.priority > this.current.priority) {
        this.play(event, def);
        return true;
      }
      // Eventos relevantes esperam a vez (uma vaga só, o mais importante fica)
      if (def.priority >= 2 && (!this.queued || def.priority > this.queued.priority)) {
        this.queued = { event, priority: def.priority };
        return true;
      }
      return false;
    }
    if (!force && def.priority < 3 && this.time - this.quietSince < DIALOGUE.minGap) return false;
    this.play(event, def);
    return true;
  }

  play(event, def) {
    const lines = pickConversation(event);
    if (!lines) return;
    this.lastPlayed[event] = this.time;
    this.current = { event, priority: def.priority, lines, index: -1 };
    this.scene.tweens.killTweensOf(this.ui);
    this.scene.tweens.add({ targets: this.ui, alpha: 1, duration: 120 });
    this.nextLine();
  }

  nextLine() {
    const cur = this.current;
    cur.index++;
    if (cur.index >= cur.lines.length) return this.finish();
    const [who, text] = cur.lines[cur.index];
    const ch = CHARACTERS[who];
    const shout = text === text.toUpperCase() && /[A-Z]/.test(text);
    this.portrait.setTexture(ch.portrait).setDisplaySize(BOX.portrait, BOX.portrait);
    this.frame.clear();
    const col = Phaser.Display.Color.HexStringToColor(ch.color).color;
    const px = BOX.x + 8, py = BOX.y + (BOX.h - BOX.portrait) / 2;
    this.frame.lineStyle(3, col, 1).strokeRect(px - 2, py - 2, BOX.portrait + 4, BOX.portrait + 4);
    this.nameText.setText(ch.name).setColor(ch.color);
    this.msgText.setText('');
    this.typing = { text, shown: 0, acc: 0, char: ch, shout };
    this.lineTimer = text.length / DIALOGUE.typeSpeed + DIALOGUE.holdBase + text.length * DIALOGUE.holdPerChar;
    if (shout) {
      this.scene.tweens.add({ targets: this.ui, x: { from: -5, to: 0 }, duration: 260, ease: 'Bounce.easeOut' });
    }
  }

  finish() {
    this.current = null;
    this.typing = null;
    this.quietSince = this.time;
    this.nextIdle = this.time + Phaser.Math.FloatBetween(...DIALOGUE.idleGap);
    if (this.queued) {
      const q = this.queued;
      this.queued = null;
      const def = DIALOGUES[q.event];
      this.play(q.event, def);
      return;
    }
    this.scene.tweens.add({ targets: this.ui, alpha: 0, duration: 250 });
  }

  // Pula a fala atual (toque na caixa)
  skipLine() {
    if (!this.current) return;
    if (this.typing && this.typing.shown < this.typing.text.length) {
      this.typing.shown = this.typing.text.length;
      this.msgText.setText(this.typing.text);
    } else {
      this.nextLine();
    }
  }

  update(dt) {
    this.time += dt;
    if (this.current) {
      const ty = this.typing;
      if (ty && ty.shown < ty.text.length) {
        ty.acc += dt * DIALOGUE.typeSpeed;
        const n = Math.min(ty.text.length, Math.floor(ty.acc));
        if (n > ty.shown) {
          if (Math.floor(n / 3) !== Math.floor(ty.shown / 3) && ty.text[n - 1] !== ' ') Audio.voice(ty.char, ty.shout);
          ty.shown = n;
          this.msgText.setText(ty.text.slice(0, n));
        }
      }
      this.lineTimer -= dt;
      if (this.lineTimer <= 0) this.nextLine();
      return;
    }
    // Conversa espontânea
    if (this.time >= this.nextIdle) {
      const ctx = this.contextProvider();
      // Mesma frequência de antes; só varia o tipo de conversa (v0.2: + conversa a três)
      const r = Math.random();
      let ev = r < 0.25 ? 'argument' : r < 0.5 ? 'trio' : 'chat';
      if (ctx.chasing) ev = 'police_chase';
      if (!this.trigger(ev, { force: true })) this.nextIdle = this.time + 3;
    }
  }

  // Encerra qualquer conversa (ex.: batida) e esconde a caixa
  stop() {
    this.current = null;
    this.queued = null;
    this.typing = null;
    this.nextIdle = Infinity;
    this.scene.tweens.add({ targets: this.ui, alpha: 0, duration: 150 });
  }

  get busy() { return !!this.current; }

  destroy() { this.ui.destroy(); }
}
