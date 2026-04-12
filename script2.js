const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

const shopDir = path.join(__dirname, 'src', 'app', '(shop)');

walkDir(shopDir, (filePath) => {
    if (!filePath.endsWith('.tsx')) return;
    if (filePath.replace(/\\/g, '/').endsWith('src/app/(shop)/page.tsx')) return;
    if (filePath.replace(/\\/g, '/').endsWith('src/app/(shop)/layout.tsx')) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    let oldContent = content;

    // Simple string replacements for known backgrounds with min-h-screen
    content = content.replace(/min-h-screen bg-slate-[0-9]+/g, 'min-h-screen bg-white');
    content = content.replace(/min-h-screen bg-\[#fdfdff\]/g, 'min-h-screen bg-white');
    content = content.replace(/min-h-screen bg-\[#f4f1ea\]/g, 'min-h-screen bg-white');
    content = content.replace(/min-h-screen flex flex-col items-center justify-center bg-\[#f4f1ea\]/g, 'min-h-screen flex flex-col items-center justify-center bg-white');
    
    content = content.replace(/min-h-screen bg-gradient-\S+ from-\S+ via-\S+ to-\S+/g, 'min-h-screen bg-white');
    content = content.replace(/min-h-screen bg-gradient-\S+ from-\S+ to-\S+/g, 'min-h-screen bg-white');
    content = content.replace(/min-h-screen flex items-center justify-center bg-gradient-\S+ from-\S+ via-\S+ to-\S+/g, 'min-h-screen flex items-center justify-center bg-white');
    content = content.replace(/min-h-screen flex items-start justify-center bg-gradient-\S+ from-\S+ to-\S+/g, 'min-h-screen flex items-start justify-center bg-white');
    
    content = content.replace(/min-h-screen bg-\[linear-gradient.*?\]/g, 'min-h-screen bg-white');
    
    // specifically for products/[slug]/ProductDetailClient.tsx
    content = content.replace(/bg-gradient-to-br from-slate-50 via-white to-emerald-50\/20/g, 'bg-white');
    content = content.replace(/bg-gradient-to-br from-slate-50 via-white to-emerald-50\/10/g, 'bg-white');
    
    // cart
    content = content.replace(/bg-slate-50 pb-24 lg:pb-20/g, 'bg-white pb-24 lg:pb-20');
    
    // profile
    content = content.replace(/bg-gradient-to-br from-slate-50 via-white to-cyan-50\/30 pb-20/g, 'bg-white pb-20');
    content = content.replace(/from-indigo-50\/50 via-white to-purple-50\/50/g, 'bg-white');
    
    // checkout
    content = content.replace(/bg-gradient-to-br from-slate-50 to-blue-50\/30/g, 'bg-white');
    content = content.replace(/bg-gradient-to-br from-slate-50 via-white to-blue-50\/20/g, 'bg-white');
    content = content.replace(/bg-gradient-to-b from-slate-50 to-blue-50\/30/g, 'bg-white');
    
    // generic
    content = content.replace(/bg-slate-50/g, 'bg-white');

    if (content !== oldContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Updated: ' + filePath);
    }
});
