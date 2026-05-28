"use client";

import React from "react";

interface ReachScoreRingProps {
  score: number; // 0-100
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  animate?: boolean;
}

export function ReachScoreRing({
  score,
  size = 80,
  strokeWidth = 7,
  showLabel = true,
  animate = true,
}: ReachScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(100, Math.max(0, score));
  const dashOffset = circumference - (progress / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 71) return { stroke: "#10b981", glow: "rgba(16,185,129,0.4)", label: "text-emerald-500 dark:text-emerald-400" };
    if (s >= 41) return { stroke: "#f59e0b", glow: "rgba(245,158,11,0.4)", label: "text-amber-500 dark:text-amber-400" };
    return { stroke: "#ef4444", glow: "rgba(239,68,68,0.4)", label: "text-rose-500 dark:text-rose-400" };
  };

  const { stroke, glow, label } = getColor(progress);
  const center = size / 2;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background ring */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-200 dark:text-slate-700"
        />
        {/* Progress ring */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{
            filter: `drop-shadow(0 0 6px ${glow})`,
            transition: animate ? "stroke-dashoffset 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)" : "none",
          }}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-black leading-none ${label}`} style={{ fontSize: size * 0.22 }}>
            {Math.round(progress)}
          </span>
          <span className="text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider" style={{ fontSize: size * 0.1 }}>
            Score
          </span>
        </div>
      )}
    </div>
  );
}
