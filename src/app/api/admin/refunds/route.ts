/**
 * LIKEFOOD - Vietnamese Specialty Marketplace
 * Copyright (c) 2026 LIKEFOOD Team
 * Licensed under the MIT License
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";

// GET - List all refund requests with filter & pagination
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "15", 10)));
    const status = searchParams.get("status") || "ALL";
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status !== "ALL") {
      where.status = status;
    }

    const [refunds, total] = await Promise.all([
      prisma.refundrequest.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          order: {
            select: {
              id: true,
              total: true,
              status: true,
              createdAt: true,
              orderItems: {
                select: {
                  id: true,
                  quantity: true,
                  price: true,
                  product: {
                    select: {
                      id: true,
                      name: true,
                      image: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
      prisma.refundrequest.count({ where }),
    ]);

    return NextResponse.json({
      refunds,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error("Admin refunds list error", error as Error, { context: "admin-refunds-get" });
    return NextResponse.json({ error: "Failed to fetch refunds" }, { status: 500 });
  }
}

// PATCH - Update refund request status (APPROVED, REJECTED, PROCESSING, COMPLETED)
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, status, adminNote } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "ID and status are required" }, { status: 400 });
    }

    const validStatuses = ["PENDING", "APPROVED", "REJECTED", "PROCESSING", "COMPLETED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const existing = await prisma.refundrequest.findUnique({
      where: { id: Number(id) },
      include: { user: true, order: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Refund request not found" }, { status: 404 });
    }

    const updated = await prisma.refundrequest.update({
      where: { id: Number(id) },
      data: {
        status,
        adminNote: adminNote !== undefined ? adminNote : existing.adminNote,
        processedAt: status !== "PENDING" ? new Date() : existing.processedAt,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        order: { select: { id: true, total: true, status: true } },
      },
    });

    // Create order event for tracking
    try {
      await prisma.orderevent.create({
        data: {
          orderId: existing.orderId,
          status: status === "COMPLETED" ? "REFUNDED" : existing.order.status,
          note: `Yêu cầu đổi/trả #${id}: ${status} ${adminNote ? `(Ghi chú: ${adminNote})` : ""}`,
        },
      });

      // Update order status if COMPLETED
      if (status === "COMPLETED") {
        await prisma.order.update({
          where: { id: existing.orderId },
          data: { status: "REFUNDED", paymentStatus: "REFUNDED" },
        });
      }
    } catch {
      // Ignore non-critical event log fail
    }

    return NextResponse.json({ success: true, refund: updated });
  } catch (error) {
    logger.error("Admin refund update error", error as Error, { context: "admin-refunds-patch" });
    return NextResponse.json({ error: "Failed to update refund" }, { status: 500 });
  }
}

