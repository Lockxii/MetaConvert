import { cn } from "@/lib/utils";

export function StatCard({ title, value, trend, icon: Icon, color, bg }: any) {
   return (
      <div className="bg-card rounded-[2rem] p-7 border border-border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <>
                <div className="flex justify-between items-start mb-6">
                    <div className={cn("p-3 rounded-2xl shadow-sm", bg, color)}>
                    <Icon size={24} strokeWidth={2.5} />
                    </div>
                    <div className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-lg">
                    {trend}
                    </div>
                </div>
                <div>
                    <h4 className="text-muted-foreground text-xs font-bold uppercase tracking-widest mb-1">{title}</h4>
                    <p className="text-3xl font-black text-foreground">{value}</p>
                </div>
            </>
      </div>
   )
}
