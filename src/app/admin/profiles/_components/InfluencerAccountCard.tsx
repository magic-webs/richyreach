import React, { useState } from "react";
import { StatusBadge } from "./StatusBadge";

export function InfluencerAccountCard({ account, onVerify, onEdit }: { account: any; onVerify: (id: string, type: "influencer" | "brand", action: "approve" | "reject", note?: string) => void; onEdit: (account: any, type: "influencer") => void; }) {
  const [note, setNote] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [acting, setActing] = useState(false);

  function fmtFollowers(n: number) {
    return n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);
  }

  return (
    <div className="bg-primary/5 border border-primary/10 rounded-2xl p-5 space-y-4 hover:border-primary/30 transition-colors shadow-sm dark:shadow-none">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary/60 to-primary flex items-center justify-center text-primary-foreground text-sm font-black shadow-md shrink-0">
            IG
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <a 
                href={`https://instagram.com/${account.instagramHandle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-foreground text-sm hover:text-primary transition-colors hover:underline"
              >
                @{account.instagramHandle}
              </a>
              <StatusBadge status={account.status} />
            </div>
            <p className="text-xs text-primary/70 mt-0.5">
              <span className="font-semibold text-primary/90">{account.ownerName}</span>
              {" · "}{account.ownerEmail}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onEdit(account, "influencer")}
            className="text-primary/40 hover:text-primary transition-colors shrink-0 cursor-pointer"
            title="Edit Influencer Account"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-primary/50 hover:text-primary transition-colors shrink-0 cursor-pointer"
          >
            <svg className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
        {[
          { label: "Followers", val: fmtFollowers(account.followers || 0) },
          { label: "Engagement", val: `${(account.engagementRate || 0).toFixed(1)}%` },
          { label: "Avg Views", val: fmtFollowers(account.avgViews || 0) },
          { label: "Services", val: account.services?.length ? account.services.map((s: any) => s.name).join(", ") : "None" },
        ].map((m) => (
          <div key={m.label} className="bg-primary/5 border border-primary/10 rounded-xl p-2.5">
            <p className="text-[10px] uppercase font-bold text-primary/60 tracking-wider">{m.label}</p>
            <p className={`font-black text-foreground mt-0.5 ${m.label === 'Services' ? 'text-xs truncate' : 'text-base'}`} title={m.label === 'Services' ? m.val : undefined}>{m.val}</p>
          </div>
        ))}
      </div>

      {expanded && (
        <div className="space-y-3 pt-1 border-t border-primary/10">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div><span className="text-primary/60">Niche:</span> <span className="text-foreground font-semibold">{account.niche}</span></div>
            <div><span className="text-primary/60">Level:</span> <span className="text-foreground font-semibold capitalize">{account.level}</span></div>
            <div><span className="text-primary/60">Country:</span> <span className="text-foreground font-semibold">{account.country || "—"}</span></div>
            <div><span className="text-primary/60">Submitted:</span> <span className="text-foreground font-semibold">{new Date(account.createdAt).toLocaleDateString()}</span></div>
          </div>
          {account.bio && (
            <p className="text-xs text-primary/70 italic bg-primary/5 p-3 rounded-xl border border-primary/10">"{account.bio}"</p>
          )}
          {account.verificationNote && (
            <p className="text-xs text-primary bg-primary/10 border border-primary/20 p-3 rounded-xl">Note: {account.verificationNote}</p>
          )}
        </div>
      )}

      {account.status === "pending" && (
        <div className="flex flex-col sm:flex-row gap-3 pt-1 border-t border-primary/10">
          <input
            type="text"
            placeholder="Optional rejection note..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="flex-1 px-3 py-2 text-xs bg-background border border-primary/20 rounded-xl text-foreground placeholder-primary/40 outline-none focus:border-primary/50"
          />
          <div className="flex gap-2">
            <button
              disabled={acting}
              onClick={async () => { setActing(true); await onVerify(account.id, "influencer", "approve", note); setActing(false); }}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
            >
              ✓ Approve
            </button>
            <button
              disabled={acting}
              onClick={async () => { setActing(true); await onVerify(account.id, "influencer", "reject", note); setActing(false); }}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
            >
              ✗ Reject
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
