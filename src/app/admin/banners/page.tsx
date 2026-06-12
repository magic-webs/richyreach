"use client";

import React, { useState } from "react";
import { useAuth } from "../../layout-shell";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Plus, Trash2, Edit, Loader2, Sparkles, AlertCircle, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImageUploadField } from "../campaign-images/_components/ImageUploadField";

interface Banner {
  id: string;
  position: string;
  bannerType: "image" | "color" | "gradient" | "mixed";
  title: string | null;
  subtitle: string | null;
  imageUrl: string | null;
  link: string | null;
  bgColor: string | null;
  gradientColors: string[] | null;
  textColor: string;
  displayOrder: number;
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function AdminBannersPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Banner | null>(null);

  // Form states for Add / Edit
  const [position, setPosition] = useState("home_top");
  const [bannerType, setBannerType] = useState<"image" | "color" | "gradient" | "mixed">("mixed");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [link, setLink] = useState("");
  const [bgColor, setBgColor] = useState("");
  const [textColor, setTextColor] = useState("#ffffff");
  const [gradientColorsText, setGradientColorsText] = useState("");
  const [displayOrder, setDisplayOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");

  const resetForm = () => {
    setPosition("home_top");
    setBannerType("mixed");
    setTitle("");
    setSubtitle("");
    setLink("");
    setBgColor("");
    setTextColor("#ffffff");
    setGradientColorsText("");
    setDisplayOrder(0);
    setIsActive(true);
    setStartDate("");
    setEndDate("");
    setImageFile(null);
    setImageUrl("");
  };

  const loadEditTarget = (banner: Banner) => {
    setEditTarget(banner);
    setPosition(banner.position);
    setBannerType(banner.bannerType);
    setTitle(banner.title || "");
    setSubtitle(banner.subtitle || "");
    setLink(banner.link || "");
    setBgColor(banner.bgColor || "");
    setTextColor(banner.textColor || "#ffffff");
    setGradientColorsText(banner.gradientColors ? banner.gradientColors.join(", ") : "");
    setDisplayOrder(banner.displayOrder);
    setIsActive(banner.isActive);
    setStartDate(banner.startDate ? banner.startDate.substring(0, 16) : "");
    setEndDate(banner.endDate ? banner.endDate.substring(0, 16) : "");
    setImageFile(null);
    setImageUrl(banner.imageUrl || "");
  };

  // ── Query ──────────────────────────────────────────────────────────────────
  const {
    data: banners = [],
    isLoading,
    error,
  } = useQuery<Banner[]>({
    queryKey: ["adminBanners"],
    queryFn: async () => {
      const res = await api(`/admin/banners`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch promo banners");
      const json = await res.json();
      return json.success ? json.data : [];
    },
    enabled: user.role === "admin",
  });

  // ── Mutations ──────────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await api(`/admin/banners`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({}));
        throw new Error((errorJson as any).error || "Failed to create banner");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Promo banner created successfully");
      queryClient.invalidateQueries({ queryKey: ["adminBanners"] });
      resetForm();
      setIsAddOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create banner");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: FormData }) => {
      const res = await api(`/admin/banners/${id}`, {
        method: "PUT",
        body: formData,
      });
      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({}));
        throw new Error((errorJson as any).error || "Failed to update banner");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Promo banner updated successfully");
      queryClient.invalidateQueries({ queryKey: ["adminBanners"] });
      setEditTarget(null);
      resetForm();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update banner");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api(`/admin/banners/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({}));
        throw new Error((errorJson as any).error || "Failed to delete banner");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Promo banner deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["adminBanners"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete banner");
    },
  });

  // ── Form Handlers ──────────────────────────────────────────────────────────
  const getFormData = () => {
    const formData = new FormData();
    formData.append("position", position.trim());
    formData.append("bannerType", bannerType);
    if (title.trim()) formData.append("title", title.trim());
    if (subtitle.trim()) formData.append("subtitle", subtitle.trim());
    if (link.trim()) formData.append("link", link.trim());
    if (bgColor.trim()) formData.append("bgColor", bgColor.trim());
    formData.append("textColor", textColor.trim());
    formData.append("displayOrder", String(displayOrder));
    formData.append("isActive", String(isActive));
    if (startDate) formData.append("startDate", new Date(startDate).toISOString());
    if (endDate) formData.append("endDate", new Date(endDate).toISOString());

    if (gradientColorsText.trim()) {
      const colors = gradientColorsText.split(",").map(c => c.trim()).filter(Boolean);
      formData.append("gradientColors", JSON.stringify(colors));
    } else {
      formData.append("gradientColors", JSON.stringify([]));
    }

    if (imageFile) formData.append("image", imageFile);
    if (imageUrl.trim()) formData.append("imageUrl", imageUrl.trim());

    return formData;
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!position.trim()) {
      toast.error("Position is required");
      return;
    }
    createMutation.mutate(getFormData());
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    updateMutation.mutate({ id: editTarget.id, formData: getFormData() });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this banner?")) {
      deleteMutation.mutate(id);
    }
  };

  // Auth guard
  if (user.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-slate-500">Admin access required.</p>
      </div>
    );
  }

  // Derived data
  const filteredBanners = banners.filter(
    (b) =>
      b.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.title && b.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (b.subtitle && b.subtitle.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10 px-4 md:px-0">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-sm font-medium text-primary">Admin Section</h1>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mt-1">
            Promo Banners
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configure advertisement/promotional banners to showcase in different positions on the mobile app.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setIsAddOpen(true);
          }}
          className="btn-glass-purple flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl font-bold text-sm text-white cursor-pointer border-none shadow-md transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          Add Banner
        </button>
      </div>

      {/* ── Search Bar ── */}
      <div className="relative max-w-md bg-white dark:bg-slate-900/30 rounded-2xl border border-slate-200 dark:border-slate-800/60 p-1 flex items-center">
        <Search className="w-5 h-5 ml-3 text-slate-450 dark:text-slate-500" />
        <input
          type="text"
          placeholder="Search position, title, subtitle..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-2 pr-4 py-2 text-sm bg-transparent border-0 focus:outline-none focus:ring-0 text-slate-900 dark:text-white"
        />
      </div>

      {/* ── Loading / Error / Empty ── */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 rounded-3xl">
          <p className="text-slate-500 text-sm">Failed to load promo banners.</p>
        </div>
      ) : filteredBanners.length === 0 ? (
        <div className="text-center py-16 bg-white/40 dark:bg-slate-900/20 border border-slate-200/80 dark:border-slate-800/50 rounded-3xl flex flex-col items-center justify-center space-y-3">
          <AlertCircle className="w-10 h-10 text-slate-400" />
          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 dark:text-white text-base">No promo banners</h4>
            <p className="text-xs text-slate-500">Configure your first promo banner above.</p>
          </div>
        </div>
      ) : (
        /* ── Grid List ── */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBanners.map((banner) => {
            // Setup style for card preview
            let previewStyle: React.CSSProperties = {
              color: banner.textColor,
            };
            if (banner.bannerType === "color" && banner.bgColor) {
              previewStyle.backgroundColor = banner.bgColor;
            } else if (banner.bannerType === "gradient" && banner.gradientColors && banner.gradientColors.length > 0) {
              const colors = banner.gradientColors.join(", ");
              previewStyle.background = `linear-gradient(135deg, ${colors})`;
            } else if (banner.imageUrl) {
              previewStyle.backgroundImage = `url(${banner.imageUrl})`;
              previewStyle.backgroundSize = "cover";
              previewStyle.backgroundPosition = "center";
            } else {
              previewStyle.backgroundColor = "#2a0207"; // default oxblood dark
            }

            return (
              <div
                key={banner.id}
                className="bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800/60 rounded-3xl shadow-sm dark:shadow-none overflow-hidden flex flex-col h-full justify-between"
              >
                {/* Visual Preview */}
                <div style={previewStyle} className="h-32 p-4 flex flex-col justify-end relative">
                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-black/40 text-white rounded-md backdrop-blur-sm">
                      {banner.position}
                    </span>
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${banner.isActive ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-rose-500/20 text-rose-400 border border-rose-500/30"}`}>
                      {banner.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg leading-tight line-clamp-1">
                      {banner.title || "No Title"}
                    </h3>
                    <p className="text-xs opacity-80 mt-0.5 line-clamp-1">
                      {banner.subtitle || "No Subtitle"}
                    </p>
                  </div>
                </div>

                {/* Details Footer */}
                <div className="p-4 bg-slate-50/50 dark:bg-slate-900/10 border-t border-slate-100 dark:border-slate-800/40 flex items-center justify-between text-xs text-slate-500">
                  <div className="space-y-1">
                    <p className="truncate max-w-[150px]">Link: <span className="font-bold text-slate-800 dark:text-slate-300">{banner.link || "none"}</span></p>
                    <p>Order: <span className="font-semibold">{banner.displayOrder}</span></p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => loadEditTarget(banner)}
                      className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 hover:bg-slate-100 rounded-xl transition-all cursor-pointer text-slate-700 dark:text-slate-350"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(banner.id)}
                      className="p-2 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/20 rounded-xl transition-all cursor-pointer text-rose-500"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Dialogs ── */}

      {/* Create Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-xl rounded-3xl p-6 overflow-y-auto max-h-[85vh]">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Sparkles className="w-5 h-5" />
              </div>
              <DialogTitle className="text-lg font-black text-slate-900 dark:text-white">
                Create Promo Banner
              </DialogTitle>
            </div>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-4 mt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Position/Location *
                </label>
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-900 dark:text-white"
                >
                  <option value="home_top">Home Top</option>
                  <option value="marketplace_top">Marketplace Top</option>
                  <option value="profile_top">Profile Settings Top</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Banner Type *
                </label>
                <select
                  value={bannerType}
                  onChange={(e) => setBannerType(e.target.value as any)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-900 dark:text-white"
                >
                  <option value="mixed">Mixed (Bg Image & Text Overlay)</option>
                  <option value="image">Image Only (Bg Image)</option>
                  <option value="color">Solid Background Color</option>
                  <option value="gradient">Linear Gradient Colors</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Banner Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Unlock Pro Features"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Banner Subtitle
                </label>
                <input
                  type="text"
                  placeholder="e.g. Save 60% off today!"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Navigation Path / Link URL
                </label>
                <input
                  type="text"
                  placeholder="e.g. /(tabs)/marketplace"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Text Hex Color
                </label>
                <input
                  type="text"
                  placeholder="e.g. #ffffff"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {bannerType === "color" && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Background Color (Hex code)
                </label>
                <input
                  type="text"
                  placeholder="e.g. #3f030b"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-900 dark:text-white"
                />
              </div>
            )}

            {bannerType === "gradient" && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Gradient Hex Colors (Comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. #2a0207, #7e1523"
                  value={gradientColorsText}
                  onChange={(e) => setGradientColorsText(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-900 dark:text-white"
                />
              </div>
            )}

            {(bannerType === "image" || bannerType === "mixed") && (
              <ImageUploadField
                file={imageFile}
                url={imageUrl}
                onFileChange={setImageFile}
                onUrlChange={setImageUrl}
                fileLabel="Banner Image File (Local Upload)"
                urlLabel="Banner Image URL"
                urlPlaceholder="https://example.com/banner-bg.jpg"
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Display Sorting Order
                </label>
                <input
                  type="number"
                  placeholder="e.g. 0"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-3 pt-6">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-5 h-5 rounded border-slate-200 dark:border-slate-800 accent-primary"
                />
                <label htmlFor="isActive" className="text-sm font-bold text-slate-700 dark:text-slate-300 select-none">
                  Banner is active
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Schedule Start (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Schedule End (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={createMutation.isPending}
              className="btn-glass-purple w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-white font-bold shadow-md transition-all disabled:opacity-50 active:scale-[0.99] text-sm mt-2 border-none cursor-pointer"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Uploading assets...
                </>
              ) : (
                "Save Banner"
              )}
            </button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editTarget} onOpenChange={(isOpen) => !isOpen && setEditTarget(null)}>
        <DialogContent className="sm:max-w-xl rounded-3xl p-6 overflow-y-auto max-h-[85vh]">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Edit className="w-5 h-5" />
              </div>
              <DialogTitle className="text-lg font-black text-slate-900 dark:text-white">
                Edit Promo Banner
              </DialogTitle>
            </div>
          </DialogHeader>

          <form onSubmit={handleUpdate} className="space-y-4 mt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Position/Location *
                </label>
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-900 dark:text-white"
                >
                  <option value="home_top">Home Top</option>
                  <option value="marketplace_top">Marketplace Top</option>
                  <option value="profile_top">Profile Settings Top</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Banner Type *
                </label>
                <select
                  value={bannerType}
                  onChange={(e) => setBannerType(e.target.value as any)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-900 dark:text-white"
                >
                  <option value="mixed">Mixed (Bg Image & Text Overlay)</option>
                  <option value="image">Image Only (Bg Image)</option>
                  <option value="color">Solid Background Color</option>
                  <option value="gradient">Linear Gradient Colors</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Banner Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Unlock Pro Features"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Banner Subtitle
                </label>
                <input
                  type="text"
                  placeholder="e.g. Save 60% off today!"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Navigation Path / Link URL
                </label>
                <input
                  type="text"
                  placeholder="e.g. /(tabs)/marketplace"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Text Hex Color
                </label>
                <input
                  type="text"
                  placeholder="e.g. #ffffff"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {bannerType === "color" && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Background Color (Hex code)
                </label>
                <input
                  type="text"
                  placeholder="e.g. #3f030b"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-900 dark:text-white"
                />
              </div>
            )}

            {bannerType === "gradient" && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Gradient Hex Colors (Comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. #2a0207, #7e1523"
                  value={gradientColorsText}
                  onChange={(e) => setGradientColorsText(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-900 dark:text-white"
                />
              </div>
            )}

            {(bannerType === "image" || bannerType === "mixed") && (
              <ImageUploadField
                file={imageFile}
                url={imageUrl}
                onFileChange={setImageFile}
                onUrlChange={setImageUrl}
                fileLabel="Banner Image File (Local Upload)"
                urlLabel="Banner Image URL"
                urlPlaceholder="https://example.com/banner-bg.jpg"
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Display Sorting Order
                </label>
                <input
                  type="number"
                  placeholder="e.g. 0"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-3 pt-6">
                <input
                  type="checkbox"
                  id="isActiveEdit"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-5 h-5 rounded border-slate-200 dark:border-slate-800 accent-primary"
                />
                <label htmlFor="isActiveEdit" className="text-sm font-bold text-slate-700 dark:text-slate-300 select-none">
                  Banner is active
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Schedule Start (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Schedule End (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="btn-glass-purple w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-white font-bold shadow-md transition-all disabled:opacity-50 active:scale-[0.99] text-sm mt-2 border-none cursor-pointer"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving changes...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
