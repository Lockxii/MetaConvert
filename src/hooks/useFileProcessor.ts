"use client";

import { useState } from "react";
import { toast } from "sonner";

interface UseFileProcessorProps {
  apiEndpoint: string;
  onSuccess?: (blob: Blob, fileName: string) => void;
  onError?: (error: string) => void;
}

export function useFileProcessor({ apiEndpoint, onSuccess, onError }: UseFileProcessorProps) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const processFile = async (file: File, params: Record<string, string | number>) => {
    setLoading(true);
    setProgress(0);
    const toastId = toast.loading("Traitement en cours...");

    const formData = new FormData();
    formData.append("file", file);
    
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, String(value));
    });

    try {
      // Simulate progress for better UX since fetch doesn't support upload progress natively easily
      const progressInterval = setInterval(() => {
         setProgress((prev) => {
             if (prev >= 90) return prev;
             return prev + 10;
         });
      }, 500);

      const res = await fetch(apiEndpoint, {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      if (!res.ok) {
         const errorData = await res.json();
         throw new Error(errorData.error || "Erreur lors du traitement");
      }

      setProgress(100);
      const blob = await res.blob();
      
      // Get filename from header or fallback
      const contentDisposition = res.headers.get("Content-Disposition");
      let fileName = "result";
      if (contentDisposition) {
         const match = contentDisposition.match(/filename="?([^"]+)"?/);
         if (match && match[1]) fileName = match[1];
      }

      // Auto download
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Fichier traité avec succès !", { id: toastId });
      
      if (onSuccess) onSuccess(blob, fileName);

    } catch (error: any) {
      console.error(error);
      toast.error(error.message, { id: toastId });
      if (onError) onError(error.message);
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  return { processFile, loading, progress };
}
