"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Image as ImageIcon, 
  FileText, 
  Video, 
  Music, 
  Globe, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Cloud,
  Archive,
  Layers,
  FolderUp
} from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

const navItems = [
  { name: "Vue d'ensemble", href: "/dashboard", icon: LayoutDashboard },
  { name: "Mon Cloud", href: "/dashboard/cloud", icon: Cloud },
  { name: "Image", href: "/dashboard/image", icon: ImageIcon },
  { name: "PDF", href: "/dashboard/pdf", icon: FileText },
  { name: "PDF Weaver", href: "/dashboard/pdf-weaver", icon: Layers },
  { name: "Vidéo", href: "/dashboard/video", icon: Video },
  { name: "Audio", href: "/dashboard/audio", icon: Music },
  { name: "Web", href: "/dashboard/web", icon: Globe },
  { name: "Archives", href: "/dashboard/archive", icon: Archive },
  { name: "Demandes", href: "/dashboard/drop", icon: FolderUp },
  { name: "Réglages", href: "/dashboard/settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside 
      initial={{ width: 250 }}
      animate={{ width: collapsed ? 80 : 250 }}
      className="fixed left-0 top-0 bottom-0 z-40 bg-card border-r border-border flex flex-col transition-all duration-300 shadow-sm"
    >
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        {!collapsed && (
            <Link href="/dashboard" className="flex items-center gap-2">
               <div className="h-8 w-8">
                 <img src="/logo.svg" alt="Logo" className="w-full h-full" />
               </div>
               <span className="font-semibold text-foreground tracking-tight">
                 MetaConvert
               </span>
            </Link>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors ml-auto"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto no-scrollbar">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 group relative",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
              
              {!collapsed && (
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  {item.name}
                </motion.span>
              )}
            </Link>
          );
        })}
      </div>
    </motion.aside>
  );
}