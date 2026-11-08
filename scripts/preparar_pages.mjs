import { copyFileSync, existsSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const salida = resolve(import.meta.dirname, '..', 'dist-pages');
const indice = resolve(salida, 'index.html');

if (!existsSync(indice)) {
  console.error(`No existe ${indice}. Ejecutá primero el build en modo pages.`);
  process.exit(1);
}

copyFileSync(indice, resolve(salida, '404.html'));
writeFileSync(resolve(salida, '.nojekyll'), '');
console.log('GitHub Pages preparado: 404.html y .nojekyll creados en dist-pages/.');
