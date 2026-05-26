import React from "react";

export function Footer({ isDark }: { isDark: boolean }) {
  return (
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
            className="flex h-8 w-8 items-center justify-center rounded-xl text-white font-bold text-lg font-serif-brand"
            style={{
              background: "linear-gradient(135deg, #3F030B, #7E1523)",
              boxShadow: "0 4px 14px rgba(63,3,11,0.35)"
            }}
          >
            R
          </span>
          <span className="font-bold text-lg font-serif-brand"
            style={{ color: isDark ? "#e2e8f0" : "#1e1b4b" }}>
            Richy Reach
          </span>
        </div>

        <p className="text-xs"
          style={{ color: isDark ? "rgba(148,163,184,0.7)" : "rgba(79,70,229,0.65)" }}>
          &copy; 2026 Richy Reach Inc. All rights reserved. Made with love for creators worldwide.
        </p>

        <div className="flex gap-6 text-xs"
          style={{ color: isDark ? "rgba(148,163,184,0.7)" : "rgba(79,70,229,0.65)" }}>
          <a href="#" className="hover:text-violet-400 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-violet-400 transition-colors">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}
