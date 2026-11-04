const fs = require('fs');
const css = fs.readFileSync('css/memory.css', 'utf8');

const regex = /(\.trip-header-art|\.trip-coastal-badge)\s*\{[^}]*\}/g;
let m;
while ((m = regex.exec(css)) !== null) {
    console.log(m[0]);
}
