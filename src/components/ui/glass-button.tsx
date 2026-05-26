import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  href?: string;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "default" | "lg";
  children: React.ReactNode;
  className?: string;
}

export const GlassButton = React.forwardRef<HTMLButtonElement & HTMLAnchorElement, GlassButtonProps>(
  ({ href, variant = "primary", size = "default", children, className, ...props }, ref) => {
    // Glassmorphic styling classes based on variant and light/dark modes
    const baseStyles = cn(
      "inline-flex shrink-0 items-center justify-center rounded-xl font-semibold transition-all duration-300 outline-none select-none backdrop-blur-md disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
      {
        // 1. Primary Solid-Glass (Luxury Deep Burgundy & Crimson Gradient with translucent overlay)
        "bg-gradient-to-r from-[#3F030B]/90 to-[#7E1523]/90 hover:from-[#3F030B] hover:to-[#7E1523] dark:from-[#7E1523]/80 dark:to-[#3F030B]/80 dark:hover:from-[#7E1523]/95 dark:hover:to-[#3F030B]/95 text-white border border-white/10 dark:border-white/5 shadow-lg shadow-[#3F030B]/20 hover:shadow-[#3F030B]/35":
          variant === "primary",

        // 2. Secondary Soft-Glass (Lighter crimson burgundy backdrop)
        "bg-[#7E1523]/10 hover:bg-[#7E1523]/25 dark:bg-[#7E1523]/20 dark:hover:bg-[#7E1523]/35 text-[#7E1523] dark:text-rose-300 border border-[#7E1523]/20 dark:border-[#7E1523]/30":
          variant === "secondary",

        // 3. Clear Outline-Glass (Translucent glass borders with responsive brand text)
        "bg-white/40 dark:bg-slate-900/40 hover:bg-primary/10 dark:hover:bg-primary/10 text-primary border border-primary/20 hover:border-primary/40 shadow-sm":
          variant === "outline",

        // 4. Minimal Ghost-Glass
        "hover:bg-primary/10 text-primary dark:hover:bg-primary/15":
          variant === "ghost",
      },
      {
        "h-8 px-4 text-xs gap-1.5": size === "sm",
        "h-11 px-6 text-sm gap-2": size === "default",
        "h-14 px-8 text-base gap-2.5": size === "lg",
      },
      className
    );

    if (href) {
      return (
        <Link href={href} className={baseStyles} {...(props as any)}>
          {children}
        </Link>
      );
    }

    return (
      <button ref={ref as any} className={baseStyles} {...props}>
        {children}
      </button>
    );
  }
);

GlassButton.displayName = "GlassButton";
