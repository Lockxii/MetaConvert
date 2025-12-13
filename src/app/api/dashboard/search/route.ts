import { NextRequest, NextResponse } from "next/server";
import { getUserSession } from "@/lib/server-utils";
import { db } from "@/db";
import { conversions, upscales } from "@/db/schema";
import { eq, like, or, sql, and, ilike, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
    try {
        const session = await getUserSession(req);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const userId = session.user.id;
        
        const { searchParams } = new URL(req.url);
        const query = searchParams.get("query") || "";

        if (!query) {
            return NextResponse.json({ conversions: [], upscales: [] });
        }

        const searchTerm = `%${query.toLowerCase()}%`;

        const foundConversions = await db.query.conversions.findMany({
            where: and(
                eq(conversions.userId, userId),
                or(
                    ilike(conversions.fileName, searchTerm),
                    ilike(conversions.fileType, searchTerm),
                    ilike(conversions.targetType, searchTerm)
                )
            ),
            orderBy: desc(conversions.createdAt),
            limit: 10,
        });

        const foundUpscales = await db.query.upscales.findMany({
            where: and(
                eq(upscales.userId, userId),
                ilike(upscales.fileName, searchTerm)
            ),
            orderBy: desc(upscales.createdAt),
            limit: 10,
        });

        return NextResponse.json({
            conversions: foundConversions,
            upscales: foundUpscales,
        });

    } catch (error) {
        console.error("Dashboard search error:", error);
        return NextResponse.json({ error: "Failed to perform search" }, { status: 500 });
    }
}
