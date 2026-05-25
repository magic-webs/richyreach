"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api-client";

export default function CalculatorsPage() {
  // Reach Calculator States
  const [budget, setBudget] = useState(2500);
  const [tier, setTier] = useState<"nano" | "micro" | "mid" | "macro" | "mega">("micro");
  const [engagement, setEngagement] = useState(4.2);
  const [reachLoading, setReachLoading] = useState(false);
  const [reachResult, setReachResult] = useState({
    expectedReach: 141667,
    estimatedImpressions: 166667,
    expectedClicks: 350,
    engagementEstimate: 7000,
  });

  // Earnings Calculator States
  const [followers, setFollowers] = useState(120000);
  const [influencerEngagement, setInfluencerEngagement] = useState(3.5);
  const [niche, setNiche] = useState("Fashion & Apparel");
  const [earningsLoading, setEarningsLoading] = useState(false);
  const [earningsResult, setEarningsResult] = useState({
    estimatedReelPrice: 1575,
    estimatedStoryPrice: 630,
    monthlyEarningsPotential: 5670,
  });

  const handleCalculateReach = async () => {
    setReachLoading(true);
    try {
      const res = await api.api.calculator.reach.$post({
        json: {
          budget,
          influencerTier: tier,
          engagementRate: engagement,
        },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setReachResult(json.data);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setReachLoading(false);
    }
  };

  const handleCalculateEarnings = async () => {
    setEarningsLoading(true);
    try {
      const res = await api.api.calculator.earnings.$post({
        json: {
          followers,
          engagementRate: influencerEngagement,
          niche,
        },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setEarningsResult(json.data);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setEarningsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-purple-400">
          Campaign & Earnings Calculators
        </h1>
        <p className="text-slate-400 text-sm">
          Run estimations by querying the Hono edge APIs for real-time reach metrics and creator standard rates.
        </p>
      </div>

      <Tabs defaultValue="reach" className="w-full">
        <TabsList className="grid grid-cols-2 bg-slate-900 border border-slate-800 p-1 rounded-2xl h-14">
          <TabsTrigger value="reach" className="rounded-xl font-bold text-xs uppercase cursor-pointer">
            📢 Brand Reach Calculator
          </TabsTrigger>
          <TabsTrigger value="earnings" className="rounded-xl font-bold text-xs uppercase cursor-pointer">
            💰 Influencer Earnings Calculator
          </TabsTrigger>
        </TabsList>

        {/* Reach Tab */}
        <TabsContent value="reach" className="mt-6">
          <Card className="bg-slate-900/40 border-slate-800/80 backdrop-blur-xl rounded-3xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-slate-300 text-xs font-bold flex justify-between">
                    <span>Campaign Budget (USD)</span>
                    <span className="text-indigo-400 font-mono text-sm">${budget}</span>
                  </Label>
                  <input
                    type="range"
                    min="500"
                    max="100000"
                    step="500"
                    value={budget}
                    onChange={(e) => setBudget(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300 text-xs font-bold">Influencer Tier Preference</Label>
                  <div className="grid grid-cols-5 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-850">
                    {(["nano", "micro", "mid", "macro", "mega"] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTier(t)}
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
                  <Label className="text-slate-300 text-xs font-bold flex justify-between">
                    <span>Target Engagement Rate (%)</span>
                    <span className="text-indigo-400 font-mono text-sm">{engagement}%</span>
                  </Label>
                  <input
                    type="range"
                    min="0.5"
                    max="15"
                    step="0.1"
                    value={engagement}
                    onChange={(e) => setEngagement(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>

                <Button
                  onClick={handleCalculateReach}
                  disabled={reachLoading}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-5 shadow-lg shadow-indigo-600/10 cursor-pointer"
                >
                  {reachLoading ? "Calculating..." : "Query /calculator/reach API"}
                </Button>
              </div>

              {/* Reach Results Card */}
              <div className="bg-slate-950/70 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between space-y-6">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-200">Reach Estimations</h3>
                  <p className="text-xs text-slate-500">Calculated based on standard cost-per-view (CPV) brackets.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-900/50 p-4 border border-slate-850 rounded-xl">
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Impressions</span>
                    <span className="text-xl font-bold text-slate-200 mt-1 block font-mono">
                      {reachResult.estimatedImpressions.toLocaleString()}
                    </span>
                  </div>
                  <div className="bg-indigo-500/5 p-4 border border-indigo-500/10 rounded-xl">
                    <span className="text-[10px] text-indigo-400 block uppercase font-bold">Reach</span>
                    <span className="text-xl font-bold text-indigo-300 mt-1 block font-mono">
                      {reachResult.expectedReach.toLocaleString()}
                    </span>
                  </div>
                  <div className="bg-slate-900/50 p-4 border border-slate-850 rounded-xl">
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Engagement</span>
                    <span className="text-xl font-bold text-slate-200 mt-1 block font-mono">
                      {reachResult.engagementEstimate.toLocaleString()}
                    </span>
                  </div>
                  <div className="bg-purple-500/5 p-4 border border-purple-500/10 rounded-xl">
                    <span className="text-[10px] text-purple-400 block uppercase font-bold">Link Clicks</span>
                    <span className="text-xl font-bold text-purple-300 mt-1 block font-mono">
                      {reachResult.expectedClicks.toLocaleString()}
                    </span>
                  </div>
                </div>

                <p className="text-[10px] text-slate-500 leading-relaxed italic text-center">
                  *Reach assumptions use a standard 5% conversion rate from engaged users to website/clicks.
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Earnings Tab */}
        <TabsContent value="earnings" className="mt-6">
          <Card className="bg-slate-900/40 border-slate-800/80 backdrop-blur-xl rounded-3xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-slate-300 text-xs font-bold flex justify-between">
                    <span>Follower Count</span>
                    <span className="text-indigo-400 font-mono text-sm">{followers.toLocaleString()}</span>
                  </Label>
                  <input
                    type="range"
                    min="5000"
                    max="2000000"
                    step="5000"
                    value={followers}
                    onChange={(e) => setFollowers(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300 text-xs font-bold flex justify-between">
                    <span>Engagement Rate (%)</span>
                    <span className="text-indigo-400 font-mono text-sm">{influencerEngagement}%</span>
                  </Label>
                  <input
                    type="range"
                    min="0.5"
                    max="15"
                    step="0.1"
                    value={influencerEngagement}
                    onChange={(e) => setInfluencerEngagement(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300 text-xs font-bold">Content Niche</Label>
                  <select
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Fashion & Apparel">Fashion & Apparel</option>
                    <option value="Tech & Gadgets">Tech & Gadgets</option>
                    <option value="Fitness & Health">Fitness & Health</option>
                    <option value="Gaming & Esports">Gaming & Esports</option>
                    <option value="Travel & Leisure">Travel & Leisure</option>
                  </select>
                </div>

                <Button
                  onClick={handleCalculateEarnings}
                  disabled={earningsLoading}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-5 shadow-lg shadow-indigo-600/10 cursor-pointer"
                >
                  {earningsLoading ? "Calculating..." : "Query /calculator/earnings API"}
                </Button>
              </div>

              {/* Earnings Results */}
              <div className="bg-slate-950/70 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between space-y-6">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-200">Earnings Estimations</h3>
                  <p className="text-xs text-slate-500">Calculated using followers tier & category multiplier weights.</p>
                </div>

                <div className="space-y-3.5">
                  <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded-xl border border-slate-850/60">
                    <span className="text-xs text-slate-400 font-semibold">Suggested Reel Cost</span>
                    <span className="text-lg font-bold text-slate-200 font-mono">${earningsResult.estimatedReelPrice}</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded-xl border border-slate-850/60">
                    <span className="text-xs text-slate-400 font-semibold">Suggested Story Cost</span>
                    <span className="text-lg font-bold text-slate-200 font-mono">${earningsResult.estimatedStoryPrice}</span>
                  </div>
                  <div className="flex justify-between items-center bg-indigo-500/10 p-4 rounded-xl border border-indigo-500/20">
                    <span className="text-xs text-indigo-300 font-bold">Monthly Potential (Est)</span>
                    <span className="text-xl font-bold text-indigo-400 font-mono">${earningsResult.monthlyEarningsPotential}</span>
                  </div>
                </div>

                <p className="text-[10px] text-slate-500 leading-relaxed italic text-center">
                  *Suggested values map to average creator rates on similar campaigns.
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
