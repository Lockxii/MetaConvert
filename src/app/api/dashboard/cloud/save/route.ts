import { NextRequest, NextResponse } from "next/server";
import { getUserSession, logOperation } from "@/lib/server-utils";

export async function POST(req: NextRequest) {
  try {
    const session = await getUserSession(req);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const tool = formData.get("tool") as string || "manual";

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    await logOperation({
      userId: session.user.id,
      type: "conversion",
      fileName: file.name,
      originalSize: buffer.length,
      convertedSize: buffer.length,
      targetType: file.name.split('.').pop() || 'unknown',
      status: 'completed',
      fileBuffer: buffer,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Manual Save Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
