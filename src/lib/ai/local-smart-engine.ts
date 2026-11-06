/**
 * LIKEFOOD - Smart Local AI Assistant Engine
 * ──────────────────────────────────────────
 * High-performance, offline-capable assistant that provides
 * rich, accurate product recommendations with DIRECT LINKS,
 * store information, and order answers from the MySQL database.
 *
 * Ensures the chatbot ALWAYS works seamlessly and gives direct product links.
 *
 * Copyright (c) 2026 LIKEFOOD Team
 */

import prisma from "@/lib/prisma";

export interface LocalAIOptions {
  userId?: number;
  history?: { role: string; content: string }[];
}

function removeAccents(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

function cleanMessage(msg: string): string {
  // Remove emojis and leading/trailing whitespace
  return msg
    .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "")
    .trim();
}

export async function generateLocalAIResponse(
  rawMessage: string,
  language: "vi" | "en" = "vi",
  options?: LocalAIOptions
): Promise<string> {
  const isVi = language === "vi";
  const cleaned = cleanMessage(rawMessage);
  const normalized = removeAccents(cleaned);

  // ── 1. GỢI Ý TRÀ & CÀ PHÊ / BÁNH MỨT ────────────────────────────
  if (
    normalized.includes("tra") ||
    normalized.includes("ca phe") ||
    normalized.includes("coffee") ||
    normalized.includes("tea") ||
    normalized.includes("banh mut") ||
    normalized.includes("mut")
  ) {
    const teaProducts = await prisma.product.findMany({
      where: {
        isDeleted: false,
        OR: [
          { category: { contains: "Trà" } },
          { name: { contains: "Trà" } },
          { name: { contains: "Mứt" } },
          { name: { contains: "Bánh" } },
        ],
      },
      take: 4,
    });

    if (teaProducts.length > 0) {
      if (isVi) {
        let res = `Dạ, LIKEFOOD xin gợi ý các loại trà và bánh mứt đặc sản truyền thống tuyệt ngon để thưởng thức hoặc làm quà ạ: 🍵\n\n`;
        teaProducts.forEach((p) => {
          const orig = p.originalPrice ? ` ~~$${p.originalPrice.toFixed(2)}~~` : "";
          res += `• 🍵 **[${p.name}](/products/${p.slug})** — **$${p.price.toFixed(2)}**${orig}\n`;
          if (p.description) {
            res += `  *${p.description.slice(0, 110)}...*\n`;
          }
          res += `  👉 [Xem chi tiết & Mua ngay](/products/${p.slug})\n\n`;
        });
        res += `💡 **Gợi ý thưởng thức:** Nhâm nhi một tách Trà Sen Tây Hồ cùng chút Mứt Dừa Non Bến Tre dẻo bùi là chuẩn vị quê hương! Đơn hàng từ **$99** còn được **Freeship** toàn nước Mỹ nữa đó ạ. Bạn muốn đặt thử món nào không ạ? 😊`;
        return res;
      } else {
        let res = `Here are our premium Vietnamese tea & specialty sweets recommended for you: 🍵\n\n`;
        teaProducts.forEach((p) => {
          const orig = p.originalPrice ? ` ~~$${p.originalPrice.toFixed(2)}~~` : "";
          res += `• 🍵 **[${p.name}](/products/${p.slug})** — **$${p.price.toFixed(2)}**${orig}\n`;
          res += `  👉 [View Product Details](/products/${p.slug})\n\n`;
        });
        res += `💡 Free shipping on orders over **$99** across the USA! Would you like to add any to your cart? 😊`;
        return res;
      }
    }
  }

  // ── 2. TƯ VẤN COMBO & QUÀ BIẾU ─────────────────────────────────
  if (
    normalized.includes("combo") ||
    normalized.includes("qua bieu") ||
    normalized.includes("qua tang") ||
    normalized.includes("gift") ||
    normalized.includes("set qua") ||
    normalized.includes("gio qua")
  ) {
    if (isVi) {
      return `Dạ, LIKEFOOD xin gợi ý 3 set combo quà biếu đặc sản Việt Nam sang trọng, ý nghĩa dành tặng người thân, đối tác tại Mỹ ạ: 🎁\n\n` +
        `🎁 **1. Combo Hải Sản Miền Quê (Quà Biếu Cao Cấp):**\n` +
        `• 🐟 **[Cá Dứa 1 Nắng](/products/ca-dua-1-nang)** ($40.00) 👉 [Xem sản phẩm](/products/ca-dua-1-nang)\n` +
        `• 🐟 **[Cá Đù 1 Nắng](/products/ca-du-1-nang)** ($20.00) 👉 [Xem sản phẩm](/products/ca-du-1-nang)\n` +
        `• 🦐 **[Tôm Khô Cực Ngon](/products/tom-kho)** ($54.00) 👉 [Xem sản phẩm](/products/tom-kho)\n` +
        `💰 Giá gốc: ~~$114.00~~ → **Ưu đãi combo: $99.00** *(Freeship toàn nước Mỹ)*\n` +
        `✨ *Được hút chân không 2 lớp chuẩn bay, biếu tặng lịch sự, giữ trọn hương vị phù sa sông nước.*\n\n` +
        `🎁 **2. Combo Trà & Bánh Thư Thái (Thanh Lọc Sức Khỏe):**\n` +
        `• 🍵 **[Trà Tâm Sen Tịnh Tâm](/products/tra-tam-sen)** ($20.00) 👉 [Xem sản phẩm](/products/tra-tam-sen)\n` +
        `• 🍵 **[Trà Vị Ổi Hồng](/products/tra-vi-oi-hong)** ($14.00) 👉 [Xem sản phẩm](/products/tra-vi-oi-hong)\n` +
        `• 🍘 **[Bánh Rong Biển Kẹp Hạt Dinh Dưỡng](/products/banh-rong-bien-kep-hat)** ($15.00) 👉 [Xem sản phẩm](/products/banh-rong-bien-kep-hat)\n` +
        `💰 Giá gốc: ~~$49.00~~ → **Ưu đãi combo: $42.00**\n` +
        `✨ *Thích hợp tặng người lớn tuổi, đối tác hoặc tiếp khách dịp lễ Tết, sum họp.*\n\n` +
        `🎁 **3. Combo Cà Phê & Nhâm Nhi Đậm Đà:**\n` +
        `• ☕ **[Cafe Muối Đặc Biệt](/products/cafe-muoi)** ($15.00) 👉 [Xem sản phẩm](/products/cafe-muoi)\n` +
        `• 🐟 **[Cá Cơm Chiên Mắm Giòn Cay](/products/ca-com-chien-mam)** ($22.00) 👉 [Xem sản phẩm](/products/ca-com-chien-mam)\n` +
        `• 🥜 **[Hạt Điều Rang Bùi Béo](/products/hat-dieu)** ($22.00) 👉 [Xem sản phẩm](/products/hat-dieu)\n` +
        `💰 Giá gốc: ~~$59.00~~ → **Ưu đãi combo: $49.99**\n\n` +
        `📦 **LIKEFOOD hỗ trợ viết thiệp chúc mừng & đóng hộp quà miễn phí!** Bạn có thể bấm trực tiếp vào tên sản phẩm để xem chi tiết nhé! 😊`;
    } else {
      return `Here are our most popular curated gift combos for your family & friends: 🎁\n\n` +
        `🎁 **1. Premium Seafood Gift Set:**\n` +
        `• 🐟 **[1-Sun Dried Pangasius Fish](/products/ca-dua-1-nang)** ($40.00) 👉 [View Product](/products/ca-dua-1-nang)\n` +
        `• 🐟 **[1-Sun Dried Croaker Fish](/products/ca-du-1-nang)** ($20.00) 👉 [View Product](/products/ca-du-1-nang)\n` +
        `• 🦐 **[Premium Dried Shrimp](/products/tom-kho)** ($54.00) 👉 [View Product](/products/tom-kho)\n` +
        `💰 Bundle Price: **$99.00** (Includes Free USA Shipping)\n\n` +
        `🎁 **2. Traditional Tea & Treats Set:**\n` +
        `• 🍵 **[Lotus Core Herbal Tea](/products/tra-tam-sen)** ($20.00) 👉 [View Product](/products/tra-tam-sen)\n` +
        `• 🍵 **[Pink Guava Tea](/products/tra-vi-oi-hong)** ($14.00) 👉 [View Product](/products/tra-vi-oi-hong)\n` +
        `• 🍘 **[Crispy Seaweed Nut Crisps](/products/banh-rong-bien-kep-hat)** ($15.00) 👉 [View Product](/products/banh-rong-bien-kep-hat)\n` +
        `💰 Bundle Price: **$42.00**\n\n` +
        `All gift boxes are packaged with complimentary greeting cards and vacuum sealed. Click on any product link above to view details! 😊`;
    }
  }

  // ── 3. HẢI SẢN KHÔ: CÁ KHÔ, TÔM KHÔ, MỰC KHÔ ────────────────────
  if (
    normalized.includes("ca kho") ||
    normalized.includes("kho ca") ||
    normalized.includes("tom kho") ||
    normalized.includes("muc kho") ||
    normalized.includes("hai san") ||
    normalized.includes("ca loc") ||
    normalized.includes("ca sac") ||
    normalized.includes("ca tra") ||
    normalized.includes("seafood")
  ) {
    const seafoodProducts = await prisma.product.findMany({
      where: {
        isDeleted: false,
        OR: [
          { category: { contains: "Cá" } },
          { category: { contains: "Tôm" } },
          { name: { contains: "Cá" } },
          { name: { contains: "Tôm" } },
          { name: { contains: "Mực" } },
        ],
      },
      take: 6,
    });

    if (seafoodProducts.length > 0) {
      if (isVi) {
        let res = `Dạ, hải sản khô là thế mạnh số 1 của LIKEFOOD! 100% được phơi nắng tự nhiên, không chất bảo quản, hút chân không chuẩn gửi Mỹ: 🐟🦐\n\n`;
        seafoodProducts.forEach((p) => {
          const orig = p.originalPrice ? ` ~~$${p.originalPrice.toFixed(2)}~~` : "";
          res += `• 🐟 **[${p.name}](/products/${p.slug})** — **$${p.price.toFixed(2)}**${orig} (Kho: ${p.inventory})\n`;
          res += `  👉 [Xem chi tiết & Đặt mua](/products/${p.slug})\n\n`;
        });
        res += `🍳 **Món ngon gợi ý:** Khô cá sặc bổi nướng trộn gỏi xoài, cá lóc khô chiên giấm đường, hoặc tôm khô nấu canh bầu canh bí thì ngon hết sẩy ạ! Bạn bấm trực tiếp link trên để xem chi tiết nhé! 😊`;
        return res;
      } else {
        let res = `Our specialty dried seafood items are natural sun-dried with zero chemical preservatives: 🐟🦐\n\n`;
        seafoodProducts.forEach((p) => {
          res += `• 🐟 **[${p.name}](/products/${p.slug})** — **$${p.price.toFixed(2)}**\n`;
          res += `  👉 [View Product Details](/products/${p.slug})\n\n`;
        });
        return res;
      }
    }
  }

  // ── 4. TRÁI CÂY SẤY / HOA QUẢ SẤY ──────────────────────────────
  if (
    normalized.includes("trai cay") ||
    normalized.includes("hoa qua") ||
    normalized.includes("say") ||
    normalized.includes("xoai") ||
    normalized.includes("chuoi") ||
    normalized.includes("mit") ||
    normalized.includes("fruit")
  ) {
    const fruitProducts = await prisma.product.findMany({
      where: {
        isDeleted: false,
        OR: [
          { category: { contains: "Trái cây" } },
          { name: { contains: "Sấy" } },
        ],
      },
      take: 5,
    });

    if (fruitProducts.length > 0) {
      let res = isVi
        ? `Dạ, LIKEFOOD có các loại trái cây sấy dẻo và sấy giòn giữ trọn vị ngọt tự nhiên vùng nhiệt đới: 🥭🍌\n\n`
        : `Here are our natural dried fruits from tropical Vietnam: 🥭🍌\n\n`;
      fruitProducts.forEach((p) => {
        const orig = p.originalPrice ? ` ~~$${p.originalPrice.toFixed(2)}~~` : "";
        res += `• 🥭 **[${p.name}](/products/${p.slug})** — **$${p.price.toFixed(2)}**${orig}\n`;
        res += `  👉 [Xem chi tiết & Đặt mua](/products/${p.slug})\n\n`;
      });
      res += isVi
        ? `Ăn vặt lành mạnh, giàu chất xơ và vitamin, rất thích hợp cho cả gia đình ạ! Bấm trực tiếp link trên để xem chi tiết nhé! 😊`
        : `Healthy snacks rich in vitamins and fiber for the whole family! Click above to view details! 😊`;
      return res;
    }
  }

  // ── 5. GIA VỊ VIỆT / NƯỚC MẮM / MUỐI TÔM ────────────────────────
  if (
    normalized.includes("gia vi") ||
    normalized.includes("nuoc mam") ||
    normalized.includes("muoi tom") ||
    normalized.includes("sa te") ||
    normalized.includes("spice") ||
    normalized.includes("sauce")
  ) {
    const spiceProducts = await prisma.product.findMany({
      where: {
        isDeleted: false,
        OR: [
          { category: { contains: "Gia vị" } },
          { name: { contains: "Mắm" } },
          { name: { contains: "Muối" } },
          { name: { contains: "Sa Tế" } },
        ],
      },
      take: 4,
    });

    if (spiceProducts.length > 0) {
      let res = isVi
        ? `Dạ, gia vị truyền thống chính gốc Việt Nam cho bữa cơm đậm đà chuẩn vị quê nhà: 🧂🌶️\n\n`
        : `Authentic Vietnamese spices and seasonings for homemade dishes: 🧂🌶️\n\n`;
      spiceProducts.forEach((p) => {
        const orig = p.originalPrice ? ` ~~$${p.originalPrice.toFixed(2)}~~` : "";
        res += `• 🧂 **[${p.name}](/products/${p.slug})** — **$${p.price.toFixed(2)}**${orig}\n`;
        res += `  👉 [Xem chi tiết & Đặt mua](/products/${p.slug})\n\n`;
      });
      res += isVi
        ? `Đặc biệt Nước Mắm Phú Quốc 40 Độ Đạm cốt cá cơm thơm nức nở và Muối Tôm Tây Ninh chấm trái cây bao ghiền ạ! Bấm link trên để đặt mua nhé! 😋`
        : `Essential ingredients to bring authentic Vietnamese flavors to your kitchen! 😊`;
      return res;
    }
  }

  // ── 6. PHÍ GIAO HÀNG / VẬN CHUYỂN ──────────────────────────────
  if (
    normalized.includes("giao hang") ||
    normalized.includes("van chuyen") ||
    normalized.includes("phi ship") ||
    normalized.includes("ship") ||
    normalized.includes("freeship") ||
    normalized.includes("shipping") ||
    normalized.includes("delivery")
  ) {
    if (isVi) {
      return `Dạ, chính sách vận chuyển của LIKEFOOD áp dụng trên toàn bộ 50 bang nước Mỹ như sau: 🚚\n\n` +
        `• 🚚 **Tiêu chuẩn (Standard 3 - 5 ngày):** $5.99\n` +
        `• ⚡ **Giao nhanh (Express 1 - 2 ngày):** $12.99\n` +
        `• 🚀 **Trong ngày (Same-day):** $24.99\n` +
        `• 🆓 **MIỄN PHÍ GIAO HÀNG:** Áp dụng cho đơn hàng từ **$99** trở lên!\n\n` +
        `Mọi kiện hàng thực phẩm đều được hút chân không và đóng thùng xốp/gel giữ nhiệt cẩn thận để đảm bảo đến tay bạn luôn tươi ngon nhất ạ! 😊\n\n` +
        `👉 [Xem danh mục tất cả sản phẩm](/products)`;
    } else {
      return `Here is LIKEFOOD's shipping policy across all 50 US states: 🚚\n\n` +
        `• 🚚 **Standard Shipping (3-5 days):** $5.99\n` +
        `• ⚡ **Express Shipping (1-2 days):** $12.99\n` +
        `• 🆓 **FREE SHIPPING:** On all orders of **$99** or more!\n\n` +
        `All items are vacuum sealed and securely packed. How can I assist you further? 😊\n\n` +
        `👉 [Browse all products](/products)`;
    }
  }

  // ── 7. THEO DÕI ĐƠN HÀNG ───────────────────────────────────────
  if (
    normalized.includes("don hang") ||
    normalized.includes("theo doi") ||
    normalized.includes("tra cuu") ||
    normalized.includes("kiem tra don") ||
    normalized.includes("order") ||
    normalized.includes("tracking")
  ) {
    // Check if user provided an order number in the query
    const orderMatch = cleaned.match(/(?:LF|#)?([0-9]{3,})/i);
    if (orderMatch) {
      const orderIdOrNum = parseInt(orderMatch[1], 10);
      const foundOrder = await prisma.order.findFirst({
        where: { id: orderIdOrNum },
        include: { orderItems: { include: { product: true } } },
      }).catch(() => null);

      if (foundOrder) {
        const statusMap: Record<string, string> = {
          PENDING: "Đang chờ xác nhận ⏳",
          PROCESSING: "Đang đóng gói 📦",
          SHIPPED: "Đang vận chuyển 🚚",
          DELIVERED: "Đã giao thành công ✅",
          CANCELLED: "Đã hủy ❌",
        };
        const st = statusMap[foundOrder.status] || foundOrder.status;
        return isVi
          ? `Dạ, em tìm thấy đơn hàng **#${foundOrder.id}** của bạn:\n\n` +
          `• **Trạng thái:** ${st}\n` +
          `• **Tổng tiền:** $${Number(foundOrder.total).toFixed(2)}\n` +
          `• **Số lượng món:** ${foundOrder.orderItems.length} món\n` +
          `• **Ngày đặt:** ${new Date(foundOrder.createdAt).toLocaleDateString("vi-VN")}\n\n` +
          `👉 Bạn có thể xem chi tiết hành trình tại mục **[Đơn hàng của tôi](/orders)** nhé! 😊`
          : `Found your order **#${foundOrder.id}**:\n` +
          `• Status: ${st}\n` +
          `• Total: $${Number(foundOrder.total).toFixed(2)}\n` +
          `👉 Track anytime in your account at **[My Orders](/orders)**! 😊`;
      }
    }

    if (isVi) {
      return `Dạ, để theo dõi đơn hàng của bạn: 📦\n\n` +
        `1. 👉 Bấm vào **[Đơn hàng của tôi](/orders)** sau khi đăng nhập để xem chi tiết mã vận đơn và lộ trình vận chuyển.\n` +
        `2. Hoặc bạn có thể gửi trực tiếp **Mã đơn hàng** (ví dụ: *#101*) vào đây, em sẽ tra cứu trạng thái ngay cho bạn ạ! 😊`;
    } else {
      return `To track your order: 📦\n` +
        `1. 👉 Visit **[My Orders](/orders)** in your account menu.\n` +
        `2. Or simply reply with your **Order ID** (e.g., *#101*), and I will look it up right now! 😊`;
    }
  }

  // ── 8. PHƯƠNG THỨC THANH TOÁN ─────────────────────────────────
  if (
    normalized.includes("thanh toan") ||
    normalized.includes("tra tien") ||
    normalized.includes("payment") ||
    normalized.includes("stripe") ||
    normalized.includes("visa") ||
    normalized.includes("mastercard") ||
    normalized.includes("paypal") ||
    normalized.includes("cod")
  ) {
    if (isVi) {
      return `Dạ, LIKEFOOD hỗ trợ nhiều phương thức thanh toán an toàn và tiện lợi: 💳\n\n` +
        `• 💳 **Thẻ quốc tế:** Visa, Mastercard, American Express (bảo mật chuẩn quốc tế qua cổng Stripe)\n` +
        `• 📱 **Ví điện tử:** PayPal, Apple Pay, Google Pay\n` +
        `• 💵 **COD:** Thanh toán khi nhận hàng\n\n` +
        `Mọi thông tin thanh toán đều được mã hóa SSL 256-bit bảo mật tuyệt đối ạ! 😊\n\n` +
        `👉 [Khám phá gian hàng ngay](/products)`;
    } else {
      return `LIKEFOOD accepts secure payment methods via Stripe: 💳\n` +
        `• Credit/Debit cards: Visa, Mastercard, Amex\n` +
        `• Digital wallets: PayPal, Apple Pay, Google Pay\n` +
        `• Cash on Delivery (COD)\n` +
        `All transactions are 256-bit SSL encrypted for your security! 😊\n\n` +
        `👉 [Shop specialties now](/products)`;
    }
  }

  // ── 9. KHUYẾN MÃI / MÃ GIẢM GIÁ / TÍCH ĐIỂM ────────────────────
  if (
    normalized.includes("khuyen mai") ||
    normalized.includes("voucher") ||
    normalized.includes("giam gia") ||
    normalized.includes("coupon") ||
    normalized.includes("diem") ||
    normalized.includes("point") ||
    normalized.includes("xu") ||
    normalized.includes("sale")
  ) {
    if (isVi) {
      return `Dạ, LIKEFOOD đang có các chương trình ưu đãi rất hấp dẫn: 🎟️✨\n\n` +
        `• 🚚 **Freeship toàn nước Mỹ** cho mọi đơn hàng từ **$99** trở lên.\n` +
        `• 🎁 **Tích điểm thưởng LIKEFOOD Xu:** Mỗi $1 mua hàng = 1 xu (dùng trừ tiền trực tiếp ở đơn kế tiếp).\n` +
        `• 📅 **Điểm danh hàng ngày:** Nhận ngay **+5 xu** miễn phí trong tài khoản.\n` +
        `• 👥 **Giới thiệu bạn bè:** Tặng voucher giảm giá cho cả bạn và người được giới thiệu!\n\n` +
        `👉 [Khám phá sản phẩm đang ưu đãi tại Cửa hàng](/products) 😊`;
    } else {
      return `LIKEFOOD active promotions & rewards: 🎟️✨\n` +
        `• **Free Shipping** across USA on orders over $99.\n` +
        `• **Loyalty Points:** Earn points with every purchase ($1 = 1 point).\n` +
        `• **Daily Check-in:** Claim free daily bonus points in your account.\n\n` +
        `👉 [Browse discounted items in Store](/products) 😊`;
    }
  }

  // ── 10. CHÍNH SÁCH ĐỔI TRẢ ─────────────────────────────────────
  if (
    normalized.includes("doi tra") ||
    normalized.includes("hoan tien") ||
    normalized.includes("return") ||
    normalized.includes("refund")
  ) {
    if (isVi) {
      return `Dạ, LIKEFOOD cam kết chính sách đổi trả vì quyền lợi khách hàng: 🔄\n\n` +
        `• 🛡️ **Đổi trả miễn phí trong 7 ngày** nếu sản phẩm bị hư hỏng do vận chuyển hoặc không đúng mô tả.\n` +
        `• 💵 **Hoàn tiền 100%** qua phương thức thanh toán ban đầu của bạn.\n` +
        `• 📞 Bạn chỉ cần chụp ảnh tình trạng sản phẩm và nhắn tại đây hoặc gửi email đến \`tranquocvu3011@gmail.com\`, shop sẽ giải quyết ngay trong 24 giờ ạ! 😊`;
    } else {
      return `LIKEFOOD 7-Day Hassle-Free Returns: 🔄\n` +
        `• 100% refund or replacement if items are damaged during transit.\n` +
        `• Quick resolution within 24 hours. Contact us via chat or email anytime! 😊`;
    }
  }

  // ── 11. THÔNG TIN CỬA HÀNG / LIÊN HỆ ───────────────────────────
  if (
    normalized.includes("cua hang") ||
    normalized.includes("dia chi") ||
    normalized.includes("lien he") ||
    normalized.includes("hotline") ||
    normalized.includes("o dau") ||
    normalized.includes("store") ||
    normalized.includes("address") ||
    normalized.includes("contact")
  ) {
    if (isVi) {
      return `Dạ, thông tin liên hệ của cửa hàng LIKEFOOD: 🏪📍\n\n` +
        `• 📍 **Địa chỉ:** Omaha, NE 68136, USA\n` +
        `• 📞 **Hotline hỗ trợ:** 402-315-8105\n` +
        `• ✉️ **Email:** tranquocvu3011@gmail.com\n` +
        `• ⏰ **Giờ phục vụ:** 24/7 online\n` +
        `• 🚚 **Phạm vi giao hàng:** Toàn bộ 50 bang Hoa Kỳ\n\n` +
        `👉 [Xem tất cả sản phẩm của LIKEFOOD](/products) 😊`;
    } else {
      return `LIKEFOOD Store Information: 🏪📍\n` +
        `• 📍 **Location:** Omaha, NE 68136, USA\n` +
        `• 📞 **Hotline:** 402-315-8105\n` +
        `• ✉️ **Email:** tranquocvu3011@gmail.com\n` +
        `• 🚚 Ships across all 50 US States! 😊\n\n` +
        `👉 [Explore our products](/products)`;
    }
  }

  // ── 12. CHÀO HỎI / GIỚI THIỆU ──────────────────────────────────
  if (
    normalized === "xin chao" ||
    normalized === "chao" ||
    normalized === "chao ban" ||
    normalized === "hello" ||
    normalized === "hi" ||
    normalized === "hey" ||
    normalized.startsWith("xin chao") ||
    normalized.startsWith("chao shop")
  ) {
    if (isVi) {
      return `Xin chào bạn! 👋 Em là **LIKEFOOD AI** — trợ lý ẩm thực đặc sản Việt Nam tại Mỹ.\n\n` +
        `Em có thể hỗ trợ bạn:\n` +
        `🛒 **Tìm kiếm đặc sản:** Cá khô, tôm khô, mực khô, bánh mứt, gia vị...\n` +
        `🎁 **Tư vấn combo quà biếu:** Cho người thân, đối tác dịp lễ Tết\n` +
        `📦 **Tra cứu đơn hàng & chính sách giao hàng** toàn nước Mỹ\n\n` +
        `👉 Bạn có thể bấm vào [Xem Cửa Hàng](/products) hoặc nhắn món ngon bạn đang tìm để em đưa link trực tiếp nhé! 😊`;
    } else {
      return `Hello! 👋 I'm **LIKEFOOD AI** — your shopping assistant for authentic Vietnamese specialties in the USA.\n\n` +
        `How may I assist you today? Feel free to ask about our dried seafood, snacks, teas, or gift combos!\n\n` +
        `👉 [Browse our Store](/products) 😊`;
    }
  }

  // ── 13. CẢM ƠN ─────────────────────────────────────────────────
  if (
    normalized.includes("cam on") ||
    normalized.includes("thank") ||
    normalized.includes("ok em") ||
    normalized.includes("tuyet voi")
  ) {
    return isVi
      ? `Dạ không có gì ạ! Rất vui được hỗ trợ bạn. Chúc bạn có trải nghiệm mua sắm thật ngon miệng và vui vẻ tại LIKEFOOD nhé! Nếu cần xem thêm sản phẩm, bạn có thể ghé 👉 [Cửa hàng LIKEFOOD](/products) bất cứ lúc nào ạ. ❤️😊`
      : `You're very welcome! If you need anything else, feel free to visit 👉 [LIKEFOOD Store](/products) anytime. Have a wonderful day! ❤️😊`;
  }

  // ── 14. TÌM KIẾM THEO TỪ KHÓA TỰ DO TRONG DATABASE ─────────────
  // Extract keywords to search products
  const words = cleaned
    .replace(/[?,.!]/g, "")
    .split(/\s+/)
    .filter((w) => w.length >= 2);

  if (words.length > 0) {
    const searchConditions = words.map((w) => ({
      OR: [
        { name: { contains: w } },
        { description: { contains: w } },
        { category: { contains: w } },
      ],
    }));

    const matchedProducts = await prisma.product.findMany({
      where: {
        isDeleted: false,
        OR: searchConditions,
      },
      take: 4,
    }).catch(() => []);

    if (matchedProducts.length > 0) {
      if (isVi) {
        let res = `Dạ, em tìm thấy các sản phẩm phù hợp với nhu cầu của bạn đây ạ: 🛍️\n\n`;
        matchedProducts.forEach((p) => {
          const orig = p.originalPrice ? ` ~~$${p.originalPrice.toFixed(2)}~~` : "";
          res += `• 🛒 **[${p.name}](/products/${p.slug})** — **$${p.price.toFixed(2)}**${orig}\n`;
          if (p.description) {
            res += `  *${p.description.slice(0, 100)}...*\n`;
          }
          res += `  👉 [Xem chi tiết & Mua ngay](/products/${p.slug})\n\n`;
        });
        res += `Bạn có thể bấm trực tiếp vào link trên để xem chi tiết hoặc đặt hàng nhé! 😊`;
        return res;
      } else {
        let res = `Here are the matching products from our store: 🛍️\n\n`;
        matchedProducts.forEach((p) => {
          res += `• 🛒 **[${p.name}](/products/${p.slug})** — **$${p.price.toFixed(2)}**\n`;
          res += `  👉 [View Product Details](/products/${p.slug})\n\n`;
        });
        return res;
      }
    }
  }

  // ── 15. DEFAULT SMART CATALOG OVERVIEW ──────────────────────────
  // If no match found, present the store's full specialty categories and bestsellers
  const topProducts = await prisma.product.findMany({
    where: { isDeleted: false, featured: true },
    take: 3,
  }).catch(() => []);

  if (isVi) {
    let res = `Dạ, LIKEFOOD chuyên cung cấp các mặt hàng đặc sản Việt Nam chính gốc tại Mỹ với các danh mục nổi bật: 🍜✨\n\n` +
      `1. 🐟 **[Cá khô & Hải sản](/products?category=Cá+khô):** Cá dứa 1 nắng, Cá đù 1 nắng, Cá chỉ vàng, Tôm khô...\n` +
      `2. 🦐 **[Tôm & Mực khô](/products?category=Tôm+%26+Mực+khô):** Tôm khô đặc sản, Tép khô sấy ăn liền, Bánh phồng tôm...\n` +
      `3. 🥭 **[Trái cây sấy](/products?category=Trái+cây+sấy):** Cóc sấy chanh muối, Bột đậu nành, Bột rau má đậu xanh...\n` +
      `4. 🍵 **[Trà & Thức uống](/products?category=Trà+%26+Thức+uống):** Trà tâm sen, Trà thảo mộc, Trà vị ổi hồng, Trà Nestea...\n` +
      `5. 🧂 **[Gia vị Việt](/products?category=Gia+vị+Việt):** Tỏi đen, Hành phi, Canh chua ăn liền, Canh riêu tôm...\n\n`;

    if (topProducts.length > 0) {
      res += `🌟 **Sản phẩm nổi bật:**\n`;
      topProducts.forEach((p) => {
        res += `• 🛒 **[${p.name}](/products/${p.slug})** — **$${p.price.toFixed(2)}** 👉 [Xem sản phẩm](/products/${p.slug})\n`;
      });
      res += `\n`;
    }

    res += `Bạn có thể bấm trực tiếp vào bất kỳ link nào ở trên để xem chi tiết sản phẩm ạ! Hoặc bạn muốn tìm món gì cứ nhắn cho em nhé! 😊`;
    return res;
  } else {
    return `LIKEFOOD specializes in authentic Vietnamese specialties:\n` +
      `1. 🐟 [Dried Fish & Seafood](/products?category=Cá+khô)\n` +
      `2. 🦐 [Dried Shrimp & Squid](/products?category=Tôm+%26+Mực+khô)\n` +
      `3. 🥭 [Tropical Dried Fruits & Flours](/products?category=Trái+cây+sấy)\n` +
      `4. 🍵 [Traditional Teas & Drinks](/products?category=Trà+%26+Thức+uống)\n` +
      `5. 🧂 [Authentic Spices & Quick Soups](/products?category=Gia+vị+Việt)\n\n` +
      `Free USA shipping on orders from $99! Click any link above to view details! 😊`;
  }
}
