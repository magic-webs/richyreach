"use client";

import React, { useState } from "react";
import { useAuth } from "../../layout-shell";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Plus, Trash2, Edit, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GlassPurpleButton } from "@/components/ui/glass-purple-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
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

        <GlassPurpleButton
          onClick={() => {
            resetForm();
            setIsAddOpen(true);
          }}
          className="px-6 py-2.5 rounded-2xl"
        >
          <Plus className="w-4 h-4" />
          Add Banner
        </GlassPurpleButton>
      </div>

      {/* ── Search Bar ── */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search position, title, subtitle..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-10 w-full"
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
              <Card
                key={banner.id}
                className="overflow-hidden flex flex-col h-full justify-between border-muted/65 shadow-xs"
              >
                {/* Visual Preview */}
                <div style={previewStyle} className="h-32 p-4 flex flex-col justify-end relative rounded-t-xl overflow-hidden">
                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-black/40 text-white rounded-md backdrop-blur-sm">
                      {banner.position}
                    </span>
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${banner.isActive ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30" : "bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30"}`}>
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

                <CardContent className="pt-4 pb-0 flex flex-col gap-1.5 text-xs text-muted-foreground">
                  <div className="flex justify-between items-center">
                    <span>Target Link:</span>
                    <span className="font-semibold text-foreground truncate max-w-[160px]" title={banner.link || "none"}>
                      {banner.link || "none"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Display Order:</span>
                    <span className="font-semibold text-foreground">{banner.displayOrder}</span>
                  </div>
                </CardContent>

                <CardFooter className="flex items-center justify-end gap-2 pt-4 border-t border-muted/30 bg-muted/20">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => loadEditTarget(banner)}
                    title="Edit Banner"
                    className="cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(banner.id)}
                    title="Delete Banner"
                    className="cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    Delete
                  </Button>
                </CardFooter>
              </Card>
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
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Position/Location *
                </Label>
                <Select
                  value={position}
                  onValueChange={(val) => val && setPosition(val)}
                >
                  <SelectTrigger className="w-full h-8 text-sm">
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="home_top">Home Top</SelectItem>
                    <SelectItem value="marketplace_top">Marketplace Top</SelectItem>
                    <SelectItem value="profile_top">Profile Settings Top</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Banner Type *
                </Label>
                <Select
                  value={bannerType}
                  onValueChange={(val) => setBannerType(val as any)}
                >
                  <SelectTrigger className="w-full h-8 text-sm">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mixed">Mixed (Bg Image & Text Overlay)</SelectItem>
                    <SelectItem value="image">Image Only (Bg Image)</SelectItem>
                    <SelectItem value="color">Solid Background Color</SelectItem>
                    <SelectItem value="gradient">Linear Gradient Colors</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="create-title" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Banner Title
                </Label>
                <Input
                  id="create-title"
                  type="text"
                  placeholder="e.g. Unlock Pro Features"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="create-subtitle" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Banner Subtitle
                </Label>
                <Input
                  id="create-subtitle"
                  type="text"
                  placeholder="e.g. Save 60% off today!"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="create-link" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Navigation Path / Link URL
                </Label>
                <Input
                  id="create-link"
                  type="text"
                  placeholder="e.g. /(tabs)/marketplace"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="create-textColor" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Text Hex Color
                </Label>
                <Input
                  id="create-textColor"
                  type="text"
                  placeholder="e.g. #ffffff"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                />
              </div>
            </div>

            {bannerType === "color" && (
              <div className="space-y-1.5">
                <Label htmlFor="create-bgColor" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Background Color (Hex code)
                </Label>
                <Input
                  id="create-bgColor"
                  type="text"
                  placeholder="e.g. #3f030b"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                />
              </div>
            )}

            {bannerType === "gradient" && (
              <div className="space-y-1.5">
                <Label htmlFor="create-gradientColorsText" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Gradient Hex Colors (Comma separated)
                </Label>
                <Input
                  id="create-gradientColorsText"
                  type="text"
                  placeholder="e.g. #2a0207, #7e1523"
                  value={gradientColorsText}
                  onChange={(e) => setGradientColorsText(e.target.value)}
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
              <div className="space-y-1.5">
                <Label htmlFor="create-displayOrder" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Display Sorting Order
                </Label>
                <Input
                  id="create-displayOrder"
                  type="number"
                  placeholder="e.g. 0"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
                />
              </div>

              <div className="flex items-center gap-3 pt-5">
                <Switch
                  id="create-isActive"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
                <Label htmlFor="create-isActive" className="text-sm font-bold text-slate-700 dark:text-slate-350 select-none cursor-pointer">
                  Banner is active
                </Label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="create-startDate" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Schedule Start (Optional)
                </Label>
                <Input
                  id="create-startDate"
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="create-endDate" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Schedule End (Optional)
                </Label>
                <Input
                  id="create-endDate"
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full flex items-center justify-center gap-2 py-3 h-10 text-white font-bold cursor-pointer transition-all mt-2"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Uploading assets...
                </>
              ) : (
                "Save Banner"
              )}
            </Button>
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
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Position/Location *
                </Label>
                <Select
                  value={position}
                  onValueChange={(val) => val && setPosition(val)}
                >
                  <SelectTrigger className="w-full h-8 text-sm">
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="home_top">Home Top</SelectItem>
                    <SelectItem value="marketplace_top">Marketplace Top</SelectItem>
                    <SelectItem value="profile_top">Profile Settings Top</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Banner Type *
                </Label>
                <Select
                  value={bannerType}
                  onValueChange={(val) => setBannerType(val as any)}
                >
                  <SelectTrigger className="w-full h-8 text-sm">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mixed">Mixed (Bg Image & Text Overlay)</SelectItem>
                    <SelectItem value="image">Image Only (Bg Image)</SelectItem>
                    <SelectItem value="color">Solid Background Color</SelectItem>
                    <SelectItem value="gradient">Linear Gradient Colors</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit-title" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Banner Title
                </Label>
                <Input
                  id="edit-title"
                  type="text"
                  placeholder="e.g. Unlock Pro Features"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-subtitle" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Banner Subtitle
                </Label>
                <Input
                  id="edit-subtitle"
                  type="text"
                  placeholder="e.g. Save 60% off today!"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit-link" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Navigation Path / Link URL
                </Label>
                <Input
                  id="edit-link"
                  type="text"
                  placeholder="e.g. /(tabs)/marketplace"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-textColor" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Text Hex Color
                </Label>
                <Input
                  id="edit-textColor"
                  type="text"
                  placeholder="e.g. #ffffff"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                />
              </div>
            </div>

            {bannerType === "color" && (
              <div className="space-y-1.5">
                <Label htmlFor="edit-bgColor" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Background Color (Hex code)
                </Label>
                <Input
                  id="edit-bgColor"
                  type="text"
                  placeholder="e.g. #3f030b"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                />
              </div>
            )}

            {bannerType === "gradient" && (
              <div className="space-y-1.5">
                <Label htmlFor="edit-gradientColorsText" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Gradient Hex Colors (Comma separated)
                </Label>
                <Input
                  id="edit-gradientColorsText"
                  type="text"
                  placeholder="e.g. #2a0207, #7e1523"
                  value={gradientColorsText}
                  onChange={(e) => setGradientColorsText(e.target.value)}
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
              <div className="space-y-1.5">
                <Label htmlFor="edit-displayOrder" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Display Sorting Order
                </Label>
                <Input
                  id="edit-displayOrder"
                  type="number"
                  placeholder="e.g. 0"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
                />
              </div>

              <div className="flex items-center gap-3 pt-5">
                <Switch
                  id="edit-isActive"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
                <Label htmlFor="edit-isActive" className="text-sm font-bold text-slate-700 dark:text-slate-350 select-none cursor-pointer">
                  Banner is active
                </Label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit-startDate" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Schedule Start (Optional)
                </Label>
                <Input
                  id="edit-startDate"
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-endDate" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Schedule End (Optional)
                </Label>
                <Input
                  id="edit-endDate"
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={updateMutation.isPending}
              className="w-full flex items-center justify-center gap-2 py-3 h-10 text-white font-bold cursor-pointer transition-all mt-2"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving changes...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
