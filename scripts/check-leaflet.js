const fs = require('fs');
const js = fs.readFileSync('./assets/leaflet/leaflet.js', 'utf8');
const css = fs.readFileSync('./assets/leaflet/leaflet.min.css', 'utf8');
const jsBt = (js.match(/`/g) || []).length;
const jsDollar = (js.match(/\$\{/g) || []).length;
const cssBt = (css.match(/`/g) || []).length;
console.log('JS backticks:', jsBt, '| JS template expressions:', jsDollar, '| CSS backticks:', cssBt);
