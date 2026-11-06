// localStorage pode falhar (aba anônima, armazenamento bloqueado): o jogo nunca depende dele.
const PREFIX = 'hangover-accident:';

export function load(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function save(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* sem persistência, segue o jogo */
  }
}

export const settings = Object.assign({ music: 0.7, sfx: 0.8, voices: 0.8 }, load('settings', {}));
export function saveSettings() { save('settings', settings); }

// Contador de partidas no aparelho (easter egg da 10ª partida)
export function countRun() {
  const n = load('runs', 0) + 1;
  save('runs', n);
  return n;
}

export function getHighScore() { return load('highscore', { score: 0, distance: 0 }); }
export function setHighScore(hs) { save('highscore', hs); }
