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
    
    // Skip homepage, layout, error, loading (as requested/implied)
    if (filePath.replace(/\\/g, '/').endsWith('src/app/(shop)/page.tsx')) return;
    if (filePath.replace(/\\/g, '/').endsWith('src/app/(shop)/layout.tsx')) return;
    if (filePath.replace(/\\/g, '/').endsWith('src/app/(shop)/error.tsx')) return;
    if (filePath.replace(/\\/g, '/').endsWith('src/app/(shop)/loading.tsx')) return;
    if (filePath.replace(/\\/g, '/').endsWith('src/app/(shop)/flash-sale/page.tsx')) return; // Already bg-white
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace complex background classes containing min-h-screen
    const regex = /(className=[\"'\])(.*?)min-h-screen(.*?)(?:bg-slate-100|bg-slate-50|bg-\[#fdfdff\]|bg-\[#f4f1ea\]|bg-gradient-[a-zA-Z0-9\-\/]+ from-[a-zA-Z0-9\-\/]+ (?:via-[a-zA-Z0-9\-\/]+ )?to-[a-zA-Z0-9\-\/]+|bg-\[linear-gradient.*?\])\s*(.*?)[\"'\]/g;
    
    let newContent = content.replace(regex, (match, p1, p2, p3, p4) => {
        // Build the new class name without the matched background, adding bg-white
        let newClasses = (p2 + ' min-h-screen ' + p3 + ' bg-white ' + p4).replace(/\s+/g, ' ').trim();
        return p1 + newClasses + p1.replace(/=/, ''); // restoring quote
    });
    
    // Additional generic replace for those not caught by the specific regex
    // e.g. "min-h-screen bg-slate-50 pb-20" -> "min-h-screen bg-white pb-20"
    const regex2 = /min-h-screen\s+(?:bg-slate-50|bg-slate-100|bg-\[#fdfdff\]|bg-\[#f4f1ea\]|bg-gradient-[a-zA-Z0-9\-\/]+ from-[a-zA-Z0-9\-\/]+ (?:via-[a-zA-Z0-9\-\/]+ )?to-[a-zA-Z0-9\-\/]+|bg-\[linear-gradient.*?\])/g;
    newContent = newContent.replace(regex2, 'min-h-screen bg-white');

    if (content !== newContent) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log('Updated: ' + filePath);
    }
});
