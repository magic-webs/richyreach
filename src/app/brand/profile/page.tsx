"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../layout-shell";
import { useAuthStore } from "@/store/useAuthStore";
import { api } from "@/lib/api-client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ReachScoreRing } from "@/components/ui/reach-score-ring";

// ──────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────
function fmt(n: number) { return n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n); }

const CATEGORIES = ["Technology & SaaS", "Fashion & Apparel", "Beauty & Cosmetics", "Travel & Leisure", "Food & Beverage", "Health & Fitness", "Gaming & Esports", "E-Commerce", "Finance", "Education", "Real Estate", "Automotive"];
const BRAND_SIZES = [{ value: "startup", label: "Startup (1-50)" }, { value: "smb", label: "SMB (51-500)" }, { value: "enterprise", label: "Enterprise (500+)" }];
const BUDGET_RANGES = [{ value: "low", label: "Low ($500–$2K/campaign)" }, { value: "mid", label: "Mid ($2K–$10K/campaign)" }, { value: "high", label: "High ($10K–$50K/campaign)" }, { value: "enterprise", label: "Enterprise ($50K+)" }];

function StatCard({ label, value, icon, color = "text-slate-900 dark:text-white" }: { label: string; value: string; icon: React.ReactNode; color?: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white/80 dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-800/60 backdrop-blur-md p-5 flex items-center gap-4 shadow-md shadow-slate-100/40 dark:shadow-none hover:scale-[1.02] transition-all group">
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-primary opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-primary flex items-center justify-center text-primary dark:text-primary">{icon}</div>
      <div>
        <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">{label}</p>
        <p className={`text-xl font-black mt-0.5 ${color}`}>{value}</p>
      </div>
    </div>
  );
}

