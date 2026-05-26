"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { BackgroundOrbs } from "@/components/landing/BackgroundOrbs";
import { Header } from "@/components/landing/Header";
import { HeroSection } from "@/components/landing/HeroSection";
import { CardSelectorSection } from "@/components/landing/CardSelectorSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Only use theme after mount to avoid SSR/client hydration mismatch
  const isDark = mounted ? resolvedTheme === "dark" : false;

  // Render a neutral skeleton on the server to avoid hydration mismatches
  if (!mounted) {
    return (
      <div
        className="min-h-screen font-sans relative overflow-x-hidden"
        style={{ background: "linear-gradient(135deg, #f0f0ff 0%, #e8e4ff 30%, #f0f4ff 60%, #ede9ff 100%)" }}
      />
    );
  }

  return (
    <div
      suppressHydrationWarning
      className="min-h-screen font-sans selection:bg-violet-500/30 relative overflow-x-hidden"
      style={{
        background: isDark
          ? "linear-gradient(135deg, #0a0a1a 0%, #0d0b2a 30%, #0a1020 60%, #0c0a1e 100%)"
          : "linear-gradient(135deg, #f0f0ff 0%, #e8e4ff 30%, #f0f4ff 60%, #ede9ff 100%)",
        color: isDark ? "#e2e8f0" : "#1e1b4b",
      }}
    >
      {/* === GLASS UI GLOBAL STYLES === */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

        * { font-family: 'Inter', sans-serif; }

        .glass-panel {
          background: rgba(255,255,255,0.05);
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
          border: 1px solid rgba(255,255,255,0.12);
          box-shadow: 0 8px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.1);
        }

        .glass-panel-light {
          background: rgba(255,255,255,0.55);
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
          border: 1px solid rgba(255,255,255,0.7);
          box-shadow: 0 8px 32px rgba(63,3,11,0.08), inset 0 1px 0 rgba(255,255,255,0.9);
        }

        .glass-card {
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(32px) saturate(200%);
          -webkit-backdrop-filter: blur(32px) saturate(200%);
          border: 1px solid rgba(255,255,255,0.1);
          box-shadow:
            0 25px 50px rgba(0,0,0,0.35),
            0 0 0 1px rgba(63,3,11,0.08),
            inset 0 1px 0 rgba(255,255,255,0.12),
            inset 0 -1px 0 rgba(0,0,0,0.1);
        }

        .glass-card-light {
          background: rgba(255,255,255,0.6);
          backdrop-filter: blur(32px) saturate(200%);
          -webkit-backdrop-filter: blur(32px) saturate(200%);
          border: 1px solid rgba(255,255,255,0.8);
          box-shadow:
            0 25px 50px rgba(63,3,11,0.1),
            inset 0 1px 0 rgba(255,255,255,0.95);
        }

        .glass-nav {
          background: rgba(10,8,30,0.6);
          backdrop-filter: blur(40px) saturate(200%);
          -webkit-backdrop-filter: blur(40px) saturate(200%);
          border-bottom: 1px solid rgba(63,3,11,0.15);
          box-shadow: 0 1px 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(63,3,11,0.05);
        }

        .glass-nav-light {
          background: rgba(255,255,255,0.7);
          backdrop-filter: blur(40px) saturate(200%);
          -webkit-backdrop-filter: blur(40px) saturate(200%);
          border-bottom: 1px solid rgba(63,3,11,0.2);
          box-shadow: 0 1px 40px rgba(63,3,11,0.08);
        }

        .shimmer-border {
          position: relative;
        }
        .shimmer-border::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(135deg, rgba(63,3,11,0.6), rgba(126,21,35,0.3), rgba(226,63,89,0.4), rgba(63,3,11,0.6));
          background-size: 300% 300%;
          animation: shimmer-rotate 4s linear infinite;
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }

        @keyframes shimmer-rotate {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .glow-indigo { box-shadow: 0 0 30px rgba(63,3,11,0.4), 0 0 60px rgba(63,3,11,0.15); }
        .glow-purple { box-shadow: 0 0 30px rgba(126,21,35,0.4), 0 0 60px rgba(126,21,35,0.15); }

        .orb {
          border-radius: 50%;
          filter: blur(80px);
          position: absolute;
          pointer-events: none;
          animation: orb-drift 12s ease-in-out infinite alternate;
        }

        @keyframes orb-drift {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -20px) scale(1.05); }
          100% { transform: translate(-20px, 25px) scale(0.97); }
        }

        .float-badge {
          animation: float 3s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }

        .btn-glass {
          background: rgba(126,21,35,0.2);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(126,21,35,0.4);
          transition: all 0.3s ease;
        }
        .btn-glass:hover {
          background: rgba(126,21,35,0.35);
          border-color: rgba(126,21,35,0.7);
          box-shadow: 0 0 20px rgba(126,21,35,0.35), inset 0 1px 0 rgba(255,255,255,0.15);
          transform: translateY(-1px);
        }

        .btn-glass-primary {
          background: linear-gradient(135deg, rgba(63,3,11,0.9), rgba(126,21,35,0.9));
          backdrop-filter: blur(16px);
          border: 1px solid rgba(126,21,35,0.5);
          box-shadow: 0 8px 25px rgba(63,3,11,0.35), inset 0 1px 0 rgba(255,255,255,0.2);
          transition: all 0.3s ease;
        }
        .btn-glass-primary:hover {
          background: linear-gradient(135deg, rgba(63,3,11,1), rgba(126,21,35,1));
          box-shadow: 0 12px 35px rgba(63,3,11,0.5), inset 0 1px 0 rgba(255,255,255,0.25);
          transform: translateY(-2px);
        }

        .btn-glass-purple {
          background: linear-gradient(135deg, rgba(126,21,35,0.9), rgba(226,63,89,0.8));
          backdrop-filter: blur(16px);
          border: 1px solid rgba(226,63,89,0.5);
          box-shadow: 0 8px 25px rgba(126,21,35,0.35), inset 0 1px 0 rgba(255,255,255,0.2);
          transition: all 0.3s ease;
        }
        .btn-glass-purple:hover {
          background: linear-gradient(135deg, rgba(126,21,35,1), rgba(226,63,89,1));
          box-shadow: 0 12px 35px rgba(126,21,35,0.5), inset 0 1px 0 rgba(255,255,255,0.25);
          transform: translateY(-2px);
        }

        .feature-glass {
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 4px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.08);
          transition: all 0.4s cubic-bezier(0.16,1,0.3,1);
        }
        .feature-glass:hover {
          background: rgba(255,255,255,0.07);
          border-color: rgba(126,21,35,0.4);
          box-shadow: 0 8px 30px rgba(0,0,0,0.3), 0 0 20px rgba(126,21,35,0.1), inset 0 1px 0 rgba(255,255,255,0.12);
          transform: translateY(-4px);
        }

        .feature-glass-light {
          background: rgba(255,255,255,0.5);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.75);
          box-shadow: 0 4px 16px rgba(63,3,11,0.06), inset 0 1px 0 rgba(255,255,255,0.9);
          transition: all 0.4s cubic-bezier(0.16,1,0.3,1);
        }
        .feature-glass-light:hover {
          background: rgba(255,255,255,0.7);
          border-color: rgba(126,21,35,0.5);
          box-shadow: 0 8px 30px rgba(126,21,35,0.12), inset 0 1px 0 rgba(255,255,255,0.95);
          transform: translateY(-4px);
        }

        .text-glass-gradient {
          background: linear-gradient(135deg, #7E1523 0%, #3F030B 50%, #E23F59 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .text-glass-gradient-light {
          background: linear-gradient(135deg, #3F030B 0%, #7E1523 50%, #8E0E1A 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .icon-glass {
          background: rgba(255,255,255,0.06);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.1);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.12), 0 4px 12px rgba(0,0,0,0.2);
        }

        .icon-glass-light {
          background: rgba(255,255,255,0.7);
          border: 1px solid rgba(255,255,255,0.9);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.95), 0 4px 12px rgba(109,40,217,0.1);
        }
      `}</style>

      <BackgroundOrbs isDark={isDark} />
      <Header isDark={isDark} mounted={mounted} />
      
      <main className="relative z-10">
        <HeroSection isDark={isDark} />
        <CardSelectorSection isDark={isDark} />
        <FeaturesSection isDark={isDark} />
      </main>

      <Footer isDark={isDark} />
    </div>
  );
}
