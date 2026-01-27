"use client";

import { useState, useCallback, useEffect } from "react";
import { 
    FileText, 
    Upload, 
    Trash2, 
    GripVertical, 
    Download, 
    Loader2, 
    Plus, 
    X, 
    RotateCw,
    Layers,
    FilePlus,
    RefreshCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

// Configuration de PDF.js worker
if (typeof window !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs`;
}

interface PDFPage {
    id: string; // Unique ID for DnD
    pdfId: string; // Source PDF ID
    pageIndex: number; // Original page index
    thumbnail: string; // Data URL
    fileName: string;
}

export default function PDFWeaverPage() {
    const [pages, setPages] = useState<PDFPage[]>([]);
    const [pdfBuffers, setPdfBuffers] = useState<Map<string, ArrayBuffer>>(new Map());
    const [loading, setLoading] = useState(false);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [generating, setGenerating] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const generateThumbnail = async (pdfPage: any) => {
        const viewport = pdfPage.getViewport({ scale: 0.3 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (context) {
            await pdfPage.render({ canvasContext: context, viewport: viewport }).promise;
            return canvas.toDataURL();
        }
        return "";
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        setLoading(true);
        const toastId = toast.loading("Chargement des pages PDF...");

        try {
            for (const file of Array.from(files)) {
                if (file.type !== "application/pdf") continue;

                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                
                const newPages: PDFPage[] = [];
                const pdfId = Math.random().toString(36).substr(2, 9);

                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const thumbnail = await generateThumbnail(page);
                    
                    newPages.push({
                        id: `${pdfId}-${i}-${Math.random().toString(36).substr(2, 4)}`,
                        pdfId: pdfId,
                        pageIndex: i - 1,
                        thumbnail: thumbnail,
                        fileName: file.name
                    });
                }

                // We need the original bytes later for merging, but for now we store the info
                // In a real app, we'd store the PDF bytes in a Map or similar
                // For simplicity, we'll store the source bytes in a global-ish map if needed, 
                // but let's re-read files on generate or store them in a state.
                
                // Save file bytes for later merge
                setPdfBuffers(prev => {
                    const next = new Map(prev);
                    next.set(pdfId, arrayBuffer);
                    return next;
                });

                setPages(prev => [...prev, ...newPages]);
            }
            toast.success("PDF ajouté au Weaver", { id: toastId });
        } catch (e) {
            console.error(e);
            toast.error("Erreur lors de la lecture du PDF", { id: toastId });
        } finally {
            setLoading(false);
            if (event.target) event.target.value = "";
        }
    };

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (over && active.id !== over.id) {
            setPages((items) => {
                const oldIndex = items.findIndex(i => i.id === active.id);
                const newIndex = items.findIndex(i => i.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const removePage = (id: string) => {
        setPages(prev => prev.filter(p => p.id !== id));
    };

    const handleGenerate = async () => {
        if (pages.length === 0) return;
        
        setGenerating(true);
        const toastId = toast.loading("Tissage du nouveau PDF...");

        try {
            const mergedPdf = await PDFDocument.create();
            const pdfCache = new Map();

            for (const pageInfo of pages) {
                // Get or load the source PDF
                let sourcePdfDoc = pdfCache.get(pageInfo.pdfId);
                if (!sourcePdfDoc) {
                    const bytes = pdfBuffers.get(pageInfo.pdfId);
                    if (!bytes) throw new Error("Source PDF bytes missing");
                    sourcePdfDoc = await PDFDocument.load(bytes);
                    pdfCache.set(pageInfo.pdfId, sourcePdfDoc);
                }

                const [copiedPage] = await mergedPdf.copyPages(sourcePdfDoc, [pageInfo.pageIndex]);
                mergedPdf.addPage(copiedPage);
            }

            const mergedPdfBytes = await mergedPdf.save();
            const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            const finalFileName = `weaved_document_${Date.now()}.pdf`;
            a.download = finalFileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            // Also save to Cloud
            const formData = new FormData();
            const fileToSave = new File([blob], finalFileName, { type: "application/pdf" });
            formData.append("file", fileToSave);
            formData.append("tool", "pdf-weaver");
            await fetch("/api/dashboard/cloud/save", { method: "POST", body: formData });

            toast.success("Nouveau PDF généré et sauvegardé !", { id: toastId });
        } catch (e) {
            console.error(e);
            toast.error("Erreur lors de la génération", { id: toastId });
        } finally {
            setGenerating(false);
        }
    };

    const activePage = pages.find(p => p.id === activeId);

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-xl text-primary">
                            <Layers size={28} strokeWidth={2.5} />
                        </div>
                        PDF Weaver
                    </h1>
                    <p className="text-muted-foreground mt-1">Réorganisez, fusionnez et divisez vos PDF visuellement.</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={() => setPages([])} disabled={pages.length === 0} className="rounded-xl border-border bg-card font-bold gap-2">
                        <RefreshCcw size={16} /> Réinitialiser
                    </Button>
                    
                    <label className="cursor-pointer">
                        <div className="bg-primary hover:bg-primary/90 text-primary-foreground h-11 px-6 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95 font-bold flex items-center gap-2">
                            <FilePlus size={20} strokeWidth={3} />
                            Ajouter des PDF
                        </div>
                        <input type="file" className="hidden" accept=".pdf" multiple onChange={handleFileUpload} />
                    </label>

                    <Button 
                        onClick={handleGenerate} 
                        disabled={pages.length === 0 || generating} 
                        className="rounded-xl h-11 px-6 font-bold gap-2 shadow-lg bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                        {generating ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
                        Générer PDF
                    </Button>
                </div>
            </div>

            {pages.length === 0 ? (
                <div className="min-h-[400px] border-2 border-dashed border-border rounded-[3rem] bg-muted/20 flex flex-col items-center justify-center p-12 text-center animate-in fade-in zoom-in duration-500">
                    <div className="w-20 h-20 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mb-6">
                        <Upload size={40} strokeWidth={2.5} />
                    </div>
                    <h2 className="text-2xl font-black mb-2">Prêt à tisser ?</h2>
                    <p className="text-muted-foreground max-w-md mx-auto mb-8">
                        Déposez vos fichiers PDF ici pour voir toutes leurs pages et les réorganiser par simple glisser-déposer.
                    </p>
                    <label className="cursor-pointer">
                        <div className="bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                            Sélectionner vos PDF
                        </div>
                        <input type="file" className="hidden" accept=".pdf" multiple onChange={handleFileUpload} />
                    </label>
                </div>
            ) : (
                <DndContext 
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6 animate-in fade-in duration-500">
                        <SortableContext 
                            items={pages.map(p => p.id)}
                            strategy={rectSortingStrategy}
                        >
                            {pages.map((page, index) => (
                                <SortablePage key={page.id} page={page} index={index} onRemove={removePage} />
                            ))}
                        </SortableContext>
                    </div>

                    <DragOverlay dropAnimation={{
                        sideEffects: defaultDropAnimationSideEffects({
                            styles: {
                                active: {
                                    opacity: '0.5',
                                },
                            },
                        }),
                    }}>
                        {activeId ? (
                            <div className="w-32 h-44 bg-white dark:bg-card border-2 border-primary rounded-xl shadow-2xl overflow-hidden scale-105 opacity-90 cursor-grabbing">
                                <img src={pages.find(p => p.id === activeId)?.thumbnail} className="w-full h-full object-cover" alt="dragging" />
                            </div>
                        ) : null}
                    </DragOverlay>
                </DndContext>
            )}
        </div>
    );
}

function SortablePage({ page, index, onRemove }: { page: PDFPage, index: number, onRemove: (id: string) => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: page.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
    };

    return (
        <div 
            ref={setNodeRef} 
            style={style} 
            className="group relative flex flex-col gap-2 animate-in zoom-in duration-300"
        >
            {/* Page Badge */}
            <div className="absolute -top-2 -left-2 z-20 h-6 w-6 bg-slate-900 text-white rounded-lg flex items-center justify-center text-[10px] font-black shadow-lg border border-white/10">
                {index + 1}
            </div>

            {/* Remove Button */}
            <button 
                onClick={(e) => { e.stopPropagation(); onRemove(page.id); }}
                className="absolute -top-2 -right-2 z-20 h-6 w-6 bg-red-500 text-white rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
            >
                <X size={14} strokeWidth={3} />
            </button>

            <div 
                {...attributes} 
                {...listeners}
                className={cn(
                    "aspect-[3/4] bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-xl hover:border-primary/50 transition-all cursor-grab active:cursor-grabbing relative",
                    isDragging ? "ring-2 ring-primary border-primary" : ""
                )}
            >
                <img src={page.thumbnail} alt={`Page ${index + 1}`} className="w-full h-full object-cover pointer-events-none" />
                
                {/* Drag Handle Overlay */}
                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="bg-white/90 dark:bg-card/90 p-1.5 rounded-lg shadow-sm text-primary">
                        <GripVertical size={16} />
                    </div>
                </div>
            </div>

            <div className="px-1">
                <p className="text-[10px] font-bold text-muted-foreground truncate uppercase tracking-tighter" title={page.fileName}>
                    {page.fileName}
                </p>
            </div>
        </div>
    );
}
