import { NextRequest, NextResponse } from "next/server";
import { getUserSession, logOperation } from "@/lib/server-utils";
import sharp from "sharp";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  let userId: string | null = null;
  const originalFileName = "web_capture";
  let outputFileName: string;
  let outputFileType: string;
  let outputMimeType: string;
  let outputBuffer: Buffer;

  try {
    const session = await getUserSession(req);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    userId = session.user.id;

    const formData = await req.formData();
    const url = formData.get("url") as string;
    const format = formData.get("format") as "jpeg" | "pdf";

    if (!url || !format) {
      return NextResponse.json({ error: "URL et format sont requis" }, { status: 400 });
    }

    // On demande le binaire directement à Microlink (plus rapide)
    const microlinkUrl = format === "jpeg" 
        ? `https://api.microlink.io?url=${encodeURIComponent(url)}&screenshot=true&embed=screenshot`
        : `https://api.microlink.io?url=${encodeURIComponent(url)}&pdf=true&embed=pdf`;

    const response = await fetch(microlinkUrl);
    
    if (!response.ok) {
        throw new Error("L'API de capture a échoué");
    }

    const arrayBuffer = await response.arrayBuffer();
    let rawBuffer = Buffer.from(arrayBuffer);

    if (format === "jpeg") {
      // Microlink renvoie souvent du PNG par défaut, on convertit en JPEG haute qualité avec Sharp
      outputBuffer = await sharp(rawBuffer)
        .jpeg({ quality: 90 })
        .toBuffer();
      outputFileName = `capture_${Date.now()}.jpeg`;
      outputMimeType = "image/jpeg";
      outputFileType = "jpeg";
    } else {
      outputBuffer = rawBuffer;
      outputFileName = `capture_${Date.now()}.pdf`;
      outputMimeType = "application/pdf";
      outputFileType = "pdf";
    }

    await logOperation({
      userId: userId,
      type: "conversion",
      fileName: url,
      originalSize: 0,
      convertedSize: outputBuffer.length,
      targetType: outputFileType,
      status: 'completed',
      fileBuffer: outputBuffer,
    });

    return new NextResponse(outputBuffer as any, {
      headers: {
        "Content-Type": outputMimeType,
        "Content-Disposition": `attachment; filename="${outputFileName}"`,
      },
    });
  } catch (error: any) {
    console.error(`Web capture error:`, error);
    await logOperation({
        userId: userId || 'anonymous',
        type: 'conversion',
        fileName: originalFileName,
        status: 'failed',
        targetType: 'web_capture',
        originalSize: 0
    });
    return NextResponse.json({ error: "Échec de la capture : " + error.message }, { status: 500 });
  }
}
