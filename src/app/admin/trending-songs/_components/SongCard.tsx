"use client";

import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Music, ExternalLink, Pencil, Trash2 } from "lucide-react";
import { api } from "@/lib/api-client";
import type { TrendingSong } from "./types";

interface SongCardProps {
  song: TrendingSong;
  onEditClick: (song: TrendingSong) => void;
}

export function SongCard({ song, onEditClick }: SongCardProps) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api(`/admin/trending-songs/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({}));
        throw new Error((errorJson as any).error || "Failed to delete song");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Trending song deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["adminTrendingSongs"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete song");
    },
  });

  return (
    <div className="p-4 flex flex-col md:flex-row md:items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-colors gap-4">
      <div className="flex items-center gap-4 min-w-0">
        {/* Cover art */}
        <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 shrink-0 border border-slate-200/40 dark:border-slate-800/40 relative group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={song.imageUrl}
            alt={song.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <Music className="w-4 h-4 text-white" />
          </div>
        </div>

        <div className="min-w-0">
          <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
            {song.title}
          </h4>
          <p className="text-xs text-slate-550 dark:text-slate-400 truncate mt-0.5">
            {song.artist}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end md:self-auto">
        {/* Instagram Audio link */}
        <a
          href={song.instagramAudioUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-400 transition-colors border border-slate-200/50 dark:border-slate-800"
        >
          <ExternalLink className="w-3.5 h-3.5" /> Reels Audio
        </a>

        {/* Edit button */}
        <button
          onClick={() => onEditClick(song)}
          className="p-2 text-blue-500 hover:bg-blue-500/10 active:scale-[0.9] transition-all rounded-xl border border-transparent hover:border-blue-500/20 cursor-pointer"
          title="Edit Song"
        >
          <Pencil className="w-4 h-4" />
        </button>

        {/* Delete button */}
        <button
          onClick={() => {
            if (window.confirm(`Are you sure you want to remove "${song.title}"?`)) {
              deleteMutation.mutate(song.id);
            }
          }}
          disabled={deleteMutation.isPending}
          className="p-2 text-rose-500 hover:bg-rose-500/10 active:scale-[0.9] transition-all rounded-xl border border-transparent hover:border-rose-500/20 cursor-pointer disabled:opacity-50"
          title="Remove track"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
