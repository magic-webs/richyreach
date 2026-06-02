"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../../../layout-shell";
import { useParams, useRouter } from "next/navigation";

export default function EditProfilePage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const type = params.type as "influencer" | "brand";
  const id = params.id as string;

  const [formData, setFormData] = useState<any>({});
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const { data: account, isLoading } = useQuery({
    queryKey: ["admin-profile", type, id],
    queryFn: async () => {
      const res = await fetch(`/api/admin/profile/${type}/${id}`, { credentials: "include" });
      const json = await res.json() as any;
      if (!json.success) throw new Error(json.error || "Failed to load");
      return json.data;
    },
    enabled: user?.role === "admin" && !!type && !!id,
  });

  useEffect(() => {
    if (account) setFormData(account);
  }, [account]);

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: any) => {
      const payload = { accountId: id, accountType: type, updates };
      const res = await fetch("/api/admin/update-profile", {
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
      queryClient.invalidateQueries({ queryKey: ["admin-profile", type, id] });
      queryClient.invalidateQueries({ queryKey: ["admin-profiles"] });
    },
    onError: (err: any) => {
      showToast(err?.message || "Network error", "error");
    },
  });

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    const updates = { ...formData };
    delete updates.id;
    delete updates.userId;
    delete updates.ownerName;
    delete updates.ownerEmail;
    delete updates.services;
    delete updates.createdAt;
    delete updates.updatedAt;
    delete updates.verifiedAt;
    delete updates.verifiedBy;

    await updateProfileMutation.mutateAsync(updates);
  };

  if (user?.role !== "admin") return <div className="p-10 text-center">Admin access required.</div>;
  if (isLoading) return <div className="p-10 text-center">Loading...</div>;
  if (!account) return <div className="p-10 text-center">Account not found.</div>;

  const inputClass = "w-full px-4 py-2.5 text-sm bg-background border border-primary/20 rounded-xl text-foreground placeholder-primary/40 outline-none focus:border-primary/50 transition-colors";
  const labelClass = "text-xs font-bold text-primary/70 mb-1.5 block uppercase tracking-wider";

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl text-sm font-bold shadow-2xl border transition-all ${toast.type === "success" ? "bg-primary text-primary-foreground border-primary" : "bg-destructive text-destructive-foreground border-destructive"}`}>
          {toast.msg}
        </div>
      )}

      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 text-primary/60 hover:text-primary hover:bg-primary/5 rounded-xl transition-colors cursor-pointer">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Edit {type === "influencer" ? "Influencer" : "Brand"} Profile</h1>
          <p className="text-primary/60 text-sm mt-0.5">Owner: {account.ownerName} ({account.ownerEmail})</p>
        </div>
      </div>

      <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 md:p-8 space-y-6">
        {type === "influencer" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Instagram Handle</label>
              <input type="text" value={formData.instagramHandle || ""} onChange={(e) => handleChange("instagramHandle", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Niche</label>
              <input type="text" value={formData.niche || ""} onChange={(e) => handleChange("niche", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Followers</label>
              <input type="number" value={formData.followers || 0} onChange={(e) => handleChange("followers", parseInt(e.target.value) || 0)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Engagement Rate (%)</label>
              <input type="number" step="0.1" value={formData.engagementRate || 0} onChange={(e) => handleChange("engagementRate", parseFloat(e.target.value) || 0)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Avg Views</label>
              <input type="number" value={formData.avgViews || 0} onChange={(e) => handleChange("avgViews", parseInt(e.target.value) || 0)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Level</label>
              <select value={formData.level || "nano"} onChange={(e) => handleChange("level", e.target.value)} className={inputClass}>
                <option value="nano">Nano</option>
                <option value="micro">Micro</option>
                <option value="mid">Mid</option>
                <option value="macro">Macro</option>
                <option value="mega">Mega</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Country</label>
              <input type="text" value={formData.country || ""} onChange={(e) => handleChange("country", e.target.value)} className={inputClass} />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Bio</label>
              <textarea rows={4} value={formData.bio || ""} onChange={(e) => handleChange("bio", e.target.value)} className={inputClass}></textarea>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Company Name</label>
              <input type="text" value={formData.companyName || ""} onChange={(e) => handleChange("companyName", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Category</label>
              <input type="text" value={formData.category || ""} onChange={(e) => handleChange("category", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Website</label>
              <input type="text" value={formData.website || ""} onChange={(e) => handleChange("website", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Instagram Page</label>
              <input type="text" value={formData.instagramPage || ""} onChange={(e) => handleChange("instagramPage", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Brand Size</label>
              <select value={formData.brandSize || "smb"} onChange={(e) => handleChange("brandSize", e.target.value)} className={inputClass}>
                <option value="startup">Startup</option>
                <option value="smb">SMB</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Budget Range</label>
              <select value={formData.budgetRange || "mid"} onChange={(e) => handleChange("budgetRange", e.target.value)} className={inputClass}>
                <option value="low">Low</option>
                <option value="mid">Mid</option>
                <option value="high">High</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Description</label>
              <textarea rows={4} value={formData.description || ""} onChange={(e) => handleChange("description", e.target.value)} className={inputClass}></textarea>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-6 border-t border-primary/10">
          <button
            onClick={() => router.back()}
            className="px-6 py-2.5 text-sm font-bold text-primary/70 hover:text-primary transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={updateProfileMutation.isPending}
            className="px-8 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold transition-colors cursor-pointer disabled:opacity-50"
          >
            {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
