"use client";

import { AppSidebar } from "@/components/layout/AppSidebar";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { Search, User, LogOut, Loader2, FileCheck, Image as ImageIcon, Sun, Moon, LayoutGrid, Menu, X, Shield } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { navItems } from "@/config/nav";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();
  const { theme, setTheme, resolvedTheme } = useTheme(); 
  const [mounted, setMounted] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const isAdmin = session?.user?.email === "contact.arthur.mouton@gmail.com";

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any>(null);
  const [searching, setSearching] = useState(false);


  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (!isPending && !session) {
      router.push("/sign-in");
    }
  }, [isPending, session, router]);

  // Fetch and apply initial theme from settings
  useEffect(() => {
    async function fetchAndApplyTheme() {
        if (!session?.user?.id) return;
        try {
            const res = await fetch("/api/settings/user");
            if (res.ok) {
                const data = await res.json();
                if (data.theme && data.theme !== "system") {
                    setTheme(data.theme);
                }
            }
        } catch (e) {
            console.error("Failed to fetch user theme:", e);
        }
    }
    if (session?.user?.id && !mounted) {
         fetchAndApplyTheme();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]); 


  const handleSearch = async () => {
    if (!searchQuery) {
        setSearchResults(null);
        return;
    }
    setSearching(true);
    try {
        const res = await fetch(`/api/dashboard/search?query=${searchQuery}`);
        if (res.ok) {
            const data = await res.json();
            setSearchResults(data);
        } else {
            toast.error("Échec de la recherche.");
        }
    } catch (e) {
        console.error("Search error:", e);
        toast.error("Erreur de connexion lors de la recherche.");
    } finally {
        setSearching(false);
    }
  };

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/");
  };

  const toggleTheme = () => {
    const newTheme = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    fetch("/api/settings/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: newTheme }),
    }).catch(e => console.error("Failed to persist theme:", e));
  };

  if (isPending || !session) {
    return (
      <div 
        className="flex min-h-screen items-center justify-center bg-background"
        suppressHydrationWarning
      >
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-background text-foreground font-sans flex"
      suppressHydrationWarning
    >
      <AppSidebar className="hidden md:flex" />

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
            <>
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-40 bg-black/50 md:hidden backdrop-blur-sm"
                    onClick={() => setIsMobileOpen(false)}
                />
                <motion.aside
                    initial={{ x: "-100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "-100%" }}
                    transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                    className="fixed left-0 top-0 bottom-0 z-50 w-72 bg-card border-r border-border flex flex-col md:hidden shadow-2xl"
                >
                    <div className="h-16 flex items-center justify-between px-4 border-b border-border">
                        <Link href="/dashboard" className="flex items-center gap-2">
                            <div className="h-8 w-8">
                                <img src="/logo.svg" alt="Logo" className="w-full h-full" />
                            </div>
                            <span className="font-semibold text-foreground tracking-tight">MetaConvert</span>
                        </Link>
                        <button onClick={() => setIsMobileOpen(false)} className="p-2 text-muted-foreground hover:text-foreground">
                            <X size={20} />
                        </button>
                    </div>
                    <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
                            return (
                                <Link 
                                    key={item.name} 
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium transition-all",
                                        isActive 
                                        ? "bg-primary/10 text-primary" 
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    )}
                                    onClick={() => setIsMobileOpen(false)}
                                >
                                    <item.icon className="h-5 w-5" />
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                        {isAdmin && (
                           <Link 
                              href="/admin"
                              className="flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium transition-all text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/10"
                              onClick={() => setIsMobileOpen(false)}
                            >
                              <Shield className="h-5 w-5" />
                              <span>Administration</span>
                            </Link>
                        )}
                    </div>
                </motion.aside>
            </>
        )}
      </AnimatePresence>
      
      <div className="flex-1 flex flex-col ml-0 md:ml-[250px] transition-all duration-300 min-h-screen">
        {/* Topbar */}
        <header className="h-16 border-b border-border bg-background sticky top-0 z-30 flex items-center justify-between px-4 md:px-6 shadow-sm gap-4">
           {/* Mobile Menu Button */}
           <Button variant="ghost" size="icon" className="md:hidden shrink-0" onClick={() => setIsMobileOpen(true)}>
                <Menu size={20} />
           </Button>

           {/* Global Search */}
           <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
                className="w-full bg-muted/50 border border-input rounded-lg pl-10 pr-4 py-1.5 text-sm focus:border-primary transition-all"
              />
               <AnimatePresence>
                {searchQuery && searchResults && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute left-0 right-0 mt-2 bg-popover border border-border rounded-lg shadow-lg z-40 max-h-60 overflow-y-auto"
                    >
                        {searching && <div className="p-2 text-center text-sm text-muted-foreground">Recherche...</div>}
                        {!searching && (!searchResults.conversions?.length && !searchResults.upscales?.length && !searchResults.tools?.length) && (
                            <div className="p-2 text-center text-sm text-muted-foreground">Aucun résultat trouvé.</div>
                        )}
                        {searchResults.tools?.map((item: any) => (
                            <Link href={item.href} key={item.name} className="flex items-center gap-3 p-2 hover:bg-muted border-b border-border last:border-b-0">
                                <LayoutGrid size={16} className="text-blue-500" />
                                <div className="text-sm">
                                    <p className="font-medium">{item.name}</p>
                                    <p className="text-xs text-muted-foreground">{item.description}</p>
                                </div>
                            </Link>
                        ))}
                        {searchResults.conversions?.map((item: any) => (
                            <Link href={`/dashboard/image`} key={item.id} className="flex items-center gap-3 p-2 hover:bg-muted border-b border-border last:border-b-0">
                                <FileCheck size={16} className="text-primary" />
                                <div className="text-sm">
                                    <p className="font-medium">{item.fileName}</p>
                                    <p className="text-xs text-muted-foreground">Conversion vers {item.targetType}</p>
                                </div>
                            </Link>
                        ))}
                        {searchResults.upscales.map((item: any) => (
                            <Link href={`/dashboard/image`} key={item.id} className="flex items-center gap-3 p-2 hover:bg-muted border-b border-border last:border-b-0">
                                <ImageIcon size={16} className="text-purple-500" />
                                <div className="text-sm">
                                    <p className="font-medium">{item.fileName}</p>
                                    <p className="text-xs text-muted-foreground">Upscale {item.factor}x</p>
                                </div>
                            </Link>
                        ))}
                    </motion.div>
                )}
               </AnimatePresence>
           </div>

           <div className="flex items-center gap-2 md:gap-4 shrink-0">
              <div className="h-6 w-[1px] bg-border hidden md:block" />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <div className="flex items-center gap-3 pl-2 cursor-pointer">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium text-foreground leading-none">{session.user.name}</p>
                            <p className="text-xs text-muted-foreground">{session.user.email}</p>
                        </div>
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <User size={18} />
                        </div>
                    </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-popover border border-border shadow-lg">
                    <DropdownMenuLabel>Mon Compte</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                        <Link href="/dashboard/settings" className="cursor-pointer">Paramètres</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
                        <LogOut className="mr-2 h-4 w-4" /> Déconnexion
                    </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleTheme}
                className="hidden md:flex"
                aria-label="Toggle theme"
              >
                {mounted && (resolvedTheme === "dark" ? <Moon size={20} /> : <Sun size={20} />)}
              </Button>
           </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-6 overflow-x-hidden bg-slate-50 dark:bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
