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
    // Actually replacing font-sans | font-serif if any
    content = content.replace(/\bfont-sans\b/g, '');
    content = content.replace(/\bfont-serif\b/g, '');
    // clean up double spaces from replacements
    content = content.replace(/ \s+/g, ' ');

    // 2. Synchronize Layout Alignment
    // Common alignments found: max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
    // Another: max-w-screen-xl mx-auto px-4
    // We will replace them with exactPaddingClass
    // Doing standard regex for container classes
    const layoutRegex = /max-w-(7xl|screen-xl|6xl|5xl|screen-lg)\s*mx-auto\s*(px-\d)?\s*(sm:px-\d)?\s*(lg:px-\d)?\s*(md:px-\d)?/g;
    content = content.replace(layoutRegex, exactPaddingClass);

    // Another variant without max-w
    const layoutRegex2 = /\bcontainer\s*mx-auto\s*px-\d+\b/g;
    content = content.replace(layoutRegex2, exactPaddingClass);

    // 3. Button colors targeting
    // The user wants "màu chủ đạo của các nút là màu footer". 
    // Wait, replacing all bg-emerald-500, bg-blue-500, bg-slate-900 to footer colors via a blanket regex is dangerous, it might wreck specific states. I'll just change common primary buttons.
    // Usually buttons use bg-primary, bg-emerald-600, or bg-slate-900.
    // Secondary use bg-emerald-100/50 text-emerald-600.
    // Footer color is bg-[#DFF0E0] with text-emerald-900.
    
    // Change bg-emerald-600 -> bg-[#DFF0E0] text-emerald-900 hover:bg-[#cbe8ce]
    content = content.replace(/bg-emerald-600 hover:bg-emerald-700 text-white/g, "bg-[#DFF0E0] hover:bg-[#cbe8ce] text-emerald-900 font-bold");
    content = content.replace(/bg-emerald-500 hover:bg-emerald-600 text-white/g, "bg-[#DFF0E0] hover:bg-[#cbe8ce] text-emerald-900 font-bold");
    content = content.replace(/bg-slate-900 text-white hover:bg-slate-800/g, "bg-[#DFF0E0] text-emerald-900 hover:bg-[#cbe8ce] font-bold");
    content = content.replace(/bg-primary text-primary-foreground hover:bg-primary\/90/g, "bg-[#DFF0E0] text-emerald-900 hover:bg-[#cbe8ce] font-bold border border-emerald-200");
    

    if (original !== content) {
        fs.writeFileSync(file, content);
        console.log("Updated: " + file);
    }
});
