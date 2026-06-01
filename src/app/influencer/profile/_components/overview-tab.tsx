"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NICHES } from "./shared";
import { Info, Plus, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface OverviewTabProps {
  accounts: any[];
  accountsLoading: boolean;
  fetchAccounts: () => Promise<void>;
}

export function OverviewTab({ accounts, accountsLoading, fetchAccounts }: OverviewTabProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [addingAccount, setAddingAccount] = useState(false);
  const [newAccHandle, setNewAccHandle] = useState("");
  const [newAccFollowers, setNewAccFollowers] = useState("");
  const [newAccEngagement, setNewAccEngagement] = useState("");
  const [newAccAvgViews, setNewAccAvgViews] = useState("");
  const [newAccNiche, setNewAccNiche] = useState("Lifestyle");
  const [newAccPricing, setNewAccPricing] = useState("");
  const [newAccCountry, setNewAccCountry] = useState("");
  const [newAccBio, setNewAccBio] = useState("");
  const [accountsError, setAccountsError] = useState<string | null>(null);
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null);

  const allAccounts = accounts.map((a: any) => ({ ...a, isPrimary: false }));

  const resetForm = () => {
    setNewAccHandle("");
    setNewAccFollowers("");
    setNewAccEngagement("");
    setNewAccAvgViews("");
    setNewAccNiche("Lifestyle");
    setNewAccPricing("");
    setNewAccCountry("");
    setNewAccBio("");
    setAccountsError(null);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) resetForm();
  };

  const handleAddAccount = async () => {
    if (!newAccHandle.trim()) { setAccountsError("Instagram handle is required"); return; }
    setAccountsError(null);
    setAddingAccount(true);
    try {
      const res = await fetch("/api/influencers/accounts", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instagramHandle: newAccHandle.trim(),
          followers: parseInt(newAccFollowers) || 0,
          engagementRate: parseFloat(newAccEngagement) || 0,
          avgViews: parseInt(newAccAvgViews) || 0,
          niche: newAccNiche,
          pricing: parseFloat(newAccPricing) || 0,
          country: newAccCountry || null,
          bio: newAccBio || null,
        }),
      });
      const json = await res.json() as any;
      if (json.success) {
        setIsDialogOpen(false);
        resetForm();
        fetchAccounts();
      } else {
        setAccountsError(json.error || "Failed to add account");
      }
    } catch (err: any) {
      setAccountsError(err?.message || "Network error");
    } finally {
      setAddingAccount(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!accountToDelete) return;
    try {
      const res = await fetch(`/api/influencers/accounts/${accountToDelete}`, { method: "DELETE", credentials: "include" });
      const json = await res.json() as any;
      if (json.success) fetchAccounts();
    } catch (err) { console.error(err); } finally {
      setAccountToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/80 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-5 sm:p-6 md:p-8 backdrop-blur-md shadow-lg shadow-slate-100/40 dark:shadow-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">All Profiles</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Manage your connected Instagram profiles and niches.</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
            <DialogTrigger render={<Button className="w-full sm:w-auto font-bold rounded-xl shadow-md gap-2" size="sm" />}>
              <Plus className="w-4 h-4" />
              Add Account
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] rounded-2xl p-6">
              <DialogHeader>
                <DialogTitle>Add New Instagram Account</DialogTitle>
              </DialogHeader>

              {accountsError && (
                <div className="text-xs text-rose-500 bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-xl">
                  {accountsError}
                </div>
              )}

              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="handle" className="text-xs">Instagram Handle *</Label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-slate-400 font-bold z-10 text-sm">@</span>
                      <Input 
                        id="handle"
                        placeholder="username" 
                        value={newAccHandle} 
                        onChange={e => setNewAccHandle(e.target.value)} 
                        className="pl-8 rounded-xl bg-slate-50 dark:bg-slate-900" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="niche" className="text-xs">Niche</Label>
                    <Select value={newAccNiche} onValueChange={(v) => v && setNewAccNiche(v)}>
                      <SelectTrigger id="niche" className="rounded-xl bg-slate-50 dark:bg-slate-900">
                        <SelectValue placeholder="Select Niche" />
                      </SelectTrigger>
                      <SelectContent>
                        {NICHES.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="followers" className="text-xs">Followers</Label>
                    <Input 
                      id="followers"
                      type="number" 
                      placeholder="e.g. 50000" 
                      value={newAccFollowers} 
                      onChange={e => setNewAccFollowers(e.target.value)} 
                      className="rounded-xl bg-slate-50 dark:bg-slate-900" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="engagement" className="text-xs">Engagement Rate (%)</Label>
                    <Input 
                      id="engagement"
                      type="number" 
                      step="0.1" 
                      placeholder="e.g. 3.5" 
                      value={newAccEngagement} 
                      onChange={e => setNewAccEngagement(e.target.value)} 
                      className="rounded-xl bg-slate-50 dark:bg-slate-900" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="views" className="text-xs">Avg Views / Reel</Label>
                    <Input 
                      id="views"
                      type="number" 
                      placeholder="e.g. 25000" 
                      value={newAccAvgViews} 
                      onChange={e => setNewAccAvgViews(e.target.value)} 
                      className="rounded-xl bg-slate-50 dark:bg-slate-900" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-xs">Country</Label>
                    <Input 
                      id="country"
                      placeholder="e.g. India" 
                      value={newAccCountry} 
                      onChange={e => setNewAccCountry(e.target.value)} 
                      className="rounded-xl bg-slate-50 dark:bg-slate-900" 
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-xs">Short Bio (optional)</Label>
                  <Input 
                    id="bio"
                    placeholder="Tell brands about this account" 
                    value={newAccBio} 
                    onChange={e => setNewAccBio(e.target.value)} 
                    className="rounded-xl bg-slate-50 dark:bg-slate-900" 
                  />
                </div>
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-2 mt-2">
                <Button variant="outline" onClick={() => handleDialogOpenChange(false)} className="rounded-xl w-full sm:w-auto">
                  Cancel
                </Button>
                <Button onClick={handleAddAccount} disabled={addingAccount} className="rounded-xl w-full sm:w-auto">
                  {addingAccount ? "Submitting..." : "Submit for Verification"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Accounts List */}
        {accountsLoading ? (
          <div className="py-12 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        ) : allAccounts.length === 0 ? (
          <div className="text-center py-14 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl mx-2 sm:mx-0">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Info className="w-7 h-7 text-primary" />
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm">No profiles found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {allAccounts.map((acc: any) => (
              <div key={acc.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                <div className="flex items-center gap-4 sm:flex-1 w-full">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-yellow-400 via-rose-500 to-purple-600 flex items-center justify-center text-white text-sm font-black shadow-md shrink-0">
                    IG
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-slate-900 dark:text-white text-sm truncate">@{acc.instagramHandle}</p>
                      {acc.isPrimary && (
                        <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border bg-primary/10 text-primary border-primary/20 shrink-0">Primary Profile</span>
                      )}
                      <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border shrink-0 ${acc.status === "verified" || acc.verified ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" :
                        acc.status === "rejected" ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30" :
                          "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
                        }`}>{acc.status || (acc.verified ? "verified" : "unverified")}</span>
                    </div>
                    <div className="flex gap-2 sm:gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
                      <span>{(acc.followers || 0) >= 1000 ? `${((acc.followers || 0) / 1000).toFixed(1)}K` : acc.followers || 0} followers</span>
                      <span className="hidden sm:inline">•</span>
                      <span>{(acc.engagementRate || 0).toFixed(1)}% eng.</span>
                      <span className="hidden sm:inline">•</span>
                      <span className="capitalize">{acc.niche}</span>
                    </div>
                  </div>
                </div>
                {!acc.isPrimary && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setAccountToDelete(acc.id)}
                    className="self-end sm:self-auto text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg shrink-0 w-8 h-8"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="sr-only">Remove account</span>
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-500 dark:text-slate-400 leading-relaxed flex gap-2">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-700 dark:text-slate-300">How it works: </span>
            After submitting, our team will review your account details. Once approved, you can select this account when applying to campaigns.
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!accountToDelete} onOpenChange={(open) => !open && setAccountToDelete(null)}>
        <AlertDialogContent className="rounded-2xl sm:max-w-[400px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently remove this Instagram account from your profile.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="rounded-xl bg-rose-500 hover:bg-rose-600 text-white border-transparent">
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
