import { PrismaClient } from './src/generated/client/index.js';

const prisma = new PrismaClient();

async function main() {
    const products = await prisma.product.findMany({ take: 20 });
    console.log('Got 20 products to update...');
    
    for (const p of products) {
        await prisma.product.update({
            where: { id: p.id },
            data: { featured: true }
        });
    }
    
    console.log('Successfully set 20 products to featured=true.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
