"use client";

import React, { useMemo, useState } from "react";
import { useAuth } from "../../layout-shell";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Send, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { ImageUploadField } from "../campaign-images/_components/ImageUploadField";

interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  role: "influencer" | "brand" | "admin";
}

export default function AdminNotificationsPage() {
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [deepLink, setDeepLink] = useState("");
  const [targetMode, setTargetMode] = useState<"all" | "users">("all");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [userSearch, setUserSearch] = useState("");

  const resetForm = () => {
    setTitle("");
    setBody("");
    setImageUrl("");
    setImageFile(null);
    setDeepLink("");
    setTargetMode("all");
    setSelectedUserIds([]);
    setUserSearch("");
  };

  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api("/media/upload", { method: "POST", body: formData });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !(json as any).success) {
        throw new Error((json as any).error || "Failed to upload image");
      }
      return (json as any).data.url as string;
    },
    onSuccess: (url) => setImageUrl(url),
    onError: (err: any) => {
      toast.error(err.message || "Failed to upload image");
      setImageFile(null);
    },
  });

  const { data: users = [], isLoading: usersLoading } = useQuery<AdminUser[]>({
    queryKey: ["adminUsersForNotifications"],
    queryFn: async () => {
      const res = await api("/admin/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      const json = await res.json();
      return json.success ? json.data : [];
    },
    enabled: user.role === "admin" && targetMode === "users",
  });

  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) => u.name?.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  }, [users, userSearch]);

  const toggleUser = (id: string) => {
    setSelectedUserIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const sendMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        title: title.trim(),
        body: body.trim(),
        imageUrl: imageUrl.trim() || undefined,
        deepLink: deepLink.trim() || undefined,
        target:
          targetMode === "all"
            ? { mode: "all" as const }
            : { mode: "users" as const, userIds: selectedUserIds },
      };
      const res = await api("/admin/notifications/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !(json as any).success) {
        throw new Error((json as any).error || "Failed to send notification");
      }
      return json as any;
    },
    onSuccess: () => {
      toast.success(
        targetMode === "all"
          ? "Broadcast queued for all users"
          : `Notification queued for ${selectedUserIds.length} user${selectedUserIds.length === 1 ? "" : "s"}`
      );
      resetForm();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to send notification");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      toast.error("Title and body are required");
      return;
    }
    if (targetMode === "users" && selectedUserIds.length === 0) {
      toast.error("Select at least one user to notify");
      return;
    }
    sendMutation.mutate();
  };

  if (user.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-slate-500">Admin access required.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <div>
        <h1 className="text-sm font-medium text-primary">Send Push Notification</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Broadcast an announcement, offer, or update to influencers and brands.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>Message</CardTitle>
            <CardDescription>This is what recipients will see on their device.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="notif-title">Title</Label>
              <Input
                id="notif-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. New Year Offer! 🎉"
                maxLength={80}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notif-body">Body</Label>
              <Textarea
                id="notif-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write the notification message..."
                maxLength={200}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Image (optional)</Label>
              <ImageUploadField
                file={imageFile}
                url={imageUrl}
                onFileChange={(file) => {
                  setImageFile(file);
                  if (file) uploadImageMutation.mutate(file);
                }}
                onUrlChange={setImageUrl}
                fileLabel="Upload Image"
                urlLabel="Or paste an Image URL"
              />
              {uploadImageMutation.isPending && (
                <p className="text-xs text-slate-500">Uploading image...</p>
              )}
              {imageUrl && !uploadImageMutation.isPending && (
                <img src={imageUrl} alt="Notification preview" className="mt-2 h-24 rounded-lg border border-slate-200 dark:border-slate-800/60 object-cover" />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notif-link">Deep link (optional)</Label>
              <Input
                id="notif-link"
                value={deepLink}
                onChange={(e) => setDeepLink(e.target.value)}
                placeholder="/collab/abc123"
              />
            </div>

            <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800/60">
              <Label>Send to</Label>
              <RadioGroup
                value={targetMode}
                onValueChange={(val) => setTargetMode(val as "all" | "users")}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3"
              >
                <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-800/60 cursor-pointer hover:border-primary/50 transition-colors">
                  <RadioGroupItem value="all" />
                  <span className="text-sm font-medium">All users</span>
                </label>
                <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-800/60 cursor-pointer hover:border-primary/50 transition-colors">
                  <RadioGroupItem value="users" />
                  <span className="text-sm font-medium">Specific users</span>
                </label>
              </RadioGroup>

              {targetMode === "users" && (
                <div className="mt-3 space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      placeholder="Search by name or email..."
                      className="pl-9"
                    />
                  </div>

                  <div className="border border-slate-200 dark:border-slate-800/60 rounded-xl max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-900">
                    {usersLoading ? (
                      <div className="p-4 space-y-2">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    ) : filteredUsers.length === 0 ? (
                      <div className="p-6 text-center text-sm text-slate-500">No users found.</div>
                    ) : (
                      filteredUsers.map((u) => (
                        <label
                          key={u.id}
                          className="flex items-center gap-3 p-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                        >
                          <Checkbox
                            checked={selectedUserIds.includes(u.id)}
                            onCheckedChange={() => toggleUser(u.id)}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                              {u.name || "Unnamed"}
                            </p>
                            <p className="text-xs text-slate-500 truncate">{u.email}</p>
                          </div>
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full border bg-primary/5 text-primary border-primary/10 shrink-0">
                            {u.role}
                          </span>
                        </label>
                      ))
                    )}
                  </div>

                  <p className="text-xs text-slate-500">{selectedUserIds.length} selected</p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="justify-end">
            <Button type="submit" disabled={sendMutation.isPending || uploadImageMutation.isPending} className="gap-2">
              <Send size={16} />
              {sendMutation.isPending ? "Sending..." : "Send Notification"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
