import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { conversions, upscales, sharedLinks } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getUserSession } from "@/lib/server-utils";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const session = await getUserSession(req);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, type, expiration, password } = await req.json();
    const userId = session.user.id;

    let fileInfo: { fileName: string, filePath: string | null } | null = null;

    if (type === 'conversion') {
        const results = await db.select().from(conversions).where(and(eq(conversions.id, id), eq(conversions.userId, userId))).limit(1);
        if (results.length > 0) fileInfo = results[0];
    } else if (type === 'upscale') {
        const results = await db.select().from(upscales).where(and(eq(upscales.id, id), eq(upscales.userId, userId))).limit(1);
        if (results.length > 0) fileInfo = results[0];
    }

    if (!fileInfo || !fileInfo.filePath) {
      return NextResponse.json({ error: "Fichier introuvable ou non stocké sur le cloud" }, { status: 404 });
    }

    const shareId = uuidv4();
    const expirationHours = parseInt(expiration || "24");
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expirationHours);

    // Create share link pointing to existing file
    await db.insert(sharedLinks).values({
      id: shareId,
      fileName: fileInfo.fileName,
      filePath: fileInfo.filePath,
      password: password || null,
      expiresAt: expiresAt,
      userId: userId
    });

    const shareUrl = `${new URL(req.url).origin.replace('/api/share/create-from-cloud', '')}/share/${shareId}`;

    return NextResponse.json({ shareUrl, expiresAt });
  } catch (error: any) {
    console.error("Cloud Share Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
