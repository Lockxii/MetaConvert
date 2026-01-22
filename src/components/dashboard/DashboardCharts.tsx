"use client";

import { TrendingUp } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";

export function DashboardCharts({ data }: { data: any[] }) {
  return (
         <div className="lg:col-span-2 bg-card rounded-[2rem] border border-border p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 text-primary rounded-lg">
                        <TrendingUp size={20} />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">Flux d'Activité</h3>
                </div>
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest bg-muted px-3 py-1 rounded-full">7 derniers jours</div>
            </div>
            <div className="h-[350px] w-full pr-4">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorConv" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                        <XAxis 
                            dataKey="name" 
                            stroke="hsl(var(--muted-foreground))" 
                            fontSize={12} 
                            tickLine={false} 
                            axisLine={false} 
                            dy={15} 
                            fontWeight="bold"
                        />
                        <YAxis 
                            stroke="hsl(var(--muted-foreground))" 
                            fontSize={12} 
                            tickLine={false} 
                            axisLine={false} 
                            tickFormatter={(value) => `${value}`} 
                            fontWeight="bold"
                        />
                        <Tooltip 
                            cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 2, strokeDasharray: '5 5' }}
                            contentStyle={{ 
                                backgroundColor: 'hsl(var(--card))', 
                                border: '1px solid hsl(var(--border))', 
                                borderRadius: '16px', 
                                padding: '12px',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' 
                            }}
                            labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="conversions" 
                            name="Conversions"
                            stroke="hsl(var(--primary))" 
                            strokeWidth={4} 
                            fillOpacity={1} 
                            fill="url(#colorConv)" 
                            animationDuration={1500}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
         </div>
  );
}
