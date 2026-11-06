// Gera os assets do jogo a partir das artes originais (que ficam intactas na raiz).
// Uso: npm i pngjs@7.0.0 jpeg-js@0.4.4 && node tools/process-assets.js
// - Carros: recorta, remove o fundo azul-escuro por flood fill a partir das bordas, reduz 4x.
// - Retratos: recorta o rosto em quadrado e reduz para 160px.
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');
const jpeg = require('jpeg-js');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'assets');

function load(file) {
  const buf = fs.readFileSync(path.join(ROOT, file));
  if (file.endsWith('.png')) {
    const p = PNG.sync.read(buf);
    return { w: p.width, h: p.height, d: p.data };
  }
  const j = jpeg.decode(buf, { useTArray: true, maxMemoryUsageInMB: 1024 });
  return { w: j.width, h: j.height, d: j.data };
}

function crop(img, x, y, w, h) {
  const d = Buffer.alloc(w * h * 4);
  for (let j = 0; j < h; j++) {
    const src = ((y + j) * img.w + x) * 4;
    Buffer.from(img.d.buffer, img.d.byteOffset + src, w * 4).copy(d, j * w * 4);
  }
  return { w, h, d };
}

// Fundo das artes: azul acinzentado escuro (xadrez). Contornos dos carros são quase neutros/pretos.
function isBg(r, g, b) {
  const lum = 0.3 * r + 0.59 * g + 0.11 * b;
  return lum < 120 && b - r >= 10 && b >= g;
}

// Retratos com fundo azul-marinho: exige azul bem saturado, para não apagar cabelo preto
// nem a camiseta escura do Lucas (28,32,41), que passaria no critério dos carros.
function isNavyBg(r, g, b) {
  const lum = 0.3 * r + 0.59 * g + 0.11 * b;
  return lum < 140 && b - r >= 25 && b > g;
}

// Retrato com "transparência falsa": xadrez cinza-claro neutro desenhado na própria imagem.
function isLightCheckerBg(r, g, b) {
  return Math.max(r, g, b) - Math.min(r, g, b) <= 14 && Math.min(r, g, b) >= 165;
}

// Recorte que aceita área fora da imagem (preenchida com transparência)
function cropPad(img, x, y, w, h) {
  const d = Buffer.alloc(w * h * 4);
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const sx = x + i, sy = y + j;
    if (sx < 0 || sy < 0 || sx >= img.w || sy >= img.h) continue;
    img.d.copy(d, (j * w + i) * 4, (sy * img.w + sx) * 4, (sy * img.w + sx) * 4 + 4);
  }
  return { w, h, d };
}

// Remove bolsões de fundo presos entre mechas de cabelo (não alcançados pelo flood fill).
// Só para o fundo azul-marinho, cor que não aparece em pele, cabelo ou roupa dos retratos.
function removeColorEverywhere(img, test) {
  const { d } = img;
  for (let i = 0; i < d.length; i += 4) if (test(d[i], d[i + 1], d[i + 2])) d[i + 3] = 0;
  return img;
}

function removeBg(img, test = isBg) {
  const { w, h, d } = img;
  const seen = new Uint8Array(w * h);
  const stack = [];
  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const i = y * w + x;
    if (seen[i]) return;
    const o = i * 4;
    if (!test(d[o], d[o + 1], d[o + 2])) return;
    seen[i] = 1;
    stack.push(i);
  };
  for (let x = 0; x < w; x++) { push(x, 0); push(x, h - 1); }
  for (let y = 0; y < h; y++) { push(0, y); push(w - 1, y); }
  while (stack.length) {
    const i = stack.pop();
    const x = i % w, y = (i / w) | 0;
    d[i * 4 + 3] = 0;
    push(x + 1, y); push(x - 1, y); push(x, y + 1); push(x, y - 1);
  }
  // Remove ilhas pequenas de fundo cercadas por fundo removido (ruído) — 1 passada de erosão de alfa isolado
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    const i = y * w + x;
    if (d[i * 4 + 3] === 0) continue;
    let n = 0;
    for (const k of [i - 1, i + 1, i - w, i + w]) if (d[k * 4 + 3] === 0) n++;
    if (n >= 3) d[i * 4 + 3] = 0;
  }
  return img;
}

