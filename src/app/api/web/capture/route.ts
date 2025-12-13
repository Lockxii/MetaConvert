import { NextRequest, NextResponse } from "next/server";
import { getUserSession, logOperation } from "@/lib/server-utils";
import puppeteer from "puppeteer";
import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

export async function POST(req: NextRequest) {
  let userId: string | null = null;
  const originalFileName = "web_capture";
  let outputFileName: string;
  let outputFileType: string;
  let outputMimeType: string;
  let outputBuffer: Buffer;

  try {
    const session = await getUserSession(req);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    userId = session.user.id;

    const formData = await req.formData();
    const url = formData.get("url") as string;
    const format = formData.get("format") as "jpeg" | "pdf";

    if (!url || !format) {
      return NextResponse.json({ error: "URL and format are required" }, { status: 400 });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
    }

    const browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'] // Required for some environments like Vercel
    });
    const page = await browser.newPage();

    // Set a default timeout for navigation
    await page.setDefaultNavigationTimeout(60000); // 60 seconds

    try {
      await page.goto(url, { waitUntil: 'networkidle2' });
    } catch (e) {
      await browser.close();
      return NextResponse.json({ error: `Failed to navigate to URL: ${e instanceof Error ? e.message : String(e)}` }, { status: 400 });
    }

    const tempDir = tmpdir();

    if (format === "jpeg") {
      outputBuffer = (await page.screenshot({ 
        type: "jpeg", 
        quality: 80, 
        fullPage: true 
      })) as Buffer;
      outputFileName = `${originalFileName}_${Date.now()}.jpeg`;
      outputMimeType = "image/jpeg";
      outputFileType = "jpeg";
    } else if (format === "pdf") {
      outputBuffer = (await page.pdf({ 
        format: "A4", 
        printBackground: true,
        margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' }
      })) as Buffer;
      outputFileName = `${originalFileName}_${Date.now()}.pdf`;
      outputMimeType = "application/pdf";
      outputFileType = "pdf";
    } else {
      await browser.close();
      return NextResponse.json({ error: "Unsupported capture format" }, { status: 400 });
    }

    await browser.close();

    await logOperation({
      userId: userId,
      type: "conversion",
      fileName: url, // Log the URL as file name
      originalSize: 0, // No original file, so 0
      convertedSize: outputBuffer.length,
      targetType: outputFileType,
      status: 'completed',
    });

    return new NextResponse(outputBuffer as any, {
      headers: {
        "Content-Type": outputMimeType,
        "Content-Disposition": `attachment; filename="${outputFileName}"`,
      },
    });
  } catch (error: any) {
    console.error(`Web capture error for URL ${req.formData().then(d=>d.get('url'))}:`, error);
    await logOperation({
        userId: userId || 'anonymous',
        type: 'conversion',
        fileName: originalFileName,
        status: 'failed',
        targetType: 'web_capture',
        originalSize: 0
    });
    return NextResponse.json({ error: "Failed to capture web page: " + error.message }, { status: 500 });
  }
}
