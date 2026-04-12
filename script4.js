const fs = require('fs');
const path = require('path');

const targetFiles = [
    'src/app/(shop)/products/page.tsx',
    'src/app/(shop)/products/[slug]/ProductDetailClient.tsx',
    'src/app/(shop)/cart/page.tsx',
    'src/app/(shop)/checkout/page.tsx',
    'src/app/(shop)/profile/page.tsx',
    'src/app/(shop)/profile/orders/page.tsx',
    'src/app/(shop)/profile/orders/[id]/page.tsx',
    'src/app/(shop)/profile/points/page.tsx',
    'src/app/(shop)/profile/referrals/page.tsx',
    'src/app/(shop)/profile/refunds/page.tsx',
    'src/app/(shop)/profile/wishlist/page.tsx',
    'src/app/(shop)/posts/page.tsx',
    'src/app/(shop)/posts/[slug]/PostDetailClient.tsx',
    'src/app/(shop)/about/page.tsx',
    'src/app/(shop)/policies/privacy/page.tsx',
    'src/app/(shop)/policies/terms/page.tsx',
    'src/app/(shop)/policies/shipping/page.tsx',
    'src/app/(shop)/policies/return/page.tsx',
    'src/app/(shop)/vouchers/VouchersClient.tsx',
    'src/app/(shop)/notifications/page.tsx',
    'src/app/(shop)/order-success/page.tsx',
    'src/app/(shop)/checkout/return/page.tsx',
    'src/app/(shop)/contact/page.tsx',
    'src/app/(shop)/orders/[id]/invoice/page.tsx',
    'src/app/(shop)/error.tsx',
    'src/app/(shop)/loading.tsx'
];

targetFiles.forEach(subPath => {
    const filePath = path.join(__dirname, subPath);
    if (!fs.existsSync(filePath)) return;

    let content = fs.readFileSync(filePath, 'utf8');
    let oldContent = content;

    // Exact replacements
    content = content.replace('className="bg-slate-50 min-h-screen"', 'className="bg-white min-h-screen"');
    content = content.replace('className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-emerald-50/20 px-6"', 'className="min-h-screen flex items-center justify-center bg-white px-6"');
    content = content.replace('className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/10"', 'className="min-h-screen bg-white"');
    content = content.replace('className="min-h-screen bg-slate-50 pb-24 lg:pb-20"', 'className="min-h-screen bg-white pb-24 lg:pb-20"');
    content = content.replace('className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50/30 px-4"', 'className="min-h-screen flex items-center justify-center bg-white px-4"');
    content = content.replace('className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-start justify-center pt-4 lg:pt-6 px-4"', 'className="min-h-screen bg-white flex items-start justify-center pt-4 lg:pt-6 px-4"');
    content = content.replace('className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/20 flex flex-col"', 'className="min-h-screen bg-white flex flex-col"');
    content = content.replace('className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50/30 pb-20 lg:pb-16"', 'className="min-h-screen bg-white pb-20 lg:pb-16"');
    content = content.replace('className="min-h-screen bg-slate-50 pb-20"', 'className="min-h-screen bg-white pb-20"');
    content = content.replace('className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eff6ff_100%)] pb-20"', 'className="min-h-screen bg-white pb-20"');
    // For order-success
    content = content.replace('className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50/30"', 'className="min-h-screen flex items-center justify-center bg-white"');
    content = content.replace('className="min-h-screen bg-gradient-to-br from-emerald-50/50 via-white to-slate-50 relative overflow-hidden"', 'className="min-h-screen bg-white relative overflow-hidden"');
    // posts
    content = content.replace('className="min-h-screen flex flex-col items-center justify-center bg-[#f4f1ea]"', 'className="min-h-screen flex flex-col items-center justify-center bg-white"');
    content = content.replace('className="min-h-screen bg-[#f4f1ea] pb-24 selection:bg-emerald-200 selection:text-emerald-900 w-full overflow-x-hidden"', 'className="min-h-screen bg-white pb-24 selection:bg-emerald-200 selection:text-emerald-900 w-full overflow-x-hidden"');
    // about
    content = content.replace('className="min-h-screen bg-gradient-to-b from-teal-50/40 via-white to-cyan-50/30"', 'className="min-h-screen bg-white"');
    // policies
    content = content.replace('className="min-h-screen bg-[#fdfdff] pb-20"', 'className="min-h-screen bg-white pb-20"');
    // vouchers
    content = content.replace('className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 pb-20 pt-8"', 'className="min-h-screen bg-white pb-20 pt-8"');
    // contact
    content = content.replace('className="min-h-screen bg-gradient-to-br from-cyan-50/50 via-white to-blue-50/50"', 'className="min-h-screen bg-white"');
    // checkout/return
    content = content.replace('className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-emerald-50/30"', 'className="min-h-screen flex items-center justify-center bg-white"');
    // notifications
    content = content.replace('className="min-h-screen bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/50"', 'className="min-h-screen bg-white"');
    // profile/referrals
    content = content.replace('className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 pb-16"', 'className="min-h-screen bg-white pb-16"');
    // fallback generics
    content = content.replace('className="min-h-screen bg-slate-50"', 'className="min-h-screen bg-white"');
    content = content.replace('className="min-h-screen bg-slate-100 py-10 print:bg-white print:py-0"', 'className="min-h-screen bg-white py-10 print:bg-white print:py-0"');
    content = content.replace('className="min-h-screen flex items-center justify-center bg-slate-50"', 'className="min-h-screen flex items-center justify-center bg-white"');
    content = content.replace('className="min-h-screen flex items-center justify-center bg-slate-50 px-6"', 'className="min-h-screen flex items-center justify-center bg-white px-6"');
    content = content.replace('className="min-h-screen bg-slate-50 pb-20 font-sans"', 'className="min-h-screen bg-white pb-20 font-sans"');

    // Add safe catch-alls using regex but only inside the full string
    // Example: className="min-h-screen bg-slate-[...]" -> className="min-h-screen bg-white"
    
    if (content !== oldContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Fixed exactly: ' + filePath);
    }
});
