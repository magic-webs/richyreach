"use client";

import React, { useState } from "react";
import { 
    Wallet, 
    ArrowUpRight, 
    ArrowDownRight, 
    Clock, 
    CheckCircle2, 
    DownloadCloud,
    TrendingUp,
    IndianRupee,
    CreditCard
} from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar
} from "recharts";

// Mock Data
const earningsData = [
  { name: "Jan", earnings: 4500, expenses: 1200 },
  { name: "Feb", earnings: 5200, expenses: 1400 },
  { name: "Mar", earnings: 4800, expenses: 1100 },
  { name: "Apr", earnings: 6100, expenses: 1600 },
  { name: "May", earnings: 5900, expenses: 1300 },
  { name: "Jun", earnings: 7500, expenses: 1800 },
];

const transactions = [
  { id: "TX-1029", type: "Campaign Payment", brand: "Nike", amount: 1250, status: "completed", date: "Today, 10:23 AM" },
  { id: "TX-1028", type: "Withdrawal", brand: "Bank Transfer", amount: -2000, status: "completed", date: "Yesterday, 2:45 PM" },
  { id: "TX-1027", type: "Campaign Payment", brand: "Adidas", amount: 850, status: "pending", date: "Jun 12, 2026" },
  { id: "TX-1026", type: "Bonus", brand: "RichyReach", amount: 150, status: "completed", date: "Jun 10, 2026" },
  { id: "TX-1025", type: "Campaign Payment", brand: "Samsung", amount: 2100, status: "completed", date: "Jun 05, 2026" },
];

export default function EarningsPage() {
    const [timeframe, setTimeframe] = useState("6M");

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
                        Earnings & Wallet
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm md:text-base">
                        Track your campaign payouts and manage your funds.
                    </p>
                </div>
                <button className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#3F030B] to-[#7E1523] hover:from-[#3F030B]/90 hover:to-[#7E1523]/90 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-[#7E1523]/25 active:scale-[0.98]">
                    <DownloadCloud className="w-5 h-5" />
                    Withdraw Funds
                </button>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Available Balance */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#3F030B] to-[#7E1523] p-6 text-white shadow-xl shadow-[#7E1523]/20">
                    <div className="absolute top-0 right-0 p-4 opacity-20">
                        <Wallet className="w-24 h-24 transform rotate-12 translate-x-4 -translate-y-4" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 text-rose-100 mb-2">
                            <IndianRupee className="w-5 h-5" />
                            <span className="font-medium">Available Balance</span>
                        </div>
                        <div className="text-4xl md:text-5xl font-bold tracking-tight">
                            ₹12,450<span className="text-xl text-rose-200">.00</span>
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-sm text-rose-100 bg-white/10 w-fit px-3 py-1 rounded-full backdrop-blur-md">
                            <TrendingUp className="w-4 h-4" />
                            <span>+14.5% from last month</span>
                        </div>
                    </div>
                </div>

                {/* Pending Clearance */}
                <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between group hover:border-rose-300 dark:hover:border-rose-700/50 transition-colors">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
                                <Clock className="w-5 h-5 text-[#7E1523]" />
                                <span>Pending Clearance</span>
                            </div>
                            <div className="p-2 bg-rose-50 dark:bg-rose-500/10 rounded-lg group-hover:bg-rose-100 dark:group-hover:bg-rose-500/20 transition-colors">
                                <CreditCard className="w-5 h-5 text-[#7E1523]" />
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-slate-900 dark:text-white">
                            ₹2,850<span className="text-lg text-slate-400 dark:text-slate-500">.50</span>
                        </div>
                    </div>
                    <div className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                        Expected clearance in 3-5 business days.
                    </div>
                </div>

                {/* Total Earned */}
                <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between group hover:border-emerald-300 dark:hover:border-emerald-700/50 transition-colors">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                <span>Total Earned</span>
                            </div>
                            <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/20 transition-colors">
                                <Wallet className="w-5 h-5 text-emerald-500" />
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-slate-900 dark:text-white">
                            ₹45,200<span className="text-lg text-slate-400 dark:text-slate-500">.00</span>
                        </div>
                    </div>
                    <div className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                        Lifetime earnings on RichyReach.
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Earnings Overview</h2>
                        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                            {["1M", "3M", "6M", "1Y"].map((period) => (
                                <button
                                    key={period}
                                    onClick={() => setTimeframe(period)}
                                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                                        timeframe === period
                                            ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                                            : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                                    }`}
                                >
                                    {period}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={earningsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#7E1523" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#7E1523" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fontSize: 12, fill: '#64748b' }}
                                    dy={10}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fontSize: 12, fill: '#64748b' }}
                                    tickFormatter={(value) => `₹${value}`}
                                />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                                        borderRadius: '12px',
                                        border: 'none',
                                        color: '#fff',
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                                    }}
                                    itemStyle={{ color: '#e2e8f0' }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="earnings" 
                                    stroke="#7E1523" 
                                    strokeWidth={3}
                                    fillOpacity={1} 
                                    fill="url(#colorEarnings)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Activity</h2>
                        <button className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
                            View All
                        </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                        {transactions.map((tx) => (
                            <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-xl flex items-center justify-center shrink-0 ${
                                        tx.amount > 0 
                                            ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" 
                                            : "bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400"
                                    }`}>
                                        {tx.amount > 0 ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-slate-900 dark:text-white text-sm">{tx.brand}</div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400">{tx.date}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`font-bold text-sm ${tx.amount > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-slate-900 dark:text-white"}`}>
                                        {tx.amount > 0 ? "+" : ""}{tx.amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                    </div>
                                    <div className="text-[10px] uppercase font-bold text-slate-400 mt-1 tracking-wider">
                                        {tx.status}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}