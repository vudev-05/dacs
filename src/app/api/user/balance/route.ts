import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: Number(session.user.id) },
            select: { balance: true }
        });

        return NextResponse.json({ balance: Number(user?.balance || 0) });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch balance" }, { status: 500 });
    }
}
