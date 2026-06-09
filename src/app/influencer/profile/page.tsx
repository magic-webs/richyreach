"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../layout-shell";
import { useAuthStore } from "@/store/useAuthStore";
import { api } from "@/lib/api-client";
import { GlassButton } from "@/components/ui/glass-button";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";

import { OverviewTab } from "./_components/overview-tab";
import { AnalyticsTab } from "./_components/analytics-tab";
import { AudienceTab } from "./_components/audience-tab";
import { PortfolioTab } from "./_components/portfolio-tab";
import { SettingsTab } from "./_components/settings-tab";
import { ServicesTab } from "./_components/services-tab";

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
  const [activeTab, setActiveTab] = useState<"overview" | "analytics" | "audience" | "portfolio" | "settings" | "services">("overview");

  // Multi-account state
  const [accounts, setAccounts] = useState<any[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(false);

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
    try { await api("/auth/logout", { method: "POST" }); } catch (_) { }
    useAuthStore.getState().logout();
    router.push("/authentication");
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api(`/influencers/${user.id}`);
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
      const res = await api("/influencers/sync-instagram", { method: "POST" });
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
      const res = await api("/influencers/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instagramHandle,
          pricing: Math.round(parseFloat(pricingUsd) * 100) || 0,
          niche,
          skills: skillsText.split(",").map((s) => s.trim()).filter(Boolean),
          country,
          socialLinks: { twitter, tiktok, youtube },
        }),
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
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8 bg-white/80 dark:bg-slate-900/30 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-xl backdrop-blur-md mx-4 sm:mx-0">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-200 mb-2">Access Restricted</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-md">This page is only for creators. Switch to <strong>Influencer View</strong> using the sandbox controls.</p>
      </div>
    );
  }

  // Removed full-page loading spinner

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "services", label: "Services" },
    { id: "portfolio", label: "Portfolio" },
    // { id: "audience", label: "Audience" },
    { id: "analytics", label: "Analytics" },
    { id: "settings", label: "Settings" },
  ] as const;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10 px-4 sm:px-2 md:px-2 pt-4 sm:pt-6">

      {/* ── Hero Header ── */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-xl bg-gradient-to-br from-slate-50/90 via-white/80 to-slate-100/60 dark:from-slate-900/80 dark:via-slate-900/60 dark:to-[#3F030B]/15 shadow-xl shadow-slate-200/50 dark:shadow-none p-2 sm:p-2 md:p-4">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-48 h-48 bg-violet-500/5 rounded-full blur-[60px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 w-full md:w-auto text-center sm:text-left">
            <img src={user.avatar} alt={user.name} className="w-16 h-16 sm:w-16 sm:h-16 rounded-2xl border-2 border-primary/30 bg-slate-100 dark:bg-slate-800 object-cover shadow-lg mx-auto sm:mx-0" />
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">Welcome, {user.name}</h1>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-0.5">Creator Dashboard</p>
            </div>
          </div>
          <GlassButton type="button" variant="outline" size="sm" onClick={handleLogout} className="w-full md:w-auto text-rose-500 border-rose-500/30 bg-rose-500/5 hover:bg-rose-500/10 justify-center">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Sign Out
          </GlassButton>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 bg-white/60 dark:bg-slate-900/30 border border-slate-200/60 dark:border-slate-800/50 backdrop-blur-md rounded-2xl p-1.5 shadow-lg shadow-slate-100/40 dark:shadow-none overflow-x-auto no-scrollbar scroll-smooth">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`flex-1 min-w-max px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${activeTab === t.id
              ? "bg-primary text-white shadow-md shadow-primary/20"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-6">
          <Skeleton className="h-[300px] w-full rounded-3xl" />
          <Skeleton className="h-[400px] w-full rounded-3xl" />
        </div>
      ) : (
        <>
          {activeTab === "overview" && (
            <OverviewTab accounts={accounts} accountsLoading={accountsLoading} fetchAccounts={fetchAccounts} />
          )}
          {activeTab === "analytics" && (
            <AnalyticsTab profile={profile} />
          )}
          {activeTab === "audience" && (
            <AudienceTab profile={profile} />
          )}
          {activeTab === "portfolio" && (
            <PortfolioTab profile={profile} />
          )}
          {activeTab === "services" && (
            <ServicesTab />
          )}
          {activeTab === "settings" && (
            <SettingsTab
              instagramHandle={instagramHandle} setInstagramHandle={setInstagramHandle}
              niche={niche} setNiche={setNiche}
              pricingUsd={pricingUsd} setPricingUsd={setPricingUsd}
              skillsText={skillsText} setSkillsText={setSkillsText}
              country={country} setCountry={setCountry}
              twitter={twitter} setTwitter={setTwitter}
              tiktok={tiktok} setTiktok={setTiktok}
              youtube={youtube} setYoutube={setYoutube}
              saving={saving}
              saveError={saveError}
              handleSubmit={handleSubmit}
            />
          )}
        </>
      )}

    </div>
  );
}
