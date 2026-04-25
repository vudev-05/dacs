/**
 * LIKEFOOD - Stripe Checkout Session API
 * Last updated: 2026-04-21 20:00 (Forced reload)
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { getShippingFeeUsd } from "@/lib/commerce";
import { checkoutRateLimit, getRateLimitIdentifier, applyRateLimit } from "@/lib/ratelimit";
import { encrypt } from "@/lib/encryption";

const roundUsd = (amount: number) => Math.round(amount * 100) / 100;

interface CheckoutItem {
    productId: string | number;
    variantId?: string | number | null;
    quantity: number;
}

export async function POST(req: NextRequest) {
    try {
        const authSession = await getServerSession(authOptions);
        if (!authSession?.user?.id) {
            return NextResponse.json({ error: "Vui lòng đăng nhập để thanh toán" }, { status: 401 });
        }

        const identifier = getRateLimitIdentifier(req, String(authSession.user.id));
        const rateResult = await applyRateLimit(identifier, checkoutRateLimit);
        if (!rateResult.success && rateResult.error) return rateResult.error;

        const body = await req.json();
        const {
            items, shippingAddress, shippingCity, shippingZipCode, shippingPhone,
            shippingMethod = "standard", paymentMethod = "STRIPE", fullName, email,
            couponCode, pointsToUse = 0, notes,
        } = body;

        let userId = Number(authSession.user.id);
        logger.info("Checkout request received", { paymentMethod, userId, itemCount: items?.length });

        if (!items || !Array.isArray(items) || items.length === 0) return NextResponse.json({ error: "Giỏ hàng trống" }, { status: 400 });
        if (!shippingPhone) return NextResponse.json({ error: "Vui lòng nhập số điện thoại" }, { status: 400 });

        const productIds = [...new Set(items.map((i) => Number(i.productId)))];
        const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
        const productMap = new Map(products.map((p) => [p.id, p]));

        const now = new Date();
        const lineItemsData: any[] = [];
        for (const item of items) {
            const product = productMap.get(Number(item.productId));
            if (!product) continue;
            let basePrice = product.price;
            if (product.isOnSale && product.salePrice && product.saleStartAt && product.saleEndAt && product.saleStartAt <= now && product.saleEndAt >= now) {
                basePrice = product.salePrice;
            }
            lineItemsData.push({
                productId: product.id,
                variantId: item.variantId ? Number(item.variantId) : null,
                quantity: item.quantity,
                unitPrice: basePrice,
                name: product.name,
                image: product.image,
            });
        }

        const subtotal = lineItemsData.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
        const calculatedShippingFee = getShippingFeeUsd(subtotal, shippingMethod);
        let calculatedDiscount = 0;
        let pointsDiscountAmount = Math.max(0, pointsToUse / 100);
        const total = Math.max(0, subtotal + calculatedShippingFee - calculatedDiscount - pointsDiscountAmount);
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

        if (total <= 0) {
            const order = await prisma.$transaction(async (tx) => {
                const newOrder = await tx.order.create({
                    data: {
                        userId, status: "CONFIRMED", subtotal, shippingFee: calculatedShippingFee,
                        total: 0, paymentMethod: "FREE", paymentStatus: "PAID",
                        shippingAddress, shippingCity, shippingPhone,
                        orderItems: { create: lineItemsData.map(i => ({ productId: i.productId, quantity: i.quantity, price: i.unitPrice, nameSnapshot: i.name })) }
                    }
                });

                // Clear cart
                await tx.cartitem.deleteMany({
                    where: { cart: { userId } }
                });

                return newOrder;
            });
            return NextResponse.json({ url: `${appUrl}/order-success?orderId=${order.id}` });
        }

        // 3. Handle Offline Payments (Momo/Bank/COD)
        if (paymentMethod === "MOMO" || paymentMethod === "BANK" || paymentMethod === "COD") {
            const order = await prisma.$transaction(async (tx) => {
                const newOrder = await tx.order.create({
                    data: {
                        userId, status: "PENDING", subtotal, shippingFee: calculatedShippingFee,
                        total, paymentMethod, paymentStatus: "UNPAID",
                        shippingAddress, shippingCity, shippingPhone,
                        orderItems: { create: lineItemsData.map(i => ({ productId: i.productId, quantity: i.quantity, price: i.unitPrice, nameSnapshot: i.name })) }
                    }
                });

                // Clear cart
                await tx.cartitem.deleteMany({
                    where: { cart: { userId } }
                });

                return newOrder;
            });
            
            return NextResponse.json({ url: `${appUrl}/order-success?orderId=${order.id}&method=${paymentMethod}` });
        }

        const stripe = await getStripe();
        
        // --- Premium Demo Flow ---
        // If we detect placeholders and are in dev/demo mode, we can mock the Stripe redirect
        // to allow the user to see the success page and test the full flow.
        const isPlaceholder = process.env.STRIPE_SECRET_KEY?.includes("placeholder") || (await getStripe().then(s => s.apiKey.includes("placeholder"))).catch(() => true);
        
        if (isPlaceholder && process.env.NODE_ENV === "development") {
            logger.info("Demo Mode: Redirecting to success page since placeholder keys are used", { userId });
            
            // Create the order immediately in demo mode (similar to COD but marked as Stripe)
            const order = await prisma.$transaction(async (tx) => {
                const newOrder = await tx.order.create({
                    data: {
                        userId, status: "CONFIRMED", subtotal, shippingFee: calculatedShippingFee,
                        total, paymentMethod: "STRIPE_DEMO", paymentStatus: "PAID",
                        shippingAddress, shippingCity, shippingPhone,
                        orderItems: { create: lineItemsData.map(i => ({ productId: i.productId, quantity: i.quantity, price: i.unitPrice, nameSnapshot: i.name })) }
                    }
                });
                await tx.cartitem.deleteMany({ where: { cart: { userId } } });
                return newOrder;
            });

            return NextResponse.json({ url: `${appUrl}/order-success?orderId=${order.id}&method=STRIPE&demo=true` });
        }

        const line_items = lineItemsData.map((item) => ({
            quantity: item.quantity,
            price_data: {
                currency: "usd",
                unit_amount: Math.round(item.unitPrice * 100),
                product_data: { name: item.name },
            },
        }));

        const session = await stripe.checkout.sessions.create({
            mode: "payment",
            line_items,
            success_url: `${appUrl}/order-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${appUrl}/checkout`,
            metadata: { 
                userId: String(userId), 
                shippingAddress: shippingAddress || "",
                shippingCity: shippingCity || "",
                shippingPhone: shippingPhone || "",
                subtotal: String(subtotal),
                total: String(total),
                shippingFee: String(calculatedShippingFee),
                items: JSON.stringify(lineItemsData.map(i => ({ pid: i.productId, qty: i.quantity, price: i.unitPrice, name: i.name })))
            },
        });

        logger.info("Checkout session created", { paymentMethod, sessionId: session.id });
        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        // Detailed error for developers, clean message for users
        const isStripeError = error?.type?.startsWith("Stripe");
        const errorMessage = isStripeError 
            ? `Stripe Configuration Error: ${error.message}. Please check your API keys in .env or Admin Dashboard.`
            : (error?.message || "Internal server error during checkout");

        logger.error("Checkout error", { 
            message: error.message,
            stack: error.stack,
            type: error.name
        });

        return NextResponse.json({ 
            error: isStripeError ? "Payment Configuration Error" : "Checkout failed", 
            message: errorMessage,
            code: error?.code || "INTERNAL_ERROR"
        }, { status: isStripeError ? 400 : 500 });
    }
}
