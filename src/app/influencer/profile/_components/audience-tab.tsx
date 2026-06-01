import React from "react";

interface AudienceTabProps {
  profile: any;
}

export function AudienceTab({ profile }: AudienceTabProps) {
  if (!profile) {
    return <div className="text-center py-16 text-slate-400">Connect your Instagram to see audience data.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
        {/* Age distribution */}
        <div className="bg-white/80 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-5 sm:p-6 backdrop-blur-md shadow-lg shadow-slate-100/40 dark:shadow-none space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Age Distribution</h3>
          {[["13-17", 8], ["18-24", 34], ["25-34", 31], ["35-44", 17], ["45+", 10]].map(([age, pct]) => (
            <div key={age as string} className="space-y-1">
              <div className="flex justify-between text-[10px] sm:text-xs">
                <span className="font-semibold text-slate-600 dark:text-slate-300">{age}</span>
                <span className="font-black text-slate-700 dark:text-slate-200">{pct}%</span>
              </div>
              <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-rose-400 rounded-full" style={{ width: `${pct}%` }} />
              </div>
            </div>
          ))}
        </div>

        {/* Gender split */}
        <div className="bg-white/80 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-5 sm:p-6 backdrop-blur-md shadow-lg shadow-slate-100/40 dark:shadow-none space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Gender Split</h3>
          <div className="flex gap-2 mt-2">
            <div className="flex-1 h-3 rounded-full bg-blue-400" style={{ flex: 42 }} />
            <div className="flex-1 h-3 rounded-full bg-pink-400" style={{ flex: 55 }} />
            <div className="flex-1 h-3 rounded-full bg-slate-300" style={{ flex: 3 }} />
          </div>
          {[["Male", 42, "bg-blue-400 text-blue-500"], ["Female", 55, "bg-pink-400 text-pink-500"], ["Other", 3, "bg-slate-300 text-slate-500"]].map(([g, p, cls]) => (
            <div key={g as string} className="flex justify-between items-center text-[10px] sm:text-xs">
              <div className="flex items-center gap-2"><span className={`w-2.5 h-2.5 rounded-full ${(cls as string).split(" ")[0]}`} /><span className="font-semibold text-slate-600 dark:text-slate-300">{g}</span></div>
              <span className={`font-black ${(cls as string).split(" ")[1]}`}>{p}%</span>
            </div>
          ))}
        </div>

        {/* Top countries */}
        <div className="bg-white/80 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-5 sm:p-6 backdrop-blur-md shadow-lg shadow-slate-100/40 dark:shadow-none space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Top Countries</h3>
          {[["🇮🇳 India", 38], ["🇺🇸 USA", 22], ["🇬🇧 UK", 12], ["🇦🇪 UAE", 9], ["🇦🇺 Australia", 7]].map(([c, p]) => (
            <div key={c as string} className="flex justify-between items-center text-[10px] sm:text-xs">
              <span className="font-semibold text-slate-600 dark:text-slate-300 truncate pr-2 max-w-[100px] sm:max-w-[120px]">{c}</span>
              <div className="flex items-center gap-2 flex-1 justify-end">
                <div className="w-12 sm:w-20 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full"><div className="h-full bg-primary rounded-full" style={{ width: `${p}%` }} /></div>
                <span className="font-black text-slate-700 dark:text-slate-200 w-8 text-right">{p}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
