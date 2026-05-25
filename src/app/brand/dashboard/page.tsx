"use client";

import React, { useEffect, useState } from "react";
import { useMockAuth } from "../../layout-shell";
import { api } from "@/lib/api-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function BrandDashboardPage() {
  const { user } = useMockAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [campaignDetails, setCampaignDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.api.brands.dashboard.$get();
      if (res.ok) {
        const result = await res.json();
        if (result.success) {
          setDashboardData(result.data);
        }
      }
    } catch (err) {
      console.error("Failed to load brand dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCampaignClick = async (campaign: any) => {
    setSelectedCampaign(campaign);
    try {
      setLoadingDetails(true);
      const res = await api.api.campaigns[":id"].$get({
        param: { id: campaign.id },
      });
      if (res.ok) {
        const result = await res.json();
        if (result.success) {
          setCampaignDetails(result.data);
        }
      }
    } catch (error) {
      console.error("Failed to load campaign applications", error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCreateChat = async (influencerId: string) => {
    try {
      const res = await api.api.chat.room.$post({
        json: { influencerId },
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

  useEffect(() => {
    if (user.role === "brand") {
      fetchDashboard();
    }
  }, [user.role, user.id]);

  if (user.role !== "brand") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6 bg-slate-900/30 border border-slate-800/80 rounded-3xl backdrop-blur-md">
        <h2 className="text-xl font-bold text-slate-300 mb-2">Access Restricted</h2>
        <p className="text-slate-400 max-w-md mb-6">
          This dashboard is only accessible to brands. Please use the sandbox controls in the sidebar to switch your role to **Brand View**.
        </p>
        <div className="animate-bounce text-purple-400">
          <svg className="w-8 h-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="relative flex h-10 w-10 items-center justify-center">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-6 w-6 bg-purple-600"></span>
        </div>
      </div>
    );
  }

  // Handle case where profile isn't onboarded yet
  const needsOnboarding = !user.companyName;

  if (needsOnboarding) {
    return (
      <div className="max-w-md mx-auto text-center py-12 px-6 bg-slate-900/35 border border-slate-800/80 rounded-3xl backdrop-blur-md space-y-6">
        <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto border border-purple-500/30">
          <svg className="w-8 h-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white">Complete Brand Onboarding</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Welcome! To launch influencer campaigns, track applicants, and manage escrows, sync your company website metadata first.
          </p>
        </div>
        <Link
          href="/brand/profile"
          className="inline-block bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-purple-600/25 transition-all text-sm"
        >
          Setup Brand Profile & Sync Website
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">{user.companyName} Workspace</h1>
          <p className="text-slate-400 text-sm mt-1">
            Review active collaborations, campaign proposals, and incoming creator applications.
          </p>
        </div>
        <Link
          href="/brand/campaigns/create"
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3 px-5 rounded-xl shadow-lg shadow-purple-600/20 text-xs transition-all flex items-center gap-2 cursor-pointer"
        >
          <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Launch New Campaign
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-slate-900/40 border-slate-800/80 backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl"></div>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Budget Invested
            </CardDescription>
            <CardTitle className="text-3xl font-black text-purple-400">
              ${((dashboardData?.totalSpend || 0) / 100).toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[10px] text-slate-500">Escrow commitments for completed contracts</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/40 border-slate-800/80 backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl"></div>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Active Campaigns
            </CardDescription>
            <CardTitle className="text-3xl font-black text-indigo-400">
              {dashboardData?.activeCampaigns || 0}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[10px] text-slate-500">Campaigns currently accepting applications</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/40 border-slate-800/80 backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl"></div>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Aggregated Expected Reach
            </CardDescription>
            <CardTitle className="text-3xl font-black text-rose-400">
              {(dashboardData?.totalReach || 0).toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[10px] text-slate-500">Expected impressions on all campaign tiers</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/40 border-slate-800/80 backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl"></div>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Marketplace Applicants
            </CardDescription>
            <CardTitle className="text-3xl font-black text-emerald-400">
              {dashboardData?.influencerStats?.totalApplicants || 0}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[10px] text-slate-500">Creators waiting for proposal review</p>
          </CardContent>
        </Card>
      </div>

      {/* Campaign List Table */}
      <Card className="bg-slate-900/40 border-slate-800/80 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-lg text-white">Campaign Management Console</CardTitle>
          <CardDescription>Click on any campaign row to review creator proposals and send invitations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Campaign Title</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4 text-right">Budget</th>
                  <th className="py-3.5 px-4 text-right">Reach Target</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4">Launched On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-y-slate-800/40">
                {(!dashboardData?.campaigns || dashboardData.campaigns.length === 0) ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-500 text-sm">
                      No campaigns launched yet. Click "Launch New Campaign" above to get started!
                    </td>
                  </tr>
                ) : (
                  dashboardData.campaigns.map((camp: any) => (
                    <tr
                      key={camp.id}
                      onClick={() => handleCampaignClick(camp)}
                      className="group hover:bg-slate-800/35 cursor-pointer transition-colors text-xs"
                    >
                      <td className="py-4 px-4 font-bold text-white group-hover:text-purple-400 transition-colors">
                        {camp.title}
                      </td>
                      <td className="py-4 px-4 text-slate-300 capitalize">{camp.campaignType}</td>
                      <td className="py-4 px-4 text-right text-indigo-300 font-bold">
                        ${((camp.budget || 0) / 100).toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-right text-slate-400 font-semibold">
                        {(camp.expectedReach || 0).toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {camp.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-500">
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

      {/* Campaign Details and Application Dialog */}
      <Dialog open={selectedCampaign !== null} onOpenChange={(open) => !open && setSelectedCampaign(null)}>
        <DialogContent className="bg-slate-900 border border-slate-800 text-slate-100 max-w-3xl rounded-3xl p-6 shadow-2xl backdrop-blur-2xl">
          <DialogHeader>
            <div className="flex justify-between items-start">
              <div>
                <DialogTitle className="text-xl font-bold text-white">
                  {selectedCampaign?.title}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-400 mt-1 capitalize">
                  {selectedCampaign?.campaignType} Campaign • Expected Reach: {selectedCampaign?.expectedReach?.toLocaleString()}
                </DialogDescription>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-500">TOTAL BUDGET</p>
                <p className="text-lg font-black text-indigo-400">
                  ${((selectedCampaign?.budget || 0) / 100).toLocaleString()}
                </p>
              </div>
            </div>
          </DialogHeader>

          <Tabs defaultValue="applicants" className="mt-4 space-y-4">
            <TabsList className="bg-slate-950/80 border border-slate-850 p-1 rounded-xl">
              <TabsTrigger value="applicants" className="rounded-lg text-xs font-semibold px-4 py-2 hover:text-white">
                Applications ({campaignDetails?.applications?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="invites" className="rounded-lg text-xs font-semibold px-4 py-2 hover:text-white">
                Invited Creators ({campaignDetails?.invites?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="details" className="rounded-lg text-xs font-semibold px-4 py-2 hover:text-white">
                Campaign Brief
              </TabsTrigger>
            </TabsList>

            <TabsContent value="applicants" className="space-y-4">
              {loadingDetails ? (
                <div className="text-center py-10 text-slate-500 text-sm">Loading applications...</div>
              ) : !campaignDetails?.applications || campaignDetails.applications.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-sm">
                  No applications received for this campaign yet. Keep it public to receive applications!
                </div>
              ) : (
                <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                  {campaignDetails.applications.map((app: any) => (
                    <div
                      key={app.id}
                      className="p-4 rounded-2xl bg-slate-950/50 border border-slate-850 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={app.avatar}
                          alt={app.name}
                          className="w-11 h-11 rounded-xl bg-slate-900 border border-slate-800"
                        />
                        <div>
                          <p className="text-xs font-bold text-white">{app.name}</p>
                          <p className="text-[10px] text-slate-500">@{app.instagramHandle}</p>
                          <div className="flex gap-3 mt-1 text-[9px] text-slate-400 font-bold uppercase">
                            <span>{app.followers?.toLocaleString()} Followers</span>
                            <span>•</span>
                            <span className="text-emerald-400">{app.engagementRate}% Engagement</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 md:px-6">
                        <p className="text-[10px] font-bold text-slate-500">PROPOSAL</p>
                        <p className="text-xs text-slate-300 italic line-clamp-2 mt-0.5">"{app.proposal}"</p>
                      </div>
                      <button
                        onClick={() => handleCreateChat(app.influencerId)}
                        className="bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold py-2 px-3.5 rounded-xl text-xs shadow-md shadow-indigo-600/10 shrink-0 transition-all cursor-pointer"
                      >
                        Accept & Chat
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="invites" className="space-y-4">
              {loadingDetails ? (
                <div className="text-center py-10 text-slate-500 text-sm">Loading invites...</div>
              ) : !campaignDetails?.invites || campaignDetails.invites.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-sm">
                  You haven't invited any creators directly. Go to the marketplace to invite!
                </div>
              ) : (
                <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                  {campaignDetails.invites.map((invite: any) => (
                    <div
                      key={invite.id}
                      className="p-4 rounded-2xl bg-slate-950/50 border border-slate-850 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-white">{invite.name}</p>
                        <p className="text-[10px] text-slate-500">@{invite.instagramHandle}</p>
                      </div>
                      <span className="font-bold uppercase text-[10px] bg-amber-400/10 text-amber-400 px-2.5 py-0.5 rounded-md border border-amber-400/20">
                        {invite.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-850 text-xs space-y-4">
                <div>
                  <h4 className="font-bold text-slate-400 uppercase text-[10px] tracking-wider">Campaign Brief</h4>
                  <p className="text-slate-300 mt-1 leading-relaxed">{selectedCampaign?.description}</p>
                </div>
                {selectedCampaign?.targetAudience && (
                  <div>
                    <h4 className="font-bold text-slate-400 uppercase text-[10px] tracking-wider">Target Audience</h4>
                    <p className="text-slate-300 mt-0.5">{selectedCampaign?.targetAudience}</p>
                  </div>
                )}
                {selectedCampaign?.requirements && (
                  <div>
                    <h4 className="font-bold text-slate-400 uppercase text-[10px] tracking-wider">Requirements</h4>
                    <p className="text-slate-300 mt-0.5">{selectedCampaign?.requirements}</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
