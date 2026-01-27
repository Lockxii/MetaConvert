import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { fileStorage, sharedLinks, conversions, upscales } from "@/db/schema";
import { eq } from "drizzle-orm";

// Helper to guess mime type from extension
function getMimeType(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'png') return 'image/png';
    if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
    if (ext === 'gif') return 'image/gif';
    if (ext === 'webp') return 'image/webp';
    if (ext === 'svg') return 'image/svg+xml';
    if (ext === 'pdf') return 'application/pdf';
    if (ext === 'mp4') return 'video/mp4';
    if (ext === 'webm') return 'video/webm';
    if (ext === 'mp3') return 'audio/mpeg';
    if (ext === 'wav') return 'audio/wav';
    if (ext === 'zip') return 'application/zip';
    return 'application/octet-stream';
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const url = new URL(req.url);
    const isDownload = url.searchParams.get("download") === "true";
    
    // 1. Chercher le contenu binaire dans la DB
    const fileRecord = await db.select().from(fileStorage).where(eq(fileStorage.id, id)).limit(1);

    if (fileRecord.length === 0) {
         // Fallback: Check if it's a shared link ID resolving to a file ID
        const linkRecord = await db.select().from(sharedLinks).where(eq(sharedLinks.id, id)).limit(1);
        if (linkRecord.length > 0 && linkRecord[0].filePath.startsWith('db://')) {
             const storageId = linkRecord[0].filePath.replace('db://', '');
             // Redirect to the "real" download URL
             const newUrl = new URL(`/api/download/${storageId}`, req.url);
             if (isDownload) newUrl.searchParams.set("download", "true");
             return NextResponse.redirect(newUrl);
        }
        return NextResponse.json({ error: "Fichier introuvable" }, { status: 404 });
    }

    // Le contenu peut être en Base64 (nouveau) ou binaire/hex (ancien)
    const rawContent = fileRecord[0].content;
    let buffer: Buffer;

    // Détection intelligente du format
    if (typeof rawContent === 'string') {
        if (rawContent.startsWith('\\x')) {
            // Ancien format Hex
            buffer = Buffer.from(rawContent.slice(2), 'hex');
        } else {
            // Nouveau format Base64 (ou Hex sans préfixe)
            try {
                // On vérifie si c'est du Base64 valide
                if (/^[A-Za-z0-9+/=]+$/.test(rawContent) && rawContent.length % 4 === 0) {
                    buffer = Buffer.from(rawContent, 'base64');
                } else {
                    buffer = Buffer.from(rawContent, 'hex');
                }
            } catch (e) {
                buffer = Buffer.from(rawContent as any);
            }
        }
    } else if (Buffer.isBuffer(rawContent)) {
        buffer = rawContent;
    } else if (rawContent instanceof Uint8Array) {
        buffer = Buffer.from(rawContent);
    } else {
        // Fallback pour les objets sérialisés
        const data = (rawContent as any).data || rawContent;
        buffer = Buffer.from(Array.isArray(data) ? data : (data as any).data || data);
    }

    const dbPath = `db://${id}`;

    // 2. Chercher les métadonnées (Nom de fichier, Type)
    // On cherche dans 'conversions' OU 'upscales' qui ont ce filePath
    let fileName = `file-${id}.bin`;
    let targetType = "";
    
    const convSearch = await db.select().from(conversions).where(eq(conversions.filePath, dbPath)).limit(1);
    if (convSearch.length > 0) {
        fileName = convSearch[0].fileName;
        targetType = convSearch[0].targetType;
        
        // Ensure fileName has correct extension if targetType is known
        const currentExt = fileName.split('.').pop()?.toLowerCase();
        if (targetType && targetType !== currentExt && !['unknown', 'manual'].includes(targetType)) {
            fileName = `${fileName.split('.')[0]}.${targetType}`;
        }
    } else {
        const upSearch = await db.select().from(upscales).where(eq(upscales.filePath, dbPath)).limit(1);
        if (upSearch.length > 0) {
            fileName = upSearch[0].fileName;
            // Upscales are always the same type as original or usually images
            targetType = fileName.split('.').pop()?.toLowerCase() || "image";
        } else {
            // Check in sharedLinks (for MetaTransfer)
            const linkSearch = await db.select().from(sharedLinks).where(eq(sharedLinks.filePath, dbPath)).limit(1);
            if (linkSearch.length > 0) {
                fileName = linkSearch[0].fileName;
                targetType = fileName.split('.').pop()?.toLowerCase() || "";
            }
        }
    }

    // 3. Déterminer les headers
    let mimeType = getMimeType(fileName);
    if (targetType && (mimeType === 'application/octet-stream' || !fileName.endsWith(targetType))) {
        // Fallback to targetType if filename doesn't help
        const mappedMime = getMimeType(`file.${targetType}`);
        if (mappedMime !== 'application/octet-stream') {
            mimeType = mappedMime;
        }
    }
    const dispositionType = isDownload ? 'attachment' : 'inline';
    
    // Clean filename for basic header compatibility
    const safeFileName = fileName.replace(/[^\x20-\x7E]/g, '_');
    const encodedFileName = encodeURIComponent(fileName);

    return new Response(new Uint8Array(buffer), {
        headers: {
            "Content-Type": mimeType,
            "Content-Disposition": `${dispositionType}; filename="${safeFileName}"; filename*=UTF-8''${encodedFileName}`,
            "Content-Length": buffer.length.toString(),
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
            "Pragma": "no-cache",
            "Expires": "0",
        }
    });

  } catch (error: any) {
    console.error("Download error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
