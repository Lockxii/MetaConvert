import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { fileStorage, sharedLinks } from "@/db/schema";
import { getUserSession } from "@/lib/server-utils";
import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";
import { put } from "@vercel/blob";

export const maxDuration = 60; 

export async function POST(req: NextRequest) {
  try {
    const session = await getUserSession(req);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as unknown as File;
    const expirationDays = parseInt(formData.get("expiration") as string || "7");
    const password = formData.get("password") as string || null;

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
    }

    const userId = session.user.id;
    const shareId = uuidv4();

    // 1. Upload direct vers Vercel Blob
    const buffer = Buffer.from(await file.arrayBuffer());
    const blob = await put(`transfers/${uuidv4()}-${file.name}`, buffer, {
      access: 'public',
    });

    const filePath = blob.url;

    // 2. Calcul expiration
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expirationDays);

    // 3. Création du lien de partage (on stocke l'URL Blob au lieu de db://)
    await db.insert(sharedLinks).values({
      id: shareId,
      fileName: file.name,
      filePath: filePath,
      password: password,
      expiresAt: expiresAt,
      userId: userId,
    });

    const shareUrl = `${new URL(req.url).origin.replace('/api/transfer', '')}/share/${shareId}`;

    return NextResponse.json({ 
        success: true, 
        shareId, 
        shareUrl, 
        expiresAt: expiresAt.toISOString() 
    });
  } catch (error: any) {
    console.error("Transfer API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
    try {
        const session = await getUserSession(req);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;
        const links = await db.select().from(sharedLinks).where(eq(sharedLinks.userId, userId));

        return NextResponse.json({ links });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}