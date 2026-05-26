import React from "react";

export function BackgroundOrbs({ isDark }: { isDark: boolean }) {
  return (
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
  );
}
