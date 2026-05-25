"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMockAuth } from "./layout-shell";

export default function Home() {
  const { user } = useMockAuth();
  
  // Reach Calculator States
  const [budget, setBudget] = useState(1500);
  const [tier, setTier] = useState<"nano" | "micro" | "mid" | "macro" | "mega">("micro");
  const [engagement, setEngagement] = useState(4.0);
  const [reachResult, setReachResult] = useState({
    reach: 85000,
    impressions: 100000,
    clicks: 4500,
    engagement: 4000,
  });

  // Earnings Calculator States
  const [followers, setFollowers] = useState(50000);
  const [influencerEngagement, setInfluencerEngagement] = useState(4.5);
  const [niche, setNiche] = useState("Tech & Gadgets");
  const [earningsResult, setEarningsResult] = useState({
    reel: 575,
    story: 230,
    monthly: 2070,
  });

  // Simple client-side math for instant slider feedback
  const updateReachResult = (b: number, t: typeof tier, e: number) => {
    let cpv = 0.015;
    if (t === "nano") cpv = 0.02;
    else if (t === "mid") cpv = 0.012;
    else if (t === "macro") cpv = 0.01;
    else if (t === "mega") cpv = 0.008;

    const impressions = Math.round(b / cpv);
    const reach = Math.round(impressions * 0.85);
    const eng = Math.round(impressions * (e / 100));
    const clicks = Math.round(eng * 0.05);

    setReachResult({ reach, impressions, clicks, engagement: eng });
  };

  const updateEarningsResult = (f: number, e: number, n: string) => {
    let nicheMult = 1.0;
    if (n.includes("Tech")) nicheMult = 1.5;
    else if (n.includes("Gaming")) nicheMult = 1.3;
    else if (n.includes("Fashion") || n.includes("Beauty")) nicheMult = 1.25;
    else if (n.includes("Fitness")) nicheMult = 1.15;

    const engagementMult = Math.max(0.5, Math.min(2.5, 1.0 + (e - 3.0) * 0.1));
    const base = (f / 10000) * 100;
    const reel = Math.round(base * nicheMult * engagementMult);
    const story = Math.round(reel * 0.4);
    const monthly = (reel * 2) + (story * 4);

    setEarningsResult({ reel, story, monthly });
  };

  return (
    <div className="space-y-16 py-6 max-w-5xl mx-auto relative">
      
      {/* Hero Section */}
      <section className="text-center space-y-6 relative py-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
          ✨ Next-Gen Creator Collaborations
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-purple-400 leading-tight">
          Where AI Matches Brands <br /> with the Perfect Influencer
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
          Reelio automates creator discovery, outreach, contract signing, escrow payments, and reach analysis with powerful AI matching filters.
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <Link href="/marketplace">
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/20 px-8 py-6 rounded-2xl cursor-pointer">
              Explore Marketplace
            </Button>
          </Link>
          <Link href={user.role === "influencer" ? "/influencer/dashboard" : "/brand/dashboard"}>
            <Button size="lg" variant="outline" className="border-slate-800 bg-slate-900/40 hover:bg-slate-850 px-8 py-6 rounded-2xl cursor-pointer">
              View Dashboard
            </Button>
          </Link>
        </div>
      </section>

      {/* Embedded Live Calculators */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Intro */}
        <div className="lg:col-span-4 space-y-4 pt-6">
          <h2 className="text-2xl font-bold text-slate-100">Interactive Revenue & Reach Tools</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Estimate campaign impressions, engagement click rates, and custom pricing models based on creator tiers and category niches.
          </p>
          <div className="space-y-3 pt-4">
            <div className="flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 text-xs font-bold">1</span>
              <span className="text-xs font-semibold text-slate-300">Instagram Profile Scraper</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 text-xs font-bold">2</span>
              <span className="text-xs font-semibold text-slate-300">Website Categorization AI</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 text-xs font-bold">3</span>
              <span className="text-xs font-semibold text-slate-300">Escrow Payment Gateway</span>
            </div>
          </div>
        </div>

        {/* Card containing calculators */}
        <div className="lg:col-span-8">
          <Card className="bg-slate-900/40 border-slate-800/80 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl">
            <Tabs defaultValue="brand-reach" className="w-full">
              <TabsList className="w-full grid grid-cols-2 bg-slate-950 p-1 border-b border-slate-800 rounded-none h-14">
                <TabsTrigger value="brand-reach" className="text-xs font-bold tracking-wide uppercase h-11 rounded-xl cursor-pointer">
                  📢 Brand Reach Estimator
                </TabsTrigger>
                <TabsTrigger value="creator-earnings" className="text-xs font-bold tracking-wide uppercase h-11 rounded-xl cursor-pointer">
                  💰 Influencer Earning Rate
                </TabsTrigger>
              </TabsList>

              <CardContent className="p-8 space-y-6">
                
                {/* Brand Reach Tab */}
                <TabsContent value="brand-reach" className="space-y-6 mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="budget" className="text-slate-300 text-xs font-bold flex justify-between">
                          <span>Campaign Budget (USD)</span>
                          <span className="text-indigo-400 font-mono text-sm">${budget.toLocaleString()}</span>
                        </Label>
                        <input
                          id="budget"
                          type="range"
                          min="100"
                          max="25000"
                          step="100"
                          value={budget}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            setBudget(val);
                            updateReachResult(val, tier, engagement);
                          }}
                          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="tier" className="text-slate-300 text-xs font-bold">Influencer Tier</Label>
                        <div className="grid grid-cols-5 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-850">
                          {(["nano", "micro", "mid", "macro", "mega"] as const).map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => {
                                setTier(t);
                                updateReachResult(budget, t, engagement);
                              }}
                              className={`text-[10px] py-2 rounded-lg font-bold capitalize transition-all cursor-pointer ${
                                tier === t ? "bg-indigo-600 text-white" : "text-slate-500 hover:text-slate-300"
                              }`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="engagement" className="text-slate-300 text-xs font-bold flex justify-between">
                          <span>Target Engagement Rate</span>
                          <span className="text-indigo-400 font-mono text-sm">{engagement}%</span>
                        </Label>
                        <input
                          id="engagement"
                          type="range"
                          min="0.5"
                          max="15"
                          step="0.1"
                          value={engagement}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            setEngagement(val);
                            updateReachResult(budget, tier, val);
                          }}
                          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                        />
                      </div>
                    </div>

                    {/* Results Display */}
                    <div className="bg-slate-950/80 border border-slate-800 p-6 rounded-2xl space-y-4 flex flex-col justify-center">
                      <h4 className="text-xs uppercase tracking-wider font-bold text-slate-500">Expected Outputs</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-900/50 p-3.5 rounded-xl border border-slate-850/60">
                          <span className="text-[10px] text-slate-500 font-bold block uppercase">Est. Impressions</span>
                          <span className="text-xl font-bold text-slate-200 mt-1 block font-mono">{reachResult.impressions.toLocaleString()}</span>
                        </div>
                        <div className="bg-slate-900/50 p-3.5 rounded-xl border border-slate-850/60">
                          <span className="text-[10px] text-slate-500 font-bold block uppercase">Unique Reach</span>
                          <span className="text-xl font-bold text-indigo-400 mt-1 block font-mono">{reachResult.reach.toLocaleString()}</span>
                        </div>
                        <div className="bg-slate-900/50 p-3.5 rounded-xl border border-slate-850/60">
                          <span className="text-[10px] text-slate-500 font-bold block uppercase">Engagements</span>
                          <span className="text-xl font-bold text-slate-200 mt-1 block font-mono">{reachResult.engagement.toLocaleString()}</span>
                        </div>
                        <div className="bg-slate-900/50 p-3.5 rounded-xl border border-slate-850/60">
                          <span className="text-[10px] text-slate-500 font-bold block uppercase">Est. Clicks</span>
                          <span className="text-xl font-bold text-purple-400 mt-1 block font-mono">{reachResult.clicks.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Influencer Earnings Tab */}
                <TabsContent value="creator-earnings" className="space-y-6 mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="followers" className="text-slate-300 text-xs font-bold flex justify-between">
                          <span>Follower Count</span>
                          <span className="text-indigo-400 font-mono text-sm">{followers.toLocaleString()}</span>
                        </Label>
                        <input
                          id="followers"
                          type="range"
                          min="1000"
                          max="1000000"
                          step="5000"
                          value={followers}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            setFollowers(val);
                            updateEarningsResult(val, influencerEngagement, niche);
                          }}
                          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="influencerEngagement" className="text-slate-300 text-xs font-bold flex justify-between">
                          <span>Engagement Rate</span>
                          <span className="text-indigo-400 font-mono text-sm">{influencerEngagement}%</span>
                        </Label>
                        <input
                          id="influencerEngagement"
                          type="range"
                          min="0.5"
                          max="15"
                          step="0.1"
                          value={influencerEngagement}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            setInfluencerEngagement(val);
                            updateEarningsResult(followers, val, niche);
                          }}
                          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="niche" className="text-slate-300 text-xs font-bold">Niche / Category</Label>
                        <div className="grid grid-cols-2 gap-1.5">
                          {["Tech & Gadgets", "Fashion & Beauty", "Fitness & Health", "Travel & Adventure"].map((n) => (
                            <button
                              key={n}
                              type="button"
                              onClick={() => {
                                setNiche(n);
                                updateEarningsResult(followers, influencerEngagement, n);
                              }}
                              className={`text-[10px] py-2 rounded-xl font-bold border transition-all cursor-pointer ${
                                niche === n 
                                  ? "bg-indigo-600 border-indigo-500 text-white" 
                                  : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                              }`}
                            >
                              {n}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Results Display */}
                    <div className="bg-slate-950/80 border border-slate-800 p-6 rounded-2xl space-y-4 flex flex-col justify-center">
                      <h4 className="text-xs uppercase tracking-wider font-bold text-slate-500">Estimates (USD)</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded-xl border border-slate-850/60">
                          <span className="text-xs text-slate-400 font-medium">Reel Price</span>
                          <span className="text-lg font-bold text-slate-200 font-mono">${earningsResult.reel}</span>
                        </div>
                        <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded-xl border border-slate-850/60">
                          <span className="text-xs text-slate-400 font-medium">Story Price</span>
                          <span className="text-lg font-bold text-slate-200 font-mono">${earningsResult.story}</span>
                        </div>
                        <div className="flex justify-between items-center bg-indigo-500/10 p-3.5 rounded-xl border border-indigo-500/20">
                          <span className="text-xs text-indigo-300 font-bold">Monthly Potential</span>
                          <span className="text-xl font-bold text-indigo-400 font-mono">${earningsResult.monthly}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

              </CardContent>
            </Tabs>
          </Card>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-100">End-to-End Campaign Pipelines</h2>
          <p className="text-sm text-slate-400">Everything needed to run high-ROI influencer marketing campaigns on autopilot.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-slate-900/30 border-slate-800/60 p-6 space-y-4 hover:border-slate-700/60 transition-all rounded-2xl">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 font-bold">📸</span>
            <h3 className="text-lg font-bold text-slate-200">Sync Instagram Stats</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Influencers sync handles. Reelio scrapes real-time followers, engagement ratios, and displays interactive reel cards.
            </p>
          </Card>

          <Card className="bg-slate-900/30 border-slate-800/60 p-6 space-y-4 hover:border-slate-700/60 transition-all rounded-2xl">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 font-bold">🏢</span>
            <h3 className="text-lg font-bold text-slate-200">Auto-Extract Brands</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Brands enter their website URL, and our edge scrapers instantly auto-generate description category mappings and company logos.
            </p>
          </Card>

          <Card className="bg-slate-900/30 border-slate-800/60 p-6 space-y-4 hover:border-slate-700/60 transition-all rounded-2xl">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/10 text-pink-400 font-bold">🤝</span>
            <h3 className="text-lg font-bold text-slate-200">Escrow Secure Payments</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Stripe webhook integration deposits campaign funds in escrow, auto-releasing payouts once creator tasks are completed.
            </p>
          </Card>
        </div>
      </section>

    </div>
  );
}
