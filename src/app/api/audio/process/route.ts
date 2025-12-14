import { NextRequest, NextResponse } from "next/server";
import { getUserSession, logOperation } from "@/lib/server-utils";
import ffmpegStatic from 'ffmpeg-static';
import ffmpeg from 'fluent-ffmpeg';
import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

// Configure fluent-ffmpeg to use the static FFmpeg binary
let ffmpegPath = ffmpegStatic;
console.log(`[Audio API] ffmpeg-static path: ${ffmpegPath}`);

// If standard path fails (e.g. /ROOT/ issue), try to resolve relative to CWD
if (!ffmpegPath || ffmpegPath.startsWith('/ROOT/')) {
    const fallbackPath = join(process.cwd(), 'node_modules', 'ffmpeg-static', 'ffmpeg');
    console.log(`[Audio API] Trying fallback FFmpeg path: ${fallbackPath}`);
    ffmpegPath = fallbackPath;
}

if (ffmpegPath) {
    ffmpeg.setFfmpegPath(ffmpegPath);
} else {
    console.error("FFmpeg static path not found. Audio processing may fail.");
}

export async function POST(req: NextRequest) {
  let originalFileName = "unknown";
  let originalFileType = "unknown";
  let originalFileSize = 0;
  let userId: string | null = null;
  let inputFilePath: string | undefined;

  try {
    const session = await getUserSession(req);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    userId = session.user.id;

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const tool = formData.get("tool") as string;
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
    
    const inputBuffer = Buffer.from(await file.arrayBuffer());
    originalFileSize = inputBuffer.length;

    // Save the input file to a temporary location
    const tempDir = tmpdir();
    inputFilePath = join(tempDir, `${Date.now()}_${file.name}`);
    await fs.writeFile(inputFilePath, inputBuffer);

    const outputFileName = `${originalFileName.split('.')[0]}_${tool}_${Date.now()}`;
    let outputFilePath = "";
    let outputMimeType = "";

    await new Promise<void>((resolve, reject) => {
      const command = ffmpeg(inputFilePath);

      switch (tool) {
        case "convert":
          const format = params.format as string; // e.g., 'mp3', 'wav', 'ogg'
          outputFilePath = join(tempDir, `${outputFileName}.${format}`);
          outputMimeType = `audio/${format}`; // Simplified
          command.toFormat(format).on('end', () => resolve()).on('error', reject).save(outputFilePath);
          break;
        case "trim":
          const start = params.start as string; // HH:mm:ss
          const duration = params.duration as string; // HH:mm:ss
          if (!start || !duration) {
              return reject(new Error("Start and duration are required for trimming"));
          }
          outputFilePath = join(tempDir, `${outputFileName}.mp3`); // Assume MP3 output
          outputMimeType = 'audio/mpeg';
          command
            .setStartTime(start)
            .setDuration(duration)
            .on('end', () => resolve())
            .on('error', reject)
            .save(outputFilePath);
          break;
        case "normalize":
            outputFilePath = join(tempDir, `${outputFileName}.mp3`); // Assume MP3 output
            outputMimeType = 'audio/mpeg';
            command
                .audioFilter('loudnorm') // Apply loudness normalization
                .on('end', () => resolve())
                .on('error', reject)
                .save(outputFilePath);
            break;
        case "speed":
            const speedFactor = parseFloat(params.speedFactor as string); // e.g., 0.5, 1.5
            if (isNaN(speedFactor) || speedFactor <= 0) {
                return reject(new Error("Valid speed factor is required"));
            }
            outputFilePath = join(tmpdir(), `${outputFileName}_speed${speedFactor}.mp3`);
            outputMimeType = 'audio/mpeg';
            command
                .audioFilter(`atempo=${speedFactor}`)
                .on('end', () => resolve())
                .on('error', reject)
                .save(outputFilePath);
            break;
        default:
          return reject(new Error("Unknown audio tool"));
      }
    });

    const outputBuffer = await fs.readFile(outputFilePath);
    const convertedSize = outputBuffer.length;

    await logOperation({
      userId: userId,
      type: "conversion",
      fileName: originalFileName,
      originalSize: originalFileSize,
      convertedSize: convertedSize,
      targetType: outputMimeType.split('/')[1] || 'unknown',
      status: 'completed',
    });

    // Clean up temporary files
    await fs.unlink(inputFilePath);
    await fs.unlink(outputFilePath);

    const filename = `${outputFileName}.${outputMimeType.split('/')[1] || 'bin'}`;
    const asciiFilename = filename.replace(/[^\x00-\x7F]/g, "_");

    return new NextResponse(outputBuffer as any, {
      headers: {
        "Content-Type": outputMimeType,
        "Content-Disposition": `attachment; filename="${asciiFilename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
      },
    });

  } catch (error: any) {
    console.error(`Audio processing error for tool ${req.formData().then(d=>d.get('tool'))}:`, error);
    await logOperation({
        userId: userId || 'anonymous',
        type: 'conversion',
        fileName: originalFileName,
        status: 'failed',
        targetType: 'audio',
        originalSize: originalFileSize
    });
    return NextResponse.json({ error: "Failed to process audio: " + error.message }, { status: 500 });
  } finally {
      if (inputFilePath) {
          try { await fs.unlink(inputFilePath); } catch (e) { console.error("Error cleaning up input file:", e); }
      }
  }
}
