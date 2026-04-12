const fs = require('fs');
const glob = require('glob');
const path = require('path');

const shopDir = path.join(process.cwd(), 'src/app/(shop)');
const pattern = path.join(shopDir, '**/*.tsx').replace(/\\/g, '/');

const files = glob.sync(pattern);
let changedFilesCount = 0;

for (const file of files) {
    if (file.includes('page.tsx') && file.endsWith('(shop)/page.tsx') || file.endsWith('(shop)/layout.tsx')) {
        continue;
    }

    let content = fs.readFileSync(file, 'utf8');
    const originalContent = content;

    // Replace the major hero wrapper gradients
    content = content.replace(/<div className="relative overflow-hidden bg-gradient-to-[a-z]+ [^"]+">/g, '<div className="relative overflow-hidden bg-white text-slate-800 border-b border-slate-100">');
    content = content.replace(/<div className="relative overflow-hidden bg-[a-z0-9\-]+ [^"]*bg-gradient-to-[^"]+">/g, '<div className="relative overflow-hidden bg-white text-slate-800 border-b border-slate-100">');
    content = content.replace(/<div className="relative overflow-hidden bg-gradient-to-[^"]+">/g, '<div className="relative overflow-hidden bg-white text-slate-800 border-b border-slate-100">');
    
    // Also remove any absolute decorative gradient backgrounds
    content = content.replace(/<div className="absolute top-[^>]*bg-gradient-[^>]*><\/div>/g, '');
    content = content.replace(/<div className="absolute inset-[^>]*bg-gradient-[^>]*><\/div>/g, '');

    // For any remaining text-white or white-ish text in these headers, we might need a general text fix, 
    // but the main issue stated by user was "page background colours are messy". 
    // White background is applied.

    if (content !== originalContent) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Modified:', path.relative(process.cwd(), file));
        changedFilesCount++;
    }
}

console.log('Done, modified ' + changedFilesCount + ' files.');
