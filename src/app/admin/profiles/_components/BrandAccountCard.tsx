import { useState } from "react";
import { StatusBadge } from "./StatusBadge";

export function BrandAccountCard({ account, onVerify, onEdit }: { account: any; onVerify: (id: string, type: "influencer" | "brand", action: "approve" | "reject", note?: string) => void; onEdit: (account: any, type: "brand") => void; }) {
  const [note, setNote] = useState("");
  const [acting, setActing] = useState(false);

  return (
    <div className="bg-primary/5 border border-primary/10 rounded-2xl p-5 space-y-4 hover:border-primary/30 transition-colors shadow-sm dark:shadow-none group relative">
      <button 
        onClick={() => onEdit(account, "brand")}
        className="absolute top-4 right-4 p-1.5 text-primary/40 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
        title="Edit Brand Account"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      </button>

      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {account.logo ? (
            <img src={account.logo} alt={account.companyName} className="w-10 h-10 rounded-xl object-cover border border-primary/20 shrink-0" />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center text-primary-foreground text-sm font-black shadow-md shrink-0">
              {account.companyName?.[0]?.toUpperCase() || "B"}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-bold text-foreground text-sm">{account.companyName}</p>
              <StatusBadge status={account.status} />
            </div>
            <p className="text-xs text-primary/70 mt-0.5">
              <span className="font-semibold text-primary/90">{account.ownerName}</span>
              {" · "}{account.ownerEmail}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div><span className="text-primary/60">Category:</span> <span className="text-foreground font-semibold">{account.category}</span></div>
        <div><span className="text-primary/60">Size:</span> <span className="text-foreground font-semibold capitalize">{account.brandSize}</span></div>
        <div><span className="text-primary/60">Budget:</span> <span className="text-foreground font-semibold capitalize">{account.budgetRange}</span></div>
        <div><span className="text-primary/60">Instagram:</span> <span className="text-foreground font-semibold">{account.instagramPage || "—"}</span></div>
      </div>

      {account.description && (
        <p className="text-xs text-primary/70 italic bg-primary/5 p-3 rounded-xl border border-primary/10">"{account.description}"</p>
      )}
      {account.website && (
        <a href={account.website} target="_blank" rel="noreferrer" className="inline-block text-xs text-primary hover:underline">🔗 {account.website}</a>
      )}
      {account.verificationNote && (
        <p className="text-xs text-primary bg-primary/10 border border-primary/20 p-3 rounded-xl">Note: {account.verificationNote}</p>
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
              onClick={async () => { setActing(true); await onVerify(account.id, "brand", "approve", note); setActing(false); }}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
            >
              Approve
            </button>
            <button
              disabled={acting}
              onClick={async () => { setActing(true); await onVerify(account.id, "brand", "reject", note); setActing(false); }}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
            >
              Reject
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
