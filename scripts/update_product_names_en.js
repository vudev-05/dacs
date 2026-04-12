const { PrismaClient } = require('../src/generated/client');
const prisma = new PrismaClient();

/**
 * Bảng dịch tên sản phẩm VI → EN
 * Mỗi entry: [id, nameEn]
 */
const translations = [
    [1, "Ginger Red Date Beauty Cake"],
    [2, "Soybean Powder"],
    [3, "Tofu Skin (Bean Curd Sheet)"],
    [4, "Dried Seasoned Baby Shrimp"],
    [5, "Essential Oil DR"],
    [6, "Black Garlic"],
    [7, "Dried Shrimp"],
    [8, "Cordyceps Five-Spice Tea"],
    [9, "Lipton Licorice Tea"],
    [10, "Nestea Tea"],
    [11, "Guava Weight Loss Tea"],
    [12, "Lotus Seed Tea"],
    [13, "Green Bean Lotus Seed Powder"],
    [14, "Herbal Tea"],
    [15, "Pink Guava Tea"],
    [16, "Pennywort Green Bean Powder"],
    [17, "Cooling Effervescent Melon Powder"],
    [18, "Fried Anchovy with Fish Sauce"],
    [19, "Sun-Dried Croaker Fish"],
    [20, "Garlic Roasted Croaker Fish"],
    [21, "Sun-Dried Pangasius Fish"],
    [22, "Crispy Fried Stingray with Butter Garlic"],
    [23, "Seasoned Stingray Jerky"],
    [24, "Mochi Cake"],
    [25, "Grilled Seasoned Lizardfish"],
    [26, "Collagen Coffee"],
    [27, "Diet Coffee"],
    [28, "Taro Coffee"],
    [29, "Sea Salt Coffee"],
    [30, "Rock Caffe Coconut Milk Coffee"],
    [31, "Digital Kitchen Scale"],
    [32, "Instant Sour Soup Mix"],
    [33, "Instant Shrimp Tomato Soup Mix"],
    [34, "Seaweed Tofu Soup Mix"],
    [35, "Shrimp Crackers"],
    [36, "Seaweed Shrimp Soup Mix"],
    [37, "Pork Floss"],
    [38, "Fried Fish Cake"],
    [39, "Salt & Lime Dried Star Fruit"],
    [40, "Chewy Tamarind Candy"],
    [41, "Roasted Chili Garlic Peanuts"],
    [42, "Dried Cordyceps"],
    [43, "Natural Latex Pillow"],
    [44, "Fried Shallots"],
    [45, "Pumpkin Seeds"],
    [46, "Seaweed Nut Crackers"],
    [47, "Cashew Nuts"],
    [48, "Watermelon Seeds"],
    [49, "Sunflower Seeds"],
    [50, "Coconut Salt Sunflower Seeds"],
    [51, "Dried Lotus Seeds"],
    [52, "Coffee Salt Coconut Candy"],
    [53, "Black Sesame Coconut Candy"],
    [54, "Black Sesame Candy"],
    [55, "Jelly Candy"],
    [56, "Dried Goby Fish"],
    [57, "Chili Fish Sauce Dried Pig Ear Chips"],
    [58, "Dried Yellow Stripe Fish"],
    [59, "Dried Anchovy"],
    [60, "Dried Croaker Fish"],
    [61, "Dried Pangasius Fish"],
    [62, "Dried Sand Goby Fish"],
    [63, "Dried Threadfin Bream"],
    [64, "Dried Snakehead Fish"],
    [65, "Seasoned Dried Lizardfish"],
    [66, "Dried Catfish (Ngát)"],
    [67, "Dried Spotted Scat Fish"],
    [68, "Boat-Shaped Cake"],
    [69, "Dried Butterfly Scat Fish"],
    [70, "Puffed Dried Pangasius Fish"],
    [71, "Lemon Leaf Dried Chicken"],
    [72, "Chewy Dried Sweet Potato"],
    [73, "Fish Sauce Shallot Taro Chips"],
    [74, "Licorice Dried Kumquat"],
    [75, "Fermented Linh Fish Sauce"],
    [76, "Fermented Snakehead Fish Sauce"],
    [77, "Fermented Scat Fish Sauce"],
    [78, "Thai-Style Fish Sauce"],
    [79, "Wet Rice Paper Rolls"],
    [80, "Chewy Dried Soursop"],
    [81, "Dried Bamboo Shoots"],
    [82, "Fresh Whole Lao Tamarind"],
    [83, "Chili Lime Salt Dried Apricot"],
    [84, "Seasoned Pressed Squid"],
    [85, "Dried Squid"],
    [86, "Tay Ninh Dipping Salt"],
    [87, "Candied Betel Nut"],
    [88, "Candied Dates"],
    [89, "Candied Star Gooseberry"],
    [90, "Abalone"],
    [91, "Candied Water Chestnut"],
    [92, "Candied Papaya"],
    [93, "Candied Ginger"],
    [94, "Candied Lotus Seeds"],
    [95, "Candied Pineapple"],
    [96, "Chewy Dried Mango"],
    [97, "Dried Shiitake Mushroom"],
    [98, "Dried Deer Velvet Mushroom"],
    [99, "Five-Bean Cereal Mix"],
    [100, "Brown Dragon Blood Rice Cereal"],
    [101, "Chili Garlic Fish Sauce Dried Corn"],
    [102, "Sugarcane Cooling Drink"],
    [103, "Assorted Preserved Plum Pack"],
    [104, "Chili Salt Dried Guava"],
    [105, "Bee Pollen"],
    [106, "King's Vegetable (Rau Tiến Vua)"],
    [107, "Seasoned Ready-to-Eat Seaweed"],
    [108, "Dried Sea Jelly"],
    [109, "Saffron"],
    [110, "Red Dates (Jujube)"],
    [111, "Red Date Cashew Milk Candy"],
];

async function main() {
    console.log(`🚀 Bắt đầu cập nhật ${translations.length} sản phẩm...`);
    
    let success = 0;
    let failed = 0;
    
    for (const [id, nameEn] of translations) {
        try {
            await prisma.product.update({
                where: { id },
                data: { nameEn },
            });
            success++;
            console.log(`  ✅ ID ${id}: ${nameEn}`);
        } catch (err) {
            failed++;
            console.error(`  ❌ ID ${id}: ${err.message}`);
        }
    }
    
    console.log(`\n📊 Kết quả: ${success} thành công, ${failed} thất bại / ${translations.length} tổng`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
