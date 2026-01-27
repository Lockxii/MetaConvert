import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { fileStorage, sharedLinks } from "@/db/schema";
import { getUserSession } from "@/lib/server-utils";
import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";

export const maxDuration = 60; // Autorise 60 secondes d'exécution sur Vercel

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
    const fileId = uuidv4();
    const shareId = uuidv4();

    // 1. Convert to Buffer then Base64
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Content = buffer.toString('base64');

    // 2. Store file content
    await db.insert(fileStorage).values({
      id: fileId,
      content: base64Content,
    });

    // 3. Calculate expiration
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expirationDays);

    // 4. Create shared link
    await db.insert(sharedLinks).values({
      id: shareId,
      fileName: file.name,
      filePath: `db://${fileId}`,
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