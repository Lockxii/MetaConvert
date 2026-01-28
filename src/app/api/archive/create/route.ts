import { NextRequest, NextResponse } from "next/server";
import { getUserSession, logOperation } from "@/lib/server-utils";
import archiver from "archiver";
// @ts-ignore
import { registerFormat } from "archiver";
// @ts-ignore
import ZipEncrypted from "archiver-zip-encrypted";

// Register the encrypted zip format
try {
    registerFormat("zip-encrypted", ZipEncrypted);
} catch (e) {
    // Already registered or error
}

export async function POST(req: NextRequest) {
  let userId: string | null = null;
  
  try {
    const session = await getUserSession(req);
    userId = session?.user?.id || null;

    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    const password = formData.get("password") as string;
    const fileName = formData.get("fileName") as string || "archive.zip";
    const encryptionMethod = formData.get("encryptionMethod") as string || "aes256";

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
    }

    if (!password) {
      return NextResponse.json({ error: "Mot de passe requis pour l'archivage chiffré" }, { status: 400 });
    }

    // We'll collect the archive in a buffer to allow Cloud saving
    const chunks: any[] = [];
    const archive = archiver("zip-encrypted" as any, {
        zlib: { level: 9 },
        encryptionMethod: encryptionMethod, // aes256 ou zip20
        password: password
    } as any);

    const archivePromise = new Promise<Buffer>((resolve, reject) => {
        archive.on("data", (chunk) => chunks.push(chunk));
        archive.on("end", () => resolve(Buffer.concat(chunks)));
        archive.on("error", (err) => reject(err));
    });

    // Add files to the archive
    for (const file of files) {
        const buffer = Buffer.from(await file.arrayBuffer());
        archive.append(buffer, { name: file.name });
    }

    // Finalize and wait for the buffer
    await archive.finalize();
    const finalBuffer = await archivePromise;

    // Log the operation and save to Cloud
    await logOperation({
        userId: userId || "anonymous",
        type: "conversion",
        fileName: fileName,
        originalSize: files.reduce((acc, f) => acc + f.size, 0),
        convertedSize: finalBuffer.length,
        targetType: "zip",
        status: "completed",
        fileBuffer: finalBuffer
    });

    // Return the buffer
    return new NextResponse(finalBuffer as any, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });

  } catch (error: any) {
    console.error("[Archive API] Error:", error);
    return NextResponse.json({ error: "Échec de l'archivage : " + error.message }, { status: 500 });
  }
}