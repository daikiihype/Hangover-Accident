// Service Worker do Hangover Accident.
// Estratégia: REDE PRIMEIRO, cache como reserva.
// - Online: sempre a versão mais nova (e o cache é atualizado de carona).
// - Offline: tudo que foi pré-carregado na instalação continua funcionando.
// Ao publicar uma versão nova, troque CACHE para forçar a limpeza do cache antigo.
const CACHE = 'hangover-accident-v0.2.2';

const PRECACHE = [
  './',
  'index.html',
  'manifest.json',
  'styles/style.css',
  'vendor/phaser.min.js',
  'src/main.js',
  'src/data/config.js',
  'src/data/dialogues.js',
  'src/entities/Player.js',
  'src/entities/Police.js',
  'src/entities/Traffic.js',
  'src/scenes/BootScene.js',
  'src/scenes/GameOverScene.js',
  'src/scenes/GameScene.js',
  'src/scenes/MenuScene.js',
  'src/systems/AudioSystem.js',
  'src/systems/DialogueSystem.js',
  'src/systems/DifficultySystem.js',
  'src/systems/ScoreSystem.js',
  'src/ui/Button.js',
  'src/utils/storage.js',
  'assets/cars/gol_top.png',
  'assets/cars/peugeot_top.png',
  'assets/cars/police_top.png',
  'assets/cars/gol_front.png',
  'assets/characters/joao.png',
  'assets/characters/selva.png',
  'assets/characters/lucas.png',
  'assets/fonts/press-start-2p-latin-400.woff2',
  'assets/ui/favicon.png',
  'assets/icons/icon-192.png',
  'assets/icons/icon-512.png',
  'assets/icons/icon-maskable-512.png',
  'assets/icons/apple-touch-icon.png',
  'assets/ui/gol_destruido_limpo.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(PRECACHE.map((u) => new Request(u, { cache: 'reload' }))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req, { ignoreSearch: true })
        .then((hit) => hit || (req.mode === 'navigate' ? caches.match('index.html') : Response.error()))),
  );
});
