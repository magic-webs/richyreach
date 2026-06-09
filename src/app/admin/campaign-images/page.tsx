"use client";

import React, { useState } from "react";
import { useAuth } from "../../layout-shell";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Trash2,
  Plus,
  Image as ImageIcon,
  Loader2,
  Sparkles,
  Filter,
  Pencil,
  X,
  Check,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface CampaignImage {
  id: string;
  imageUrl: string;
  category: string;
  usedCount: number;
  createdAt: string;
}

const BACKEND_API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://backend-api.richyreach.com/api";

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

export default function AdminCampaignImagesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // ── Add form state ──────────────────────────────────────────────────
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [categoryInput, setCategoryInput] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  // ── Edit modal state ────────────────────────────────────────────────
  const [editTarget, setEditTarget] = useState<CampaignImage | null>(null);
  const [editCategory, setEditCategory] = useState("");
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImageUrl, setEditImageUrl] = useState("");

  // ── Fetch ───────────────────────────────────────────────────────────
  const {
    data: campaignImages = [],
    isLoading,
    error,
  } = useQuery<CampaignImage[]>({
    queryKey: ["campaignImages"],
    queryFn: async () => {
      const res = await fetch(`${BACKEND_API_URL}/admin/campaign-images`, {
        headers: getAuthHeaders(),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch campaign images");
      const json = (await res.json()) as any;
      return json.success ? json.data : [];
    },
    enabled: user.role === "admin",
  });

  // ── Add mutation ────────────────────────────────────────────────────
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch(`${BACKEND_API_URL}/admin/campaign-images`, {
        method: "POST",
        body: formData,
        headers: getAuthHeaders(),
        credentials: "include",
      });
      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({}));
        throw new Error((errorJson as any).error || "Failed to upload image");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Campaign template image uploaded successfully");
      queryClient.invalidateQueries({ queryKey: ["campaignImages"] });
      setCategoryInput("");
      setImageFile(null);
      setImageUrlInput("");
      setShowAddForm(false);
    },
    onError: (err: any) => {
      toast.error(err.message || "Something went wrong during upload");
    },
  });

  // ── Edit mutation ───────────────────────────────────────────────────
  const editMutation = useMutation({
    mutationFn: async ({
      id,
      formData,
    }: {
      id: string;
      formData: FormData;
    }) => {
      const res = await fetch(
        `${BACKEND_API_URL}/admin/campaign-images/${id}`,
        {
          method: "PUT",
          body: formData,
          headers: getAuthHeaders(),
          credentials: "include",
        }
      );
      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({}));
        throw new Error((errorJson as any).error || "Failed to update image");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Campaign template updated successfully");
      queryClient.invalidateQueries({ queryKey: ["campaignImages"] });
      closeEditModal();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update template");
    },
  });

  // ── Delete mutation ─────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(
        `${BACKEND_API_URL}/admin/campaign-images/${id}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
          credentials: "include",
        }
      );
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

  // Auth guard
  if (user.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-slate-500">Admin access required.</p>
      </div>
    );
  }

  // ── Helpers ─────────────────────────────────────────────────────────
  const openEditModal = (img: CampaignImage) => {
    setEditTarget(img);
    setEditCategory(img.category);
    setEditImageFile(null);
    setEditImageUrl("");
  };

  const closeEditModal = () => {
    setEditTarget(null);
    setEditCategory("");
    setEditImageFile(null);
    setEditImageUrl("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryInput.trim()) {
      toast.error("Please enter a category");
      return;
    }
    if (!imageFile && !imageUrlInput.trim()) {
      toast.error("Please upload an image file or provide an image URL");
      return;
    }
    const formData = new FormData();
    formData.append("category", categoryInput.trim());
    if (imageFile) formData.append("image", imageFile);
    if (imageUrlInput.trim()) formData.append("imageUrl", imageUrlInput.trim());
    uploadMutation.mutate(formData);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;

    // At least one field must be changed
    const noChange =
      editCategory.trim() === editTarget.category &&
      !editImageFile &&
      !editImageUrl.trim();

    if (noChange) {
      toast.error("No changes detected. Please modify at least one field.");
      return;
    }

    const formData = new FormData();
    if (editCategory.trim() && editCategory.trim() !== editTarget.category) {
      formData.append("category", editCategory.trim());
    }
    if (editImageFile) formData.append("image", editImageFile);
    if (editImageUrl.trim()) formData.append("imageUrl", editImageUrl.trim());

    editMutation.mutate({ id: editTarget.id, formData });
  };

  // Derived data
  const categories = [
    "All",
    ...Array.from(new Set(campaignImages.map((img) => img.category))),
  ];
  const filteredImages =
    selectedCategory === "All"
      ? campaignImages
      : campaignImages.filter((img) => img.category === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10 px-4 md:px-0">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-sm font-medium text-primary">Admin Section</h1>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mt-1">
            Campaign Images
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage category-wise campaign banners and preset templates used by
            brands.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#3F030B] to-[#7E1523] hover:from-[#4E040E] hover:to-[#921B2B] text-white font-bold text-sm rounded-xl shadow-md transition-all active:scale-[0.98]"
        >
          {showAddForm ? (
            "Cancel"
          ) : (
            <>
              <Plus className="w-4 h-4" /> Add Template
            </>
          )}
        </button>
      </div>

      {/* ── Add Form ── */}
      {showAddForm && (
        <div className="bg-white/80 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-xl max-w-xl animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
              Upload New Template Image
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Category
              </label>
              <input
                type="text"
                placeholder="e.g. Beauty, Technology, Fashion"
                value={categoryInput}
                onChange={(e) => setCategoryInput(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/40 focus:border-primary transition-all text-slate-900 dark:text-white"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Upload Local File
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
                      {imageFile ? imageFile.name : "Select Image File"}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      PNG, JPG up to 5MB
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
                    Direct Image URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com/banner.jpg"
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
                  <Loader2 className="w-4 h-4 animate-spin" /> Uploading to
                  Cloudinary...
                </>
              ) : (
                "Save Template Image"
              )}
            </button>
          </form>
        </div>
      )}

      {/* ── Category Filter Tabs ── */}
      <div className="flex items-center gap-2 pb-2 overflow-x-auto border-b border-slate-200 dark:border-slate-800/60 scrollbar-none">
        <Filter className="w-4 h-4 text-slate-400 shrink-0" />
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${
              selectedCategory === cat
                ? "bg-primary/10 border-primary/30 text-primary"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ── Loading / Error / Empty ── */}
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
              No campaign templates
            </h4>
            <p className="text-xs text-slate-500">
              Upload preset banner designs to get started.
            </p>
          </div>
        </div>
      ) : (
        /* ── Image Grid ── */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredImages.map((img) => (
            <div
              key={img.id}
              className="group relative bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-sm dark:shadow-none hover:shadow-lg transition-all duration-300 hover:scale-[1.01]"
            >
              {/* Image Banner */}
              <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-950">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.imageUrl}
                  alt={`Category template ${img.category}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-60" />

                {/* Category tag */}
                <span className="absolute top-3 left-3 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-950/60 backdrop-blur-md text-white border border-white/10">
                  {img.category}
                </span>

                {/* Used counter */}
                <span className="absolute bottom-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/20 backdrop-blur-md text-primary border border-primary/25">
                  Used: {img.usedCount} times
                </span>
              </div>

              {/* Card Footer */}
              <div className="p-4 flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-450 dark:text-slate-500">
                    Uploaded {new Date(img.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Edit Action */}
                  <button
                    onClick={() => openEditModal(img)}
                    className="p-2 text-blue-500 hover:bg-blue-500/10 active:scale-[0.9] transition-all rounded-xl border border-transparent hover:border-blue-500/20"
                    title="Edit Template"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>

                  {/* Delete Action */}
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          "Are you sure you want to delete this template image?"
                        )
                      ) {
                        deleteMutation.mutate(img.id);
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
          ))}
        </div>
      )}

      {/* ── Edit Modal Overlay ── */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                  <Pencil className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                  Edit Template Image
                </h3>
              </div>
              <button
                onClick={closeEditModal}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current preview */}
            <div className="mb-4 rounded-2xl overflow-hidden aspect-video bg-slate-100 dark:bg-slate-950 relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={editTarget.imageUrl}
                alt={editTarget.category}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/60 text-white backdrop-blur-md">
                Current Image
              </span>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              {/* Category */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Category
                </label>
                <input
                  type="text"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  placeholder="e.g. Beauty, Technology, Fashion"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 dark:text-white"
                />
              </div>

              {/* Replace Image */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Replace with File
                  </label>
                  <div className="relative flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-blue-500/50 rounded-xl p-4 transition-colors bg-slate-50 dark:bg-slate-950/20">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setEditImageFile(e.target.files[0]);
                          setEditImageUrl(""); // clear URL if file picked
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="text-center space-y-1.5 pointer-events-none">
                      <ImageIcon className="w-5 h-5 mx-auto text-slate-400" />
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                        {editImageFile
                          ? editImageFile.name
                          : "Select New Image"}
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
                      New Image URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://example.com/new-banner.jpg"
                      value={editImageUrl}
                      onChange={(e) => {
                        setEditImageUrl(e.target.value);
                        if (e.target.value) setEditImageFile(null); // clear file if URL typed
                      }}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editMutation.isPending}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold rounded-xl shadow-md transition-all disabled:opacity-50 active:scale-[0.99] text-sm"
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
          </div>
        </div>
      )}
    </div>
  );
}
