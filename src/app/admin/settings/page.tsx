"use client";

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, ShieldCheck, Swords, Megaphone, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

interface PlatformSettings {
  allowUnverifiedCampaignApply: boolean;
  allowUnverifiedArenaJoin: boolean;
  updatedBy: string | null;
  updatedAt: string | null;
}

type SettingKey = keyof Pick<
  PlatformSettings,
  "allowUnverifiedCampaignApply" | "allowUnverifiedArenaJoin"
>;

const TOGGLES: {
  key: SettingKey;
  label: string;
  description: string;
  icon: React.ElementType;
}[] = [
  {
    key: "allowUnverifiedCampaignApply",
    label: "Allow campaign applications without verification",
    description:
      "Creators can apply to campaigns even if their profile is not verified. Turn this off once Instagram connection is available to everyone.",
    icon: Megaphone,
  },
  {
    key: "allowUnverifiedArenaJoin",
    label: "Allow arena joins without verification",
    description:
      "Creators can join Arena contests without a verified profile. Google Review arenas never required verification and are unaffected.",
    icon: Swords,
  },
];

export default function AdminSettingsPage() {
  const queryClient = useQueryClient();
  // Tracks which row is saving, so only that switch shows a spinner.
  const [pendingKey, setPendingKey] = React.useState<SettingKey | null>(null);

  const { data: settings, isLoading, isError } = useQuery<PlatformSettings>({
    queryKey: ["admin", "settings"],
    queryFn: async () => {
      const res = await api("/admin/settings");
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Failed to load settings");
      return json.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (patch: Partial<Record<SettingKey, boolean>>) => {
      const res = await api("/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Failed to update settings");
      return json.data as PlatformSettings;
    },
    onSuccess: (data, patch) => {
      queryClient.setQueryData(["admin", "settings"], data);
      const [key] = Object.keys(patch) as SettingKey[];
      const label = TOGGLES.find((t) => t.key === key)?.label ?? "Setting";
      toast.success(`${label} ${patch[key] ? "enabled" : "disabled"}`);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update settings");
      // Revert the optimistic switch position.
      queryClient.invalidateQueries({ queryKey: ["admin", "settings"] });
    },
    onSettled: () => setPendingKey(null),
  });

  const handleToggle = (key: SettingKey, value: boolean) => {
    setPendingKey(key);
    updateMutation.mutate({ [key]: value });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10 px-4 md:px-0">
      {/* ── Header ── */}
      <div>
        <h1 className="text-sm font-medium text-primary">Admin Section</h1>
        <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mt-1">
          Platform Settings
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Control what creators can do while Instagram connection is limited by Meta app review.
        </p>
      </div>

      {/* ── Access control ── */}
      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            Creator Access Control
          </CardTitle>
          <CardDescription>
            Verification requires a connected Instagram Business/Creator account. Until the Meta app
            is approved for public use, these toggles let unverified creators apply to campaigns and
            join arenas. Both the app and the API respect them.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {isLoading ? (
            <>
              <Skeleton className="h-20 w-full rounded-2xl" />
              <Skeleton className="h-20 w-full rounded-2xl" />
            </>
          ) : isError ? (
            <div className="flex items-center gap-2 rounded-2xl bg-destructive/10 p-4 text-sm text-destructive">
              <AlertCircle className="w-4 h-4 shrink-0" />
              Could not load settings. Refresh the page to try again.
            </div>
          ) : (
            TOGGLES.map(({ key, label, description, icon: Icon }) => (
              <div
                key={key}
                className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-xl bg-primary/10 p-2">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <Label htmlFor={key} className="text-sm font-semibold text-foreground">
                      {label}
                    </Label>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
                      {description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 pt-1">
                  {pendingKey === key && (
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  )}
                  <Switch
                    id={key}
                    checked={settings?.[key] ?? false}
                    disabled={updateMutation.isPending}
                    onCheckedChange={(checked: boolean) => handleToggle(key, checked)}
                  />
                </div>
              </div>
            ))
          )}

          {settings?.updatedAt && (
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Last changed {new Date(settings.updatedAt).toLocaleString()}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
