"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
  email: "avijit@reelio.com",
  role: "influencer",
  avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=avijit",
  instagramHandle: "avijit_creates",
};

const AuthContext = createContext<AuthContextType>({
  user: defaultUser,
  switchRole: () => {},
  updateUser: () => {},
  notifications: [],
  markNotificationsRead: () => {},
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
      } catch (e) {}
    }
  }, []);

  const switchRole = (role: "influencer" | "brand" | "admin") => {
    let updatedUser: UserSession;
    if (role === "influencer") {
      updatedUser = {
        id: "mock_influencer_id",
        name: "Avijit Dev",
        email: "avijit@reelio.com",
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
        email: "admin@reelio.com",
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
  const Icons = {
    Home: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
    Marketplace: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
    Dashboard: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
    Calculator: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 11h.01M12 7h.01M9 11h.01M12 14h.01M15 11h.01M15 7h.01M5 19V5a2 2 0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2z" /></svg>,
    Chat: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
    Profile: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
    Admin: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
    Settings: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  };

  const navItems = [
    { name: "Home", href: "/", icon: Icons.Home, show: true },
    { name: "Marketplace", href: "/marketplace", icon: Icons.Marketplace, show: true },
    { name: "Calculators", href: "/calculators", icon: Icons.Calculator, show: true },
    { name: "Messaging", href: "/chat", icon: Icons.Chat, show: true },
    { 
      name: "Dashboard", 
      href: user.role === "influencer" ? "/influencer/dashboard" : user.role === "brand" ? "/brand/dashboard" : "/admin/dashboard", 
      icon: Icons.Dashboard, 
      show: true 
    },
    { 
      name: "Onboarding Profile", 
      href: user.role === "influencer" ? "/influencer/profile" : "/brand/profile", 
      icon: Icons.Profile, 
      show: user.role !== "admin" 
    },
  ];

  return (
    <AuthContext.Provider value={{ user, switchRole, updateUser, notifications, markNotificationsRead }}>
      <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans antialiased overflow-x-hidden selection:bg-indigo-500/30 selection:text-indigo-200">
        
        {/* Background Gradients */}
        <div className="fixed top-0 left-1/4 w-[450px] h-[450px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none z-0"></div>
        <div className="fixed bottom-0 right-1/4 w-[450px] h-[450px] bg-purple-600/5 rounded-full blur-[120px] pointer-events-none z-0"></div>

        {/* Sidebar Nav */}
        <aside className="w-64 border-r border-slate-800/60 bg-slate-900/35 backdrop-blur-xl shrink-0 sticky top-0 h-screen p-5 flex flex-col justify-between z-20">
          <div>
            <div className="flex items-center gap-3 mb-8 px-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-black text-xl shadow-lg shadow-indigo-500/20">
                R
              </span>
              <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">
                Reelio
              </span>
            </div>

            <nav className="space-y-1.5">
              {navItems.filter(item => item.show).map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-indigo-600/25 to-purple-600/10 text-indigo-200 border-l-2 border-indigo-500 shadow-md shadow-indigo-600/5"
                        : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
                    }`}
                  >
                    <item.icon />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Quick Role-Switcher Widget */}
          <div className="mt-8 border-t border-slate-800/80 pt-6 space-y-4">
            <div className="bg-slate-900/60 border border-slate-800/80 p-3 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">
                  Active Sandbox Role
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                {(["influencer", "brand", "admin"] as const).map(role => (
                  <button
                    key={role}
                    onClick={() => switchRole(role)}
                    className={`text-xs px-2.5 py-1.5 rounded-lg font-medium text-left transition-colors cursor-pointer capitalize flex items-center justify-between ${
                      user.role === role
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/10"
                        : "bg-slate-950/65 text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                    }`}
                  >
                    <span>{role} View</span>
                    {user.role === role && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Profile Summary Footer */}
            <div className="flex items-center gap-3 px-1.5">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700/60"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-200 truncate">{user.name}</p>
                <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Content Shell */}
        <div className="flex-1 flex flex-col min-w-0 z-10 relative">
          {/* Top Navbar */}
          <header className="h-16 border-b border-slate-800/50 bg-slate-950/60 backdrop-blur-xl px-8 flex items-center justify-between sticky top-0 z-30">
            <div className="text-sm font-semibold text-slate-400">
              {pathname === "/" ? "Platform Console" : pathname.replace("/", "").replace(/-/g, " ").replace(/\//g, " ➜ ")}
            </div>

            <div className="flex items-center gap-4">
              {/* Notification Center */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowNotif(!showNotif);
                    markNotificationsRead();
                  }}
                  className="p-2 text-slate-400 hover:text-slate-200 bg-slate-900/60 hover:bg-slate-800 border border-slate-800/80 rounded-xl transition-all relative cursor-pointer"
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
                  <div className="absolute right-0 mt-3 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 space-y-3 z-50">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <span className="text-xs font-bold text-slate-200">Alerts feed</span>
                      <span className="text-[10px] text-slate-500 cursor-pointer" onClick={() => setNotifications([])}>Clear</span>
                    </div>
                    {notifications.length === 0 ? (
                      <div className="text-center py-4 text-xs text-slate-500">All caught up!</div>
                    ) : (
                      <div className="space-y-2.5 max-h-[220px] overflow-y-auto">
                        {notifications.map(n => (
                          <div key={n.id} className="text-xs p-2 rounded-lg bg-slate-950/60 border border-slate-800/40">
                            <div className="flex justify-between">
                              <span className="font-semibold text-indigo-300">{n.title}</span>
                              <span className="text-[9px] text-slate-500">{n.time}</span>
                            </div>
                            <p className="text-slate-400 mt-0.5">{n.message}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Login Portal Access Button */}
              <Link
                href="/auth"
                className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-600/15 transition-all cursor-pointer"
              >
                Sign In Portal
              </Link>
            </div>
          </header>

          {/* Page Contents */}
          <main className="flex-1 p-8">
            {children}
          </main>
        </div>

      </div>
    </AuthContext.Provider>
  );
}
