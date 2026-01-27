import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { notifications, user } from "@/db/schema";
import { getUserSession } from "@/lib/server-utils";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
    try {
        const session = await getUserSession(req);
        if (session?.user?.email !== "contact.arthur.mouton@gmail.com") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { 
            userIds, title, message, type, link, image, 
            sendToAll, requiresResponse, pollOptions 
        } = await req.json();

        if (!title || !message) {
            return NextResponse.json({ error: "Titre et message requis" }, { status: 400 });
        }

        let targets = userIds || [];
        if (sendToAll) {
            const allUsers = await db.select({ id: user.id }).from(user);
            targets = allUsers.map((u: { id: string }) => u.id);
        }

        const isInteractive = requiresResponse || (pollOptions && pollOptions.length > 0);

        const newNotifications = targets.map((uid: string) => ({
            id: uuidv4(),
            userId: uid,
            title,
            message,
            type: type || 'info',
            image: image || null,
            link: link || null,
            requiresResponse: !!requiresResponse,
            isInteractive: !!isInteractive,
            pollOptions: pollOptions ? JSON.stringify(pollOptions) : null,
            createdAt: new Date(),
        }));

        const chunkSize = 100;
        for (let i = 0; i < newNotifications.length; i += chunkSize) {
            await db.insert(notifications).values(newNotifications.slice(i, i + chunkSize));
        }

        return NextResponse.json({ success: true, count: targets.length });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}