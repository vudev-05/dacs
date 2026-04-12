const fs = require('fs');
const path = require('path');

function replaceFile(filePath, replacements) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = content;
    for (let r of replacements) {
        modified = modified.replace(r.search, r.replace);
    }
    if (modified !== content) {
        fs.writeFileSync(filePath, modified);
        console.log("Updated " + filePath);
    } else {
        console.log("No changes for " + filePath);
    }
}

const pContact = 'src/app/(shop)/contact/page.tsx';
replaceFile(pContact, [
    { search: /className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500"/g, replace: 'className="text-slate-900"' },
    { search: /bg-cyan-100/g, replace: 'bg-slate-100 border border-slate-200' },
    { search: /text-cyan-700/g, replace: 'text-slate-700' },
    { search: /text-cyan-600/g, replace: 'text-slate-600' },
    { search: /page-container-wide/g, replace: 'w-full px-4 sm:px-6 lg:px-[6%] mx-auto' }
]);

const pOrders = 'src/app/(shop)/profile/orders/page.tsx';
replaceFile(pOrders, [
    { search: /text-white/g, replace: 'text-slate-900' },
    { search: /text-white\/60/g, replace: 'text-slate-500' },
    { search: /text-white\/70/g, replace: 'text-slate-600' },
    { search: /bg-white\/10/g, replace: 'bg-white border' },
    { search: /bg-white\/20/g, replace: 'bg-white border shadow-sm' },
    { search: /bg-white\/5/g, replace: 'bg-slate-50' },
    { search: /backdrop-blur-sm/g, replace: '' },
    { search: /page-container-wide/g, replace: 'w-full px-4 sm:px-6 lg:px-[6%] mx-auto' }
]);

const pProfile = 'src/app/(shop)/profile/page.tsx';
replaceFile(pProfile, [
    { search: /bg-gradient-to-r from-primary\/90 via-primary to-teal-500/g, replace: 'bg-white border-b border-slate-100' },
    { search: /text-white/g, replace: 'text-slate-900' },
    { search: /text-white\/60/g, replace: 'text-slate-500' },
    { search: /text-white\/70/g, replace: 'text-slate-600' },
    { search: /bg-white\/20/g, replace: 'bg-slate-50 border border-slate-200' },
    { search: /bg-white\/40/g, replace: 'bg-slate-100' },
    { search: /bg-white\/10/g, replace: 'bg-slate-50 shadow-sm border border-slate-100' },
    { search: /backdrop-blur-sm/g, replace: '' },
    { search: /page-container-wide/g, replace: 'w-full px-4 sm:px-6 lg:px-[6%] mx-auto' }
]);

const pReferrals = 'src/app/(shop)/profile/referrals/page.tsx';
replaceFile(pReferrals, [
    { search: /style=\{\{ background: "linear-gradient[^}]*\}\}/g, replace: 'className="bg-white border-b border-slate-100"' },
    { search: /text-white\/60/g, replace: 'text-slate-500' },
    { search: /text-white\/50/g, replace: 'text-slate-400' },
    { search: /text-white\/30/g, replace: 'text-slate-300' },
    { search: /text-emerald-100/g, replace: 'text-slate-800' },
    { search: /text-emerald-200\/80/g, replace: 'text-slate-600' },
    { search: /text-white/g, replace: 'text-slate-900' },
    { search: /bg-white\/\[0\.12\]/g, replace: 'bg-slate-50' },
    { search: /border-white\/25/g, replace: 'border-slate-200' },
    { search: /border-white\/20/g, replace: 'border-slate-200' },
    { search: /border-white\/30/g, replace: 'border-slate-200' },
    { search: /bg-white\/10/g, replace: 'bg-slate-100 border' },
    { search: /bg-white\/15/g, replace: 'bg-slate-50 border shadow-sm' },
    { search: /bg-white\/25/g, replace: 'bg-slate-200 border shadow-sm' },
    { search: /backdrop-blur-xl/g, replace: '' },
    { search: /backdrop-blur-sm/g, replace: '' },
    { search: /bg-gradient-to-r from-emerald-400\/30 via-cyan-400\/30 to-teal-400\/30/g, replace: 'bg-transparent' },
    { search: /ring-white\/40/g, replace: 'ring-slate-200' },
    { search: /w-full px-4 sm:px-6 lg:px-\[8%\]/g, replace: 'w-full px-4 sm:px-6 lg:px-[6%] mx-auto' },
    { search: /min-w-\[300px\] max-w-\[360px\]/g, replace: 'relative min-w-[300px] max-w-[360px] bg-white border border-slate-200 shadow-xl rounded-3xl p-6' }
]);
