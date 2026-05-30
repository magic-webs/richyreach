"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "../../layout-shell";

// ──────────────────────────────────────────────────────────────
// Status Badge
// ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const cls =
    status === "verified"
      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
      : status === "rejected"
      ? "bg-rose-500/15 text-rose-400 border-rose-500/30"
      : "bg-amber-500/15 text-amber-400 border-amber-500/30";
  return (
    <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${cls}`}>
      {status}
    </span>
  );
}

// ──────────────────────────────────────────────────────────────
// Influencer Account Row
// ──────────────────────────────────────────────────────────────
function InfluencerAccountCard({ account, onVerify }: { account: any; onVerify: (id: string, type: "influencer" | "brand", action: "approve" | "reject", note?: string) => void }) {
  const [note, setNote] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [acting, setActing] = useState(false);

  function fmtFollowers(n: number) {
    return n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);
  }

  return (
    <div className="bg-white/80 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-5 space-y-4 hover:border-slate-300 dark:hover:border-slate-700/60 transition-colors shadow-sm dark:shadow-none">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-yellow-400 via-rose-500 to-purple-600 flex items-center justify-center text-white text-sm font-black shadow-md shrink-0">
            IG
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-bold text-slate-900 dark:text-white text-sm">@{account.instagramHandle}</p>
              <StatusBadge status={account.status} />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              <span className="font-semibold text-slate-700 dark:text-slate-300">{account.ownerName}</span>
              {" · "}{account.ownerEmail}
            </p>
          </div>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors shrink-0 cursor-pointer"
        >
          <svg className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
        {[
          { label: "Followers", val: fmtFollowers(account.followers || 0) },
          { label: "Engagement", val: `${(account.engagementRate || 0).toFixed(1)}%` },
          { label: "Avg Views", val: fmtFollowers(account.avgViews || 0) },
          { label: "Pricing", val: `$${((account.pricing || 0) / 100).toFixed(0)}/post` },
        ].map((m) => (
          <div key={m.label} className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800/40 rounded-xl p-2.5">
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">{m.label}</p>
            <p className="text-base font-black text-slate-900 dark:text-slate-200 mt-0.5">{m.val}</p>
          </div>
        ))}
      </div>

      {expanded && (
        <div className="space-y-3 pt-1 border-t border-slate-200 dark:border-slate-800/40">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div><span className="text-slate-500">Niche:</span> <span className="text-slate-800 dark:text-slate-200 font-semibold">{account.niche}</span></div>
            <div><span className="text-slate-500">Level:</span> <span className="text-slate-800 dark:text-slate-200 font-semibold capitalize">{account.level}</span></div>
            <div><span className="text-slate-500">Country:</span> <span className="text-slate-800 dark:text-slate-200 font-semibold">{account.country || "—"}</span></div>
            <div><span className="text-slate-500">Submitted:</span> <span className="text-slate-800 dark:text-slate-200 font-semibold">{new Date(account.createdAt).toLocaleDateString()}</span></div>
          </div>
          {account.bio && (
            <p className="text-xs text-slate-600 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800/40">"{account.bio}"</p>
          )}
          {account.verificationNote && (
            <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl">Note: {account.verificationNote}</p>
          )}
        </div>
      )}

      {account.status === "pending" && (
        <div className="flex flex-col sm:flex-row gap-3 pt-1 border-t border-slate-200 dark:border-slate-800/40">
          <input
            type="text"
            placeholder="Optional rejection note..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="flex-1 px-3 py-2 text-xs bg-white dark:bg-slate-950/60 border border-slate-300 dark:border-slate-700/60 rounded-xl text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-slate-500"
          />
          <div className="flex gap-2">
            <button
              disabled={acting}
              onClick={async () => { setActing(true); await onVerify(account.id, "influencer", "approve", note); setActing(false); }}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
            >
              ✓ Approve
            </button>
            <button
              disabled={acting}
              onClick={async () => { setActing(true); await onVerify(account.id, "influencer", "reject", note); setActing(false); }}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
            >
              ✗ Reject
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Brand Account Row
// ──────────────────────────────────────────────────────────────
function BrandAccountCard({ account, onVerify }: { account: any; onVerify: (id: string, type: "influencer" | "brand", action: "approve" | "reject", note?: string) => void }) {
  const [note, setNote] = useState("");
  const [acting, setActing] = useState(false);

  return (
    <div className="bg-white/80 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-5 space-y-4 hover:border-slate-300 dark:hover:border-slate-700/60 transition-colors shadow-sm dark:shadow-none">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {account.logo ? (
            <img src={account.logo} alt={account.companyName} className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0" />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white text-sm font-black shadow-md shrink-0">
              {account.companyName?.[0]?.toUpperCase() || "B"}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-bold text-slate-900 dark:text-white text-sm">{account.companyName}</p>
              <StatusBadge status={account.status} />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              <span className="font-semibold text-slate-700 dark:text-slate-300">{account.ownerName}</span>
              {" · "}{account.ownerEmail}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div><span className="text-slate-500">Category:</span> <span className="text-slate-800 dark:text-slate-200 font-semibold">{account.category}</span></div>
        <div><span className="text-slate-500">Size:</span> <span className="text-slate-800 dark:text-slate-200 font-semibold capitalize">{account.brandSize}</span></div>
        <div><span className="text-slate-500">Budget:</span> <span className="text-slate-800 dark:text-slate-200 font-semibold capitalize">{account.budgetRange}</span></div>
        <div><span className="text-slate-500">Instagram:</span> <span className="text-slate-800 dark:text-slate-200 font-semibold">{account.instagramPage || "—"}</span></div>
      </div>

      {account.description && (
        <p className="text-xs text-slate-600 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800/40">"{account.description}"</p>
      )}
      {account.website && (
        <a href={account.website} target="_blank" rel="noreferrer" className="inline-block text-xs text-violet-400 hover:underline">🔗 {account.website}</a>
      )}
      {account.verificationNote && (
        <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl">Note: {account.verificationNote}</p>
      )}

      {account.status === "pending" && (
        <div className="flex flex-col sm:flex-row gap-3 pt-1 border-t border-slate-200 dark:border-slate-800/40">
          <input
            type="text"
            placeholder="Optional rejection note..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="flex-1 px-3 py-2 text-xs bg-white dark:bg-slate-950/60 border border-slate-300 dark:border-slate-700/60 rounded-xl text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-slate-500"
          />
          <div className="flex gap-2">
            <button
              disabled={acting}
              onClick={async () => { setActing(true); await onVerify(account.id, "brand", "approve", note); setActing(false); }}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
            >
              ✓ Approve
            </button>
            <button
              disabled={acting}
              onClick={async () => { setActing(true); await onVerify(account.id, "brand", "reject", note); setActing(false); }}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
            >
              ✗ Reject
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Main Page
// ──────────────────────────────────────────────────────────────
export default function AdminProfilesPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"influencer" | "brand">("influencer");
  const [filterStatus, setFilterStatus] = useState<"pending" | "verified" | "rejected">("pending");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{ influencerAccounts: any[]; brandAccounts: any[]; counts: any } | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchProfiles = async (status: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/pending-profiles?status=${status}`, { credentials: "include" });
      const json = await res.json() as any;
      if (json.success) setData(json.data);
    } catch (err) {
      showToast("Failed to load profiles", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user.role === "admin") fetchProfiles(filterStatus);
    // eslint-disable-next-line
  }, [user.role, filterStatus]);

  const handleVerify = async (accountId: string, accountType: "influencer" | "brand", action: "approve" | "reject", note?: string) => {
    try {
      const res = await fetch("/api/admin/verify-profile", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId, accountType, action, note }),
      });
      const json = await res.json() as any;
      if (json.success) {
        showToast(`Profile ${action === "approve" ? "approved ✓" : "rejected ✗"} successfully`);
        fetchProfiles(filterStatus);
      } else {
        showToast(json.error || "Failed to verify profile", "error");
      }
    } catch (err: any) {
      showToast(err?.message || "Network error", "error");
    }
  };

  if (user.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-slate-400">Admin access required.</p>
      </div>
    );
  }

  const influencerList = data?.influencerAccounts || [];
  const brandList = data?.brandAccounts || [];

  const tabs = [
    { id: "influencer" as const, label: `Influencer Accounts`, count: influencerList.length },
    { id: "brand" as const, label: `Brand Accounts`, count: brandList.length },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl text-sm font-bold shadow-2xl border transition-all ${toast.type === "success" ? "bg-emerald-950 border-emerald-700 text-emerald-300" : "bg-rose-950 border-rose-700 text-rose-300"}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Profile Verification Queue</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Review and verify submitted influencer & brand sub-accounts</p>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60 rounded-2xl w-fit">
        {(["pending", "verified", "rejected"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${filterStatus === s ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"}`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Summary counts */}
      {data?.counts && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total", val: data.counts.total, color: "text-slate-900 dark:text-slate-200" },
            { label: "Influencer Accts", val: data.counts.influencer, color: "text-violet-600 dark:text-violet-400" },
            { label: "Brand Accts", val: data.counts.brand, color: "text-indigo-600 dark:text-indigo-400" },
          ].map((m) => (
            <div key={m.label} className="bg-white/80 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60 shadow-sm dark:shadow-none rounded-2xl p-4 text-center">
              <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">{m.label}</p>
              <p className={`text-2xl font-black mt-1 ${m.color}`}>{m.val}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100/50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800/50 rounded-2xl p-1.5">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${activeTab === t.id ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"}`}
          >
            {t.label}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${activeTab === t.id ? "bg-slate-100 dark:bg-white/20 text-slate-900 dark:text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400"}`}>{t.count}</span>
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500" />
        </div>
      ) : (
        <div className="space-y-4">
          {activeTab === "influencer" ? (
            influencerList.length === 0 ? (
              <div className="text-center py-16 text-slate-500 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl">
                No {filterStatus} influencer accounts found.
              </div>
            ) : (
              influencerList.map((acc: any) => (
                <InfluencerAccountCard key={acc.id} account={acc} onVerify={handleVerify} />
              ))
            )
          ) : (
            brandList.length === 0 ? (
              <div className="text-center py-16 text-slate-500 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl">
                No {filterStatus} brand accounts found.
              </div>
            ) : (
              brandList.map((acc: any) => (
                <BrandAccountCard key={acc.id} account={acc} onVerify={handleVerify} />
              ))
            )
          )}
        </div>
      )}
    </div>
  );
}
