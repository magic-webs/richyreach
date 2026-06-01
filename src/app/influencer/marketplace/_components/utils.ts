export function fmt(n: number) { return n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n); }

export function fmtBudget(cents: number) { return `₹${fmt(cents / 100)}`; }

export function timeAgo(date: string) {
  const d = Date.now() - new Date(date).getTime();
  if (d < 3600_000) return `${Math.round(d / 60000)}m ago`;
  if (d < 86400_000) return `${Math.round(d / 3600_000)}h ago`;
  return `${Math.round(d / 86400_000)}d ago`;
}

export const BUDGET_LABEL = (b: number): { label: string; cls: string } => {
  if (b >= 1_000_000) return { label: "High Budget", cls: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20" };
  if (b >= 200_000) return { label: "Mid Budget", cls: "text-amber-600 bg-amber-500/10 border-amber-500/20" };
  return { label: "Low Budget", cls: "text-slate-500 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700" };
};

export const STATUS_COLORS: Record<string, string> = {
  pending: "text-amber-600 bg-amber-500/10 border-amber-500/20",
  accepted: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
  rejected: "text-rose-500 bg-rose-500/10 border-rose-500/20",
};

export const CAMPAIGN_TYPES = ["All Types", "reel", "post", "story", "long-term"];

export const SORT_OPTIONS = [
  { value: "recent", label: "Most Recent" },
  { value: "budget_desc", label: "Highest Budget" },
  { value: "budget_asc", label: "Lowest Budget" },
];
