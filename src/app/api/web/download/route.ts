import { NextRequest, NextResponse } from "next/server";
import { getUserSession, logOperation } from "@/lib/server-utils";

// Rotating Cobalt instances to avoid downtime/rate-limits
const COBALT_INSTANCES = [
    "https://api.cobalt.tools", // Official v10
    "https://cobalt.lacus.dev", // v10
    "https://api.timeless-nesses.me", // v10
];

export async function POST(req: NextRequest) {
  let userId: string | null = null;
  
  try {
    const session = await getUserSession(req);
    userId = session?.user?.id || null;

    const { url, format, type } = await req.json();

    if (!url) return NextResponse.json({ error: "URL requise" }, { status: 400 });

    // 1. TIKTOK SPECIALIZED STRATEGY (TikWM)
    if (url.includes("tiktok.com")) {
        try {
            console.log("[Web Download] Using TikWM for TikTok...");
            const tikRes = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
            const tikData = await tikRes.json();
            
            if (tikData.code === 0 && tikData.data?.play) {
                const videoUrl = tikData.data.play;
                const fileRes = await fetch(videoUrl);
                const arrayBuffer = await fileRes.arrayBuffer();
                return sendFile(Buffer.from(arrayBuffer), `tiktok-${tikData.data.id || Date.now()}.mp4`, "video/mp4", userId, type);
            }
        } catch (e) {
            console.error("TikWM failed, falling back to Cobalt pool", e);
        }
    }

    // 2. GENERIC STRATEGY (Cobalt Pool Rotation)
    let lastError: any = null;
    
    for (const instance of COBALT_INSTANCES) {
        try {
            console.log(`[Web Download] Trying Cobalt instance: ${instance}`);
            
            // v10 API
            const res = await fetch(`${instance}/`, {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "User-Agent": "Mozilla/5.0 (compatible; MetaConvert/1.0)"
                },
                body: JSON.stringify({
                    url: url,
                    videoQuality: "1080",
                    filenamePattern: "basic",
                    downloadMode: format === "mp3" ? "audio" : "auto", 
                    audioFormat: format === "mp3" ? "mp3" : undefined,
                })
            });

            const data = await res.json();
            
            if (!res.ok || data.status === "error") {
                throw new Error(data.text || `Error from ${instance}`);
            }

            let downloadUrl = data.url;
            if (!downloadUrl && data.pickerType === 'various') {
                downloadUrl = data.picker[0]?.url;
            }

            if (downloadUrl) {
                 const fileRes = await fetch(downloadUrl);
                 if (!fileRes.ok) throw new Error("File download failed");
                 const arrayBuffer = await fileRes.arrayBuffer();
                 const filename = data.filename || `download-${Date.now()}.${format}`;
                 return sendFile(Buffer.from(arrayBuffer), filename, format === "mp3" ? "audio/mpeg" : "video/mp4", userId, type);
            }

        } catch (e) {
            console.error(`Failed with ${instance}:`, e);
            lastError = e;
            continue; // Try next instance
        }
    }

    throw lastError || new Error("Tous les services de téléchargement sont indisponibles.");

  } catch (error: any) {
    console.error("[Web Download API] Final Error:", error);
    return NextResponse.json({ error: "Échec : " + (error.message || "Service indisponible") }, { status: 500 });
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
