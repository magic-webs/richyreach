import React from "react";
import Link from "next/link";
import { ArrowRightIcon } from "./icons";

export function FeaturesSection({ isDark }: { isDark: boolean }) {
  return (
    <section
      id="features"
      className="max-w-7xl mx-auto px-6 py-20 relative"
      style={{ borderTop: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(139,92,246,0.12)" }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* Left column — Platform intro */}
        <div className="space-y-5 lg:pr-6">
          <span
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: isDark ? "#818cf8" : "#4f46e5" }}
          >
            Platform Architecture
          </span>
          <h2
            className="text-3xl font-extrabold tracking-tight leading-tight"
            style={{ color: isDark ? "#f1f5f9" : "#1e1b4b" }}
          >
            Built For Modern Creator Partnerships
          </h2>
          <p className="text-sm leading-relaxed"
            style={{ color: isDark ? "rgba(148,163,184,0.85)" : "rgba(67,56,202,0.7)" }}>
            By moving influencer campaigns to smart digital contracts, we remove outreach overheads, reduce negotiations, and make payments completely transparent.
          </p>
          <div className="pt-2">
            <Link href="/calculators">
              <span
                className="inline-flex items-center gap-1.5 text-sm font-bold cursor-pointer transition-all duration-200 hover:gap-2.5"
                style={{ color: isDark ? "#818cf8" : "#4f46e5" }}
              >
                Open Interactive Calculators <ArrowRightIcon size={14} />
              </span>
            </Link>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-5">
          {[
            { emoji: "⚡", title: "Automatic Scraping", color: "indigo", desc: "Influencers sync their Instagram accounts and we auto-collect recent posts, average likes, comment ratios, and niche categories." },
            { emoji: "🔒", title: "Secure Escrow Accounts", color: "purple", desc: "Funds remain locked in Stripe escrows until the influencer uploads evidence of the post/story and the brand approves it." },
            { emoji: "📊", title: "Campaign Reach Analytics", color: "indigo", desc: "Analyze actual vs expected impressions, click engagement rates, and ROI dashboards to tweak creator selections in real time." },
            { emoji: "💬", title: "Real-time Negotiation", color: "purple", desc: "Chat directly with brand managers or creators inside the app. Create custom contract offers and sign off in seconds." },
          ].map(({ emoji, title, color, desc }) => (
            <div
              key={title}
              className="p-6 rounded-2xl space-y-3 cursor-default"
              style={{
                background: isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.5)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(255,255,255,0.75)",
                boxShadow: isDark
                  ? "0 4px 20px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.06)"
                  : "0 4px 20px rgba(109,40,217,0.06), inset 0 1px 0 rgba(255,255,255,0.9)",
                transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)"
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.7)";
                el.style.borderColor = color === "indigo"
                  ? "rgba(99,102,241,0.35)"
                  : "rgba(139,92,246,0.35)";
                el.style.boxShadow = isDark
                  ? `0 8px 32px rgba(0,0,0,0.35), 0 0 20px ${color === "indigo" ? "rgba(99,102,241,0.12)" : "rgba(139,92,246,0.12)"}, inset 0 1px 0 rgba(255,255,255,0.1)`
                  : `0 8px 32px rgba(109,40,217,0.1), inset 0 1px 0 rgba(255,255,255,0.95)`;
                el.style.transform = "translateY(-4px)";
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.5)";
                el.style.borderColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.75)";
                el.style.boxShadow = isDark
                  ? "0 4px 20px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.06)"
                  : "0 4px 20px rgba(109,40,217,0.06), inset 0 1px 0 rgba(255,255,255,0.9)";
                el.style.transform = "translateY(0)";
              }}
            >
              <div
                className="h-10 w-10 rounded-xl flex items-center justify-center text-lg"
                style={{
                  background: isDark
                    ? (color === "indigo" ? "rgba(99,102,241,0.12)" : "rgba(139,92,246,0.12)")
                    : (color === "indigo" ? "rgba(99,102,241,0.1)" : "rgba(139,92,246,0.1)"),
                  border: isDark
                    ? (color === "indigo" ? "1px solid rgba(99,102,241,0.25)" : "1px solid rgba(139,92,246,0.25)")
                    : (color === "indigo" ? "1px solid rgba(99,102,241,0.2)" : "1px solid rgba(139,92,246,0.2)"),
                  backdropFilter: "blur(8px)"
                }}
              >
                {emoji}
              </div>
              <h3 className="font-extrabold text-base"
                style={{ color: isDark ? "#f1f5f9" : "#1e1b4b" }}>
                {title}
              </h3>
              <p className="text-xs leading-relaxed"
                style={{ color: isDark ? "rgba(148,163,184,0.8)" : "rgba(67,56,202,0.7)" }}>
                {desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
