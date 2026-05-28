"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useMockAuth } from "../../layout-shell";
import { api } from "@/lib/api-client";
import { ReachScoreRing } from "@/components/ui/reach-score-ring";

// ──────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────
type Influencer = {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  bio: string | null;
  instagramHandle: string;
  followers: number;
  engagementRate: number;
  niche: string;
  avgViews: number;
  avgLikes: number;
  pricing: number;
  verified: boolean;
  level: "nano" | "micro" | "mid" | "macro" | "mega";
  reachScore: number;
  country: string | null;
  postingFrequency: number;
  growthRate: number;
};

type Campaign = {
  id: string;
  title: string;
  status: string;
};

// ──────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────
function fmt(n: number) { return n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n); }

const LEVEL_COLORS: Record<string, string> = {
  nano: "text-slate-400 bg-slate-400/10 border-slate-400/30",
  micro: "text-blue-400 bg-blue-400/10 border-blue-400/30",
  mid: "text-violet-400 bg-violet-400/10 border-violet-400/30",
  macro: "text-amber-400 bg-amber-400/10 border-amber-400/30",
  mega: "text-rose-400 bg-rose-400/10 border-rose-400/30",
};

const TIER_RANGES: Record<string, [number, number]> = {
  nano: [1_000, 10_000], micro: [10_001, 100_000], mid: [100_001, 500_000], macro: [500_001, 5_000_000], mega: [5_000_001, Infinity],
};

const NICHES = ["All Niches", "Fashion & Styling", "Tech & Gadgets", "Fitness & Health", "Travel & Adventure", "Food & Culinary", "Gaming", "Beauty & Cosmetics", "Lifestyle", "Finance"];
const TIERS = ["All Tiers", "nano", "micro", "mid", "macro", "mega"];

