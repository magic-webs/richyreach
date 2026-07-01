"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X, Download, Star } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function PwaInstallBanner() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setInstallPrompt(e as BeforeInstallPromptEvent);

      // Check if user dismissed it in this session
      const isDismissed = sessionStorage.getItem("pwa-install-dismissed");
      if (!isDismissed) {
        setIsVisible(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // If app is already installed, hide it
    const handleAppInstalled = () => {
      setIsVisible(false);
      setInstallPrompt(null);
      console.log("PWA was installed successfully");
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;

    // Show the install prompt
    await installPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await installPrompt.userChoice;
    console.log(`User response to install prompt: ${outcome}`);

    // Clean up
    setInstallPrompt(null);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem("pwa-install-dismissed", "true");
  };

  if (!isMounted || !isVisible || !installPrompt) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-in slide-in-from-bottom duration-300">
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/10 dark:border-slate-800 bg-slate-900/95 dark:bg-slate-950/95 text-white backdrop-blur-xl p-5 shadow-2xl shadow-indigo-500/10">
        
        {/* Glow Effects */}
        <div className="absolute -top-12 -left-12 w-24 h-24 bg-gradient-to-tr from-[#3F030B] to-[#7E1523] rounded-full blur-2xl opacity-40"></div>
        <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-indigo-600/30 rounded-full blur-2xl opacity-40"></div>

        <button 
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-slate-400 hover:text-white transition-colors duration-200"
          aria-label="Close install banner"
        >
          <X size={18} />
        </button>

        <div className="flex gap-4">
          <div className="relative flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-tr from-[#3F030B] to-[#7E1523] border border-white/10 overflow-hidden flex items-center justify-center p-1 shadow-md shadow-[#3F030B]/25">
            <Image
              src="/logo/richyreach-logo.png"
              alt="Richy Reach Icon"
              width={40}
              height={40}
              className="object-contain"
            />
          </div>

          <div className="flex-1 space-y-1 pr-6">
            <h4 className="font-semibold text-sm tracking-tight text-white flex items-center gap-1.5">
              Install Richy Reach App
              <span className="flex items-center gap-0.5 text-[10px] bg-amber-500/20 text-amber-300 font-medium px-1.5 py-0.5 rounded-full">
                <Star size={10} fill="currentColor" /> Premium
              </span>
            </h4>
            <p className="text-xs text-slate-400 leading-normal">
              Install our application on your home screen for rapid access, notifications, and an immersive native experience.
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end gap-3">
          <button
            onClick={handleDismiss}
            className="text-xs font-medium text-slate-400 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/5"
          >
            Later
          </button>
          <button
            onClick={handleInstallClick}
            className="relative overflow-hidden group flex items-center gap-1.5 text-xs font-semibold bg-gradient-to-r from-[#7E1523] to-[#A81E32] hover:from-[#A81E32] hover:to-[#C0263E] text-white px-4 py-2 rounded-xl shadow-lg shadow-[#7E1523]/20 hover:shadow-[#A81E32]/30 active:scale-95 transition-all duration-200"
          >
            <Download size={14} />
            <span>Install Now</span>
          </button>
        </div>
      </div>
    </div>
  );
}
