import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Calculator, Compass, ChevronRight } from "lucide-react";

export function CreatorResources() {
  return (
    <Card className="bg-white/85 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md shadow-lg shadow-slate-100/50 dark:shadow-none">
      <CardHeader>
        <CardTitle className="text-base text-slate-900 dark:text-slate-200">Creator Resources</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3.5 text-xs text-slate-600 dark:text-slate-400">
        <Link
          href="/calculators"
          className="group flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/50 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-150 dark:border-slate-850 hover:border-slate-300 dark:hover:border-slate-700/60 font-semibold text-slate-700 dark:text-slate-300 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-100/50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
              <Calculator className="w-4 h-4" />
            </div>
            <span>Earnings & Reach Calculator</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors" />
        </Link>

        <Link
          href="/marketplace"
          className="group flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/50 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-150 dark:border-slate-855 hover:border-slate-300 dark:hover:border-slate-700/60 font-semibold text-slate-700 dark:text-slate-300 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Compass className="w-4 h-4" />
            </div>
            <span>Browse Live Campaigns</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors" />
        </Link>
      </CardContent>
    </Card>
  );
}
