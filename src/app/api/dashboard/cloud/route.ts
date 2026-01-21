import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { conversions, upscales } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { getUserSession } from "@/lib/server-utils";

export async function GET(req: NextRequest) {
    try {
        const session = await getUserSession(req);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;
        const dropId = req.nextUrl.searchParams.get("dropId");

        // Fetch conversions
        let conversionsQuery = db.select()
            .from(conversions)
            .where(eq(conversions.userId, userId));
        
        if (dropId) {
            conversionsQuery = db.select()
                .from(conversions)
                .where(and(eq(conversions.userId, userId), eq(conversions.dropLinkId, dropId)));
        }

        const userConversions = await conversionsQuery.orderBy(desc(conversions.createdAt));

        // Fetch upscales
        let upscalesQuery = db.select()
            .from(upscales)
            .where(eq(upscales.userId, userId));

        if (dropId) {
            upscalesQuery = db.select()
                .from(upscales)
                .where(and(eq(upscales.userId, userId), eq(upscales.dropLinkId, dropId)));
        }

        const userUpscales = await upscalesQuery.orderBy(desc(upscales.createdAt));

        // Combine and format with explicit typing to avoid 'any'
        const cloudFiles = [
            ...userConversions.map((c: any) => ({
                id: c.id,
                type: 'conversion' as const,
                fileName: c.fileName,
                fileType: c.fileType,
                targetType: c.targetType,
                status: c.status,
                size: c.convertedSize || 0,
                filePath: c.filePath,
                createdAt: c.createdAt,
            })),
            ...userUpscales.map((u: any) => ({
                id: u.id,
                type: 'upscale' as const,
                fileName: u.fileName,
                fileType: 'image',
                targetType: 'upscaled',
                status: 'completed',
                size: u.upscaledSize || 0,
                filePath: u.filePath,
                createdAt: u.createdAt,
            }))
        ].sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());

        return NextResponse.json({ files: cloudFiles });
    } catch (error: any) {
        console.error("Cloud Fetch Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}