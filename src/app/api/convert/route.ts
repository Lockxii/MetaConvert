import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { auth } from "@/lib/auth";
import { logOperation } from "@/lib/server-utils";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const format = formData.get("format") as string;

    if (!file || !format) {
      return NextResponse.json({ error: "File and format are required" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const originalSize = buffer.length;
    let outputBuffer: Buffer;
    let mimeType = "";

    // Basic Image Conversion using Sharp
    if (file.type.startsWith("image/")) {
        let pipeline = sharp(buffer);

        if (format === "jpg" || format === "jpeg") {
            pipeline = pipeline.jpeg();
            mimeType = "image/jpeg";
        } else if (format === "png") {
            pipeline = pipeline.png();
            mimeType = "image/png";
        } else if (format === "webp") {
            pipeline = pipeline.webp();
            mimeType = "image/webp";
        } else {
             return NextResponse.json({ error: "Unsupported image target format" }, { status: 400 });
        }

        outputBuffer = await pipeline.toBuffer();
    } else {
        // Mock for other file types
        return NextResponse.json({ error: "Only image conversion is supported in this demo." }, { status: 400 });
    }

    // Save to DB via Helper
    await logOperation({
        userId: session?.user?.id || "anonymous",
        type: "conversion",
        fileName: file.name.replace(/\.[^/.]+$/, "") + "." + format,
        originalSize: originalSize,
        convertedSize: outputBuffer.length,
        targetType: format,
        status: "completed",
        fileBuffer: outputBuffer // Saves to DB
    });

    // Return the file
    return new NextResponse(outputBuffer as any, {
        headers: {
            "Content-Type": mimeType,
            "Content-Disposition": `attachment; filename="converted.${format}"`
        }
    });

  } catch (error) {
    console.error("Conversion Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}