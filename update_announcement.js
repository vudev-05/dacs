const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    await prisma.setting.upsert({
        where: { key: 'ANNOUNCEMENT_TEXT' },
        update: { value: 'navbar.announcement1 | navbar.announcement2 | navbar.announcement3' },
        create: { key: 'ANNOUNCEMENT_TEXT', value: 'navbar.announcement1 | navbar.announcement2 | navbar.announcement3' }
    });
    console.log('Updated DB topbar announcement strings to the i18n keys!');
    
    // Check if the old "ca-kho" categories still exist in DB, and log the current setting.
    const setting = await prisma.setting.findUnique({where: {key: 'ANNOUNCEMENT_TEXT'}});
    console.log(setting);
}
main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
