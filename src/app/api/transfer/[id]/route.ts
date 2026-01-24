import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sharedLinks, fileStorage } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getUserSession } from "@/lib/server-utils";

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getUserSession(req);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const userId = session.user.id;

        // 1. Trouver le lien pour récupérer le filePath (id du stockage)
        const link = await db.select()
            .from(sharedLinks)
            .where(and(eq(sharedLinks.id, id), eq(sharedLinks.userId, userId)))
            .limit(1);

        if (link.length === 0) {
            return NextResponse.json({ error: "Lien introuvable" }, { status: 404 });
        }

        const filePath = link[0].filePath;

        // 2. Supprimer le lien de partage
        await db.delete(sharedLinks).where(eq(sharedLinks.id, id));

        // 3. Si le fichier est en DB, le supprimer de fileStorage
        if (filePath.startsWith('db://')) {
            const storageId = filePath.replace('db://', '');
            await db.delete(fileStorage).where(eq(fileStorage.id, storageId));
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
