import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { fileStorage, sharedLinks } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // 1. Chercher le contenu dans la DB
    const fileRecord = await db.select().from(fileStorage).where(eq(fileStorage.id, id)).limit(1);

    if (fileRecord.length > 0) {
        const buffer = fileRecord[0].content;
        return new NextResponse(buffer as any, {
            headers: {
                "Content-Type": "application/octet-stream",
                "Content-Disposition": `attachment; filename="download-${id}"`, // Nom par défaut, sera surchargé si possible
            }
        });
    }

    // 2. Fallback: Vérifier si c'est un lien partagé pour récupérer le nom
    const linkRecord = await db.select().from(sharedLinks).where(eq(sharedLinks.id, id)).limit(1);
    if (linkRecord.length > 0 && linkRecord[0].filePath.startsWith('db://')) {
         const storageId = linkRecord[0].filePath.replace('db://', '');
         const storedFile = await db.select().from(fileStorage).where(eq(fileStorage.id, storageId)).limit(1);
         if (storedFile.length > 0) {
            return new NextResponse(storedFile[0].content as any, {
                headers: {
                    "Content-Type": "application/octet-stream",
                    "Content-Disposition": `attachment; filename="${linkRecord[0].fileName}"`,
                }
            });
         }
    }

    return NextResponse.json({ error: "Fichier introuvable" }, { status: 404 });

  } catch (error: any) {
    console.error("Download error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
