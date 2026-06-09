"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Loader2, Sparkles, X } from "lucide-react";
import { api } from "@/lib/api-client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUploadField } from "./ImageUploadField";

export function AddImageDialog({ existingCategories }: { existingCategories: string[] }) {
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [categoryInput, setCategoryInput] = useState("");
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");

  const resetForm = () => {
    setCategoryInput("");
    setIsCustomCategory(false);
    setImageFile(null);
    setImageUrl("");
  };

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await api(`/admin/campaign-images`, {
        method: "POST",
        body: formData,
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
      resetForm();
      setOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.message || "Something went wrong during upload");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryInput.trim()) {
      toast.error("Please enter a category");
      return;
    }
    if (!imageFile && !imageUrl.trim()) {
      toast.error("Please upload an image file or provide an image URL");
      return;
    }
    const formData = new FormData();
    formData.append("category", categoryInput.trim());
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
        Add Template
      </DialogTrigger>

      <DialogContent className="sm:max-w-xl rounded-3xl p-6">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Sparkles className="w-5 h-5" />
            </div>
            <DialogTitle className="text-lg font-black text-slate-900 dark:text-white">
              Upload New Template Image
            </DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Category */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Category
            </label>
            {!isCustomCategory && existingCategories.length > 0 ? (
              <Select
                value={categoryInput !== "" && existingCategories.includes(categoryInput) ? categoryInput : ""}
                onValueChange={(val) => {
                  if (!val) {
                    return;
                  }
                  if (val === "__custom__") {
                    setIsCustomCategory(true);
                    setCategoryInput("");
                  } else {
                    setCategoryInput(val);
                  }
                }}
              >
                <SelectTrigger className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl text-sm focus-visible:ring-primary/20 focus-visible:border-primary transition-all text-slate-900 dark:text-white h-auto min-h-[44px]">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {existingCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                  <SelectItem value="__custom__" className="font-bold text-primary focus:text-primary">
                    + Add New Category
                  </SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="e.g. Beauty, Technology, Fashion"
                  value={categoryInput}
                  onChange={(e) => setCategoryInput(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 dark:text-white"
                  required
                />
                {existingCategories.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomCategory(false);
                      setCategoryInput("");
                    }}
                    className="p-2.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-900 rounded-xl transition-colors shrink-0 border border-slate-200 dark:border-slate-800"
                    title="Back to predefined categories"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Image picker */}
          <ImageUploadField
            file={imageFile}
            url={imageUrl}
            onFileChange={setImageFile}
            onUrlChange={setImageUrl}
            fileLabel="Upload Local File"
            urlLabel="Direct Image URL"
            urlPlaceholder="https://example.com/banner.jpg"
          />

          {/* Submit */}
          <button
            type="submit"
            disabled={uploadMutation.isPending}
            className="btn-glass-purple w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-white font-bold shadow-md transition-all disabled:opacity-50 active:scale-[0.99] text-sm mt-2 border-none cursor-pointer"
          >
            {uploadMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Uploading to
                Cloudinary…
              </>
            ) : (
              "Save Template Image"
            )}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