function trim(img, pad = 2) {
  const { w, h, d } = img;
  let x0 = w, y0 = h, x1 = -1, y1 = -1;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (d[(y * w + x) * 4 + 3] > 0) {
      if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
    }
  }
  x0 = Math.max(0, x0 - pad); y0 = Math.max(0, y0 - pad);
  x1 = Math.min(w - 1, x1 + pad); y1 = Math.min(h - 1, y1 + pad);
  return crop(img, x0, y0, x1 - x0 + 1, y1 - y0 + 1);
}

// Redução por média de área com alfa pré-multiplicado
function downscale(img, f) {
  const w = Math.floor(img.w / f), h = Math.floor(img.h / f);
  const d = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let r = 0, g = 0, b = 0, a = 0, n = 0;
    for (let j = 0; j < f; j++) for (let i = 0; i < f; i++) {
      const o = ((y * f + j) * img.w + (x * f + i)) * 4;
      const al = img.d[o + 3];
      r += img.d[o] * al; g += img.d[o + 1] * al; b += img.d[o + 2] * al; a += al; n++;
    }
    const o = (y * w + x) * 4;
    if (a > 0) { d[o] = r / a; d[o + 1] = g / a; d[o + 2] = b / a; }
    d[o + 3] = a / n;
  }
  return { w, h, d };
}

// As artes de cima mostram os carros com a frente para baixo; o jogo precisa da frente para cima.
function rotate180(img) {
  const d = Buffer.alloc(img.d.length);
  const n = img.w * img.h;
  for (let i = 0; i < n; i++) img.d.copy(d, (n - 1 - i) * 4, i * 4, i * 4 + 4);
  return { w: img.w, h: img.h, d };
}

function save(img, rel) {
  const file = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const p = new PNG({ width: img.w, height: img.h });
  img.d.copy(p.data);
  fs.writeFileSync(file, PNG.sync.write(p));
  console.log(rel, img.w + 'x' + img.h);
}

const GOL_BOX = [200, 180, 500, 840];
const golMasked = removeBg(crop(load('gol_vista_superior.png'), ...GOL_BOX));
save(rotate180(downscale(trim(golMasked), 4)), 'cars/gol_top.png');
save(rotate180(downscale(trim(removeBg(crop(load('peugeot_prata.png'), 200, 140, 500, 900))), 4)), 'cars/peugeot_top.png');
// A viatura é preta (o color key apagaria a carroceria), mas tem exatamente a mesma silhueta
// e posição do Gol na arte original — então reaproveitamos a máscara do Gol.
const police = crop(load('policia.jpeg'), ...GOL_BOX);
for (let i = 3; i < police.d.length; i += 4) police.d[i] = golMasked.d[i];
save(rotate180(downscale(trim(police), 4)), 'cars/police_top.png');
save(downscale(trim(removeBg(crop(load('gol_frente.png'), 140, 120, 880, 680))), 2), 'cars/gol_front.png');

// Retratos: 1) recorta dentro da moldura e acima da etiqueta "SUBJECT - PROFILE";
// 2) remove o fundo (flood fill a partir das bordas); 3) enquadra a cabeça inteira num
// quadrado (cabelo, boné, queixo/cavanhaque), com transparência onde falta imagem.
const portraits = [
  // arquivo, saída, área útil [x,y,w,h], critério de fundo, remover bolsões, quadrado final [x,y,lado]
  ['joao.png', 'characters/joao.png', [14, 14, 660, 1440], isNavyBg, true, [-156, 290, 1000]],
  ['selva.png', 'characters/selva.png', [14, 14, 660, 1430], isLightCheckerBg, false, [-126, 300, 940]],
  ['lucas.png', 'characters/lucas.png', [14, 14, 1128, 840], isNavyBg, true, [180, 20, 780]],
];
for (const [src, dst, [ax, ay, aw, ah], test, pockets, [sx, sy, side]] of portraits) {
  const area = removeBg(crop(load(src), ax, ay, aw, ah), test);
  if (pockets) removeColorEverywhere(area, test);
  const sq = cropPad(area, sx - ax, sy - ay, side, side);
  save(downscale(sq, Math.floor(side / 160)), dst);
}

