import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // .keepMetadata(false) ou simplement ne pas appeler .withMetadata() supprime les EXIF par défaut dans sharp
    const outputBuffer = await sharp(buffer)
      .rotate() // Garde l'orientation correcte basée sur EXIF avant de les supprimer
      .toBuffer();

    return new NextResponse(outputBuffer as any, {
      headers: {
        "Content-Type": file.type,
        "Content-Disposition": `attachment; filename="clean-${file.name}"`,
      },
    });
  } catch (error: any) {
    console.error("Erreur Nettoyage EXIF:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
