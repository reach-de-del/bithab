// Run after `expo export --platform web`: makes dist/ installable on iPhone ("Add to Home Screen") and offline-capable.
const fs = require('fs');
const path = require('path');

const dist = path.join(__dirname, '..', 'dist');
const indexPath = path.join(dist, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

const head = `
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="theme-color" content="#121212" />
    <meta name="color-scheme" content="dark" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black" />
    <meta name="apple-mobile-web-app-title" content="Habit Quest" />
    <meta name="description" content="Gamified habit tracker with XP, levels and an AI coach." />
    <link rel="apple-touch-icon" sizes="180x180" href="apple-touch-icon.png" />
    <link rel="icon" type="image/png" sizes="32x32" href="favicon-32.png" />
    <link rel="manifest" href="manifest.json" />
    <style>html,body{background:#121212;overscroll-behavior:none}</style>`;

// Drop Expo's own viewport tag (ours adds viewport-fit=cover) and any existing title, then inject.
html = html.replace(/<meta name="viewport"[^>]*>/i, '');
html = html.replace(/<meta name="theme-color"[^>]*>/gi, '');
html = html.replace(/<title>[^<]*<\/title>/i, '');
html = html.replace('</head>', `${head}\n    <title>Habit Quest</title>\n  </head>`);

const register = `<script>if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('sw.js').catch(function(){})})}</script>`;
html = html.replace('</body>', `${register}\n</body>`);
fs.writeFileSync(indexPath, html);

const sw = fs.readFileSync(path.join(__dirname, 'sw.template.js'), 'utf8').replace('__VERSION__', String(Date.now()));
fs.writeFileSync(path.join(dist, 'sw.js'), sw);

// GitHub Pages must not run Jekyll (it would hide the _expo folder).
fs.writeFileSync(path.join(dist, '.nojekyll'), '');
console.log('postbuild-web: dist/ is ready');
