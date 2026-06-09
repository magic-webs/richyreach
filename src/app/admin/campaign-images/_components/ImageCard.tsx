"use client";

import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2, Pencil } from "lucide-react";
import { api } from "@/lib/api-client";
import type { CampaignImage } from "./types";

interface ImageCardProps {
  image: CampaignImage;
  onEditClick: (image: CampaignImage) => void;
}

export function ImageCard({ image, onEditClick }: ImageCardProps) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api(`/admin/campaign-images/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({}));
        throw new Error((errorJson as any).error || "Failed to delete image");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Campaign template image deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["campaignImages"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete image");
    },
  });

  return (
    <div className="group relative bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-sm dark:shadow-none hover:shadow-lg transition-all duration-300 hover:scale-[1.01]">
      {/* Image banner */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-950">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.imageUrl}
          alt={`Category template ${image.category}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-60" />

        {/* Category tag */}
        <span className="absolute top-3 left-3 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-950/60 backdrop-blur-md text-white border border-white/10">
          {image.category}
        </span>

        {/* Used counter */}
        <span className="absolute bottom-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/20 backdrop-blur-md text-primary border border-primary/25">
          Used: {image.usedCount} times
        </span>
      </div>

      {/* Card footer */}
      <div className="p-4 flex items-center justify-between">
        <p className="text-[10px] text-slate-450 dark:text-slate-500">
          Uploaded {new Date(image.createdAt).toLocaleDateString()}
        </p>

        <div className="flex items-center gap-1.5">
          {/* Edit */}
          <button
            onClick={() => onEditClick(image)}
            className="p-2 text-blue-500 hover:bg-blue-500/10 active:scale-[0.9] transition-all rounded-xl border border-transparent hover:border-blue-500/20"
            title="Edit Template"
          >
            <Pencil className="w-4 h-4" />
          </button>

          {/* Delete */}
          <button
            onClick={() => {
              if (
                window.confirm(
                  "Are you sure you want to delete this template image?"
                )
              ) {
                deleteMutation.mutate(image.id);
              }
            }}
            disabled={deleteMutation.isPending}
            className="p-2 text-rose-500 hover:bg-rose-500/10 active:scale-[0.9] transition-all rounded-xl border border-transparent hover:border-rose-500/20"
            title="Delete Template"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
