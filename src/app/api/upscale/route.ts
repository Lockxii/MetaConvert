import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { db } from "@/db";
import { upscales } from "@/db/schema";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const factorStr = formData.get("factor") as string; // "2x" or "4x"

    if (!file || !factorStr) {
      return NextResponse.json({ error: "File and factor are required" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
         return NextResponse.json({ error: "Only images can be upscaled" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
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

    // DB Logging
    if (process.env.DATABASE_URL) {
        try {
            await db.insert(upscales).values({
                fileName: file.name,
                originalSize: metadata.size || 0,
                upscaledSize: outputBuffer.length,
                factor: factor,
                userId: session?.user?.id || null
            });
        } catch (e) {
            console.error("DB Error:", e);
        }
    }

    const filename = `upscaled-${factor}x-${file.name}`;
    const asciiFilename = filename.replace(/[^\x00-\x7F]/g, "_");

    return new NextResponse(outputBuffer as any, {
        headers: {
            "Content-Type": file.type,
            "Content-Disposition": `attachment; filename="${asciiFilename}"; filename*=UTF-8''${encodeURIComponent(filename)}`
        }
    });

  } catch (error) {
    console.error("Upscale Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}