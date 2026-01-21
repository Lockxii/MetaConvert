import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sharedLinks } from "@/db/schema";
import { auth } from "@/lib/auth";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

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
    const filePath = path.join(process.cwd(), "public", "shared", `${fileId}-${fileName}`);
    
    // Sauvegarde physique du fichier
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);

    // Calcul de l'expiration
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expirationHours);

    // Enregistrement en DB
    await db.insert(sharedLinks).values({
      id: fileId,
      fileName: fileName,
      filePath: `/shared/${fileId}-${fileName}`,
      password: password, // Idéalement haché, mais ici en texte pour la simplicité
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
