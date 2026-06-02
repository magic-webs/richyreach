import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function EditAccountModal({ 
  open, 
  onOpenChange, 
  account, 
  accountType, 
  onSave 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
  account: any; 
  accountType: "influencer" | "brand" | null; 
  onSave: (updates: any) => Promise<void>; 
}) {
  const [formData, setFormData] = useState<any>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (account) {
      setFormData(account);
    }
  }, [account]);

  if (!account || !accountType) return null;

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = { ...formData };
      delete updates.id;
      delete updates.userId;
      delete updates.ownerName;
      delete updates.ownerEmail;
      delete updates.services;
      delete updates.createdAt;
      delete updates.updatedAt;
      
      await onSave(updates);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full px-3 py-2 text-sm bg-background border border-primary/20 rounded-xl text-foreground placeholder-primary/40 outline-none focus:border-primary/50";
  const labelClass = "text-xs font-bold text-primary/70 mb-1 block uppercase tracking-wider";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit {accountType === "influencer" ? "Influencer" : "Brand"} Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {accountType === "influencer" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <input type="number" value={formData.followers || 0} onChange={(e) => handleChange("followers", parseInt(e.target.value))} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Engagement Rate (%)</label>
                <input type="number" step="0.1" value={formData.engagementRate || 0} onChange={(e) => handleChange("engagementRate", parseFloat(e.target.value))} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Avg Views</label>
                <input type="number" value={formData.avgViews || 0} onChange={(e) => handleChange("avgViews", parseInt(e.target.value))} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Level</label>
                <Select value={formData.level || "nano"} onValueChange={(val) => handleChange("level", val)}>
                  <SelectTrigger className={inputClass}>
                    <SelectValue placeholder="Select Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nano">Nano</SelectItem>
                    <SelectItem value="micro">Micro</SelectItem>
                    <SelectItem value="mid">Mid</SelectItem>
                    <SelectItem value="macro">Macro</SelectItem>
                    <SelectItem value="mega">Mega</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className={labelClass}>Country</label>
                <input type="text" value={formData.country || ""} onChange={(e) => handleChange("country", e.target.value)} className={inputClass} />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Bio</label>
                <textarea rows={3} value={formData.bio || ""} onChange={(e) => handleChange("bio", e.target.value)} className={inputClass}></textarea>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Select value={formData.brandSize || "smb"} onValueChange={(val) => handleChange("brandSize", val)}>
                  <SelectTrigger className={inputClass}>
                    <SelectValue placeholder="Select Size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="startup">Startup</SelectItem>
                    <SelectItem value="smb">SMB</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className={labelClass}>Budget Range</label>
                <Select value={formData.budgetRange || "mid"} onValueChange={(val) => handleChange("budgetRange", val)}>
                  <SelectTrigger className={inputClass}>
                    <SelectValue placeholder="Select Budget" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="mid">Mid</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Description</label>
                <textarea rows={3} value={formData.description || ""} onChange={(e) => handleChange("description", e.target.value)} className={inputClass}></textarea>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="mt-4">
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 text-sm font-bold text-primary/70 hover:text-primary transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold transition-colors cursor-pointer disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
