import React from "react";
import { fmt, Sparkline } from "./shared";

interface AnalyticsTabProps {
  profile: any;
}

export function AnalyticsTab({ profile }: AnalyticsTabProps) {
  const analytics = {
    followers: [0, 0, 0, 0, 0, 0],
    engagement: [0, 0, 0, 0, 0, 0],
    views: [0, 0, 0, 0, 0, 0],
    months: ["Dec", "Jan", "Feb", "Mar", "Apr", "May"],
  };

  if (!profile) {
    return <div className="text-center py-16 text-slate-400">Connect your Instagram to see analytics.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
        {[
          { label: "Follower Growth", data: analytics.followers, color: "#3b82f6", unit: "" },
          { label: "Engagement Rate", data: analytics.engagement, color: "#10b981", unit: "%" },
          { label: "Avg Reel Views", data: analytics.views, color: "#7E1523", unit: "" },
        ].map((chart) => (
          <div key={chart.label} className="bg-white/80 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-4 sm:p-5 backdrop-blur-md shadow-lg shadow-slate-100/40 dark:shadow-none">
            <p className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{chart.label}</p>
            <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-3">
              {chart.unit}{typeof chart.data[chart.data.length - 1] === "number" ? (chart.unit === "%" ? chart.data[chart.data.length - 1].toFixed(1) : fmt(chart.data[chart.data.length - 1])) : "–"}
              {chart.unit}
            </p>
            <Sparkline data={chart.data} color={chart.color} height={48} />
            {/* Month labels */}
            <div className="flex justify-between mt-1">
              {analytics.months.map((m) => <span key={m} className="text-[8px] sm:text-[9px] text-slate-400">{m}</span>)}
            </div>
          </div>
        ))}
        {/* Additional metrics */}
        <div className="sm:col-span-2 md:col-span-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: "Posts/Week", val: (profile.postingFrequency || 0).toFixed(1) },
            { label: "Monthly Growth", val: `+${(profile.growthRate || 0).toFixed(1)}%` },
            { label: "Avg Likes", val: fmt(profile.avgLikes || 0) },
          ].map((m) => (
            <div key={m.label} className="bg-white/80 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-3 sm:p-4 backdrop-blur-md shadow-md shadow-slate-100/40 dark:shadow-none text-center">
              <p className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 tracking-wider">{m.label}</p>
              <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1">{m.val}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
