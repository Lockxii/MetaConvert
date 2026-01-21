import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { dropLinks } from "@/db/schema";
import { getUserSession } from "@/lib/server-utils";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const session = await getUserSession(req);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, description, expiration, password } = await req.json();

    if (!title) {
      return NextResponse.json({ error: "Le titre est requis" }, { status: 400 });
    }

    const id = uuidv4();
    const expirationHours = parseInt(expiration || "24");
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expirationHours);

    await db.insert(dropLinks).values({
      id,
      title,
      description: description || null,
      password: password || null,
      expiresAt,
      userId: session.user.id,
      isActive: true
    });

    const dropUrl = `${new URL(req.url).origin}/drop/${id}`;

    return NextResponse.json({ dropUrl, expiresAt });
  } catch (error: any) {
    console.error("Drop Link Creation Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
    try {
        const session = await getUserSession(req);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userLinks = await db.select()
            .from(dropLinks)
            .where(sql`user_id = ${session.user.id}`)
            .orderBy(desc(dropLinks.createdAt));

        return NextResponse.json({ links: userLinks });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

import { desc, sql } from "drizzle-orm";
