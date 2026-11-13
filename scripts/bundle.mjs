// Inline www/ into one self-contained HTML file: pitch-trainer.html
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const www = join(root, 'www');
let html = readFileSync(join(www, 'index.html'), 'utf8');
const font = readFileSync(join(www, 'fonts', 'nunito-latin.woff2')).toString('base64');
const icon = readFileSync(join(www, 'icon.svg')).toString('base64');
let css = readFileSync(join(www, 'css', 'app.css'), 'utf8')
  .replace('url(../fonts/nunito-latin.woff2)', `url(data:font/woff2;base64,${font})`);

html = html
  .replace('<link rel="icon" href="icon.svg" type="image/svg+xml">', `<link rel="icon" href="data:image/svg+xml;base64,${icon}">`)
  .replace('<link rel="stylesheet" href="css/app.css">', () => `<style>\n${css}\n</style>`)
  .replace(/<script src="(js\/[^"]+)"><\/script>/g, (_, src) => `<script>\n${readFileSync(join(www, src), 'utf8')}\n</script>`);

writeFileSync(join(root, 'pitch-trainer.html'), html);
console.log('wrote pitch-trainer.html', (html.length / 1024).toFixed(0) + ' KB');
