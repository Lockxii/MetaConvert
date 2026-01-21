import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import os from "os";
import fs from "fs";
import { getUserSession, logOperation } from "@/lib/server-utils";

const execAsync = promisify(exec);

const YT_DLP_URL = "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux";
const YT_DLP_PATH = path.join(os.tmpdir(), "yt-dlp");

async function ensureYtDlp() {
  if (fs.existsSync(YT_DLP_PATH)) return YT_DLP_PATH;

  console.log("[Web Download API] Downloading yt-dlp...");
  try {
    const res = await fetch(YT_DLP_URL);
    if (!res.ok) throw new Error(`Failed to download yt-dlp: ${res.statusText}`);
    
    const buffer = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(YT_DLP_PATH, buffer);
    fs.chmodSync(YT_DLP_PATH, "755");
    
    console.log("[Web Download API] yt-dlp downloaded successfully.");
    return YT_DLP_PATH;
  } catch (error) {
    console.error("[Web Download API] Download failed:", error);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  let userId: string | null = null;
  const tempDir = os.tmpdir();
  const timestamp = Date.now();
  
  try {
    const session = await getUserSession(req);
    userId = session?.user?.id || null;
    
    await ensureYtDlp();

    const { url, format, type } = await req.json();

    if (!url) return NextResponse.json({ error: "URL requise" }, { status: 400 });

    const outputId = `${type}-${format}-${timestamp}`;
    const outputPath = path.join(tempDir, `${outputId}.${format}`);
    
    // Anti-bot flags
    // spoofing Android client often bypasses the login requirement for Shorts
    const flags = [
        `--no-playlist`,
        `--no-check-certificates`,
        `--extractor-args "youtube:player_client=android"`, 
        `--user-agent "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36"`,
        `--force-ipv4` // Vercel IPv6 sometimes flagged
    ].join(" ");

    let command = "";
    
    if (format === "mp3") {
        command = `${YT_DLP_PATH} ${flags} --extract-audio --audio-format mp3 --audio-quality 0 -o "${path.join(tempDir, `${outputId}.%(ext)s`)}" "${url}"`;
    } else {
        // Use generic 'best' to avoid format merging issues if ffmpeg is missing
        // Vercel doesn't have ffmpeg by default! This is another issue for merging video+audio.
        // We must select a format that has both or use 'best' (which might be 720p).
        // Format 'b' usually gets the best single file (video+audio).
        command = `${YT_DLP_PATH} ${flags} -f "b/best" -o "${outputPath}" "${url}"`;
    }
    
    console.log(`[Web Download API] Running: ${command}`);
    
    // We need to set the PATH to include node for JS interpretation if needed, though with android client it might skip JS checks.
    await execAsync(command, { env: { ...process.env } });

    // Check for file (yt-dlp might add extension)
    let finalPath = outputPath;
    if (!fs.existsSync(outputPath)) {
         const files = fs.readdirSync(tempDir);
         const found = files.find(f => f.startsWith(outputId));
         if (found) {
             finalPath = path.join(tempDir, found);
         } else {
             throw new Error("Fichier non généré par yt-dlp");
         }
    }

    const fileBuffer = fs.readFileSync(finalPath);
    // Cleanup
    try { fs.unlinkSync(finalPath); } catch(e) {}

    return sendFile(fileBuffer, path.basename(finalPath), format === "mp3" ? "audio/mpeg" : "video/mp4", userId, type);

  } catch (error: any) {
    console.error("[Web Download API] Error:", error);
    const msg = error.stderr || error.message;
    return NextResponse.json({ error: "Échec : " + msg }, { status: 500 });
  }
}

function sendFile(buffer: Buffer, fileName: string, mimeType: string, userId: string | null, type: string) {
    logOperation({
      userId: userId || "anonymous",
      type: "conversion",
      fileName,
      originalSize: 0,
      convertedSize: buffer.length,
      targetType: mimeType.split('/')[1],
      status: "completed",
      fileBuffer: buffer, 
    }).catch(console.error);

    return new NextResponse(buffer as any, {
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
}
