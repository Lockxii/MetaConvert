import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { dropLinks, conversions } from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";
import { logOperation } from "@/lib/server-utils";

import { getUserSession } from "@/lib/server-utils";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const results = await db.select()
      .from(dropLinks)
      .where(
        and(
          eq(dropLinks.id, id),
          eq(dropLinks.isActive, true),
          gt(dropLinks.expiresAt, new Date())
        )
      )
      .limit(1);

    if (results.length === 0) {
      return NextResponse.json({ error: "Lien expiré, désactivé ou invalide" }, { status: 404 });
    }

    const link = results[0];
    
    return NextResponse.json({
      id: link.id,
      title: link.title,
      description: link.description,
      hasPassword: !!link.password,
      expiresAt: link.expiresAt
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const formData = await req.formData();
        
        const password = formData.get("password") as string | null;
        const files = formData.getAll("files") as File[];

        if (files.length === 0) {
            return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
        }

        const results = await db.select()
            .from(dropLinks)
            .where(eq(dropLinks.id, id))
            .limit(1);

        if (results.length === 0) {
            return NextResponse.json({ error: "Lien introuvable" }, { status: 404 });
        }

        const link = results[0];

        // Verify password if set
        if (link.password && link.password !== password) {
            return NextResponse.json({ error: "Mot de passe incorrect" }, { status: 401 });
        }

        // Process uploads and save to the owner's cloud
        for (const file of files) {
            const buffer = Buffer.from(await file.arrayBuffer());
            
            await logOperation({
                userId: link.userId, // Save to the owner's userId
                type: "conversion",
                fileName: `[DROP] ${file.name}`,
                originalSize: file.size,
                convertedSize: file.size,
                targetType: file.name.split('.').pop() || 'unknown',
                status: 'completed',
                fileBuffer: buffer,
                dropLinkId: link.id // Link to this drop request
            });
        }

        // Deactivate the link after a file has been deposited
        await db.update(dropLinks)
            .set({ isActive: false })
            .where(eq(dropLinks.id, id));

        return NextResponse.json({ success: true, message: `${files.length} fichiers déposés avec succès !` });
    } catch (error: any) {
        console.error("Drop Upload Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getUserSession(req);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        // Delete only if it belongs to the user
        const result = await db.delete(dropLinks)
            .where(and(eq(dropLinks.id, id), eq(dropLinks.userId, session.user.id)));

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Drop Delete Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
