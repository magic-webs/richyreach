"use client";

import React, { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, Loader2, Check, X } from "lucide-react";
import { api } from "@/lib/api-client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUploadField } from "../../campaign-images/_components/ImageUploadField";
import type { ArenaImage } from "./types";

interface EditImageDialogProps {
  image: ArenaImage | null;
  onClose: () => void;
  existingCategories: string[];
}

export function EditImageDialog({ image, existingCategories, onClose }: EditImageDialogProps) {
  const queryClient = useQueryClient();

  const [editCategory, setEditCategory] = useState("");
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImageUrl, setEditImageUrl] = useState("");

  useEffect(() => {
    if (image) {
      setEditCategory(image.category);
      setIsCustomCategory(!existingCategories.includes(image.category));
      setEditImageFile(null);
      setEditImageUrl("");
    }
  }, [image, existingCategories]);

  const editMutation = useMutation({
    mutationFn: async ({
      id,
      formData,
    }: {
      id: string;
      formData: FormData;
    }) => {
      const res = await api(`/admin/arena-images/${id}`, {
        method: "PUT",
        body: formData,
      });
      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({}));
        throw new Error((errorJson as any).error || "Failed to update image");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Arena template updated successfully");
      queryClient.invalidateQueries({ queryKey: ["arenaImages"] });
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update template");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) return;

    const noChange =
      editCategory.trim() === image.category &&
      !editImageFile &&
      !editImageUrl.trim();

    if (noChange) {
      toast.error("No changes detected. Please modify at least one field.");
      return;
    }

    const formData = new FormData();
    if (editCategory.trim() && editCategory.trim() !== image.category) {
      formData.append("category", editCategory.trim());
    }
    if (editImageFile) formData.append("image", editImageFile);
    if (editImageUrl.trim()) formData.append("imageUrl", editImageUrl.trim());

    editMutation.mutate({ id: image.id, formData });
  };

  return (
    <Dialog
      open={!!image}
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
              Edit Arena Banner Image
            </DialogTitle>
          </div>
        </DialogHeader>

        {image && (
          <>
            {/* Current image preview */}
            <div className="mt-2 rounded-2xl overflow-hidden aspect-video bg-slate-100 dark:bg-slate-950 relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.imageUrl}
                alt={image.category}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/60 text-white backdrop-blur-md">
                Current Image
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              {/* Category */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Category
                </label>
                {!isCustomCategory && existingCategories.length > 0 ? (
                  <Select
                    value={editCategory !== "" && existingCategories.includes(editCategory) ? editCategory : ""}
                    onValueChange={(val) => {
                      if (!val) {
                        return;
                      }
                      if (val === "__custom__") {
                        setIsCustomCategory(true);
                        setEditCategory("");
                      } else {
                        setEditCategory(val);
                      }
                    }}
                  >
                    <SelectTrigger className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl text-sm focus-visible:ring-blue-500/20 focus-visible:border-blue-500 transition-all text-slate-900 dark:text-white h-auto min-h-[44px]">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {existingCategories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                      <SelectItem value="__custom__" className="font-bold text-blue-500 focus:text-blue-500">
                        + Add New Category
                      </SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      placeholder="e.g. Beauty, Technology, Fashion"
                      className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 dark:text-white"
                      required
                    />
                    {existingCategories.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomCategory(false);
                          setEditCategory("");
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

              {/* Image replacement */}
              <ImageUploadField
                file={editImageFile}
                url={editImageUrl}
                onFileChange={setEditImageFile}
                onUrlChange={setEditImageUrl}
                accentBorderHover="hover:border-blue-500/50"
                accentFocus="focus:ring-blue-500/20 focus:border-blue-500"
                fileLabel="Replace with File"
                urlLabel="New Image URL"
                urlPlaceholder="https://example.com/new-banner.jpg"
              />

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
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
                      <Loader2 className="w-4 h-4 animate-spin" /> Saving…
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
