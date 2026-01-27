import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { notifications, user } from "@/db/schema";
import { getUserSession } from "@/lib/server-utils";
import { v4 as uuidv4 } from "uuid";
import { inArray } from "drizzle-orm";

export async function POST(req: NextRequest) {
    try {
        const session = await getUserSession(req);
        // Sécurité Admin (ton email)
        if (session?.user?.email !== "contact.arthur.mouton@gmail.com") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { userIds, title, message, type, link, sendToAll } = await req.json();

        if (!title || !message) {
            return NextResponse.json({ error: "Titre et message requis" }, { status: 400 });
        }

        let targets = userIds || [];

        // Si on envoie à tout le monde, on récupère tous les IDs
        if (sendToAll) {
            const allUsers = await db.select({ id: user.id }).from(user);
            targets = allUsers.map(u => u.id);
        }

        if (targets.length === 0) {
            return NextResponse.json({ error: "Aucun utilisateur sélectionné" }, { status: 400 });
        }

        // Création des notifications en masse
        const newNotifications = targets.map((uid: string) => ({
            id: uuidv4(),
            userId: uid,
            title,
            message,
            type: type || 'info',
            link: link || null,
            createdAt: new Date(),
        }));

        // Insertion par paquets pour éviter de saturer la DB
        const chunkSize = 100;
        for (let i = 0; i < newNotifications.length; i += chunkSize) {
            const chunk = newNotifications.slice(i, i + chunkSize);
            await db.insert(notifications).values(chunk);
        }

        return NextResponse.json({ success: true, count: targets.length });
    } catch (error: any) {
        console.error("Notification Send Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
