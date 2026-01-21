import { getAllFiles } from "@/app/actions/admin-cloud";
import Link from "next/link";
import { ArrowLeft, File, Download, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function AdminCloudPage() {
    const res = await getAllFiles();
    const files = res.success && res.data ? res.data : [];

    return (
        <div className="container mx-auto p-8">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/admin" className="p-2 hover:bg-muted rounded-full transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-3xl font-bold tracking-tight">Cloud Global</h1>
            </div>

            <div className="rounded-md border border-border bg-card">
                 <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Fichier</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Type</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Utilisateur</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date</th>
                                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Action</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {files.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-4 text-center text-muted-foreground">Aucun fichier trouvé dans le cloud.</td>
                                </tr>
                            ) : (
                                files.map((file, idx) => (
                                    <tr key={`${file.id}-${idx}`} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                        <td className="p-4 align-middle font-medium flex items-center gap-2">
                                            <File size={16} className="text-muted-foreground" />
                                            <span className="truncate max-w-[200px]" title={file.fileName}>{file.fileName}</span>
                                        </td>
                                        <td className="p-4 align-middle">
                                            <span className="inline-flex items-center px-2 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium dark:bg-slate-800 dark:text-slate-300">
                                                {String(file.typeLabel)}
                                            </span>
                                        </td>
                                        <td className="p-4 align-middle">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-xs">{file.userName}</span>
                                                <span className="text-xs text-muted-foreground">{file.userEmail}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 align-middle text-muted-foreground">
                                            {file.createdAt ? new Date(file.createdAt).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="p-4 align-middle text-right">
                                            {file.filePath && (
                                                <Button variant="ghost" size="sm" asChild>
                                                    <a href={file.filePath.startsWith('http') ? file.filePath : `/storage/${file.filePath}`} target="_blank" rel="noopener noreferrer">
                                                        <Download size={14} className="mr-2" /> Ouvrir
                                                    </a>
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
