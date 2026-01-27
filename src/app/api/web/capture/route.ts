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

    console.log(`[Web Capture] Starting capture for: ${url}, Format: ${format}`);

    if (!url || !format) {
      return NextResponse.json({ error: "URL et format sont requis" }, { status: 400 });
    }

    // Version sans 'embed' pour avoir un JSON propre et éviter les problèmes de flux binaire direct
    const microlinkUrl = `https://api.microlink.io?url=${encodeURIComponent(url)}&${format === "jpeg" ? "screenshot=true" : "pdf=true"}&meta=false`;

    console.log(`[Web Capture] Calling Microlink: ${microlinkUrl}`);
    const response = await fetch(microlinkUrl);
    const data = await response.json();

    if (!response.ok || !data.data) {
        console.error("[Web Capture] Microlink Error:", data);
        throw new Error(data.message || "L'API de capture a échoué");
    }

    const targetUrl = format === "jpeg" ? data.data.screenshot.url : data.data.pdf.url;
    console.log(`[Web Capture] Downloading result from: ${targetUrl}`);

    const fileResponse = await fetch(targetUrl);
    const arrayBuffer = await fileResponse.arrayBuffer();
    let rawBuffer = Buffer.from(arrayBuffer);

    if (format === "jpeg") {
      outputBuffer = await sharp(rawBuffer)
        .jpeg({ quality: 85 })
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

    console.log(`[Web Capture] Capture successful, size: ${outputBuffer.length} bytes`);

    try {
        await logOperation({
          userId: userId,
          type: "conversion",
          fileName: url.substring(0, 100), // Tronquer l'URL pour le nom de fichier
          originalSize: 0,
          convertedSize: outputBuffer.length,
          targetType: outputFileType,
          status: 'completed',
          fileBuffer: outputBuffer,
        });
    } catch (logErr) {
        console.error("[Web Capture] Log Operation Error (Non-blocking):", logErr);
    }

    return new NextResponse(outputBuffer as any, {
      headers: {
        "Content-Type": outputMimeType,
        "Content-Disposition": `attachment; filename="${outputFileName}"`,
      },
    });
  } catch (error: any) {
    console.error(`[Web Capture] Global Error:`, error);
    // ... reste du catch