export default function BrandProfilePage() {
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [savedInfluencers, setSavedInfluencers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "campaigns" | "collaborations" | "analytics" | "saved" | "accounts" | "settings">("overview");

  // Brand sub-accounts state
  const [brandAccounts, setBrandAccounts] = useState<any[]>([]);
  const [brandAccountsLoading, setBrandAccountsLoading] = useState(false);
  const [showBrandAddForm, setShowBrandAddForm] = useState(false);
  const [addingBrandAccount, setAddingBrandAccount] = useState(false);
  const [brandAccError, setBrandAccError] = useState<string | null>(null);
  const [newBrandName, setNewBrandName] = useState("");
  const [newBrandWebsite, setNewBrandWebsite] = useState("");
  const [newBrandCategory, setNewBrandCategory] = useState("General");
  const [newBrandDescription, setNewBrandDescription] = useState("");
  const [newBrandInstagram, setNewBrandInstagram] = useState("");
  const [newBrandSize, setNewBrandSize] = useState("smb");
  const [newBrandBudget, setNewBrandBudget] = useState("mid");

  // Form state
  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");
  const [category, setCategory] = useState("Technology & SaaS");
  const [description, setDescription] = useState("");
  const [logo, setLogo] = useState("");
  const [instagramPage, setInstagramPage] = useState("");
  const [brandSize, setBrandSize] = useState("smb");
  const [budgetRange, setBudgetRange] = useState("mid");
  const [twitter, setTwitter] = useState("");
  const [linkedin, setLinkedin] = useState("");

  const handleLogout = async () => {
    try { await api("/auth/logout", { method: "POST" }); } catch (_) { }
    useAuthStore.getState().logout();
    router.push("/authentication");
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api("/brands/profile");
      if (res.ok) {
        const result = await res.json();
        if (result.success && result.data) {
          const d = result.data as any;
          setProfile(d);
          setCompanyName(d.companyName || "");
          setWebsite(d.website || "");
          setCategory(d.category || "Technology & SaaS");
          setDescription(d.description || "");
          setLogo(d.logo || "");
          setInstagramPage(d.instagramPage || "");
          setBrandSize(d.brandSize || "smb");
          setBudgetRange(d.budgetRange || "mid");
          const sl = d.socialLinks ? JSON.parse(d.socialLinks) : {};
          setTwitter(sl.twitter || "");
          setLinkedin(sl.linkedin || "");
          updateUser({ companyName: d.companyName, avatar: d.logo || user.avatar });
        }
      }
    } catch (err) {
      console.error("Failed to load brand profile", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const res = await api("/campaigns");
      if (res.ok) {
        const r = await res.json();
        if (r.success && r.data) setCampaigns(r.data as any[]);
      }
    } catch (_) { }
  };

  const fetchSaved = async () => {
    try {
      const res = await api("/brands/saved-influencers");
      if (res.ok) {
        const r = await res.json() as any;
        if (r.success && r.data) setSavedInfluencers(r.data as any[]);
      }
    } catch (_) { }
  };

  useEffect(() => {
    if (user.role === "brand") {
      fetchProfile();
      fetchCampaigns();
      fetchSaved();
      fetchBrandAccounts();
    }
    // eslint-disable-next-line
  }, [user.role, user.id]);

  const fetchBrandAccounts = async () => {
    setBrandAccountsLoading(true);
    try {
      const res = await api("/brands/accounts");
      const json = await res.json() as any;
      if (json.success) setBrandAccounts(json.data || []);
    } catch (err) {
      console.error("Failed to load brand accounts", err);
    } finally {
      setBrandAccountsLoading(false);
    }
  };

  const handleAddBrandAccount = async () => {
    if (!newBrandName.trim()) { setBrandAccError("Company name is required"); return; }
    setBrandAccError(null);
    setAddingBrandAccount(true);
    try {
      const res = await api("/brands/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: newBrandName.trim(),
          website: newBrandWebsite.trim(),
          category: newBrandCategory,
          description: newBrandDescription || null,
          instagramPage: newBrandInstagram || null,
          brandSize: newBrandSize,
          budgetRange: newBrandBudget,
        }),
      });
      const json = await res.json() as any;
      if (json.success) {
        setShowBrandAddForm(false);
        setNewBrandName(""); setNewBrandWebsite(""); setNewBrandCategory("General"); setNewBrandDescription(""); setNewBrandInstagram(""); setNewBrandSize("smb"); setNewBrandBudget("mid");
        fetchBrandAccounts();
      } else {
        setBrandAccError(json.error || "Failed to add brand account");
      }
    } catch (err: any) {
      setBrandAccError(err?.message || "Network error");
    } finally {
      setAddingBrandAccount(false);
    }
  };

  const handleDeleteBrandAccount = async (id: string) => {
    if (!confirm("Remove this brand account?")) return;
    try {
      const res = await api(`/brands/accounts/${id}`, { method: "DELETE" });
      const json = await res.json() as any;
      if (json.success) fetchBrandAccounts();
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!website) return;
    try {
      setSaving(true);
      const res = await api("/brands/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          website,
          category,
          description: description || null,
          logo: logo || null,
        }),
      });
      if (res.ok) {
        const result = await res.json();
        if (result.success) {
          setProfile(result.data);
          updateUser({ companyName: (result.data as any).companyName, avatar: (result.data as any).logo || user.avatar });
          setActiveTab("overview");
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (user.role !== "brand") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8 bg-white/80 dark:bg-slate-900/30 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-xl backdrop-blur-md">
        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-200 mb-2">Access Restricted</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-md">This page is for brands. Switch to <strong>Brand View</strong> in the sandbox controls.</p>
      </div>
    );
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="relative flex h-12 w-12 items-center justify-center">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
        <span className="relative inline-flex rounded-full h-7 w-7 bg-primary" />
      </div>
    </div>
  );

  const activeCampaigns = campaigns.filter((c) => c.status === "active");
  const completedCampaigns = campaigns.filter((c) => c.status === "completed");
  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "campaigns", label: "Campaigns" },
    { id: "collaborations", label: "Collabs" },
    { id: "analytics", label: "Analytics" },
    { id: "saved", label: "Saved" },
    { id: "accounts", label: `Brand Accounts (${brandAccounts.length})` },
    { id: "settings", label: "Settings" },
  ] as const;

  const budgetColor = (budget: number) => budget >= 1_000_000 ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" : budget >= 200_000 ? "text-amber-500 bg-amber-500/10 border-amber-500/20" : "text-slate-500 bg-slate-500/10 border-slate-500/20";

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10">

      {/* ── Hero Header ── */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-xl bg-gradient-to-br from-white/90 via-primary to-slate-50/80 dark:from-slate-900/80 dark:via-primary dark:to-slate-900/60 shadow-xl shadow-slate-200/50 dark:shadow-none p-6 md:p-8">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-52 h-52 bg-primary/80 rounded-full blur-[60px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="relative">
              <img
                src={logo || `https://api.dicebear.com/7.x/initials/svg?seed=${companyName || "Brand"}`}
                alt={companyName || "Brand"}
                className="w-20 h-20 rounded-2xl border-2 border-primary bg-white dark:bg-slate-800 p-1.5 object-contain shadow-lg"
              />
              {profile?.verified && (
                <span className="absolute -bottom-1.5 -right-1.5 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow">
                  <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                </span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {profile ? profile.companyName : "Register your Brand"}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">{user.name} · Brand Partner</p>
              {profile?.category && (
                <span className="inline-block mt-2 text-xs font-semibold text-primary dark:text-primary bg-primary px-2.5 py-0.5 rounded-full border border-primary">{profile.category}</span>
              )}
              {website && (
                <a href={website} target="_blank" rel="noreferrer" className="flex items-center gap-1 mt-1 text-xs text-primary hover:text-primary transition-colors">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  {website.replace(/https?:\/\//, "").split("/")[0]}
                </a>
              )}
            </div>
          </div>

          {/* Quick stats */}
          <div className="flex items-center gap-3 flex-wrap">
            {[
              { label: "Active Campaigns", val: activeCampaigns.length },
              { label: "Completed", val: completedCampaigns.length },
              { label: "Saved Creators", val: savedInfluencers.length },
            ].map((s) => (
              <div key={s.label} className="px-4 py-2.5 rounded-2xl bg-white/70 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50 backdrop-blur-sm text-center min-w-[80px]">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{s.label}</p>
                <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{s.val}</p>
              </div>
            ))}
            <button onClick={handleLogout} className="px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 hover:border-rose-500/50 text-rose-500 transition-all flex items-center gap-2 cursor-pointer">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 bg-white/60 dark:bg-slate-900/30 border border-slate-200/60 dark:border-slate-800/50 backdrop-blur-md rounded-2xl p-1.5 shadow-lg overflow-x-auto">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} className={`flex-1 min-w-max px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === t.id ? "bg-primary text-white shadow-md shadow-primary" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ══ OVERVIEW ══ */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {!profile ? (
            <div className="text-center py-16 bg-white/60 dark:bg-slate-900/30 border border-dashed border-slate-300 dark:border-slate-700 rounded-3xl">
              <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              </div>
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-1">Register your Brand</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">Go to Settings to set up your brand profile and start running campaigns.</p>
              <button onClick={() => setActiveTab("settings")} className="bg-primary text-white font-bold px-5 py-2.5 rounded-xl text-sm shadow-lg shadow-primary hover:shadow-primary transition-all">Go to Settings →</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Brand identity card */}
              <div className="md:col-span-1 bg-white/80 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 backdrop-blur-md shadow-lg dark:shadow-none space-y-5">
                <div className="text-center">
                  <img src={logo || `https://api.dicebear.com/7.x/initials/svg?seed=${companyName}`} alt="Brand" className="w-20 h-20 rounded-2xl mx-auto border border-slate-200 dark:border-slate-700 p-2 bg-white dark:bg-slate-800 object-contain shadow-md" />
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-3">{companyName}</h3>
                  <span className="inline-block text-[10px] font-bold text-primary dark:text-primary bg-primary px-2.5 py-0.5 mt-1.5 rounded-full border border-primary">{category}</span>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-3 max-w-xs mx-auto">{description || "No description provided."}</p>
                </div>
                <div className="space-y-2.5 text-xs border-t border-slate-100 dark:border-slate-800 pt-4">
                  {[
                    { label: "Brand Size", val: BRAND_SIZES.find((b) => b.value === brandSize)?.label || "SMB" },
                    { label: "Budget Range", val: BUDGET_RANGES.find((b) => b.value === budgetRange)?.label || "Mid" },
                    { label: "Verification", val: profile.verified ? "Verified ✓" : "Pending" },
                  ].map((r) => (
                    <div key={r.label} className="flex justify-between items-center">
                      <span className="font-semibold text-slate-500">{r.label}</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{r.val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="md:col-span-2 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <StatCard label="Active Campaigns" value={activeCampaigns.length.toString()} icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>} color="text-primary dark:text-primary" />
                  <StatCard label="Saved Influencers" value={savedInfluencers.length.toString()} icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>} color="text-rose-500 dark:text-rose-400" />
                </div>
                {/* Recent campaigns preview */}
                {campaigns.slice(0, 3).map((c) => (
                  <div key={c.id} className="bg-white/80 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-4 backdrop-blur-md shadow-md dark:shadow-none flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{c.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{c.campaignType} · {new Date(c.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border ${budgetColor(c.budget)}`}>${fmt(c.budget / 100)}</span>
                      <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${c.status === "active" ? "text-emerald-600 bg-emerald-500/10" : c.status === "completed" ? "text-blue-500 bg-blue-500/10" : "text-slate-400 bg-slate-100 dark:bg-slate-800"}`}>{c.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══ CAMPAIGNS ══ */}
      {activeTab === "campaigns" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Active Campaigns</h2>
            <span className="text-xs font-bold text-slate-400">{activeCampaigns.length} active</span>
          </div>
          {activeCampaigns.length === 0 ? (
            <div className="text-center py-14 bg-white/60 dark:bg-slate-900/30 border border-dashed border-slate-300 dark:border-slate-700 rounded-3xl">
              <p className="text-slate-400 text-sm">No active campaigns. Create one from the Campaigns page.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeCampaigns.map((c) => (
                <div key={c.id} className="bg-white/80 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-5 backdrop-blur-md shadow-md dark:shadow-none space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{c.title}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-0.5">{c.campaignType}</p>
                    </div>
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border shrink-0 ${budgetColor(c.budget)}`}>${fmt(c.budget / 100)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Expected Reach: <strong className="text-slate-700 dark:text-slate-300">{fmt(c.expectedReach)}</strong></span>
                    <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full"><div className="h-full bg-primary rounded-full" style={{ width: "40%" }} /></div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══ COLLABORATIONS ══ */}
      {activeTab === "collaborations" && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Previous Collaborations</h2>
          {completedCampaigns.length === 0 ? (
            <div className="text-center py-14 bg-white/60 dark:bg-slate-900/30 border border-dashed border-slate-300 dark:border-slate-700 rounded-3xl">
              <p className="text-slate-400 text-sm">No completed campaigns yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {completedCampaigns.map((c) => (
                <div key={c.id} className="bg-white/80 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-4 backdrop-blur-md shadow-md dark:shadow-none flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 dark:text-white text-sm truncate">{c.title}</p>
                    <p className="text-xs text-slate-400">{c.campaignType} · Completed · ${fmt(c.budget / 100)}</p>
                  </div>
                  <span className="text-[10px] font-bold text-blue-500 bg-blue-500/10 px-2.5 py-1 rounded-lg">Completed</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══ ANALYTICS ══ */}
      {activeTab === "analytics" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { label: "Total Budget Invested", val: `$${fmt(campaigns.reduce((s, c) => s + (c.status === "completed" ? c.budget : 0), 0) / 100)}` },
            { label: "Active Campaign Reach", val: fmt(activeCampaigns.reduce((s, c) => s + c.expectedReach, 0)) },
            { label: "Campaign Success Rate", val: campaigns.length > 0 ? `${Math.round((completedCampaigns.length / campaigns.length) * 100)}%` : "N/A" },
          ].map((m) => (
            <div key={m.label} className="bg-white/80 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 backdrop-blur-md shadow-lg dark:shadow-none text-center">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{m.label}</p>
              <p className="text-3xl font-black text-primary dark:text-primary mt-2">{m.val}</p>
            </div>
          ))}
          <div className="md:col-span-3 bg-white/80 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 backdrop-blur-md shadow-lg dark:shadow-none">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4">Campaign Budget Distribution</p>
            {campaigns.length === 0 ? <p className="text-slate-400 text-sm text-center py-6">No campaigns yet.</p> : (
              <div className="space-y-3">
                {campaigns.slice(0, 5).map((c) => (
                  <div key={c.id} className="flex items-center gap-3 text-xs">
                    <span className="w-32 truncate font-semibold text-slate-600 dark:text-slate-300">{c.title}</span>
                    <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(100, (c.budget / (Math.max(...campaigns.map((x: any) => x.budget)) || 1)) * 100)}%` }} />
                    </div>
                    <span className="font-bold text-slate-600 dark:text-slate-300 w-16 text-right">${fmt(c.budget / 100)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ SAVED INFLUENCERS ══ */}
      {activeTab === "saved" && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Saved Influencers</h2>
          {savedInfluencers.length === 0 ? (
            <div className="text-center py-14 bg-white/60 dark:bg-slate-900/30 border border-dashed border-slate-300 dark:border-slate-700 rounded-3xl">
              <p className="text-slate-400 text-sm">No saved creators yet. Browse the Marketplace to discover talent.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedInfluencers.map((inf) => (
                <div key={inf.savedId} className="bg-white/80 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-5 backdrop-blur-md shadow-md dark:shadow-none space-y-3">
                  <div className="flex items-center gap-3">
                    <img src={inf.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${inf.name}`} alt={inf.name} className="w-12 h-12 rounded-xl border border-slate-200 dark:border-slate-700" />
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white text-sm">{inf.name}</p>
                      <p className="text-[10px] text-primary font-semibold">@{inf.instagramHandle}</p>
                    </div>
                    <div className="ml-auto"><ReachScoreRing score={inf.reachScore || 0} size={40} strokeWidth={4} /></div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-2"><p className="text-slate-400 font-bold uppercase">Followers</p><p className="font-black text-slate-800 dark:text-slate-200 text-sm mt-0.5">{inf.followers >= 1000 ? `${(inf.followers / 1000).toFixed(0)}K` : inf.followers}</p></div>
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-2"><p className="text-slate-400 font-bold uppercase">ER</p><p className="font-black text-emerald-500 text-sm mt-0.5">{inf.engagementRate}%</p></div>
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-2"><p className="text-slate-400 font-bold uppercase">Niche</p><p className="font-black text-slate-800 dark:text-slate-200 text-[9px] mt-0.5 truncate">{inf.niche?.split(" ")[0]}</p></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══ SETTINGS ══ */}
      {activeTab === "settings" && (
        <div className="bg-white/80 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 md:p-8 backdrop-blur-md shadow-lg dark:shadow-none">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-6">Brand Settings</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="website" className="text-xs font-bold uppercase text-slate-600 dark:text-slate-300">Website URL</Label>
              <Input id="website" placeholder="https://example.com" value={website} onChange={(e) => setWebsite(e.target.value)} className="bg-white dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 rounded-xl focus:border-primary" required />
              <p className="text-[10px] text-slate-400">On save, metadata is auto-scraped from your website.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="companyName" className="text-xs font-bold uppercase text-slate-600 dark:text-slate-300">Company Name</Label>
                <Input id="companyName" placeholder="My Company Inc." value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="bg-white dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 rounded-xl focus:border-primary" required />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-600 dark:text-slate-300">Category</Label>
                <Select value={category} onValueChange={(v) => v && setCategory(v)}>
                  <SelectTrigger className="bg-white dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-600 dark:text-slate-300">Brand Size</Label>
                <Select value={brandSize} onValueChange={(v) => v && setBrandSize(v)}>
                  <SelectTrigger className="bg-white dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    {BRAND_SIZES.map((b) => <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-600 dark:text-slate-300">Budget Range</Label>
                <Select value={budgetRange} onValueChange={(v) => v && setBudgetRange(v)}>
                  <SelectTrigger className="bg-white dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    {BUDGET_RANGES.map((b) => <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="logo" className="text-xs font-bold uppercase text-slate-600 dark:text-slate-300">Logo URL (Optional)</Label>
              <Input id="logo" placeholder="https://example.com/logo.png" value={logo} onChange={(e) => setLogo(e.target.value)} className="bg-white dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-xs font-bold uppercase text-slate-600 dark:text-slate-300">About Brand</Label>
              <textarea id="description" rows={4} placeholder="Tell creators about your brand..." value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-3.5 text-sm bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none placeholder-slate-400 resize-none" />
            </div>
            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase text-slate-600 dark:text-slate-300">Social Links</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input placeholder="Instagram page @handle" value={instagramPage} onChange={(e) => setInstagramPage(e.target.value)} className="bg-white dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 rounded-xl" />
                <Input placeholder="Twitter @handle" value={twitter} onChange={(e) => setTwitter(e.target.value)} className="bg-white dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 rounded-xl" />
                <Input placeholder="LinkedIn company URL" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} className="bg-white dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 rounded-xl" />
              </div>
            </div>
            <button type="submit" disabled={saving} className="w-full bg-primary hover:from-primary hover:to-primary disabled:opacity-60 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-primary transition-all flex items-center justify-center gap-2 cursor-pointer">
              {saving ? (
                <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>Scraping & Saving...</>
              ) : (
                <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>Scrape Website & Save</>
              )}
            </button>
          </form>
        </div>
      )}
      {/* ══ BRAND ACCOUNTS ══ */}
      {activeTab === "accounts" && (
        <div className="space-y-6">
          <div className="bg-white/80 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 md:p-8 backdrop-blur-md shadow-lg dark:shadow-none">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Brand Accounts</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Add multiple brand profiles. Each requires admin verification before use in campaigns.</p>
              </div>
              <button
                onClick={() => { setShowBrandAddForm(!showBrandAddForm); setBrandAccError(null); }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary transition-colors shadow cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                Add Brand
              </button>
            </div>

            {/* Add Form */}
            {showBrandAddForm && (
              <div className="mb-6 p-5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Add New Brand Profile</h3>
                {brandAccError && <p className="text-xs text-rose-500 bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-xl">{brandAccError}</p>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-500">Company Name *</label>
                    <input placeholder="Acme Corp" value={newBrandName} onChange={e => setNewBrandName(e.target.value)} className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-primary" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-500">Website</label>
                    <input placeholder="https://acme.com" value={newBrandWebsite} onChange={e => setNewBrandWebsite(e.target.value)} className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-primary" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-500">Category</label>
                    <Select value={newBrandCategory} onValueChange={(val) => val && setNewBrandCategory(val)}>
                      <SelectTrigger className="w-full px-3 py-2 h-[38px] text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-primary">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["Fashion", "Technology", "Food & Beverage", "Health & Wellness", "Sports", "Beauty", "Travel", "Entertainment", "Finance", "Education", "Retail", "General"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-500">Instagram Page</label>
                    <input placeholder="@handle" value={newBrandInstagram} onChange={e => setNewBrandInstagram(e.target.value)} className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-primary" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-500">Brand Size</label>
                    <Select value={newBrandSize} onValueChange={(val) => val && setNewBrandSize(val)}>
                      <SelectTrigger className="w-full px-3 py-2 h-[38px] text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-primary">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="startup">Startup (1-50)</SelectItem>
                        <SelectItem value="smb">SMB (51-500)</SelectItem>
                        <SelectItem value="enterprise">Enterprise (500+)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-500">Budget Range</label>
                    <Select value={newBrandBudget} onValueChange={(val) => val && setNewBrandBudget(val)}>
                      <SelectTrigger className="w-full px-3 py-2 h-[38px] text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-primary">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low ($500–$2K)</SelectItem>
                        <SelectItem value="mid">Mid ($2K–$10K)</SelectItem>
                        <SelectItem value="high">High ($10K–$50K)</SelectItem>
                        <SelectItem value="enterprise">Enterprise ($50K+)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-500">Description</label>
                    <textarea rows={2} placeholder="Brief brand description" value={newBrandDescription} onChange={e => setNewBrandDescription(e.target.value)} className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-primary resize-none" />
                  </div>
                </div>
                <div className="flex gap-3 pt-1">
                  <button onClick={handleAddBrandAccount} disabled={addingBrandAccount} className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary disabled:opacity-50 transition-colors cursor-pointer shadow">
                    {addingBrandAccount ? "Submitting..." : "Submit for Verification"}
                  </button>
                  <button onClick={() => { setShowBrandAddForm(false); setBrandAccError(null); }} className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Accounts List */}
            {brandAccountsLoading ? (
              <div className="py-12 flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
              </div>
            ) : brandAccounts.length === 0 ? (
              <div className="text-center py-14 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl">
                <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm">No brand accounts added yet. Click <strong>Add Brand</strong> to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {brandAccounts.map((acc: any) => (
                  <div key={acc.id} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white text-sm font-black shadow-md shrink-0">
                      {acc.companyName?.[0]?.toUpperCase() || "B"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-slate-900 dark:text-white text-sm">{acc.companyName}</p>
                        <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${acc.status === "verified" ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" :
                          acc.status === "rejected" ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30" :
                            "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
                          }`}>{acc.status}</span>
                      </div>
                      <div className="flex gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
                        <span className="capitalize">{acc.category}</span>
                        <span className="capitalize">{acc.brandSize}</span>
                        {acc.instagramPage && <span>@{acc.instagramPage}</span>}
                      </div>
                      {acc.verificationNote && (
                        <p className="text-[10px] text-rose-500 mt-1">Admin note: {acc.verificationNote}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteBrandAccount(acc.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer shrink-0"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              <span className="font-bold text-slate-700 dark:text-slate-300">ℹ️ How it works: </span>
              After submitting, an admin will verify your brand account. Once approved, you can select it as the posting brand when creating campaigns.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
