import { 
  LayoutDashboard, 
  Image as ImageIcon, 
  FileText, 
  Video, 
  Music, 
  Globe, 
  Settings, 
  Cloud,
  Archive,
  Layers,
  FolderUp
} from "lucide-react";

export const navItems = [
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
