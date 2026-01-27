import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sharedLinks } from "@/db/schema";
import { getUserSession } from "@/lib/server-utils";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const session = await getUserSession(req);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { fileName, filePath, expiration, password } = await req.json();

    const shareId = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + parseInt(expiration || "7"));

    await db.insert(sharedLinks).values({
      id: shareId,
      fileName,
      filePath,
      password: password || null,
      expiresAt,
      userId: session.user.id,
    });

    const shareUrl = `${new URL(req.url).origin.replace('/api/transfer/save-link', '')}/share/${shareId}`;

    return NextResponse.json({ success: true, shareUrl });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
