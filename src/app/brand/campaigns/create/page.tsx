"use client";

import React, { useState, useEffect } from "react";
import { useMockAuth } from "../../../layout-shell";
import { api } from "@/lib/api-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";

export default function CreateCampaignPage() {
  const { user } = useMockAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budgetUsd, setBudgetUsd] = useState("1000");
  const [campaignType, setCampaignType] = useState("reel");
  const [influencerTier, setInfluencerTier] = useState<string>("mid");
  const [targetAudience, setTargetAudience] = useState("");
  const [requirements, setRequirements] = useState("");

  // Live estimate stats
  const [estimates, setEstimates] = useState<any>({
    expectedReach: 70833,
    estimatedImpressions: 83333,
    expectedClicks: 125,
    engagementEstimate: 2500,
  });
  const [calculating, setCalculating] = useState(false);

  // Fetch estimates when budget or tier changes
  useEffect(() => {
    const budgetVal = parseFloat(budgetUsd);
    if (!budgetVal || budgetVal <= 0) return;

    const delayDebounce = setTimeout(async () => {
      try {
        setCalculating(true);
        const res = await api.api.calculator.reach.$post({
          json: {
            budget: budgetVal,
            influencerTier: influencerTier as any,
            engagementRate: 3.0,
          },
        });
        if (res.ok) {
          const result = await res.json();
          if (result.success && result.data) {
            setEstimates(result.data);
          }
        }
      } catch (err) {
        console.error("Estimation failed", err);
      } finally {
        setCalculating(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [budgetUsd, influencerTier]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !budgetUsd) return;

    try {
      setSaving(true);
      const budgetCents = Math.round(parseFloat(budgetUsd) * 100) || 0;

      const res = await api.api.campaigns.create.$post({
        json: {
          title,
          description,
          budget: budgetCents,
          campaignType,
          targetAudience: targetAudience || null,
          requirements: requirements || null,
          expectedReach: estimates.expectedReach,
        },
      });

      if (res.ok) {
        const result = await res.json();
        if (result.success) {
          alert("Campaign launched successfully!");
          router.push("/brand/dashboard");
        } else {
          alert("Error: " + JSON.stringify(result.error));
        }
      } else {
        const errorText = await res.text();
        alert("Failed to create campaign: " + errorText);
      }
    } catch (error) {
      console.error(error);
      alert("An unexpected error occurred during creation.");
    } finally {
      setSaving(false);
    }
  };

  if (user.role !== "brand") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6 bg-slate-900/30 border border-slate-800/80 rounded-3xl backdrop-blur-md">
        <h2 className="text-xl font-bold text-slate-300 mb-2">Access Restricted</h2>
        <p className="text-slate-400 max-w-md mb-6">
          Only Brand accounts can create and launch campaigns. Please use the sandbox controls in the sidebar to switch your role to **Brand View**.
        </p>
        <div className="animate-bounce text-purple-400">
          <svg className="w-8 h-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Back button */}
      <div>
        <Link
          href="/brand/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors font-bold uppercase"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Workspace
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight text-white mt-4">Launch Campaign</h1>
        <p className="text-slate-400 text-sm mt-1">
          Define your campaign brief and view dynamic reach estimations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Campaign Creation Form */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="bg-slate-900/40 border-slate-800/80 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-xl text-white">Campaign Details</CardTitle>
              <CardDescription>Provide details about the collaboration requirements</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-slate-300 text-xs font-bold uppercase">
                    Campaign Title
                  </Label>
                  <Input
                    id="title"
                    placeholder="e.g. Summer Fit Athletic Wear Showcase"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-slate-950/60 border-slate-800/80 text-white rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="type" className="text-slate-300 text-xs font-bold uppercase">
                      Content Format
                    </Label>
                    <Select value={campaignType} onValueChange={setCampaignType}>
                      <SelectTrigger className="bg-slate-950/60 border-slate-800/80 text-white rounded-xl">
                        <SelectValue placeholder="Select Type" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800 text-slate-300">
                        <SelectItem value="reel">Instagram Reel</SelectItem>
                        <SelectItem value="story">Instagram Story</SelectItem>
                        <SelectItem value="post">Instagram Image Post</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tier" className="text-slate-300 text-xs font-bold uppercase">
                      Target Creator Tier
                    </Label>
                    <Select value={influencerTier} onValueChange={setInfluencerTier}>
                      <SelectTrigger className="bg-slate-950/60 border-slate-800/80 text-white rounded-xl">
                        <SelectValue placeholder="Select Creator Tier" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800 text-slate-300">
                        <SelectItem value="any">Any (Mix of all tiers)</SelectItem>
                        <SelectItem value="nano">Nano (5k - 10k followers)</SelectItem>
                        <SelectItem value="micro">Micro (10k - 50k followers)</SelectItem>
                        <SelectItem value="mid">Mid-Tier (50k - 100k followers)</SelectItem>
                        <SelectItem value="macro">Macro (100k - 1M followers)</SelectItem>
                        <SelectItem value="mega">Mega (1M+ followers)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget" className="text-slate-300 text-xs font-bold uppercase">
                    Campaign Budget (USD)
                  </Label>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-slate-500 font-semibold">$</span>
                    <Input
                      id="budget"
                      type="number"
                      min="1"
                      placeholder="1000"
                      value={budgetUsd}
                      onChange={(e) => setBudgetUsd(e.target.value)}
                      className="pl-8 bg-slate-950/60 border-slate-800/80 text-white rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="audience" className="text-slate-300 text-xs font-bold uppercase">
                    Target Audience / Demographics (Optional)
                  </Label>
                  <Input
                    id="audience"
                    placeholder="e.g. Females, 18-34, interested in fitness, activewear, lifestyle"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="bg-slate-950/60 border-slate-800/80 text-white rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requirements" className="text-slate-300 text-xs font-bold uppercase">
                    Creator Deliverable Requirements (Optional)
                  </Label>
                  <textarea
                    id="requirements"
                    rows={3}
                    placeholder="e.g. Must tag @brand, use hashtag #SummerOutfit, 1x dedicated Reel, keep link in bio for 48h."
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    className="w-full p-3.5 text-sm bg-slate-950/60 border border-slate-800/80 text-white rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 focus:outline-none placeholder-slate-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-slate-300 text-xs font-bold uppercase">
                    Campaign Brief / Description
                  </Label>
                  <textarea
                    id="description"
                    rows={4}
                    placeholder="Outline your campaign objective, vision, and core message for creators..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-3.5 text-sm bg-slate-950/60 border border-slate-800/80 text-white rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 focus:outline-none placeholder-slate-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-purple-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {saving ? "Deploying Campaign Escrow..." : "Launch Campaign"}
                </button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Live Reach Estimator Preview Panel */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-slate-900/40 border-slate-800/80 backdrop-blur-md sticky top-24 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-28 h-28 bg-purple-500/10 rounded-full blur-[60px] pointer-events-none"></div>
            <CardHeader className="border-b border-slate-800/40 pb-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base text-slate-300">Reach Estimator</CardTitle>
                {calculating && (
                  <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping"></span>
                )}
              </div>
              <CardDescription>Live performance projections for the specified budget</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-950/65 border border-slate-850 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Projected Impressions</p>
                    <p className="text-2xl font-black text-white mt-1">
                      {estimates.estimatedImpressions?.toLocaleString()}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-2 py-1 rounded-lg">
                    VIEWS
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/65 border border-slate-850 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Unique Reach</p>
                    <p className="text-2xl font-black text-indigo-400 mt-1">
                      {estimates.expectedReach?.toLocaleString()}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-lg">
                    UNIQUE
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-950/65 border border-slate-850">
                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Engagements</p>
                    <p className="text-lg font-black text-rose-400 mt-1">
                      {estimates.engagementEstimate?.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-950/65 border border-slate-850">
                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">CTA Link Clicks</p>
                    <p className="text-lg font-black text-emerald-400 mt-1">
                      {estimates.expectedClicks?.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed space-y-2">
                <p className="font-bold text-slate-300">💡 Calculation Model:</p>
                <p>Estimates are calculated using Cost-Per-View metrics tailored per tier. High engagement rate multipliers are factored for Nano/Micro creators.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
