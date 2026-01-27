import { generateClientToken } from '@vercel/blob';
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

  const token = await generateClientToken({
    pathname,
    onUploadCompleted: async ({ blob, tokenPayload }) => {
      // Optionnel: on pourrait enregistrer ici, mais on le fait déjà côté client
    },
  });

  return NextResponse.json({ token });
}