// Ícone da aba (evita o 404 de /favicon.ico): o Gol visto de cima, 64x64
const icon = downscale(trim(golMasked), 2);
const iconSq = cropPad(rotate180(icon), Math.round((icon.w - icon.h) / 2), 0, icon.h, icon.h);
save(downscale(iconSq, Math.floor(icon.h / 64)), 'ui/favicon.png');

save(downscale(crop(load('gol_destruido.png'), 40, 250, 816, 720), 2), 'ui/gol_wasted.png');

// ---- Ícones do PWA (v0.2): Gol original (alta resolução, sem fundo) sobre um trecho de estrada
function iconCanvas(size, roadFrac) {
  const d = Buffer.alloc(size * size * 4);
  const put = (x, y, w, h, [r, g, b]) => {
    for (let j = Math.max(0, y); j < Math.min(size, y + h); j++) for (let i = Math.max(0, x); i < Math.min(size, x + w); i++) {
      const o = (j * size + i) * 4; d[o] = r; d[o + 1] = g; d[o + 2] = b; d[o + 3] = 255;
    }
  };
  put(0, 0, size, size, [0x1f, 0x4d, 0x2b]);                  // mato
  const rw = Math.round(size * roadFrac), rx = Math.round((size - rw) / 2);
  put(rx, 0, rw, size, [0x34, 0x37, 0x3d]);                   // asfalto
  const line = Math.max(2, Math.round(size / 64));
  put(rx + line, 0, line, size, [0xf2, 0xf2, 0xf2]);          // bordas
  put(rx + rw - 2 * line, 0, line, size, [0xf2, 0xf2, 0xf2]);
  return { w: size, h: size, d };
}
function paste(dst, src, cx, cy) {
  const x0 = Math.round(cx - src.w / 2), y0 = Math.round(cy - src.h / 2);
  for (let j = 0; j < src.h; j++) for (let i = 0; i < src.w; i++) {
    const x = x0 + i, y = y0 + j;
    if (x < 0 || y < 0 || x >= dst.w || y >= dst.h) continue;
    const s = (j * src.w + i) * 4, o = (y * dst.w + x) * 4, a = src.d[s + 3] / 255;
    for (let c = 0; c < 3; c++) dst.d[o + c] = Math.round(dst.d[o + c] * (1 - a) + src.d[s + c] * a);
  }
  return dst;
}
const golHi = rotate180(trim(golMasked)); // ~470x800, frente para cima
function makeIcon(size, carMaxH, roadFrac) {
  const car = downscale(golHi, Math.ceil(golHi.h / carMaxH));
  return paste(iconCanvas(size, roadFrac), car, size / 2, size / 2);
}
save(makeIcon(192, 160, 0.62), 'icons/icon-192.png');
save(makeIcon(512, 420, 0.62), 'icons/icon-512.png');
save(makeIcon(512, 300, 0.5), 'icons/icon-maskable-512.png'); // conteúdo dentro da zona segura (80%)
save(makeIcon(180, 150, 0.62), 'icons/apple-touch-icon.png'); // opaco: o iOS não aceita transparência

// ---- Game Over sem os textos da arte (v0.2.1): "RETRY? [Y/N]" (topo) e etiqueta "GAME OVER - TELA DE FIM" (base).
// O original gol_destruido.png NÃO é alterado; gera assets/ui/gol_destruido_limpo.png no mesmo tamanho (896x1195).
// O xadrez do fundo é regular na horizontal (período de 20 px), então cada pixel coberto por texto recebe
// o pixel da MESMA linha numa faixa limpa da margem, deslocado por múltiplo de 20 px. Isso mantém a
// moldura (linhas horizontais) e o alinhamento do xadrez.
function fillFromBand(img, [x0, y0, x1, y1], [bx0, bw]) {
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const sx = bx0 + (((x - bx0) % bw) + bw) % bw;
    img.d.copy(img.d, (y * img.w + x) * 4, (y * img.w + sx) * 4, (y * img.w + sx) * 4 + 4);
  }
}
const wreck = load('gol_destruido.png');
fillFromBand(wreck, [100, 105, 796, 214], [840, 40]);   // título vermelho (bbox x112-783, y115-203); fonte: margem direita limpa, depois da rachadura
fillFromBand(wreck, [190, 1138, 712, 1194], [40, 140]); // etiqueta da base, inclusive o trecho sobre a moldura
save(wreck, 'ui/gol_destruido_limpo.png');