// ──────────────────────────────────────────────────────────────
// Influencer Card
// ──────────────────────────────────────────────────────────────
function CreatorCard({
  inf,
  isSaved,
  onSave,
  onInvite,
  onView,
}: {
  inf: Influencer;
  isSaved: boolean;
  onSave: (inf: Influencer) => void;
  onInvite: (inf: Influencer) => void;
  onView: (inf: Influencer) => void;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white/80 dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-800/60 backdrop-blur-md shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.01] flex flex-col">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/3 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      <div className="relative z-10 p-5 flex-1 space-y-4">
        {/* Avatar + identity */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={inf.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${inf.name}`}
                alt={inf.name}
                className="w-14 h-14 rounded-2xl border-2 border-slate-200 dark:border-slate-700 object-cover shadow-md"
              />
              {inf.verified && (
                <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-violet-500 rounded-full flex items-center justify-center shadow-sm">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                </span>
              )}
            </div>
            <div className="min-w-0">
              <p className="font-extrabold text-slate-900 dark:text-white text-sm leading-tight">{inf.name}</p>
              <p className="text-[11px] text-primary font-semibold mt-0.5">@{inf.instagramHandle}</p>
              {inf.country && <p className="text-[10px] text-slate-400 mt-0.5">📍 {inf.country}</p>}
            </div>
          </div>
          <ReachScoreRing score={inf.reachScore} size={48} strokeWidth={4.5} />
        </div>

        {/* Tier + Niche */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${LEVEL_COLORS[inf.level] || LEVEL_COLORS.nano}`}>{inf.level}</span>
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">{inf.niche}</span>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-2.5">
            <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Followers</p>
            <p className="text-base font-black text-slate-900 dark:text-white mt-0.5">{fmt(inf.followers)}</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-2.5">
            <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">ER</p>
            <p className="text-base font-black text-emerald-500 mt-0.5">{inf.engagementRate.toFixed(1)}%</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-2.5">
            <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Views</p>
            <p className="text-base font-black text-primary mt-0.5">{fmt(inf.avgViews)}</p>
          </div>
        </div>

        {/* Bio snippet */}
        {inf.bio && (
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">"{inf.bio}"</p>
        )}

        {/* Pricing */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">Base price</span>
          <span className="font-black text-slate-800 dark:text-slate-200">${(inf.pricing / 100).toFixed(0)}<span className="font-normal text-slate-400">/post</span></span>
        </div>
      </div>

      {/* Actions */}
      <div className="relative z-10 px-5 pb-5 flex gap-2">
        <button
          onClick={() => onSave(inf)}
          className={`flex-shrink-0 w-9 h-9 rounded-xl border transition-all flex items-center justify-center ${isSaved ? "bg-rose-500/10 border-rose-500/30 text-rose-500" : "border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-500 hover:border-rose-500/30 hover:bg-rose-500/5"}`}
          title={isSaved ? "Remove from saved" : "Save creator"}
        >
          <svg className="w-4 h-4" fill={isSaved ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
        </button>
        <button onClick={() => onView(inf)} className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">View Profile</button>
        <button onClick={() => onInvite(inf)} className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-md shadow-violet-500/20 hover:shadow-violet-500/30 transition-all">Invite</button>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Creator Detail Modal
// ──────────────────────────────────────────────────────────────
function CreatorModal({
  inf,
  campaigns,
  savedIds,
  onClose,
  onSave,
  onInvite,
}: {
  inf: Influencer;
  campaigns: Campaign[];
  savedIds: Set<string>;
  onClose: () => void;
  onSave: (inf: Influencer) => void;
  onInvite: (inf: Influencer, campaignId: string) => void;
}) {
  const [selectedCampaign, setSelectedCampaign] = useState("");
  const [inviting, setInviting] = useState(false);

  const handleInvite = async () => {
    if (!selectedCampaign) return;
    setInviting(true);
    await onInvite(inf, selectedCampaign);
    setInviting(false);
    onClose();
  };

  const isSaved = savedIds.has(inf.id);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300">
        <div className="p-6 space-y-5">
          {/* Header */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <img src={inf.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${inf.name}`} alt={inf.name} className="w-16 h-16 rounded-2xl border-2 border-slate-200 dark:border-slate-700 object-cover shadow-md" />
              {inf.verified && <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-violet-500 rounded-full flex items-center justify-center"><svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg></span>}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">{inf.name}</h2>
              <p className="text-sm text-primary font-semibold">@{inf.instagramHandle}</p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${LEVEL_COLORS[inf.level]}`}>{inf.level}</span>
                <span className="text-[10px] text-slate-400">{inf.niche}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <ReachScoreRing score={inf.reachScore} size={52} strokeWidth={5} />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-2 text-center">
            {[
              { label: "Followers", val: fmt(inf.followers) },
              { label: "ER", val: `${inf.engagementRate.toFixed(1)}%`, color: "text-emerald-500" },
              { label: "Avg Views", val: fmt(inf.avgViews), color: "text-primary" },
              { label: "Price/Post", val: `$${(inf.pricing / 100).toFixed(0)}`, color: "text-violet-500" },
            ].map((s) => (
              <div key={s.label} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-2.5">
                <p className="text-[9px] uppercase font-bold text-slate-400">{s.label}</p>
                <p className={`text-sm font-black mt-0.5 ${s.color || "text-slate-900 dark:text-white"}`}>{s.val}</p>
              </div>
            ))}
          </div>

          {/* Bio */}
          {inf.bio && (
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">About</p>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{inf.bio}</p>
            </div>
          )}

          {/* Reach Score Breakdown */}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Reach Score Breakdown</p>
            <div className="space-y-2">
              {[
                { label: "Followers Score", val: Math.min(100, (Math.log10(inf.followers + 1) / Math.log10(10_000_000)) * 100), color: "bg-blue-500" },
                { label: "Engagement Rate", val: Math.min(100, (Math.min(inf.engagementRate, 10) / 10) * 100), color: "bg-emerald-500" },
                { label: "Avg Views", val: Math.min(100, (Math.log10(inf.avgViews + 1) / Math.log10(1_000_000)) * 100), color: "bg-rose-500" },
              ].map((f) => (
                <div key={f.label} className="space-y-0.5">
                  <div className="flex justify-between text-xs"><span className="text-slate-500 font-semibold">{f.label}</span><span className="font-black text-slate-700 dark:text-slate-200">{Math.round(f.val)}</span></div>
                  <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden"><div className={`h-full ${f.color} rounded-full`} style={{ width: `${f.val}%`, transition: "width 1s ease-out" }} /></div>
                </div>
              ))}
            </div>
          </div>

          {/* Invite to campaign */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Invite to Campaign</p>
            {campaigns.length === 0 ? (
              <p className="text-xs text-slate-400">No active campaigns. Create one first.</p>
            ) : (
              <div className="flex gap-2">
                <select
                  value={selectedCampaign}
                  onChange={(e) => setSelectedCampaign(e.target.value)}
                  className="flex-1 p-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl focus:border-violet-500 focus:outline-none"
                >
                  <option value="">Select a campaign...</option>
                  {campaigns.filter((c) => c.status === "active").map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
                <button
                  onClick={handleInvite}
                  disabled={!selectedCampaign || inviting}
                  className="px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 shadow-md shadow-violet-500/20 transition-all cursor-pointer"
                >
                  {inviting ? "Inviting..." : "Invite"}
                </button>
              </div>
            )}
          </div>

          {/* Save button */}
          <button
            onClick={() => onSave(inf)}
            className={`w-full py-2.5 rounded-xl text-sm font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer ${isSaved ? "text-rose-500 border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20" : "text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
          >
            <svg className="w-4 h-4" fill={isSaved ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            {isSaved ? "Remove from Saved" : "Save Creator"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Main Brand Marketplace Page
// ──────────────────────────────────────────────────────────────
export default function BrandMarketplacePage() {
  const { user } = useMockAuth();
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"discover" | "saved">("discover");
  const [selectedInfluencer, setSelectedInfluencer] = useState<Influencer | null>(null);
  const [inviteTargetInf, setInviteTargetInf] = useState<Influencer | null>(null);
  const [search, setSearch] = useState("");
  const [filterNiche, setFilterNiche] = useState("All Niches");
  const [filterTier, setFilterTier] = useState("All Tiers");
  const [minReachScore, setMinReachScore] = useState(0);
  const [sort, setSort] = useState<"reachScore" | "followers" | "engagementRate">("reachScore");
  const [showFilters, setShowFilters] = useState(false);

  const loadInfluencers = useCallback(async () => {
    try {
      setLoading(true);
      const q: Record<string, string> = { limit: "50", sort: "reachScore" };
      if (filterNiche !== "All Niches") q.niche = filterNiche;
      if (filterTier !== "All Tiers") q.level = filterTier;
      if (search) q.search = search;
      if (minReachScore > 0) q.minReachScore = String(minReachScore);
      const res = await api.api.influencers.$get({ query: q });
      if (res.ok) {
        const r = await res.json();
        if (r.success && r.data) setInfluencers((r.data as any).items || (r.data as any) || []);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [search, filterNiche, filterTier, minReachScore]);

  const loadSaved = useCallback(async () => {
    try {
      const res = await fetch("/api/brands/saved-influencers");
      if (res.ok) {
        const r = await res.json() as any;
        if (r.success && r.data) setSavedIds(new Set((r.data as any[]).map((s) => s.id)));
      }
    } catch (_) {}
  }, []);

  const loadCampaigns = useCallback(async () => {
    try {
      const res = await api.api.campaigns.$get();
      if (res.ok) {
        const r = await res.json();
        if (r.success && r.data) setCampaigns(r.data as Campaign[]);
      }
    } catch (_) {}
  }, []);

  useEffect(() => {
    if (user.role === "brand") { loadInfluencers(); loadSaved(); loadCampaigns(); }
    // eslint-disable-next-line
  }, [user.role]);

  const handleSave = async (inf: Influencer) => {
    try {
      if (savedIds.has(inf.id)) {
        await fetch(`/api/brands/save-influencer/${inf.id}`, { method: "DELETE" });
        setSavedIds((prev) => { const s = new Set(prev); s.delete(inf.id); return s; });
      } else {
        await fetch("/api/brands/save-influencer", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ influencerId: inf.id }) });
        setSavedIds((prev) => new Set([...prev, inf.id]));
      }
    } catch (_) {}
  };

  const handleInvite = async (inf: Influencer, campaignId: string) => {
    try {
      // @ts-ignore - Route not implemented yet in backend
      await (api.api.influencers as any)[":id"].invite.$post({
        param: { id: inf.id },
        json: { influencerId: inf.id, campaignId },
      });
    } catch (err) { console.error(err); }
  };

  // Filter & sort
  const filtered = influencers
    .filter((inf) => {
      if (search && !inf.name.toLowerCase().includes(search.toLowerCase()) && !inf.instagramHandle.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterNiche !== "All Niches" && !inf.niche.toLowerCase().includes(filterNiche.toLowerCase())) return false;
      if (filterTier !== "All Tiers" && inf.level !== filterTier) return false;
      if (minReachScore > 0 && inf.reachScore < minReachScore) return false;
      return true;
    })
    .sort((a, b) => {
      if (sort === "followers") return b.followers - a.followers;
      if (sort === "engagementRate") return b.engagementRate - a.engagementRate;
      return b.reachScore - a.reachScore;
    });

  const savedInfluencers = filtered.filter((i) => savedIds.has(i.id));

  if (user.role !== "brand") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8 bg-white/80 dark:bg-slate-900/30 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-xl backdrop-blur-md">
        <p className="text-slate-500 dark:text-slate-400">This page is for brands. Switch to Brand View to discover creators.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10">
      {/* Modals */}
      {selectedInfluencer && (
        <CreatorModal
          inf={selectedInfluencer}
          campaigns={campaigns}
          savedIds={savedIds}
          onClose={() => setSelectedInfluencer(null)}
          onSave={handleSave}
          onInvite={handleInvite}
        />
      )}

      {/* ── Hero Header ── */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-xl bg-gradient-to-br from-white/90 via-violet-50/30 to-slate-50/80 dark:from-slate-900/80 dark:via-violet-950/15 dark:to-slate-900/60 shadow-xl shadow-slate-200/50 dark:shadow-none p-6 md:p-8">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-violet-500/10 rounded-full blur-[90px] pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">Creator Discovery</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Find the perfect influencer. Filter by niche, tier, engagement rate, and Reach Score.</p>
          </div>

          {/* Search + view toggle */}
          <div className="flex gap-3 flex-col sm:flex-row">
            <div className="relative flex-1">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input
                type="text"
                placeholder="Search creators by name or @handle..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <div className="flex bg-white/70 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-700/50 rounded-xl p-0.5">
                <button onClick={() => setView("discover")} className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${view === "discover" ? "bg-violet-600 text-white shadow" : "text-slate-500 hover:text-slate-800 dark:hover:text-white"}`}>Discover</button>
                <button onClick={() => setView("saved")} className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${view === "saved" ? "bg-violet-600 text-white shadow" : "text-slate-500 hover:text-slate-800 dark:hover:text-white"}`}>
                  Saved{savedIds.size > 0 && <span className="text-[9px] w-4 h-4 flex items-center justify-center rounded-full bg-white/30">{savedIds.size}</span>}
                </button>
              </div>
              <button onClick={() => setShowFilters(!showFilters)} className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${showFilters ? "bg-violet-600 text-white border-violet-600" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500"}`}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                Filters
              </button>
            </div>
          </div>

          {/* Filter panel */}
          {showFilters && (
            <div className="flex flex-col gap-3 pt-1 border-t border-slate-100 dark:border-slate-800">
              <div className="flex flex-wrap gap-3">
                {/* Niche */}
                <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1 flex-wrap">
                  {NICHES.slice(0, 6).map((n) => (
                    <button key={n} onClick={() => setFilterNiche(n)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterNiche === n ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-800 dark:hover:text-white"}`}>{n.split(" ")[0]}</button>
                  ))}
                </div>
                {/* Tier */}
                <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
                  {TIERS.map((t) => (
                    <button key={t} onClick={() => setFilterTier(t)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all capitalize ${filterTier === t ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-800 dark:hover:text-white"}`}>{t === "All Tiers" ? "All" : t}</button>
                  ))}
                </div>
              </div>
              {/* Sort + Reach Score min */}
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
                  {[{ v: "reachScore", l: "Reach Score" }, { v: "followers", l: "Followers" }, { v: "engagementRate", l: "Engagement" }].map((o) => (
                    <button key={o.v} onClick={() => setSort(o.v as any)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${sort === o.v ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-800 dark:hover:text-white"}`}>{o.l}</button>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-semibold shrink-0">Min Score:</span>
                  <input type="range" min={0} max={90} step={10} value={minReachScore} onChange={(e) => setMinReachScore(Number(e.target.value))} className="w-24 accent-violet-600" />
                  <span className="font-black text-violet-600 dark:text-violet-400 w-6">{minReachScore}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Discover View ── */}
      {view === "discover" && (
        <div>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="relative flex h-12 w-12 items-center justify-center">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-7 w-7 bg-violet-600" />
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 bg-white/60 dark:bg-slate-900/30 border border-dashed border-slate-300 dark:border-slate-700 rounded-3xl">
              <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <p className="text-slate-500 text-sm font-semibold">No influencers found</p>
              <p className="text-slate-400 text-xs mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{filtered.length} creators found</p>
                <p className="text-xs text-slate-400">Sorted by <strong className="text-slate-600 dark:text-slate-300">{sort === "reachScore" ? "Reach Score" : sort === "followers" ? "Followers" : "Engagement"}</strong></p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map((inf) => (
                  <CreatorCard
                    key={inf.id}
                    inf={inf}
                    isSaved={savedIds.has(inf.id)}
                    onSave={handleSave}
                    onInvite={() => setSelectedInfluencer(inf)}
                    onView={() => setSelectedInfluencer(inf)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Saved View ── */}
      {view === "saved" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Saved Creators</h2>
            <span className="text-xs font-bold text-slate-400">{savedIds.size} saved</span>
          </div>
          {savedIds.size === 0 ? (
            <div className="text-center py-14 bg-white/60 dark:bg-slate-900/30 border border-dashed border-slate-300 dark:border-slate-700 rounded-3xl">
              <svg className="w-10 h-10 text-slate-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
              <p className="text-slate-400 text-sm">No saved creators yet. Use the ♡ button on any card.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {savedInfluencers.map((inf) => (
                <CreatorCard
                  key={inf.id}
                  inf={inf}
                  isSaved={true}
                  onSave={handleSave}
                  onInvite={() => setSelectedInfluencer(inf)}
                  onView={() => setSelectedInfluencer(inf)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
