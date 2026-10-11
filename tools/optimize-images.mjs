#!/usr/bin/env node
/*
 * optimize-images.mjs — reescala y recomprime las imágenes (.avif) del sitio a
 * la caja (lado mayor) que realmente se muestra, a alta fidelidad, y convierte
 * los PNG de clientes a .avif. Usa ffmpeg (muxer avif + libsvtav1 / libaom-av1);
 * nunca hace upscale.
 *
 * Idempotente: guarda el sha1 de cada archivo ya procesado en
 * tools/.img-manifest.json y salta lo que no ha cambiado. Usa --force para
 * rehacerlo todo.
 *
 *   node tools/optimize-images.mjs            # solo lo pendiente
 *   node tools/optimize-images.mjs --force    # rehacer todo
 *
 * Los cambios de extensión (PNG → AVIF) y de referencias en el HTML se hacen
 * aparte; este tool solo genera/actualiza los archivos de imagen.
 */
import { readFileSync, writeFileSync, existsSync, statSync, renameSync, rmSync, globSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { dirname } from 'node:path';

const MANIFEST = 'tools/.img-manifest.json';
const FORCE = process.argv.includes('--force');

/* Caja (lado mayor) + CRF por grupo. CRF bajo = más fidelidad. */
const TARGETS = [
  { glob: 'assets/img/clients/*.avif',            max: 160,  crf: 20 },
  { glob: 'assets/img/meCity.avif',               max: 1280, crf: 20 },
  { glob: 'assets/img/me.avif',                   max: 800,  crf: 20 },
  { glob: 'assets/img/me3.avif',                  max: 800,  crf: 20 },
  { glob: 'assets/img/blog.avif',                 max: 1400, crf: 20 },
  { glob: 'assets/img/blog/**/*-top.avif',        max: 1280, crf: 20 },
  { glob: 'assets/img/blog/**/*-thumbnail.avif',  max: 800,  crf: 22 }
];

/* PNG de clientes → AVIF (mismo nombre, extensión .avif). */
const PNGS = [
  { src: 'assets/img/clients/fedecajas.png',       max: 160, crf: 20 },
  { src: 'assets/img/clients/gustavo-ramirez.png', max: 160, crf: 20 },
  { src: 'assets/img/clients/vive-sas.png',        max: 160, crf: 20 }
];

const sha1 = (buf) => createHash('sha1').update(buf).digest('hex');
const kb = (n) => (n / 1024).toFixed(0) + 'K';

function probe(file) {
  const out = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0',
    '-show_entries', 'stream=width,height,pix_fmt', '-of', 'csv=p=0', file], { encoding: 'utf8' });
  const [w, h, pix] = out.trim().split(',').map((s) => s.trim());
  return { w: Number(w), h: Number(h), pix: pix || 'yuv420p' };
}

function encode(inFile, outFile, max, crf) {
  const { pix } = probe(inFile);
  const hasAlpha = /a$/.test(pix) || pix.includes('rgba') || pix.includes('yuva');
  const scale = `scale=w='min(${max},iw)':h='min(${max},ih)':force_original_aspect_ratio=decrease:force_divisible_by=2:flags=lanczos`;
  let args;
  if (hasAlpha) {
    /* El ffmpeg de este entorno no preserva alfa en AVIF (sale yuv420p y el
       fondo transparente se vuelve negro). Se aplana sobre el color de la
       tarjeta (marfil #F4F4F0), que es el fondo de .client-logo. */
    args = ['-y', '-v', 'error', '-f', 'lavfi', '-i', `color=c=0xF4F4F0:s=${max}x${max}`, '-i', inFile,
      '-filter_complex', `[1:v]${scale}[fg];[0:v][fg]overlay=(W-w)/2:(H-h)/2:format=auto,format=yuv420p[out]`,
      '-map', '[out]', '-frames:v', '1', '-c:v', 'libsvtav1', '-crf', String(crf), '-preset', '6', '-svtav1-params', 'avif=1'];
  } else {
    args = ['-y', '-v', 'error', '-i', inFile, '-vf', scale, '-frames:v', '1',
      '-c:v', 'libsvtav1', '-crf', String(crf), '-preset', '6', '-pix_fmt', 'yuv420p', '-svtav1-params', 'avif=1'];
  }
  args.push('-f', 'avif', outFile);
  try { execFileSync('ffmpeg', args, { stdio: ['ignore', 'ignore', 'pipe'] }); }
  catch (e) { throw new Error('ffmpeg falló para ' + inFile + '\n' + (e.stderr ? e.stderr.toString() : e.message)); }
}

const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : {};
let savedBefore = 0, savedAfter = 0, changed = 0, skipped = 0;

function commit(file, before, after) {
  savedBefore += before; savedAfter += after; changed++;
  manifest[file] = sha1(readFileSync(file));
  console.log(`  ${file}  ${kb(before)} → ${kb(after)}`);
}

/* 1) AVIF: reescalar + recomprimir si está por encima de la caja. */
const files = [...new Set(TARGETS.flatMap((t) => globSync(t.glob)))].sort();
for (const file of files) {
  if (!existsSync(file)) continue;
  const t = TARGETS.find((x) => globSync(x.glob).includes(file));
  const before = statSync(file).size;
  const { w, h, pix } = probe(file);
  const tooBig = Math.max(w, h) > t.max;
  const hash = sha1(readFileSync(file));
  if (!FORCE && manifest[file] === hash) { skipped++; continue; }

  const tmp = file + '.tmp.avif';
  encode(file, tmp, t.max, t.crf);
  const after = statSync(tmp).size;
  if (tooBig || after < before) {
    if (before === after) { rmSync(tmp); skipped++; continue; }
    renameSync(tmp, file);
    commit(file, before, after);
  } else {
    rmSync(tmp);
    manifest[file] = hash;           // ya está bien; no reintentar
    skipped++;
  }
}

/* 2) PNG → AVIF (genera el .avif; las refs del HTML se actualizan aparte). */
for (const { src, max, crf } of PNGS) {
  const out = src.replace(/\.png$/, '.avif');
  if (!existsSync(src)) { skipped++; continue; }
  if (!FORCE && existsSync(out) && manifest[out] === sha1(readFileSync(out))) { skipped++; continue; }
  const before = statSync(src).size;
  const tmp = out + '.tmp.avif';
  encode(src, tmp, max, crf);
  const after = statSync(tmp).size;
  renameSync(tmp, out);
  savedBefore += before; savedAfter += after; changed++;
  manifest[out] = sha1(readFileSync(out));
  console.log(`  ${src} → ${out}  ${kb(before)} → ${kb(after)}`);
}

mkdirSync(dirname(MANIFEST), { recursive: true });
writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');

console.log(`\noptimize-images: ${changed} actualizadas, ${skipped} sin cambios.`);
if (changed) console.log(`  ahorro medido en ${changed} archivos: ${kb(savedBefore - savedAfter)} (${kb(savedBefore)} → ${kb(savedAfter)})`);
