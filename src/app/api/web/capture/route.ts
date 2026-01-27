import { NextRequest, NextResponse } from "next/server";
import { getUserSession, logOperation } from "@/lib/server-utils";

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

    // On utilise Microlink API pour la capture (Ultra robuste et rapide sur Vercel)
    // C'est une technique beaucoup plus fiable que de faire tourner Puppeteer sur Vercel
    const microlinkUrl = format === "jpeg" 
        ? `https://api.microlink.io?url=${encodeURIComponent(url)}&screenshot=true&meta=false&embed=screenshot.url`
        : `https://api.microlink.io?url=${encodeURIComponent(url)}&pdf=true&meta=false&embed=pdf.url`;

    const response = await fetch(microlinkUrl);
    
    if (!response.ok) {
        throw new Error("L'API de capture a échoué");
    }

    // Microlink nous donne l'URL de l'image ou du PDF généré
    const data = await response.json();
    const targetUrl = format === "jpeg" ? data.data.screenshot.url : data.data.pdf.url;

    // On télécharge le fichier généré pour le traiter
    const fileResponse = await fetch(targetUrl);
    const arrayBuffer = await fileResponse.arrayBuffer();
    outputBuffer = Buffer.from(arrayBuffer);

    if (format === "jpeg") {
      outputFileName = `capture_${Date.now()}.jpeg`;
      outputMimeType = "image/jpeg";
      outputFileType = "jpeg";
    } else {
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
