"use client";

import React, { useState } from "react";
import { useAuth } from "../../layout-shell";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2, Plus, Music, Search, Loader2, Sparkles, Image as ImageIcon, ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface TrendingSong {
  id: string;
  title: string;
  artist: string;
  imageUrl: string;
  instagramAudioUrl: string;
  createdAt: string;
}

const BACKEND_API_URL = "https://backend-api.richyreach.com/api";

const getAuthHeaders = () => {
  const headers: Record<string, string> = {};
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("reelio_session_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }
  return headers;
};

export default function AdminTrendingSongsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // States
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [instagramAudioUrl, setInstagramAudioUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrlInput, setImageUrlInput] = useState("");

  // Fetch trending songs
  const { data: trendingSongs = [], isLoading, error } = useQuery<TrendingSong[]>({
    queryKey: ["adminTrendingSongs"],
    queryFn: async () => {
      const res = await fetch(`${BACKEND_API_URL}/admin/trending-songs`, {
        headers: getAuthHeaders(),
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Failed to fetch trending songs");
      }
      const json = await res.json() as any;
      return json.success ? json.data : [];
    },
    enabled: user.role === "admin",
  });

  // Add trending song mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch(`${BACKEND_API_URL}/admin/trending-songs`, {
        method: "POST",
        body: formData,
        headers: getAuthHeaders(),
        credentials: "include",
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
      // Reset form fields
      setTitle("");
      setArtist("");
      setInstagramAudioUrl("");
      setImageFile(null);
      setImageUrlInput("");
      setShowAddForm(false);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to add trending song");
    },
  });

  // Delete trending song mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${BACKEND_API_URL}/admin/trending-songs/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
        credentials: "include",
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

  // Auth guard
  if (user.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-slate-500">Admin access required.</p>
      </div>
    );
  }

  // Form submit handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !artist.trim() || !instagramAudioUrl.trim()) {
      toast.error("Please fill in all required fields (title, artist, audio link)");
      return;
    }
    if (!imageFile && !imageUrlInput.trim()) {
      toast.error("Please upload a cover image or provide a cover image URL");
      return;
    }

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("artist", artist.trim());
    formData.append("instagramAudioUrl", instagramAudioUrl.trim());
    if (imageFile) {
      formData.append("image", imageFile);
    }
    if (imageUrlInput.trim()) {
      formData.append("imageUrl", imageUrlInput.trim());
    }

    uploadMutation.mutate(formData);
  };

  // Filtered songs
  const filteredSongs = trendingSongs.filter(
    (song) =>
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10 px-4 md:px-0">
      {/* Header */}
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

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#3F030B] to-[#7E1523] hover:from-[#4E040E] hover:to-[#921B2B] text-white font-bold text-sm rounded-xl shadow-md transition-all active:scale-[0.98]"
        >
          {showAddForm ? "Cancel" : <><Plus className="w-4 h-4" /> Add Song</>}
        </button>
      </div>

      {/* Add Song Collapsible Form */}
      {showAddForm && (
        <div className="bg-white/80 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-xl max-w-xl animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Publish Trending Song</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Cover Art (Local Upload)
                </label>
                <div className="relative flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-primary/50 dark:hover:border-primary/50 rounded-xl p-4 transition-colors bg-slate-50 dark:bg-slate-950/20">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setImageFile(e.target.files[0]);
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="text-center space-y-1.5 pointer-events-none">
                    <ImageIcon className="w-6 h-6 mx-auto text-slate-400" />
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      {imageFile ? imageFile.name : "Select Cover Image"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-center">
                <div className="text-center text-xs font-bold text-slate-450 dark:text-slate-500 py-1">
                  — OR —
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Cover Image URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com/cover.jpg"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={uploadMutation.isPending}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#3F030B] to-[#7E1523] hover:from-[#4E040E] hover:to-[#921B2B] text-white font-bold rounded-xl shadow-md transition-all disabled:opacity-50 active:scale-[0.99] text-sm mt-2"
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
        </div>
      )}

      {/* Search Bar */}
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

      {/* Loading list state */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-16 rounded-2xl" />
          <Skeleton className="h-16 rounded-2xl" />
          <Skeleton className="h-16 rounded-2xl" />
          <Skeleton className="h-16 rounded-2xl" />
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 rounded-3xl">
          <p className="text-slate-500 text-sm">Failed to load trending songs. Please try again later.</p>
        </div>
      ) : filteredSongs.length === 0 ? (
        <div className="text-center py-16 bg-white/40 dark:bg-slate-900/20 border border-slate-200/80 dark:border-slate-800/50 rounded-3xl flex flex-col items-center justify-center space-y-3">
          <Music className="w-10 h-10 text-slate-400" />
          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 dark:text-white text-base">No trending tracks</h4>
            <p className="text-xs text-slate-500">Publish viral audio links for campaigns.</p>
          </div>
        </div>
      ) : (
        /* Audio List */
        <div className="bg-white dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800/60 rounded-3xl overflow-hidden shadow-sm dark:shadow-none divide-y divide-slate-200 dark:divide-slate-800/60">
          {filteredSongs.map((song) => (
            <div
              key={song.id}
              className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-colors"
            >
              <div className="flex items-center gap-4 min-w-0">
                {/* Cover art image preview */}
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

              <div className="flex items-center gap-3">
                {/* External Instagram Audio URL Link */}
                <a
                  href={song.instagramAudioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-400 transition-colors border border-slate-200/50 dark:border-slate-800"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Reels Audio
                </a>

                {/* Delete button */}
                <button
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to remove "${song.title}"?`)) {
                      deleteMutation.mutate(song.id);
                    }
                  }}
                  disabled={deleteMutation.isPending}
                  className="p-2 text-rose-500 hover:bg-rose-500/10 active:scale-[0.9] transition-all rounded-xl border border-transparent hover:border-rose-500/20"
                  title="Remove track"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
