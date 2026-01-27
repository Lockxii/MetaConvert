import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { notifications, user } from "@/db/schema";
import { getUserSession } from "@/lib/server-utils";
import { eq, desc, sql, count, and, isNotNull } from "drizzle-orm";

export async function GET(req: NextRequest) {
    try {
        const session = await getUserSession(req);
        if (session?.user?.email !== "contact.arthur.mouton@gmail.com") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const url = new URL(req.url);
        const campaignId = url.searchParams.get("campaignId");

        if (campaignId) {
            // Stats détaillées pour UNE campagne
            const allNotifs = await db.select({
                id: notifications.id,
                title: notifications.title,
                message: notifications.message,
                isRead: notifications.isRead,
                userResponse: notifications.userResponse,
                pollVotes: notifications.pollVotes, // On utilise pollVotes pour le choix fait par l'user
                userName: user.name,
                userEmail: user.email,
                createdAt: notifications.createdAt
            })
            .from(notifications)
            .leftJoin(user, eq(notifications.userId, user.id))
            .where(eq(notifications.campaignId, campaignId));

            return NextResponse.json({ details: allNotifs });
        }

        // Liste de toutes les campagnes uniques
        const campaigns = await db.select({
            campaignId: notifications.campaignId,
            title: notifications.title,
            createdAt: sql`MIN(${notifications.createdAt})`,
            total: count(),
            read: sql`SUM(CASE WHEN ${notifications.isRead} THEN 1 ELSE 0 END)`,
            responses: sql`SUM(CASE WHEN ${notifications.userResponse} IS NOT NULL THEN 1 ELSE 0 END)`
        })
        .from(notifications)
        .where(isNotNull(notifications.campaignId))
        .groupBy(notifications.campaignId, notifications.title)
        .orderBy(desc(sql`MIN(${notifications.createdAt})`));

        return NextResponse.json({ campaigns });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
