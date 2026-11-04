const fs = require('fs');

['index.html', 'js/memory.js'].forEach(file => {
    const lines = fs.readFileSync(file, 'utf8').split('\n');
    lines.forEach((l, i) => {
        if (l.includes('overflow') || l.includes('scroll')) {
            console.log(`${file} L${i+1}: ${l.trim()}`);
        }
    });
});
