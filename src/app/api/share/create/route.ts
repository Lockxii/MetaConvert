import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sharedLinks, fileStorage } from "@/db/schema";
import { auth } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";
import { sql } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    const formData = await req.formData();
    
    const file = formData.get("file") as File;
    const expirationHours = parseInt(formData.get("expiration") as string || "24");
    const password = formData.get("password") as string | null;

    if (!file) {
      return NextResponse.json({ error: "Fichier requis" }, { status: 400 });
    }

    const fileId = uuidv4();
    const fileName = file.name;
    const buffer = Buffer.from(await file.arrayBuffer());

    // Auto-repair DB if needed
    try {
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS "file_storage" (
                "id" text PRIMARY KEY NOT NULL,
                "content" bytea NOT NULL,
                "created_at" timestamp DEFAULT now()
            );
        `);
    } catch (e) {}

    // Store content in DB
    await db.insert(fileStorage).values({
        id: fileId,
        content: buffer
    });

    // Calcul de l'expiration
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expirationHours);

    // Enregistrement en DB
    await db.insert(sharedLinks).values({
      id: fileId,
      fileName: fileName,
      filePath: `db://${fileId}`, // Point to DB storage
      password: password, 
      expiresAt: expiresAt,
      userId: session?.user?.id || null
    });

    const shareUrl = `${new URL(req.url).origin}/share/${fileId}`;

    return NextResponse.json({ shareUrl, expiresAt });
  } catch (error: any) {
    console.error("Erreur Share:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
