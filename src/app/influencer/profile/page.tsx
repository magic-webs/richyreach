"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../layout-shell";
import { api } from "@/lib/api-client";
import { ReachScoreRing } from "@/components/ui/reach-score-ring";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassPurpleButton } from "@/components/ui/glass-purple-button";
import { authClient } from "@/lib/auth-client";

// ──────────────────────────────────────────────────────────────
// Small helpers
// ──────────────────────────────────────────────────────────────
function fmt(n: number) { return n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n); }
function fmtPct(n: number) { return `${n.toFixed(1)}%`; }

const LEVEL_COLORS: Record<string, string> = {
  nano: "text-slate-400 bg-slate-400/10 border-slate-400/30",
  micro: "text-blue-400 bg-blue-400/10 border-blue-400/30",
  mid: "text-violet-400 bg-violet-400/10 border-violet-400/30",
  macro: "text-amber-400 bg-amber-400/10 border-amber-400/30",
  mega: "text-rose-400 bg-rose-400/10 border-rose-400/30",
};

const NICHES = ["Fashion & Styling", "Tech & Gadgets", "Fitness & Health", "Travel & Adventure", "Food & Culinary", "Gaming", "Beauty & Cosmetics", "Lifestyle", "Finance", "Education"];
const COUNTRIES = ["India", "United States", "United Kingdom", "UAE", "Australia", "Canada", "Germany", "Brazil"];

