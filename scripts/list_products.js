const { PrismaClient } = require('../src/generated/client');
const prisma = new PrismaClient();

async function main() {
    const products = await prisma.product.findMany({
        where: { isDeleted: false },
        select: { id: true, name: true, nameEn: true, category: true },
        orderBy: { id: 'asc' }
    });
    
    products.forEach(p => {
        console.log(`${p.id}|${p.name}|${p.nameEn || 'NULL'}|${p.category}`);
    });
}

main().catch(console.error).finally(() => prisma.$disconnect());
