import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { getUserSession, logOperation } from "@/lib/server-utils";

export async function POST(req: NextRequest) {
  let originalFileName = "unknown";
  let originalFileSize = 0;
  let userId: string | null = null;

  try {
    const session = await getUserSession(req);
    userId = session?.user?.id || null;

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const factorStr = formData.get("factor") as string; // "2x" or "4x"

    if (!file || !factorStr) {
      return NextResponse.json({ error: "File and factor are required" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
         return NextResponse.json({ error: "Only images can be upscaled" }, { status: 400 });
    }

    originalFileName = file.name;
    const buffer = Buffer.from(await file.arrayBuffer());
    originalFileSize = buffer.length;
    
    // Get metadata to know current dimensions
    const metadata = await sharp(buffer).metadata();
    if (!metadata.width || !metadata.height) {
        return NextResponse.json({ error: "Invalid image data" }, { status: 400 });
    }

    const factor = factorStr === "4x" ? 4 : 2;
    const newWidth = metadata.width * factor;

    const outputBuffer = await sharp(buffer)
        .resize(newWidth, null, {
            kernel: sharp.kernel.lanczos3, // High quality resizing
            fit: 'contain'
        })
        .toBuffer();

    // DB Logging & Cloud Storage
    if (userId) {
        try {
            await logOperation({
                userId: userId,
                type: "upscale",
                fileName: originalFileName,
                originalSize: originalFileSize,
                convertedSize: outputBuffer.length,
                factor: factor,
                status: 'completed',
                fileBuffer: outputBuffer,
            });
        } catch (e) {
            console.error("DB Error:", e);
        }
    }

    const filename = `upscaled-${factor}x-${originalFileName}`;
    const asciiFilename = filename.replace(/[^\x00-\x7F]/g, "_");

    return new NextResponse(outputBuffer as any, {
        headers: {
            "Content-Type": file.type,
            "Content-Disposition": `attachment; filename="${asciiFilename}"; filename*=UTF-8''${encodeURIComponent(filename)}`
        }
    });

  } catch (error: any) {
    console.error("Upscale Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}