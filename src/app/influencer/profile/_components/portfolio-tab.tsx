import React from "react";

interface PortfolioTabProps {
  profile: any;
}

export function PortfolioTab({ profile }: PortfolioTabProps) {
  if (!profile || !profile.portfolio?.length) {
    return (
      <div className="text-center py-16 bg-white/60 dark:bg-slate-900/30 border border-dashed border-slate-300 dark:border-slate-700 rounded-3xl mx-2 sm:mx-0">
        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 sm:w-7 sm:h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm px-4">No portfolio items yet. Sync your Instagram to populate.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {profile.portfolio.map((post: any) => (
        <div key={post.id} className="group relative overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/50 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
          <div className="aspect-square overflow-hidden">
            <img src={post.mediaUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
          </div>
          {post.mediaType === "video" && (
            <div className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 bg-black/60 backdrop-blur-md px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg flex items-center gap-1">
              <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-rose-400" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" /></svg>
              <span className="text-[8px] sm:text-[9px] font-bold text-white">REEL</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-2 sm:p-3">
            <p className="text-[10px] sm:text-xs font-bold text-white line-clamp-2">{post.title || "Post"}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
