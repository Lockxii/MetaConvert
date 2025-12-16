"use client";

import { cn } from "@/lib/utils";
import React from "react";

interface ToolButtonProps {
    icon: React.ElementType; // Lucide icon component
    label: string;
    active?: boolean;
    onClick: () => void;
}

export function ToolButton({ icon: Icon, label, active = false, onClick }: ToolButtonProps) {
   // Add a defensive check for the Icon prop
   if (!Icon) {
     console.error(`ToolButton: Icon component for label "${label}" is undefined.`);
     return null; 
   }
   return (
      <button 
         onClick={onClick}
         className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all w-full text-left",
            active 
               ? "bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20" 
               : "text-muted-foreground hover:bg-muted hover:text-foreground"
         )}
      >
         <Icon size={18} className={active ? "text-primary" : "text-muted-foreground"} />
         {label}
      </button>
   )
}
