"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Icons from "@/components/icons";

// Define mock session types
interface UserSession {
  id: string;
  name: string;
  email: string;
  role: "influencer" | "brand" | "admin";
  avatar: string;
  instagramHandle?: string;
  companyName?: string;
}

interface AuthContextType {
  user: UserSession;
  switchRole: (role: "influencer" | "brand" | "admin") => void;
  updateUser: (data: Partial<UserSession>) => void;
  notifications: Array<{ id: string; title: string; message: string; read: boolean; time: string }>;
  markNotificationsRead: () => void;
}

const defaultUser: UserSession = {
  id: "mock_influencer_id",
  name: "Avijit Dev",
  email: "avijit@richyreach.com",
  role: "influencer",
  avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=avijit",
  instagramHandle: "avijit_creates",
};

const AuthContext = createContext<AuthContextType>({
  user: defaultUser,
  switchRole: () => { },
  updateUser: () => { },
  notifications: [],
  markNotificationsRead: () => { },
});

export const useMockAuth = () => useContext(AuthContext);

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession>(defaultUser);
  const [notifications, setNotifications] = useState([
    {
      id: "1",
      title: "New Campaign invite!",
      message: "Vogue Clothing invited you to apply for their Summer Fit campaign.",
      read: false,
      time: "5m ago",
    },
    {
      id: "2",
      title: "Payment Received",
      message: "Escrow payment for 'Gamer Keyboard review' has cleared.",
      read: false,
      time: "2h ago",
    },
  ]);
  const [showNotif, setShowNotif] = useState(false);
  const pathname = usePathname();

  // Keep state sync across page changes
  useEffect(() => {
    const saved = localStorage.getItem("reelio_mock_user");
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (e) { }
    }

    // Sync session with backend in background
    const token = localStorage.getItem("reelio_session_token");
    if (token) {
      fetch("/api/auth/session", {
        headers: { "Authorization": `Bearer ${token}` }
      })
        .then(res => res.json() as any)
        .then(data => {
          if (data && data.success && data.data && data.data.user) {
            const syncedUser = {
              id: data.data.user.id,
              name: data.data.user.name,
              email: data.data.user.email,
              role: data.data.user.role,
              avatar: data.data.user.image || `https://api.dicebear.com/7.x/adventurer/svg?seed=${data.data.user.name}`,
            };
            setUser(syncedUser);
            localStorage.setItem("reelio_mock_user", JSON.stringify(syncedUser));
          } else {
            // Token invalid or expired
            localStorage.removeItem("reelio_session_token");
            localStorage.removeItem("reelio_mock_user");
          }
        })
        .catch(err => console.error("Session sync failed:", err));
    }
  }, [pathname]);

  const switchRole = (role: "influencer" | "brand" | "admin") => {
    let updatedUser: UserSession;
    if (role === "influencer") {
      updatedUser = {
        id: "mock_influencer_id",
        name: "Avijit Dev",
        email: "avijit@richyreach.com",
        role: "influencer",
        avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=avijit",
        instagramHandle: user.instagramHandle || "avijit_creates",
      };
    } else if (role === "brand") {
      updatedUser = {
        id: "mock_brand_id",
        name: "Aura Apparel",
        email: "collabs@aura.com",
        role: "brand",
        avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Aura",
        companyName: user.companyName || "Aura Apparel",
      };
    } else {
      updatedUser = {
        id: "mock_admin_id",
        name: "Admin Moderator",
        email: "admin@richyreach.com",
        role: "admin",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=admin",
      };
    }
    setUser(updatedUser);
    localStorage.setItem("reelio_mock_user", JSON.stringify(updatedUser));

    // Add context notification
    setNotifications(prev => [
      {
        id: Date.now().toString(),
        title: "Role Switched",
        message: `You are now browsing as a ${role.toUpperCase()}`,
        read: false,
        time: "Just now"
      },
      ...prev
    ]);
  };

  const updateUser = (data: Partial<UserSession>) => {
    setUser(prev => {
      const updated = { ...prev, ...data };
      localStorage.setItem("reelio_mock_user", JSON.stringify(updated));
      return updated;
    });
  };

  const markNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Custom Inline SVG Icons to avoid import breaks


  // Dynamic role-based navigation item filtering
  const getRoleNavItems = () => {
    const items = [];
    if (user.role === "brand") {
      items.push(
        { name: "Dashboard", href: "/brand/dashboard", icon: Icons.Dashboard },
        { name: "Campaigns", href: "/brand/campaigns/create", icon: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
        { name: "Marketplace", href: "/brand/marketplace", icon: Icons.Marketplace },
        { name: "Calculators", href: "/calculators", icon: Icons.Calculator },
        { name: "Messaging", href: "/brand/chat", icon: Icons.Chat },
        { name: "Profile", href: "/brand/profile", icon: Icons.Profile }
      );
    } else if (user.role === "influencer") {
      items.push(
        { name: "Dashboard", href: "/influencer/dashboard", icon: Icons.Dashboard },
        { name: "Marketplace", href: "/influencer/marketplace", icon: Icons.Marketplace },
        { name: "Earnings", href: "/influencer/earnings", icon: Icons.Earnings },
        // { name: "Messaging", href: "/influencer/chat", icon: Icons.Chat },
        { name: "Profile", href: "/influencer/profile", icon: Icons.Profile }
      );
    } else { // admin
      items.push(
        { name: "Dashboard", href: "/admin/dashboard", icon: Icons.Admin },
        { name: "Calculators", href: "/calculators", icon: Icons.Calculator },
        { name: "Messaging", href: "/admin/chat", icon: Icons.Chat }
      );
    }
    return items;
  };

  const currentNavItems = getRoleNavItems();

  if (pathname === "/" || pathname === "/authentication") {
    return (
      <AuthContext.Provider value={{ user, switchRole, updateUser, notifications, markNotificationsRead }}>
        {children}
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider value={{ user, switchRole, updateUser, notifications, markNotificationsRead }}>
      <div className="flex min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans antialiased overflow-x-hidden selection:bg-indigo-500/30 selection:text-indigo-200">

        {/* Background Gradients */}
        <div className="fixed top-0 left-1/4 w-[450px] h-[450px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none z-0"></div>
        <div className="fixed bottom-0 right-1/4 w-[450px] h-[450px] bg-purple-600/5 rounded-full blur-[120px] pointer-events-none z-0"></div>

        {/* Sidebar Nav */}
        <aside className="hidden md:flex w-64 border-r border-slate-200/80 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/35 backdrop-blur-xl shrink-0 sticky top-0 h-screen p-5 flex-col justify-between z-20">
          <div>
            <div className="flex items-center gap-3 mb-8 px-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#3F030B] to-[#7E1523] text-white font-bold text-xl shadow-lg shadow-[#3F030B]/25">
                R
              </span>
              <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#3F030B] via-[#7E1523] to-slate-800 dark:from-white dark:to-slate-300 font-serif-brand">
                Richy Reach
              </span>
            </div>

            <nav className="space-y-1.5">
              {currentNavItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive
                      ? "bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary border-l-2 border-primary shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-200"
                      }`}
                  >
                    <item.icon />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Content Shell */}
        <div className="flex-1 flex flex-col min-w-0 z-10 relative">
          {/* Top Navbar */}
          <header className="h-16 border-b border-slate-200/80 dark:border-slate-800/50 bg-white/75 dark:bg-slate-950/60 backdrop-blur-xl px-8 flex items-center justify-between sticky top-0 z-30">
            <div className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              {currentNavItems.find((item) => item.href === pathname)?.name}
            </div>

            <div className="flex items-center gap-4">
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
            </div>
          </header>

          {/* Page Contents */}
          <main className="flex-1 p-6 md:p-8 pb-24 md:pb-8">
            {children}
          </main>
        </div>
        {/* Mobile Bottom Tab Bar */}
        <nav className="flex md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/90 dark:bg-slate-950/90 border-t border-slate-200 dark:border-slate-800/60 backdrop-blur-xl items-center justify-around px-2 z-40 pb-safe shadow-[0_-8px_30px_rgba(0,0,0,0.1)]">
          {currentNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[9px] font-extrabold transition-all ${isActive
                  ? "text-primary dark:text-primary-foreground scale-105"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-755 dark:hover:text-slate-200"
                  }`}
              >
                <div className={`p-1 rounded-xl transition-all ${isActive ? "bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-foreground" : ""
                  }`}>
                  <item.icon />
                </div>
                <span className="mt-0.5 max-w-[60px] truncate text-center">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </AuthContext.Provider>
  );
}
