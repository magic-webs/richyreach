"use client";

import React, { useState } from "react";
import { useAuth } from "../../../layout-shell";
import { api } from "@/lib/api-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, Verified } from "lucide-react";

export default function InfluencerCampaignDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const id = resolvedParams.id;
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [proposal, setProposal] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState("");

  const { data: profile } = useQuery({
    queryKey: ["influencerProfile", user.id],
    queryFn: async () => {
      const res = await api.api.influencers[":id"].$get({ param: { id: user.id } });
      if (!res.ok) throw new Error("Failed to fetch profile");
      const result = await res.json();
      return result.data as any;
    },
    enabled: !!user.id,
  });

  const { data: accounts } = useQuery({
    queryKey: ["influencerAccounts"],
    queryFn: async () => {
      const res = await api.api.influencers.accounts.$get();
      if (!res.ok) throw new Error("Failed to fetch accounts");
      const result = await res.json();
      return result.data as any[];
    },
    enabled: !!user.id,
  });

  const { data: campaignData, isLoading, error } = useQuery({
    queryKey: ["influencerCampaign", id],
    queryFn: async () => {
      // Fetch from the marketplace specific route if available, or a generic get endpoint
      // We can use the existing backend logic. The modal used the array from marketplace, but we need a single fetch.
      // Wait, there's no specific route to fetch *one* marketplace campaign?
      // Let's use the generic campaign fetch. Actually, `api.api.campaigns[":id"].$get` might be restricted to brands?
      // Let's assume the endpoint returns public data or we fetch the marketplace array and filter it.
      // A better way is fetching the full array and picking one if there's no single fetch.
      const res = await api.api.influencers["marketplace-campaigns"].$get({ query: { limit: "100" } });
      if (!res.ok) throw new Error("Failed to fetch campaigns");
      const result = await res.json();
      if (!result.success) throw new Error(result.error as string || "Failed to fetch");
      const list = result.data as any[];
      const found = list.find((c: any) => c.id === id);
      if (!found) throw new Error("Campaign not found");
      return found;
    },
    enabled: !!id,
  });

  const applyMutation = useMutation({
    mutationFn: async (propText: string) => {
      const res = await (api.api.influencers.apply[":campaignId"].$post as any)({
        param: { campaignId: id },
        json: {
          proposal: propText,
          ...(selectedAccountId ? { influencerAccountId: selectedAccountId } : {})
        },
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok || !result.success) {
        if (result.meta?.details?.proposal?._errors?.[0]) {
          throw new Error(result.meta.details.proposal._errors[0]);
        }
        throw new Error(result.error || "Failed to apply");
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["influencerCampaign", id] });
      toast.success("Application submitted successfully!");
      router.push("/influencer/marketplace");
    },
    onError: (err: any) => {
      toast.error(err.message || "Error submitting application");
    }
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
        <Skeleton className="h-8 w-64 bg-slate-200 dark:bg-slate-800" />
        <Skeleton className="h-[400px] w-full bg-slate-200 dark:bg-slate-800 rounded-2xl" />
      </div>
    );
  }

  if (error || !campaignData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6 text-destructive">
        <h2 className="text-xl font-bold mb-2">Error Loading Campaign</h2>
        <p className="max-w-md mb-6">{error?.message || "Campaign not found"}</p>
        <Link href="/influencer/marketplace" className="text-primary hover:underline">Back to Marketplace</Link>
      </div>
    );
  }

  const c = campaignData;
  const budgetStr = c.budget >= 1000000 ? `₹${(c.budget / 100000000).toFixed(1)}L` : `₹${(c.budget / 100).toLocaleString()}`;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
      <div>
        <Link href="/influencer/marketplace" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors font-bold uppercase">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Marketplace
        </Link>
      </div>

      <div className="bg-white/90 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-3xl shadow-xl backdrop-blur-xl overflow-hidden">
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-slate-150 dark:border-slate-800/60">
          <div className="flex flex-col md:flex-row gap-6 justify-between items-start">
            <div className="flex items-start gap-4">
              <img
                src={c.brandLogo || `https://api.dicebear.com/7.x/initials/svg?seed=${c.brandName}`}
                alt={c.brandName}
                className="w-16 h-16 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1.5 object-contain"
              />
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">{c.title}</h1>
                <p className="text-sm font-semibold text-slate-500 mt-1">{c.brandName} · {c.brandCategory}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 md:text-right">
              <span className="text-[10px] font-black px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {budgetStr} BUDGET
              </span>
              <span className="text-[10px] font-black px-3 py-1.5 rounded-lg border text-violet-600 bg-violet-500/10 border-violet-500/20 uppercase">
                {c.campaignType}
              </span>
              {c.isInvited && (
                <span className="text-[10px] font-black px-3 py-1.5 rounded-lg bg-violet-600 text-white shadow-sm">
                  INVITED
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Details */}
          <div className="md:col-span-2 space-y-8">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Campaign Brief</p>
              <div className="prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                {c.description}
              </div>
            </div>

            {c.requirements && (
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Requirements & Deliverables</p>
                <div className="prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {c.requirements}
                </div>
              </div>
            )}

            {c.targetAudience && (
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Target Audience</p>
                <div className="prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-300">
                  {c.targetAudience}
                </div>
              </div>
            )}
          </div>

          {/* Application Box */}
          <div className="md:col-span-1">
            <div className="bg-slate-50 dark:bg-slate-950/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 sticky top-24">
              {!c.isApplied ? (
                <div className="space-y-4">
                  <h3 className="font-bold text-slate-900 dark:text-white">Submit Proposal</h3>

                  {/* Account Selection */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Apply with Account</label>
                    <Select value={selectedAccountId} onValueChange={(val) => val && setSelectedAccountId(val)}>
                      <SelectTrigger className="w-full p-3 h-auto text-sm bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl focus:ring-1 focus:ring-primary/20">
                        <SelectValue placeholder="Select an Account">
                          {selectedAccountId ? (
                            <div className="flex items-center">
                              {accounts?.find(a => a.id === selectedAccountId)?.verified && <Verified className="w-4 h-4 text-blue-600 mr-2" />}
                              {accounts?.find(a => a.id === selectedAccountId)?.instagramHandle}
                            </div>
                          ) : (
                            "Select an Account"
                          )}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {accounts?.map((acc) => (
                          <SelectItem className="flex items-center gap-2" key={acc.id} value={acc.id}>
                            <div className="flex items-center">
                              {acc.verified && <Verified className="w-4 h-4 text-blue-500 mr-2 " />}
                              {acc.instagramHandle}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <textarea
                    value={proposal}
                    onChange={(e) => setProposal(e.target.value)}
                    rows={5}
                    placeholder="Tell the brand why you're a perfect fit. Include your ideas, past experience, and what value you'll bring..."
                    className="w-full p-4 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none placeholder-slate-400 resize-none shadow-sm"
                  />

                  {(() => {
                    const isSelectedVerified = selectedAccountId
                      ? accounts?.find(a => a.id === selectedAccountId)?.verified
                      : false;

                    if (selectedAccountId && !isSelectedVerified) {
                      return (
                        <div className="text-xs text-rose-500 bg-rose-50 dark:bg-rose-500/10 p-3 rounded-lg border border-rose-200 dark:border-rose-500/20">
                          <strong>Verification Required:</strong> You cannot apply to campaigns with an unverified account.
                        </div>
                      );
                    }

                    return (
                      <button
                        onClick={() => applyMutation.mutate(proposal)}
                        disabled={!proposal.trim() || !selectedAccountId || applyMutation.isPending || !isSelectedVerified}
                        className="w-full py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-primary to-rose-700 hover:from-primary/90 hover:to-rose-600 disabled:opacity-50 shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
                      >
                        {applyMutation.isPending ? "Submitting..." : "Send Application"}
                      </button>
                    );
                  })()}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center gap-3 py-6">
                  {c.applicationStatus === "accepted" ? (
                    <>
                      <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                        <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white">Application Accepted!</h3>
                        <p className="text-xs text-slate-500 mt-1">The brand accepted your proposal.</p>
                      </div>
                      <button onClick={() => router.push("/influencer/chat")} className="mt-4 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 font-bold py-3 px-6 rounded-xl text-sm border border-emerald-500/20 w-full transition-all flex items-center justify-center gap-2">
                        Open Chat
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                        <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white">Application Sent!</h3>
                        <p className="text-xs text-slate-500 mt-1">The brand is reviewing your proposal.</p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
