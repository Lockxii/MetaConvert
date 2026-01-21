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

    console.log(`[Image API] Processing: ${originalFileName}, Type: ${originalFileType}, Size: ${originalFileSize}, Tool: ${tool}`);

    if (originalFileSize === 0) {
      return NextResponse.json({ error: "Le fichier est vide." }, { status: 400 });
    }

    let image;
    let sharpValid = false;
    try {
      image = sharp(buffer);
      // Trigger a read to verify the format
      await image.metadata();
      sharpValid = true;
    } catch (e: any) {
      console.warn(`[Image API] Sharp cannot handle this format: ${originalFileType}. Error: ${e.message}`);
      sharpValid = false;
    }

    let outputBuffer: Buffer | undefined = undefined;
    let outputFormat: string | undefined = undefined; 
    let outputMimeType: string | undefined = undefined;

    switch (tool) {
      case "convert":
        outputFormat = params.format; 
        const sharpFormats = ['jpeg', 'jpg', 'png', 'webp', 'avif', 'tiff', 'gif'];
        
        if (sharpValid && image && outputFormat && sharpFormats.includes(outputFormat)) {
          // --- Use SHARP (Fast & Native) ---
          if (outputFormat === 'jpeg' || outputFormat === 'jpg') {
             image = image.flatten({ background: { r: 255, g: 255, b: 255 } });
          }
          image = image.toFormat(outputFormat as any);
          outputMimeType = `image/${outputFormat === 'jpg' ? 'jpeg' : outputFormat}`;
        } else if (outputFormat) {
           // --- Use FFMPEG (Fallback for exotic formats or if sharp failed) ---
           const tempDir = tmpdir();
           const inputFilePath = join(tempDir, `${Date.now()}_in_${originalFileName}`);
           const outputFilePath = join(tempDir, `${Date.now()}_out.${outputFormat}`);
           
           try {
               await fs.writeFile(inputFilePath, buffer);
               
               await new Promise<void>((resolve, reject) => {
                   let command = ffmpeg(inputFilePath);
                   if (outputFormat === 'ico') {
                       command.size('256x256'); 
                   }

                   command
                    .output(outputFilePath)
                    .on('end', () => resolve())
                    .on('error', (err) => reject(err))
                    .run();
               });

               outputBuffer = await fs.readFile(outputFilePath);
               
               const mimeMap: Record<string, string> = {
                   bmp: 'image/bmp', 
                   ico: 'image/vnd.microsoft.icon', 
                   tga: 'image/x-targa',
                   jp2: 'image/jp2', 
                   pcx: 'image/vnd.zbrush.pcx', 
                   pdf: 'application/pdf',
                   svg: 'image/svg+xml',
                   heic: 'image/heic',
                   heif: 'image/heif',
                   eps: 'application/postscript',
                   psd: 'image/vnd.adobe.photoshop',
                   raw: 'image/x-raw'
               };
               outputMimeType = mimeMap[outputFormat] || `image/${outputFormat}`;

           } finally {
               try { await fs.unlink(inputFilePath); } catch {}
               try { await fs.unlink(outputFilePath); } catch {}
           }
        }
        break;

      case "upscale":
        if (!sharpValid || !image) throw new Error("Format d'image non supporté pour l'agrandissement.");
        const factor = parseInt(params.factor as string) || 2;
        if (factor === 2 || factor === 4) {
            const metadata = await image.metadata();
            image = image.resize(Math.round(metadata.width! * factor), null, { kernel: sharp.kernel.lanczos3 });
            outputMimeType = file.type; 
        } else {
            return NextResponse.json({ error: "Facteur d'agrandissement invalide (2 ou 4 requis)" }, { status: 400 });
        }
        break;

      case "compress":
        if (!sharpValid || !image) throw new Error("Format d'image non supporté pour la compression.");
        outputFormat = params.format || 'jpeg';
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
            return NextResponse.json({ error: "Format de compression non supporté" }, { status: 400 });
        }
        break;

      case "crop":
        if (!sharpValid || !image) throw new Error("Format d'image non supporté pour le recadrage.");
        const { width, height, left, top } = params;
        if (width && height && left !== undefined && top !== undefined) {
            image = image.extract({ left: Math.round(left), top: Math.round(top), width: Math.round(width), height: Math.round(height) });
            outputMimeType = file.type;
        } else {
            return NextResponse.json({ error: "Paramètres de recadrage invalides" }, { status: 400 });
        }
        break;

      case "resize":
        if (!sharpValid || !image) throw new Error("Format d'image non supporté pour le redimensionnement.");
        const newWidth = parseInt(params.width as string);
        const newHeight = parseInt(params.height as string);
        if (newWidth || newHeight) {
            image = image.resize(newWidth || null, newHeight || null);
            outputMimeType = file.type;
        } else {
            return NextResponse.json({ error: "Paramètres de redimensionnement invalides" }, { status: 400 });
        }
        break;

      case "rotate":
        if (!sharpValid || !image) throw new Error("Format d'image non supporté pour la rotation.");
        const angle = parseInt(params.angle as string);
        const flip = params.flip === "true" || params.flip === true;
        const flop = params.flop === "true" || params.flop === true;

        if (angle) image = image.rotate(angle);
        if (flip) image = image.flip();
        if (flop) image = image.flop();
        outputMimeType = file.type;
        break;

      case "clean":
      case "clean-metadata":
        if (!sharpValid || !image) throw new Error("Format d'image non supporté pour le nettoyage.");
        image = image.rotate(); // preserve orientation
        outputMimeType = file.type;
        break;

      case "enhance":
        if (!sharpValid || !image) throw new Error("Format d'image non supporté pour l'amélioration.");
        const sharpen = params.sharpen === "true" || params.sharpen === true;
        const denoise = params.denoise === "true" || params.denoise === true;
        const contrast = params.contrast === "true" || params.contrast === true;
        
        if (sharpen) image = image.sharpen();
        if (denoise) image = image.median(); 
        if (contrast) image = image.modulate({ brightness: 1.1, saturation: 1.2 });
        outputMimeType = file.type;
        break;

      default:
        return NextResponse.json({ error: "Outil image inconnu" }, { status: 400 });
    }

    if (!outputBuffer && image) {
        outputBuffer = await image.toBuffer();
    }
    
    if (!outputMimeType && image) {
        const metadata = await image.metadata();
        outputMimeType = `image/${metadata.format === 'jpeg' ? 'jpeg' : metadata.format}`;
    }

    try {
        await logOperation({
          userId: userId,
          type: tool === "upscale" ? "upscale" : "conversion",
          fileName: originalFileName,
          originalSize: originalFileSize,
          convertedSize: outputBuffer!.length,
          targetType: outputFormat || (originalFileType.split('/').pop() || 'unknown'),
          factor: tool === "upscale" ? (parseInt(params.factor as string) || 2) : undefined,
          status: 'completed',
          fileBuffer: outputBuffer, // Added for Cloud storage
        });
    } catch (e) {
        console.error("[Image API] Log error:", e);
    }

    const filename = `${originalFileName.split('.')[0]}_${tool}.${outputFormat || outputMimeType!.split('/').pop()}`;
    const asciiFilename = filename.replace(/[^\x00-\x7F]/g, "_");

    return new NextResponse(outputBuffer as any, {
      headers: {
        "Content-Type": outputMimeType!,
        "Content-Disposition": `attachment; filename="${asciiFilename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
      },
    });
  } catch (error: any) {
    console.error(`[Image API] Error for tool ${tool}:`, error);
    try {
        await logOperation({
            userId: userId || 'anonymous',
            type: 'conversion', 
            fileName: originalFileName,
            status: 'failed',
            targetType: 'unknown',
            originalSize: originalFileSize
        });
    } catch {}
    return NextResponse.json({ error: "Échec du traitement : " + (error.message || String(error)) }, { status: 500 });
  }
}