// ──────────────────────────────────────────────────────────────
// Animated stat card
// ──────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color = "text-slate-900 dark:text-white", icon }: { label: string; value: string; sub?: string; color?: string; icon: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white/80 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800/60 backdrop-blur-md p-5 flex items-center gap-4 shadow-lg shadow-slate-100/40 dark:shadow-none transition-all hover:scale-[1.02] hover:shadow-xl group">
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/3 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary">
        {icon}
      </div>
      <div>
        <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">{label}</p>
        <p className={`text-xl font-black mt-0.5 ${color}`}>{value}</p>
        {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Score factor bar
// ──────────────────────────────────────────────────────────────
function ScoreBar({ label, value, color = "bg-primary" }: { label: string; value: number; color?: string }) {
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

// ──────────────────────────────────────────────────────────────
// Sparkline chart (pure SVG)
// ──────────────────────────────────────────────────────────────
function Sparkline({ data, color = "#7E1523", height = 40 }: { data: number[]; color?: string; height?: number }) {
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

// ──────────────────────────────────────────────────────────────
// Main Page
// ──────────────────────────────────────────────────────────────
export default function InfluencerProfilePage() {
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "analytics" | "audience" | "portfolio" | "accounts" | "settings">("overview");

  // Multi-account state
  const [accounts, setAccounts] = useState<any[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [addingAccount, setAddingAccount] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAccHandle, setNewAccHandle] = useState("");
  const [newAccFollowers, setNewAccFollowers] = useState("");
  const [newAccEngagement, setNewAccEngagement] = useState("");
  const [newAccAvgViews, setNewAccAvgViews] = useState("");
  const [newAccNiche, setNewAccNiche] = useState("Lifestyle");
  const [newAccPricing, setNewAccPricing] = useState("");
  const [newAccCountry, setNewAccCountry] = useState("");
  const [newAccBio, setNewAccBio] = useState("");
  const [accountsError, setAccountsError] = useState<string | null>(null);

  // Form state
  const [instagramHandle, setInstagramHandle] = useState("");
  const [niche, setNiche] = useState("Tech & Gadgets");
  const [pricingUsd, setPricingUsd] = useState("150");
  const [skillsText, setSkillsText] = useState("");
  const [country, setCountry] = useState("India");
  const [twitter, setTwitter] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [youtube, setYoutube] = useState("");

  const handleLogout = async () => {
    try { await fetch("/api/auth/logout", { method: "POST" }); } catch (_) {}
    localStorage.removeItem("reelio_session_token");
    localStorage.removeItem("reelio_mock_user");
    router.push("/authentication");
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.api.influencers[":id"].$get({ param: { id: user.id } });
      if (res.ok) {
        const result = await res.json();
        if (result.success && result.data) {
          const d = result.data as any;
          setProfile(d);
          setInstagramHandle(d.instagramHandle || "");
          setNiche(d.niche || "Tech & Gadgets");
          setPricingUsd((d.pricing / 100).toString());
          setSkillsText(d.skills ? (d.skills as string[]).join(", ") : "");
          setCountry(d.country || "India");
          setTwitter(d.socialLinks?.twitter || "");
          setTiktok(d.socialLinks?.tiktok || "");
          setYoutube(d.socialLinks?.youtube || "");
          updateUser({ instagramHandle: d.instagramHandle, avatar: d.avatar || user.avatar });
        }
      }
    } catch (err) {
      console.error("Failed to load influencer profile", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAccounts = async () => {
    setAccountsLoading(true);
    try {
      const res = await fetch("/api/influencers/accounts", { credentials: "include" });
      const json = await res.json() as any;
      if (json.success) setAccounts(json.data || []);
    } catch (err) {
      console.error("Failed to load accounts", err);
    } finally {
      setAccountsLoading(false);
    }
  };

  const handleAddAccount = async () => {
    if (!newAccHandle.trim()) { setAccountsError("Instagram handle is required"); return; }
    setAccountsError(null);
    setAddingAccount(true);
    try {
      const res = await fetch("/api/influencers/accounts", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instagramHandle: newAccHandle.trim(),
          followers: parseInt(newAccFollowers) || 0,
          engagementRate: parseFloat(newAccEngagement) || 0,
          avgViews: parseInt(newAccAvgViews) || 0,
          niche: newAccNiche,
          pricing: parseFloat(newAccPricing) || 0,
          country: newAccCountry || null,
          bio: newAccBio || null,
        }),
      });
      const json = await res.json() as any;
      if (json.success) {
        setShowAddForm(false);
        setNewAccHandle(""); setNewAccFollowers(""); setNewAccEngagement(""); setNewAccAvgViews(""); setNewAccNiche("Lifestyle"); setNewAccPricing(""); setNewAccCountry(""); setNewAccBio("");
        fetchAccounts();
      } else {
        setAccountsError(json.error || "Failed to add account");
      }
    } catch (err: any) {
      setAccountsError(err?.message || "Network error");
    } finally {
      setAddingAccount(false);
    }
  };

  const handleDeleteAccount = async (id: string) => {
    if (!confirm("Remove this Instagram account?")) return;
    try {
      const res = await fetch(`/api/influencers/accounts/${id}`, { method: "DELETE", credentials: "include" });
      const json = await res.json() as any;
      if (json.success) fetchAccounts();
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (user.role === "influencer") {
      fetchProfile();
      fetchAccounts();
    }
    // eslint-disable-next-line
  }, [user.role, user.id]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (url.searchParams.get("instagram_sync") === "success") {
        url.searchParams.delete("instagram_sync");
        window.history.replaceState({}, "", url.toString());
        syncInstagramData();
      }
    }
    // eslint-disable-next-line
  }, []);

  const syncInstagramData = async () => {
    setLoading(true);
    setSaveError(null);
    try {
      const res = await api.api.influencers["sync-instagram"].$post();
      const result = await res.json();
      if (res.ok && result.success && result.data) {
        const d = result.data as any;
        setProfile(d);
        setInstagramHandle(d.instagramHandle || "");
        updateUser({ instagramHandle: d.instagramHandle, avatar: d.avatar || user.avatar });
        setActiveTab("overview");
      } else {
        setSaveError((result as any).error || (result as any).message || "Failed to sync Instagram profile.");
      }
    } catch (err: any) {
      console.error(err);
      setSaveError(err?.message || "Failed to sync Instagram profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleInstagramConnect = async () => {
    try {
      setSaving(true);
      setSaveError(null);
      await authClient.signIn.social({
        provider: "instagram",
        callbackURL: "/influencer/profile?instagram_sync=success"
      });
    } catch (err: any) {
      console.error(err);
      setSaveError(err?.message || "Failed to initiate Instagram login.");
      setSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instagramHandle) return;
    setSaveError(null);
    try {
      setSaving(true);
      const res = await api.api.influencers.profile.$post({
        json: {
          instagramHandle,
          pricing: Math.round(parseFloat(pricingUsd) * 100) || 0,
          niche,
          skills: skillsText.split(",").map((s) => s.trim()).filter(Boolean),
          country,
          socialLinks: { twitter, tiktok, youtube },
        },
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setProfile(result.data);
        updateUser({ instagramHandle: (result.data as any).instagramHandle, avatar: (result.data as any).avatar });
        setActiveTab("overview");
      } else {
        setSaveError((result as any).error || (result as any).message || "Sync failed. Check console for details.");
      }
    } catch (err: any) {
      console.error(err);
      setSaveError(err?.message || "Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };


  if (user.role !== "influencer") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8 bg-white/80 dark:bg-slate-900/30 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-xl backdrop-blur-md">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-200 mb-2">Access Restricted</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-md">This page is only for creators. Switch to <strong>Influencer View</strong> using the sandbox controls.</p>
      </div>
    );
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="relative flex h-12 w-12 items-center justify-center">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/75 opacity-75" />
        <span className="relative inline-flex rounded-full h-7 w-7 bg-primary" />
      </div>
    </div>
  );

  const analytics = {
    followers: [0, 0, 0, 0, 0, 0],
    engagement: [0, 0, 0, 0, 0, 0],
    views: [0, 0, 0, 0, 0, 0],
    months: ["Dec", "Jan", "Feb", "Mar", "Apr", "May"],
  };
  const breakdown = profile?.reachScoreBreakdown || {};

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "analytics", label: "Analytics" },
    { id: "audience", label: "Audience" },
    { id: "portfolio", label: "Portfolio" },
    { id: "settings", label: "Settings" },
  ] as const;

  const allAccounts = accounts.map(a => ({ ...a, isPrimary: false }));

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10">

      {/* ── Hero Header ── */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-xl bg-gradient-to-br from-slate-50/90 via-white/80 to-slate-100/60 dark:from-slate-900/80 dark:via-slate-900/60 dark:to-[#3F030B]/15 shadow-xl shadow-slate-200/50 dark:shadow-none p-6 md:p-8">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-48 h-48 bg-violet-500/5 rounded-full blur-[60px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div className="flex items-center gap-5">
            <img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-2xl border-2 border-primary/30 bg-slate-100 dark:bg-slate-800 object-cover shadow-lg" />
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Welcome, {user.name}</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Creator Dashboard</p>
            </div>
          </div>
          <GlassButton type="button" variant="outline" size="sm" onClick={handleLogout} className="text-rose-500 border-rose-500/30 bg-rose-500/5 hover:bg-rose-500/10 self-start md:self-auto">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Sign Out
          </GlassButton>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 bg-white/60 dark:bg-slate-900/30 border border-slate-200/60 dark:border-slate-800/50 backdrop-blur-md rounded-2xl p-1.5 shadow-lg shadow-slate-100/40 dark:shadow-none overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex-1 min-w-max px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === t.id
                ? "bg-primary text-white shadow-md shadow-primary/20"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════
          TAB: OVERVIEW
      ══════════════════════════════════════════ */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="bg-white/80 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 md:p-8 backdrop-blur-md shadow-lg shadow-slate-100/40 dark:shadow-none">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">All Profiles</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Manage your connected Instagram profiles and niches.</p>
              </div>
              <button
                onClick={() => { setShowAddForm(!showAddForm); setAccountsError(null); }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:opacity-90 transition-opacity shadow cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                Add Account
              </button>
            </div>

            {/* Add Form */}
            {showAddForm && (
              <div className="mb-6 p-5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Add New Instagram Account</h3>
                {accountsError && (
                  <p className="text-xs text-rose-500 bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-xl">{accountsError}</p>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-500">Instagram Handle *</label>
                    <div className="relative flex items-center"><span className="absolute left-3 text-slate-400 font-bold">@</span>
                      <input placeholder="username" value={newAccHandle} onChange={e => setNewAccHandle(e.target.value)} className="w-full pl-8 pr-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-primary" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-500">Niche</label>
                    <Select value={newAccNiche} onValueChange={(v) => v && setNewAccNiche(v)}>
                      <SelectTrigger className="w-full h-10 px-3 text-sm bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white">
                        <SelectValue placeholder="Select Niche" />
                      </SelectTrigger>
                      <SelectContent>
                        {NICHES.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-500">Followers</label>
                    <input type="number" placeholder="e.g. 50000" value={newAccFollowers} onChange={e => setNewAccFollowers(e.target.value)} className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-primary" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-500">Engagement Rate (%)</label>
                    <input type="number" step="0.1" placeholder="e.g. 3.5" value={newAccEngagement} onChange={e => setNewAccEngagement(e.target.value)} className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-primary" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-500">Avg Views / Reel</label>
                    <input type="number" placeholder="e.g. 25000" value={newAccAvgViews} onChange={e => setNewAccAvgViews(e.target.value)} className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-primary" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-500">Country</label>
                    <input placeholder="e.g. India" value={newAccCountry} onChange={e => setNewAccCountry(e.target.value)} className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-primary" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-500">Short Bio (optional)</label>
                    <input placeholder="Tell brands about this account" value={newAccBio} onChange={e => setNewAccBio(e.target.value)} className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-primary" />
                  </div>
                </div>
                <div className="flex gap-3 pt-1">
                  <button onClick={handleAddAccount} disabled={addingAccount} className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer shadow">
                    {addingAccount ? "Submitting..." : "Submit for Verification"}
                  </button>
                  <button onClick={() => { setShowAddForm(false); setAccountsError(null); }} className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Accounts List */}
            {accountsLoading ? (
              <div className="py-12 flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
              </div>
            ) : allAccounts.length === 0 ? (
              <div className="text-center py-14 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm">No profiles found.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {allAccounts.map((acc: any) => (
                  <div key={acc.id} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-yellow-400 via-rose-500 to-purple-600 flex items-center justify-center text-white text-sm font-black shadow-md shrink-0">
                      IG
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-slate-900 dark:text-white text-sm">@{acc.instagramHandle}</p>
                        {acc.isPrimary && (
                          <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border bg-primary/10 text-primary border-primary/20">Primary Profile</span>
                        )}
                        <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                          acc.status === "verified" || acc.verified ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" :
                          acc.status === "rejected" ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30" :
                          "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
                        }`}>{acc.status || (acc.verified ? "verified" : "unverified")}</span>
                      </div>
                      <div className="flex gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
                        <span>{(acc.followers || 0) >= 1000 ? `${((acc.followers || 0) / 1000).toFixed(1)}K` : acc.followers || 0} followers</span>
                        <span>{(acc.engagementRate || 0).toFixed(1)}% eng.</span>
                        <span className="capitalize">{acc.niche}</span>
                      </div>
                    </div>
                    {!acc.isPrimary && (
                      <button
                        onClick={() => handleDeleteAccount(acc.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer shrink-0"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              <span className="font-bold text-slate-700 dark:text-slate-300">ℹ️ How it works: </span>
              After submitting, an admin will review your account details. Once approved, you can select this account when applying to campaigns.
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          TAB: ANALYTICS
      ══════════════════════════════════════════ */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          {!profile ? (
            <div className="text-center py-16 text-slate-400">Connect your Instagram to see analytics.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                { label: "Follower Growth", data: analytics.followers, color: "#3b82f6", unit: "" },
                { label: "Engagement Rate", data: analytics.engagement, color: "#10b981", unit: "%" },
                { label: "Avg Reel Views", data: analytics.views, color: "#7E1523", unit: "" },
              ].map((chart) => (
                <div key={chart.label} className="bg-white/80 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-5 backdrop-blur-md shadow-lg shadow-slate-100/40 dark:shadow-none">
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{chart.label}</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white mb-3">
                    {chart.unit}{typeof chart.data[chart.data.length - 1] === "number" ? (chart.unit === "%" ? chart.data[chart.data.length - 1].toFixed(1) : fmt(chart.data[chart.data.length - 1])) : "–"}
                    {chart.unit}
                  </p>
                  <Sparkline data={chart.data} color={chart.color} height={48} />
                  {/* Month labels */}
                  <div className="flex justify-between mt-1">
                    {analytics.months.map((m) => <span key={m} className="text-[9px] text-slate-400">{m}</span>)}
                  </div>
                </div>
              ))}
              {/* Additional metrics */}
              <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Posts/Week", val: (profile.postingFrequency || 0).toFixed(1) },
                  { label: "Monthly Growth", val: `+${(profile.growthRate || 0).toFixed(1)}%` },
                  { label: "Avg Likes", val: fmt(profile.avgLikes || 0) },
                ].map((m) => (
                  <div key={m.label} className="bg-white/80 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-4 backdrop-blur-md shadow-md shadow-slate-100/40 dark:shadow-none text-center">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{m.label}</p>
                    <p className="text-xl font-black text-slate-900 dark:text-white mt-1">{m.val}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════
          TAB: AUDIENCE
      ══════════════════════════════════════════ */}
      {activeTab === "audience" && (
        <div className="space-y-6">
          {!profile ? (
            <div className="text-center py-16 text-slate-400">Connect your Instagram to see audience data.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Age distribution */}
              <div className="bg-white/80 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 backdrop-blur-md shadow-lg shadow-slate-100/40 dark:shadow-none space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Age Distribution</h3>
                {[["13-17", 8], ["18-24", 34], ["25-34", 31], ["35-44", 17], ["45+", 10]].map(([age, pct]) => (
                  <div key={age as string} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-600 dark:text-slate-300">{age}</span>
                      <span className="font-black text-slate-700 dark:text-slate-200">{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary to-rose-400 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Gender split */}
              <div className="bg-white/80 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 backdrop-blur-md shadow-lg shadow-slate-100/40 dark:shadow-none space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Gender Split</h3>
                <div className="flex gap-2 mt-2">
                  <div className="flex-1 h-3 rounded-full bg-blue-400" style={{ flex: 42 }} />
                  <div className="flex-1 h-3 rounded-full bg-pink-400" style={{ flex: 55 }} />
                  <div className="flex-1 h-3 rounded-full bg-slate-300" style={{ flex: 3 }} />
                </div>
                {[["Male", 42, "bg-blue-400 text-blue-500"], ["Female", 55, "bg-pink-400 text-pink-500"], ["Other", 3, "bg-slate-300 text-slate-500"]].map(([g, p, cls]) => (
                  <div key={g as string} className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2"><span className={`w-2.5 h-2.5 rounded-full ${(cls as string).split(" ")[0]}`} /><span className="font-semibold text-slate-600 dark:text-slate-300">{g}</span></div>
                    <span className={`font-black ${(cls as string).split(" ")[1]}`}>{p}%</span>
                  </div>
                ))}
              </div>

              {/* Top countries */}
              <div className="bg-white/80 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 backdrop-blur-md shadow-lg shadow-slate-100/40 dark:shadow-none space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Top Countries</h3>
                {[["🇮🇳 India", 38], ["🇺🇸 USA", 22], ["🇬🇧 UK", 12], ["🇦🇪 UAE", 9], ["🇦🇺 Australia", 7]].map(([c, p]) => (
                  <div key={c as string} className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-600 dark:text-slate-300">{c}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full"><div className="h-full bg-primary rounded-full" style={{ width: `${p}%` }} /></div>
                      <span className="font-black text-slate-700 dark:text-slate-200 w-8 text-right">{p}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════
          TAB: PORTFOLIO
      ══════════════════════════════════════════ */}
      {activeTab === "portfolio" && (
        <div>
          {!profile || !profile.portfolio?.length ? (
            <div className="text-center py-16 bg-white/60 dark:bg-slate-900/30 border border-dashed border-slate-300 dark:border-slate-700 rounded-3xl">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm">No portfolio items yet. Sync your Instagram to populate.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {profile.portfolio.map((post: any) => (
                <div key={post.id} className="group relative overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/50 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                  <div className="aspect-square overflow-hidden">
                    <img src={post.mediaUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  {post.mediaType === "video" && (
                    <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1">
                      <svg className="w-3 h-3 text-rose-400" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" /></svg>
                      <span className="text-[9px] font-bold text-white">REEL</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                    <p className="text-xs font-bold text-white line-clamp-2">{post.title || "Post"}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════
          TAB: SETTINGS
      ══════════════════════════════════════════ */}
      {activeTab === "settings" && (
        <div className="bg-white/80 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 md:p-8 backdrop-blur-md shadow-lg shadow-slate-100/40 dark:shadow-none">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-6">Edit Creator Profile</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Removed Instagram Link & Sync */}
            <div className="hidden">
              <Label className="text-xs font-bold uppercase text-slate-600 dark:text-slate-300">Instagram Account</Label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-slate-400 font-bold select-none">@</span>
                <Input id="handle" placeholder="username" value={instagramHandle} onChange={(e) => setInstagramHandle(e.target.value)} className="pl-9 bg-white dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary/20" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Niche */}
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-600 dark:text-slate-300">Content Niche</Label>
                <Select value={niche} onValueChange={(v) => v && setNiche(v)}>
                  <SelectTrigger className="bg-white dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    {NICHES.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {/* Country */}
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-600 dark:text-slate-300">Country</Label>
                <Select value={country} onValueChange={(v) => v && setCountry(v)}>
                  <SelectTrigger className="bg-white dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    {COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Skills */}
            <div className="space-y-2">
              <Label htmlFor="skills" className="text-xs font-bold uppercase text-slate-600 dark:text-slate-300">Skills (comma-separated)</Label>
              <Input id="skills" placeholder="Short-form video, Product photography, Storyboarding" value={skillsText} onChange={(e) => setSkillsText(e.target.value)} className="bg-white dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 rounded-xl focus:border-primary" />
            </div>

            {/* Social links */}
            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase text-slate-600 dark:text-slate-300">Social Links (optional)</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative flex items-center"><span className="absolute left-4 text-[10px] font-black text-sky-500 select-none">𝕏</span><Input placeholder="Twitter username" value={twitter} onChange={(e) => setTwitter(e.target.value)} className="pl-9 bg-white dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 rounded-xl" /></div>
                <div className="relative flex items-center"><span className="absolute left-4 text-[10px] font-black text-pink-500 select-none">TK</span><Input placeholder="TikTok username" value={tiktok} onChange={(e) => setTiktok(e.target.value)} className="pl-9 bg-white dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 rounded-xl" /></div>
                <div className="relative flex items-center"><span className="absolute left-4 text-[10px] font-black text-rose-500 select-none">YT</span><Input placeholder="YouTube channel" value={youtube} onChange={(e) => setYoutube(e.target.value)} className="pl-9 bg-white dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 rounded-xl" /></div>
              </div>
            </div>

            <GlassPurpleButton type="submit" disabled={saving} className="w-full">
              {saving ? (
                <><svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>Saving...</>
              ) : (
                <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89H17.75" /></svg>Save Profile</>
              )}
            </GlassPurpleButton>

            {saveError && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400">
                <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
                <p className="text-xs font-semibold leading-snug">{saveError}</p>
              </div>
            )}
          </form>

        </div>
      )}

    </div>
  );
}
