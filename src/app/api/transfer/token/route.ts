import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { getUserSession } from "@/lib/server-utils";

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const session = await getUserSession(request as any);
        if (!session?.user?.id) throw new Error('Unauthorized');

        return {
          allowedContentTypes: [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp', 
            'video/mp4', 'video/quicktime', 'video/webm', 
            'application/pdf', 'application/zip', 'application/x-zip-compressed'
          ],
          tokenPayload: JSON.stringify({
            userId: session.user.id,
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Optionnel : on pourrait sauvegarder en DB ici, 
        // mais on le fait déjà côté client pour la simplicité du flux actuel.
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 },
    );
  }
}