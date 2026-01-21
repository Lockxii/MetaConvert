import { NextRequest, NextResponse } from "next/server";
import { getUserSession, logOperation } from "@/lib/server-utils";
import ffmpegStatic from 'ffmpeg-static';
import ffmpeg from 'fluent-ffmpeg';
import { createReadStream, createWriteStream, promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';

// Configure fluent-ffmpeg to use the static FFmpeg binary
let ffmpegPath = ffmpegStatic;
console.log(`[Video API] ffmpeg-static path: ${ffmpegPath}`);

// Check if the path is valid and exists
const checkFileExists = async (path: string) => {
    try {
        await fs.access(path);
        return true;
    } catch {
        return false;
    }
};

// If standard path fails (e.g. /ROOT/ issue), try to resolve relative to CWD
if (!ffmpegPath || ffmpegPath.startsWith('/ROOT/')) {
    const fallbackPath = join(process.cwd(), 'node_modules', 'ffmpeg-static', 'ffmpeg');
    console.log(`[Video API] Trying fallback FFmpeg path: ${fallbackPath}`);
    ffmpegPath = fallbackPath;
}

ffmpeg.setFfmpegPath(ffmpegPath!); // Set the path (asserting non-null for now, logic below handles safety)


export async function POST(req: NextRequest) {
  let originalFileName = "unknown";
  let originalFileType = "unknown";
  let originalFileSize = 0;
  let userId: string | null = null;
  let inputFilePath: string | undefined;
  let tool: string | undefined;

  try {
    const session = await getUserSession(req);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    userId = session.user.id;

    const formData = await req.formData();
    const file = formData.get("file") as File;
    tool = formData.get("tool") as string;
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
    originalFileSize = file.size;

    // Save the input file to a temporary location using streams
    const tempDir = tmpdir();
    inputFilePath = join(tempDir, `${Date.now()}_${file.name}`);
    
    const fileStream = file.stream();
    // @ts-ignore: Readable.fromWeb handles web streams but TS might complain depending on version
    const nodeStream = Readable.fromWeb(fileStream);
    await pipeline(nodeStream, createWriteStream(inputFilePath));

    const outputFileName = `${originalFileName.split('.')[0]}_${tool}_${Date.now()}`;
    let outputFilePath = "";
    let outputMimeType = "";

    await new Promise<void>((resolve, reject) => {
      const command = ffmpeg(inputFilePath!);

      switch (tool) {
        case "convert":
          const format = params.format as string; 
          outputFilePath = join(tempDir, `${outputFileName}.${format}`);
          
          const videoMimeMap: Record<string, string> = {
            mp4: 'video/mp4',
            webm: 'video/webm',
            mov: 'video/quicktime',
            avi: 'video/x-msvideo',
            mkv: 'video/x-matroska',
            flv: 'video/x-flv',
            wmv: 'video/x-ms-wmv',
            mpeg: 'video/mpeg'
          };
          outputMimeType = videoMimeMap[format] || `video/${format}`;
          
          command.toFormat(format).on('end', () => resolve()).on('error', reject).save(outputFilePath);
          break;
        case "compress":
          const compressionPreset = params.preset || 'balanced'; 
          let crf = '28';
          if (compressionPreset === 'quality') crf = '23';
          if (compressionPreset === 'size') crf = '35';

          outputFilePath = join(tempDir, `${outputFileName}.mp4`); 
          outputMimeType = 'video/mp4';
          command
            .addOption('-crf', crf) 
            .addOption('-preset', 'fast')
            .on('end', () => resolve())
            .on('error', reject)
            .save(outputFilePath);
          break;
        case "extract-audio":
          const audioFormat = params.audioFormat || 'mp3';
          outputFilePath = join(tempDir, `${outputFileName}.${audioFormat}`);
          
          const extractMimeMap: Record<string, string> = {
            mp3: 'audio/mpeg',
            wav: 'audio/wav',
            aac: 'audio/aac',
            flac: 'audio/flac',
            m4a: 'audio/mp4',
            ogg: 'audio/ogg'
          };
          outputMimeType = extractMimeMap[audioFormat] || `audio/${audioFormat}`;

          // Set specific codecs for better compatibility
          if (audioFormat === 'mp3') command.audioCodec('libmp3lame');
          else if (audioFormat === 'aac' || audioFormat === 'm4a') command.audioCodec('aac');
          else if (audioFormat === 'ogg') command.audioCodec('libvorbis');
          else if (audioFormat === 'flac') command.audioCodec('flac');

          command
            .noVideo()
            .on('end', () => resolve())
            .on('error', reject)
            .save(outputFilePath);
          break;
        case "to-gif":
          const fps = params.fps || '10';
          outputFilePath = join(tempDir, `${outputFileName}.gif`);
          outputMimeType = 'image/gif';
          command
            .outputOptions([`-vf`, `fps=${fps},scale=320:-1:flags=lanczos`]) 
            .on('end', () => resolve())
            .on('error', reject)
            .save(outputFilePath);
          break;
        case "trim":
          const start = params.start as string; // HH:mm:ss
          const duration = params.duration as string; // HH:mm:ss
          if (!start || !duration) {
              return reject(new Error("Start and duration are required for trimming"));
          }
          outputFilePath = join(tempDir, `${outputFileName}.mp4`);
          outputMimeType = 'video/mp4';
          command
            .setStartTime(start)
            .setDuration(duration)
            .on('end', () => resolve())
            .on('error', reject)
            .save(outputFilePath);
          break;
        case "generate-spectrogram":
          const waveColor = params.color || '0x2563eb'; // MetaConvert Blue
          
          outputFilePath = join(tempDir, `${outputFileName}.mp4`);
          outputMimeType = 'video/mp4';
          
          command
            .complexFilter([
                `showwaves=s=1280x720:mode=line:colors=${waveColor}:draw=full[v]`
            ], 'v')
            .outputOptions([
                '-c:v libx264',
                '-c:a copy', // Keep original audio
                '-preset fast',
                '-crf 23',
                '-pix_fmt yuv420p',
                '-shortest'
            ])
            .on('end', () => resolve())
            .on('error', reject)
            .save(outputFilePath);
          break;
        default:
          return reject(new Error("Unknown video tool"));
      }
    });

    const fileStats = await fs.stat(outputFilePath);
    const convertedSize = fileStats.size;
    const outputBuffer = await fs.readFile(outputFilePath);

    await logOperation({
      userId: userId,
      type: "conversion",
      fileName: originalFileName,
      originalSize: originalFileSize,
      convertedSize: convertedSize,
      targetType: outputMimeType.split('/')[1] || 'unknown',
      status: 'completed',
      fileBuffer: outputBuffer,
    });

    // Stream the response back
    const responseStream = createReadStream(outputFilePath);
    // @ts-ignore
    const webResponseStream = Readable.toWeb(responseStream);

    // Note: We cannot easily delete the output file *after* streaming starts in this simple model 
    // without using a custom stream that deletes on close. 
    // For now, we accept the temp file might stick around until OS cleans tmp, 
    // or we'd need a more complex cleanup strategy.
    // However, input file can be deleted.
    try { await fs.unlink(inputFilePath); } catch (e) { /* ignore */ }

    const filename = `${outputFileName}.${outputMimeType.split('/')[1] || 'bin'}`;
    const asciiFilename = filename.replace(/[^\x00-\x7F]/g, "_");

    return new NextResponse(webResponseStream as any, {
      headers: {
        "Content-Type": outputMimeType,
        "Content-Disposition": `attachment; filename="${asciiFilename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
      },
    });

  } catch (error: any) {
    console.error(`Video processing error for tool ${tool || 'unknown'}:`, error);
    await logOperation({
        userId: userId || 'anonymous',
        type: 'conversion',
        fileName: originalFileName,
        status: 'failed',
        targetType: 'video',
        originalSize: originalFileSize
    });
    return NextResponse.json({ error: "Failed to process video: " + error.message }, { status: 500 });
  } finally {
      if (inputFilePath) {
          try { await fs.unlink(inputFilePath); } catch (e) { /* ignore */ }
      }
  }
}
