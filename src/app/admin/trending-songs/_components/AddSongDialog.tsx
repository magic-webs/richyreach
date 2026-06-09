"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Loader2, Sparkles } from "lucide-react";
import { api } from "@/lib/api-client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ImageUploadField } from "../../campaign-images/_components/ImageUploadField";

export function AddSongDialog() {
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [instagramAudioUrl, setInstagramAudioUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");

  const resetForm = () => {
    setTitle("");
    setArtist("");
    setInstagramAudioUrl("");
    setImageFile(null);
    setImageUrl("");
  };

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await api(`/admin/trending-songs`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({}));
        throw new Error((errorJson as any).error || "Failed to add trending song");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Trending song added successfully");
      queryClient.invalidateQueries({ queryKey: ["adminTrendingSongs"] });
      resetForm();
      setOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to add trending song");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !artist.trim() || !instagramAudioUrl.trim()) {
      toast.error("Please fill in all required fields (title, artist, audio link)");
      return;
    }
    if (!imageFile && !imageUrl.trim()) {
      toast.error("Please upload a cover image or provide a cover image URL");
      return;
    }
    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("artist", artist.trim());
    formData.append("instagramAudioUrl", instagramAudioUrl.trim());
    if (imageFile) formData.append("image", imageFile);
    if (imageUrl.trim()) formData.append("imageUrl", imageUrl.trim());
    uploadMutation.mutate(formData);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) resetForm();
      }}
    >
      <DialogTrigger
        className="btn-glass-purple flex items-center gap-2 px-6 py-2.5 rounded-2xl font-bold text-sm text-white cursor-pointer border-none shadow-md transition-all active:scale-[0.98]"
      >
        <Plus className="w-4 h-4" />
        Add Song
      </DialogTrigger>

      <DialogContent className="sm:max-w-xl rounded-3xl p-6">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Sparkles className="w-5 h-5" />
            </div>
            <DialogTitle className="text-lg font-black text-slate-900 dark:text-white">
              Publish Trending Song
            </DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Song Title *
              </label>
              <input
                type="text"
                placeholder="e.g. As It Was"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Artist Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Harry Styles"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 dark:text-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Instagram Reels Audio URL *
            </label>
            <input
              type="url"
              placeholder="https://www.instagram.com/reels/audio/..."
              value={instagramAudioUrl}
              onChange={(e) => setInstagramAudioUrl(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 dark:text-white"
              required
            />
          </div>

          {/* Cover Art Upload */}
          <ImageUploadField
            file={imageFile}
            url={imageUrl}
            onFileChange={setImageFile}
            onUrlChange={setImageUrl}
            fileLabel="Cover Art (Local Upload)"
            urlLabel="Cover Image URL"
            urlPlaceholder="https://example.com/cover.jpg"
          />

          <button
            type="submit"
            disabled={uploadMutation.isPending}
            className="btn-glass-purple w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-white font-bold shadow-md transition-all disabled:opacity-50 active:scale-[0.99] text-sm mt-2 border-none cursor-pointer"
          >
            {uploadMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Uploading Cover Art...
              </>
            ) : (
              "Save Trending Track"
            )}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
