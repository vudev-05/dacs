const { PrismaClient } = require('../src/generated/client');
const prisma = new PrismaClient();

async function main() {
    const products = await prisma.product.findMany({
        where: { isDeleted: false },
        select: { id: true, name: true, nameEn: true, description: true, descriptionEn: true, category: true, weight: true, weightEn: true, badgeText: true, badgeTextEn: true },
        orderBy: { id: 'asc' }
    });
    
    console.log(JSON.stringify(products, null, 2));
    console.log(`\nTotal products: ${products.length}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
