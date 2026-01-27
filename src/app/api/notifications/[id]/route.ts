import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { getUserSession } from "@/lib/server-utils";
import { eq, and } from "drizzle-orm";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getUserSession(req);
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        const results = await db.select()
            .from(notifications)
            .where(and(eq(notifications.id, id), eq(notifications.userId, session.user.id)))
            .limit(1);

        if (results.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

        // Marquer comme lu
        await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));

        return NextResponse.json({ notification: results[0] });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getUserSession(req);
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        const { action, response, option } = await req.json();

        if (action === 'respond') {
            await db.update(notifications)
                .set({ userResponse: response })
                .where(and(eq(notifications.id, id), eq(notifications.userId, session.user.id)));
        } 
        else if (action === 'vote') {
            const results = await db.select().from(notifications).where(eq(notifications.id, id)).limit(1);
            if (results.length > 0) {
                const currentResults = results[0].pollVotes ? JSON.parse(results[0].pollVotes) : {};
                currentResults[option] = (currentResults[option] || 0) + 1;
                await db.update(notifications)
                    .set({ pollVotes: JSON.stringify(currentResults) })
                    .where(eq(notifications.id, id));
            }
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getUserSession(req);
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        await db.delete(notifications)
            .where(and(eq(notifications.id, id), eq(notifications.userId, session.user.id)));

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
