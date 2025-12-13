import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { db } from "@/db";
import { conversions } from "@/db/schema";
import { auth } from "@/lib/auth";

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

    // DB Logging
    if (process.env.DATABASE_URL) {
        try {
            await db.insert(conversions).values({
                fileName: file.name,
                fileType: file.type,
                targetType: format,
                status: 'completed',
                originalSize: originalSize,
                convertedSize: outputBuffer.length,
                userId: session?.user?.id || null 
            });
        } catch (e) {
            console.error("DB Error:", e);
        }
    }

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