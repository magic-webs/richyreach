import React from "react";

export function fmt(n: number) { 
  return n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n); 
}

export function fmtPct(n: number) { 
  return `${n.toFixed(1)}%`; 
}

export const LEVEL_COLORS: Record<string, string> = {
  nano: "text-slate-400 bg-slate-400/10 border-slate-400/30",
  micro: "text-blue-400 bg-blue-400/10 border-blue-400/30",
  mid: "text-violet-400 bg-violet-400/10 border-violet-400/30",
  macro: "text-amber-400 bg-amber-400/10 border-amber-400/30",
  mega: "text-rose-400 bg-rose-400/10 border-rose-400/30",
};

export const NICHES = [
  "Fashion & Styling", "Tech & Gadgets", "Fitness & Health", 
  "Travel & Adventure", "Food & Culinary", "Gaming", 
  "Beauty & Cosmetics", "Lifestyle", "Finance", "Education"
];

export const COUNTRIES = [
  "India", "United States", "United Kingdom", "UAE", 
  "Australia", "Canada", "Germany", "Brazil"
];

export function StatCard({ label, value, sub, color = "text-slate-900 dark:text-white", icon }: { label: string; value: string; sub?: string; color?: string; icon: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white/80 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800/60 backdrop-blur-md p-4 sm:p-5 flex items-center gap-3 sm:gap-4 shadow-lg shadow-slate-100/40 dark:shadow-none transition-all hover:scale-[1.02] hover:shadow-xl group">
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/3 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary">
        {icon}
      </div>
      <div>
        <p className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">{label}</p>
        <p className={`text-lg sm:text-xl font-black mt-0.5 ${color}`}>{value}</p>
        {sub && <p className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export function ScoreBar({ label, value, color = "bg-primary" }: { label: string; value: number; color?: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{label}</span>
        <span className="text-xs font-black text-slate-700 dark:text-slate-200">{Math.round(value)}</span>
      </div>
      <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-1000 ease-out`}
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
    </div>
  );
}

export function Sparkline({ data, color = "#7E1523", height = 40 }: { data: number[]; color?: string; height?: number }) {
  if (!data.length) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 200;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${height - ((v - min) / range) * (height - 8) - 4}`).join(" ");
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none">
      <polyline fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={points} />
    </svg>
  );
}
