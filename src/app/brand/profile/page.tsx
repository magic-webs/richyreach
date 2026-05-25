"use client";

import React, { useEffect, useState } from "react";
import { useMockAuth } from "../../layout-shell";
import { api } from "@/lib/api-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function BrandProfilePage() {
  const { user, updateUser } = useMockAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  // Form states
  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");
  const [category, setCategory] = useState("Technology & SaaS");
  const [description, setDescription] = useState("");
  const [logo, setLogo] = useState("");

  const categories = [
    "Technology & SaaS",
    "Fashion & Apparel",
    "Beauty & Cosmetics",
    "Travel & Leisure",
    "Food & Beverage",
    "Health & Fitness",
    "Gaming & Esports",
    "E-Commerce",
  ];

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.api.brands.profile.$get();
      if (res.ok) {
        const result = await res.json();
        if (result.success && result.data) {
          const profileData = result.data;
          setProfile(profileData);
          setCompanyName(profileData.companyName || "");
          setWebsite(profileData.website || "");
          setCategory(profileData.category || "Technology & SaaS");
          setDescription(profileData.description || "");
          setLogo(profileData.logo || "");
          // Sync changes back to auth context if necessary
          updateUser({
            companyName: profileData.companyName,
            avatar: profileData.logo || user.avatar,
          });
        }
      }
    } catch (err) {
      console.error("Failed to load brand profile", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user.role === "brand") {
      fetchProfile();
    }
  }, [user.role, user.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!website) return;

    try {
      setSaving(true);
      const res = await api.api.brands.profile.$post({
        json: {
          companyName,
          website,
          category,
          description: description || null,
          logo: logo || null,
        },
      });

      if (res.ok) {
        const result = await res.json();
        if (result.success) {
          setProfile(result.data);
          setCompanyName(result.data.companyName || "");
          setCategory(result.data.category || "Technology & SaaS");
          setDescription(result.data.description || "");
          setLogo(result.data.logo || "");
          updateUser({
            companyName: result.data.companyName,
            avatar: result.data.logo || user.avatar,
          });
          alert("Brand profile updated successfully! website metadata auto-scraped.");
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

  if (user.role !== "brand") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6 bg-slate-900/30 border border-slate-800/80 rounded-3xl backdrop-blur-md">
        <h2 className="text-xl font-bold text-slate-300 mb-2">Access Restricted</h2>
        <p className="text-slate-400 max-w-md mb-6">
          This onboarding page is only accessible to brands. Please use the sandbox controls in the sidebar to switch your role to **Brand View**.
        </p>
        <div className="animate-bounce text-indigo-400">
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
          <span className="relative inline-flex rounded-full h-6 w-6 bg-indigo-600"></span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Brand Hero Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-slate-900/80 to-purple-950/40 p-8 rounded-3xl border border-slate-800/80 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px] -mr-20 -mt-20"></div>
        <div className="flex items-center gap-5 z-10">
          <img
            src={logo || `https://api.dicebear.com/7.x/initials/svg?seed=${companyName || "Brand"}`}
            alt={companyName || "Brand logo"}
            className="w-20 h-20 rounded-2xl border-2 border-purple-500/50 bg-slate-800 p-1 object-contain"
          />
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300">
              {profile ? profile.companyName : "Register your Brand"}
            </h1>
            <p className="text-slate-400 text-sm mt-1">{user.name} • Brand Partner Account</p>
            {website && (
              <a
                href={website}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 mt-2 font-semibold transition-colors"
              >
                {website.replace("https://", "").replace("http://", "")}
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Brand Details Card */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-slate-900/40 border-slate-800/80 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-base text-slate-300">Brand Identity</CardTitle>
              <CardDescription>Live preview of your brand profile widget</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-5 rounded-2xl bg-slate-950/65 border border-slate-800/60 text-center space-y-4">
                <img
                  src={logo || `https://api.dicebear.com/7.x/initials/svg?seed=${companyName || "Brand"}`}
                  alt="Brand Preview Logo"
                  className="w-16 h-16 rounded-xl mx-auto border border-slate-800/80 p-1 bg-slate-900/40 object-contain"
                />
                <div>
                  <h3 className="text-lg font-bold text-white">{companyName || "Your Company"}</h3>
                  <span className="inline-block text-[10px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 mt-1.5 rounded-full border border-purple-500/20">
                    {category}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                  {description || "Provide a description or save your website URL to auto-pull details."}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/65 border border-slate-800/60 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-semibold uppercase">Verification Status</span>
                  <span className="text-amber-400 font-bold bg-amber-400/10 px-2 py-0.5 rounded-md">Pending</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-semibold uppercase">Campaign Count</span>
                  <span className="text-white font-bold">0 Active</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Brand Information Form */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="bg-slate-900/40 border-slate-800/80 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-xl text-white">Brand Setup</CardTitle>
              <CardDescription>Setup your company and auto-fetch metadata from your website</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="website" className="text-slate-300 text-xs font-bold uppercase">
                    Website URL
                  </Label>
                  <Input
                    id="website"
                    placeholder="https://example.com"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="bg-slate-950/60 border-slate-800/80 text-white rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20"
                    required
                  />
                  <p className="text-[10px] text-slate-500">
                    On save, our metadata-fetcher automatically scrapes the website's logo, descriptions, and category!
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="companyName" className="text-slate-300 text-xs font-bold uppercase">
                      Company Name (Override)
                    </Label>
                    <Input
                      id="companyName"
                      placeholder="My Company Inc."
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="bg-slate-950/60 border-slate-800/80 text-white rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-slate-300 text-xs font-bold uppercase">
                      Company Category
                    </Label>
                    <Select value={category} onValueChange={(val) => val && setCategory(val)}>
                      <SelectTrigger className="bg-slate-950/60 border-slate-800/80 text-white rounded-xl">
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800 text-slate-300">
                        {categories.map((c) => (
                          <SelectItem key={c} value={c} className="hover:bg-slate-800 focus:bg-slate-800">
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logo" className="text-slate-300 text-xs font-bold uppercase">
                    Logo Image URL (Optional)
                  </Label>
                  <Input
                    id="logo"
                    placeholder="https://example.com/logo.png"
                    value={logo}
                    onChange={(e) => setLogo(e.target.value)}
                    className="bg-slate-950/60 border-slate-800/80 text-white rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-slate-300 text-xs font-bold uppercase">
                    Description / About (Optional)
                  </Label>
                  <textarea
                    id="description"
                    rows={4}
                    placeholder="Tell us what your brand is about..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-3.5 text-sm bg-slate-950/60 border border-slate-800/80 text-white rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 focus:outline-none placeholder-slate-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-purple-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Scraping & Saving...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                      Scrape Website & Save
                    </>
                  )}
                </button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
