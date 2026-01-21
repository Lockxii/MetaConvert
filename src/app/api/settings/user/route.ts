import { NextRequest, NextResponse } from "next/server";
import { getUserSession } from "@/lib/server-utils";
import { db } from "@/db";
import { userSettings, user as usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
    try {
        const session = await getUserSession(req);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const userId = session.user.id;

        const settings = await db.query.userSettings.findFirst({
            where: eq(userSettings.userId, userId),
        });

        const finalSettings = settings || {
            userId: userId,
            theme: "system",
            defaultOutputFormat: "png",
            receiveEmailNotifications: true,
        };

        if (!settings) {
            // Create default settings if none exist
             await db.insert(userSettings).values(finalSettings as any);
        }

        return NextResponse.json(finalSettings);
    } catch (error) {
        console.error("GET user settings error:", error);
        return NextResponse.json({ error: "Failed to fetch user settings" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getUserSession(req);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const userId = session.user.id;

        const body = await req.json();
        const { theme, defaultOutputFormat, receiveEmailNotifications } = body;

        // Validate incoming data
        if (theme && !["system", "light", "dark"].includes(theme)) {
            return NextResponse.json({ error: "Invalid theme value" }, { status: 400 });
        }
        // Add more validation for defaultOutputFormat etc.

        const [updatedSettings] = await db.insert(userSettings).values({
            userId: userId,
            theme: theme,
            defaultOutputFormat: defaultOutputFormat,
            receiveEmailNotifications: receiveEmailNotifications,
            updatedAt: new Date(),
        })
        .onConflictDoUpdate({
            target: userSettings.userId,
            set: {
                theme: theme,
                defaultOutputFormat: defaultOutputFormat,
                receiveEmailNotifications: receiveEmailNotifications,
                updatedAt: new Date(),
            },
        })
        .returning();

        return NextResponse.json(updatedSettings);
    } catch (error) {
        console.error("POST user settings error:", error);
        return NextResponse.json({ error: "Failed to update user settings" }, { status: 500 });
    }
}
