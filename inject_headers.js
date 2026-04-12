const fs = require('fs');
const path = require('path');

const shopDir = path.join(__dirname, 'src', 'app', '(shop)');
const dirs = ['contact', 'faq', 'flash-sale', 'policies', 'posts', 'vouchers', 'cart', 'checkout'];

const pageHeaderImport = `import { PageHeader } from "@/components/common/PageHeader";\n`;

dirs.forEach(dir => {
    const pagePath = path.join(shopDir, dir, 'page.tsx');
    if (!fs.existsSync(pagePath)) return;
    
    let content = fs.readFileSync(pagePath, 'utf8');
    
    // Skip if already imported
    if (content.includes('import { PageHeader }')) return;
    
    // Insert import after the last import
    const lastImportIndex = content.lastIndexOf('import ');
    if (lastImportIndex !== -1) {
        const nextLineIndex = content.indexOf('\n', lastImportIndex);
        content = content.slice(0, nextLineIndex + 1) + pageHeaderImport + content.slice(nextLineIndex + 1);
    } else {
        content = pageHeaderImport + content;
    }
    
    // Find return ( and inject
    const returnRegex = /return\s*\(\s*(<main[^>]*>|<div[^>]*>|<section[^>]*>|<>)/g;
    const match = returnRegex.exec(content);
    
    if (match) {
        const insertPos = match.index;
        // Basic mapping for title
        let title = dir.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase());
        if (dir === 'flash-sale') title = 'Flash Sale';
        if (dir === 'vouchers') title = 'Vouchers';
        if (dir === 'faq') title = 'FAQ';
        if (dir === 'policies') title = 'Chính Sách';
        if (dir === 'contact') title = 'Liên Hệ';
        if (dir === 'posts') title = 'Tin Tức';
        if (dir === 'cart') title = 'Giỏ Hàng';
        if (dir === 'checkout') title = 'Thanh Toán';
        
        const headerJsx = `\n      <PageHeader breadcrumbs={[{ label: "${title}" }]} title="${title}" />\n`;
        
        // Wrap with Fragment if not already
        if (match[1] === '<>') {
            content = content.slice(0, match.index + match[0].length) + headerJsx + content.slice(match.index + match[0].length);
        } else {
            // Need to wrap in fragment
            let returnStmtEnd = content.lastIndexOf(');');
            if (returnStmtEnd === -1) returnStmtEnd = content.lastIndexOf(') ;');
            if (returnStmtEnd !== -1 && returnStmtEnd > insertPos) {
                 const returnStart = content.substring(0, match.index + match[0].indexOf(match[1]));
                 const middle = content.substring(match.index + match[0].indexOf(match[1]), returnStmtEnd);
                 const end = content.substring(returnStmtEnd);
                 content = returnStart + '<>\n' + headerJsx + middle + '\n      </>' + end;
            }
        }
    }
    
    fs.writeFileSync(pagePath, content);
    console.log(`Updated ${dir}/page.tsx`);
});
