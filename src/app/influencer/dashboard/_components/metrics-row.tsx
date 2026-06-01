import React from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Megaphone, FileText, BarChart3 } from "lucide-react";

interface MetricsRowProps {
  dashboardData: any;
  dashboardLoading: boolean;
}

export function MetricsRow({ dashboardData, dashboardLoading }: MetricsRowProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      <Card className="bg-white/85 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md shadow-lg shadow-slate-100/50 dark:shadow-none relative overflow-hidden flex flex-col justify-between">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl"></div>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between mb-2">
            <CardDescription className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Earnings
            </CardDescription>
            <div className="p-1.5 sm:p-2 bg-emerald-100/50 dark:bg-emerald-900/30 rounded-lg">
              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          {dashboardLoading ? (
             <div className="h-8 sm:h-9 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mt-1" />
          ) : (
            <CardTitle className="text-xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
              ₹{((dashboardData?.totalEarnings || 0) / 100).toLocaleString()}
            </CardTitle>
          )}
        </CardHeader>
      </Card>

      <Card className="bg-white/85 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md shadow-lg shadow-slate-100/50 dark:shadow-none relative overflow-hidden flex flex-col justify-between">
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl"></div>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between mb-2">
            <CardDescription className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
              Active Campaigns
            </CardDescription>
            <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg">
              <Megaphone className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
          </div>
          {dashboardLoading ? (
             <div className="h-8 sm:h-9 w-12 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mt-1" />
          ) : (
            <CardTitle className="text-xl sm:text-3xl font-black text-primary">
              {dashboardData?.activeCampaigns || 0}
            </CardTitle>
          )}
        </CardHeader>
      </Card>

      <Card className="bg-white/85 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md shadow-lg shadow-slate-100/50 dark:shadow-none relative overflow-hidden flex flex-col justify-between">
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#7E1523]/5 rounded-full blur-2xl"></div>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between mb-2">
            <CardDescription className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
              Pending Proposals
            </CardDescription>
            <div className="p-1.5 sm:p-2 bg-rose-100/50 dark:bg-rose-900/30 rounded-lg">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-[#7E1523] dark:text-rose-400" />
            </div>
          </div>
          {dashboardLoading ? (
             <div className="h-8 sm:h-9 w-12 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mt-1" />
          ) : (
            <CardTitle className="text-xl sm:text-3xl font-black text-[#7E1523] dark:text-rose-350">
              {dashboardData?.pendingApplications || 0}
            </CardTitle>
          )}
        </CardHeader>
      </Card>

      <Card className="bg-white/85 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md shadow-lg shadow-slate-100/50 dark:shadow-none relative overflow-hidden flex flex-col justify-between">
        <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl"></div>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between mb-2">
            <CardDescription className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
              Expected Reach
            </CardDescription>
            <div className="p-1.5 sm:p-2 bg-rose-100/50 dark:bg-rose-900/30 rounded-lg">
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-rose-600 dark:text-rose-400" />
            </div>
          </div>
          {dashboardLoading ? (
             <div className="h-8 sm:h-9 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mt-1" />
          ) : (
            <CardTitle className="text-xl sm:text-3xl font-black text-rose-600 dark:text-rose-400">
              {dashboardData?.analyticsOverview?.totalReach?.toLocaleString() || "45,000"}
            </CardTitle>
          )}
        </CardHeader>
      </Card>
    </div>
  );
}
