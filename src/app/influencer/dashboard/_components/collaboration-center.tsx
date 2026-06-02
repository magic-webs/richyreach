import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { GlassButton } from "@/components/ui/glass-button";
import { MessageSquare, IndianRupee, ArrowRight, Clock, CheckCircle2, FileText } from "lucide-react";

interface CollaborationCenterProps {
  campaignsData: any;
  campaignsLoading: boolean;
}

export function CollaborationCenter({ campaignsData, campaignsLoading }: CollaborationCenterProps) {
  return (
    <Card className="bg-white/85 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md shadow-lg shadow-slate-100/50 dark:shadow-none h-full flex flex-col">
      <CardHeader className="border-b border-slate-150 dark:border-slate-800/40 pb-4">
        <CardTitle className="text-lg text-slate-900 dark:text-white">Collaboration Center</CardTitle>
        <CardDescription>Track applications, invites, and contract statuses</CardDescription>
      </CardHeader>
      <CardContent className="px-4 pt-6 flex-1">
        <Tabs defaultValue="applications" className="flex flex-col h-full space-y-6">
          <TabsList className="bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-850 p-1 rounded-xl grid grid-cols-2 w-full max-w-md mx-auto sm:mx-0">
            <TabsTrigger value="applications" className="rounded-lg text-xs sm:text-sm mr-2 font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 shadow-sm transition-all">
              Proposals ({campaignsData.applications?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="invites" className="rounded-lg text-xs sm:text-sm font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 shadow-sm transition-all">
              Invites ({campaignsData.invites?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="invites" className="space-y-4 focus-visible:outline-none flex-1">
            {campaignsLoading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/45 border border-slate-150 dark:border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-2 w-full">
                    <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                    <div className="h-5 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                    <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                  </div>
                  <div className="h-10 w-full sm:w-24 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse mt-2 sm:mt-0" />
                </div>
              ))
            ) : campaignsData.invites?.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-12 px-4 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20 border border-dashed border-slate-200 dark:border-slate-800">
                <MessageSquare className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" />
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No invitations yet</h3>
                <p className="text-slate-500 text-xs mt-1 max-w-sm">
                  Keep your profile updated and apply to campaigns to increase your chances of being invited.
                </p>
              </div>
            ) : (
              campaignsData.invites.map((invite: any) => (
                <div
                  key={invite.inviteId}
                  className="group p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/45 border border-slate-150 dark:border-slate-800/60 hover:border-primary/30 dark:hover:border-primary/30 hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20 text-primary">
                      <Clock className="w-3 h-3" />
                      <span className="text-[10px] font-extrabold uppercase tracking-wide">
                        Inbound Invite
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                      {invite.campaignTitle}
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                      {invite.campaignDescription}
                    </p>
                  </div>
                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 sm:gap-2 shrink-0 mt-2 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-150 dark:border-slate-800/60">
                    <div className="text-left sm:text-right">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 sm:justify-end">
                        <IndianRupee className="w-3 h-3" /> Budget Offer
                      </p>
                      <p className="text-lg font-extrabold text-primary">
                        ₹{((invite.budget || 0) / 100).toLocaleString()}
                      </p>
                    </div>
                    <GlassButton
                      href="/influencer/chat"
                      variant="primary"
                      size="sm"
                      className="w-auto px-6"
                    >
                      Negotiate
                    </GlassButton>
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="applications" className="space-y-4 focus-visible:outline-none flex-1">
            {campaignsLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/45 border border-slate-150 dark:border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-2 w-full">
                    <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                    <div className="h-5 w-56 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                    <div className="h-4 w-2/3 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                  </div>
                  <div className="h-10 w-full sm:w-24 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse mt-2 sm:mt-0" />
                </div>
              ))
            ) : campaignsData.applications?.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-12 px-4 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20 border border-dashed border-slate-200 dark:border-slate-800">
                <FileText className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" />
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No active proposals</h3>
                <p className="text-slate-500 text-xs mt-1 max-w-sm mb-4">
                  You haven't applied to any campaigns yet. Browse the marketplace to discover opportunities.
                </p>
                <Link
                  href="/influencer/marketplace"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:text-primary/80 transition-colors bg-primary/10 px-4 py-2 rounded-full"
                >
                  Browse Marketplace <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            ) : (
              campaignsData.applications.map((app: any) => (
                <div
                  key={app.applicationId}
                  className="group p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/45 border border-slate-150 dark:border-slate-800/60 hover:border-slate-200 dark:hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">Proposal</span>
                      {app.instagramHandle && (
                        <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                          @{app.instagramHandle}
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${app.status === "accepted"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                          : app.status === "pending"
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                            : "bg-rose-500/10 text-rose-650 dark:text-rose-400 border-rose-500/20"
                          }`}
                      >
                        {app.status === "accepted" && <CheckCircle2 className="w-3 h-3" />}
                        {app.status === "pending" && <Clock className="w-3 h-3" />}
                        {app.status}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                      {app.campaignTitle}
                    </h4>
                    <div className="bg-white/60 dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/80">
                      <p className="text-xs text-slate-600 dark:text-slate-400 italic line-clamp-2">
                        "{app.proposal}"
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 sm:gap-2 shrink-0 mt-2 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-150 dark:border-slate-800/60 w-full sm:w-auto">
                    <div className="text-left sm:text-right">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 sm:justify-end">
                        <IndianRupee className="w-3 h-3" /> Budget
                      </p>
                      <p className="text-base sm:text-lg font-extrabold text-slate-700 dark:text-slate-200">
                        ₹{((app.budget || 0) / 100).toLocaleString()}
                      </p>
                    </div>
                    {app.status === "accepted" ? (
                      <Link
                        href="/influencer/chat"
                        className="inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-5 rounded-lg text-xs sm:text-sm shadow-sm shadow-emerald-500/20 transition-all w-auto whitespace-nowrap"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        Open Chat
                      </Link>
                    ) : (
                      <div className="h-9 hidden sm:block"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
