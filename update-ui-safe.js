const fs = require('fs');
const path = require('path');

const targetDir = 'c:\\Users\\Admin\\Downloads\\likefood\\src\\app\\(shop)';
const exactPaddingClass = "w-full px-4 sm:px-6 lg:px-[6%] mx-auto";

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if(file.endsWith('.tsx') || file.endsWith('.ts')) results.push(file);
        }
    });
    return results;
}

const files = walk(targetDir);

files.forEach(file => {
    // Skip homepage, it was explicitly excluded!
    if(file === targetDir.replace(/\\/g, '/') + '/page.tsx') {
        console.log("Skipping homepage: " + file);
        return;
    }

    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // 1. Force white background: Replacement rules mapping
    content = content.replace(/bg-slate-50\/50/g, 'bg-white');
    content = content.replace(/bg-slate-50\/80/g, 'bg-white');
    content = content.replace(/bg-slate-50(?![A-Za-z0-9\-\/])/g, 'bg-white');
    content = content.replace(/bg-gray-50(?![A-Za-z0-9\-\/])/g, 'bg-white');
    content = content.replace(/bg-zinc-50(?![A-Za-z0-9\-\/])/g, 'bg-white');
    content = content.replace(/bg-\[\#F8F9FA\]/g, 'bg-white');

    // Remove any inline generic fonts like font-sans, font-serif so it inherits from global
    content = content.replace(/\bfont-sans\b/g, '');
    content = content.replace(/\bfont-serif\b/g, '');
    // Clean horizontal spaces cleanly, without capturing newlines
    content = content.replace(/[ \t]+/g, ' ');

    // 2. Synchronize Layout Alignment
    const layoutRegex = /max-w-(7xl|screen-xl|6xl|5xl|screen-lg)\s+mx-auto\s+(px-\d)?\s*(sm:px-\d)?\s*(lg:px-\d)?\s*(md:px-\d)?/g;
    content = content.replace(layoutRegex, exactPaddingClass);

    const layoutRegex2 = /\bcontainer\s+mx-auto\s+px-\d+\b/g;
    content = content.replace(layoutRegex2, exactPaddingClass);

    // 3. Button colors targeting
    content = content.replace(/bg-emerald-600 hover:bg-emerald-700 text-white/g, "bg-[#DFF0E0] hover:bg-[#cbe8ce] text-emerald-900 font-bold");
    content = content.replace(/bg-emerald-500 hover:bg-emerald-600 text-white/g, "bg-[#DFF0E0] hover:bg-[#cbe8ce] text-emerald-900 font-bold");
    content = content.replace(/bg-slate-900 text-white hover:bg-slate-800/g, "bg-[#DFF0E0] text-emerald-900 hover:bg-[#cbe8ce] font-bold");
    content = content.replace(/bg-primary text-primary-foreground hover:bg-primary\/90/g, "bg-[#DFF0E0] hover:bg-[#cbe8ce] text-emerald-900 font-bold border border-emerald-200");

    if (original !== content) {
        fs.writeFileSync(file, content);
        console.log("Updated: " + file);
    }
});
