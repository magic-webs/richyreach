"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GlassPurpleButton } from "@/components/ui/glass-purple-button";
import { NICHES, COUNTRIES } from "./shared";

interface SettingsTabProps {
  instagramHandle: string; setInstagramHandle: (v: string) => void;
  niche: string; setNiche: (v: string) => void;
  pricingUsd: string; setPricingUsd: (v: string) => void;
  skillsText: string; setSkillsText: (v: string) => void;
  country: string; setCountry: (v: string) => void;
  twitter: string; setTwitter: (v: string) => void;
  tiktok: string; setTiktok: (v: string) => void;
  youtube: string; setYoutube: (v: string) => void;
  saving: boolean;
  saveError: string | null;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

export function SettingsTab({
  instagramHandle, setInstagramHandle,
  niche, setNiche,
  pricingUsd, setPricingUsd,
  skillsText, setSkillsText,
  country, setCountry,
  twitter, setTwitter,
  tiktok, setTiktok,
  youtube, setYoutube,
  saving,
  saveError,
  handleSubmit
}: SettingsTabProps) {
  return (
    <div className="bg-white/80 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-5 sm:p-6 md:p-8 backdrop-blur-md shadow-lg shadow-slate-100/40 dark:shadow-none">
      <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-6">Edit Creator Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Removed Instagram Link & Sync */}
        <div className="hidden">
          <Label className="text-xs font-bold uppercase text-slate-600 dark:text-slate-300">Instagram Account</Label>
          <div className="relative flex items-center">
            <span className="absolute left-4 text-slate-400 font-bold select-none">@</span>
            <Input id="handle" placeholder="username" value={instagramHandle} onChange={(e) => setInstagramHandle(e.target.value)} className="pl-9 bg-white dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary/20" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
          {/* Niche */}
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase text-slate-600 dark:text-slate-300">Content Niche</Label>
            <Select value={niche} onValueChange={(v) => v && setNiche(v)}>
              <SelectTrigger className="bg-white dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 rounded-xl h-11"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                {NICHES.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {/* Country */}
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase text-slate-600 dark:text-slate-300">Country</Label>
            <Select value={country} onValueChange={(v) => v && setCountry(v)}>
              <SelectTrigger className="bg-white dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 rounded-xl h-11"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                {COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {/* Pricing Usd (if needed, otherwise skip, since it wasn't in the original UI but there is state for it) */}
          <div className="space-y-2 hidden">
             <Label className="text-xs font-bold uppercase text-slate-600 dark:text-slate-300">Pricing USD</Label>
             <Input placeholder="150" value={pricingUsd} onChange={e => setPricingUsd(e.target.value)} className="h-11" />
          </div>
        </div>

        {/* Skills */}
        <div className="space-y-2">
          <Label htmlFor="skills" className="text-xs font-bold uppercase text-slate-600 dark:text-slate-300">Skills (comma-separated)</Label>
          <Input id="skills" placeholder="Short-form video, Product photography, Storyboarding" value={skillsText} onChange={(e) => setSkillsText(e.target.value)} className="bg-white dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 rounded-xl focus:border-primary h-11" />
        </div>

        {/* Social links */}
        <div className="space-y-3">
          <Label className="text-xs font-bold uppercase text-slate-600 dark:text-slate-300">Social Links (optional)</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="relative flex items-center"><span className="absolute left-4 text-[10px] font-black text-sky-500 select-none">𝕏</span><Input placeholder="Twitter username" value={twitter} onChange={(e) => setTwitter(e.target.value)} className="pl-9 h-11 bg-white dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 rounded-xl" /></div>
            <div className="relative flex items-center"><span className="absolute left-4 text-[10px] font-black text-pink-500 select-none">TK</span><Input placeholder="TikTok username" value={tiktok} onChange={(e) => setTiktok(e.target.value)} className="pl-9 h-11 bg-white dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 rounded-xl" /></div>
            <div className="relative flex items-center"><span className="absolute left-4 text-[10px] font-black text-rose-500 select-none">YT</span><Input placeholder="YouTube channel" value={youtube} onChange={(e) => setYoutube(e.target.value)} className="pl-9 h-11 bg-white dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 rounded-xl" /></div>
          </div>
        </div>

        <div className="pt-2">
          <GlassPurpleButton type="submit" disabled={saving} className="w-full h-12">
            {saving ? (
              <><svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>Saving...</>
            ) : (
              <><svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89H17.75" /></svg>Save Profile</>
            )}
          </GlassPurpleButton>
        </div>

        {saveError && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400">
            <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
            <p className="text-xs font-semibold leading-snug">{saveError}</p>
          </div>
        )}
      </form>

    </div>
  );
}
