"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../layout-shell";
import { Trophy, Coins, Users, Search, Target, Rocket, ArrowRight } from "lucide-react";
import { api } from "@/lib/api-client";
import Image from "next/image";
import Link from "next/link";

export default function ArenaPage() {
    const { user } = useAuth();
    const [arenas, setArenas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchArenas();
    }, []);

    const fetchArenas = async () => {
        setLoading(true);
        try {
            const res = await api.api.arena.$get();
            if (res.ok) {
                const json = (await res.json()) as any;
                setArenas(json.data || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Leaderboard logic moved to dynamic page

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[50vh]">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20">

            {/* Header */}
            <div className="bg-gradient-to-br from-[#3F030B] to-[#7E1523] rounded-3xl p-6 md:p-10 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2 max-w-xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-sm border border-white/20 mb-2">
                            <Trophy className="w-4 h-4 text-yellow-400" />
                            Creator Arena
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
                            Compete & Earn
                        </h1>
                        <p className="text-white/80 font-medium">
                            Join active brand contests. Generate the most reach and top the leaderboard to win direct cash rewards to your wallet!
                        </p>
                    </div>
                    <div className="flex flex-col gap-3 bg-black/20 p-4 rounded-2xl backdrop-blur-md border border-white/10">
                        <h4 className="text-sm font-bold uppercase text-white/90">Payout Rules</h4>
                        <div className="flex items-center gap-2 text-sm text-yellow-300 font-bold">
                            <Coins className="w-5 h-5" />
                            100 Coins = ₹1
                        </div>
                        <p className="text-xs text-white/70">Coins are paid for account reach up to the campaign's max cap limit.</p>
                    </div>
                </div>
            </div>
            <div className="space-y-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Rocket className="w-5 h-5 text-primary" /> Active Contests
                </h2>

                {arenas.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-500">
                        No active arenas at the moment. Check back later!
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {arenas.map(arena => (
                            <Link
                                href={`/influencer/arena/${arena.id}`}
                                key={arena.id}
                                className="p-6 rounded-3xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all group flex flex-col h-full"
                            >
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                                        {arena.brandLogo ? (
                                            <Image src={arena.brandLogo} alt="Logo" width={48} height={48} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-xl">
                                                {arena.brandName.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-primary truncate">{arena.brandName}</p>
                                        <h3 className="font-bold text-lg text-slate-900 dark:text-white truncate group-hover:text-primary transition-colors">{arena.title}</h3>
                                    </div>
                                </div>

                                <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                                        <Target className="w-4 h-4" />
                                        Cap: {arena.maxReachCap ? (arena.maxReachCap / 1000).toFixed(0) + 'k' : 'Uncapped'}
                                    </div>
                                    <span className="text-sm font-bold text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                        View <ArrowRight className="w-4 h-4" />
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}