import React, { useState } from "react";
import Link from "next/link";
import { BuildingIcon } from "lucide-react";
import {
  ShieldCheckIcon,
  SearchIcon,
  TrendingUpIcon,
  ArrowUpRightIcon,
  InstagramIcon,
  CoinsIcon,
  SparklesIcon
} from "./icons";
import { GlassPurpleButton } from "@/components/ui/glass-purple-button";

export function CardSelectorSection({ isDark }: { isDark: boolean }) {
  // 3D card tilt states
  const [tilt, setTilt] = useState({
    brand: { rotateX: 0, rotateY: 0, active: false },
    influencer: { rotateX: 0, rotateY: 0, active: false }
  });

  // Card Interactive 3D tilt handlers
  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>, cardId: "brand" | "influencer") => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((centerY - y) / centerY) * 12;
    const rotateY = ((x - centerX) / centerX) * 12;
    setTilt((prev) => ({
      ...prev,
      [cardId]: { rotateX, rotateY, active: true }
    }));
  };

  const handleCardMouseLeave = (cardId: "brand" | "influencer") => {
    setTilt((prev) => ({
      ...prev,
      [cardId]: { rotateX: 0, rotateY: 0, active: false }
    }));
  };

  return (
    <section id="selector" className="max-w-6xl mx-auto px-6 py-20 relative">
      <div className="text-center space-y-4 mb-16">
        <h2
          className="text-3xl md:text-4xl font-extrabold tracking-tight"
          style={{ color: isDark ? "#f1f5f9" : "#1e1b4b" }}
        >
          Choose Your Journey
        </h2>
        <p style={{ color: isDark ? "rgba(148,163,184,0.85)" : "rgba(67,56,202,0.7)" }}
          className="max-w-lg mx-auto text-sm md:text-base">
          Whether you are looking to scale campaigns or monetize your audience, we have built the perfect environment for you.
        </p>
      </div>

      {/* Perspective Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12" style={{ perspective: "1200px" }}>
        {/* ── BRAND CARD ── */}
        <div
          onMouseMove={(e) => handleCardMouseMove(e, "brand")}
          onMouseLeave={() => handleCardMouseLeave("brand")}
          style={{
            transform: tilt.brand.active
              ? `perspective(1000px) rotateX(${tilt.brand.rotateX}deg) rotateY(${tilt.brand.rotateY}deg) scale3d(1.02, 1.02, 1.02)`
              : "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
            transition: tilt.brand.active ? "none" : "transform 0.6s cubic-bezier(0.16,1,0.3,1)",
            background: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.6)",
            backdropFilter: "blur(40px) saturate(200%)",
            WebkitBackdropFilter: "blur(40px) saturate(200%)",
            border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(255,255,255,0.8)",
            boxShadow: isDark
              ? "0 30px 60px rgba(0,0,0,0.45), 0 0 0 1px rgba(99,102,241,0.1), inset 0 1px 0 rgba(255,255,255,0.12)"
              : "0 30px 60px rgba(99,102,241,0.12), inset 0 1px 0 rgba(255,255,255,0.95)",
          }}
          className="relative rounded-3xl preserve-3d overflow-hidden p-8 sm:p-10 flex flex-col justify-between min-h-[480px] group"
        >
          {/* Ambient glow top-right */}
          <div
            className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none transition-all duration-700 group-hover:scale-150 group-hover:opacity-100"
            style={{
              background: "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)",
              filter: "blur(30px)", opacity: 0.6
            }}
          />
          {/* Inner shimmer top line */}
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.6), rgba(139,92,246,0.4), transparent)"
            }}
          />

          <div className="space-y-6 relative z-10">
            {/* Icon */}
            <div
              className="h-14 w-14 rounded-2xl flex items-center justify-center text-2xl transition-transform duration-300 group-hover:scale-110"
              style={{
                background: isDark ? "rgba(99,102,241,0.15)" : "rgba(99,102,241,0.1)",
                backdropFilter: "blur(12px)",
                border: isDark ? "1px solid rgba(99,102,241,0.3)" : "1px solid rgba(99,102,241,0.25)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15)"
              }}
            >
              <BuildingIcon size={16} />
            </div>

            <div className="space-y-3">
              <span
                className="text-[10px] uppercase tracking-wider font-extrabold block"
                style={{ color: isDark ? "#818cf8" : "#4f46e5" }}
              >
                Enterprise & Agencies
              </span>
              <h3
                className="text-2xl sm:text-3xl font-extrabold"
                style={{ color: isDark ? "#f1f5f9" : "#1e1b4b" }}
              >
                I&apos;m a Brand
              </h3>
              <p className="text-sm leading-relaxed"
                style={{ color: isDark ? "rgba(148,163,184,0.85)" : "rgba(67,56,202,0.7)" }}>
                Instantly identify and contact vetted influencers. Auto-analyze profile scraping records, verify audience analytics, and set up automated escrow tasks.
              </p>
            </div>

            <ul className="space-y-3 text-sm">
              {[
                [<ShieldCheckIcon key="s" size={16} />, "Secure Escrow Protection", "rgba(99,102,241,0.9)"],
                [<SearchIcon key="s2" size={16} />, "AI Profile and Bio Scraper", "rgba(99,102,241,0.9)"],
                [<TrendingUpIcon key="s3" size={16} />, "Real-time ROI Live Calculators", "rgba(99,102,241,0.9)"],
              ].map(([icon, text], i) => (
                <li key={i} className="flex items-center gap-2.5"
                  style={{ color: isDark ? "#cbd5e1" : "#312e81" }}>
                  <span style={{ color: isDark ? "#818cf8" : "#6366f1" }}>{icon as React.ReactNode}</span>
                  <span>{text as string}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-8 relative z-10">
            <Link href="/authentication?role=brand">
              <button className="btn-glass-primary w-full py-4 rounded-2xl font-extrabold text-sm text-white cursor-pointer border-none flex items-center justify-center gap-2">
                Enter Brand Suite <ArrowUpRightIcon size={16} />
              </button>
            </Link>
          </div>
        </div>

        {/* ── INFLUENCER CARD ── */}
        <div
          onMouseMove={(e) => handleCardMouseMove(e, "influencer")}
          onMouseLeave={() => handleCardMouseLeave("influencer")}
          style={{
            transform: tilt.influencer.active
              ? `perspective(1000px) rotateX(${tilt.influencer.rotateX}deg) rotateY(${tilt.influencer.rotateY}deg) scale3d(1.02, 1.02, 1.02)`
              : "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
            transition: tilt.influencer.active ? "none" : "transform 0.6s cubic-bezier(0.16,1,0.3,1)",
            background: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.6)",
            backdropFilter: "blur(40px) saturate(200%)",
            WebkitBackdropFilter: "blur(40px) saturate(200%)",
            border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(255,255,255,0.8)",
            boxShadow: isDark
              ? "0 30px 60px rgba(0,0,0,0.45), 0 0 0 1px rgba(139,92,246,0.1), inset 0 1px 0 rgba(255,255,255,0.12)"
              : "0 30px 60px rgba(139,92,246,0.1), inset 0 1px 0 rgba(255,255,255,0.95)",
          }}
          className="relative rounded-3xl preserve-3d overflow-hidden p-8 sm:p-10 flex flex-col justify-between min-h-[480px] group"
        >
          {/* Ambient glow */}
          <div
            className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none transition-all duration-700 group-hover:scale-150 group-hover:opacity-100"
            style={{
              background: "radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)",
              filter: "blur(30px)", opacity: 0.6
            }}
          />
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.6), rgba(236,72,153,0.4), transparent)"
            }}
          />

          <div className="space-y-6 relative z-10">
            <div
              className="h-14 w-14 rounded-2xl flex items-center justify-center text-2xl transition-transform duration-300 group-hover:scale-110"
              style={{
                background: isDark ? "rgba(139,92,246,0.15)" : "rgba(139,92,246,0.1)",
                backdropFilter: "blur(12px)",
                border: isDark ? "1px solid rgba(139,92,246,0.3)" : "1px solid rgba(139,92,246,0.25)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15)"
              }}
            >
              📸
            </div>

            <div className="space-y-3">
              <span
                className="text-[10px] uppercase tracking-wider font-extrabold block"
                style={{ color: isDark ? "#a78bfa" : "#7c3aed" }}
              >
                Creators & Talent
              </span>
              <h3
                className="text-2xl sm:text-3xl font-extrabold"
                style={{ color: isDark ? "#f1f5f9" : "#1e1b4b" }}
              >
                I&apos;m an Influencer
              </h3>
              <p className="text-sm leading-relaxed"
                style={{ color: isDark ? "rgba(148,163,184,0.85)" : "rgba(67,56,202,0.7)" }}>
                Showcase your Instagram profiles, engagement rates, and custom niches. Apply directly to active campaigns, message brands, and get paid instantly via secure gateways.
              </p>
            </div>

            <ul className="space-y-3 text-sm">
              {[
                [<InstagramIcon key="i" size={16} />, "One-Click Handle Synchronization"],
                [<CoinsIcon key="c" size={16} />, "Instant Automated Webhook Payouts"],
                [<SparklesIcon key="sp" size={16} />, "Niche Earnings Optimizers"],
              ].map(([icon, text], i) => (
                <li key={i} className="flex items-center gap-2.5"
                  style={{ color: isDark ? "#cbd5e1" : "#312e81" }}>
                  <span style={{ color: isDark ? "#a78bfa" : "#7c3aed" }}>{icon as React.ReactNode}</span>
                  <span>{text as string}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-8 relative z-10">
            <GlassPurpleButton href="/authentication?role=influencer" className="w-full">
              Enter Creator Suite <ArrowUpRightIcon size={16} />
            </GlassPurpleButton>
          </div>
        </div>

      </div>
    </section>
  );
}
