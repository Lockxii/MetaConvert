"use client";

import { FileUploader } from "@/components/dashboard/FileUploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Label } from "@radix-ui/react-label";
import { useFileProcessor } from "@/hooks/useFileProcessor";
import { cn } from "@/lib/utils";
import { Download, Layers, Maximize2, RotateCw, Wand2, ArrowRight, Crop, Minimize2, FlipHorizontal, FlipVertical, Sparkles, ImageOff, Type, Check } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import ReactCrop, { centerCrop, makeAspectCrop, Crop as ReactCropType, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css'; 
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToolButton } from "@/components/dashboard/ToolButton"; 

const tools = [
  { id: "convert", label: "Convertir", icon: Type, color: "text-blue-500", bg: "bg-blue-500/10", description: "Changez le format de votre image (PNG, JPG, WEBP)." },
  { id: "crop", label: "Rogner", icon: Crop, color: "text-green-500", bg: "bg-green-500/10", description: "Recadrez votre image aux dimensions souhaitées." },
  { id: "transform", label: "Transformer", icon: RotateCw, color: "text-purple-500", bg: "bg-purple-500/10", description: "Pivotez ou retournez votre image." },
  { id: "upscale", label: "Améliorer (Upscale)", icon: Sparkles, color: "text-orange-500", bg: "bg-orange-500/10", description: "Augmentez la résolution de votre image." },
];

