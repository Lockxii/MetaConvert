"use client";

import { useState, useMemo } from "react";
import { 
    FileText, 
    Download, 
    Eye, 
    Trash2, 
    Clock, 
    User as UserIcon,
    Search,
    Shield,
    CheckCircle2,
    XCircle,
    Send,
    FolderUp,
    Activity,
    BarChart3,
    TrendingUp,
    X,
    Bell,
    Megaphone,
    Mail,
    Info,
    AlertTriangle,
    CheckCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';

interface AdminClientProps {
    initialData: {
        conversions: any[];
        transfers: any[];
        drops: any[];
        chart: any[];
        users: any[];
    };
}

export default function AdminClient({ initialData }: AdminClientProps) {
    const [data, setData] = useState(initialData);
    const [previewFile, setPreviewFile] = useState<any>(null);
    const [searchTerm, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("conversions");

    // Selection State
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isBatchDialogOpen, setIsBatchDeletingOpen] = useState(false);

    // Notification State
    const [notifTitle, setNotifTitle] = useState("");
    const [notifMessage, setNotifMessage] = useState("");
    const [notifType, setNotifType] = useState("info");
    const [notifLink, setNotifLink] = useState("");
    const [sendingNotif, setSendingNotif] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

    const handleDownload = (filePath: string, fileName: string) => {
        if (!filePath) return toast.error("Chemin introuvable");
        let url = filePath;
        if (filePath.startsWith('db://')) {
            const id = filePath.replace('db://', '');
            url = `/api/download/${id}?download=true`;
        }
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handlePreview = (file: any) => {
        let url = file.filePath;
        if (url?.startsWith('db://')) {
            const id = url.replace('db://', '');
            url = `/api/download/${id}`;
        }
        setPreviewFile({ ...file, url });
    };

    const handleDelete = async (ids: any[], type: 'conversion' | 'transfer') => {
        setIsDeleting(true);
        const toastId = toast.loading("Suppression en cours...");
        try {
            const res = await fetch("/api/admin/delete", {
                method: "DELETE",
                body: JSON.stringify({ ids, type }),
                headers: { "Content-Type": "application/json" }
            });
            if (res.ok) {
                toast.success(`${ids.length} élément(s) supprimé(s)`, { id: toastId });
                if (type === 'conversion') {
                    setData(prev => ({ ...prev, conversions: prev.conversions.filter(c => !ids.includes(c.id)) }));
                } else {
                    setData(prev => ({ ...prev, transfers: prev.transfers.filter(t => !ids.includes(t.id)) }));
                }
                setSelectedIds([]);
                setIsBatchDeletingOpen(false);
            } else {
                toast.error("Erreur lors de la suppression", { id: toastId });
            }
        } catch (e) {
            toast.error("Erreur réseau", { id: toastId });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleSendNotification = async (sendToAll: boolean = false) => {
        if (!notifTitle || !notifMessage) return toast.error("Titre et message requis");
        if (!sendToAll && selectedUsers.length === 0) return toast.error("Sélectionnez au moins un utilisateur");

        setSendingNotif(true);
        const toastId = toast.loading("Envoi des notifications...");

        try {
            const res = await fetch("/api/admin/notifications/send", {
                method: "POST",
                body: JSON.stringify({
                    userIds: selectedUsers,
                    title: notifTitle,
                    message: notifMessage,
                    type: notifType,
                    link: notifLink,
                    sendToAll
                }),
                headers: { "Content-Type": "application/json" }
            });

            if (res.ok) {
                toast.success("Notifications envoyées avec succès !", { id: toastId });
                setNotifTitle("");
                setNotifMessage("");
                setNotifLink("");
                setSelectedUsers([]);
            } else {
                toast.error("Erreur lors de l'envoi", { id: toastId });
            }
        } catch (e) {
            toast.error("Erreur réseau", { id: toastId });
        } finally {
            setSendingNotif(false);
        }
    };

    // Filtering logic
    const filteredConversions = useMemo(() => {
        return data.conversions.filter(c => 
            c.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.userName || "").toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, data.conversions]);

    const filteredTransfers = useMemo(() => {
        return data.transfers.filter(t => 
            t.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (t.userName || "").toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, data.transfers]);

    const filteredUsers = useMemo(() => {
        return data.users.filter(u => 
            u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, data.users]);

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const toggleSelectAll = (items: any[]) => {
        if (selectedIds.length === items.length) setSelectedIds([]);
        else setSelectedIds(items.map(i => i.id.toString()));
    };

    const toggleUserSelect = (id: string) => {
        setSelectedUsers(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    return (
        <div className="space-y-8 relative">
            {/* --- CHARTS SECTION --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 rounded-[2rem] border-border bg-card shadow-sm p-6">
                    <CardHeader className="px-0 pt-0">
                        <CardTitle className="text-lg font-black uppercase tracking-widest flex items-center gap-2 text-foreground">
                            <BarChart3 size={18} className="text-primary" /> Volume de Conversions
                        </CardTitle>
                    </CardHeader>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.chart}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.1} />
                                <XAxis 
                                    dataKey="date" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}}
                                    tickFormatter={(str) => new Date(str).toLocaleDateString('fr-FR', { weekday: 'short' })}
                                />
                                <YAxis hide />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', backgroundColor: '#1e293b', color: '#fff' }}
                                    labelStyle={{ fontWeight: 'bold', color: '#fff' }}
                                />
                                <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card className="rounded-[2rem] border-border bg-card shadow-sm p-6 flex flex-col justify-center text-center space-y-4">
                    <div className="w-16 h-16 bg-emerald-500/10 rounded-3xl flex items-center justify-center text-emerald-500 mx-auto shadow-inner">
                        <TrendingUp size={32} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h3 className="text-3xl font-[1000] tracking-tighter text-foreground">Croissance</h3>
                        <p className="text-sm text-muted-foreground font-medium italic">Service opérationnel.</p>
                    </div>
                    <div className="pt-4 grid grid-cols-2 gap-4">
                        <div className="p-4 bg-muted/50 rounded-2xl border border-border">
                            <p className="text-[10px] font-black text-slate-400 uppercase">Aujourd'hui</p>
                            <p className="text-xl font-black text-foreground">{initialData.conversions.filter(c => new Date(c.createdAt).toDateString() === new Date().toDateString()).length}</p>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-2xl border border-border">
                            <p className="text-[10px] font-black text-slate-400 uppercase">Total</p>
                            <p className="text-xl font-black text-primary">{initialData.conversions.length}</p>
                        </div>
                    </div>
                </Card>
            </div>

            <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setSelectedIds([]); }} className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <TabsList className="bg-muted p-1 rounded-xl border border-border w-fit">
                        <TabsTrigger value="conversions" className="rounded-lg font-bold uppercase text-[10px] tracking-widest gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm px-4">
                            <Activity size={14} /> Activité
                        </TabsTrigger>
                        <TabsTrigger value="transfers" className="rounded-lg font-bold uppercase text-[10px] tracking-widest gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm px-4">
                            <Send size={14} /> Transferts
                        </TabsTrigger>
                        <TabsTrigger value="notifications" className="rounded-lg font-bold uppercase text-[10px] tracking-widest gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm px-4">
                            <Bell size={14} /> Notifications
                        </TabsTrigger>
                    </TabsList>

                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                        <Input 
                            placeholder="Rechercher..." 
                            className="pl-10 h-11 rounded-xl bg-card border-border"
                            value={searchTerm}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* --- CONVERSIONS TAB --- */}
                <TabsContent value="conversions">
                    <Card className="rounded-[2rem] border-border bg-card overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted/50 border-b border-border">
                                    <tr>
                                        <th className="px-6 py-4 w-10">
                                            <Checkbox 
                                                checked={selectedIds.length === filteredConversions.length && filteredConversions.length > 0}
                                                onCheckedChange={() => toggleSelectAll(filteredConversions)}
                                            />
                                        </th>
                                        <th className="px-6 py-4 font-black uppercase text-[10px] tracking-[0.2em] text-muted-foreground">Fichier</th>
                                        <th className="px-6 py-4 font-black uppercase text-[10px] tracking-[0.2em] text-muted-foreground">Utilisateur</th>
                                        <th className="px-6 py-4 font-black uppercase text-[10px] tracking-[0.2em] text-muted-foreground">Date</th>
                                        <th className="px-6 py-4 font-black uppercase text-[10px] tracking-[0.2em] text-muted-foreground text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filteredConversions.map((conv) => {
                                        const isSelected = selectedIds.includes(conv.id.toString());
                                        return (
                                            <tr key={conv.id} className={cn("transition-colors group", isSelected ? "bg-primary/5" : "hover:bg-muted/30")}>
                                                <td className="px-6 py-4">
                                                    <Checkbox checked={isSelected} onCheckedChange={() => toggleSelect(conv.id.toString())} />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center text-muted-foreground">
                                                            <FileText size={20} />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="font-bold text-foreground truncate max-w-[200px]">{conv.fileName}</p>
                                                            <p className="text-[10px] font-black uppercase text-primary tracking-widest">{conv.targetType}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <UserIcon size={12} className="text-muted-foreground" />
                                                        <span className="font-medium text-foreground/80">{conv.userName || "Anonyme"}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-muted-foreground font-medium">
                                                    {new Date(conv.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {conv.filePath && (
                                                            <>
                                                                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg" onClick={() => handlePreview(conv)}>
                                                                    <Eye size={16} />
                                                                </Button>
                                                                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg text-destructive" onClick={() => handleDelete([conv.id], 'conversion')}>
                                                                    <Trash2 size={16} />
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </TabsContent>

                {/* --- TRANSFERS TAB --- */}
                <TabsContent value="transfers">
                    <Card className="rounded-[2rem] border-border bg-card overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted/50 border-b border-border">
                                    <tr>
                                        <th className="px-6 py-4 w-10">
                                            <Checkbox 
                                                checked={selectedIds.length === filteredTransfers.length && filteredTransfers.length > 0}
                                                onCheckedChange={() => toggleSelectAll(filteredTransfers)}
                                            />
                                        </th>
                                        <th className="px-6 py-4 font-black uppercase text-[10px] tracking-[0.2em] text-muted-foreground">Transfert</th>
                                        <th className="px-6 py-4 font-black uppercase text-[10px] tracking-[0.2em] text-muted-foreground">Expéditeur</th>
                                        <th className="px-6 py-4 font-black uppercase text-[10px] tracking-[0.2em] text-muted-foreground text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filteredTransfers.map((link) => {
                                        const isSelected = selectedIds.includes(link.id.toString());
                                        return (
                                            <tr key={link.id} className={cn("transition-colors group", isSelected ? "bg-primary/5" : "hover:bg-muted/30")}>
                                                <td className="px-6 py-4">
                                                    <Checkbox checked={isSelected} onCheckedChange={() => toggleSelect(link.id.toString())} />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-500">
                                                            <Send size={20} />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="font-bold text-foreground truncate max-w-[200px]">{link.fileName}</p>
                                                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{link.downloadCount} DL • Expire le {new Date(link.expiresAt).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="font-medium text-foreground/80">{link.userName || "Anonyme"}</span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg" onClick={() => handlePreview(link)}>
                                                            <Eye size={16} />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg text-destructive" onClick={() => handleDelete([link.id], 'transfer')}>
                                                            <Trash2 size={16} />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </TabsContent>

                {/* --- NOTIFICATIONS TAB --- */}
                <TabsContent value="notifications">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Send Form */}
                        <div className="lg:col-span-5">
                            <Card className="rounded-[2.5rem] border-border bg-card p-8 space-y-6 shadow-sm">
                                <div className="space-y-2">
                                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4">
                                        <Megaphone size={24} strokeWidth={2.5} />
                                    </div>
                                    <h3 className="text-2xl font-[1000] tracking-tight text-foreground">Envoyer un message</h3>
                                    <p className="text-sm text-muted-foreground font-medium italic">Communiquez avec vos membres.</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Titre de la notif</label>
                                        <Input 
                                            placeholder="Ex: Mise à jour système" 
                                            value={notifTitle}
                                            onChange={(e) => setNotifTitle(e.target.value)}
                                            className="h-12 rounded-xl bg-muted/30 border-border font-bold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Message</label>
                                        <Textarea 
                                            placeholder="Votre contenu..." 
                                            value={notifMessage}
                                            onChange={(e) => setNotifMessage(e.target.value)}
                                            className="min-h-[120px] rounded-xl bg-muted/30 border-border font-medium leading-relaxed"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Type</label>
                                            <Select value={notifType} onValueChange={setNotifType}>
                                                <SelectTrigger className="h-12 rounded-xl bg-muted/30 border-border">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl border-border">
                                                    <SelectItem value="info">Information</SelectItem>
                                                    <SelectItem value="success">Succès</SelectItem>
                                                    <SelectItem value="warning">Alerte</SelectItem>
                                                    <SelectItem value="error">Erreur</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Lien (Optionnel)</label>
                                            <Input 
                                                placeholder="https://..." 
                                                value={notifLink}
                                                onChange={(e) => setNotifLink(e.target.value)}
                                                className="h-12 rounded-xl bg-muted/30 border-border font-medium"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4 flex flex-col gap-3">
                                        <Button 
                                            className="h-14 rounded-2xl font-black text-sm uppercase tracking-widest gap-2 shadow-xl shadow-primary/20"
                                            onClick={() => handleSendNotification(false)}
                                            disabled={sendingNotif || selectedUsers.length === 0}
                                        >
                                            {sendingNotif ? <Loader2 className="animate-spin" /> : <Mail size={18} />}
                                            Envoyer aux {selectedUsers.length} sélectionnés
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            className="h-14 rounded-2xl font-black text-sm uppercase tracking-widest gap-2 border-primary/20 text-primary hover:bg-primary/5"
                                            onClick={() => handleSendNotification(true)}
                                            disabled={sendingNotif}
                                        >
                                            <Megaphone size={18} />
                                            Diffuser à TOUT LE MONDE
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* User Selection List */}
                        <div className="lg:col-span-7">
                            <Card className="rounded-[2.5rem] border-border bg-card overflow-hidden shadow-sm h-full flex flex-col">
                                <CardHeader className="bg-muted/30 border-b border-border py-6">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-xl font-black tracking-tight text-foreground">Destinataires</CardTitle>
                                        <span className="bg-primary/10 text-primary text-[10px] font-black px-3 py-1 rounded-full border border-primary/20">
                                            {initialData.users.length} MEMBRES
                                        </span>
                                    </div>
                                </CardHeader>
                                <div className="flex-1 overflow-y-auto no-scrollbar max-h-[600px]">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-muted/10 border-b border-border sticky top-0 z-10 backdrop-blur-md">
                                            <tr>
                                                <th className="px-6 py-4 w-10">
                                                    <Checkbox 
                                                        checked={selectedUsers.length === initialData.users.length && initialData.users.length > 0}
                                                        onCheckedChange={() => {
                                                            if (selectedUsers.length === initialData.users.length) setSelectedUsers([]);
                                                            else setSelectedUsers(initialData.users.map(u => u.id));
                                                        }}
                                                    />
                                                </th>
                                                <th className="px-6 py-4 font-black uppercase text-[10px] tracking-widest text-slate-400">Utilisateur</th>
                                                <th className="px-6 py-4 font-black uppercase text-[10px] tracking-widest text-slate-400">Date Inscription</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {filteredUsers.map((user) => (
                                                <tr key={user.id} className={cn("transition-colors", selectedUsers.includes(user.id) ? "bg-primary/5" : "hover:bg-muted/20")}>
                                                    <td className="px-6 py-4">
                                                        <Checkbox checked={selectedUsers.includes(user.id)} onCheckedChange={() => toggleUserSelect(user.id)} />
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden relative border border-border">
                                                                {user.image ? <Image src={user.image} alt={user.name} fill className="object-cover" /> : <UserIcon className="p-2 text-slate-400" />}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="font-bold text-foreground truncate">{user.name}</p>
                                                                <p className="text-[10px] text-muted-foreground font-medium">{user.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-400 text-xs font-bold uppercase">
                                                        {new Date(user.createdAt).toLocaleDateString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Selection Bar Admin */}
            {selectedIds.length > 0 && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-2xl animate-in slide-in-from-bottom-10 duration-500 ease-out">
                    <div className="bg-slate-950 dark:bg-card border border-white/10 dark:border-border text-white dark:text-foreground px-6 py-4 rounded-3xl shadow-2xl flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-primary rounded-2xl flex items-center justify-center font-black text-primary-foreground shadow-lg shadow-primary/20">
                                {selectedIds.length}
                            </div>
                            <div>
                                <p className="text-sm font-bold">Éléments sélectionnés</p>
                                <p className="text-[10px] font-black uppercase text-slate-500">Actions Super-Admin</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button 
                                variant="destructive" 
                                size="sm" 
                                className="rounded-xl gap-2 font-black h-10 px-6 bg-red-500 text-white border-none" 
                                onClick={() => setIsBatchDeletingOpen(true)}
                            >
                                <Trash2 size={16} /> Supprimer tout
                            </Button>
                            <Button variant="ghost" size="icon" className="rounded-xl text-white/40 hover:text-white" onClick={() => setSelectedIds([])}>
                                <X size={20} />
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Preview Dialog */}
            <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
                <DialogContent className="max-w-4xl rounded-[2.5rem] p-0 overflow-hidden border-border bg-card shadow-2xl">
                    <DialogHeader className="p-8 border-b border-border bg-card">
                        <DialogTitle className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center">
                                <FileText size={24} className="text-muted-foreground" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-xl font-[1000] tracking-tight truncate max-w-md text-foreground">{previewFile?.fileName}</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Aperçu Admin</p>
                            </div>
                        </DialogTitle>
                    </DialogHeader>
                    <div className="p-10 bg-muted/30 flex items-center justify-center min-h-[400px]">
                        {previewFile?.url && (
                            <div className="w-full flex justify-center">
                                {previewFile.fileName.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i) ? (
                                    <img src={previewFile.url} className="max-w-full max-h-[60vh] rounded-2xl shadow-xl border border-border" alt="Preview" />
                                ) : previewFile.fileName.match(/\.(mp4|webm|mov)$/i) ? (
                                    <video src={previewFile.url} controls className="max-w-full max-h-[60vh] rounded-2xl shadow-xl" />
                                ) : (
                                    <div className="text-center space-y-6">
                                        <div className="w-20 h-20 bg-background rounded-3xl flex items-center justify-center mx-auto shadow-sm border border-border">
                                            <FileText size={40} className="text-muted-foreground/30" />
                                        </div>
                                        <p className="text-muted-foreground font-medium">Aperçu non disponible pour ce type de fichier.</p>
                                        <Button onClick={() => handleDownload(previewFile.filePath, previewFile.fileName)} className="rounded-xl font-black gap-2">
                                            <Download size={18} /> Télécharger pour voir
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={isBatchDialogOpen} onOpenChange={setIsBatchDeletingOpen}>
                <DialogContent className="max-w-md rounded-[2.5rem] bg-card border-border">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black text-destructive">Suppression massive</DialogTitle>
                        <DialogDescription className="text-lg">
                            Tu vas supprimer définitivement {selectedIds.length} éléments. Cette action est irréversible.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-6 gap-3">
                        <Button variant="ghost" onClick={() => setIsBatchDeletingOpen(false)} className="rounded-xl font-bold h-12">Annuler</Button>
                        <Button variant="destructive" onClick={() => handleDelete(selectedIds, activeTab === 'conversions' ? 'conversion' : 'transfer')} disabled={isDeleting} className="rounded-xl font-black h-12 px-6">
                            Confirmer la suppression
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}