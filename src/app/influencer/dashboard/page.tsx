"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../layout-shell";
import { api } from "@/lib/api-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassPurpleButton } from "@/components/ui/glass-purple-button";

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

  // Full page loader removed to use skeleton loading states

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
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Creator Dashboard</h1>
        <p className="text-slate-650 dark:text-slate-400 text-sm mt-1">
          Review your earnings, ongoing collaborations, and campaign applications.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card className="bg-white/85 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md shadow-lg shadow-slate-100/50 dark:shadow-none relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl"></div>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Earnings
            </CardDescription>
            {dashboardLoading ? (
               <div className="h-9 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mt-1" />
            ) : (
              <CardTitle className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                ₹{((dashboardData?.totalEarnings || 0) / 100).toLocaleString()}
              </CardTitle>
            )}
          </CardHeader>
          <CardContent>
            <p className="text-[10px] text-slate-500">Cleared payouts securely via escrow contracts</p>
          </CardContent>
        </Card>

        <Card className="bg-white/85 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md shadow-lg shadow-slate-100/50 dark:shadow-none relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl"></div>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Active Campaigns
            </CardDescription>
            {dashboardLoading ? (
               <div className="h-9 w-12 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mt-1" />
            ) : (
              <CardTitle className="text-3xl font-black text-primary">
                {dashboardData?.activeCampaigns || 0}
              </CardTitle>
            )}
          </CardHeader>
          <CardContent>
            <p className="text-[10px] text-slate-500">Collaborations currently in execution stage</p>
          </CardContent>
        </Card>

        <Card className="bg-white/85 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md shadow-lg shadow-slate-100/50 dark:shadow-none relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#7E1523]/5 rounded-full blur-2xl"></div>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Pending Proposals
            </CardDescription>
            {dashboardLoading ? (
               <div className="h-9 w-12 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mt-1" />
            ) : (
              <CardTitle className="text-3xl font-black text-[#7E1523] dark:text-rose-350">
                {dashboardData?.pendingApplications || 0}
              </CardTitle>
            )}
          </CardHeader>
          <CardContent>
            <p className="text-[10px] text-slate-500">Applications currently under brand review</p>
          </CardContent>
        </Card>

        <Card className="bg-white/85 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md shadow-lg shadow-slate-100/50 dark:shadow-none relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl"></div>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Expected Reach
            </CardDescription>
            {dashboardLoading ? (
               <div className="h-9 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mt-1" />
            ) : (
              <CardTitle className="text-3xl font-black text-rose-600 dark:text-rose-400">
                {dashboardData?.analyticsOverview?.totalReach?.toLocaleString() || "45,000"}
              </CardTitle>
            )}
          </CardHeader>
          <CardContent>
            <p className="text-[10px] text-slate-500">Aggregated views count on active campaigns</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Panel layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Campaign Applications & Invites */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white/85 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md shadow-lg shadow-slate-100/50 dark:shadow-none">
            <CardHeader className="border-b border-slate-150 dark:border-slate-800/40 pb-4">
              <CardTitle className="text-lg text-slate-900 dark:text-white">Collaboration Center</CardTitle>
              <CardDescription>Track applications, invites, and contract statuses</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Tabs defaultValue="invites" className="space-y-6">
                <TabsList className="bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-850 p-1.5 rounded-xl">
                  <TabsTrigger value="invites" className="rounded-lg text-xs font-semibold px-4 py-2 hover:text-white">
                    Campaign Invites ({campaignsData.invites?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="applications" className="rounded-lg text-xs font-semibold px-4 py-2 hover:text-white">
                    Sent Proposals ({campaignsData.applications?.length || 0})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="invites" className="space-y-4">
                  {campaignsLoading ? (
                    Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/45 border border-slate-150 dark:border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-2 w-full">
                          <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                          <div className="h-5 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                          <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                        </div>
                        <div className="h-10 w-24 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse mt-4 sm:mt-0" />
                      </div>
                    ))
                  ) : campaignsData.invites?.length === 0 ? (
                    <div className="text-center py-10 text-slate-500 text-sm">
                      No campaign invitations received yet.
                    </div>
                  ) : (
                    campaignsData.invites.map((invite: any) => (
                      <div
                        key={invite.inviteId}
                        className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/45 border border-slate-150 dark:border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <span className="text-[10px] font-extrabold uppercase text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                            INBOUND INVITE
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1.5">{invite.campaignTitle}</h4>
                          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1">{invite.campaignDescription}</p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0 mt-4 sm:mt-0 w-full sm:w-auto">
                          <div className="text-left sm:text-right sm:mr-3">
                            <p className="text-[10px] font-bold text-slate-500">BUDGET OFFER</p>
                            <p className="text-sm font-extrabold text-primary">
                              ₹{((invite.budget || 0) / 100).toLocaleString()}
                            </p>
                          </div>
                          <GlassButton
                            href="/chat"
                            variant="primary"
                            size="sm"
                            className="w-full sm:w-auto text-center justify-center"
                          >
                            Negotiate
                          </GlassButton>
                        </div>
                      </div>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="applications" className="space-y-4">
                  {campaignsLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/45 border border-slate-150 dark:border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-2 w-full">
                          <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                          <div className="h-5 w-56 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                          <div className="h-4 w-2/3 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                        </div>
                        <div className="h-10 w-20 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse mt-4 sm:mt-0" />
                      </div>
                    ))
                  ) : campaignsData.applications?.length === 0 ? (
                    <div className="text-center py-10 text-slate-500 text-sm">
                      You haven't applied to any campaigns yet. Browse the marketplace to apply!
                    </div>
                  ) : (
                    campaignsData.applications.map((app: any) => (
                      <div
                        key={app.applicationId}
                        className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/45 border border-slate-150 dark:border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-extrabold uppercase text-slate-500">Proposal</span>
                            <span
                              className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                                app.status === "accepted"
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                  : app.status === "pending"
                                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                                  : "bg-rose-500/10 text-rose-650 dark:text-rose-400 border-rose-500/20"
                              }`}
                            >
                              {app.status}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1.5">{app.campaignTitle}</h4>
                          <p className="text-xs text-slate-600 dark:text-slate-400 italic">"Proposal: {app.proposal}"</p>
                        </div>
                        <div className="text-left sm:text-right mt-4 sm:mt-0 sm:shrink-0 flex sm:block items-center justify-between">
                          <div>
                            <p className="text-[10px] font-bold text-slate-500">BUDGET</p>
                            <p className="text-sm font-extrabold text-slate-700 dark:text-slate-200">
                              ₹{((app.budget || 0) / 100).toLocaleString()}
                            </p>
                          </div>
                          {app.status === "accepted" && (
                            <Link
                              href="/chat"
                              className="inline-block sm:mt-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1.5 px-4 rounded-lg text-[10px]"
                            >
                              Open Chat
                            </Link>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info - Platform tools & guidelines */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-white/85 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md shadow-lg shadow-slate-100/50 dark:shadow-none relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl"></div>
            <CardHeader>
              <CardTitle className="text-base text-slate-900 dark:text-slate-200">Social Insights</CardTitle>
              <CardDescription>Metrics powered by AI analytics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {dashboardLoading ? (
                <>
                  <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
                  <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
                </>
              ) : (
                <>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/65 border border-slate-150 dark:border-slate-850 space-y-3.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-semibold uppercase">Engagement Rate</span>
                      <span className="text-primary font-extrabold">
                        {dashboardData?.analyticsOverview?.averageEngagement || 4.8}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-900 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-primary h-full rounded-full" style={{ width: "48%" }}></div>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold">
                      <span>Industry Avg: 3.2%</span>
                      <span className="text-primary">+1.6% Outperforming</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/65 border border-slate-150 dark:border-slate-855 space-y-3.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-semibold uppercase">Monthly Impressions</span>
                      <span className="text-[#7E1523] dark:text-rose-300 font-extrabold">
                        {dashboardData?.analyticsOverview?.monthlyViews?.toLocaleString() || "45,000"}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-900 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#7E1523] h-full rounded-full" style={{ width: "65%" }}></div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white/85 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md shadow-lg shadow-slate-100/50 dark:shadow-none">
            <CardHeader>
              <CardTitle className="text-base text-slate-900 dark:text-slate-200">Creator Resources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3.5 text-xs text-slate-600 dark:text-slate-400">
              <Link
                href="/calculators"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 hover:bg-slate-100 dark:hover:bg-slate-950 border border-slate-150 dark:border-slate-850 hover:border-slate-300 dark:hover:border-slate-700/60 font-semibold text-slate-700 dark:text-slate-300 transition-all"
              >
                <span>Earnings & Reach Calculator</span>
                <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>

              <Link
                href="/marketplace"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 hover:bg-slate-100 dark:hover:bg-slate-950 border border-slate-150 dark:border-slate-855 hover:border-slate-300 dark:hover:border-slate-700/60 font-semibold text-slate-700 dark:text-slate-300 transition-all"
              >
                <span>Browse Live Campaigns</span>
                <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
