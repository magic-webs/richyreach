"use client";

import React, { useState } from "react";
import { useAuth } from "../../layout-shell";
import { useQuery } from "@tanstack/react-query";
import { Search, Music } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api-client";

import type { TrendingSong } from "./_components/types";
import { AddSongDialog } from "./_components/AddSongDialog";
import { EditSongDialog } from "./_components/EditSongDialog";
import { SongCard } from "./_components/SongCard";

export default function AdminTrendingSongsPage() {
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [editTarget, setEditTarget] = useState<TrendingSong | null>(null);

  // ── Data ──────────────────────────────────────────────────────────────
  const {
    data: trendingSongs = [],
    isLoading,
    error,
  } = useQuery<TrendingSong[]>({
    queryKey: ["adminTrendingSongs"],
    queryFn: async () => {
      const res = await api(`/admin/trending-songs`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch trending songs");
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
  const filteredSongs = trendingSongs.filter(
    (song) =>
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10 px-4 md:px-0">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-sm font-medium text-primary">Admin Section</h1>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mt-1">
            Trending Songs
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Publish viral Instagram audio tracks for creators to use in campaigns.
          </p>
        </div>

        {/* Add dialog trigger */}
        <AddSongDialog />
      </div>

      {/* ── Search Bar ── */}
      <div className="relative max-w-md bg-white dark:bg-slate-900/30 rounded-2xl border border-slate-200 dark:border-slate-800/60 p-1 flex items-center">
        <Search className="w-5 h-5 ml-3 text-slate-450 dark:text-slate-500" />
        <input
          type="text"
          placeholder="Search songs or artists..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-2 pr-4 py-2 text-sm bg-transparent border-0 focus:outline-none focus:ring-0 text-slate-900 dark:text-white"
        />
      </div>

      {/* ── Loading / Error / Empty ── */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-16 rounded-2xl" />
          <Skeleton className="h-16 rounded-2xl" />
          <Skeleton className="h-16 rounded-2xl" />
          <Skeleton className="h-16 rounded-2xl" />
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 rounded-3xl">
          <p className="text-slate-500 text-sm">
            Failed to load trending songs. Please try again later.
          </p>
        </div>
      ) : filteredSongs.length === 0 ? (
        <div className="text-center py-16 bg-white/40 dark:bg-slate-900/20 border border-slate-200/80 dark:border-slate-800/50 rounded-3xl flex flex-col items-center justify-center space-y-3">
          <Music className="w-10 h-10 text-slate-400" />
          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 dark:text-white text-base">
              No trending tracks
            </h4>
            <p className="text-xs text-slate-500">
              Publish viral audio links for campaigns.
            </p>
          </div>
        </div>
      ) : (
        /* ── Audio List ── */
        <div className="bg-white dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800/60 rounded-3xl overflow-hidden shadow-sm dark:shadow-none divide-y divide-slate-200 dark:divide-slate-800/60">
          {filteredSongs.map((song) => (
            <SongCard
              key={song.id}
              song={song}
              onEditClick={setEditTarget}
            />
          ))}
        </div>
      )}

      {/* ── Edit dialog (controlled externally) ── */}
      <EditSongDialog
        song={editTarget}
        onClose={() => setEditTarget(null)}
      />
    </div>
  );
}
