// Inline www/ into one self-contained HTML file: pitch-trainer.html
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const www = join(root, 'www');
let html = readFileSync(join(www, 'index.html'), 'utf8');
const font = readFileSync(join(www, 'fonts', 'nunito-latin.woff2')).toString('base64');
const icon = readFileSync(join(www, 'icon.svg')).toString('base64');
let css = readFileSync(join(www, 'css', 'app.css'), 'utf8')
  .replace('url(../fonts/nunito-latin.woff2)', `url(data:font/woff2;base64,${font})`);

// embed instrument samples so the single file works offline (file://)
const samples = {};
for (const inst of readdirSync(join(www, 'samples'))) {
  samples[inst] = {};
  for (const f of readdirSync(join(www, 'samples', inst))) samples[inst][f.replace('.mp3', '')] = readFileSync(join(www, 'samples', inst, f)).toString('base64');
}
const sampleTag = `<script>window.PT_SAMPLES=${JSON.stringify(samples)};</script>\n`;

html = html
  .replace('<link rel="icon" href="icon.svg" type="image/svg+xml">', `<link rel="icon" href="data:image/svg+xml;base64,${icon}">`)
  .replace('<link rel="stylesheet" href="css/app.css">', () => `<style>\n${css}\n</style>`)
  .replace(/<script src="(js\/[^"]+)"><\/script>/g, (_, src) => (src === 'js/audio.js' ? sampleTag : '') + `<script>\n${readFileSync(join(www, src), 'utf8')}\n</script>`);

writeFileSync(join(root, 'pitch-trainer.html'), html);
console.log('wrote pitch-trainer.html', (html.length / 1024 / 1024).toFixed(1) + ' MB');

// claude.ai Artifact version: the publisher adds its own document shell (doctype, head, charset, viewport),
// so the page starts with its <title> and leaves out the outer tags.
import { mkdirSync } from 'node:fs';
const art = html
  .replace(/<!doctype html>\s*/i, '')
  .replace(/<html[^>]*>\s*/i, '').replace(/<\/html>\s*/i, '')
  .replace(/<head>\s*/i, '').replace(/<\/head>\s*/i, '')
  .replace(/<body>\s*/i, '').replace(/<\/body>\s*/i, '')
  .replace(/\s*<meta charset="utf-8">/i, '')
  .replace(/\s*<meta name="viewport"[^>]*>/i, '')
  .replace(/\s*<title>Pitch Trainer<\/title>/, '');
mkdirSync(join(root, 'build'), { recursive: true });
writeFileSync(join(root, 'build', 'pitch-trainer.html'), '<title>Pitch Trainer</title>\n' + art.trimStart());
console.log('wrote build/pitch-trainer.html (artifact version)');
