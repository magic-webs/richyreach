"use client";

import React, { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, Loader2, Check } from "lucide-react";
import { api } from "@/lib/api-client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImageUploadField } from "../../campaign-images/_components/ImageUploadField";
import type { TrendingSong } from "./types";

interface EditSongDialogProps {
  song: TrendingSong | null;
  onClose: () => void;
}

export function EditSongDialog({ song, onClose }: EditSongDialogProps) {
  const queryClient = useQueryClient();

  const [editTitle, setEditTitle] = useState("");
  const [editArtist, setEditArtist] = useState("");
  const [editInstagramAudioUrl, setEditInstagramAudioUrl] = useState("");
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImageUrl, setEditImageUrl] = useState("");

  // Sync form fields when the target song changes
  useEffect(() => {
    if (song) {
      setEditTitle(song.title);
      setEditArtist(song.artist);
      setEditInstagramAudioUrl(song.instagramAudioUrl);
      setEditImageFile(null);
      setEditImageUrl("");
    }
  }, [song]);

  const editMutation = useMutation({
    mutationFn: async ({
      id,
      formData,
    }: {
      id: string;
      formData: FormData;
    }) => {
      const res = await api(`/admin/trending-songs/${id}`, {
        method: "PUT",
        body: formData,
      });
      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({}));
        throw new Error((errorJson as any).error || "Failed to update song");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Trending song updated successfully");
      queryClient.invalidateQueries({ queryKey: ["adminTrendingSongs"] });
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update song");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!song) return;

    const noChange =
      editTitle.trim() === song.title &&
      editArtist.trim() === song.artist &&
      editInstagramAudioUrl.trim() === song.instagramAudioUrl &&
      !editImageFile &&
      !editImageUrl.trim();

    if (noChange) {
      toast.error("No changes detected. Please modify at least one field.");
      return;
    }

    const formData = new FormData();
    if (editTitle.trim() && editTitle.trim() !== song.title)
      formData.append("title", editTitle.trim());
    if (editArtist.trim() && editArtist.trim() !== song.artist)
      formData.append("artist", editArtist.trim());
    if (
      editInstagramAudioUrl.trim() &&
      editInstagramAudioUrl.trim() !== song.instagramAudioUrl
    )
      formData.append("instagramAudioUrl", editInstagramAudioUrl.trim());
    if (editImageFile) formData.append("image", editImageFile);
    if (editImageUrl.trim()) formData.append("imageUrl", editImageUrl.trim());

    editMutation.mutate({ id: song.id, formData });
  };

  return (
    <Dialog
      open={!!song}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <DialogContent className="sm:max-w-lg rounded-3xl p-6">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
              <Pencil className="w-5 h-5" />
            </div>
            <DialogTitle className="text-lg font-black text-slate-900 dark:text-white">
              Edit Trending Song
            </DialogTitle>
          </div>
        </DialogHeader>

        {song && (
          <>
            {/* Current cover preview */}
            <div className="mt-2 flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={song.imageUrl}
                  alt={song.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm text-slate-900 dark:text-white truncate">
                  {song.title}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {song.artist}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Song Title
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Song title"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Artist Name
                  </label>
                  <input
                    type="text"
                    value={editArtist}
                    onChange={(e) => setEditArtist(e.target.value)}
                    placeholder="Artist name"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Instagram Reels Audio URL
                </label>
                <input
                  type="url"
                  value={editInstagramAudioUrl}
                  onChange={(e) => setEditInstagramAudioUrl(e.target.value)}
                  placeholder="https://www.instagram.com/reels/audio/..."
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 dark:text-white"
                />
              </div>

              {/* Cover Art Upload */}
              <ImageUploadField
                file={editImageFile}
                url={editImageUrl}
                onFileChange={setEditImageFile}
                onUrlChange={setEditImageUrl}
                accentBorderHover="hover:border-blue-500/50"
                accentFocus="focus:ring-blue-500/20 focus:border-blue-500"
                fileLabel="Replace Cover (File)"
                urlLabel="New Cover URL"
                urlPlaceholder="https://example.com/new-cover.jpg"
              />

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editMutation.isPending}
                  className="btn-glass-primary flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-white font-bold shadow-md transition-all disabled:opacity-50 active:scale-[0.99] text-sm border-none cursor-pointer"
                >
                  {editMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" /> Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
