"use client";

import React, { useEffect, useState } from "react";
import { useMockAuth } from "../layout-shell";
import { api } from "@/lib/api-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function MarketplacePage() {
  const { user } = useMockAuth();
  const [loading, setLoading] = useState(true);
  const [influencers, setInfluencers] = useState<any[]>([]);

  // Search & filter states
  const [search, setSearch] = useState("");
  const [niche, setNiche] = useState("all");
  const [maxPricing, setMaxPricing] = useState("1000"); // in USD
  const [minFollowers, setMinFollowers] = useState("1000");

  // Selected creator details
  const [selectedCreatorId, setSelectedCreatorId] = useState<string | null>(null);
  const [creatorDetails, setCreatorDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Invite states
  const [brandCampaigns, setBrandCampaigns] = useState<any[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("");
  const [inviting, setInviting] = useState(false);

  const niches = [
    "Fashion & Styling",
    "Tech & Gadgets",
    "Fitness & Health",
    "Travel & Adventure",
    "Food & Culinary",
    "Gaming",
    "Beauty & Cosmetics",
  ];

  const fetchInfluencers = async () => {
    try {
      setLoading(true);
      const queryParams: any = {};
      if (search) queryParams.search = search;
      if (niche !== "all") queryParams.niche = niche;
      if (maxPricing) queryParams.maxPricing = (parseFloat(maxPricing) * 100).toString(); // convert to cents
      if (minFollowers) queryParams.minFollowers = minFollowers;

      const res = await api.api.influencers.$get({ query: queryParams });
      if (res.ok) {
        const result = await res.json();
        if (result.success) {
          setInfluencers(result.data || []);
        }
      }
    } catch (err) {
      console.error("Failed to load marketplace creators", err);
    } finally {
      setLoading(false);
    }
  };

  // Run fetch on filter change (debounced search is handled below)
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchInfluencers();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search, niche, maxPricing, minFollowers]);

  // Load creator detail modal
  const handleCreatorClick = async (creatorId: string) => {
    setSelectedCreatorId(creatorId);
    try {
      setLoadingDetails(true);
      const res = await api.api.influencers[":id"].$get({
        param: { id: creatorId },
      });
      if (res.ok) {
        const result = await res.json();
        if (result.success) {
          setCreatorDetails(result.data);
        }
      }

      // If viewing as a brand, also load the brand's active campaigns for the invite dropdown
      if (user.role === "brand") {
        const campRes = await api.api.campaigns.$get();
        if (campRes.ok) {
          const result = await campRes.json();
          if (result.success && result.data) {
            setBrandCampaigns(result.data.filter((c: any) => c.status === "active"));
            if (result.data.length > 0) {
              setSelectedCampaignId(result.data[0].id);
            }
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch creator profile details", error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampaignId || !selectedCreatorId) return;

    try {
      setInviting(true);
      const res = await api.api.campaigns.invite.$post({
        json: {
          influencerId: selectedCreatorId,
          campaignId: selectedCampaignId,
        },
      });

      if (res.ok) {
        const result = await res.json();
        if (result.success) {
          alert("Invitation sent successfully!");
          setSelectedCreatorId(null);
        } else {
          alert("Error sending invite: " + JSON.stringify(result.error));
        }
      } else {
        alert("Failed to send invite.");
      }
    } catch (err) {
      console.error(err);
      alert("An unexpected error occurred.");
    } finally {
      setInviting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Creator Discovery</h1>
        <p className="text-slate-400 text-sm mt-1">
          Explore and connect with top-tier social media creators in fashion, technology, travel, and more.
        </p>
      </div>

      {/* Discovery Filters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-slate-900/30 border border-slate-800/80 p-6 rounded-3xl backdrop-blur-md">
        <div className="space-y-2">
          <Label htmlFor="search" className="text-xs font-bold uppercase tracking-wider text-slate-400">Search</Label>
          <Input
            id="search"
            type="text"
            placeholder="Search name or handle..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-slate-950/60 border-slate-800/80 text-white rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="niche" className="text-xs font-bold uppercase tracking-wider text-slate-400">Niche</Label>
          <Select value={niche} onValueChange={(val) => val && setNiche(val)}>
            <SelectTrigger className="bg-slate-950/60 border-slate-800/80 text-white rounded-xl">
              <SelectValue placeholder="All Niches" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-800 text-slate-300">
              <SelectItem value="all">All Niches</SelectItem>
              {niches.map((n) => (
                <SelectItem key={n} value={n} className="hover:bg-slate-800 focus:bg-slate-800">
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="min-followers" className="text-xs font-bold uppercase tracking-wider text-slate-400">Min Followers</Label>
            <span className="text-[10px] text-slate-400 font-bold">{(parseInt(minFollowers) || 0).toLocaleString()}</span>
          </div>
          <input
            id="min-followers"
            type="range"
            min="1000"
            max="1500000"
            step="1000"
            value={minFollowers}
            onChange={(e) => setMinFollowers(e.target.value)}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="max-pricing" className="text-xs font-bold uppercase tracking-wider text-slate-400">Max Budget (USD)</Label>
            <span className="text-[10px] text-slate-400 font-bold">${maxPricing}</span>
          </div>
          <input
            id="max-pricing"
            type="range"
            min="50"
            max="5000"
            step="50"
            value={maxPricing}
            onChange={(e) => setMaxPricing(e.target.value)}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </div>
      </div>

      {/* Influencers Listing Grid */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[30vh]">
          <div className="relative flex h-10 w-10 items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-6 w-6 bg-indigo-600"></span>
          </div>
        </div>
      ) : influencers.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/10 border border-dashed border-slate-800/80 rounded-3xl">
          <p className="text-slate-500 font-medium">No creators matched your search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {influencers.map((creator) => (
            <Card
              key={creator.id}
              className="bg-slate-900/40 border-slate-800/80 backdrop-blur-md hover:border-slate-700/60 transition-all group overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors"></div>
              <CardHeader className="pb-4 flex flex-row items-center gap-4">
                <img
                  src={creator.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${creator.name}`}
                  alt={creator.name}
                  className="w-14 h-14 rounded-xl border border-slate-800 bg-slate-950 p-1"
                />
                <div>
                  <CardTitle className="text-base text-white">{creator.name}</CardTitle>
                  <CardDescription className="text-xs text-indigo-400 font-semibold mt-0.5">
                    @{creator.instagramHandle}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <div className="flex justify-between items-center text-xs border-b border-slate-800/45 pb-3">
                  <span className="text-slate-500 uppercase tracking-wider font-bold text-[10px]">Followers</span>
                  <span className="text-slate-100 font-extrabold">{creator.followers?.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center text-xs border-b border-slate-800/45 pb-3">
                  <span className="text-slate-500 uppercase tracking-wider font-bold text-[10px]">Engagement Rate</span>
                  <span className="text-emerald-400 font-extrabold">{creator.engagementRate}%</span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 uppercase tracking-wider font-bold text-[10px]">Base Pricing</span>
                  <span className="text-indigo-300 font-extrabold">${(creator.pricing / 100).toLocaleString()}</span>
                </div>

                <button
                  onClick={() => handleCreatorClick(creator.id)}
                  className="w-full mt-4 bg-slate-950 hover:bg-indigo-600 hover:text-white border border-slate-850 hover:border-indigo-500 text-slate-300 font-bold py-2.5 px-4 rounded-xl text-xs transition-all cursor-pointer text-center"
                >
                  View Profile & Connect
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Creator Detail Profile Modal */}
      <Dialog open={selectedCreatorId !== null} onOpenChange={(open) => !open && setSelectedCreatorId(null)}>
        <DialogContent className="bg-slate-900 border border-slate-800 text-slate-100 max-w-4xl rounded-3xl p-6 shadow-2xl backdrop-blur-2xl overflow-y-auto max-h-[90vh]">
          {loadingDetails ? (
            <div className="flex items-center justify-center py-16">
              <span className="animate-ping absolute inline-flex h-10 w-10 rounded-full bg-indigo-400 opacity-75"></span>
            </div>
          ) : !creatorDetails ? (
            <div className="text-center py-10 text-slate-500">Failed to load profile details.</div>
          ) : (
            <div className="space-y-6">
              {/* Creator Intro Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-950/45 p-6 rounded-2xl border border-slate-850">
                <div className="flex items-center gap-4">
                  <img
                    src={creatorDetails.avatar}
                    alt={creatorDetails.name}
                    className="w-16 h-16 rounded-xl border border-slate-800 p-1 bg-slate-900/40"
                  />
                  <div>
                    <h3 className="text-lg font-bold text-white">{creatorDetails.name}</h3>
                    <p className="text-xs text-indigo-400">@{creatorDetails.instagramHandle}</p>
                    <span className="inline-block text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 mt-2 rounded-full border border-indigo-500/15">
                      {creatorDetails.niche}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-500">BASE PRICE</p>
                  <p className="text-lg font-black text-indigo-400">
                    ${(creatorDetails.pricing / 100).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Stats & About Column */}
                <div className="md:col-span-1 space-y-6">
                  <Card className="bg-slate-950/40 border-slate-850">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-bold text-slate-300">Audience Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-semibold">Followers</span>
                        <span className="font-extrabold text-slate-200">{creatorDetails.followers?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-semibold">Engagement</span>
                        <span className="font-extrabold text-emerald-400">{creatorDetails.engagementRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-semibold">AvgViews/Reel</span>
                        <span className="font-extrabold text-indigo-300">
                          {creatorDetails.avgViews ? creatorDetails.avgViews.toLocaleString() : "N/A"}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {creatorDetails.skills && creatorDetails.skills.length > 0 && (
                    <Card className="bg-slate-950/40 border-slate-850">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-bold text-slate-300">Content Specialties</CardTitle>
                      </CardHeader>
                      <CardContent className="flex flex-wrap gap-1.5">
                        {creatorDetails.skills.map((skill: string) => (
                          <span
                            key={skill}
                            className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-850 text-slate-300 font-bold"
                          >
                            {skill}
                          </span>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {/* Brand Collaboration Invite Form */}
                  {user.role === "brand" && (
                    <Card className="bg-purple-950/10 border-purple-500/25 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/5 rounded-full blur-xl pointer-events-none"></div>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-bold text-purple-300">Invite to Campaign</CardTitle>
                        <CardDescription className="text-[10px]">Inbound application invitation</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {brandCampaigns.length === 0 ? (
                          <div className="text-[10px] text-slate-500 italic">
                            No active campaigns to invite to. Please create a campaign first!
                          </div>
                        ) : (
                          <form onSubmit={handleSendInvite} className="space-y-4">
                            <div className="space-y-1.5">
                              <Label htmlFor="campaign-select" className="text-[10px] text-slate-400 uppercase font-bold">
                                Select Campaign
                              </Label>
                              <Select value={selectedCampaignId} onValueChange={(val) => val && setSelectedCampaignId(val)}>
                                <SelectTrigger className="bg-slate-950/80 border-slate-850 text-slate-300 text-xs rounded-xl h-9">
                                  <SelectValue placeholder="Choose Campaign" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-slate-800 text-slate-300">
                                  {brandCampaigns.map((camp) => (
                                    <SelectItem key={camp.id} value={camp.id}>
                                      {camp.title}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <button
                              type="submit"
                              disabled={inviting}
                              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-2 px-3 rounded-xl text-xs shadow-md shadow-purple-600/10 transition-all cursor-pointer disabled:opacity-50"
                            >
                              {inviting ? "Sending..." : "Send Invitation"}
                            </button>
                          </form>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Scraped Bio & Portfolio Gallery Column */}
                <div className="md:col-span-2 space-y-6">
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">About Creator</h4>
                    <p className="text-sm text-slate-300 leading-relaxed italic bg-slate-950/30 p-4 rounded-xl border border-slate-850">
                      "{creatorDetails.bio || "No description provided."}"
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recent Content Showcase</h4>
                    {creatorDetails.portfolio?.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">No portfolio items synced yet.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {creatorDetails.portfolio?.map((post: any) => (
                          <div
                            key={post.id}
                            className="bg-slate-950/30 border border-slate-850 rounded-xl overflow-hidden group hover:border-slate-700/60 transition-colors"
                          >
                            <div className="aspect-video bg-slate-950 relative overflow-hidden">
                              <img
                                src={post.mediaUrl}
                                alt={post.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                            <div className="p-3">
                              <p className="text-xs font-bold text-slate-200 truncate">{post.title || "Social Post"}</p>
                              <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed mt-1">
                                {post.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
