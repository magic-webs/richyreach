import React, { useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { SunIcon, MoonIcon, MenuIcon, XIcon } from "./icons";

export function Header({ isDark, mounted }: { isDark: boolean; mounted: boolean }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
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
            <Link href="/authentication" onClick={() => setMobileMenuOpen(false)}>
              <button className="btn-glass-primary w-full py-3 rounded-xl font-bold text-white text-sm border-none cursor-pointer">
                Sign In
              </button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
