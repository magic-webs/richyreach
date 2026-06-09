"use client";

import React from "react";
import { Image as ImageIcon } from "lucide-react";

interface ImageUploadFieldProps {
  /** The currently selected file (if any) */
  file: File | null;
  /** The current URL value */
  url: string;
  onFileChange: (file: File | null) => void;
  onUrlChange: (url: string) => void;
  /** Accent colour class applied to the dashed border on hover, e.g. "hover:border-primary/50" */
  accentBorderHover?: string;
  /** Focus ring colour for the URL input, e.g. "focus:ring-primary/20 focus:border-primary" */
  accentFocus?: string;
  fileLabel?: string;
  urlLabel?: string;
  urlPlaceholder?: string;
}

/**
 * Reusable image picker that offers a dashed-border file upload zone
 * AND a direct-URL fallback input side by side.
 */
export function ImageUploadField({
  file,
  url,
  onFileChange,
  onUrlChange,
  accentBorderHover = "hover:border-primary/50 dark:hover:border-primary/50",
  accentFocus = "focus:ring-primary/20 focus:border-primary",
  fileLabel = "Upload Local File",
  urlLabel = "Direct Image URL",
  urlPlaceholder = "https://example.com/image.jpg",
}: ImageUploadFieldProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* File picker */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
          {fileLabel}
        </label>
        <div
          className={`relative flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 ${accentBorderHover} rounded-xl p-4 transition-colors bg-slate-50 dark:bg-slate-950/20`}
        >
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const picked = e.target.files?.[0] ?? null;
              onFileChange(picked);
              if (picked) onUrlChange(""); // clear URL if file chosen
            }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="text-center space-y-1.5 pointer-events-none">
            <ImageIcon className="w-6 h-6 mx-auto text-slate-400" />
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
              {file ? file.name : "Select Image File"}
            </p>
            <p className="text-[10px] text-slate-400">PNG, JPG up to 5 MB</p>
          </div>
        </div>
      </div>

      {/* URL fallback */}
      <div className="flex flex-col justify-center">
        <div className="text-center text-xs font-bold text-slate-450 dark:text-slate-500 py-1">
          — OR —
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            {urlLabel}
          </label>
          <input
            type="url"
            placeholder={urlPlaceholder}
            value={url}
            onChange={(e) => {
              onUrlChange(e.target.value);
              if (e.target.value) onFileChange(null); // clear file if URL typed
            }}
            className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl text-sm focus:outline-none focus:ring-2 ${accentFocus} transition-all text-slate-900 dark:text-white`}
          />
        </div>
      </div>
    </div>
  );
}
