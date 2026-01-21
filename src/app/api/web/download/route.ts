import { NextRequest, NextResponse } from "next/server";
import { getUserSession, logOperation } from "@/lib/server-utils";

// Rotating Cobalt instances
const COBALT_INSTANCES = [
    "https://api.cobalt.tools",
    "https://cobalt.lacus.dev",
    "https://api.timeless-nesses.me",
];

// Rotating Piped instances (for YouTube fallback)
const PIPED_INSTANCES = [
    "https://pipedapi.kavin.rocks",
    "https://api.piped.privacy.com.de",
    "https://pipedapi.adminforge.de",
    "https://api.piped.projects.hq.c.emkc.org"
];

function getYouTubeId(url: string) {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length == 11) ? match[7] : null;
}

export async function POST(req: NextRequest) {
  let userId: string | null = null;
  
  try {
    const session = await getUserSession(req);
    userId = session?.user?.id || null;

    const { url, format, type } = await req.json();

    if (!url) return NextResponse.json({ error: "URL requise" }, { status: 400 });

    // 1. TIKTOK (TikWM)
    if (url.includes("tiktok.com")) {
        // ... (Keep existing TikWM logic)
        try {
            console.log("[Web Download] Using TikWM for TikTok...");
            const tikRes = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
            const tikData = await tikRes.json();
            
            if (tikData.code === 0 && tikData.data?.play) {
                const videoUrl = tikData.data.play;
                const fileRes = await fetch(videoUrl);
                if (!fileRes.body) throw new Error("No body");
                return sendStream(fileRes.body, `tiktok-${tikData.data.id || Date.now()}.mp4`, "video/mp4", userId, type);
            }
        } catch (e) {
            console.error("TikWM failed", e);
        }
    }

    // 2. YOUTUBE SPECIAL (Piped API)
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
        const videoId = getYouTubeId(url);
        if (videoId) {
            for (const instance of PIPED_INSTANCES) {
                try {
                    console.log(`[Web Download] Trying Piped instance: ${instance}`);
                    const res = await fetch(`${instance}/streams/${videoId}`);
                    if (!res.ok) continue;
                    
                    const data = await res.json();
                    
                    let streamUrl = null;
                    let mimeType = "";
                    let ext = "";

                    if (format === "mp3") {
                        const audioStream = data.audioStreams.find((s: any) => s.mimeType.includes("mp4") || s.mimeType.includes("m4a"));
                        if (audioStream) {
                            streamUrl = audioStream.url;
                            mimeType = "audio/mp4";
                            ext = "m4a";
                        }
                    } else {
                        const videoStream = data.videoStreams.find((s: any) => s.mimeType.includes("mp4") && s.quality === "1080p") 
                                         || data.videoStreams.find((s: any) => s.mimeType.includes("mp4") && s.quality === "720p")
                                         || data.videoStreams.find((s: any) => s.mimeType.includes("mp4"));
                        
                        if (videoStream) {
                            streamUrl = videoStream.url;
                            mimeType = "video/mp4";
                            ext = "mp4";
                        }
                    }

                    if (streamUrl) {
                        const fileRes = await fetch(streamUrl);
                        if (!fileRes.ok || !fileRes.body) throw new Error("Stream download failed");
                        return sendStream(fileRes.body, `${(data.title || 'video').replace(/[^a-z0-9]/gi, '_')}.${ext}`, mimeType, userId, type);
                    }
                } catch (e) {
                    console.error(`Piped instance ${instance} failed:`, e);
                }
            }
        }
    }

    // 3. GENERIC FALLBACK (Cobalt)
    let lastError: any = null;
    
    for (const instance of COBALT_INSTANCES) {
        try {
            console.log(`[Web Download] Trying Cobalt instance: ${instance}`);
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
                 if (!fileRes.ok || !fileRes.body) throw new Error("File download failed");
                 const filename = data.filename || `download-${Date.now()}.${format}`;
                 return sendStream(fileRes.body, filename, format === "mp3" ? "audio/mpeg" : "video/mp4", userId, type);
            }

        } catch (e) {
            console.error(`Failed with ${instance}:`, e);
            lastError = e;
            continue; 
        }
    }

    throw lastError || new Error("Tous les services de téléchargement sont indisponibles.");

  } catch (error: any) {
    console.error("[Web Download API] Final Error:", error);
    return NextResponse.json({ error: "Échec : " + (error.message || "Service indisponible") }, { status: 500 });
  }
}

function sendStream(stream: ReadableStream, fileName: string, mimeType: string, userId: string | null, type: string) {
    // Note: We cannot log fileBuffer size here since it's a stream.
    // We log metadata only.
    logOperation({
      userId: userId || "anonymous",
      type: "conversion",
      fileName,
      originalSize: 0,
      convertedSize: 0, // Unknown
      targetType: mimeType.split('/')[1],
      status: "completed",
      // fileBuffer: null // Cannot save stream easily to DB without collecting it
    }).catch(console.error);

    return new NextResponse(stream as any, {
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
}
