import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { conversions, upscales, sharedLinks, fileStorage } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { getUserSession } from "@/lib/server-utils";

export async function DELETE(req: NextRequest) {
    try {
        const session = await getUserSession(req);
        // Vérification de sécurité Admin (ton email)
        if (session?.user?.email !== "contact.arthur.mouton@gmail.com") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { ids, type } = await req.json();

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ error: "Aucun ID fourni" }, { status: 400 });
        }

        if (type === 'conversion') {
            // 1. Récupérer les filePaths pour supprimer le stockage
            const items = await db.select().from(conversions).where(inArray(conversions.id, ids));
            for (const item of items) {
                if (item.filePath?.startsWith('db://')) {
                    const storageId = item.filePath.replace('db://', '');
                    await db.delete(fileStorage).where(eq(fileStorage.id, storageId));
                }
            }
            // 2. Supprimer les records
            await db.delete(conversions).where(inArray(conversions.id, ids));
        } 
        else if (type === 'transfer') {
            const items = await db.select().from(sharedLinks).where(inArray(sharedLinks.id, ids));
            for (const item of items) {
                if (item.filePath?.startsWith('db://')) {
                    const storageId = item.filePath.replace('db://', '');
                    await db.delete(fileStorage).where(eq(fileStorage.id, storageId));
                }
            }
            await db.delete(sharedLinks).where(inArray(sharedLinks.id, ids));
        }

        return NextResponse.json({ success: true, count: ids.length });
    } catch (error: any) {
        console.error("Admin Delete Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
