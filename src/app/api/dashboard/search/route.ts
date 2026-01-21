import { NextRequest, NextResponse } from "next/server";
import { getUserSession } from "@/lib/server-utils";
import { db } from "@/db";
import { conversions, upscales } from "@/db/schema";
import { eq, like, or, sql, and, ilike, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
    try {
        const session = await getUserSession(req);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const userId = session.user.id;
        
        const { searchParams } = new URL(req.url);
        const query = searchParams.get("query") || "";

        if (!query) {
            return NextResponse.json({ conversions: [], upscales: [] });
        }

        const searchTerm = `%${query.toLowerCase()}%`;

        // Tools search
        const tools = [
            { name: "Vue d'ensemble", href: "/dashboard", icon: "LayoutDashboard", description: "Tableau de bord principal" },
            { name: "Mon Cloud", href: "/dashboard/cloud", icon: "Cloud", description: "Gérer vos fichiers stockés" },
            { name: "Image Converter", href: "/dashboard/image", icon: "Image", description: "Convertir et optimiser des images" },
            { name: "PDF Tools", href: "/dashboard/pdf", icon: "FileText", description: "Outils PDF (Fusion, conversion)" },
            { name: "PDF Weaver", href: "/dashboard/pdf-weaver", icon: "Layers", description: "Assemblage avancé de PDF" },
            { name: "Vidéo Converter", href: "/dashboard/video", icon: "Video", description: "Conversion et compression vidéo" },
            { name: "Audio Converter", href: "/dashboard/audio", icon: "Music", description: "Outils audio et extraction" },
            { name: "Web Capture", href: "/dashboard/web", icon: "Globe", description: "Capturer des sites web" },
            { name: "Archives", href: "/dashboard/archive", icon: "Archive", description: "Créer et extraire des archives (ZIP)" },
            { name: "File Drop", href: "/dashboard/drop", icon: "FolderUp", description: "Demander des fichiers via lien" },
            { name: "Réglages", href: "/dashboard/settings", icon: "Settings", description: "Préférences et compte" },
        ];

        const foundTools = tools.filter(tool => 
            tool.name.toLowerCase().includes(query.toLowerCase()) || 
            tool.description.toLowerCase().includes(query.toLowerCase())
        );

        const foundConversions = await db.query.conversions.findMany({
            where: and(
                eq(conversions.userId, userId),
                or(
                    ilike(conversions.fileName, searchTerm),
                    ilike(conversions.fileType, searchTerm),
                    ilike(conversions.targetType, searchTerm)
                )
            ),
            orderBy: desc(conversions.createdAt),
            limit: 5,
        });

        const foundUpscales = await db.query.upscales.findMany({
            where: and(
                eq(upscales.userId, userId),
                ilike(upscales.fileName, searchTerm)
            ),
            orderBy: desc(upscales.createdAt),
            limit: 5,
        });

        return NextResponse.json({
            tools: foundTools,
            conversions: foundConversions,
            upscales: foundUpscales,
        });

    } catch (error) {
        console.error("Dashboard search error:", error);
        return NextResponse.json({ error: "Failed to perform search" }, { status: 500 });
    }
}
