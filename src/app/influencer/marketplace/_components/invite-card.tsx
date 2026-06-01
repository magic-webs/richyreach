"use client";

import React from "react";
import { fmtBudget } from "./utils";

export function InviteCard({ invite, onNavigate }: { invite: any, onNavigate: (id: string) => void }) {
  return (
    <div className="bg-white/80 dark:bg-slate-900/40 border border-violet-500/30 dark:border-violet-500/20 rounded-2xl p-4 backdrop-blur-md shadow-md dark:shadow-none flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0">
        <svg className="w-5 h-5 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-slate-900 dark:text-white text-sm truncate">{invite.campaignTitle}</p>
        <p className="text-xs text-slate-400 truncate">{invite.brandName} &middot; {fmtBudget(invite.budget)}</p>
      </div>
      <span className="text-[10px] font-black px-2.5 py-1 rounded-lg border text-violet-600 bg-violet-500/10 border-violet-500/20 shrink-0 hidden sm:inline-block">Invited</span>
      <button
        onClick={() => onNavigate(invite.campaignId)}
        className="text-xs font-bold text-primary hover:text-primary/80 transition-colors shrink-0"
      >
        View &rarr;
      </button>
    </div>
  );
}
