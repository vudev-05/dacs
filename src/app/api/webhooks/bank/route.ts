/**
 * LIKEFOOD - Automated Bank/MoMo Verification Webhook
 * This API can be called by bank polling systems (VietQR, Casso, SePay, etc)
 * or a manual bot to confirm transactions.
 * 
 * Expected payload (JSON):
 * {
 *   "amount": 100000,
 *   "content": "LIKEFOOD 123",  // for Order #123
 *   "reference": "BANK_TX_999", // unique transaction ID
 *   "method": "BANK"            // BANK or MOMO
 * }
 */

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { amount, content, reference, method = "BANK" } = body;

        if (!amount || !content || !reference) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        logger.info(`[BANK_WEBHOOK] Received transaction: ${reference} | ${content} | ${amount}`);

        // 1. Check for idempotency (don't process same transaction twice)
        const existingTx = await prisma.transaction.findUnique({
            where: { reference }
        });
        if (existingTx && existingTx.status === "SUCCESS") {
            return NextResponse.json({ success: true, message: "Transaction already processed" });
        }

        // 2. Parse content to find Order ID or User ID (for top-up)
        const orderMatch = content.match(/LIKEFOOD\s+(\d+)/i);
        const topupMatch = content.match(/LIKEFOOD\s+NAP\s+(\d+)/i);

        if (orderMatch) {
            const orderId = parseInt(orderMatch[1]);
            return await handleOrderPayment(orderId, amount, reference, method);
        } else if (topupMatch) {
            const userId = parseInt(topupMatch[1]);
            return await handleUserTopup(userId, amount, reference, method);
        } else {
            // Log unrecognized transaction for manual review
            await prisma.transaction.create({
                data: {
                    userId: 0, // System/Unmatched
                    amount,
                    type: "DEPOSIT",
                    status: "FAILED",
                    method,
                    reference,
                    note: `Unrecognized content: ${content}`
                }
            }).catch(() => {});
            
            return NextResponse.json({ error: "Unrecognized transaction content" }, { status: 400 });
        }

    } catch (error) {
        logger.error("[BANK_WEBHOOK] Error handling bank webhook", error as Error, { context: "bank-webhook" });
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

async function handleOrderPayment(orderId: number, amount: number, reference: string, method: string) {
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { user: true }
    });

    if (!order) {
        return NextResponse.json({ error: `Order #${orderId} not found` }, { status: 404 });
    }

    if (order.paymentStatus === "PAID") {
        return NextResponse.json({ success: true, message: "Order already paid" });
    }

    // Amount validation (Allow small margin or precise match)
    // Note: If amount is in VND, but total is in USD, we need a conversion rate.
    // Assuming simple 1:1 or specific rate for now. 
    // Usually bank transfers in VN are in VND.
    
    // Process payment in transaction
    await prisma.$transaction(async (tx) => {
        // 1. Update order status
        await tx.order.update({
            where: { id: orderId },
            data: {
                paymentStatus: "PAID",
                status: "CONFIRMED",
                paymentIntentId: reference
            }
        });

        // 2. Create transaction record
        await tx.transaction.create({
            data: {
                userId: order.userId,
                amount,
                type: "PURCHASE",
                status: "SUCCESS",
                method,
                reference,
                note: `Payment for Order #${orderId}`
            }
        });

        // 3. Add order event
        await tx.orderevent.create({
            data: {
                orderId,
                status: "CONFIRMED",
                note: `Thanh toán thành công qua ${method}. Ref: ${reference}`
            }
        });
        
        // 4. Loyalty points (Copied from Stripe webhook logic)
        const { POINTS_PER_DOLLAR } = await import("@/lib/commerce");
        const earnedPoints = Math.floor(order.subtotal * POINTS_PER_DOLLAR);
        if (earnedPoints > 0) {
            await tx.user.update({
                where: { id: order.userId },
                data: { points: { increment: earnedPoints } },
            });
            await tx.pointtransaction.create({
                data: {
                    userId: order.userId,
                    orderId: order.id,
                    amount: earnedPoints,
                    type: "EARN",
                    description: `Tích lũy từ đơn hàng #${order.id}`,
                },
            });
        }
    });

    // Notify user & Admin (Trigger existing notification logic)
    try {
        const { createOrderNotification } = await import("@/lib/notifications");
        await createOrderNotification(order.userId, orderId, "CONFIRMED", order.total);
        
        const { sendOrderNotification } = await import("@/lib/telegram");
        await sendOrderNotification({
            orderId,
            customerName: order.user?.name || "Customer",
            customerPhone: "N/A",
            shippingAddress: order.shippingAddress || "N/A",
            paymentMethod: method,
            totalAmount: order.total,
            items: [] // Can be filled if needed
        });
    } catch {}

    return NextResponse.json({ success: true, message: `Order #${orderId} confirmed` });
}

async function handleUserTopup(userId: number, amount: number, reference: string, method: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        return NextResponse.json({ error: `User #${userId} not found` }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
        // 1. Update user balance
        await tx.user.update({
            where: { id: userId },
            data: { balance: { increment: amount } }
        });

        // 2. Create transaction record
        await tx.transaction.create({
            data: {
                userId,
                amount,
                type: "DEPOSIT",
                status: "SUCCESS",
                method,
                reference,
                note: "Nạp tiền vào tài khoản"
            }
        });
    });

    return NextResponse.json({ success: true, message: `User #${userId} balance updated (+ ${amount})` });
}
