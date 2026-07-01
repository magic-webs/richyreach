"use client";

import React from "react";
import { Filter } from "lucide-react";

interface CategoryFilterTabsProps {
  categories: string[];
  selected: string;
  onSelect: (cat: string) => void;
}

export function CategoryFilterTabs({
  categories,
  selected,
  onSelect,
}: CategoryFilterTabsProps) {
  return (
    <div className="flex items-center gap-2 pb-2 overflow-x-auto border-b border-slate-200 dark:border-slate-800/60 scrollbar-none">
      <Filter className="w-4 h-4 text-slate-400 shrink-0" />
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${
            selected === cat
              ? "bg-primary/10 border-primary/30 text-primary"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
