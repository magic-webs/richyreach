"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../../layout-shell";
import { api } from "@/lib/api-client";
import { Trophy, Coins, Users, Search, Target, ArrowRight, Verified } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

export default function ArenaLeaderboardPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { user } = useAuth();
  
  const [arena, setArena] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  const [accounts, setAccounts] = useState<any[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");

  useEffect(() => {
    if (id) {
      fetchData();
      fetchAccounts();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch all arenas to get details for this one
      const arenasRes = await api("/arena");
      if (arenasRes.ok) {
        const arenasJson = await arenasRes.json() as any;
        const found = (arenasJson.data || []).find((a: any) => a.id === id);
        if (found) {
          setArena(found);
        } else {
          toast.error("Arena not found");
          router.push("/influencer/arena");
          return;
        }
      }

      // Fetch leaderboard
      const lbRes = await api(`/arena/${id}/leaderboard`);
      if (lbRes.ok) {
        const lbJson = await lbRes.json() as any;
        setLeaderboard(lbJson.data || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  };

  const fetchAccounts = async () => {
    try {
      const res = await api("/influencers/accounts");
      if (res.ok) {
        const json = await res.json() as any;
        setAccounts(json.data || []);
        if (json.data?.length > 0) {
          setSelectedAccountId(json.data[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAccounts(false);
    }
  };

  const handleJoin = async () => {
    setJoining(true);
    try {
      const res = await api(`/arena/${id}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ influencerAccountId: selectedAccountId })
      });
      const json = await res.json() as any;
      if (res.ok && json.success) {
        toast.success("Successfully joined the Arena!");
        fetchData(); // Refresh leaderboard
      } else {
        toast.error(json.error || "Failed to join");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-pulse">
        <Skeleton className="h-10 w-48 rounded-xl" />
        <Skeleton className="h-[200px] w-full rounded-3xl" />
        <Skeleton className="h-[400px] w-full rounded-3xl" />
      </div>
    );
  }

  if (!arena) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 animate-fade-in">
      
      {/* Back button */}
      <div>
        <button 
          onClick={() => router.push("/influencer/arena")}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors font-bold uppercase"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Arenas
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xl animate-in slide-in-from-bottom-4 duration-500">
        <div className="p-6 md:p-8 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
              {arena.brandLogo ? (
                <Image src={arena.brandLogo} alt="Logo" width={64} height={64} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-2xl">
                  {arena.brandName.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">{arena.title} Leaderboard</h2>
              <p className="text-sm font-semibold text-slate-500 mt-1">Brand: {arena.brandName}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs font-bold text-violet-600 bg-violet-500/10 px-2.5 py-1 rounded-md border border-violet-500/20 uppercase tracking-wider">
                  Cap: {arena.maxReachCap ? (arena.maxReachCap / 1000).toFixed(0) + 'k' : 'Uncapped'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col md:items-end justify-center">
            {leaderboard.some(p => p.influencerId === user?.id) ? (
              <button disabled className="px-6 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-500 font-bold rounded-xl shadow-sm">
                Joined
              </button>
            ) : !loadingAccounts && accounts.length === 0 ? (
              <div className="flex flex-col items-start md:items-end gap-2">
                <div className="text-xs text-rose-500 font-semibold bg-rose-50 dark:bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-100 dark:border-rose-500/20">
                  You need an Influencer Profile to join!
                </div>
                <Link href="/influencer/profile">
                  <button className="px-5 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 text-sm">
                    Create Profile <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <Select value={selectedAccountId} onValueChange={(val) => val && setSelectedAccountId(val)}>
                  <SelectTrigger className="w-[180px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-sm font-semibold h-[42px] rounded-xl focus:ring-1 focus:ring-primary/20">
                    <SelectValue placeholder="Select Profile">
                      {selectedAccountId && accounts.find(a => a.id === selectedAccountId) ? (
                        <div className="flex items-center">
                          {accounts.find(a => a.id === selectedAccountId)?.verified && <Verified className="w-3.5 h-3.5 text-primary mr-1.5" />}
                          <span className="truncate">{accounts.find(a => a.id === selectedAccountId)?.instagramHandle}</span>
                        </div>
                      ) : "Select Profile"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map(acc => (
                      <SelectItem key={acc.id} value={acc.id} className="text-sm cursor-pointer">
                        <div className="flex items-center">
                          {acc.verified && <Verified className="w-3.5 h-3.5 text-primary mr-1.5" />}
                          {acc.instagramHandle}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <button 
                  onClick={handleJoin}
                  disabled={joining || !selectedAccountId}
                  className="px-6 py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-bold rounded-xl shadow-sm transition-all whitespace-nowrap h-[42px]"
                >
                  {joining ? "Joining..." : "Join Arena"}
                </button>
              </div>
            )}
          </div>
        </div>

        {leaderboard.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center">
            <Users className="w-16 h-16 text-slate-300 dark:text-slate-700 mb-4" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No Participants Yet</h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Be the first to join this arena and top the leaderboard!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="p-4 pl-6 w-16 text-center">Rank</th>
                  <th className="p-4">Creator</th>
                  <th className="p-4 text-right">Account Reach</th>
                  <th className="p-4 pr-6 text-right">Est. Earnings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {leaderboard.map((participant, index) => {
                  const rank = index + 1;
                  // For styling top 3
                  let rankColor = "text-slate-400";
                  if (rank === 1) rankColor = "text-yellow-500 font-black";
                  if (rank === 2) rankColor = "text-slate-400 font-black";
                  if (rank === 3) rankColor = "text-amber-600 font-black";

                  const cappedReach = arena.maxReachCap ? Math.min(participant.accountReach, arena.maxReachCap) : participant.accountReach;
                  const estCoins = cappedReach * 0.1; // Example algorithm
                  const estInr = estCoins / 100;

                  return (
                    <tr key={participant.id} className={`hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors ${participant.influencerId === user?.id ? 'bg-primary/5 dark:bg-primary/5' : ''}`}>
                      <td className="p-4 pl-6 text-center">
                        <span className={`text-xl ${rankColor}`}>
                          {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800 shrink-0 shadow-sm border border-slate-100 dark:border-slate-700">
                            {participant.avatar ? (
                              <Image src={participant.avatar} alt="Avatar" width={40} height={40} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-sm font-bold text-slate-500">
                                {participant.name?.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-base font-bold text-slate-900 dark:text-white leading-tight flex items-center gap-1.5">
                              {participant.instagramHandle}
                              {participant.name && <span className="text-xs text-slate-400 font-medium">({participant.name})</span>}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <span className="font-extrabold text-slate-700 dark:text-slate-200 text-lg">
                          {participant.accountReach.toLocaleString()}
                        </span>
                        {arena.maxReachCap && participant.accountReach > arena.maxReachCap && (
                          <div className="text-[10px] text-rose-500 font-bold uppercase mt-0.5">
                            Capped at {(arena.maxReachCap / 1000).toFixed(0)}k
                          </div>
                        )}
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <div className="inline-flex flex-col items-end">
                          <span className="font-black text-amber-500 text-lg flex items-center gap-1">
                            <Coins className="w-4 h-4" /> {Math.floor(estCoins).toLocaleString()}
                          </span>
                          <span className="text-xs font-bold text-slate-400">
                            ≈ ₹{estInr.toFixed(2)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
