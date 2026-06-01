"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../layout-shell";
import { api } from "@/lib/api-client";
import { Campaign, Application } from "./_components/types";
import { CAMPAIGN_TYPES, SORT_OPTIONS } from "./_components/utils";
import { CampaignCard } from "./_components/campaign-card";
import { ApplicationCard } from "./_components/application-card";
import { InviteCard } from "./_components/invite-card";
import { LayoutGrid, Video, Image, Smartphone, CalendarDays, Clock, ArrowDown, ArrowUp } from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

const typeIcons: Record<string, React.ReactNode> = {
  "All Types": <LayoutGrid className="w-5 h-5 mb-1" />,
  "reel": <Video className="w-5 h-5 mb-1" />,
  "post": <Image className="w-5 h-5 mb-1" />,
  "story": <Smartphone className="w-5 h-5 mb-1" />,
  "long-term": <CalendarDays className="w-5 h-5 mb-1" />,
};

const sortIcons: Record<string, React.ReactNode> = {
  "recent": <Clock className="w-5 h-5 mb-1" />,
  "budget_desc": <ArrowDown className="w-5 h-5 mb-1" />,
  "budget_asc": <ArrowUp className="w-5 h-5 mb-1" />,
};

export default function InfluencerMarketplacePage() {
  const { user } = useAuth();
  const router = useRouter();

  const queryClient = useQueryClient();
  const [view, setView] = useState<"browse" | "applications">("browse");
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All Types");
  const [sort, setSort] = useState("recent");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);

  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    setIsDesktop(media.matches);
    const listener = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, filterType, sort]);

  const { data: campaigns = [], isLoading: loadingCampaigns } = useQuery({
    queryKey: ["marketplaceCampaigns", search],
    queryFn: async () => {
      const res = await api.api.influencers["marketplace-campaigns"].$get({ query: { search, limit: "30" } });
      if (!res.ok) throw new Error("Failed to load campaigns");
      const r = await res.json();
      return r.success && r.data ? (r.data as Campaign[]) : [];
    },
    enabled: user.role === "influencer",
  });

  const { data: applications = { applications: [], invites: [] }, isLoading: loadingApplications } = useQuery({
    queryKey: ["marketplaceApplications"],
    queryFn: async () => {
      const res = await api.api.influencers.campaigns.$get();
      if (!res.ok) throw new Error("Failed to load applications");
      const r = await res.json();
      return r.success && r.data ? (r.data as any) : { applications: [], invites: [] };
    },
    enabled: user.role === "influencer",
  });

  const saveMutation = useMutation({
    mutationFn: async (campaign: Campaign) => {
      if (campaign.isSaved) {
        await api.api.influencers["save-campaign"][":campaignId"].$delete({ param: { campaignId: campaign.id } });
      } else {
        await api.api.influencers["save-campaign"].$post({ json: { campaignId: campaign.id } });
      }
      return campaign;
    },
    onMutate: async (campaign) => {
      await queryClient.cancelQueries({ queryKey: ["marketplaceCampaigns"] });
      const previousCampaigns = queryClient.getQueryData(["marketplaceCampaigns", search]);
      queryClient.setQueryData(["marketplaceCampaigns", search], (old: Campaign[] | undefined) => {
        if (!old) return old;
        return old.map((c) => (c.id === campaign.id ? { ...c, isSaved: !c.isSaved } : c));
      });
      return { previousCampaigns };
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(["marketplaceCampaigns", search], context?.previousCampaigns);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["marketplaceCampaigns"] });
    },
  });

  const handleToggleSave = (campaign: Campaign) => {
    saveMutation.mutate(campaign);
  };

  const navToDetail = (c: Campaign) => router.push(`/influencer/campaigns/${c.id}`);

  // Filter & sort
  const filtered = campaigns
    .filter((c) => {
      if (filterType !== "All Types" && c.campaignType !== filterType) return false;
      if (search && !c.title.toLowerCase().includes(search.toLowerCase()) && !c.brandName.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sort === "budget_desc") return b.budget - a.budget;
      if (sort === "budget_asc") return a.budget - b.budget;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const recommended = filtered.filter((c) => c.isRecommended);

  const ITEMS_PER_PAGE = 5;
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginatedCampaigns = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  if (user.role !== "influencer") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8 bg-white/80 dark:bg-slate-900/30 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-xl backdrop-blur-md">
        <p className="text-slate-500 dark:text-slate-400">This page is for influencers. Switch roles to browse campaigns.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10">
      {/* ── Hero Header ── */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-xl bg-gradient-to-br from-slate-50/90 via-white/80 to-rose-50/40 dark:from-slate-900/80 dark:via-slate-900/60 dark:to-[#3F030B]/15 shadow-xl shadow-slate-200/50 dark:shadow-none p-6 md:p-8">
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-primary/10 rounded-full blur-[70px] pointer-events-none" />
        <div className="relative z-10 flex flex-col gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">Campaign Marketplace</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Browse campaigns from top brands. Apply, get discovered, monetize your reach.</p>
          </div>
          {/* Search + View toggle */}
          <div className="flex gap-3 flex-col sm:flex-row">
            <div className="relative flex-1">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input
                type="text"
                placeholder="Search campaigns or brands..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              {/* View toggle */}
              <div className="flex bg-white/70 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-700/50 rounded-xl p-0.5">
                <button onClick={() => setView("browse")} className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${view === "browse" ? "bg-primary text-white shadow" : "text-slate-500 hover:text-slate-800 dark:hover:text-white"}`}>Browse</button>
                <button onClick={() => setView("applications")} className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${view === "applications" ? "bg-primary text-white shadow" : "text-slate-500 hover:text-slate-800 dark:hover:text-white"}`}>
                  My Activity
                  {applications.applications.length > 0 && <span className="text-[9px] w-4 h-4 flex items-center justify-center rounded-full bg-white/30">{applications.applications.length}</span>}
                </button>
              </div>

              {/* Layout toggle (only in browse view) */}
              {view === "browse" && (
                <div className="hidden sm:flex bg-white/70 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-700/50 rounded-xl p-0.5">
                  <button onClick={() => setLayout("grid")} className={`p-2 rounded-lg transition-all ${layout === "grid" ? "bg-white dark:bg-slate-700 text-primary shadow-sm" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"}`} title="Grid View">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                  </button>
                  <button onClick={() => setLayout("list")} className={`p-2 rounded-lg transition-all ${layout === "list" ? "bg-white dark:bg-slate-700 text-primary shadow-sm" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"}`} title="List View">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
                  </button>
                </div>
              )}

              {/* Filters toggle */}
              <Drawer open={showFilters} onOpenChange={setShowFilters} direction={isDesktop ? "right" : "bottom"}>
                <DrawerTrigger asChild>
                  <button className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${showFilters ? "bg-primary text-white border-primary" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500"}`}>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                    Filters
                  </button>
                </DrawerTrigger>
                <DrawerContent>
                  <div className="mx-auto w-full max-w-sm flex flex-col h-full">
                    <DrawerHeader className="shrink-0 text-left">
                      <DrawerTitle className="text-xl font-extrabold text-slate-900 dark:text-white">Filters & Sort</DrawerTitle>
                      <DrawerDescription className="text-slate-500">Refine your campaign search</DrawerDescription>
                    </DrawerHeader>
                    <div className="p-6 overflow-y-auto space-y-8 flex-1 md:max-h-none max-h-[60vh]">
                      {/* Type Filter */}
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Campaign Type</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {CAMPAIGN_TYPES.map((t) => (
                            <button
                              key={t}
                              onClick={() => setFilterType(t)}
                              className={`flex flex-col items-center justify-center p-3 rounded-2xl text-[10px] font-bold transition-all border ${filterType === t ? "bg-primary/10 border-primary text-primary shadow-sm" : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-slate-900"}`}
                            >
                              {typeIcons[t]}
                              <span className="capitalize">{t}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Sort By */}
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Sort By</h3>
                        <div className="grid grid-cols-2 gap-3">
                          {SORT_OPTIONS.map((o) => (
                            <button
                              key={o.value}
                              onClick={() => setSort(o.value)}
                              className={`flex flex-col items-center justify-center p-3 rounded-2xl text-[11px] font-bold transition-all border ${sort === o.value ? "bg-primary/10 border-primary text-primary shadow-sm" : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-slate-900"}`}
                            >
                              {sortIcons[o.value]}
                              <span className="text-center">{o.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <DrawerFooter>
                      <DrawerClose asChild>
                        <button className="w-full py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-lg">
                          Apply Filters
                        </button>
                      </DrawerClose>
                    </DrawerFooter>
                  </div>
                </DrawerContent>
              </Drawer>
            </div>
          </div>


        </div>
      </div>

      {/* ── Browse View ── */}
      {view === "browse" && (
        <div className="space-y-8">
          {loadingCampaigns ? (
            <div className={`grid gap-4 ${layout === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={`rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/20 p-5 flex flex-col gap-4 ${layout === "grid" ? "h-[220px]" : "h-[220px] sm:h-[120px]"}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2 animate-pulse" />
                      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/3 animate-pulse" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-3/4 animate-pulse" />
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full animate-pulse" />
                  </div>
                  <div className={`mt-auto flex gap-2 ${layout === "list" ? "sm:hidden" : ""}`}>
                    <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl flex-1 animate-pulse" />
                    <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl flex-1 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 bg-white/60 dark:bg-slate-900/30 border border-dashed border-slate-300 dark:border-slate-700 rounded-3xl">
              <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <p className="text-slate-500 text-sm font-semibold">No campaigns found</p>
              <p className="text-slate-400 text-xs mt-1">Try a different search or filter</p>
            </div>
          ) : (
            <>
              {/* Recommended strip */}
              {recommended.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Recommended for You</h2>
                    <span className="text-xs text-slate-400 font-semibold">{recommended.length} matches</span>
                  </div>
                  <div className={`grid gap-4 ${layout === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
                    {recommended.slice(0, layout === "grid" ? 3 : 2).map((c) => (
                      <CampaignCard key={c.id} campaign={c} onApply={() => navToDetail(c)} onToggleSave={handleToggleSave} onView={() => navToDetail(c)} layout={layout} />
                    ))}
                  </div>
                </div>
              )}

              {/* All campaigns */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-white">All Campaigns</h2>
                  <span className="text-xs text-slate-400 font-semibold">{filtered.length} available</span>
                </div>
                <div className={`grid gap-4 ${layout === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
                  {paginatedCampaigns.map((c) => (
                    <CampaignCard key={c.id} campaign={c} onApply={() => navToDetail(c)} onToggleSave={handleToggleSave} onView={() => navToDetail(c)} layout={layout} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-8">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-slate-600 dark:text-slate-300"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                    </button>

                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-300 px-4">
                      Page {page} of {totalPages}
                    </span>

                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-slate-600 dark:text-slate-300"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── My Activity ── */}
      {view === "applications" && (
        <div className="space-y-6">
          {/* Applications */}
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white mb-4">My Applications ({applications.applications.length})</h2>
            {loadingApplications ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-white/50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-4 h-[74px]">
                    <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse shrink-0" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3 animate-pulse" />
                      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/4 animate-pulse" />
                    </div>
                    <div className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse shrink-0" />
                  </div>
                ))}
              </div>
            ) : applications.applications.length === 0 ? (
              <div className="text-center py-10 bg-white/60 dark:bg-slate-900/30 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl">
                <p className="text-slate-400 text-sm">No applications yet. Browse campaigns and apply!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {applications.applications.map((app: Application) => (
                  <ApplicationCard key={app.applicationId} application={app} />
                ))}
              </div>
            )}
          </div>

          {/* Invites */}
          {applications.invites.length > 0 && (
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white mb-4">Campaign Invites ({applications.invites.length})</h2>
              <div className="space-y-3">
                {applications.invites.map((inv: any) => (
                  <InviteCard
                    key={inv.inviteId}
                    invite={inv}
                    onNavigate={(id) => {
                      const camp = campaigns.find((c) => c.id === id);
                      if (camp) navToDetail(camp);
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
