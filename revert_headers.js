const fs = require('fs');
const path = require('path');

const shopDir = path.join(__dirname, 'src', 'app', '(shop)');
const dirs = ['contact', 'faq', 'flash-sale', 'policies', 'posts', 'vouchers', 'cart', 'checkout'];

dirs.forEach(dir => {
    const pagePath = path.join(shopDir, dir, 'page.tsx');
    if (!fs.existsSync(pagePath)) return;
    
    let content = fs.readFileSync(pagePath, 'utf8');
    
    // Remove import
    content = content.replace(/import { PageHeader } from "@\/components\/common\/PageHeader";\r?\n/g, '');
    
    // Remove PageHeader usage (including <>\n and \n</>) which we added
    content = content.replace(/<PageHeader breadcrumbs=\{\[\{ label: "[^"]+" \}\]\} title="[^"]+" \/>\r?\n\s*/g, '');
    
    fs.writeFileSync(pagePath, content);
    console.log(`Reverted ${dir}/page.tsx`);
});
