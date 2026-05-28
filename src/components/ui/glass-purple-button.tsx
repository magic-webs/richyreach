import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface GlassPurpleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  href?: string;
  className?: string;
  children: React.ReactNode;
}

export const GlassPurpleButton = React.forwardRef<HTMLButtonElement & HTMLAnchorElement, GlassPurpleButtonProps>(
  ({ href, className, children, ...props }, ref) => {
    const baseStyles = cn(
      "btn-glass-purple py-4 rounded-2xl font-extrabold text-sm text-white cursor-pointer flex items-center justify-center gap-2 select-none disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
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

GlassPurpleButton.displayName = "GlassPurpleButton";
