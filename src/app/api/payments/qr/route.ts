/**
 * LIKEFOOD - Vietnamese Specialty Marketplace
 * Copyright (c) 2026 LIKEFOOD Team
 * Licensed under the MIT License
 * https://github.com/tranquocvu-3011/likefood
 */

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";
import QRCode from "qrcode";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { type, amount, orderId, bankAccount, bankName, momoPhone, zaloPayPhone } = body;

        if (!type || !amount) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        let qrResult = "";
        
        // Generate QR content based on payment type
        switch (type) {
            case "BANK":
            case "VNPAY":
                if (!bankAccount || !bankName) {
                    return NextResponse.json({ error: "Bank account details required" }, { status: 400 });
                }
                // Return direct VietQR URL (no need for QRCode.toDataURL wrapper)
                qrResult = `https://img.vietqr.io/image/${bankName}-${bankAccount}-compact2.jpg?amount=${amount}&addInfo=LIKEFOOD%20${orderId || ""}`;
                break;

            case "MOMO":
                if (!momoPhone) {
                    return NextResponse.json({ error: "MoMo phone number required" }, { status: 400 });
                }
                // Full P2P format with Name
                const momoData = `2|99|${momoPhone}|TRAN NGUYEN BAO DANG||0|0|${amount}`;
                qrResult = await QRCode.toDataURL(momoData);
                break;

            case "ZALOPAY":
                if (!zaloPayPhone) {
                    return NextResponse.json({ error: "ZaloPay phone number required" }, { status: 400 });
                }
                // Format: ZaloPay link inside QR
                qrResult = await QRCode.toDataURL(`https://zaloapp.com/pay/${zaloPayPhone}?amount=${amount}&desc=LIKEFOOD ${orderId || ""}`);
                break;

            default:
                return NextResponse.json({ error: "Invalid payment type" }, { status: 400 });
        }

        return NextResponse.json({
            qrCode: qrResult,
            type,
            amount,
            orderId
        }, { status: 200 });

    } catch (error) {
        logger.error("[QR_GENERATE_ERROR]", error as Error, { context: "payments-qr-api" });
        return NextResponse.json({ error: "Failed to generate QR code" }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const type = searchParams.get("type") || "VNPAY";
        const amount = searchParams.get("amount");
        const orderId = searchParams.get("orderId");

        if (!amount) {
            return NextResponse.json({ error: "Amount is required" }, { status: 400 });
        }

        // Get payment settings from database
        const settings = await prisma.systemsetting.findMany({
            where: {
                key: {
                    in: [
                        "bank_name",
                        "bank_account_number",
                        "bank_account_name",
                        "payment_momo_enabled",
                        "zalo_pay_enabled"
                    ]
                }
            }
        });

        logger.info("QR payment settings found", { count: settings.length, keys: settings.map(s => s.key) });
        
        const settingsMap = settings.reduce((acc: Record<string, string>, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {} as Record<string, string>);

        let qrCodeUrl = "";
        const bankName = settingsMap.bank_name || "MB";
        const bankAccount = settingsMap.bank_account_number || "";

        if ((type === "BANK" || type === "VNPAY") && bankAccount) {
            // RETURN THE DIRECT VietQR IMAGE URL (Most reliable)
            qrCodeUrl = `https://img.vietqr.io/image/${encodeURIComponent(bankName)}-${bankAccount}-compact2.jpg?amount=${amount}&addInfo=LIKEFOOD%20${orderId || ""}`;
        } else if (type === "MOMO") {
            // Full P2P format with Name for better recognition
            const momoPhone = settingsMap.momo_phone || "0341011200"; 
            const name = "TRAN NGUYEN BAO DANG";
            const momoData = `2|99|${momoPhone}|${name}||0|0|${amount}`;
            qrCodeUrl = await QRCode.toDataURL(momoData);
        } else {
            // Fallback generic QR
            qrCodeUrl = await QRCode.toDataURL(`${type}|${amount}|${orderId || ""}`);
        }

        return NextResponse.json({
            qrCode: qrCodeUrl, // The frontend will use this as <img src={qrCode} />
            type,
            amount,
            orderId,
            bankName,
            bankAccount
        }, { status: 200 });

    } catch (error) {
        logger.error("[QR_GET_ERROR]", error as Error, { context: "payments-qr-api" });
        return NextResponse.json({ error: "Failed to generate QR code" }, { status: 500 });
    }
}
