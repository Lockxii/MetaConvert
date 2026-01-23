import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { conversions, upscales, fileStorage } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getUserSession } from "@/lib/server-utils";
import fs from 'fs';
import path from 'path';

export async function DELETE(req: NextRequest) {
    try {
        const session = await getUserSession(req);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id, type } = await req.json();
        const userId = session.user.id;

        let filePathToDelele: string | null = null;

        if (type === 'conversion') {
            const results = await db.select().from(conversions).where(and(eq(conversions.id, id), eq(conversions.userId, userId))).limit(1);
            if (results.length > 0) {
                filePathToDelele = results[0].filePath;
                await db.delete(conversions).where(eq(conversions.id, id));
            }
        } else if (type === 'upscale') {
            const results = await db.select().from(upscales).where(and(eq(upscales.id, id), eq(upscales.userId, userId))).limit(1);
            if (results.length > 0) {
                filePathToDelele = results[0].filePath;
                await db.delete(upscales).where(eq(upscales.id, id));
            }
        }

        // Delete from DB storage or Physical file
        if (filePathToDelele) {
            if (filePathToDelele.startsWith('db://')) {
                const storageId = filePathToDelele.replace('db://', '');
                try {
                    await db.delete(fileStorage).where(eq(fileStorage.id, storageId));
                } catch (e) {
                    console.error("Error deleting from fileStorage:", e);
                }
            } else {
                try {
                    const fullPath = path.join(process.cwd(), 'public', filePathToDelele);
                    if (fs.existsSync(fullPath)) {
                        fs.unlinkSync(fullPath);
                    }
                } catch (e) {
                    console.error("Error deleting physical file:", e);
                }
            }
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Cloud Delete Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