export default function ImageToolsPage() {
  const [activeToolId, setActiveToolId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState("");
  
  // Processing state
  const { processFile, loading: processing, progress } = useFileProcessor({
    apiEndpoint: "/api/image/process", 
    onSuccess: (blob, fileName) => {
      toast.success(`Traitement terminé : ${fileName}`);
      // Don't auto-clear for images, user might want to re-edit
    },
    onError: (error) => {
      toast.error(`Erreur : ${error}`);
    },
  });

  // Tool specific states
  const [targetFormat, setTargetFormat] = useState("png");
  const [upscaleFactor, setUpscaleFactor] = useState(2);
  
  // Crop & Transform states
  const imgRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const [crop, setCrop] = useState<ReactCropType>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [rotation, setRotation] = useState(0);
  const [scaleX, setScaleX] = useState(1);
  const [scaleY, setScaleY] = useState(1);
  const [aspect, setAspect] = useState<number | undefined>(undefined);
  const [scale, setScale] = useState(1); // Zoom for crop view
  const [croppedImage, setCroppedImage] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedFile) {
        setImageSrc("");
        return;
    }
    const reader = new FileReader();
    reader.addEventListener("load", () => setImageSrc(reader.result?.toString() || ""));
    reader.readAsDataURL(selectedFile);
  }, [selectedFile]);

  const activeTool = tools.find(t => t.id === activeToolId);

  // Handlers
  const handleProcess = async () => {
    if (!selectedFile || !activeToolId) return;

    if (activeToolId === "convert") {
        await processFile(selectedFile, { tool: "convert", format: targetFormat });
    } else if (activeToolId === "upscale") {
        await processFile(selectedFile, { tool: "upscale", factor: upscaleFactor });
    } else if (activeToolId === "crop" || activeToolId === "transform") {
        // For crop/transform, we use the canvas logic locally then maybe upload?
        // Or we just download the result locally.
        // The original logic seemed to imply backend processing for convert/upscale, 
        // but frontend canvas for crop/transform.
        // I will implement "Download Result" for Crop/Transform using canvas.
        onDownloadCropClick(); 
    }
  };

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    if (aspect) {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, aspect));
    }
  }

  const onRotateClick = () => setRotation((prev) => (prev + 90) % 360);
  const onFlipHorizontalClick = () => setScaleX((prev) => prev === 1 ? -1 : 1);
  const onFlipVerticalClick = () => setScaleY((prev) => prev === 1 ? -1 : 1);

  const onDownloadCropClick = async () => {
    const image = imgRef.current;
    const previewCanvas = previewCanvasRef.current;
    if (!image || !previewCanvas || !completedCrop) {
        // If no crop, maybe we just want to apply transform?
        // Use full image as crop if no crop set?
        toast.error("Veuillez définir une zone de recadrage ou valider la transformation.");
        return;
    }

    await canvasPreview(
      image,
      previewCanvas,
      completedCrop,
      scale, // This scale is zoom, not image scale
      rotation,
      scaleX,
      scaleY
    );

    const blob = await new Promise<Blob | null>((resolve) => previewCanvas.toBlob(resolve, 'image/png'));
    if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `edited_${selectedFile?.name || 'image'}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("Image traitée téléchargée !");
    }
  };


  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-foreground">Outils Image</h1>
        <p className="text-muted-foreground">Transformez, améliorez et convertissez vos images.</p>
      </div>

       {/* Tool Selection Grid */}
       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {tools.map((tool) => (
             <button
                key={tool.id}
                onClick={() => {
                    setActiveToolId(tool.id);
                    setSelectedFile(null); 
                    setCroppedImage(null);
                    setRotation(0);
                    setScaleX(1);
                    setScaleY(1);
                    setCrop(undefined);
                }}
                className={cn(
                   "p-4 rounded-xl border transition-all flex flex-col items-center gap-3 hover:shadow-md relative overflow-hidden",
                   activeToolId === tool.id 
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20" 
                      : "border-border bg-card hover:border-primary/50"
                )}
                title={tool.description}
             >
                <div className={cn("p-2 rounded-lg", tool.bg)}>
                   <tool.icon className={cn("h-6 w-6", tool.color)} />
                </div>
                <span className="text-sm font-medium text-foreground">{tool.label}</span>
                {activeToolId === tool.id && (
                    <div className="absolute top-2 right-2 flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground">
                        <Check size={12} />
                    </div>
                )}
             </button>
          ))}
       </div>

       {/* Workspace Area */}
       {activeToolId && activeTool && (
         <div className="bg-card border border-border rounded-xl p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
                 <activeTool.icon className={cn("h-6 w-6", activeTool.color)} />
                 <h2 className="text-lg font-bold text-foreground">{activeTool.label}</h2>
             </div>

             <div className="grid lg:grid-cols-2 gap-8">
                 <div className="space-y-4">
                    <FileUploader 
                        onFileChange={(files) => setSelectedFile(files[0])}
                        acceptedFileTypes={{'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.gif']}}
                        label={`Déposez votre image pour ${activeTool.label.toLowerCase()}`}
                    />
                    
                    {/* Preview Area for Crop/Transform */}
                    {(activeToolId === "crop" || activeToolId === "transform") && imageSrc && (
                        <div className="mt-4 bg-muted/50 rounded-lg p-4 flex items-center justify-center min-h-[300px] overflow-hidden">
                             <ReactCrop
                                crop={crop}
                                onChange={(c) => setCrop(c)}
                                onComplete={(c) => setCompletedCrop(c)}
                                aspect={aspect}
                             >
                                <img
                                    ref={imgRef}
                                    alt="Source"
                                    src={imageSrc}
                                    onLoad={onImageLoad}
                                    style={{ transform: `scale(${scale * scaleX}, ${scale * scaleY}) rotate(${rotation}deg)` }}
                                    className="max-w-full h-auto block"
                                />
                             </ReactCrop>
                        </div>
                    )}
                 </div>

                 <div className="flex flex-col gap-6 p-6 bg-muted/30 rounded-xl border border-border">
                     <div className="space-y-4">
                        <h3 className="font-semibold text-foreground">Paramètres</h3>

                        {activeToolId === "convert" && (
                            <div className="space-y-2">
                                <Label className="text-foreground">Format de sortie</Label>
                                <Select onValueChange={setTargetFormat} value={targetFormat}>
                                    <SelectTrigger className="bg-card border-border">
                                        <SelectValue placeholder="Sélectionner format" />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-[300px]">
                                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Standards Web</div>
                                        <SelectItem value="png">PNG (Transparence)</SelectItem>
                                        <SelectItem value="jpeg">JPEG (Photo)</SelectItem>
                                        <SelectItem value="webp">WEBP (Optimisé)</SelectItem>
                                        <SelectItem value="gif">GIF (Animé)</SelectItem>
                                        
                                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">Pro & Print</div>
                                        <SelectItem value="avif">AVIF (Ultra-compression)</SelectItem>
                                        <SelectItem value="tiff">TIFF (Impression)</SelectItem>
                                        <SelectItem value="pdf">PDF (Document)</SelectItem>
                                        
                                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">Software & Legacy</div>
                                        <SelectItem value="bmp">BMP (Bitmap)</SelectItem>
                                        <SelectItem value="ico">ICO (Favicon)</SelectItem>
                                        <SelectItem value="tga">TGA (Targa)</SelectItem>
                                        
                                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">Spécialisés</div>
                                        <SelectItem value="jp2">JP2 (JPEG 2000)</SelectItem>
                                        <SelectItem value="pcx">PCX (Paintbrush)</SelectItem>
                                        <SelectItem value="xpm">XPM (X11 Pixmap)</SelectItem>
                                        <SelectItem value="sgi">SGI (Silicon Graphics)</SelectItem>
                                        <SelectItem value="dpx">DPX (Cinéma)</SelectItem>
                                        <SelectItem value="ppm">PPM (Portable Pixel)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {activeToolId === "upscale" && (
                            <div className="space-y-2">
                                <Label className="text-foreground">Facteur d'agrandissement ({upscaleFactor}x)</Label>
                                <Slider
                                    min={1.5}
                                    max={4}
                                    step={0.5}
                                    value={upscaleFactor}
                                    onChange={(e) => setUpscaleFactor(Number(e.target.value))}
                                    className="w-full"
                                />
                            </div>
                        )}

                        {activeToolId === "crop" && (
                             <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-foreground">Ratio d'aspect</Label>
                                    <Select onValueChange={(val) => setAspect(val === "none" ? undefined : Number(val))}>
                                        <SelectTrigger className="bg-card border-border">
                                            <SelectValue placeholder="Libre" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">Libre</SelectItem>
                                            <SelectItem value="1">1:1 (Carré)</SelectItem>
                                            <SelectItem value="1.7777777777777777">16:9 (Écran large)</SelectItem>
                                            <SelectItem value="0.75">3:4</SelectItem>
                                            <SelectItem value="0.6666666666666666">2:3</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-foreground">Zoom Prévisualisation</Label>
                                    <Slider
                                        min={0.5}
                                        max={2}
                                        step={0.1}
                                        value={scale}
                                        onChange={(e) => setScale(Number(e.target.value))}
                                        className="w-full"
                                    />
                                </div>
                             </div>
                        )}

                        {activeToolId === "transform" && (
                            <div className="grid grid-cols-2 gap-3">
                                <ToolButton icon={RotateCw} onClick={onRotateClick} label="Rotation +90°" />
                                <ToolButton icon={FlipHorizontal} onClick={onFlipHorizontalClick} label="Miroir H" />
                                <ToolButton icon={FlipVertical} onClick={onFlipVerticalClick} label="Miroir V" />
                            </div>
                        )}
                     </div>
                     
                     <div className="flex-1" />

                     <Button 
                        size="lg" 
                        onClick={handleProcess} 
                        disabled={!selectedFile || processing}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                        {processing ? "Traitement..." : (activeToolId === "crop" || activeToolId === "transform" ? "Appliquer & Télécharger" : "Lancer le traitement")} 
                        {!processing && <ArrowRight size={18} className="ml-2" />}
                    </Button>
                 </div>
             </div>
             
             {/* Hidden canvas for processing */}
             <canvas
                ref={previewCanvasRef}
                style={{
                  display: "none", 
                }}
              />
         </div>
       )}
    </div>
  );
}

// Updated canvasPreview to handle flips
async function canvasPreview(
  image: HTMLImageElement,
  canvas: HTMLCanvasElement,
  crop: PixelCrop,
  scale = 1,
  rotate = 0,
  scaleX = 1,
  scaleY = 1,
) {
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  const naturalScaleX = image.naturalWidth / image.width;
  const naturalScaleY = image.naturalHeight / image.height;
  const pixelRatio = window.devicePixelRatio;

  canvas.width = Math.floor(crop.width * naturalScaleX * pixelRatio);
  canvas.height = Math.floor(crop.height * naturalScaleY * pixelRatio);

  ctx.scale(pixelRatio, pixelRatio);
  ctx.imageSmoothingQuality = 'high';

  const cropX = crop.x * naturalScaleX;
  const cropY = crop.y * naturalScaleY;

  const rotateRads = rotate * Math.PI / 180;
  const centerX = image.naturalWidth / 2;
  const centerY = image.naturalHeight / 2;

  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(rotateRads);
  ctx.scale(scaleX, scaleY); // Apply flip
  ctx.translate(-centerX, -centerY);
  
  ctx.drawImage(
    image,
    cropX,
    cropY,
    crop.width * naturalScaleX,
    crop.height * naturalScaleY,
    0,
    0,
    crop.width * naturalScaleX,
    crop.height * naturalScaleY,
  );

  ctx.restore();
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  )
}