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

    const { url, format, type } = await req.json(); // format: 'mp3' | 'mp4', type: 'youtube' | 'tiktok'

    if (!url) return NextResponse.json({ error: "URL requise" }, { status: 400 });

    const outputId = `${type}-${format}-${timestamp}`;
    const outputPath = path.join(tempDir, `${outputId}.${format}`);
    
    let command = "";
    
    if (format === "mp3") {
        // Extraction Audio
        command = `${YT_DLP_PATH} --extract-audio --audio-format mp3 --audio-quality 0 -o "${path.join(tempDir, `${outputId}.%(ext)s`)}" "${url}"`;
    } else {
        // Téléchargement Vidéo (MP4)
        command = `${YT_DLP_PATH} -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best" -o "${outputPath}" "${url}"`;
    }
    
    console.log(`[Web Download API] Running: ${command}`);
    
    await execAsync(command);

    if (!fs.existsSync(outputPath)) {
        // Vérifier si yt-dlp a généré un fichier avec une extension légèrement différente
        const files = fs.readdirSync(tempDir);
        const foundFile = files.find(f => f.startsWith(outputId));
        if (foundFile) {
            const foundPath = path.join(tempDir, foundFile);
            const fileBuffer = fs.readFileSync(foundPath);
            return sendFile(fileBuffer, foundFile, format === "mp3" ? "audio/mpeg" : "video/mp4", userId, type);
        }
        throw new Error("Le fichier n'a pas pu être généré.");
    }

    const fileBuffer = fs.readFileSync(outputPath);
    return sendFile(fileBuffer, `${outputId}.${format}`, format === "mp3" ? "audio/mpeg" : "video/mp4", userId, type);

  } catch (error: any) {
    console.error("[Web Download API] Error:", error);
    return NextResponse.json({ error: "Échec de l'opération : " + error.message }, { status: 500 });
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
      fileBuffer: buffer, // Added for Cloud storage
    }).catch(console.error);

    return new NextResponse(buffer as any, {
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
}
