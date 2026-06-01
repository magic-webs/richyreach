import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, TrendingUp } from "lucide-react";

interface SocialInsightsProps {
  dashboardData: any;
  dashboardLoading: boolean;
}

export function SocialInsights({ dashboardData, dashboardLoading }: SocialInsightsProps) {
  return (
    <Card className="bg-white/85 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md shadow-lg shadow-slate-100/50 dark:shadow-none relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl"></div>
      <CardHeader>
        <CardTitle className="text-base text-slate-900 dark:text-slate-200 flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          Social Insights
        </CardTitle>
        <CardDescription>Metrics powered by AI analytics</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {dashboardLoading ? (
          <>
            <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
            <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
          </>
        ) : (
          <>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/65 border border-slate-150 dark:border-slate-850 space-y-3.5 hover:border-primary/20 transition-colors">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-semibold uppercase flex items-center gap-1.5">
                  Engagement Rate
                </span>
                <span className="text-primary font-extrabold text-sm">
                  {dashboardData?.analyticsOverview?.averageEngagement || 4.8}%
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-900 h-2 rounded-full overflow-hidden">
                <div className="bg-primary h-full rounded-full" style={{ width: "48%" }}></div>
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold">
                <span>Industry Avg: 3.2%</span>
                <span className="text-primary flex items-center gap-0.5"><TrendingUp className="w-3 h-3" /> +1.6% Outperforming</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/65 border border-slate-150 dark:border-slate-855 space-y-3.5 hover:border-[#7E1523]/20 dark:hover:border-rose-400/20 transition-colors">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-semibold uppercase">Monthly Impressions</span>
                <span className="text-[#7E1523] dark:text-rose-300 font-extrabold text-sm">
                  {dashboardData?.analyticsOverview?.monthlyViews?.toLocaleString() || "45,000"}
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-900 h-2 rounded-full overflow-hidden">
                <div className="bg-[#7E1523] dark:bg-rose-500 h-full rounded-full" style={{ width: "65%" }}></div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
