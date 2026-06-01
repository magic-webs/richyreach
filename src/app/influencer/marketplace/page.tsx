"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../layout-shell";
import { api } from "@/lib/api-client";

// ──────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────
type Campaign = {
  id: string;
  title: string;
  description: string;
  budget: number;
  campaignType: string;
  requirements: string | null;
  targetAudience: string | null;
  createdAt: string;
  brandId: string;
  brandName: string;
  brandLogo: string | null;
  brandCategory: string;
  isApplied: boolean;
  isSaved: boolean;
  isInvited: boolean;
  isRecommended: boolean;
};

type Application = {
  applicationId: string;
  campaignId: string;
  campaignTitle: string;
  budget: number;
  brandName: string;
  brandLogo: string | null;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
};

// ──────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────
function fmt(n: number) { return n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n); }
function fmtBudget(cents: number) { return `₹${fmt(cents / 100)}`; }
function timeAgo(date: string) {
  const d = Date.now() - new Date(date).getTime();
  if (d < 3600_000) return `${Math.round(d / 60000)}m ago`;
  if (d < 86400_000) return `${Math.round(d / 3600_000)}h ago`;
  return `${Math.round(d / 86400_000)}d ago`;
}

const BUDGET_LABEL = (b: number): { label: string; cls: string } => {
  if (b >= 1_000_000) return { label: "High Budget", cls: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20" };
  if (b >= 200_000) return { label: "Mid Budget", cls: "text-amber-600 bg-amber-500/10 border-amber-500/20" };
  return { label: "Low Budget", cls: "text-slate-500 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700" };
};

const STATUS_COLORS: Record<string, string> = {
  pending: "text-amber-600 bg-amber-500/10 border-amber-500/20",
  accepted: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
  rejected: "text-rose-500 bg-rose-500/10 border-rose-500/20",
};

const CAMPAIGN_TYPES = ["All Types", "reel", "post", "story", "long-term"];
const SORT_OPTIONS = [
  { value: "recent", label: "Most Recent" },
  { value: "budget_desc", label: "Highest Budget" },
  { value: "budget_asc", label: "Lowest Budget" },
];

// ──────────────────────────────────────────────────────────────
// Campaign Card
// ──────────────────────────────────────────────────────────────
function CampaignCard({
  campaign,
  onApply,
  onToggleSave,
  onView,
}: {
  campaign: Campaign;
  onApply: (c: Campaign) => void;
  onToggleSave: (c: Campaign) => void;
  onView: (c: Campaign) => void;
}) {
  const budgetInfo = BUDGET_LABEL(campaign.budget);

  return (
    <div className={`group relative overflow-hidden rounded-2xl bg-white/80 dark:bg-slate-900/40 border backdrop-blur-md shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.01] ${campaign.isRecommended ? "border-primary/40 dark:border-primary/30" : "border-slate-200/70 dark:border-slate-800/60"} flex flex-col`}>
      {/* Recommended glow */}
      {campaign.isRecommended && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
      )}
      {/* Invited badge */}
      {campaign.isInvited && (
        <div className="absolute top-3 right-3 z-10 text-[9px] font-black px-2 py-0.5 rounded-full bg-violet-600 text-white">INVITED</div>
      )}
      {campaign.isRecommended && !campaign.isInvited && (
        <div className="absolute top-3 right-3 z-10 text-[9px] font-black px-2 py-0.5 rounded-full bg-primary text-white">FOR YOU</div>
      )}

      <div className="relative z-10 p-5 flex-1 space-y-3">
        {/* Brand row */}
        <div className="flex items-center gap-2.5">
          <img
            src={campaign.brandLogo || `https://api.dicebear.com/7.x/initials/svg?seed=${campaign.brandName}`}
            alt={campaign.brandName}
            className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1 object-contain"
          />
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{campaign.brandName}</p>
            <p className="text-[9px] text-slate-400 truncate">{campaign.brandCategory}</p>
          </div>
        </div>

        {/* Title */}
        <div>
          <h3 className="font-extrabold text-slate-900 dark:text-white text-sm leading-tight line-clamp-2">{campaign.title}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">{campaign.description}</p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg border ${budgetInfo.cls}`}>{budgetInfo.label}</span>
          <span className="text-[9px] font-black px-2 py-0.5 rounded-lg border text-violet-600 bg-violet-500/10 border-violet-500/20 uppercase">{campaign.campaignType}</span>
          <span className="text-[9px] font-bold text-slate-400 ml-auto">{timeAgo(campaign.createdAt)}</span>
        </div>

        {/* Budget + Deliverables */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-bold">Budget</p>
            <p className="text-lg font-black text-slate-900 dark:text-white leading-none mt-0.5">{fmtBudget(campaign.budget)}</p>
          </div>
          {campaign.targetAudience && (
            <div className="text-right max-w-[120px]">
              <p className="text-[10px] text-slate-400 uppercase font-bold">Target</p>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 truncate mt-0.5">{campaign.targetAudience}</p>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="relative z-10 px-5 pb-5 flex gap-2">
        <button
          onClick={() => onToggleSave(campaign)}
          className={`flex-shrink-0 w-9 h-9 rounded-xl border transition-all flex items-center justify-center ${campaign.isSaved ? "bg-primary/10 border-primary/30 text-primary" : "border-slate-200 dark:border-slate-700 text-slate-400 hover:text-primary hover:border-primary/30 hover:bg-primary/5"}`}
          title={campaign.isSaved ? "Remove from saved" : "Save campaign"}
        >
          <svg className="w-4 h-4" fill={campaign.isSaved ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
        </button>
        <button
          onClick={() => onView(campaign)}
          className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
        >
          View Details
        </button>
        {campaign.isApplied ? (
          <div className="flex-1 py-2 rounded-xl text-xs font-bold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>Applied
          </div>
        ) : (
          <button
            onClick={() => onApply(campaign)}
            className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-primary to-rose-700 hover:from-primary/90 hover:to-rose-600 shadow-md shadow-primary/20 hover:shadow-primary/30 transition-all cursor-pointer"
          >
            Apply Now
          </button>
        )}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Main Marketplace Page
// ──────────────────────────────────────────────────────────────
export default function InfluencerMarketplacePage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const queryClient = useQueryClient();
  const [view, setView] = useState<"browse" | "applications">("browse");
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All Types");
  const [sort, setSort] = useState("recent");
  const [showFilters, setShowFilters] = useState(false);

  const { data: campaigns = [], isLoading: loadingCampaigns } = useQuery({
    queryKey: ["marketplaceCampaigns", search],
    queryFn: async () => {
      const res = await api.api.influencers["marketplace-campaigns"].$get({ query: { search, limit: "30" } });
      if (!res.ok) throw new Error("Failed to load campaigns");
      const r = await res.json();
      return r.success && r.data ? (r.data as Campaign[]) : [];
    },
    enabled: user.role === "influencer",
  });

  const { data: applications = { applications: [], invites: [] }, isLoading: loadingApplications } = useQuery({
    queryKey: ["marketplaceApplications"],
    queryFn: async () => {
      const res = await api.api.influencers.campaigns.$get();
      if (!res.ok) throw new Error("Failed to load applications");
      const r = await res.json();
      return r.success && r.data ? (r.data as any) : { applications: [], invites: [] };
    },
    enabled: user.role === "influencer",
  });

  const saveMutation = useMutation({
    mutationFn: async (campaign: Campaign) => {
      if (campaign.isSaved) {
        await api.api.influencers["save-campaign"][":campaignId"].$delete({ param: { campaignId: campaign.id } });
      } else {
        await api.api.influencers["save-campaign"].$post({ json: { campaignId: campaign.id } });
      }
      return campaign;
    },
    onMutate: async (campaign) => {
      await queryClient.cancelQueries({ queryKey: ["marketplaceCampaigns"] });
      const previousCampaigns = queryClient.getQueryData(["marketplaceCampaigns", search]);
      queryClient.setQueryData(["marketplaceCampaigns", search], (old: Campaign[] | undefined) => {
        if (!old) return old;
        return old.map((c) => (c.id === campaign.id ? { ...c, isSaved: !c.isSaved } : c));
      });
      return { previousCampaigns };
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(["marketplaceCampaigns", search], context?.previousCampaigns);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["marketplaceCampaigns"] });
    },
  });

  const handleToggleSave = (campaign: Campaign) => {
    saveMutation.mutate(campaign);
  };

  const navToDetail = (c: Campaign) => router.push(`/influencer/campaigns/${c.id}`);

  // Filter & sort
  const filtered = campaigns
    .filter((c) => {
      if (filterType !== "All Types" && c.campaignType !== filterType) return false;
      if (search && !c.title.toLowerCase().includes(search.toLowerCase()) && !c.brandName.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sort === "budget_desc") return b.budget - a.budget;
      if (sort === "budget_asc") return a.budget - b.budget;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const recommended = filtered.filter((c) => c.isRecommended);
  const regular = filtered.filter((c) => !c.isRecommended);

  if (user.role !== "influencer") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8 bg-white/80 dark:bg-slate-900/30 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-xl backdrop-blur-md">
        <p className="text-slate-500 dark:text-slate-400">This page is for influencers. Switch roles to browse campaigns.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10">
      {/* ── Hero Header ── */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-xl bg-gradient-to-br from-slate-50/90 via-white/80 to-rose-50/40 dark:from-slate-900/80 dark:via-slate-900/60 dark:to-[#3F030B]/15 shadow-xl shadow-slate-200/50 dark:shadow-none p-6 md:p-8">
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-primary/10 rounded-full blur-[70px] pointer-events-none" />
        <div className="relative z-10 flex flex-col gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">Campaign Marketplace</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Browse campaigns from top brands. Apply, get discovered, monetize your reach.</p>
          </div>
          {/* Search + View toggle */}
          <div className="flex gap-3 flex-col sm:flex-row">
            <div className="relative flex-1">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input
                type="text"
                placeholder="Search campaigns or brands..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              {/* View toggle */}
              <div className="flex bg-white/70 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-700/50 rounded-xl p-0.5">
                <button onClick={() => setView("browse")} className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${view === "browse" ? "bg-primary text-white shadow" : "text-slate-500 hover:text-slate-800 dark:hover:text-white"}`}>Browse</button>
                <button onClick={() => setView("applications")} className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${view === "applications" ? "bg-primary text-white shadow" : "text-slate-500 hover:text-slate-800 dark:hover:text-white"}`}>
                  My Activity
                  {applications.applications.length > 0 && <span className="text-[9px] w-4 h-4 flex items-center justify-center rounded-full bg-white/30">{applications.applications.length}</span>}
                </button>
              </div>
              {/* Filters toggle */}
              <button onClick={() => setShowFilters(!showFilters)} className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${showFilters ? "bg-primary text-white border-primary" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500"}`}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                Filters
              </button>
            </div>
          </div>

          {/* Filter bar */}
          {showFilters && (
            <div className="flex flex-wrap gap-3 pt-1 border-t border-slate-100 dark:border-slate-800">
              {/* Type filter */}
              <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
                {CAMPAIGN_TYPES.map((t) => (
                  <button key={t} onClick={() => setFilterType(t)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === t ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-800 dark:hover:text-white"}`}>{t}</button>
                ))}
              </div>
              {/* Sort */}
              <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
                {SORT_OPTIONS.map((o) => (
                  <button key={o.value} onClick={() => setSort(o.value)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${sort === o.value ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-800 dark:hover:text-white"}`}>{o.label}</button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Browse View ── */}
      {view === "browse" && (
        <div className="space-y-8">
          {loadingCampaigns ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/20 p-5 flex flex-col gap-4 h-[220px]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2 animate-pulse" />
                      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/3 animate-pulse" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-3/4 animate-pulse" />
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full animate-pulse" />
                  </div>
                  <div className="mt-auto flex gap-2">
                    <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl flex-1 animate-pulse" />
                    <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl flex-1 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 bg-white/60 dark:bg-slate-900/30 border border-dashed border-slate-300 dark:border-slate-700 rounded-3xl">
              <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <p className="text-slate-500 text-sm font-semibold">No campaigns found</p>
              <p className="text-slate-400 text-xs mt-1">Try a different search or filter</p>
            </div>
          ) : (
            <>
              {/* Recommended strip */}
              {recommended.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Recommended for You</h2>
                    <span className="text-xs text-slate-400 font-semibold">{recommended.length} matches</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recommended.slice(0, 3).map((c) => (
                      <CampaignCard key={c.id} campaign={c} onApply={() => navToDetail(c)} onToggleSave={handleToggleSave} onView={() => navToDetail(c)} />
                    ))}
                  </div>
                </div>
              )}

              {/* All campaigns */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-white">All Campaigns</h2>
                  <span className="text-xs text-slate-400 font-semibold">{filtered.length} available</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filtered.map((c) => (
                    <CampaignCard key={c.id} campaign={c} onApply={() => navToDetail(c)} onToggleSave={handleToggleSave} onView={() => navToDetail(c)} />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── My Activity ── */}
      {view === "applications" && (
        <div className="space-y-6">
          {/* Applications */}
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white mb-4">My Applications ({applications.applications.length})</h2>
            {loadingApplications ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-white/50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-4 h-[74px]">
                    <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse shrink-0" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3 animate-pulse" />
                      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/4 animate-pulse" />
                    </div>
                    <div className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse shrink-0" />
                  </div>
                ))}
              </div>
            ) : applications.applications.length === 0 ? (
              <div className="text-center py-10 bg-white/60 dark:bg-slate-900/30 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl">
                <p className="text-slate-400 text-sm">No applications yet. Browse campaigns and apply!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {applications.applications.map((app) => (
                  <div key={app.applicationId} className="bg-white/80 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-4 backdrop-blur-md shadow-md dark:shadow-none flex items-center gap-4">
                    <img src={app.brandLogo || `https://api.dicebear.com/7.x/initials/svg?seed=${app.brandName}`} alt={app.brandName} className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 p-1 bg-white dark:bg-slate-800 object-contain" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 dark:text-white text-sm truncate">{app.campaignTitle}</p>
                      <p className="text-xs text-slate-400">{app.brandName} · {fmtBudget(app.budget)} · {timeAgo(app.createdAt)}</p>
                    </div>
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border shrink-0 ${STATUS_COLORS[app.status]}`}>{app.status.charAt(0).toUpperCase() + app.status.slice(1)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Invites */}
          {applications.invites.length > 0 && (
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white mb-4">Campaign Invites ({applications.invites.length})</h2>
              <div className="space-y-3">
                {applications.invites.map((inv: any) => (
                  <div key={inv.inviteId} className="bg-white/80 dark:bg-slate-900/40 border border-violet-500/30 dark:border-violet-500/20 rounded-2xl p-4 backdrop-blur-md shadow-md dark:shadow-none flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 dark:text-white text-sm truncate">{inv.campaignTitle}</p>
                      <p className="text-xs text-slate-400">{inv.brandName} · {fmtBudget(inv.budget)}</p>
                    </div>
                    <span className="text-[10px] font-black px-2.5 py-1 rounded-lg border text-violet-600 bg-violet-500/10 border-violet-500/20 shrink-0">Invited</span>
                    <button
                      onClick={() => {
                        const camp = campaigns.find((c) => c.id === inv.campaignId);
                        if (camp) navToDetail(camp);
                      }}
                      className="text-xs font-bold text-primary hover:text-primary/80 transition-colors shrink-0"
                    >
                      View →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
