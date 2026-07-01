"use client";

import React, { useState } from "react";
import { useAuth } from "../../layout-shell";
import { useQuery } from "@tanstack/react-query";
import { Image as ImageIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api-client";

import type { ArenaImage } from "./_components/types";
import { AddImageDialog } from "./_components/AddImageDialog";
import { EditImageDialog } from "./_components/EditImageDialog";
import { ImageCard } from "./_components/ImageCard";
import { CategoryFilterTabs } from "./_components/CategoryFilterTabs";

export default function AdminArenaImagesPage() {
  const { user } = useAuth();

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [editTarget, setEditTarget] = useState<ArenaImage | null>(null);

  // ── Data ──────────────────────────────────────────────────────────────
  const {
    data: arenaImages = [],
    isLoading,
    error,
  } = useQuery<ArenaImage[]>({
    queryKey: ["arenaImages"],
    queryFn: async () => {
      const res = await api(`/admin/arena-images`);
      if (!res.ok) throw new Error("Failed to fetch arena images");
      const json = (await res.json()) as any;
      return json.success ? json.data : [];
    },
    enabled: user.role === "admin",
  });

  // Auth guard
  if (user.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-slate-500">Admin access required.</p>
      </div>
    );
  }

  // Derived data
  const DEFAULT_CATEGORIES = [
    "General",
    "Fashion",
    "Beauty",
    "Tech",
    "Food",
    "Travel",
    "Fitness",
    "Lifestyle",
    "Gaming",
    "Education",
  ];
  const actualCategories = Array.from(
    new Set([...DEFAULT_CATEGORIES, ...arenaImages.map((img) => img.category)])
  );
  const categories = ["All", ...actualCategories];
  const filteredImages =
    selectedCategory === "All"
      ? arenaImages
      : arenaImages.filter((img) => img.category === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10 px-4 md:px-0">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-sm font-medium text-primary">Admin Section</h1>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mt-1">
            Arena Banners
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage category-wise arena contest banners and preset designs used by brands.
          </p>
        </div>

        {/* Add dialog trigger */}
        <AddImageDialog existingCategories={actualCategories} />
      </div>

      {/* ── Category filter ── */}
      <CategoryFilterTabs
        categories={categories}
        selected={selectedCategory}
        onSelect={setSelectedCategory}
      />

      {/* ── Loading / Error / Empty / Grid ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <Skeleton className="h-60 rounded-3xl" />
          <Skeleton className="h-60 rounded-3xl" />
          <Skeleton className="h-60 rounded-3xl" />
          <Skeleton className="h-60 rounded-3xl" />
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 rounded-3xl">
          <p className="text-slate-500 text-sm">
            Failed to load templates. Please try again later.
          </p>
        </div>
      ) : filteredImages.length === 0 ? (
        <div className="text-center py-16 bg-white/40 dark:bg-slate-900/20 border border-slate-200/80 dark:border-slate-800/50 rounded-3xl flex flex-col items-center justify-center space-y-3">
          <ImageIcon className="w-10 h-10 text-slate-400" />
          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 dark:text-white text-base">
              No arena templates
            </h4>
            <p className="text-xs text-slate-500">
              Upload preset banner designs to get started.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredImages.map((img) => (
            <ImageCard
              key={img.id}
              image={img}
              onEditClick={setEditTarget}
            />
          ))}
        </div>
      )}

      {/* ── Edit dialog (controlled externally) ── */}
      <EditImageDialog
        image={editTarget}
        onClose={() => setEditTarget(null)}
        existingCategories={actualCategories}
      />
    </div>
  );
}
