import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sharedLinks } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { getUserSession } from "@/lib/server-utils";

export async function GET(req: NextRequest) {
    try {
        const session = await getUserSession(req);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;
        
        // On récupère uniquement les liens de type "transfert" (ceux créés manuellement ou via cette page)
        // Pour MetaConvert, on filtre par ceux qui ont un filePath commençant par db://
        const links = await db.select()
            .from(sharedLinks)
            .where(and(
                eq(sharedLinks.userId, userId),
                // On peut ajouter un filtre supplémentaire si nécessaire
            ))
            .orderBy(desc(sharedLinks.createdAt));

        return NextResponse.json({ links });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
