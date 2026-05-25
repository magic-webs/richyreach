"use client";

import React, { useEffect, useState } from "react";
import { useMockAuth } from "../../layout-shell";
import { api } from "@/lib/api-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function InfluencerProfilePage() {
  const { user, updateUser } = useMockAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  // Form states
  const [instagramHandle, setInstagramHandle] = useState("");
  const [niche, setNiche] = useState("Tech & Gadgets");
  const [pricingUsd, setPricingUsd] = useState("150");
  const [skillsText, setSkillsText] = useState("");

  const niches = [
    "Fashion & Styling",
    "Tech & Gadgets",
    "Fitness & Health",
    "Travel & Adventure",
    "Food & Culinary",
    "Gaming",
    "Beauty & Cosmetics",
  ];

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.api.influencers[":id"].$get({
        param: { id: user.id },
      });
      if (res.ok) {
        const result = await res.json();
        if (result.success && result.data) {
          const profileData = result.data;
          setProfile(profileData);
          setInstagramHandle(profileData.instagramHandle || "");
          setNiche(profileData.niche || "Tech & Gadgets");
          setPricingUsd((profileData.pricing / 100).toString());
          setSkillsText(profileData.skills ? profileData.skills.join(", ") : "");
          // Sync changes back to auth context if necessary
          updateUser({
            instagramHandle: profileData.instagramHandle,
            avatar: profileData.avatar || user.avatar,
          });
        }
      }
    } catch (err) {
      console.error("Failed to load influencer profile", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user.role === "influencer") {
      fetchProfile();
    }
  }, [user.role, user.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instagramHandle) return;

    try {
      setSaving(true);
      const pricingCents = Math.round(parseFloat(pricingUsd) * 100) || 0;
      const skills = skillsText
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const res = await api.api.influencers.profile.$post({
        json: {
          instagramHandle,
          pricing: pricingCents,
          niche,
          skills,
        },
      });

      if (res.ok) {
        const result = await res.json();
        if (result.success) {
          setProfile(result.data);
          updateUser({
            instagramHandle: result.data.instagramHandle,
            avatar: result.data.avatar,
          });
          alert("Profile updated successfully!");
        } else {
          alert("Error: " + JSON.stringify(result.error));
        }
      } else {
        const errorText = await res.text();
        alert("Failed to save: " + errorText);
      }
    } catch (error) {
      console.error(error);
      alert("An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  };

  if (user.role !== "influencer") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6 bg-slate-900/30 border border-slate-800/80 rounded-3xl backdrop-blur-md">
        <h2 className="text-xl font-bold text-slate-300 mb-2">Access Restricted</h2>
        <p className="text-slate-400 max-w-md mb-6">
          This onboarding page is only accessible to creators. Please use the sandbox controls in the sidebar to switch your role to **Influencer View**.
        </p>
        <div className="animate-bounce text-indigo-400">
          <svg className="w-8 h-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
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
          <span className="relative inline-flex rounded-full h-6 w-6 bg-indigo-600"></span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-slate-900/80 to-indigo-950/40 p-8 rounded-3xl border border-slate-800/80 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] -mr-20 -mt-20"></div>
        <div className="flex items-center gap-5 z-10">
          <img
            src={profile?.avatar || user.avatar}
            alt={profile?.name || user.name}
            className="w-20 h-20 rounded-2xl border-2 border-indigo-500/50 bg-slate-800 p-1"
          />
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300">
              {profile ? `@${profile.instagramHandle}` : "Setup your Profile"}
            </h1>
            <p className="text-slate-400 text-sm mt-1">{user.name} • Creator Account</p>
            {profile?.verified && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 mt-2 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                Verified Creator
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Stats Overview (Only visible once profile is created/scraped) */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-slate-900/40 border-slate-800/80 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-base text-slate-300">Instagram Stats</CardTitle>
              <CardDescription>Deterministic values mock scraped on handle sync</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {!profile ? (
                <div className="text-center py-6 text-sm text-slate-500">
                  Enter your Instagram handle and save to sync social stats.
                </div>
              ) : (
                <>
                  <div className="p-4 rounded-2xl bg-slate-950/65 border border-slate-800/60 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Followers</p>
                      <p className="text-2xl font-black text-white mt-1">
                        {profile.followers?.toLocaleString()}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-lg">
                      {profile.level?.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-950/65 border border-slate-800/60">
                      <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Engagement</p>
                      <p className="text-lg font-black text-emerald-400 mt-1">{profile.engagementRate}%</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-950/65 border border-slate-800/60">
                      <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Avg. Views</p>
                      <p className="text-lg font-black text-indigo-300 mt-1">
                        {profile.avgViews ? profile.avgViews.toLocaleString() : "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider px-1">Bio Description</p>
                    <div className="p-3 rounded-2xl bg-slate-950/65 border border-slate-800/40 text-xs text-slate-300 leading-relaxed italic">
                      "{profile.bio}"
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {profile?.skills && profile.skills.length > 0 && (
            <Card className="bg-slate-900/40 border-slate-800/80 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-base text-slate-300">Expertise & Skills</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {profile.skills.map((skill: string) => (
                  <span
                    key={skill}
                    className="text-xs px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800/80 text-slate-300 font-semibold"
                  >
                    {skill}
                  </span>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Profile Settings Form */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="bg-slate-900/40 border-slate-800/80 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-xl text-white">Creator Setup</CardTitle>
              <CardDescription>Sync your accounts and manage collaboration details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="instagramHandle" className="text-slate-300 text-xs font-bold uppercase">
                    Instagram Handle
                  </Label>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-slate-500 font-semibold">@</span>
                    <Input
                      id="instagramHandle"
                      placeholder="username"
                      value={instagramHandle}
                      onChange={(e) => setInstagramHandle(e.target.value)}
                      className="pl-8 bg-slate-950/60 border-slate-800/80 text-white rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20"
                      required
                    />
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Syncs mock data based on the handle. Type any name to see deterministic stat changes.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="niche" className="text-slate-300 text-xs font-bold uppercase">
                      Content Niche
                    </Label>
                    <Select value={niche} onValueChange={(val) => val && setNiche(val)}>
                      <SelectTrigger className="bg-slate-950/60 border-slate-800/80 text-white rounded-xl">
                        <SelectValue placeholder="Select Niche" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800 text-slate-300">
                        {niches.map((n) => (
                          <SelectItem key={n} value={n} className="hover:bg-slate-800 focus:bg-slate-800">
                            {n}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pricing" className="text-slate-300 text-xs font-bold uppercase">
                      Base Rate per Post (USD)
                    </Label>
                    <div className="relative">
                      <span className="absolute left-4 top-3 text-slate-500 font-semibold">$</span>
                      <Input
                        id="pricing"
                        type="number"
                        min="0"
                        placeholder="150"
                        value={pricingUsd}
                        onChange={(e) => setPricingUsd(e.target.value)}
                        className="pl-8 bg-slate-950/60 border-slate-800/80 text-white rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="skills" className="text-slate-300 text-xs font-bold uppercase">
                    Skills (Comma separated)
                  </Label>
                  <Input
                    id="skills"
                    placeholder="Short-form video, Product photography, Storyboarding"
                    value={skillsText}
                    onChange={(e) => setSkillsText(e.target.value)}
                    className="bg-slate-950/60 border-slate-800/80 text-white rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Syncing & Saving...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89H17.75" />
                      </svg>
                      Sync & Save Profile
                    </>
                  )}
                </button>
              </form>
            </CardContent>
          </Card>

          {/* Scraped Portfolio Feed (if any) */}
          {profile?.portfolio && profile.portfolio.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white pl-1">Recent Content Portfolio</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {profile.portfolio.map((post: any) => (
                  <div
                    key={post.id}
                    className="group bg-slate-900/40 border border-slate-800/80 rounded-2xl overflow-hidden backdrop-blur-md hover:border-slate-700/60 transition-all"
                  >
                    <div className="relative aspect-square bg-slate-950 overflow-hidden">
                      <img
                        src={post.mediaUrl}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {post.mediaType === "video" && (
                        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                          </svg>
                          <span className="text-[10px] font-bold text-white">REEL</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4 space-y-1">
                      <p className="text-xs font-bold text-slate-200 line-clamp-1">
                        {post.title || "Instagram Post"}
                      </p>
                      <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">
                        {post.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
