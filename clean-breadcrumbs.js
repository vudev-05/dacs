const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.tsx')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('src/app/(shop)');
let count = 0;

files.forEach(f => {
    let c = fs.readFileSync(f, 'utf8');
    let orig = c;

    // Matches exactly: <div class...><Link href="/"> Home </Link> <span>/</span> ... </div>
    const regex1 = /<div[^>]*>\s*<Link href="\/"[^>]*>[\s\S]*?(?:Trang chủ|Home|common\.home)[\s\S]*?<\/Link>\s*<span[^>]*>\/<\/span>[\s\S]*?<\/div>/ig;
    c = c.replace(regex1, '');

    // Matches exactly: <nav class...><Link href="/"> Home </Link> <ChevronRight /> ... </nav>
    const regex2 = /<nav[^>]*>\s*<Link href="\/"[^>]*>[\s\S]*?(?:Trang chủ|Home|common\.home)[\s\S]*?<\/Link>[\s\S]*?<\/nav>/ig;
    c = c.replace(regex2, '');

    if (c !== orig) {
        fs.writeFileSync(f, c);
        count++;
        console.log('Fixed ' + f);
    }
});

console.log('Total fixed: ' + count);
