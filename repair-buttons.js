const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            walkDir(dirPath, callback);
        } else {
            callback(dirPath);
        }
    });
}

const shopDir = path.join('src', 'app', '(shop)');
let fixedCount = 0;

walkDir(shopDir, (filePath) => {
    if (!filePath.endsWith('.tsx')) return;
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    content = content.replace(/bg-(slate|gray|zinc|neutral|stone)-900 text-slate-900/g, 'bg--900 text-white');
    content = content.replace(/bg-(red|emerald|green|blue|indigo|purple|rose|cyan|teal)-([56789]00) text-slate-900/g, 'bg-- text-white');
    content = content.replace(/text-slate-900 bg-(slate|gray|zinc|neutral|stone)-900/g, 'text-white bg--900');
    content = content.replace(/text-slate-900 bg-(red|emerald|green|blue|indigo|purple|rose|cyan|teal)-([56789]00)/g, 'text-white bg--');
    
    // Also fix hover states that invert colors badly
    content = content.replace(/hover:bg-slate-900 hover:text-slate-900/g, 'hover:bg-slate-900 hover:text-white');

    // Restore text-white for buttons or badges that explicitly had text-white previously and are now broken
    // But since it's hard to distinguish, repairing the known explicit backgrounds is best.
    
    if (content !== original) {
        fs.writeFileSync(filePath, content);
        fixedCount++;
        console.log("Repaired: " + filePath);
    }
});
console.log("Repaired " + fixedCount + " files.");
