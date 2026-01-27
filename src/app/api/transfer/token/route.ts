import { generateClientTokenFromReadWriteToken } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { getUserSession } from "@/lib/server-utils";

export async function GET(request: Request) {
  const session = await getUserSession(request as any);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const pathname = searchParams.get('pathname');

  if (!pathname) return NextResponse.json({ error: "Pathname required" }, { status: 400 });

  const token = await generateClientTokenFromReadWriteToken({
    returnPayload: JSON.stringify({
      userId: session.user.id,
    }),
    allowedContentTypes: [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp', 
        'video/mp4', 'video/quicktime', 'video/webm', 
        'application/pdf', 'application/zip', 'application/x-zip-compressed'
    ],
  });

  return NextResponse.json({ token });
}
