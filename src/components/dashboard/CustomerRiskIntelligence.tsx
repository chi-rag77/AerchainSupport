"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShieldAlert, TrendingUp, ArrowRight, Target, Sparkles } from 'lucide-react';
import { 
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, 
  Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { cn } from '@/lib/utils';
import { CustomerRisk } from '@/features/dashboard/types';

interface CustomerRiskIntelligenceProps {
  risks: CustomerRisk[];
}

const CustomerRiskIntelligence = ({ risks = [] }: CustomerRiskIntelligenceProps) => {
  const scatterData = risks.map(r => ({
    name: r.company,
    escalations: r.urgentCount,
    openTickets: r.openCount,
    risk: r.riskScore,
    sla: r.slaMetPercent
  }));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-600 rounded-xl shadow-lg shadow-rose-500/20">
            <ShieldAlert className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-2xl font-black tracking-tight">Customer Risk Intelligence</h3>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-rose-600">
              {risks.filter(r => r.riskLevel === 'HIGH').length} High Risk Accounts
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Part A: Risk Radar (Scatter Chart) */}
        <Card className="lg:col-span-7 border-none shadow-glass rounded-[32px] bg-white dark:bg-gray-900 overflow-hidden">
          <CardHeader className="p-8 pb-0">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Target className="h-5 w-5 text-indigo-500" />
              Risk Radar (Urgent vs. Open)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <XAxis type="number" dataKey="openTickets" name="Open Tickets" axisLine={false} tickLine={false} fontSize={10} fontWeight="bold" label={{ value: 'Open Tickets', position: 'bottom', offset: 0, fontSize: 10, fontWeight: 'black' }} />
                <YAxis type="number" dataKey="escalations" name="Urgent Tickets" axisLine={false} tickLine={false} fontSize={10} fontWeight="bold" label={{ value: 'Urgent Tickets', angle: -90, position: 'left', fontSize: 10, fontWeight: 'black' }} />
                <ZAxis type="number" dataKey="risk" range={[100, 1000]} name="Risk Score" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                <Scatter name="Customers" data={scatterData}>
                  {scatterData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.risk > 80 ? '#ef4444' : entry.risk > 60 ? '#f59e0b' : '#10b981'} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Part B: Top At-Risk Table */}
        <Card className="lg:col-span-5 border-none shadow-glass rounded-[32px] bg-white dark:bg-gray-900 overflow-hidden flex flex-col">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="text-lg font-bold">Trending Toward Churn</CardTitle>
          </CardHeader>
          <CardContent className="p-8 pt-0 flex-grow overflow-y-auto">
            <div className="space-y-4">
              {risks.sort((a, b) => b.riskScore - a.riskScore).slice(0, 5).map((item) => (
                <div key={item.company} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-border/50 group hover:border-rose-200 transition-all">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "h-10 w-10 rounded-full flex items-center justify-center text-sm font-black shadow-sm",
                      item.riskLevel === 'HIGH' ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600"
                    )}>
                      {item.company[0]}
                    </div>
                    <div className="space-y-0.5">
                      <h5 className="font-bold text-sm">{item.company}</h5>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        Score: {Math.round(item.riskScore)}/100 • {item.urgentCount} Urgent
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
          <div className="p-6 bg-rose-50/50 dark:bg-rose-950/20 border-t border-rose-100 dark:border-rose-900/50">
            <div className="flex items-start gap-3">
              <Sparkles className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <p className="text-[11px] font-bold text-rose-900 dark:text-rose-200 leading-relaxed">
                Risk is concentrated in {risks[0]?.company || 'top accounts'}. Recommend CSM outreach for high-risk accounts within 24h.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CustomerRiskIntelligence;