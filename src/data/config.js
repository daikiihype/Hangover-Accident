// Todos os números de calibragem do jogo ficam aqui. Ajuste durante os testes.

export const GAME_W = 540;
export const GAME_H = 960;

export const ROAD = {
  lanes: 4,
  laneW: 96,
  get width() { return this.lanes * this.laneW; },
  get left() { return (GAME_W - this.width) / 2; },
  get right() { return this.left + this.width; },
  laneCenter(i) { return this.left + this.laneW * (i + 0.5); },
};

export const PLAYER = {
  y: 770,
  scale: 0.55,          // escala do sprite do Gol (118x199 → ~65x109)
  dragGain: 1.25,       // quanto o carro anda por pixel arrastado
  follow: 14,           // suavização (maior = mais grudado no dedo)
  keySpeed: 560,        // px/s com teclado (teste no PC)
  maxTilt: 14,          // graus
  hitbox: { w: 0.74, h: 0.86 },
};

export const SPEED = {
  start: 420,           // px/s da estrada
  max: 1450,
  accel: 7,             // px/s ganhos por segundo de jogo
  kmhPerPx: 0.16,       // px/s → km/h no velocímetro
};

// Estágios de dificuldade (tempo em segundos de partida)
export const STAGES = [
  { id: 'inicial', label: 'TRÂNSITO TRANQUILO', at: 0, spawn: [1.05, 1.6], carSpeed: [0.45, 0.65], truck: 0.04, peugeot: 0.55, maxPerRow: 1 },
  { id: 'intermediario', label: 'TÁ CHEGANDO PEUGEOT', at: 25, spawn: [0.75, 1.2], carSpeed: [0.35, 0.65], truck: 0.1, peugeot: 0.65, maxPerRow: 2 },
  { id: 'avancado', label: 'BR LOTADA', at: 55, spawn: [0.55, 0.9], carSpeed: [0.3, 0.7], truck: 0.14, peugeot: 0.65, maxPerRow: 2 },
  { id: 'perseguicao', label: 'PERSEGUIÇÃO', at: 90, spawn: [0.5, 0.8], carSpeed: [0.3, 0.7], truck: 0.14, peugeot: 0.7, maxPerRow: 3 },
  { id: 'caos', label: 'CAOS ABSOLUTO', at: 140, spawn: [0.38, 0.62], carSpeed: [0.25, 0.75], truck: 0.18, peugeot: 0.75, maxPerRow: 3 },
];

export const TRAFFIC = {
  spawnY: -140,
  minLaneGap: 260,      // distância mínima entre veículos na mesma faixa ao surgir
  rowWindow: 230,       // veículos dentro dessa faixa vertical contam como "mesma fileira"
  nearMissDist: 22,     // folga horizontal (entre hitboxes) que conta como near miss
  // Comboio na mesma faixa (velocidade desejada x efetiva)
  followDist: 70,       // a essa distância do veículo da frente, passa a acompanhá-lo
  safeGap: 30,          // abaixo disso, desacelera um pouco mais para abrir espaço
  openUpSpeed: 40,      // px/s a menos que o da frente para reabrir a distância
  minGap: 12,           // distância mínima absoluta (trava anti-sobreposição)
  brakeRate: 8,         // resposta da frenagem (1/s)
  accelRate: 1.2,       // resposta da retomada até a velocidade desejada (1/s)
  carScale: 0.55,
  truckScale: 2,
  otherCarTints: [0x6fa8ff, 0xffe066, 0x8ef08e, 0xff9f5a, 0xffffff, 0xc89bff],
};

export const SCORE = {
  perMeter: 1,
  nearMiss: 100,
  multiplierMax: 5,
  multiplierDecay: 4.5,  // segundos sem near miss até o multiplicador cair 1
  survivalPerSec: 5,
};

export const POLICE = {
  firstStage: 'perseguicao',
  chaseDuration: 28,     // segundos para despistar
  cooldown: [35, 20],    // pausa entre perseguições [normal, caos]
  startHeat: 25,
  heatRise: 2.6,         // por segundo
  heatNearMiss: 9,       // direção arriscada chama atenção
  heatCalmAfter: 3,      // segundos sem near miss para a pressão aliviar
  criticalHeat: 90,      // acima disso: reação de pressão crítica
  heatCalm: 4.0,         // alívio por segundo, quando dirigindo "limpo" (subtraído da subida)
  offscreenY: 1100,      // fora da tela (chegada/saída)
  baseY: 930,            // pressão 0: viatura aparecendo no pé da tela
};

export const DIALOGUE = {
  idleGap: [9, 16],      // intervalo para conversas espontâneas
  minGap: 2.2,           // respiro mínimo entre conversas
  typeSpeed: 48,         // caracteres por segundo
  holdBase: 0.9,
  holdPerChar: 0.028,
};
