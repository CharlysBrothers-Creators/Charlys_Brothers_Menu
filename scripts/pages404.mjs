import { copyFileSync } from 'node:fs';

copyFileSync('dist/index.html', 'dist/404.html');
console.log('GitHub Pages: 404.html generado correctamente.');
