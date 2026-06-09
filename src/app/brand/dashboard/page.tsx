"use client";

import React from "react";
import { useAuth } from "../../layout-shell";
import { api } from "@/lib/api-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

export default function BrandDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ["brandDashboard", user.id],
    queryFn: async () => {
      const res = await api("/brands/dashboard");
      if (!res.ok) throw new Error("Failed to fetch dashboard");
      const result = await res.json();
      if (!result.success) throw new Error(result.error as string || "Failed to fetch dashboard");
      return result.data;
    },
    enabled: user.role === "brand" && !!user.id,
  });

  const handleCampaignClick = (campaign: any) => {
    router.push(`/brand/campaigns/${campaign.id}`);
  };

  const handleCreateChat = async (influencerId: string) => {
    try {
      const res = await api("/chat/room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ influencerId }),
      });
      if (res.ok) {
        const result = await res.json();
        if (result.success) {
          router.push("/chat");
        }
      }
    } catch (err) {
      console.error("Failed to create or enter chat room", err);
    }
  };

  if (user.role !== "brand") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6 bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800/80 rounded-3xl backdrop-blur-md">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-300 mb-2">Access Restricted</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mb-6">
          This dashboard is only accessible to brands.
        </p>
      </div>
    );
  }

  // Handle case where profile isn't onboarded yet
  const needsOnboarding = !user.companyName;

  if (needsOnboarding) {
    return (
      <div className="max-w-md mx-auto text-center py-12 px-6 bg-white/90 dark:bg-slate-900/60 border border-primary/20 dark:border-primary/30 rounded-3xl backdrop-blur-md shadow-xl space-y-6">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto border border-primary/20">
          <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Complete Brand Onboarding</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
            Welcome! To launch influencer campaigns, track applicants, and manage escrows, sync your company website metadata first.
          </p>
        </div>
        <Link
          href="/brand/profile"
          className="inline-block bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-6 rounded-xl shadow-lg transition-all text-sm"
        >
          Setup Brand Profile & Sync Website
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64 bg-slate-200 dark:bg-slate-800" />
            <Skeleton className="h-4 w-96 bg-slate-200 dark:bg-slate-800" />
          </div>
          <Skeleton className="h-12 w-48 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Skeleton className="h-32 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <Skeleton className="h-32 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <Skeleton className="h-32 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <Skeleton className="h-32 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>
        <Skeleton className="h-[400px] bg-slate-200 dark:bg-slate-800 rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6 text-destructive">
        <h2 className="text-xl font-bold mb-2">Error Loading Dashboard</h2>
        <p className="max-w-md mb-6">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {user.companyName} Workspace
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Review active collaborations, campaign proposals, and incoming creator applications.
          </p>
        </div>
        <Link
          href="/brand/campaigns/create"
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-5 rounded-xl shadow-lg shadow-primary/20 text-xs transition-all flex items-center gap-2 cursor-pointer"
        >
          <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Launch New Campaign
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white/80 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 backdrop-blur-md relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl"></div>
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Budget Invested
            </CardDescription>
            <CardTitle className="text-3xl font-black text-primary">
              ₹{((dashboardData?.totalSpend || 0) / 100).toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">Escrow commitments for completed contracts</p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 backdrop-blur-md relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl"></div>
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Active Campaigns
            </CardDescription>
            <CardTitle className="text-3xl font-black text-primary">
              {dashboardData?.activeCampaigns || 0}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">Campaigns currently accepting applications</p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 backdrop-blur-md relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl"></div>
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Aggregated Expected Reach
            </CardDescription>
            <CardTitle className="text-3xl font-black text-primary">
              {(dashboardData?.totalReach || 0).toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">Expected impressions on all campaign tiers</p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 backdrop-blur-md relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl"></div>
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Marketplace Applicants
            </CardDescription>
            <CardTitle className="text-3xl font-black text-primary">
              {dashboardData?.influencerStats?.totalApplicants || 0}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">Creators waiting for proposal review</p>
          </CardContent>
        </Card>
      </div>

      {/* Campaign List Table */}
      <Card className="bg-white/90 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800/80 backdrop-blur-md shadow-lg overflow-hidden">
        <CardHeader className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800/80">
          <CardTitle className="text-lg text-slate-900 dark:text-white">Campaign Management Console</CardTitle>
          <CardDescription className="text-slate-500">Click on any campaign row to review creator proposals and send invitations</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-950/30">
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-6">Campaign Title</th>
                  <th className="py-4 px-6">Type</th>
                  <th className="py-4 px-6 text-right">Budget</th>
                  <th className="py-4 px-6 text-right">Reach Target</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6">Launched On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {(!dashboardData?.campaigns || dashboardData.campaigns.length === 0) ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16 text-slate-500 text-sm bg-white dark:bg-slate-900/30">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                        </div>
                        <p>No campaigns launched yet. Click "Launch New Campaign" above to get started!</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  dashboardData.campaigns.map((camp: any) => (
                    <tr
                      key={camp.id}
                      onClick={() => handleCampaignClick(camp)}
                      className="group hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors text-xs bg-white dark:bg-slate-900/20"
                    >
                      <td className="py-4 px-6 font-bold text-slate-900 dark:text-white group-hover:text-primary dark:group-hover:text-primary transition-colors">
                        {camp.title}
                      </td>
                      <td className="py-4 px-6 text-slate-600 dark:text-slate-300 capitalize">{camp.campaignType}</td>
                      <td className="py-4 px-6 text-right text-primary font-bold">
                        ₹{((camp.budget || 0) / 100).toLocaleString()}
                      </td>
                      <td className="py-4 px-6 text-right text-slate-500 dark:text-slate-400 font-semibold">
                        {(camp.expectedReach || 0).toLocaleString()}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                          {camp.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-500">
                        {new Date(camp.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
