"use server";

import { db } from "@/db";
import { conversions, upscales, user } from "@/db/schema";
import { desc, eq, isNotNull } from "drizzle-orm";

export async function getAllFiles() {
    try {
        const conversionFiles = await db.select({
            id: conversions.id,
            fileName: conversions.fileName,
            fileType: conversions.fileType,
            filePath: conversions.filePath,
            createdAt: conversions.createdAt,
            userId: conversions.userId,
            userName: user.name,
            userEmail: user.email,
            type: conversions.targetType // abused as 'type' identifier
        })
        .from(conversions)
        .leftJoin(user, eq(conversions.userId, user.id))
        .where(isNotNull(conversions.filePath))
        .orderBy(desc(conversions.createdAt));

        const upscaleFiles = await db.select({
            id: upscales.id,
            fileName: upscales.fileName,
            fileType: upscales.fileName, // Hacky, assume ext in name
            filePath: upscales.filePath,
            createdAt: upscales.createdAt,
            userId: upscales.userId,
            userName: user.name,
            userEmail: user.email,
            type: upscales.factor // abused
        })
        .from(upscales)
        .leftJoin(user, eq(upscales.userId, user.id))
        .where(isNotNull(upscales.filePath))
        .orderBy(desc(upscales.createdAt));

        // Normalize
        const combined = [
            ...conversionFiles.map(f => ({ ...f, category: 'conversion', typeLabel: f.type })),
            ...upscaleFiles.map(f => ({ ...f, category: 'upscale', typeLabel: `Upscale x${f.type}` }))
        ].sort((a, b) => {
            return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        });

        return { success: true, data: combined };

    } catch (error) {
        console.error("Error fetching all files:", error);
        return { success: false, error: "Failed to fetch files" };
    }
}
