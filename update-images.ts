import { PrismaClient } from './src/generated/client/index.js';

const prisma = new PrismaClient();

async function main() {
    await prisma.product.updateMany({
        where: {
            image: {
                startsWith: '/products/'
            }
        },
        data: {
            image: '/placeholder.png'
        }
    });

    console.log('Successfully updated all /products/ image URLs to /placeholder.png.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
