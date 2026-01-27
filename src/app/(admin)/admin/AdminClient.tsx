"use client";

import { useState, useMemo, useEffect } from "react";
import { 
    FileText, Download, Eye, Trash2, Clock, User as UserIcon, Search,
    Shield, CheckCircle2, XCircle, Send, FolderUp, Activity,
    TrendingUp, X, Bell, Megaphone, Mail, Info,
    AlertTriangle, CheckCircle, Loader2, Image as ImageIcon, Plus, ListTodo,
    PieChart, MessageSquare, Users as UsersGroup, ArrowUpRight, BarChart3
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
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, BarChart as ReBarChart, Bar as ReBar, Cell
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

    // Campaign Stats State
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
    const [campaignDetails, setCampaignDetails] = useState<any[]>([]);
    const [loadingDetails, setLoadingDetails] = useState(false);

    // Notification State
    const [notifTitle, setNotifTitle] = useState("");
    const [notifMessage, setNotifMessage] = useState("");
    const [notifType, setNotifType] = useState("info");
    const [notifLink, setNotifLink] = useState("");
    const [notifImage, setNotifImage] = useState("");
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [requiresResponse, setRequiresResponse] = useState(false);
    const [pollOptions, setPollOptions] = useState<string[]>([]);
    const [newOption, setNewOption] = useState("");
    const [sendingNotif, setSendingNotif] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

    const CHART_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

    // Selection State
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isBatchDialogOpen, setIsBatchDeletingOpen] = useState(false);

    useEffect(() => {
        if (activeTab === "notifications") {
            fetchCampaigns();
        }
    }, [activeTab]);

    const fetchCampaigns = async () => {
        const res = await fetch("/api/admin/notifications/stats");
        if (res.ok) {
            const d = await res.json();
            setCampaigns(d.campaigns);
        }
    };

    const viewCampaignDetails = async (campaignId: string) => {
        const campaign = campaigns.find(c => c.campaignId === campaignId);
        setSelectedCampaign(campaign);
        setLoadingDetails(true);
        try {
            const res = await fetch(`/api/admin/notifications/stats?campaignId=${campaignId}`);
            if (res.ok) {
                const d = await res.json();
                setCampaignDetails(d.details);
            }
        } finally {
            setLoadingDetails(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                setNotifImage(base64);
                setImagePreview(base64);
            };
            reader.readAsDataURL(file);
        }
    };

    const pollChartData = useMemo(() => {
        if (!campaignDetails.length) return [];
        const results: Record<string, number> = {};
        campaignDetails.forEach(n => {
            if (n.pollVotes) {
                results[n.pollVotes] = (results[n.pollVotes] || 0) + 1;
            }
        });
        return Object.entries(results).map(([name, value]) => ({ name, value }));
    }, [campaignDetails]);

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
            }
        } finally {
            setIsDeleting(false);
        }
    };

    const addPollOption = () => {
        if (newOption && pollOptions.length < 5) {
            setPollOptions([...pollOptions, newOption]);
            setNewOption("");
        }
    };

    const removePollOption = (index: number) => {
        setPollOptions(pollOptions.filter((_, i) => i !== index));
    };

    const handleSendNotification = async (sendToAll: boolean = false) => {
        if (!notifTitle || !notifMessage) return toast.error("Titre et message requis");
        setSendingNotif(true);
        const toastId = toast.loading("Envoi...");
        try {
            const res = await fetch("/api/admin/notifications/send", {
                method: "POST",
                body: JSON.stringify({
                    userIds: selectedUsers,
                    title: notifTitle,
                    message: notifMessage,
                    type: notifType,
                    link: notifLink,
                    image: notifImage,
                    requiresResponse,
                    pollOptions: pollOptions.length > 0 ? pollOptions : null,
                    sendToAll
                }),
                headers: { "Content-Type": "application/json" }
            });
            if (res.ok) {
                toast.success("Envoyé !", { id: toastId });
                setNotifTitle(""); setNotifMessage(""); setNotifImage(""); setImagePreview(null);
                setPollOptions([]); setRequiresResponse(false); setSelectedUsers([]);
                fetchCampaigns();
            }
        } finally {
            setSendingNotif(false);
        }
    };

    const filteredConversions = useMemo(() => data.conversions.filter(c => c.fileName.toLowerCase().includes(searchTerm.toLowerCase()) || (c.userName || "").toLowerCase().includes(searchTerm.toLowerCase())), [searchTerm, data.conversions]);
    const filteredTransfers = useMemo(() => data.transfers.filter(t => t.fileName.toLowerCase().includes(searchTerm.toLowerCase()) || (t.userName || "").toLowerCase().includes(searchTerm.toLowerCase())), [searchTerm, data.transfers]);
    const filteredUsers = useMemo(() => data.users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase())), [searchTerm, data.users]);

    const toggleSelect = (id: string) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    const toggleSelectAll = (items: any[]) => selectedIds.length === items.length ? setSelectedIds([]) : setSelectedIds(items.map(i => i.id.toString()));
    const toggleUserSelect = (id: string) => setSelectedUsers(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

    return (
        <div className="space-y-8 relative">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 rounded-[2rem] border-border bg-card shadow-sm p-4 sm:p-6">
                    <CardHeader className="px-0 pt-0">
                        <CardTitle className="text-lg font-black uppercase tracking-widest flex items-center gap-2 text-foreground">
                            <BarChart3 size={18} className="text-primary" /> Volume
                        </CardTitle>
                    </CardHeader>
                    <div className="h-[200px] sm:h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.chart}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.1} />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} tickFormatter={(str) => new Date(str).toLocaleDateString('fr-FR', { weekday: 'short' })} />
                                <YAxis hide />
                                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', backgroundColor: '#1e293b', color: '#fff' }} labelStyle={{ fontWeight: 'bold', color: '#fff' }} />
                                <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card className="rounded-[2rem] border-border bg-card shadow-sm p-6 flex flex-col justify-center text-center space-y-4">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-emerald-500/10 rounded-3xl flex items-center justify-center text-emerald-500 mx-auto">
                        <TrendingUp size={32} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h3 className="text-2xl sm:text-3xl font-[1000] tracking-tighter text-foreground uppercase">Live</h3>
                    </div>
                    <div className="pt-2 grid grid-cols-2 gap-3 sm:gap-4">
                        <div className="p-3 sm:p-4 bg-muted/50 rounded-2xl border border-border">
                            <p className="text-[9px] font-black text-slate-400 uppercase">Jour</p>
                            <p className="text-lg sm:text-xl font-black text-foreground">{initialData.conversions.filter(c => new Date(c.createdAt).toDateString() === new Date().toDateString()).length}</p>
                        </div>
                        <div className="p-3 sm:p-4 bg-muted/50 rounded-2xl border border-border">
                            <p className="text-[9px] font-black text-slate-400 uppercase">Total</p>
                            <p className="text-lg sm:text-xl font-black text-primary">{initialData.conversions.length}</p>
                        </div>
                    </div>
                </Card>
            </div>

            <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setSelectedIds([]); }} className="space-y-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <TabsList className="bg-muted p-1 rounded-xl border border-border w-full lg:w-fit overflow-x-auto no-scrollbar justify-start">
                        <TabsTrigger value="conversions" className="rounded-lg font-bold uppercase text-[9px] sm:text-[10px] tracking-widest gap-2 data-[state=active]:bg-background px-3 sm:px-4 shrink-0">
                            <Activity size={14} /> Activité
                        </TabsTrigger>
                        <TabsTrigger value="transfers" className="rounded-lg font-bold uppercase text-[9px] sm:text-[10px] tracking-widest gap-2 data-[state=active]:bg-background px-3 sm:px-4 shrink-0">
                            <Send size={14} /> Transferts
                        </TabsTrigger>
                        <TabsTrigger value="notifications" className="rounded-lg font-bold uppercase text-[9px] sm:text-[10px] tracking-widest gap-2 data-[state=active]:bg-background px-3 sm:px-4 shrink-0">
                            <Bell size={14} /> Notifications
                        </TabsTrigger>
                    </TabsList>

                    <div className="relative w-full lg:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                        <Input placeholder="Rechercher..." className="pl-10 h-11 rounded-xl bg-card border-border" value={searchTerm} onChange={(e) => setSearchQuery(e.target.value)} />
                    </div>
                </div>

                <TabsContent value="conversions" className="space-y-4">
                    {/* Desktop Table */}
                    <Card className="hidden md:block rounded-[2rem] border-border bg-card overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted/50 border-b border-border">
                                    <tr>
                                        <th className="px-6 py-4 w-10"><Checkbox checked={selectedIds.length === filteredConversions.length && filteredConversions.length > 0} onCheckedChange={() => toggleSelectAll(filteredConversions)} /></th>
                                        <th className="px-6 py-4 font-black uppercase text-[10px] tracking-[0.2em] text-muted-foreground">Fichier</th>
                                        <th className="px-6 py-4 font-black uppercase text-[10px] tracking-[0.2em] text-muted-foreground">Utilisateur</th>
                                        <th className="px-6 py-4 font-black uppercase text-[10px] tracking-[0.2em] text-muted-foreground text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filteredConversions.map((conv) => {
                                        const isSelected = selectedIds.includes(conv.id.toString());
                                        return (
                                            <tr key={conv.id} className={cn("transition-colors group", isSelected ? "bg-primary/5" : "hover:bg-muted/30")}>
                                                <td className="px-6 py-4"><Checkbox checked={isSelected} onCheckedChange={() => toggleSelect(conv.id.toString())} /></td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center text-muted-foreground"><FileText size={20} /></div>
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
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {conv.filePath && (
                                                            <>
                                                                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg" onClick={() => handlePreview(conv)}><Eye size={16} /></Button>
                                                                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg text-destructive" onClick={() => handleDelete([conv.id], 'conversion')}><Trash2 size={16} /></Button>
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
                    {/* Mobile Cards */}
                    <div className="grid grid-cols-1 gap-4 md:hidden">
                        {filteredConversions.map((conv) => (
                            <Card key={conv.id} className="rounded-2xl border-border bg-card p-4 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Checkbox checked={selectedIds.includes(conv.id.toString())} onCheckedChange={() => toggleSelect(conv.id.toString())} />
                                        <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center text-muted-foreground"><FileText size={20} /></div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-sm truncate max-w-[150px]">{conv.fileName}</p>
                                            <p className="text-[9px] font-black uppercase text-primary tracking-widest">{conv.targetType}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => handlePreview(conv)}><Eye size={14} /></Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive" onClick={() => handleDelete([conv.id], 'conversion')}><Trash2 size={14} /></Button>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase border-t border-border pt-3">
                                    <div className="flex items-center gap-1.5"><UserIcon size={10} /> {conv.userName || "Anonyme"}</div>
                                    <div>{new Date(conv.createdAt).toLocaleDateString()}</div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="transfers" className="space-y-4">
                    {/* Desktop Table */}
                    <Card className="hidden md:block rounded-[2rem] border-border bg-card overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted/50 border-b border-border">
                                    <tr>
                                        <th className="px-6 py-4 w-10"><Checkbox checked={selectedIds.length === filteredTransfers.length && filteredTransfers.length > 0} onCheckedChange={() => toggleSelectAll(filteredTransfers)} /></th>
                                        <th className="px-6 py-4 font-black uppercase text-[10px] tracking-[0.2em] text-muted-foreground">Transfert</th>
                                        <th className="px-6 py-4 font-black uppercase text-[10px] tracking-[0.2em] text-muted-foreground text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filteredTransfers.map((link) => {
                                        const isSelected = selectedIds.includes(link.id.toString());
                                        return (
                                            <tr key={link.id} className={cn("transition-colors group", isSelected ? "bg-primary/5" : "hover:bg-muted/30")}>
                                                <td className="px-6 py-4"><Checkbox checked={isSelected} onCheckedChange={() => toggleSelect(link.id.toString())} /></td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-600"><Send size={20} /></div>
                                                        <div className="min-w-0">
                                                            <p className="font-bold text-foreground truncate max-w-[200px]">{link.fileName}</p>
                                                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{link.downloadCount} DL • Expire le {new Date(link.expiresAt).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg" onClick={() => handlePreview(link)}><Eye size={16} /></Button>
                                                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg text-destructive" onClick={() => handleDelete([link.id], 'transfer')}><Trash2 size={16} /></Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                    {/* Mobile Cards */}
                    <div className="grid grid-cols-1 gap-4 md:hidden">
                        {filteredTransfers.map((link) => (
                            <Card key={link.id} className="rounded-2xl border-border bg-card p-4 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Checkbox checked={selectedIds.includes(link.id.toString())} onCheckedChange={() => toggleSelect(link.id.toString())} />
                                        <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-600"><Send size={20} /></div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-sm truncate max-w-[150px]">{link.fileName}</p>
                                            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">{link.downloadCount} DL</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => handlePreview(link)}><Eye size={14} /></Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive" onClick={() => handleDelete([link.id], 'transfer')}><Trash2 size={14} /></Button>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase border-t border-border pt-3">
                                    <div className="flex items-center gap-1.5"><UserIcon size={10} /> {link.userName || "Anonyme"}</div>
                                    <div>Expire le {new Date(link.expiresAt).toLocaleDateString()}</div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="notifications">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-12 xl:col-span-5 space-y-6">
                            <Card className="rounded-[2.5rem] border-border bg-card p-6 sm:p-8 space-y-6 shadow-sm">
                                <div className="space-y-2">
                                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4"><Megaphone size={24} strokeWidth={2.5} /></div>
                                    <h3 className="text-2xl font-[1000] tracking-tight text-foreground uppercase">Communication</h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <Input placeholder="Titre" value={notifTitle} onChange={(e) => setNotifTitle(e.target.value)} className="h-12 rounded-xl bg-muted/30" />
                                        <Select value={notifType} onValueChange={setNotifType}>
                                            <SelectTrigger className="h-12 rounded-xl bg-muted/30"><SelectValue /></SelectTrigger>
                                            <SelectContent><SelectItem value="info">Info</SelectItem><SelectItem value="success">Succès</SelectItem><SelectItem value="warning">Attention</SelectItem><SelectItem value="error">Erreur</SelectItem></SelectContent>
                                        </Select>
                                    </div>
                                    <Textarea placeholder="Message..." value={notifMessage} onChange={(e) => setNotifMessage(e.target.value)} className="min-h-[100px] rounded-xl bg-muted/30" />
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-1.5 cursor-pointer">
                                                <ImageIcon size={10} /> Image (PC)
                                                <input type="file" accept="image/*" className="hidden" id="notif-img-upload" onChange={handleImageUpload} />
                                            </label>
                                            <div 
                                                className="h-12 rounded-xl bg-muted/30 border border-border flex items-center justify-center cursor-pointer hover:bg-muted/50 overflow-hidden group"
                                                onClick={() => (document.getElementById('notif-img-upload') as any)?.click()}
                                            >
                                                {imagePreview ? (
                                                    <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                                                ) : (
                                                    <Plus size={16} className="text-slate-500 group-hover:scale-110 transition-transform" />
                                                )}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-1.5"><Send size={10} /> Lien Action</label>
                                            <Input placeholder="/dashboard/..." value={notifLink} onChange={(e) => setNotifLink(e.target.value)} className="h-12 rounded-xl bg-muted/30 text-xs" />
                                        </div>
                                    </div>
                                    <div className="p-4 bg-muted/20 rounded-2xl border border-border space-y-4">
                                        <div className="flex items-center justify-between"><span className="text-[10px] font-black uppercase">Réponse requise</span><Checkbox checked={requiresResponse} onCheckedChange={(v) => setRequiresResponse(!!v)} /></div>
                                        <div className="space-y-2">
                                            <div className="flex gap-2">
                                                <Input placeholder="Option..." value={newOption} onChange={(e) => setNewOption(e.target.value)} className="h-10 text-xs rounded-lg bg-background" onKeyDown={(e) => e.key === 'Enter' && addPollOption()} />
                                                <Button size="icon" className="h-10 w-10 shrink-0" onClick={addPollOption}><Plus size={16} /></Button>
                                            </div>
                                            <div className="flex flex-wrap gap-2">{pollOptions.map((opt, i) => <span key={i} className="px-2 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-bold flex gap-1">{opt}<X size={10} className="cursor-pointer" onClick={() => removePollOption(i)} /></span>)}</div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        <Button className="w-full h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest gap-2 shadow-xl" onClick={() => handleSendNotification(false)} disabled={sendingNotif || selectedUsers.length === 0}>{sendingNotif ? <Loader2 className="animate-spin" /> : <Mail size={18} />}Envoyer ({selectedUsers.length})</Button>
                                        <Button variant="outline" className="w-full h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest gap-2 border-primary/20 text-primary hover:bg-primary/5" onClick={() => handleSendNotification(true)} disabled={sendingNotif}><Megaphone size={18} />Diffuser à tous</Button>
                                    </div>
                                </div>
                            </Card>

                            <Card className="rounded-[2.5rem] border-border bg-card p-6 shadow-sm">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2"><Clock size={14} /> Campagnes Récentes</h4>
                                <div className="space-y-3">
                                    {campaigns.map(c => (
                                        <div key={c.campaignId} onClick={() => viewCampaignDetails(c.campaignId)} className="p-4 rounded-2xl border border-border hover:border-primary/50 transition-all cursor-pointer group bg-muted/10">
                                            <div className="flex items-center justify-between">
                                                <p className="font-bold text-xs truncate uppercase tracking-tighter">{c.title}</p>
                                                <ArrowUpRight size={14} className="text-slate-400 group-hover:text-primary transition-colors" />
                                            </div>
                                            <div className="flex items-center gap-3 mt-2 text-[8px] font-black uppercase tracking-widest text-slate-500">
                                                <span>{c.total} Envois</span>
                                                <span className="text-emerald-500">{c.read} Lus</span>
                                                <span className="text-blue-500">{c.responses} Rep.</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>

                        <div className="lg:col-span-12 xl:col-span-7">
                            <Card className="rounded-[2.5rem] border-border bg-card overflow-hidden shadow-sm h-full flex flex-col">
                                <CardHeader className="bg-muted/30 border-b border-border py-6"><CardTitle className="text-xl font-black uppercase tracking-tighter">Membres</CardTitle></CardHeader>
                                <div className="max-h-[400px] sm:max-h-[600px] overflow-y-auto no-scrollbar">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-muted/10 border-b border-border sticky top-0 z-10 backdrop-blur-md">
                                            <tr>
                                                <th className="px-6 py-4 w-10"><Checkbox checked={selectedUsers.length === data.users.length && data.users.length > 0} onCheckedChange={() => selectedUsers.length === data.users.length ? setSelectedUsers([]) : setSelectedUsers(data.users.map(u => u.id))} /></th>
                                                <th className="px-6 py-4 font-black uppercase text-[10px] tracking-widest text-slate-400">Utilisateur</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {filteredUsers.map((user) => (
                                                <tr key={user.id} className={cn("transition-colors", selectedUsers.includes(user.id) ? "bg-primary/5" : "hover:bg-muted/20")}>
                                                    <td className="px-6 py-4"><Checkbox checked={selectedUsers.includes(user.id)} onCheckedChange={() => toggleUserSelect(user.id)} /></td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden relative border border-border shrink-0">{user.image ? <img src={user.image} alt={user.name} className="w-full h-full object-cover" /> : <UserIcon className="p-2 text-slate-400" />}</div>
                                                            <div className="min-w-0"><p className="font-bold text-xs truncate">{user.name}</p><p className="text-[9px] text-muted-foreground truncate">{user.email}</p></div>
                                                        </div>
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

            {/* Campaign Stats Modal */}
            <Dialog open={!!selectedCampaign} onOpenChange={() => setSelectedCampaign(null)}>
                <DialogContent className="max-w-5xl rounded-[2.5rem] p-0 overflow-hidden border-border bg-card shadow-2xl mx-auto w-[95%] sm:w-full">
                    <div className="p-6 sm:p-8 border-b border-border bg-muted/20">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                            <div className="space-y-1">
                                <h2 className="text-xl sm:text-2xl font-[1000] tracking-tighter uppercase">{selectedCampaign?.title}</h2>
                                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Analyse</p>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto no-scrollbar pb-2 sm:pb-0">
                                <StatCircle label="Total" value={selectedCampaign?.total} color="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400" />
                                <StatCircle label="Lus" value={selectedCampaign?.read} color="bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600" />
                                <StatCircle label="Rep." value={selectedCampaign?.responses} color="bg-blue-100 dark:bg-blue-500/10 text-blue-600" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 bg-background max-h-[70vh] overflow-y-auto no-scrollbar">
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-foreground"><BarChart3 size={14} /> Sondage</h3>
                            {pollChartData.length > 0 ? (
                                <div className="h-[250px] sm:h-[300px] w-full bg-muted/10 rounded-[2rem] p-4 sm:p-6 border border-border">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <ReBarChart data={pollChartData} layout="vertical">
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" opacity={0.1} />
                                            <XAxis type="number" hide />
                                            <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 'bold', fill: '#94a3b8'}} width={80} />
                                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '10px' }} />
                                            <ReBar dataKey="value" radius={[0, 8, 8, 0]}>
                                                {pollChartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                                ))}
                                            </ReBar>
                                        </ReBarChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="h-[150px] sm:h-[200px] flex items-center justify-center border-2 border-dashed border-border rounded-3xl italic text-slate-500 text-sm">Aucun vote</div>
                            )}
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-foreground"><MessageSquare size={14} /> Réponses</h3>
                            <div className="space-y-4">
                                {campaignDetails.filter(n => n.userResponse).map((n, i) => (
                                    <div key={i} className="p-4 rounded-2xl bg-muted/30 border border-border">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 text-[9px] font-black">{n.userName?.[0]}</div>
                                            <span className="font-bold text-[10px]">{n.userName}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground font-medium leading-relaxed italic">"{n.userResponse}"</p>
                                    </div>
                                ))}
                                {campaignDetails.filter(n => n.userResponse).length === 0 && (
                                    <div className="p-8 text-center border border-dashed border-border rounded-3xl text-slate-500 italic text-sm">Aucune réponse</div>
                                )}
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {selectedIds.length > 0 && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 w-[92%] sm:w-[90%] max-w-2xl animate-in slide-in-from-bottom-10 duration-500 ease-out">
                    <div className="bg-slate-950 dark:bg-card border border-white/10 dark:border-border text-white dark:text-foreground px-4 sm:px-6 py-4 rounded-3xl shadow-2xl flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="h-8 w-8 sm:h-10 sm:w-10 bg-primary rounded-xl sm:rounded-2xl flex items-center justify-center font-black text-primary-foreground text-sm sm:text-base">
                                {selectedIds.length}
                            </div>
                            <div className="hidden xs:block">
                                <p className="text-xs sm:text-sm font-bold">Sélectionnés</p>
                                <p className="text-[8px] sm:text-[10px] font-black uppercase text-slate-500">Super-Admin</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button 
                                variant="destructive" 
                                size="sm" 
                                className="rounded-xl gap-2 font-black h-9 sm:h-10 px-4 sm:px-6 text-[10px] uppercase" 
                                onClick={() => setIsBatchDeletingOpen(true)}
                            >
                                <Trash2 size={14} className="sm:size-16" /> <span className="hidden sm:inline">Supprimer tout</span><span className="sm:hidden">Delete</span>
                            </Button>
                            <Button variant="ghost" size="icon" className="rounded-xl text-white/40 hover:text-white" onClick={() => setSelectedIds([])}>
                                <X size={20} />
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
                <DialogContent className="max-w-4xl rounded-[2.5rem] p-0 overflow-hidden border-border bg-card shadow-2xl mx-auto w-[95%] sm:w-full">
                    <DialogHeader className="p-6 sm:p-8 border-b border-border bg-card">
                        <DialogTitle className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center">
                                <FileText size={24} className="text-muted-foreground" />
                            </div>
                            <div className="space-y-1 min-w-0">
                                <p className="text-lg sm:text-xl font-[1000] tracking-tight truncate text-foreground">{previewFile?.fileName}</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Aperçu Admin</p>
                            </div>
                        </DialogTitle>
                    </DialogHeader>
                    <div className="p-6 sm:p-10 bg-muted/30 flex items-center justify-center min-h-[300px] sm:min-h-[400px]">
                        {previewFile?.url && (
                            <div className="w-full flex justify-center">
                                {previewFile.fileName?.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i) ? (
                                    <img src={previewFile.url} className="max-w-full max-h-[50vh] sm:max-h-[60vh] rounded-2xl shadow-xl border border-border" alt="Preview" />
                                ) : previewFile.fileName?.match(/\.(mp4|webm|mov)$/i) ? (
                                    <video src={previewFile.url} controls className="max-w-full max-h-[50vh] sm:max-h-[60vh] rounded-2xl shadow-xl" />
                                ) : (
                                    <div className="text-center space-y-6">
                                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-background rounded-3xl flex items-center justify-center mx-auto shadow-sm border border-border">
                                            <FileText size={32} className="text-muted-foreground/30" />
                                        </div>
                                        <p className="text-xs sm:text-sm text-muted-foreground font-medium italic">Aperçu non disponible.</p>
                                        <Button onClick={() => handleDownload(previewFile.filePath, previewFile.fileName)} className="rounded-xl font-black gap-2 text-[10px] uppercase">
                                            <Download size={16} /> Download
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={isBatchDialogOpen} onOpenChange={setIsBatchDeletingOpen}>
                <DialogContent className="max-w-md rounded-[2.5rem] bg-card border-border mx-auto w-[95%]">
                    <DialogHeader>
                        <DialogTitle className="text-xl sm:text-2xl font-[1000] text-destructive uppercase tracking-tighter">Suppression</DialogTitle>
                        <DialogDescription className="text-sm sm:text-lg font-medium italic">
                            Supprimer définitivement {selectedIds.length} éléments ?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-6 flex flex-col sm:flex-row gap-3">
                        <Button variant="ghost" onClick={() => setIsBatchDeletingOpen(false)} className="rounded-xl font-bold h-12 order-2 sm:order-1">Annuler</Button>
                        <Button variant="destructive" onClick={() => handleDelete(selectedIds, activeTab === 'conversions' ? 'conversion' : 'transfer')} disabled={isDeleting} className="rounded-xl font-black h-12 px-6 uppercase text-xs tracking-widest order-1 sm:order-2">
                            Confirmer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function StatCircle({ label, value, color }: any) {
    return (
        <div className={cn("px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl flex flex-col items-center min-w-[60px] sm:min-w-[80px] shrink-0", color)}>
            <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest opacity-60">{label}</span>
            <span className="text-base sm:text-xl font-black">{value}</span>
        </div>
    )
}