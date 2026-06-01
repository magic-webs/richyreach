"use client";

import React from "react";
import { Campaign } from "./types";
import { BUDGET_LABEL, fmtBudget, timeAgo } from "./utils";

export function CampaignCard({
  campaign,
  onApply,
  onToggleSave,
  onView,
  layout = "grid"
}: {
  campaign: Campaign;
  onApply: (c: Campaign) => void;
  onToggleSave: (c: Campaign) => void;
  onView: (c: Campaign) => void;
  layout?: "grid" | "list";
}) {
  const budgetInfo = BUDGET_LABEL(campaign.budget);
  const isList = layout === "list";

  return (
    <div className={`group relative overflow-hidden rounded-2xl bg-white/80 dark:bg-slate-900/40 border backdrop-blur-md shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.01] ${campaign.isRecommended ? "border-primary/40 dark:border-primary/30" : "border-slate-200/70 dark:border-slate-800/60"} flex ${isList ? "flex-col sm:flex-row" : "flex-col"}`}>
      {/* Recommended glow */}
      {campaign.isRecommended && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
      )}
      {/* Invited badge */}
      {campaign.isInvited && (
        <div className={`absolute z-10 text-[9px] font-black px-2 py-0.5 rounded-full bg-violet-600 text-white ${isList ? "top-3 right-3 sm:top-5 sm:right-5" : "top-3 right-3"}`}>INVITED</div>
      )}
      {campaign.isRecommended && !campaign.isInvited && (
        <div className={`absolute z-10 text-[9px] font-black px-2 py-0.5 rounded-full bg-primary text-white ${isList ? "top-3 right-3 sm:top-5 sm:right-5" : "top-3 right-3"}`}>FOR YOU</div>
      )}

      <div className={`relative z-10 p-5 flex-1 flex ${isList ? "flex-col sm:flex-row sm:items-center gap-4 sm:gap-6" : "flex-col space-y-3"}`}>
        
        {/* List layout left side (Brand & Title) */}
        <div className={`${isList ? "flex-1 min-w-0" : "space-y-3"}`}>
          {/* Brand row */}
          <div className="flex items-center gap-2.5 mb-3">
            <img
              src={campaign.brandLogo || `https://api.dicebear.com/7.x/initials/svg?seed=${campaign.brandName}`}
              alt={campaign.brandName}
              className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1 object-contain"
            />
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{campaign.brandName}</p>
            </div>
          </div>

          {/* Title */}
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-sm leading-tight line-clamp-2">{campaign.title}</h3>
          </div>
        </div>

        {/* List layout right/middle side (Tags & Budget) */}
        <div className={`${isList ? "flex flex-col sm:items-end justify-between gap-3 sm:w-[220px] shrink-0 mt-3 sm:mt-0" : "space-y-3 mt-3"}`}>
          {/* Tags */}
          <div className={`flex flex-wrap gap-1.5 ${isList ? "sm:justify-end" : ""}`}>
            <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg border ${budgetInfo.cls}`}>{budgetInfo.label}</span>
            <span className="text-[9px] font-black px-2 py-0.5 rounded-lg border text-violet-600 bg-violet-500/10 border-violet-500/20 uppercase">{campaign.campaignType}</span>
            <span className={`text-[9px] font-bold text-slate-400 ${isList ? "hidden sm:inline-block" : "ml-auto"}`}>{timeAgo(campaign.createdAt)}</span>
          </div>

          {/* Budget + Deliverables */}
          <div className={`flex items-center ${isList ? "sm:justify-end sm:text-right gap-6" : ""}`}>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold">Budget</p>
              <p className="text-lg font-black text-slate-900 dark:text-white leading-none mt-0.5">{fmtBudget(campaign.budget)}</p>
            </div>
            {isList && (
               <span className="text-[9px] font-bold text-slate-400 sm:hidden ml-auto">{timeAgo(campaign.createdAt)}</span>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className={`relative z-10 px-5 pb-5 flex gap-2 ${isList ? "sm:p-5 sm:flex-col sm:justify-center sm:w-[160px] sm:border-l sm:border-slate-200/50 dark:sm:border-slate-700/50" : ""}`}>
        <div className={`flex gap-2 w-full ${isList ? "sm:hidden" : ""}`}>
          <button
            onClick={() => onToggleSave(campaign)}
            className={`flex-shrink-0 w-9 h-9 rounded-xl border transition-all flex items-center justify-center ${campaign.isSaved ? "bg-primary/10 border-primary/30 text-primary" : "border-slate-200 dark:border-slate-700 text-slate-400 hover:text-primary hover:border-primary/30 hover:bg-primary/5"}`}
            title={campaign.isSaved ? "Remove from saved" : "Save campaign"}
          >
            <svg className="w-4 h-4" fill={campaign.isSaved ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
          </button>
          <button
            onClick={() => onView(campaign)}
            className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          >
            View Details
          </button>
          {campaign.isApplied ? (
            <div className="flex-1 py-2 rounded-xl text-xs font-bold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>Applied
            </div>
          ) : (
            <button
              onClick={() => onApply(campaign)}
              className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-primary to-rose-700 hover:from-primary/90 hover:to-rose-600 shadow-md shadow-primary/20 hover:shadow-primary/30 transition-all cursor-pointer"
            >
              Apply Now
            </button>
          )}
        </div>

        {/* Desktop List Actions */}
        {isList && (
           <div className="hidden sm:flex flex-col gap-2 w-full">
             {campaign.isApplied ? (
               <div className="w-full py-2.5 rounded-xl text-xs font-bold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center gap-1">
                 <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>Applied
               </div>
             ) : (
               <button
                 onClick={() => onApply(campaign)}
                 className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-primary to-rose-700 hover:from-primary/90 hover:to-rose-600 shadow-md shadow-primary/20 hover:shadow-primary/30 transition-all cursor-pointer"
               >
                 Apply Now
               </button>
             )}
             <button
                onClick={() => onView(campaign)}
                className="w-full py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              >
                View Details
              </button>
             <button
                onClick={() => onToggleSave(campaign)}
                className={`w-full py-2 rounded-xl border transition-all flex items-center justify-center gap-1.5 text-xs font-bold ${campaign.isSaved ? "bg-primary/10 border-primary/30 text-primary" : "border-slate-200 dark:border-slate-700 text-slate-500 hover:text-primary hover:border-primary/30 hover:bg-primary/5"}`}
              >
                <svg className="w-3.5 h-3.5" fill={campaign.isSaved ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                {campaign.isSaved ? "Saved" : "Save"}
              </button>
           </div>
        )}
      </div>
    </div>
  );
}
