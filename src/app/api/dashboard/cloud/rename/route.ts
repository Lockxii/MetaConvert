import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { conversions, upscales } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getUserSession } from "@/lib/server-utils";

export async function POST(req: NextRequest) {
    try {
        const session = await getUserSession(req);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id, type, newName } = await req.json();
        const userId = session.user.id;

        if (!newName) {
            return NextResponse.json({ error: "Le nom est requis" }, { status: 400 });
        }

        if (type === 'conversion') {
            await db.update(conversions)
                .set({ fileName: newName })
                .where(and(eq(conversions.id, id), eq(conversions.userId, userId)));
        } else if (type === 'upscale') {
            await db.update(upscales)
                .set({ fileName: newName })
                .where(and(eq(upscales.id, id), eq(upscales.userId, userId)));
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Cloud Rename Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
