import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { getUserSession, logOperation } from "@/lib/server-utils";
import { Buffer } from "buffer";
// @ts-ignore
import pdf from "pdf-parse/lib/pdf-parse.js";
import JSZip from "jszip";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

export async function POST(req: NextRequest) {
  let originalFileName = "unknown.pdf";
  let originalFileType = "application/pdf";
  let originalFileSize = 0;
  let userId: string | null = null;
  let tool = "";

  try {
    const session = await getUserSession(req);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    userId = session.user.id;

    const formData = await req.formData();
    tool = formData.get("tool") as string;
    const params: Record<string, any> = {};
    formData.forEach((value, key) => {
      if (key !== "file" && key !== "tool" && key !== "files") {
        try {
          params[key] = JSON.parse(value as string);
        } catch {
          params[key] = value;
        }
      }
    });

    let outputPdfBytes: Uint8Array;
    let outputFileName = originalFileName;
    let outputContentType = "application/pdf";

    // Handle single file upload
    const file = formData.get("file") as File;
    // Handle multiple files for merge
    const files = formData.getAll("files") as File[]; 

    let inputPdfDoc: PDFDocument | null = null;
    let inputPdfBytes: Uint8Array | null = null;

    if (file) {
      originalFileName = file.name;
      inputPdfBytes = new Uint8Array(await file.arrayBuffer());
      originalFileSize = inputPdfBytes.length;
      // We load the PDF doc for validation and for tools that need it (split, merge, protect)
      // For to-word and to-images, strictly speaking we might not need it parsed by pdf-lib, 
      // but it's good validation.
      try {
        inputPdfDoc = await PDFDocument.load(inputPdfBytes);
      } catch (e) {
        // If loading fails, it might be encrypted or invalid.
        // We'll proceed only if the tool doesn't strictly need pdf-lib (e.g. maybe to-word can handle it?)
        // But for safety, let's assume valid PDF is needed.
        console.warn("Failed to load PDF with pdf-lib (might be encrypted or invalid):", e);
        // If we want to support recovering from this for specific tools, we'd handle it here.
      }
    } else if (files && files.length > 0 && tool === "merge") {
        // Handled specifically for merge below
    } else {
        return NextResponse.json({ error: "No file(s) provided" }, { status: 400 });
    }
    
    switch (tool) {
      case "merge":
        if (files.length < 2) {
            return NextResponse.json({ error: "At least two files are required for merging" }, { status: 400 });
        }
        const mergedPdf = await PDFDocument.create();
        for (const f of files) {
            const doc = await PDFDocument.load(new Uint8Array(await f.arrayBuffer()));
            const copiedPages = await mergedPdf.copyPages(doc, doc.getPageIndices());
            copiedPages.forEach((page) => mergedPdf.addPage(page));
        }
        outputPdfBytes = await mergedPdf.save();
        outputFileName = `merged_${Date.now()}.pdf`;
        break;

      case "split":
        if (!inputPdfDoc) throw new Error("PDF file required for splitting");
        const pageNumber = parseInt(params.pageNumber as string) || 1; // Page to split from
        if (pageNumber < 1 || pageNumber > inputPdfDoc.getPageCount()) {
            return NextResponse.json({ error: "Invalid page number for splitting" }, { status: 400 });
        }
        const newPdf = await PDFDocument.create();
        const [pageToExtract] = await newPdf.copyPages(inputPdfDoc, [pageNumber - 1]);
        newPdf.addPage(pageToExtract);
        outputPdfBytes = await newPdf.save();
        outputFileName = `${originalFileName.split('.')[0]}_page_${pageNumber}.pdf`;
        break;

      case "compress":
        // PDF-LIB doesn't offer direct compression.
        // We re-save which might optimize object structure.
        if (!inputPdfDoc) throw new Error("PDF file required for compression");
        outputPdfBytes = await inputPdfDoc.save(); 
        outputFileName = `${originalFileName.split('.')[0]}_compressed.pdf`;
        break;
        
      case "protect":
        // Encryption is not supported in the current version of pdf-lib installed.
        // Needs upgrade or alternative library (e.g. qpdf).
        return NextResponse.json({ error: "Password protection is coming soon!" }, { status: 501 });
        /*
        if (!inputPdfDoc) throw new Error("PDF file required for protection");
        const password = params.password as string;
        if (!password) return NextResponse.json({ error: "Password is required for protection" }, { status: 400 });
        
        await inputPdfDoc.encrypt({
          userPassword: password,
          ownerPassword: password,
          permissions: {
            printing: 'highResolution',
            modifying: false,
            copying: false,
            annotating: false,
            fillingForms: false,
            contentAccessibility: false,
            documentAssembly: false,
          },
        });
        
        outputPdfBytes = await inputPdfDoc.save();
        outputFileName = `${originalFileName.split('.')[0]}_protected.pdf`;
        break;
        */

      case "to-word":
        if (!inputPdfBytes) throw new Error("PDF file required");
        // Use pdf-parse to extract text
        const pdfData = await pdf(Buffer.from(inputPdfBytes));
        outputPdfBytes = Buffer.from(pdfData.text);
        outputFileName = `${originalFileName.split('.')[0]}.txt`; // Providing .txt as it's raw text
        outputContentType = "text/plain";
        break;

      case "to-images":
        if (!inputPdfBytes) throw new Error("PDF file required");
        
        // Use Puppeteer for robust rendering
        const executablePath = await chromium.executablePath();
        const browser = await puppeteer.launch({ 
            args: [...chromium.args, '--hide-scrollbars', '--disable-web-security'],
            defaultViewport: chromium.defaultViewport,
            executablePath: executablePath,
            headless: true
        });
        const page = await browser.newPage();
        
        // We use a specific version of PDF.js that is stable and widely compatible
        const pdfJsUrl = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        const pdfWorkerUrl = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

        try {
            // Load a blank page with PDF.js scripts injected
            await page.setContent(`
                <html>
                <head>
                    <script src="${pdfJsUrl}"></script>
                    <script>
                        // Wait for library to load
                        window.isPdfJsLoaded = false;
                        window.onload = function() {
                           if (window.pdfjsLib) {
                               window.pdfjsLib.GlobalWorkerOptions.workerSrc = '${pdfWorkerUrl}';
                               window.isPdfJsLoaded = true;
                           }
                        };
                    </script>
                </head>
                <body></body>
                </html>
            `);

            // Wait for script to initialize
            await page.waitForFunction('window.isPdfJsLoaded === true', { timeout: 10000 });

            const pdfBase64 = Buffer.from(inputPdfBytes).toString('base64');

            // Render pages in the browser context
            const outputImageFormat = params.format || 'png';
            const pageImages = await page.evaluate(async (data, fmt) => {
                // @ts-ignore
                const pdf = await window.pdfjsLib.getDocument({ data: atob(data) }).promise;
                const images: string[] = [];
                
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const viewport = page.getViewport({ scale: 2.0 }); // 2x scale for quality
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.width = viewport.width;
                    canvas.height = viewport.height;
                    
                    if (context) {
                        await page.render({ canvasContext: context, viewport: viewport }).promise;
                        images.push(canvas.toDataURL(`image/${fmt === 'jpg' ? 'jpeg' : fmt}`));
                    }
                }
                return images;
            }, pdfBase64, outputImageFormat);

            const images = pageImages.map((img: string) => Buffer.from(img.split(',')[1], 'base64'));
            
            if (images.length === 1) {
                // Return single image
                outputPdfBytes = images[0];
                outputFileName = `${originalFileName.split('.')[0]}.${outputImageFormat}`;
                outputContentType = `image/${outputImageFormat === 'jpg' ? 'jpeg' : outputImageFormat}`;
            } else {
                // Zip multiple images
                const zip = new JSZip();
                images.forEach((img, i) => zip.file(`page_${i+1}.${outputImageFormat}`, img));
                outputPdfBytes = await zip.generateAsync({ type: "uint8array" });
                outputFileName = `${originalFileName.split('.')[0]}_images.zip`;
                outputContentType = "application/zip";
            }

        } finally {
            await browser.close();
        }
        break;

      default:
        return NextResponse.json({ error: "Unknown PDF tool" }, { status: 400 });
    }

    await logOperation({
      userId: userId,
      type: "conversion",
      fileName: originalFileName,
      originalSize: originalFileSize,
      convertedSize: outputPdfBytes.length,
      targetType: tool === "to-word" ? "txt" : (tool === "to-images" ? "image/zip" : "pdf"),
      status: 'completed',
      fileBuffer: Buffer.from(outputPdfBytes), // Added for Cloud storage
    });

    const asciiFilename = outputFileName.replace(/[^\x00-\x7F]/g, "_");

    return new NextResponse(outputPdfBytes as any, {
      headers: {
        "Content-Type": outputContentType,
        "Content-Disposition": `attachment; filename="${asciiFilename}"; filename*=UTF-8''${encodeURIComponent(outputFileName)}`,
      },
    });
  } catch (error: any) {
    console.error(`PDF processing error for tool ${tool || 'unknown'}:`, error);
    await logOperation({
        userId: userId || 'anonymous',
        type: 'conversion',
        fileName: originalFileName,
        status: 'failed',
        targetType: 'pdf',
        originalSize: originalFileSize
    });
    return NextResponse.json({ error: "Failed to process PDF: " + error.message }, { status: 500 });
  }
}