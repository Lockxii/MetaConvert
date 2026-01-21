import { NextRequest, NextResponse } from "next/server";
import { getUserSession, logOperation } from "@/lib/server-utils";

export async function POST(req: NextRequest) {
  let userId: string | null = null;
  
  try {
    const session = await getUserSession(req);
    userId = session?.user?.id || null;

    const { url, format, type } = await req.json(); // format: 'mp3' | 'mp4'

    if (!url) return NextResponse.json({ error: "URL requise" }, { status: 400 });

    // Use Cobalt API for reliable extraction (bypasses YouTube/Vercel IP blocks)
    const cobaltResponse = await fetch("https://api.cobalt.tools/api/json", {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            url: url,
            vQuality: "1080",
            filenamePattern: "basic",
            isAudioOnly: format === "mp3",
            aFormat: format === "mp3" ? "mp3" : undefined,
            // disableMetadata: true // Clean file
        })
    });

    const data = await cobaltResponse.json();

    if (!cobaltResponse.ok || data.status === "error") {
        throw new Error(data.text || "Erreur lors de la récupération via Cobalt");
    }

    // Cobalt returns a direct download URL (usually)
    // We need to fetch this file and stream it to the user to mask the source and save to DB/Logs if needed
    // Or we can just redirect. But to log operation and count stats, we better proxy it.
    
    if (data.url) {
        const fileRes = await fetch(data.url);
        if (!fileRes.ok) throw new Error("Impossible de télécharger le fichier source");
        
        const arrayBuffer = await fileRes.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        // Infer filename
        const filename = data.filename || `download-${Date.now()}.${format}`;

        return sendFile(buffer, filename, format === "mp3" ? "audio/mpeg" : "video/mp4", userId, type);
    } else if (data.pickerType === 'various') {
         // Cobalt sometimes returns multiple options, take the first one
         const first = data.picker[0];
         if (first && first.url) {
             const fileRes = await fetch(first.url);
             const arrayBuffer = await fileRes.arrayBuffer();
             const buffer = Buffer.from(arrayBuffer);
             return sendFile(buffer, `download-${Date.now()}.${format}`, format === "mp3" ? "audio/mpeg" : "video/mp4", userId, type);
         }
         throw new Error("Format complexe non supporté automatiquement");
    } else {
        throw new Error("Aucune URL de téléchargement retournée");
    }

  } catch (error: any) {
    console.error("[Web Download API] Error:", error);
    return NextResponse.json({ error: "Échec : " + (error.message || "Erreur inconnue") }, { status: 500 });
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
