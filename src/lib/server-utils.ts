import { auth } from "@/lib/auth";
import { db } from "@/db";
import { conversions, upscales, user as usersTable, fileStorage } from "@/db/schema";
import { NextRequest } from "next/server";
import { InferInsertModel, sql } from "drizzle-orm";

interface LogOperationParams {
    userId: string;
    type: 'conversion' | 'upscale';
    fileName: string;
    originalSize?: number;
    convertedSize?: number; // For conversions
    targetType?: string; // For conversions
    factor?: number; // For upscales
    status: 'completed' | 'failed' | 'pending';
    fileBuffer?: Buffer; // New: to save the file
    dropLinkId?: string; // New: to track origin drop link
}

export async function getUserSession(req: NextRequest) {
    const session = await auth.api.getSession({ headers: req.headers });
    return session;
}

import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

import { put } from "@vercel/blob";

export async function logOperation(params: LogOperationParams) {
    if (!process.env.DATABASE_URL) {
        console.warn("Skipping DB logging: DATABASE_URL is not set.");
        return;
    }

    // Auto-repair: Ensure table exists with TEXT content
    try {
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS "file_contents" (
                "id" text PRIMARY KEY NOT NULL,
                "content" text NOT NULL,
                "created_at" timestamp DEFAULT now()
            );
        `);
    } catch (e) {}

    let filePath: string | null = null;
    if (params.fileBuffer && params.status === 'completed') {
        try {
            // Si le fichier fait plus de 4Mo ou si c'est une vidéo, on utilise Vercel Blob
            // Sinon on garde la DB pour les petits fichiers (plus rapide à lire)
            const isLarge = params.fileBuffer.length > 4 * 1024 * 1024;
            const isVideo = params.fileName.match(/\.(mp4|webm|mov|avi)$/i);

            if (isLarge || isVideo || process.env.BLOB_READ_WRITE_TOKEN) {
                const blob = await put(`conversions/${uuidv4()}-${params.fileName}`, params.fileBuffer, {
                    access: 'public',
                });
                filePath = blob.url;
            } else {
                const fileId = uuidv4();
                const base64Content = params.fileBuffer.toString('base64');
                await db.insert(fileStorage).values({
                    id: fileId,
                    content: base64Content
                });
                filePath = `db://${fileId}`;
            }
        } catch (e) {
            console.error("Error saving file to storage:", e);
        }
    }

    try {
        if (params.type === 'conversion') {
            const conversionData: InferInsertModel<typeof conversions> = {
                userId: params.userId,
                fileName: params.fileName,
                fileType: params.fileName.split('.').pop() || 'unknown',
                targetType: params.targetType || 'unknown',
                status: params.status,
                originalSize: params.originalSize,
                convertedSize: params.convertedSize,
                filePath: filePath,
                dropLinkId: params.dropLinkId,
                createdAt: new Date(),
            };
            await db.insert(conversions).values(conversionData);
        } else if (params.type === 'upscale') {
            const upscaleData: InferInsertModel<typeof upscales> = {
                userId: params.userId,
                fileName: params.fileName,
                originalSize: params.originalSize,
                upscaledSize: params.convertedSize, 
                factor: params.factor,
                filePath: filePath,
                dropLinkId: params.dropLinkId,
                createdAt: new Date(),
            };
            await db.insert(upscales).values(upscaleData);
        }
    } catch (e) {
        console.error("Error logging operation to DB:", e);
    }
}
