"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../layout-shell";
import { InfluencerAccountCard } from "./_components/InfluencerAccountCard";
import { BrandAccountCard } from "./_components/BrandAccountCard";
import { EditAccountModal } from "./_components/EditAccountModal";
import { api } from "@/lib/api-client";

export default function AdminProfilesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"influencer" | "brand">("influencer");
  const [filterStatus, setFilterStatus] = useState<"pending" | "verified" | "rejected">("pending");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [selectedAccountType, setSelectedAccountType] = useState<"influencer" | "brand" | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const { data, isLoading: loading } = useQuery({
    queryKey: ["admin-profiles", filterStatus],
    queryFn: async () => {
      const res = await api(`/admin/pending-profiles?status=${filterStatus}`);
      const json = await res.json() as any;
      if (!json.success) throw new Error(json.error || "Failed to load");
      return json.data;
    },
    enabled: user?.role === "admin",
  });

  const verifyMutation = useMutation({
    mutationFn: async ({ accountId, accountType, action, note }: { accountId: string, accountType: "influencer" | "brand", action: "approve" | "reject", note?: string }) => {
      const res = await api("/api/admin/verify-profile", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId, accountType, action, note }),
      });
      const json = await res.json() as any;
      if (!json.success) throw new Error(json.error || "Failed to verify profile");
      return { action };
    },
    onSuccess: (resData) => {
      showToast(`Profile ${resData.action === "approve" ? "approved ✓" : "rejected ✗"} successfully`);
      queryClient.invalidateQueries({ queryKey: ["admin-profiles"] });
    },
    onError: (err: any) => {
      showToast(err?.message || "Network error", "error");
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (payload: { accountId: string, accountType: "influencer" | "brand", updates: any }) => {
      const res = await api("/api/admin/update-profile", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json() as any;
      if (!json.success) throw new Error(json.error || "Failed to update profile");
      return json.data;
    },
    onSuccess: () => {
      showToast("Profile updated successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["admin-profiles"] });
    },
    onError: (err: any) => {
      showToast(err?.message || "Network error", "error");
    },
  });

  const handleVerify = (accountId: string, accountType: "influencer" | "brand", action: "approve" | "reject", note?: string) => {
    verifyMutation.mutate({ accountId, accountType, action, note });
  };

  const handleEdit = (account: any, type: "influencer" | "brand") => {
    setSelectedAccount(account);
    setSelectedAccountType(type);
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async (updates: any) => {
    if (!selectedAccount || !selectedAccountType) return;
    await updateProfileMutation.mutateAsync({
      accountId: selectedAccount.id,
      accountType: selectedAccountType,
      updates
    });
  };

  if (user?.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-primary/40">Admin access required.</p>
      </div>
    );
  }

  const influencerList = data?.influencerAccounts || [];
  const brandList = data?.brandAccounts || [];

  const tabs = [
    { id: "influencer" as const, label: `Influencer Accounts`, count: influencerList.length },
    { id: "brand" as const, label: `Brand Accounts`, count: brandList.length },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl text-sm font-bold shadow-2xl border transition-all ${toast.type === "success" ? "bg-primary text-primary-foreground border-primary" : "bg-destructive text-destructive-foreground border-destructive"}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">Profile Verification Queue</h1>
        <p className="text-primary/60 text-sm mt-1">Review and verify submitted influencer & brand sub-accounts</p>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 p-1 bg-primary/5 border border-primary/10 rounded-2xl w-fit">
        {(["pending", "verified", "rejected"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${filterStatus === s ? "bg-primary text-primary-foreground shadow" : "text-primary/50 hover:text-primary"}`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Summary counts */}
      {data?.counts && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total", val: data.counts.total, color: "text-foreground" },
            { label: "Influencer Accts", val: data.counts.influencer, color: "text-primary" },
            { label: "Brand Accts", val: data.counts.brand, color: "text-primary/80" },
          ].map((m) => (
            <div key={m.label} className="bg-primary/5 border border-primary/10 rounded-2xl p-4 text-center">
              <p className="text-[10px] uppercase font-bold text-primary/60 tracking-wider">{m.label}</p>
              <p className={`text-2xl font-black mt-1 ${m.color}`}>{m.val}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-primary/5 border border-primary/10 rounded-2xl p-1.5">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${activeTab === t.id ? "bg-primary text-primary-foreground shadow" : "text-primary/50 hover:text-primary"}`}
          >
            {t.label}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${activeTab === t.id ? "bg-primary-foreground/20 text-primary-foreground" : "bg-primary/10 text-primary/50"}`}>{t.count}</span>
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : (
        <div className="space-y-4">
          {activeTab === "influencer" ? (
            influencerList.length === 0 ? (
              <div className="text-center py-16 text-primary/40 border border-dashed border-primary/20 rounded-2xl">
                No {filterStatus} influencer accounts found.
              </div>
            ) : (
              influencerList.map((acc: any) => (
                <InfluencerAccountCard key={acc.id} account={acc} onVerify={handleVerify} onEdit={handleEdit} />
              ))
            )
          ) : (
            brandList.length === 0 ? (
              <div className="text-center py-16 text-primary/40 border border-dashed border-primary/20 rounded-2xl">
                No {filterStatus} brand accounts found.
              </div>
            ) : (
              brandList.map((acc: any) => (
                <BrandAccountCard key={acc.id} account={acc} onVerify={handleVerify} onEdit={handleEdit} />
              ))
            )
          )}
        </div>
      )}

      {/* Edit Modal */}
      <EditAccountModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        account={selectedAccount}
        accountType={selectedAccountType}
        onSave={handleSaveProfile}
      />
    </div>
  );
}
