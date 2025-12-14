import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { getUserSession, logOperation } from "@/lib/server-utils";
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

// Configure fluent-ffmpeg
let ffmpegPath = ffmpegStatic;
if (!ffmpegPath || ffmpegPath.startsWith('/ROOT/')) {
    ffmpegPath = join(process.cwd(), 'node_modules', 'ffmpeg-static', 'ffmpeg');
}
if (ffmpegPath) ffmpeg.setFfmpegPath(ffmpegPath);


export async function POST(req: NextRequest) {
  let originalFileName = "unknown";
  let originalFileType = "unknown";
  let originalFileSize = 0;
  let userId: string | null = null;
  let tool = "unknown";

  try {
    const session = await getUserSession(req);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    userId = session.user.id;

    const formData = await req.formData();
    const file = formData.get("file") as File;
    tool = (formData.get("tool") as string) || "unknown";
    const params: Record<string, any> = {};
    formData.forEach((value, key) => {
      if (key !== "file" && key !== "tool") {
        try {
          params[key] = JSON.parse(value as string);
        } catch {
          params[key] = value;
        }
      }
    });

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (!tool) {
      return NextResponse.json({ error: "No tool specified" }, { status: 400 });
    }

    originalFileName = file.name;
    originalFileType = file.type;
    const buffer = Buffer.from(await file.arrayBuffer());
    originalFileSize = buffer.length;

    let image = sharp(buffer);
    let outputBuffer: Buffer | undefined = undefined;
    let outputFormat: string | undefined = undefined; // Will be set by sharp
    let outputMimeType: string | undefined = undefined;

    switch (tool) {
      case "convert":
        outputFormat = params.format; // e.g., 'jpeg', 'bmp', 'ico'
        const sharpFormats = ['jpeg', 'jpg', 'png', 'webp', 'avif', 'tiff', 'gif'];
        
        if (outputFormat && sharpFormats.includes(outputFormat)) {
          // --- Use SHARP (Fast & Native) ---
          if (outputFormat === 'jpeg' || outputFormat === 'jpg') {
             // Flatten transparency to white for JPEG
             image = image.flatten({ background: { r: 255, g: 255, b: 255 } });
          }
          image = image.toFormat(outputFormat as any);
          outputMimeType = `image/${outputFormat === 'jpg' ? 'jpeg' : outputFormat}`;
        } else if (outputFormat) {
           // --- Use FFMPEG (Fallback for exotic formats) ---
           const tempDir = tmpdir();
           const inputFilePath = join(tempDir, `${Date.now()}_in_${originalFileName}`);
           const outputFilePath = join(tempDir, `${Date.now()}_out.${outputFormat}`);
           
           try {
               await fs.writeFile(inputFilePath, buffer);
               
               await new Promise<void>((resolve, reject) => {
                   let command = ffmpeg(inputFilePath);

                   // Specific tweaks for formats
                   if (outputFormat === 'ico') {
                       command.size('256x256'); // ICO max standard size
                   }

                   command
                    .output(outputFilePath)
                    .on('end', () => resolve())
                    .on('error', (err) => reject(err))
                    .run();
               });

               outputBuffer = await fs.readFile(outputFilePath);
               
               // Mime type mapping for exotic formats
               const mimeMap: Record<string, string> = {
                   bmp: 'image/bmp', ico: 'image/vnd.microsoft.icon', tga: 'image/x-targa',
                   jp2: 'image/jp2', pcx: 'image/vnd.zbrush.pcx', pdf: 'application/pdf',
                   svg: 'image/svg+xml'
               };
               outputMimeType = mimeMap[outputFormat] || `image/${outputFormat}`;

           } finally {
               // Cleanup
               try { await fs.unlink(inputFilePath); } catch {}
               try { await fs.unlink(outputFilePath); } catch {}
           }
        }
        break;
      case "upscale":
        const factor = parseInt(params.factor as string); // e.g., 2, 4
        if (factor && (factor === 2 || factor === 4)) {
            const metadata = await image.metadata();
            image = image.resize(metadata.width! * factor, null, { kernel: sharp.kernel.lanczos3 });
            outputMimeType = file.type; // Keep original mime type
        } else {
            return NextResponse.json({ error: "Invalid upscale factor" }, { status: 400 });
        }
        break;
      case "compress":
        outputFormat = params.format || 'jpeg'; // Default to jpeg for compression
        const quality = parseInt(params.quality as string) || 80;
        if (outputFormat === 'jpeg' || outputFormat === 'jpg') {
            image = image.jpeg({ quality: quality });
            outputMimeType = `image/jpeg`;
        } else if (outputFormat === 'png') {
            image = image.png({ quality: quality, compressionLevel: 9 });
            outputMimeType = `image/png`;
        } else if (outputFormat === 'webp') {
            image = image.webp({ quality: quality });
            outputMimeType = `image/webp`;
        } else {
            return NextResponse.json({ error: "Unsupported compression format" }, { status: 400 });
        }
        break;
      case "crop":
        const { width, height, left, top } = params;
        if (width && height && left !== undefined && top !== undefined) {
            image = image.extract({ left, top, width, height });
            outputMimeType = file.type;
        } else {
            return NextResponse.json({ error: "Invalid crop parameters" }, { status: 400 });
        }
        break;
      case "resize":
        const newWidth = parseInt(params.width as string);
        const newHeight = parseInt(params.height as string);
        if (newWidth || newHeight) {
            image = image.resize(newWidth || null, newHeight || null);
            outputMimeType = file.type;
        } else {
            return NextResponse.json({ error: "Invalid resize parameters" }, { status: 400 });
        }
        break;
      case "rotate":
        const angle = parseInt(params.angle as string); // 90, 180, 270
        const flip = params.flip === "true";
        const flop = params.flop === "true";

        if (angle) image = image.rotate(angle);
        if (flip) image = image.flip(); // Vertical flip
        if (flop) image = image.flop(); // Horizontal flip
        outputMimeType = file.type;
        break;
      case "watermark":
        const watermarkText = params.text as string;
        // This is a simplified example. Real watermarking is more complex.
        if (watermarkText) {
            const textSvg = `<svg width="${(await image.metadata()).width}" height="${(await image.metadata()).height}">
                <text x="50%" y="50%" fill="rgba(255,255,255,0.5)" text-anchor="middle" dominant-baseline="middle" font-size="50">${watermarkText}</text>
            </svg>`;
            const textBuffer = Buffer.from(textSvg);
            image = image.composite([{ input: textBuffer, gravity: 'center' }]);
        }
        outputMimeType = file.type;
        break;
      case "remove-background":
        // This requires an external AI service. For now, it will be mocked.
        // Or using libraries like 'rembg-node' which require Python/ML models.
        // For this demo, we'll return the original image as a mock.
        outputBuffer = buffer; 
        outputMimeType = file.type;
        break;
      case "enhance":
        const sharpen = params.sharpen === "true";
        const denoise = params.denoise === "true";
        const contrast = params.contrast === "true";
        
        if (sharpen) image = image.sharpen();
        if (denoise) image = image.median(); // Simple median filter for denoising
        if (contrast) image = image.modulate({ brightness: 1.2, saturation: 1.5 }); // Example enhancement
        outputMimeType = file.type;
        break;

      default:
        return NextResponse.json({ error: "Unknown image tool" }, { status: 400 });
    }

    if (!outputBuffer) { // If not mocked like remove-background or already processed by ffmpeg
        outputBuffer = await image.toBuffer();
    }
    
    // Ensure outputMimeType is set if not already
    if (!outputMimeType) {
        const metadata = await image.metadata();
        outputMimeType = `image/${metadata.format === 'jpeg' ? 'jpeg' : metadata.format}`;
    }

    await logOperation({
      userId: userId,
      type: tool === "upscale" ? "upscale" : "conversion",
      fileName: originalFileName,
      originalSize: originalFileSize,
      convertedSize: outputBuffer.length,
      targetType: outputFormat || (originalFileType.split('/').pop() || 'unknown'),
      factor: tool === "upscale" ? parseInt(params.factor as string) : undefined,
      status: 'completed',
    });

    const filename = `${originalFileName.split('.')[0]}_${tool}.${outputFormat || outputMimeType!.split('/').pop()}`;
    const asciiFilename = filename.replace(/[^\x00-\x7F]/g, "_");

    return new NextResponse(outputBuffer as any, {
      headers: {
        "Content-Type": outputMimeType!,
        "Content-Disposition": `attachment; filename="${asciiFilename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
      },
    });
  } catch (error: any) {
    console.error(`Image processing error for tool ${tool}:`, error);
    await logOperation({
        userId: userId || 'anonymous',
        type: 'conversion', 
        fileName: originalFileName,
        status: 'failed',
        targetType: 'unknown',
        originalSize: originalFileSize
    });
    return NextResponse.json({ error: "Failed to process image: " + (error.message || String(error)) }, { status: 500 });
  }
}
