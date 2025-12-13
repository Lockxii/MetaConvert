import { auth } from "@/lib/auth";
import { db } from "@/db";
import { conversions, upscales, user as usersTable } from "@/db/schema";
import { NextRequest } from "next/server";
import { InferInsertModel } from "drizzle-orm";

interface LogOperationParams {
    userId: string;
    type: 'conversion' | 'upscale';
    fileName: string;
    originalSize?: number;
    convertedSize?: number; // For conversions
    targetType?: string; // For conversions
    factor?: number; // For upscales
    status: 'completed' | 'failed' | 'pending';
}

export async function getUserSession(req: NextRequest) {
    const session = await auth.api.getSession({ headers: req.headers });
    return session;
}

export async function logOperation(params: LogOperationParams) {
    if (!process.env.DATABASE_URL) {
        console.warn("Skipping DB logging: DATABASE_URL is not set.");
        return;
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
                createdAt: new Date(),
            };
            await db.insert(conversions).values(conversionData);
        } else if (params.type === 'upscale') {
            const upscaleData: InferInsertModel<typeof upscales> = {
                userId: params.userId,
                fileName: params.fileName,
                originalSize: params.originalSize,
                upscaledSize: params.convertedSize, // Converted size is upscaled size here
                factor: params.factor,
                createdAt: new Date(),
            };
            await db.insert(upscales).values(upscaleData);
        }
    } catch (e) {
        console.error("Error logging operation to DB:", e);
    }
}
