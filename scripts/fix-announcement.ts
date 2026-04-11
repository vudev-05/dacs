import { PrismaClient } from "../src/generated/client";
const prisma = new PrismaClient();

async function main() {
  const newText = "Chào mừng bạn đến với LIKEFOOD | Miễn phí vận chuyển cho đơn hàng từ $500 | Nhập mã LIKEFOOD20 để giảm 20%";
  
  const existing = await prisma.systemsetting.findUnique({
    where: { key: "announcement_text" }
  });

  if (existing) {
    await prisma.systemsetting.update({
      where: { key: "announcement_text" },
      data: { value: newText }
    });
    console.log("Updated announcement_text in DB to:", newText);
  } else {
    await prisma.systemsetting.create({
      data: {
        key: "announcement_text",
        value: newText
      }
    });
    console.log("Created announcement_text in DB:", newText);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
