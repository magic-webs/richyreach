"use client";

import React, { useRef, useState } from "react";
import { useAuth } from "../../layout-shell";
import Link from "next/link";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Image as ImageIcon, Music, Megaphone, Calculator, MessageSquare, Layers, Send, Bell } from "lucide-react";

export default function AdminDashboardPage() {
  const { user } = useAuth();

  const [quickTitle, setQuickTitle] = useState("");
  const [quickBody, setQuickBody] = useState("");
  const [quickImageUrl, setQuickImageUrl] = useState("");
  const quickImageInputRef = useRef<HTMLInputElement>(null);

  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api("/media/upload", { method: "POST", body: formData });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !(json as any).success) {
        throw new Error((json as any).error || "Failed to upload image");
      }
      return (json as any).data.url as string;
    },
    onSuccess: (url) => setQuickImageUrl(url),
    onError: (err: any) => toast.error(err.message || "Failed to upload image"),
  });

  const quickSendMutation = useMutation({
    mutationFn: async () => {
      const res = await api("/admin/notifications/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: quickTitle.trim(),
          body: quickBody.trim(),
          imageUrl: quickImageUrl || undefined,
          target: { mode: "all" },
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !(json as any).success) {
        throw new Error((json as any).error || "Failed to send notification");
      }
      return json;
    },
    onSuccess: () => {
      toast.success("Broadcast queued for all users");
      setQuickTitle("");
      setQuickBody("");
      setQuickImageUrl("");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to send notification");
    },
  });

  const handleQuickSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim() || !quickBody.trim()) {
      toast.error("Title and body are required");
      return;
    }
    quickSendMutation.mutate();
  };

  const { data, isLoading } = useQuery({
    queryKey: ["adminDashboardData"],
    queryFn: async () => {
      const [repRes, usersRes, campRes, profRes] = await Promise.all([
        api("/admin/reports"),
        api("/admin/users"),
        api("/admin/campaigns"),
        api("/admin/pending-profiles?status=pending"),
      ]);

      const rep = await repRes.json() as any;
      const usrs = await usersRes.json() as any;
      const camps = await campRes.json() as any;
      const profs = await profRes.json() as any;

      return {
        reports: rep.success ? rep.data : null,
        users: usrs.success ? usrs.data.slice(0, 5) : [],
        campaigns: camps.success ? camps.data.slice(0, 5) : [],
        pendingCount: profs.success ? (profs.data.counts?.total || 0) : 0,
      };
    },
    enabled: user.role === "admin",
  });

  if (user.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-slate-500">Admin access required.</p>
      </div>
    );
  }

  // Calculate totals from reports
  const reports = data?.reports;
  const totalUsers = reports?.usersByRole?.reduce((acc: number, curr: any) => acc + curr.count, 0) || 0;
  const influencerCount = reports?.usersByRole?.find((r: any) => r.role === "influencer")?.count || 0;
  const brandCount = reports?.usersByRole?.find((r: any) => r.role === "brand")?.count || 0;
  const totalCampaigns = reports?.campaignSummary?.totalCount || 0;
  const totalBudget = (reports?.campaignSummary?.totalBudgetsCents || 0) / 100;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-sm font-medium text-primary">Admin Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Platform overview and recent activity</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Skeleton className="h-[140px] rounded-3xl" />
            <Skeleton className="h-[140px] rounded-3xl" />
            <Skeleton className="h-[140px] rounded-3xl" />
            <Skeleton className="h-[140px] rounded-3xl" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-[300px] rounded-3xl" />
            <Skeleton className="h-[300px] rounded-3xl" />
          </div>
        </div>
      ) : (
        <>
          {/* Top Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/60 rounded-3xl p-6 shadow-sm dark:shadow-none relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-20">
                <svg className="w-12 h-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              </div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider relative z-10">Total Users</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-2 relative z-10">{totalUsers}</h3>
              <div className="flex gap-3 mt-3 text-[10px] font-bold text-slate-400 relative z-10">
                <span>{influencerCount} INFLUENCERS</span>
                <span>{brandCount} BRANDS</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/60 rounded-3xl p-6 shadow-sm dark:shadow-none relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-20">
                <svg className="w-12 h-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              </div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider relative z-10">Active Campaigns</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-2 relative z-10">{totalCampaigns}</h3>
            </div>

            <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/60 rounded-3xl p-6 shadow-sm dark:shadow-none relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-20">
                <svg className="w-12 h-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider relative z-10">Total Campaign Budget</p>
              <h3 className="text-3xl font-black text-primary/90 mt-2 relative z-10">₹{totalBudget.toLocaleString("en-IN")}</h3>
            </div>

            <Link href="/admin/profiles" className="bg-primary/5 dark:bg-primary/10 border border-primary/10 dark:border-primary/20 rounded-3xl p-6 shadow-sm dark:shadow-none relative overflow-hidden group hover:scale-[1.02] transition-transform cursor-pointer">
              <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
                <svg className="w-12 h-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <p className="text-xs font-bold text-primary/70 uppercase tracking-wider relative z-10">Pending Verifications</p>
              <h3 className="text-3xl font-black text-primary mt-2 relative z-10">{data?.pendingCount || 0}</h3>
              <div className="flex items-center gap-1 mt-3 text-xs font-bold text-primary relative z-10">
                Review Profiles
                <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
              </div>
            </Link>
          </div>

          {/* Quick Send Notification */}
          <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/60 rounded-3xl p-6 shadow-sm dark:shadow-none relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Bell size={16} />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-primary uppercase tracking-wider">Send Notification</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Quickly broadcast a push notification to all users</p>
                </div>
              </div>
              <Link href="/admin/notifications" className="text-xs font-bold text-primary hover:underline whitespace-nowrap shrink-0">
                Advanced options
              </Link>
            </div>

            <form onSubmit={handleQuickSend} className="mt-4 space-y-3">
              <Input
                value={quickTitle}
                onChange={(e) => setQuickTitle(e.target.value)}
                placeholder="Notification title"
                maxLength={80}
              />
              <Textarea
                value={quickBody}
                onChange={(e) => setQuickBody(e.target.value)}
                placeholder="Write your message..."
                maxLength={200}
                rows={2}
              />
              <input
                ref={quickImageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadImageMutation.mutate(file);
                }}
              />
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    disabled={uploadImageMutation.isPending}
                    onClick={() => quickImageInputRef.current?.click()}
                  >
                    <ImageIcon size={14} />
                    {uploadImageMutation.isPending ? "Uploading..." : quickImageUrl ? "Change image" : "Add image"}
                  </Button>
                  {quickImageUrl && (
                    <img src={quickImageUrl} alt="" className="h-8 w-8 rounded-lg object-cover border border-slate-200 dark:border-slate-800/60" />
                  )}
                </div>
                <Button type="submit" size="sm" disabled={quickSendMutation.isPending || uploadImageMutation.isPending} className="gap-2">
                  <Send size={14} />
                  {quickSendMutation.isPending ? "Sending..." : "Send to all users"}
                </Button>
              </div>
            </form>
          </div>

          {/* Administration Console */}
          <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/60 rounded-3xl p-6 shadow-sm dark:shadow-none relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-primary/5 to-indigo-500/5 rounded-full blur-2xl pointer-events-none"></div>
            <div>
              <h2 className="text-sm font-semibold text-primary uppercase tracking-wider">Administration Console</h2>
              <p className="text-xs text-slate-500 mt-1">Manage platform content and assets</p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-6">
              {/* Campaign Images */}
              <Link href="/admin/campaign-images" className="group flex flex-col justify-between p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-900 hover:border-primary/50 dark:hover:border-primary/50 transition-all hover:scale-[1.03] shadow-sm">
                <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 w-fit group-hover:scale-110 transition-transform">
                  <ImageIcon size={20} />
                </div>
                <div className="mt-4">
                  <h3 className="font-bold text-xs text-slate-900 dark:text-white">Campaigns</h3>
                  <p className="text-[10px] text-slate-400 mt-1">Verify gallery images</p>
                </div>
              </Link>

              {/* Arena Banners */}
              <Link href="/admin/arena-images" className="group flex flex-col justify-between p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-900 hover:border-primary/50 dark:hover:border-primary/50 transition-all hover:scale-[1.03] shadow-sm">
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500 w-fit group-hover:scale-110 transition-transform">
                  <Layers size={20} />
                </div>
                <div className="mt-4">
                  <h3 className="font-bold text-xs text-slate-900 dark:text-white">Arena Banners</h3>
                  <p className="text-[10px] text-slate-400 mt-1">Configure slides</p>
                </div>
              </Link>

              {/* Trending Songs */}
              <Link href="/admin/trending-songs" className="group flex flex-col justify-between p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-900 hover:border-primary/50 dark:hover:border-primary/50 transition-all hover:scale-[1.03] shadow-sm">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 w-fit group-hover:scale-110 transition-transform">
                  <Music size={20} />
                </div>
                <div className="mt-4">
                  <h3 className="font-bold text-xs text-slate-900 dark:text-white">Trending Songs</h3>
                  <p className="text-[10px] text-slate-400 mt-1">Curate popular audio</p>
                </div>
              </Link>

              {/* Promo Banners */}
              <Link href="/admin/banners" className="group flex flex-col justify-between p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-900 hover:border-primary/50 dark:hover:border-primary/50 transition-all hover:scale-[1.03] shadow-sm">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 w-fit group-hover:scale-110 transition-transform">
                  <Megaphone size={20} />
                </div>
                <div className="mt-4">
                  <h3 className="font-bold text-xs text-slate-900 dark:text-white">Promo Banners</h3>
                  <p className="text-[10px] text-slate-400 mt-1">Manage marketing sliders</p>
                </div>
              </Link>

              {/* Calculators */}
              <Link href="/calculators" className="group flex flex-col justify-between p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-900 hover:border-primary/50 dark:hover:border-primary/50 transition-all hover:scale-[1.03] shadow-sm">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 w-fit group-hover:scale-110 transition-transform">
                  <Calculator size={20} />
                </div>
                <div className="mt-4">
                  <h3 className="font-bold text-xs text-slate-900 dark:text-white">Calculators</h3>
                  <p className="text-[10px] text-slate-400 mt-1">ROI & pricing metrics</p>
                </div>
              </Link>

              {/* Messaging */}
              <Link href="/admin/chat" className="group flex flex-col justify-between p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-900 hover:border-primary/50 dark:hover:border-primary/50 transition-all hover:scale-[1.03] shadow-sm">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500 w-fit group-hover:scale-110 transition-transform">
                  <MessageSquare size={20} />
                </div>
                <div className="mt-4">
                  <h3 className="font-bold text-xs text-slate-900 dark:text-white">Messaging</h3>
                  <p className="text-[10px] text-slate-400 mt-1">Platform active chats</p>
                </div>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Users */}
            <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/60 rounded-3xl shadow-sm dark:shadow-none overflow-hidden flex flex-col">
              <div className="p-5 border-b border-slate-200 dark:border-slate-800/60 flex justify-between items-center bg-slate-50 dark:bg-transparent">
                <h2 className="text-sm font-medium text-primary">Recent Users</h2>
              </div>
              <div className="divide-y divide-slate-200 dark:divide-slate-800/60 flex-1">
                {!data?.users || data.users.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-sm">No users found.</div>
                ) : (
                  data.users.map((u: any) => (
                    <div key={u.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/80 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300">
                          {u.name?.charAt(0) || u.email?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-slate-900 dark:text-white">{u.name || "Unnamed"}</p>
                          <p className="text-xs text-slate-500">{u.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${u.role === "admin" ? "bg-primary/20 text-primary border-primary/30" :
                          u.role === "brand" ? "bg-primary/10 text-primary border-primary/20" :
                            "bg-primary/5 text-primary border-primary/10"
                          }`}>
                          {u.role}
                        </span>
                        <p className="text-[10px] text-slate-400 mt-1">{new Date(u.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Campaigns */}
            <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/60 rounded-3xl shadow-sm dark:shadow-none overflow-hidden flex flex-col">
              <div className="p-5 border-b border-slate-200 dark:border-slate-800/60 flex justify-between items-center bg-slate-50 dark:bg-transparent">
                <h2 className="text-sm font-medium text-primary">Recent Campaigns</h2>
              </div>
              <div className="divide-y divide-slate-200 dark:divide-slate-800/60 flex-1">
                {!data?.campaigns || data.campaigns.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-sm">No campaigns found.</div>
                ) : (
                  data.campaigns.map((c: any) => (
                    <div key={c.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/80 transition-colors">
                      <div className="flex-1 min-w-0 pr-4">
                        <p className="font-bold text-sm text-slate-900 dark:text-white truncate">{c.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">by {c.companyName || "Unknown Brand"}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-black text-primary">₹{(c.budget / 100).toLocaleString("en-IN")}</p>
                        <span className={`inline-block mt-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${c.status === "active" ? "bg-primary/10 text-primary border-primary/20" :
                          "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20"
                          }`}>
                          {c.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}