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

walkDir(shopDir, (filePath) => {
    // skip homepage
    if (filePath === path.join(shopDir, 'page.tsx') || filePath === path.join(shopDir, 'layout.tsx')) return;
    
    // skip if not tsx
    if (!filePath.endsWith('.tsx')) return;

    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Background fixes
    content = content.replace(/bg-gradient-to-r from-primary\/90 via-primary to-teal-500/g, 'bg-white border-b border-slate-100');
    content = content.replace(/bg-gradient-to-r from-red-500 to-rose-600/g, 'bg-slate-100 border border-slate-200');
    content = content.replace(/bg-gradient-to-br from-slate-50 to-slate-100/g, 'bg-white');

    // Remove any text-white occurrences carefully
    content = content.replace(/text-white\/40/g, 'text-slate-500');
    content = content.replace(/text-white\/60/g, 'text-slate-500');
    content = content.replace(/text-white\/70/g, 'text-slate-600');
    content = content.replace(/text-white\/80/g, 'text-slate-700');
    content = content.replace(/text-white\/30/g, 'text-slate-400');
    content = content.replace(/text-white\/20/g, 'text-slate-300');
    content = content.replace(/text-white\/10/g, 'text-slate-200');
    content = content.replace(/text-white\/25/g, 'text-slate-400');
    content = content.replace(/text-white\/50/g, 'text-slate-400');
    content = content.replace(/text-white/g, 'text-slate-900');

    // Background fixes for elements that were meant to be dark/translucent on colorful backgrounds
    content = content.replace(/bg-white\/10/g, 'bg-white border-slate-200 border');
    content = content.replace(/bg-white\/20/g, 'bg-white border-slate-200 border');
    content = content.replace(/bg-white\/5/g, 'bg-slate-50');
    
    // Convert text-emerald-100 to dark since background is now white
    content = content.replace(/text-emerald-100/g, 'text-slate-800');
    content = content.replace(/text-emerald-200\/80/g, 'text-slate-600');

    // Clean up backdrop blurs which make no sense on white
    content = content.replace(/backdrop-blur-sm/g, '');
    content = content.replace(/backdrop-blur-md/g, '');
    content = content.replace(/backdrop-blur-xl/g, '');

    if (content !== original) {
        fs.writeFileSync(filePath, content);
        console.log("Updated: " + filePath);
    }
});
