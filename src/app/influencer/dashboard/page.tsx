"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../layout-shell";
import { api } from "@/lib/api-client";
import { GlassPurpleButton } from "@/components/ui/glass-purple-button";

// Components
import { MetricsRow } from "./_components/metrics-row";
import { CollaborationCenter } from "./_components/collaboration-center";
import { SocialInsights } from "./_components/social-insights";
import { CreatorResources } from "./_components/creator-resources";

export default function InfluencerDashboardPage() {
  const { user } = useAuth();

  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ["influencerDashboard"],
    queryFn: async () => {
      const res = await api.api.influencers.dashboard.$get();
      if (!res.ok) throw new Error("Failed to load dashboard");
      const result = await res.json();
      return result.success ? result.data : null;
    },
    enabled: user?.role === "influencer",
  });

  const { data: campaignsData = { applications: [], invites: [] }, isLoading: campaignsLoading } = useQuery({
    queryKey: ["influencerCampaigns"],
    queryFn: async () => {
      const res = await api.api.influencers.campaigns.$get();
      if (!res.ok) throw new Error("Failed to load campaigns");
      const result = await res.json();
      return result.success ? result.data : { applications: [], invites: [] };
    },
    enabled: user?.role === "influencer",
  });

  if (user.role !== "influencer") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6 bg-white/80 dark:bg-slate-900/30 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-xl shadow-slate-100/40 dark:shadow-none backdrop-blur-md">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-200 mb-2">Access Restricted</h2>
        <p className="text-slate-600 dark:text-slate-400 max-w-md mb-6">
          This dashboard is only accessible to creators. Please use the sandbox controls in the sidebar to switch your role to **Influencer View**.
        </p>
        <div className="animate-bounce text-primary">
          <svg className="w-8 h-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </div>
      </div>
    );
  }

  // Handle case where profile isn't onboarded yet
  const needsOnboarding = !user.instagramHandle;

  if (needsOnboarding) {
    return (
      <div className="max-w-md mx-auto text-center py-12 px-6 bg-white/85 dark:bg-slate-900/35 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-xl shadow-slate-100/40 dark:shadow-none backdrop-blur-md space-y-6">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto border border-primary/30">
          <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Complete Profile Onboarding</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
            Welcome to Richy Reach! To access your dashboard, track analytics, and apply for brand campaigns, sync your Instagram creator handle first.
          </p>
        </div>
        <GlassPurpleButton
          href="/influencer/profile"
          className="w-full"
        >
          Setup Profile & Sync Instagram
        </GlassPurpleButton>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 animate-fade-in pb-10">
      {/* Header */}
      <div className="px-1 sm:px-0">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Creator Dashboard</h1>
        <p className="text-slate-650 dark:text-slate-400 text-sm mt-1">
          Review your earnings, ongoing collaborations, and campaign applications.
        </p>
      </div>

      {/* Metrics Row */}
      <MetricsRow dashboardData={dashboardData} dashboardLoading={dashboardLoading} />

      {/* Main Panel layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Campaign Applications & Invites */}
        <div className="lg:col-span-2 flex flex-col">
          <CollaborationCenter campaignsData={campaignsData} campaignsLoading={campaignsLoading} />
        </div>

        {/* Sidebar Info - Platform tools & guidelines */}
        <div className="lg:col-span-1 space-y-6 flex flex-col">
          <SocialInsights dashboardData={dashboardData} dashboardLoading={dashboardLoading} />
          <CreatorResources />
        </div>
      </div>
    </div>
  );
}

