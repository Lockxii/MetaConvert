import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sharedLinks } from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const results = await db.select()
      .from(sharedLinks)
      .where(
        and(
          eq(sharedLinks.id, id),
          gt(sharedLinks.expiresAt, new Date()) // Vérifie que ce n'est pas expiré
        )
      )
      .limit(1);

    if (results.length === 0) {
      return NextResponse.json({ error: "Lien expiré ou invalide" }, { status: 404 });
    }

    const link = results[0];
    
    // On ne renvoie pas le filePath ni le password au client directement
    return NextResponse.json({
      id: link.id,
      fileName: link.fileName,
      hasPassword: !!link.password,
      expiresAt: link.expiresAt
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { password } = await req.json();

        const results = await db.select()
            .from(sharedLinks)
            .where(eq(sharedLinks.id, id))
            .limit(1);

        if (results.length === 0) {
            return NextResponse.json({ error: "Introuvable" }, { status: 404 });
        }

        const link = results[0];

        if (link.password && link.password !== password) {
            return NextResponse.json({ error: "Mot de passe incorrect" }, { status: 401 });
        }

        return NextResponse.json({ downloadUrl: link.filePath });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
