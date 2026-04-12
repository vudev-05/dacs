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
    
    const normalizedPath = filePath.replace(/\\/g, '/');
    if (normalizedPath.endsWith('src/app/(shop)/page.tsx')) return;
    if (normalizedPath.endsWith('src/app/(shop)/layout.tsx')) return;

    let content = fs.readFileSync(filePath, 'utf8');
    let oldContent = content;

    // Match className="..." containing min-h-screen
    const classNameRegex = /className=(["'])(.*?)min-h-screen(.*?)\1/g;
    
    content = content.replace(classNameRegex, (match, quote, before, after) => {
        // Split by whitespace
        let classString = before + " " + after;
        let classes = classString.split(/\s+/).filter(c => c.trim() !== '');
        
        // Filter out bad ones
        classes = classes.filter(c => {
            if (c.startsWith('bg-slate-') && c !== 'bg-slate-900') return false; // don't remove if it's text context though text uses text-slate, but bg uses bg-slate
            if (c.startsWith('bg-gradient-')) return false;
            if (c.startsWith('from-')) return false;
            if (c.startsWith('via-')) return false;
            if (c.startsWith('to-')) return false;
            if (c.startsWith('bg-[#')) return false;
            if (c.startsWith('bg-[linear-gradient')) return false;
            if (c === 'bg-white') return false; // remove so we can push it at the end to avoid dupes
            if (c.startsWith('bg-cyan-') || c.startsWith('bg-emerald-') || c.startsWith('bg-indigo-') || c.startsWith('bg-purple-')) return false;
            return true;
        });
        
        classes.push('bg-white');
        classes.push('min-h-screen');
        
        return 'className=' + quote + classes.join(' ') + quote;
    });

    if (content !== oldContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Updated: ' + filePath);
    }
});
