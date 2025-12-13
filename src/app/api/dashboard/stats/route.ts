import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { conversions, upscales } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq, desc, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch aggregated stats
    const [conversionStats] = await db
      .select({
        count: sql<number>`count(*)`,
        totalOriginalSize: sql<number>`sum(${conversions.originalSize})`,
        totalConvertedSize: sql<number>`sum(${conversions.convertedSize})`,
      })
      .from(conversions)
      .where(eq(conversions.userId, userId));

    const [upscaleStats] = await db
        .select({ count: sql<number>`count(*)` })
        .from(upscales)
        .where(eq(upscales.userId, userId));

    // Calculate derived stats
    const totalConversions = Number(conversionStats?.count || 0);
    const totalUpscales = Number(upscaleStats?.count || 0);
    const totalProcessed = totalConversions + totalUpscales;

    const originalSize = Number(conversionStats?.totalOriginalSize || 0);
    const convertedSize = Number(conversionStats?.totalConvertedSize || 0);
    const spaceSavedBytes = Math.max(0, originalSize - convertedSize);
    
    // Format space saved
    let spaceSaved = "0 B";
    if (spaceSavedBytes > 1024 * 1024 * 1024) spaceSaved = (spaceSavedBytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
    else if (spaceSavedBytes > 1024 * 1024) spaceSaved = (spaceSavedBytes / (1024 * 1024)).toFixed(2) + " MB";
    else if (spaceSavedBytes > 1024) spaceSaved = (spaceSavedBytes / 1024).toFixed(2) + " KB";

    // Fetch recent files
    const recentConversions = await db
      .select()
      .from(conversions)
      .where(eq(conversions.userId, userId))
      .orderBy(desc(conversions.createdAt))
      .limit(5);

    // Mock chart data (since we don't have enough historical data yet to make a real chart look good)
    // In a real app, you would aggregate by day using SQL
    const chartData = [
        { name: 'Lun', conversions: 0 },
        { name: 'Mar', conversions: 0 },
        { name: 'Mer', conversions: 0 },
        { name: 'Jeu', conversions: 0 },
        { name: 'Ven', conversions: 0 },
        { name: 'Sam', conversions: 0 },
        { name: 'Dim', conversions: totalConversions }, // Put all today
    ];

    return NextResponse.json({
        totalConversions: totalProcessed,
        spaceSaved,
        successRate: "100%", // Mock for now
        timeSaved: "0m", // Mock for now
        recentFiles: recentConversions,
        chartData
    });

  } catch (error) {
    console.error("Stats Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
