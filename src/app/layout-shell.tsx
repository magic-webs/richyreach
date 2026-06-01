"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Icons from "@/components/icons";
import { authClient } from "@/lib/auth-client";
import { useAuthStore } from "@/store/useAuthStore";
import { Rocket } from "lucide-react";

export const useAuth = () => {
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const notifications = useAuthStore((s) => s.notifications);
  const markNotificationsRead = useAuthStore((s) => s.markNotificationsRead);
  return { user, updateUser, notifications, markNotificationsRead };
};

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = authClient.useSession();
  const { user } = useAuthStore();
  const notifications = useAuthStore((s) => s.notifications);
  const markNotificationsRead = useAuthStore((s) => s.markNotificationsRead);
  const setNotifications = useAuthStore((s) => s.setNotifications);

  const [showNotif, setShowNotif] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Track whether we've finished our custom session bootstrap
  const [sessionChecked, setSessionChecked] = useState(false);
  const bootstrapRan = useRef(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Primary: sync from Better Auth session (OAuth logins)
  useEffect(() => {
    if (session?.user) {
      useAuthStore.getState().updateUser({
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: (session.user as any).role || "influencer",
        avatar: session.user.image || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(session.user.name)}`,
      });
      setSessionChecked(true);
    }
  }, [session]);

  // Fallback: bootstrap from our custom OTP session cookie via /api/auth/session
  // This runs once after Better Auth finishes its check and returns no session.
  useEffect(() => {
    if (isPending) return; // Wait for Better Auth to finish
    if (session?.user) return; // Already handled above
    if (bootstrapRan.current) return; // Only run once
    bootstrapRan.current = true;

    async function fetchCustomSession() {
      try {
        const res = await fetch("/api/auth/session", {
          credentials: "include", // Send reelio_session cookie
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json() as any;
          const u = data?.data?.user;
          if (u?.id) {
            useAuthStore.getState().updateUser({
              id: u.id,
              name: u.name || "",
              email: u.email || "",
              role: u.role || "influencer",
              avatar: u.image || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(u.name || u.id)}`,
            });
            return;
          }
        }
        // If no valid session was found via BetterAuth or fallback API, clear persisted user
        useAuthStore.getState().logout();
      } catch (_) {
        // Network error — leave user as unauthenticated
        useAuthStore.getState().logout();
      } finally {
        setSessionChecked(true);
      }
    }

    fetchCustomSession();
  }, [isPending, session]);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Custom Inline SVG Icons to avoid import breaks

  // Dynamic role-based navigation item filtering
  const getRoleNavItems = () => {
    if (user.id === "") return [];

    const items = [];
    if (user.role === "brand") {
      items.push(
        { name: "Dashboard", href: "/brand/dashboard", icon: Icons.Dashboard },
        { name: "Campaigns", href: "/brand/campaigns/create", icon: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
        { name: "Marketplace", href: "/brand/marketplace", icon: Icons.Marketplace },
        { name: "Calculators", href: "/calculators", icon: Icons.Calculator },
        { name: "Wallet", href: "/brand/wallet", icon: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg> },
        { name: "Messaging", href: "/brand/chat", icon: Icons.Chat },
        { name: "Profile", href: "/brand/profile", icon: Icons.Profile }
      );
    } else if (user.role === "influencer") {
      items.push(
        { name: "Dashboard", href: "/influencer/dashboard", icon: Icons.Dashboard },
        { name: "Marketplace", href: "/influencer/marketplace", icon: Icons.Marketplace },
        { name: "Earnings", href: "/influencer/earnings", icon: Icons.Earnings },
        { name: "Wallet", href: "/influencer/wallet", icon: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg> },
        { name: "Messaging", href: "/influencer/chat", icon: Icons.Chat },
        { name: "Profile", href: "/influencer/profile", icon: Icons.Profile }
      );
    } else { // admin
      items.push(
        { name: "Dashboard", href: "/admin/dashboard", icon: Icons.Admin },
        { name: "Profiles", href: "/admin/profiles", icon: Icons.Profile },
        { name: "Calculators", href: "/calculators", icon: Icons.Calculator },
        { name: "Messaging", href: "/admin/chat", icon: Icons.Chat }
      );
    }
    return items;
  };

  const currentNavItems = getRoleNavItems();

  // Public pages: render without sidebar/nav
  if (pathname === "/authentication") {
    if (sessionChecked && user.id !== "") {
      router.replace(`/${user.role}/dashboard`);
      return null;
    }
    return <>{children}</>;
  }

  if (pathname === "/") {
    return <>{children}</>;
  }

  // Show loading spinner until hydrated. Also wait for session check if user is not yet persisted.
  if (!isHydrated || (isPending && !sessionChecked && user.id === "")) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Not authenticated — redirect to login page
  if (user.id === "") {
    router.replace(`/authentication?redirectTo=${encodeURIComponent(pathname)}`);
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Role-based access guard on the client side (middleware handles it server-side too)
  const roleDashboard = `/${user.role}/dashboard`;
  const pathRole = pathname.startsWith("/brand")
    ? "brand"
    : pathname.startsWith("/influencer")
      ? "influencer"
      : pathname.startsWith("/admin")
        ? "admin"
        : null;

  if (pathRole && user.role !== "admin" && pathRole !== user.role) {
    router.replace(roleDashboard);
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans antialiased selection:bg-indigo-500/30 selection:text-indigo-200">

        {/* Background Gradients */}
        <div className="fixed top-0 left-1/4 w-[450px] h-[450px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none z-0"></div>
        <div className="fixed bottom-0 right-1/4 w-[450px] h-[450px] bg-purple-600/5 rounded-full blur-[120px] pointer-events-none z-0"></div>

        {/* Sidebar Nav */}
        <aside className={`hidden md:flex ${isCollapsed ? "w-20" : "w-64"} transition-all duration-300 border-r border-slate-200/80 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/35 backdrop-blur-xl shrink-0 h-full p-4 flex-col justify-between z-20`}>
          <div>
            <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3 px-2"} mb-8 relative`}>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-[#3F030B] to-[#7E1523] text-white font-bold text-xl shadow-lg shadow-[#3F030B]/25">
                R
              </span>
              {!isCollapsed && (
                <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#3F030B] via-[#7E1523] to-slate-800 dark:from-white dark:to-slate-300 font-serif-brand truncate">
                  Richy Reach
                </span>
              )}
            </div>

            <nav className="space-y-1.5">
              {currentNavItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    title={isCollapsed ? item.name : undefined}
                    className={`flex items-center ${isCollapsed ? "justify-center px-0" : "gap-3 px-3.5"} py-2.5 rounded-xl text-sm font-medium transition-all ${isActive
                      ? "bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary border-l-2 border-primary shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-200"
                      }`}
                  >
                    <item.icon />
                    {!isCollapsed && <span className="truncate">{item.name}</span>}
                  </Link>
                );
              })}
            </nav>
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="mt-auto p-2 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <svg className={`w-5 h-5 transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </aside>

        {/* Content Shell */}
        <div className="flex-1 flex flex-col min-w-0 z-10 relative h-full">
          {/* Top Navbar */}
          <header className="h-16 shrink-0 border-b border-slate-200/80 dark:border-slate-800/50 bg-white/75 dark:bg-slate-950/60 backdrop-blur-xl px-8 flex items-center justify-between z-30">
            <div className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              {currentNavItems.find((item) => item.href === pathname)?.name}
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              {/* Notification Center */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowNotif(!showNotif);
                    markNotificationsRead();
                  }}
                  className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 bg-white/60 hover:bg-slate-100 dark:bg-slate-900/60 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800/80 rounded-xl transition-all relative cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotif && (
                  <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-4 space-y-3 z-50">
                    <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Alerts feed</span>
                      <span className="text-[10px] text-slate-500 cursor-pointer" onClick={() => setNotifications([])}>Clear</span>
                    </div>
                    {notifications.length === 0 ? (
                      <div className="text-center py-4 text-xs text-slate-500">All caught up!</div>
                    ) : (
                      <div className="space-y-2.5 max-h-[220px] overflow-y-auto">
                        {notifications.map(n => (
                          <div key={n.id} className="text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-150 dark:border-slate-800/40">
                            <div className="flex justify-between">
                              <span className="font-semibold text-indigo-600 dark:text-indigo-300">{n.title}</span>
                              <span className="text-[9px] text-slate-500">{n.time}</span>
                            </div>
                            <p className="text-slate-550 dark:text-slate-400 mt-0.5">{n.message}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="flex md:hidden items-center gap-1.5">
                {currentNavItems.filter(item => ['Messaging'].includes(item.name)).map(item => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 bg-white/60 hover:bg-slate-100 dark:bg-slate-900/60 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800/80 rounded-xl transition-all"
                  >
                    <Icons.Send />
                  </Link>
                ))}
              </div>
            </div>
          </header>

          {/* Page Contents */}
          <main className="flex-1 overflow-y-auto p-6 md:p-8 pb-24 md:pb-8">
            {children}
          </main>
        </div>
        {/* Mobile Bottom Tab Bar */}
        <div className="fixed md:hidden bottom-4 left-4 right-4 z-50">
          <nav className="flex items-center justify-around h-16 px-2 bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/40 dark:border-white/10 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.12)] relative">
            {(() => {
              const filteredItems = currentNavItems.filter(item => !['Wallet', 'Messaging'].includes(item.name));
              const activeIndex = filteredItems.findIndex(item => pathname === item.href || pathname.startsWith(item.href + '/'));

              return (
                <>
                  {/* Active Indicator Background */}
                  <div
                    className="absolute h-[85%] top-[7.5%] rounded-full bg-gradient-to-tr from-[#3F030B] to-[#7E1523] dark:from-primary dark:to-primary-foreground transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] z-0"
                    style={{
                      width: `calc((100% - 16px) / ${filteredItems.length} - 8px)`,
                      left: activeIndex >= 0 ? `calc(8px + ((100% - 16px) / ${filteredItems.length}) * ${activeIndex} + 4px)` : '-100%',
                      opacity: activeIndex >= 0 ? 1 : 0
                    }}
                  />

                  {filteredItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`relative z-10 flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-bold transition-all duration-300 ${isActive
                          ? "text-white scale-105"
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                          }`}
                      >
                        <div className={`p-1 transition-transform duration-300 ${isActive ? "-translate-y-1 drop-shadow-md" : "translate-y-1"}`}>
                          <item.icon />
                        </div>
                        <span className={`transition-all duration-300 text-[9px] leading-none whitespace-nowrap truncate w-full text-center px-1 ${isActive ? "opacity-100 translate-y-0 drop-shadow-md" : "opacity-0 translate-y-2 absolute bottom-1"}`}>
                          {item.name}
                        </span>
                      </Link>
                    );
                  })}
                </>
              );
            })()}
          </nav>
        </div>
      </div>
    </>
  );
}
