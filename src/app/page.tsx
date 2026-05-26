"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { BuildingIcon, Verified } from "lucide-react";
import Image from "next/image";

// --- LIGHTWEIGHT PERSISTENT SVG ICONS ---
interface IconProps {
  size?: number;
  className?: string;
}

const SunIcon = ({ size = 18, className = "" }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" />
    <path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="m6.34 17.66-1.41 1.41" />
    <path d="m19.07 4.93-1.41 1.41" />
  </svg>
);

const MoonIcon = ({ size = 18, className = "" }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </svg>
);

const ArrowRightIcon = ({ size = 18, className = "" }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

const SparklesIcon = ({ size = 18, className = "" }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
  </svg>
);

const ShieldCheckIcon = ({ size = 18, className = "" }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 13c0 5-3.5 7.5-7.66 9.7a1 1 0 0 1-.68 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 .76-.97l8-2a1 1 0 0 1 .48 0l8 2A1 1 0 0 1 20 6v7z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const SearchIcon = ({ size = 18, className = "" }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

const TrendingUpIcon = ({ size = 18, className = "" }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </svg>
);

const InstagramIcon = ({ size = 18, className = "" }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const CoinsIcon = ({ size = 18, className = "" }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="8" cy="8" r="6" />
    <circle cx="18" cy="18" r="4" />
    <path d="M12 18a6 6 0 0 0-6-6M12 10a4 4 0 0 0 4 4" />
  </svg>
);

const ArrowUpRightIcon = ({ size = 18, className = "" }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="7" x2="17" y1="17" y2="7" />
    <polyline points="7 7 17 7 17 17" />
  </svg>
);

const MenuIcon = ({ size = 18, className = "" }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="4" x2="20" y1="12" y2="12" />
    <line x1="4" x2="20" y1="6" y2="6" />
    <line x1="4" x2="20" y1="18" y2="18" />
  </svg>
);

const XIcon = ({ size = 18, className = "" }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="18" x2="6" y1="6" y2="18" />
    <line x1="6" x2="18" y1="6" y2="18" />
  </svg>
);

// 3D Point Interface for Canvas Particle Network
interface Point3D {
  x: number;
  y: number;
  z: number;
  px: number;
  py: number;
}

export default function LandingPage() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // 3D card tilt states
  const [tilt, setTilt] = useState({
    brand: { rotateX: 0, rotateY: 0, active: false },
    influencer: { rotateX: 0, rotateY: 0, active: false }
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => { setMounted(true); }, []);

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  // Only use theme after mount to avoid SSR/client hydration mismatch
  const isDark = mounted ? resolvedTheme === "dark" : false;

  // Canvas 3D Neural Net Animation Effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const pointsCount = 65;
    const points: Point3D[] = [];
    const radius = Math.min(width, height) * 0.45;

    for (let i = 0; i < pointsCount; i++) {
      const theta = Math.acos(Math.random() * 2 - 1);
      const phi = Math.random() * Math.PI * 2;
      points.push({
        x: radius * Math.sin(theta) * Math.cos(phi),
        y: radius * Math.sin(theta) * Math.sin(phi),
        z: radius * Math.cos(theta),
        px: 0,
        py: 0
      });
    }

    const fov = 400;
    let angleX = 0.0012;
    let angleY = 0.0016;
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMoveGlobal = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = (e.clientX - rect.left - width / 2) / (width / 2);
      mouseY = (e.clientY - rect.top - height / 2) / (height / 2);
    };
    window.addEventListener("mousemove", handleMouseMoveGlobal);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener("resize", handleResize);

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      const currentAngleX = angleX + mouseY * 0.002;
      const currentAngleY = angleY + mouseX * 0.002;
      const cosX = Math.cos(currentAngleX);
      const sinX = Math.sin(currentAngleX);
      const cosY = Math.cos(currentAngleY);
      const sinY = Math.sin(currentAngleY);

      points.forEach((p) => {
        const x1 = p.x * cosY - p.z * sinY;
        const z1 = p.z * cosY + p.x * sinY;
        const y2 = p.y * cosX - z1 * sinX;
        const z2 = z1 * cosX + p.y * sinX;
        p.x = x1; p.y = y2; p.z = z2;
        const scale = fov / (fov + z2);
        p.px = width / 2 + x1 * scale;
        p.py = height / 2 + y2 * scale;
      });

      const maxDistance = 140;
      ctx.lineWidth = 0.85;

      for (let i = 0; i < pointsCount; i++) {
        for (let j = i + 1; j < pointsCount; j++) {
          const p1 = points[i];
          const p2 = points[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dz = p1.z - p2.z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < maxDistance) {
            const depthAlpha = Math.max(0.05, Math.min(0.6, (fov - (p1.z + p2.z) / 2) / (fov * 2)));
            const distAlpha = 1 - dist / maxDistance;
            const alpha = depthAlpha * distAlpha;
            ctx.strokeStyle = `rgba(139, 92, 246, ${alpha * 0.7})`;
            ctx.beginPath();
            ctx.moveTo(p1.px, p1.py);
            ctx.lineTo(p2.px, p2.py);
            ctx.stroke();
          }
        }
      }

      points.forEach((p) => {
        const size = Math.max(1, ((fov - p.z) / fov) * 3);
        const alpha = Math.max(0.1, Math.min(0.9, (fov - p.z) / (fov * 1.5)));
        ctx.fillStyle = `rgba(168, 85, 247, ${alpha})`;
        ctx.beginPath();
        ctx.arc(p.px, p.py, size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("mousemove", handleMouseMoveGlobal);
      window.removeEventListener("resize", handleResize);
    };
  }, [isDark]);

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
          box-shadow: 0 8px 32px rgba(109,40,217,0.08), inset 0 1px 0 rgba(255,255,255,0.9);
        }

        .glass-card {
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(32px) saturate(200%);
          -webkit-backdrop-filter: blur(32px) saturate(200%);
          border: 1px solid rgba(255,255,255,0.1);
          box-shadow:
            0 25px 50px rgba(0,0,0,0.35),
            0 0 0 1px rgba(139,92,246,0.08),
            inset 0 1px 0 rgba(255,255,255,0.12),
            inset 0 -1px 0 rgba(0,0,0,0.1);
        }

        .glass-card-light {
          background: rgba(255,255,255,0.6);
          backdrop-filter: blur(32px) saturate(200%);
          -webkit-backdrop-filter: blur(32px) saturate(200%);
          border: 1px solid rgba(255,255,255,0.8);
          box-shadow:
            0 25px 50px rgba(109,40,217,0.1),
            inset 0 1px 0 rgba(255,255,255,0.95);
        }

        .glass-nav {
          background: rgba(10,8,30,0.6);
          backdrop-filter: blur(40px) saturate(200%);
          -webkit-backdrop-filter: blur(40px) saturate(200%);
          border-bottom: 1px solid rgba(139,92,246,0.15);
          box-shadow: 0 1px 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(139,92,246,0.05);
        }

        .glass-nav-light {
          background: rgba(255,255,255,0.7);
          backdrop-filter: blur(40px) saturate(200%);
          -webkit-backdrop-filter: blur(40px) saturate(200%);
          border-bottom: 1px solid rgba(139,92,246,0.2);
          box-shadow: 0 1px 40px rgba(109,40,217,0.08);
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
          background: linear-gradient(135deg, rgba(139,92,246,0.6), rgba(59,130,246,0.3), rgba(236,72,153,0.4), rgba(139,92,246,0.6));
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

        .glow-indigo { box-shadow: 0 0 30px rgba(99,102,241,0.4), 0 0 60px rgba(99,102,241,0.15); }
        .glow-purple { box-shadow: 0 0 30px rgba(168,85,247,0.4), 0 0 60px rgba(168,85,247,0.15); }

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
          background: rgba(139,92,246,0.2);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(139,92,246,0.4);
          transition: all 0.3s ease;
        }
        .btn-glass:hover {
          background: rgba(139,92,246,0.35);
          border-color: rgba(139,92,246,0.7);
          box-shadow: 0 0 20px rgba(139,92,246,0.35), inset 0 1px 0 rgba(255,255,255,0.15);
          transform: translateY(-1px);
        }

        .btn-glass-primary {
          background: linear-gradient(135deg, rgba(99,102,241,0.9), rgba(139,92,246,0.9));
          backdrop-filter: blur(16px);
          border: 1px solid rgba(139,92,246,0.5);
          box-shadow: 0 8px 25px rgba(99,102,241,0.35), inset 0 1px 0 rgba(255,255,255,0.2);
          transition: all 0.3s ease;
        }
        .btn-glass-primary:hover {
          background: linear-gradient(135deg, rgba(99,102,241,1), rgba(139,92,246,1));
          box-shadow: 0 12px 35px rgba(99,102,241,0.5), inset 0 1px 0 rgba(255,255,255,0.25);
          transform: translateY(-2px);
        }

        .btn-glass-purple {
          background: linear-gradient(135deg, rgba(139,92,246,0.9), rgba(192,132,252,0.8));
          backdrop-filter: blur(16px);
          border: 1px solid rgba(192,132,252,0.5);
          box-shadow: 0 8px 25px rgba(139,92,246,0.35), inset 0 1px 0 rgba(255,255,255,0.2);
          transition: all 0.3s ease;
        }
        .btn-glass-purple:hover {
          background: linear-gradient(135deg, rgba(139,92,246,1), rgba(192,132,252,1));
          box-shadow: 0 12px 35px rgba(139,92,246,0.5), inset 0 1px 0 rgba(255,255,255,0.25);
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
          border-color: rgba(139,92,246,0.3);
          box-shadow: 0 8px 30px rgba(0,0,0,0.3), 0 0 20px rgba(139,92,246,0.1), inset 0 1px 0 rgba(255,255,255,0.12);
          transform: translateY(-4px);
        }

        .feature-glass-light {
          background: rgba(255,255,255,0.5);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.75);
          box-shadow: 0 4px 16px rgba(109,40,217,0.06), inset 0 1px 0 rgba(255,255,255,0.9);
          transition: all 0.4s cubic-bezier(0.16,1,0.3,1);
        }
        .feature-glass-light:hover {
          background: rgba(255,255,255,0.7);
          border-color: rgba(139,92,246,0.4);
          box-shadow: 0 8px 30px rgba(109,40,217,0.12), inset 0 1px 0 rgba(255,255,255,0.95);
          transform: translateY(-4px);
        }

        .text-glass-gradient {
          background: linear-gradient(135deg, #818cf8 0%, #a78bfa 40%, #f472b6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .text-glass-gradient-light {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 40%, #db2777 100%);
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

      {/* ===== BACKGROUND ORBS ===== */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Primary orbs */}
        <div
          className="orb w-[700px] h-[700px]"
          style={{
            top: "-200px", left: "-150px",
            background: isDark
              ? "radial-gradient(circle, rgba(99,102,241,0.25) 0%, rgba(139,92,246,0.1) 60%, transparent 100%)"
              : "radial-gradient(circle, rgba(99,102,241,0.2) 0%, rgba(139,92,246,0.08) 60%, transparent 100%)",
            animationDuration: "14s"
          }}
        />
        <div
          className="orb w-[500px] h-[500px]"
          style={{
            top: "30%", right: "-100px",
            background: isDark
              ? "radial-gradient(circle, rgba(168,85,247,0.2) 0%, rgba(236,72,153,0.1) 60%, transparent 100%)"
              : "radial-gradient(circle, rgba(168,85,247,0.15) 0%, rgba(236,72,153,0.08) 60%, transparent 100%)",
            animationDuration: "10s",
            animationDelay: "-3s"
          }}
        />
        <div
          className="orb w-[600px] h-[600px]"
          style={{
            bottom: "-100px", left: "20%",
            background: isDark
              ? "radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(99,102,241,0.08) 60%, transparent 100%)"
              : "radial-gradient(circle, rgba(59,130,246,0.12) 0%, rgba(99,102,241,0.06) 60%, transparent 100%)",
            animationDuration: "16s",
            animationDelay: "-7s"
          }}
        />

        {/* Subtle grid overlay */}
        <div
          style={{
            position: "absolute", inset: 0,
            backgroundImage: isDark
              ? "linear-gradient(rgba(139,92,246,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.04) 1px, transparent 1px)"
              : "linear-gradient(rgba(139,92,246,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.06) 1px, transparent 1px)",
            backgroundSize: "80px 80px"
          }}
        />
      </div>

      {/* ===== HEADER / NAV ===== */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${isDark ? "glass-nav" : "glass-nav-light"}`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-2xl font-black text-xl text-white shimmer-border"
              style={{
                background: "linear-gradient(135deg, rgba(99,102,241,0.9), rgba(139,92,246,0.9))",
                boxShadow: "0 4px 20px rgba(99,102,241,0.5), inset 0 1px 0 rgba(255,255,255,0.3)"
              }}
            >
              R
            </span>
            <span className={`text-2xl font-bold tracking-tight ${isDark ? "text-glass-gradient" : "text-glass-gradient-light"}`}>
              Reelio
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {["#features", "#selector", "/calculators"].map((href, i) => {
              const labels = ["Features", "Get Started", "Calculators"];
              return (
                <a
                  key={href}
                  href={href}
                  className="text-sm font-semibold transition-all duration-200 hover:scale-105"
                  style={{ color: isDark ? "rgba(203,213,225,0.85)" : "rgba(51,38,122,0.8)" }}
                  onMouseEnter={e => (e.currentTarget.style.color = isDark ? "#a78bfa" : "#7c3aed")}
                  onMouseLeave={e => (e.currentTarget.style.color = isDark ? "rgba(203,213,225,0.85)" : "rgba(51,38,122,0.8)")}
                >
                  {labels[i]}
                </a>
              );
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-2xl transition-all duration-300 cursor-pointer"
              style={{
                background: isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.6)",
                border: isDark ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(139,92,246,0.25)",
                backdropFilter: "blur(12px)",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = isDark ? "rgba(139,92,246,0.2)" : "rgba(255,255,255,0.85)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(139,92,246,0.5)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.6)";
                (e.currentTarget as HTMLElement).style.borderColor = isDark ? "rgba(255,255,255,0.12)" : "rgba(139,92,246,0.25)";
              }}
              aria-label="Toggle Theme"
            >
              {mounted && (isDark
                ? <SunIcon size={18} className="text-amber-300" />
                : <MoonIcon size={18} className="text-[#7c3aed]" />
              )}
            </button>

            <Link href="/authentication">
              <button
                className="btn-glass-primary px-6 py-2.5 rounded-2xl font-bold text-sm text-white cursor-pointer border-none"
              >
                Sign In
              </button>
            </Link>
          </div>

          {/* Mobile Buttons */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl"
              style={{
                background: isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.6)",
                border: isDark ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(139,92,246,0.2)",
                backdropFilter: "blur(12px)",
              }}
            >
              {mounted && (isDark ? <SunIcon size={16} className="text-amber-300" /> : <MoonIcon size={16} className="text-[#7c3aed]" />)}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl"
              style={{
                background: isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.6)",
                border: isDark ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(139,92,246,0.2)",
                backdropFilter: "blur(12px)",
                color: isDark ? "#cbd5e1" : "#4c1d95"
              }}
            >
              {mobileMenuOpen ? <XIcon size={20} /> : <MenuIcon size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Drawer */}
        {mobileMenuOpen && (
          <div
            className="absolute top-20 left-0 w-full py-6 px-6 space-y-4 md:hidden"
            style={{
              background: isDark ? "rgba(10,8,30,0.92)" : "rgba(248,246,255,0.92)",
              backdropFilter: "blur(40px)",
              borderBottom: isDark ? "1px solid rgba(139,92,246,0.2)" : "1px solid rgba(139,92,246,0.15)",
            }}
          >
            {[["#features", "Features"], ["#selector", "Get Started"], ["/calculators", "Calculators"]].map(([href, label]) => (
              <a
                key={href}
                href={href}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-semibold"
                style={{ color: isDark ? "#cbd5e1" : "#4c1d95" }}
              >
                {label}
              </a>
            ))}
            <div className="pt-4" style={{ borderTop: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(139,92,246,0.15)" }}>
              <Link href="/auth" onClick={() => setMobileMenuOpen(false)}>
                <button className="btn-glass-primary w-full py-3 rounded-xl font-bold text-white text-sm border-none cursor-pointer">
                  Sign In
                </button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main className="relative z-10">

        {/* ===== HERO SECTION ===== */}
        <section className="relative max-w-7xl mx-auto px-6 pt-20 lg:pt-10 pb-24 flex flex-col lg:flex-row items-center justify-between gap-12 overflow-hidden">

          {/* Neural Net Canvas */}
          <div className="absolute inset-0 w-full h-[580px] pointer-events-none z-0" style={{ opacity: 0.7 }}>
            <canvas ref={canvasRef} className="w-full h-full" />
          </div>

          {/* Left Column: Content */}
          <div className="relative z-10 lg:w-[55%] flex flex-col items-center lg:items-start text-center lg:text-left space-y-8">

            {/* Floating Badge */}
            <div className="float-badge inline-flex items-center gap-2 px-5 py-2 rounded-full shimmer-border"
              style={{
                background: isDark ? "rgba(139,92,246,0.12)" : "rgba(139,92,246,0.1)",
                backdropFilter: "blur(16px)",
                border: isDark ? "1px solid rgba(139,92,246,0.3)" : "1px solid rgba(139,92,246,0.3)",
                color: isDark ? "#c4b5fd" : "#6d28d9",
                fontSize: "11px",
                fontWeight: 800,
                letterSpacing: "0.1em",
                textTransform: "uppercase"
              }}
            >
              <SparklesIcon size={12} className="inline mr-1" />
              Next-Gen AI Brand Collaborations
            </div>

            {/* Hero Headline */}
            <h1
              className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.08]"
              style={{ color: isDark ? "#f1f5f9" : "#1e1b4b" }}
            >
              <span className={isDark ? "text-glass-gradient" : "text-glass-gradient-light"}>
                Launch Influencer Campaigns in Minutes.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="max-w-2xl mx-auto lg:mx-0 text-base sm:text-lg leading-relaxed"
              style={{ color: isDark ? "rgba(148,163,184,0.9)" : "rgba(67,56,202,0.75)" }}>
              Reelio bridges the gap between premium brands and world-class creators.{" "}
              Connect brands with creators instantly using AI-powered campaign matching, organic reach prediction, and built-in collaboration chat.
            </p>

            {/* Hero CTAs */}
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 pt-4 w-full sm:w-auto">
              <a href="#selector" className="w-full sm:w-auto">
                <button className="btn-glass-primary w-full sm:w-auto px-8 py-4 rounded-2xl font-extrabold text-base text-white cursor-pointer border-none flex items-center justify-center gap-2">
                  Get Started <ArrowRightIcon size={18} />
                </button>
              </a>
              <Link href="/calculators" className="w-full sm:w-auto">
                <button
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-base cursor-pointer border-none flex items-center justify-center gap-2 transition-all duration-300"
                  style={{
                    background: isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.55)",
                    backdropFilter: "blur(16px)",
                    border: isDark ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(139,92,246,0.3)",
                    color: isDark ? "#e2e8f0" : "#4c1d95",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = isDark ? "rgba(255,255,255,0.09)" : "rgba(255,255,255,0.75)";
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(139,92,246,0.5)";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.55)";
                    (e.currentTarget as HTMLElement).style.borderColor = isDark ? "rgba(255,255,255,0.12)" : "rgba(139,92,246,0.3)";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  }}
                >
                  Open Calculators
                </button>
              </Link>
            </div>
          </div>

          {/* Right Column: Top Influencer Video Card */}
          <div className="relative z-10 lg:w-[40%] w-full flex justify-center items-center">
            <div className="relative w-full max-w-[340px] sm:max-w-[360px] aspect-[9/16] rounded-[36px] p-3 transition-all duration-500 ease-out hover:scale-[1.03] hover:shadow-[0_0_50px_rgba(139,92,246,0.25)] group"
              style={{
                background: isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.6)",
                backdropFilter: "blur(24px)",
                border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(139,92,246,0.25)",
                boxShadow: isDark
                  ? "0 25px 50px -12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)"
                  : "0 25px 50px -12px rgba(109,40,217,0.1), inset 0 1px 0 rgba(255,255,255,0.8)",
              }}
            >
              {/* Inner container to clip video */}
              <div className="relative w-full h-full rounded-[28px] overflow-hidden bg-black/10">
                <video
                  src="/videos/hero-1.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />

                {/* Dark overlay at bottom for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                {/* "Verified Partner" badge */}
                <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full flex items-center gap-1.5 backdrop-filter backdrop-blur-md bg-black/40 border border-white/10 text-white text-[10px] font-bold tracking-wider uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Campaign
                </div>

                {/* Creator info overlay */}
                <div className="absolute bottom-4 left-4 right-4 text-left text-white space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full border border-white/20 bg-cover bg-center overflow-hidden flex items-center justify-center text-base"
                      style={{
                        background: "linear-gradient(135deg, #818cf8, #a78bfa)",
                      }}
                    >
                      <Image
                        src={"/logo/magicwebs-logo.png"}
                        width={100}
                        height={100}
                        alt="Logo"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-bold text-sm flex items-center gap-1">
                        Magic Webs <span className="text-sky-400"><Verified size={16} /></span>
                      </div>
                      <div className="text-[11px] text-white/70">@magicwebs • Marketing Agency</div>
                    </div>
                  </div>

                  {/* Campaign stats pill */}
                  <div className="grid grid-cols-3 gap-2 p-2 rounded-xl backdrop-filter backdrop-blur-md bg-white/10 border border-white/10 text-center">
                    <div>
                      <div className="text-[10px] text-white/60 uppercase font-medium">Reach</div>
                      <div className="text-xs font-bold">142.5K</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-white/60 uppercase font-medium">Eng.</div>
                      <div className="text-xs font-bold">5.8%</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-white/60 uppercase font-medium">Niche</div>
                      <div className="text-xs font-bold text-violet-300">Marketing</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating decorative elements around the card to add visual wow-factor */}
              <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-violet-500/20 blur-xl pointer-events-none group-hover:scale-150 transition-transform duration-700" />
              <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-indigo-500/20 blur-xl pointer-events-none group-hover:scale-150 transition-transform duration-700" />
            </div>
          </div>
        </section>

        {/* ===== CARD SELECTOR SECTION ===== */}
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
                <Link href="/authentication?role=influencer">
                  <button className="btn-glass-purple w-full py-4 rounded-2xl font-extrabold text-sm text-white cursor-pointer border-none flex items-center justify-center gap-2">
                    Enter Creator Suite <ArrowUpRightIcon size={16} />
                  </button>
                </Link>
              </div>
            </div>

          </div>
        </section>

        {/* ===== FEATURES SECTION ===== */}
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

      </main>

      {/* ===== FOOTER ===== */}
      <footer
        className="py-12 relative z-10"
        style={{
          borderTop: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(139,92,246,0.12)",
          background: isDark ? "rgba(5,4,15,0.5)" : "rgba(255,255,255,0.3)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-xl text-white font-black text-lg"
              style={{
                background: "linear-gradient(135deg, rgba(99,102,241,0.9), rgba(139,92,246,0.9))",
                boxShadow: "0 4px 14px rgba(99,102,241,0.4)"
              }}
            >
              R
            </span>
            <span className="font-bold text-lg"
              style={{ color: isDark ? "#e2e8f0" : "#1e1b4b" }}>
              Reelio
            </span>
          </div>

          <p className="text-xs"
            style={{ color: isDark ? "rgba(148,163,184,0.7)" : "rgba(79,70,229,0.65)" }}>
            &copy; 2026 Reelio Inc. All rights reserved. Made with love for creators worldwide.
          </p>

          <div className="flex gap-6 text-xs"
            style={{ color: isDark ? "rgba(148,163,184,0.7)" : "rgba(79,70,229,0.65)" }}>
            <a href="#" className="hover:text-violet-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-violet-400 transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
