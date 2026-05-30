"use client";

import React, { useState } from "react";
import { useAuth } from "../../../layout-shell";
import { api } from "@/lib/api-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

export default function CampaignDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const id = resolvedParams.id;
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});

  const { data: campaignDetails, isLoading, error } = useQuery({
    queryKey: ["campaignDetails", id],
    queryFn: async () => {
      const res = await api.api.campaigns[":id"].$get({
        param: { id },
      });
      if (!res.ok) throw new Error("Failed to fetch details");
      const result = await res.json();
      if (!result.success) throw new Error(result.error as string || "Failed to fetch details");
      
      // Initialize edit form when data arrives
      setEditForm({
        title: result.data.campaign.title,
        description: result.data.campaign.description,
        targetAudience: result.data.campaign.targetAudience || "",
        requirements: result.data.campaign.requirements || "",
        budget: result.data.campaign.budget / 100, // convert cents to whole INR
        campaignType: result.data.campaign.campaignType,
        status: result.data.campaign.status,
      });

      return result.data;
    },
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: async (updatedData: any) => {
      const budgetCents = Math.round(parseFloat(updatedData.budget) * 100) || 0;
      
      const res = await fetch(`/api/campaigns/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: updatedData.title,
          description: updatedData.description,
          targetAudience: updatedData.targetAudience,
          requirements: updatedData.requirements,
          budget: budgetCents,
          campaignType: updatedData.campaignType,
          status: updatedData.status,
        })
      });

      if (!res.ok) throw new Error("Failed to update campaign");
      const result = (await res.json()) as any;
      if (!result.success) throw new Error(result.error as string || "Failed to update campaign");
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaignDetails", id] });
      setIsEditing(false);
      alert("Campaign updated successfully!");
    },
    onError: (err: any) => {
      alert("Error updating campaign: " + err.message);
    }
  });

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

  const handleSave = () => {
    updateMutation.mutate(editForm);
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-20">
        <div className="space-y-4">
          <Skeleton className="h-4 w-32 bg-slate-200 dark:bg-slate-800" />
          <Skeleton className="h-12 w-96 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>
        <Skeleton className="h-[500px] w-full bg-slate-200 dark:bg-slate-800 rounded-xl" />
      </div>
    );
  }

  if (error || !campaignDetails) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6 text-destructive">
        <h2 className="text-xl font-bold mb-2">Error Loading Campaign</h2>
        <p className="max-w-md mb-6">{error?.message || "Campaign not found"}</p>
        <Link href="/brand/dashboard" className="text-primary hover:underline">Back to Dashboard</Link>
      </div>
    );
  }

  const { campaign, applications, invites } = campaignDetails;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-20">
      <div>
        <Link href="/brand/dashboard" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors font-bold uppercase">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mt-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="inline-block text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                {campaign.status}
              </span>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider capitalize">
                {campaign.campaignType}
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {campaign.title}
            </h1>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Budget</p>
            <p className="text-3xl font-black text-primary mt-1">
              ₹{((campaign.budget || 0) / 100).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <Card className="bg-white/90 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800/80 backdrop-blur-xl shadow-lg">
        <CardContent className="p-6">
          <Tabs defaultValue="details" className="space-y-6">
            <TabsList className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-1.5 rounded-xl inline-flex w-full overflow-x-auto">
              <TabsTrigger value="details" className="flex-1 rounded-lg text-sm font-semibold px-6 py-2.5 hover:text-primary data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm">
                Campaign Brief & Settings
              </TabsTrigger>
              <TabsTrigger value="applicants" className="flex-1 rounded-lg text-sm font-semibold px-6 py-2.5 hover:text-primary data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm">
                Applications <span className="ml-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full text-xs">{applications?.length || 0}</span>
              </TabsTrigger>
              <TabsTrigger value="invites" className="flex-1 rounded-lg text-sm font-semibold px-6 py-2.5 hover:text-primary data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm">
                Invited Creators <span className="ml-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full text-xs">{invites?.length || 0}</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Brief & Settings</h3>
                {!isEditing ? (
                  <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-sm font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    Edit Campaign
                  </button>
                ) : (
                  <div className="flex items-center gap-3">
                    <button onClick={() => {
                      setIsEditing(false);
                      setEditForm({
                        title: campaign.title,
                        description: campaign.description,
                        targetAudience: campaign.targetAudience || "",
                        requirements: campaign.requirements || "",
                        budget: campaign.budget / 100,
                        campaignType: campaign.campaignType,
                        status: campaign.status,
                      });
                    }} className="px-4 py-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-sm font-bold cursor-pointer">
                      Cancel
                    </button>
                    <button onClick={handleSave} disabled={updateMutation.isPending} className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold rounded-lg shadow-sm shadow-primary/20 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2">
                      {updateMutation.isPending ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                )}
              </div>

              {!isEditing ? (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-bold text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider mb-2">Campaign Overview / Hook</h4>
                    <p className="text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">{campaign.description}</p>
                  </div>
                  {campaign.targetAudience && (
                    <div>
                      <h4 className="font-bold text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider mb-2">Target Audience</h4>
                      <p className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap">{campaign.targetAudience}</p>
                    </div>
                  )}
                  {campaign.requirements && (
                    <div>
                      <h4 className="font-bold text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider mb-2">Deliverables & Requirements</h4>
                      <p className="text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">{campaign.requirements}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-950/40 p-6 rounded-2xl border border-primary/10">
                  <div className="md:col-span-2 space-y-2">
                    <Label className="text-primary/80 dark:text-primary/70 text-xs font-bold uppercase tracking-wider">Campaign Title</Label>
                    <Input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700/50" />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-primary/80 dark:text-primary/70 text-xs font-bold uppercase tracking-wider">Budget (INR)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">₹</span>
                      <Input type="number" value={editForm.budget} onChange={(e) => setEditForm({ ...editForm, budget: e.target.value })} className="pl-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700/50" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-primary/80 dark:text-primary/70 text-xs font-bold uppercase tracking-wider">Format</Label>
                    <Select value={editForm.campaignType} onValueChange={(v) => setEditForm({ ...editForm, campaignType: v })}>
                      <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="reel">Instagram Reel</SelectItem>
                        <SelectItem value="story">Instagram Story</SelectItem>
                        <SelectItem value="post">Instagram Image Post</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label className="text-primary/80 dark:text-primary/70 text-xs font-bold uppercase tracking-wider">Status</Label>
                    <Select value={editForm.status} onValueChange={(v) => setEditForm({ ...editForm, status: v })}>
                      <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label className="text-primary/80 dark:text-primary/70 text-xs font-bold uppercase tracking-wider">Campaign Overview</Label>
                    <textarea rows={3} value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} className="w-full p-4 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/50 rounded-xl focus:border-primary focus:ring-1 focus:outline-none resize-none" />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label className="text-primary/80 dark:text-primary/70 text-xs font-bold uppercase tracking-wider">Target Audience</Label>
                    <textarea rows={2} value={editForm.targetAudience} onChange={(e) => setEditForm({ ...editForm, targetAudience: e.target.value })} className="w-full p-4 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/50 rounded-xl focus:border-primary focus:ring-1 focus:outline-none resize-none" />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label className="text-primary/80 dark:text-primary/70 text-xs font-bold uppercase tracking-wider">Deliverables & Requirements</Label>
                    <textarea rows={5} value={editForm.requirements} onChange={(e) => setEditForm({ ...editForm, requirements: e.target.value })} className="w-full p-4 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/50 rounded-xl focus:border-primary focus:ring-1 focus:outline-none resize-y" />
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="applicants" className="space-y-4 animate-fade-in">
              {!applications || applications.length === 0 ? (
                <div className="text-center py-16 text-slate-500 text-sm bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-200 dark:border-slate-800 border-dashed">
                  No applications received for this campaign yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.map((app: any) => (
                    <div key={app.id} className="p-5 rounded-2xl bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-primary/40 transition-colors shadow-sm">
                      <div className="flex items-center gap-4">
                        <img src={app.avatar} alt={app.name} className="w-14 h-14 rounded-full object-cover border border-slate-200 dark:border-slate-800" />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{app.name}</p>
                          <p className="text-xs text-slate-500">@{app.instagramHandle}</p>
                          <div className="flex gap-2 mt-2 text-[10px] font-bold uppercase tracking-wider">
                            <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-400">{app.followers?.toLocaleString()} Followers</span>
                            <span className="bg-primary/10 px-2 py-0.5 rounded text-primary">{app.engagementRate}% Engagement</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 md:px-8">
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">PROPOSAL</p>
                        <p className="text-sm text-slate-700 dark:text-slate-300 italic mt-1 bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-100 dark:border-slate-800/60">"{app.proposal}"</p>
                      </div>
                      <button onClick={() => handleCreateChat(app.influencerId)} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-6 rounded-xl text-sm shadow-sm shadow-primary/20 shrink-0 transition-all cursor-pointer">
                        Accept & Chat
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="invites" className="space-y-4 animate-fade-in">
              {!invites || invites.length === 0 ? (
                <div className="text-center py-16 text-slate-500 text-sm bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-200 dark:border-slate-800 border-dashed">
                  You haven't invited any creators directly. Go to the marketplace to invite!
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {invites.map((invite: any) => (
                    <div key={invite.id} className="p-5 rounded-2xl bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{invite.name}</p>
                        <p className="text-xs text-slate-500 mt-1">@{invite.instagramHandle}</p>
                      </div>
                      <span className="font-bold uppercase tracking-wider text-[10px] bg-amber-100 dark:bg-amber-400/10 text-amber-700 dark:text-amber-400 px-3 py-1.5 rounded-md border border-amber-200 dark:border-amber-400/20">
                        {invite.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
