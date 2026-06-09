"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../../layout-shell";
import { api } from "@/lib/api-client";
import { ReachScoreRing } from "@/components/ui/reach-score-ring";
import { useQuery, useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

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
  mid: "text-primary bg-primary/10 border-primary/30",
  macro: "text-amber-400 bg-amber-400/10 border-amber-400/30",
  mega: "text-rose-400 bg-rose-400/10 border-rose-400/30",
};

export default function InfluencerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const id = resolvedParams.id;
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const autoFocusInvite = searchParams.get("invite") === "true";

  const [selectedCampaign, setSelectedCampaign] = useState("");

  const { data: influencer, isLoading: loadingInfluencer, error } = useQuery({
    queryKey: ["influencer", id],
    queryFn: async () => {
      const res = await api(`/influencers/${id}`);
      if (!res.ok) throw new Error("Failed to fetch influencer profile");
      const r = await res.json();
      return r.data as Influencer;
    },
    enabled: user?.role === "brand",
  });

  const { data: campaigns = [], isLoading: loadingCampaigns } = useQuery({
    queryKey: ["campaigns"],
    queryFn: async () => {
      const res = await api("/campaigns");
      if (!res.ok) throw new Error("Failed to fetch campaigns");
      const r = await res.json();
      return r.data as Campaign[];
    },
    enabled: user?.role === "brand",
  });

  const inviteMutation = useMutation({
    mutationFn: async (campaignId: string) => {
      // @ts-ignore
      const res = await api(`/influencers/${id}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ influencerId: id, campaignId }),
      });
      if (!res.ok) throw new Error("Failed to invite influencer");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Invited to campaign successfully!");
      router.push("/brand/marketplace");
    },
    onError: () => {
      toast.error("Failed to invite. Please try again.");
    }
  });

  useEffect(() => {
    if (autoFocusInvite) {
      setTimeout(() => {
        const el = document.getElementById("invite-section");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 500);
    }
  }, [autoFocusInvite]);

  if (user.role !== "brand") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8 bg-white/80 dark:bg-slate-900/30 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-xl backdrop-blur-md">
        <p className="text-slate-500 dark:text-slate-400">This page is for brands only.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-10 space-y-6 text-center">
        <p className="text-rose-500 bg-rose-50 dark:bg-rose-950/30 p-4 rounded-xl border border-rose-200 dark:border-rose-800/50">Error: {(error as Error).message}</p>
        <Link href="/brand/marketplace" className="text-primary font-bold hover:underline">← Back to Marketplace</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <Link href="/brand/marketplace" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Back to Marketplace
      </Link>

      {loadingInfluencer ? (
        <div className="space-y-6 animate-pulse">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 flex items-start gap-6">
            <Skeleton className="w-24 h-24 rounded-2xl" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32" />
              <div className="flex gap-2"><Skeleton className="h-6 w-16 rounded-full" /><Skeleton className="h-6 w-24 rounded-full" /></div>
            </div>
            <Skeleton className="w-16 h-16 rounded-full" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
          </div>
          <div className="space-y-4 bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8">
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        </div>
      ) : influencer ? (
        <div className="space-y-8">
          {/* Header Profile Card */}
          <div className="bg-white/80 dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-800/60 backdrop-blur-md rounded-3xl shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
            <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
              <div className="relative shrink-0">
                <img src={influencer.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${influencer.name}`} alt={influencer.name} className="w-24 h-24 md:w-32 md:h-32 rounded-3xl border-4 border-white dark:border-slate-800 object-cover shadow-lg" />
                {influencer.verified && <span className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center border-4 border-white dark:border-slate-900"><svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg></span>}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">{influencer.name}</h1>
                <p className="text-primary font-bold text-lg mt-1">@{influencer.instagramHandle}</p>
                <div className="flex items-center justify-center md:justify-start gap-2 mt-3 flex-wrap">
                  <span className={`text-[11px] font-black uppercase px-3 py-1 rounded-full border ${LEVEL_COLORS[influencer.level]}`}>{influencer.level} Creator</span>
                  <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">{influencer.niche}</span>
                  {influencer.country && <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">📍 {influencer.country}</span>}
                </div>
              </div>
              <div className="flex flex-col items-center gap-2 mt-4 md:mt-0">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reach Score</p>
                <ReachScoreRing score={influencer.reachScore} size={80} strokeWidth={8} />
              </div>
            </div>
          </div>

          {/* Core Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Followers", val: fmt(influencer.followers) },
              { label: "Engagement", val: `${influencer.engagementRate.toFixed(1)}%`, color: "text-emerald-500" },
              { label: "Avg Views", val: fmt(influencer.avgViews), color: "text-primary" },
              { label: "Price/Post", val: `$${(influencer.pricing / 100).toFixed(0)}`, color: "text-rose-500" },
            ].map((s) => (
              <div key={s.label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-center shadow-sm hover:shadow-md transition-shadow">
                <p className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">{s.label}</p>
                <p className={`text-2xl font-black mt-1.5 ${s.color || "text-slate-900 dark:text-white"}`}>{s.val}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Main Column */}
            <div className="md:col-span-2 space-y-8">
              {influencer.bio && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">About the Creator</h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{influencer.bio}</p>
                </div>
              )}

              {/* Reach Score Breakdown */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-6">Reach Score Breakdown</h3>
                <div className="space-y-5">
                  {[
                    { label: "Followers Quality", val: Math.min(100, (Math.log10(influencer.followers + 1) / Math.log10(10_000_000)) * 100), color: "bg-blue-500" },
                    { label: "Engagement Impact", val: Math.min(100, (Math.min(influencer.engagementRate, 10) / 10) * 100), color: "bg-emerald-500" },
                    { label: "Views Consistency", val: Math.min(100, (Math.log10(influencer.avgViews + 1) / Math.log10(1_000_000)) * 100), color: "bg-rose-500" },
                  ].map((f) => (
                    <div key={f.label} className="space-y-1.5">
                      <div className="flex justify-between text-sm"><span className="text-slate-600 dark:text-slate-400 font-semibold">{f.label}</span><span className="font-black text-slate-900 dark:text-white">{Math.round(f.val)} / 100</span></div>
                      <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full ${f.color} rounded-full`} style={{ width: `${f.val}%`, transition: "width 1s ease-out" }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar Column (Invite) */}
            <div className="space-y-6">
              <div id="invite-section" className="bg-gradient-to-b from-primary/10 to-transparent border border-primary/20 rounded-3xl p-6 shadow-sm">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-2">Invite to Campaign</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">Select an active campaign to invite {influencer.name} to collaborate.</p>
                
                {loadingCampaigns ? (
                  <Skeleton className="h-12 w-full rounded-xl" />
                ) : campaigns.length === 0 ? (
                  <div className="text-center p-4 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                    <p className="text-sm text-slate-500 font-semibold mb-2">No active campaigns</p>
                    <Link href="/brand/campaigns/new" className="text-xs font-bold text-primary hover:underline">Create a Campaign</Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <select
                      value={selectedCampaign}
                      onChange={(e) => setSelectedCampaign(e.target.value)}
                      className="w-full p-3.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none"
                    >
                      <option value="">Select a campaign...</option>
                      {campaigns.filter((c) => c.status === "active").map((c) => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => inviteMutation.mutate(selectedCampaign)}
                      disabled={!selectedCampaign || inviteMutation.isPending}
                      className="w-full py-3.5 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary/90 disabled:opacity-50 shadow-md shadow-primary/20 transition-all cursor-pointer"
                    >
                      {inviteMutation.isPending ? "Sending Invite..." : "Send Invitation"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
