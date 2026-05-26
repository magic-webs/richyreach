import React, { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Verified } from "lucide-react";
import { SparklesIcon, ArrowRightIcon } from "./icons";

// 3D Point Interface for Canvas Particle Network
interface Point3D {
  x: number;
  y: number;
  z: number;
  px: number;
  py: number;
}

export function HeroSection({ isDark }: { isDark: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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

  return (
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
  );
}
