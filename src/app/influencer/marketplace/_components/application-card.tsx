"use client";

import React from "react";
import { Application } from "./types";
import { STATUS_COLORS, fmtBudget, timeAgo } from "./utils";

export function ApplicationCard({ application }: { application: Application }) {
  return (
    <div className="bg-white/80 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-4 backdrop-blur-md shadow-md dark:shadow-none flex items-center gap-4">
      <img src={application.brandLogo || `https://api.dicebear.com/7.x/initials/svg?seed=${application.brandName}`} alt={application.brandName} className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 p-1 bg-white dark:bg-slate-800 object-contain shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-bold text-slate-900 dark:text-white text-sm truncate">{application.campaignTitle}</p>
        <p className="text-xs text-slate-400 truncate">{application.brandName} &middot; {fmtBudget(application.budget)} &middot; {timeAgo(application.createdAt)}</p>
      </div>
      <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border shrink-0 ${STATUS_COLORS[application.status]}`}>{application.status.charAt(0).toUpperCase() + application.status.slice(1)}</span>
    </div>
  );
}
