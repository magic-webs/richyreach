"use client";

import React, { useState, useEffect, useRef } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Plus, Trash2, ExternalLink, MoreVertical, Edit2 } from "lucide-react";

interface Service {
  id: string;
  name: string;
  type: string;
  price: number;
  deliveryTime: string;
  exampleUrl?: string;
}

export function ServicesTab() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog and Action States
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [type, setType] = useState("Video");
  const [price, setPrice] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [exampleUrl, setExampleUrl] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/influencers/services", { credentials: "include" });
      const json = await res.json() as any;
      if (json.success && json.data) {
        setServices(json.data);
      }
    } catch (err) {
      console.error("Failed to load services", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const resetForm = () => {
    setName("");
    setType("Video");
    setPrice("");
    setDeliveryTime("");
    setExampleUrl("");
    setVideoFile(null);
    setError(null);
    setEditingServiceId(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) resetForm();
  };

  const handleEditClick = (service: Service) => {
    setEditingServiceId(service.id);
    setName(service.name);
    setType(service.type);
    setPrice((service.price / 100).toString());
    setDeliveryTime(service.deliveryTime || "");
    setExampleUrl(service.exampleUrl || "");
    setIsDialogOpen(true);
  };

  const handleSaveService = async () => {
    if (!name || !price) {
      setError("Name and Price are required.");
      return;
    }
    setError(null);
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("type", type);
      formData.append("price", price);
      formData.append("deliveryTime", deliveryTime);
      formData.append("exampleUrl", exampleUrl);
      if (videoFile) {
        formData.append("video", videoFile);
      }

      const url = editingServiceId
        ? `/api/influencers/services/${editingServiceId}`
        : "/api/influencers/services";

      const method = editingServiceId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        credentials: "include",
        body: formData,
      });

      const json = await res.json() as any;
      if (json.success && json.data) {
        if (editingServiceId) {
          setServices(services.map(s => s.id === editingServiceId ? json.data : s));
        } else {
          setServices([...services, json.data]);
        }
        setIsDialogOpen(false);
        resetForm();
      } else {
        setError(json.error || "Failed to save service");
      }
    } catch (err: any) {
      setError(err?.message || "Network error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!serviceToDelete) return;
    try {
      const res = await fetch(`/api/influencers/services/${serviceToDelete}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json() as any;
      if (json.success) {
        setServices(services.filter((s) => s.id !== serviceToDelete));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setServiceToDelete(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVideoFile(e.target.files[0]);
    } else {
      setVideoFile(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white/80 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-5 sm:p-6 md:p-8 backdrop-blur-md shadow-lg shadow-slate-100/40 dark:shadow-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Offered Services
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Manage the services you offer to brands and clients.
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
            <DialogTrigger render={<Button className="w-full sm:w-auto font-bold rounded-xl shadow-md gap-2" size="sm" />}>
              <Plus className="w-4 h-4" />
              Add Service
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] rounded-2xl p-6">
              <DialogHeader>
                <DialogTitle>{editingServiceId ? "Edit Service" : "Add New Service"}</DialogTitle>
              </DialogHeader>

              {error && (
                <div className="text-xs text-rose-500 bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-xl">
                  {error}
                </div>
              )}

              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-xs">Service Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g. Dedicated YouTube Video"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="rounded-xl bg-slate-50 dark:bg-slate-900"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type" className="text-xs">Service Type</Label>
                    <Select value={type} onValueChange={(val) => setType(val || "")}>
                      <SelectTrigger id="type" className="rounded-xl bg-slate-50 dark:bg-slate-900">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Video">Video</SelectItem>
                        <SelectItem value="Image/Post">Image/Post</SelectItem>
                        <SelectItem value="Story">Story</SelectItem>
                        <SelectItem value="Live Stream">Live Stream</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-xs">Price (INR) *</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="e.g. 500"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="rounded-xl bg-slate-50 dark:bg-slate-900"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deliveryTime" className="text-xs">Delivery Time</Label>
                    <Input
                      id="deliveryTime"
                      placeholder="e.g. 7 days"
                      value={deliveryTime}
                      onChange={(e) => setDeliveryTime(e.target.value)}
                      className="rounded-xl bg-slate-50 dark:bg-slate-900"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="video" className="text-xs">Upload Video / Promo (Optional)</Label>
                  <Input
                    id="video"
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleFileChange}
                    className="rounded-xl bg-slate-50 dark:bg-slate-900 file:text-slate-700 dark:file:text-slate-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="exampleUrl" className="text-xs">Or Example URL (if no file)</Label>
                  <Input
                    id="exampleUrl"
                    placeholder="https://..."
                    value={exampleUrl}
                    onChange={(e) => setExampleUrl(e.target.value)}
                    className="rounded-xl bg-slate-50 dark:bg-slate-900"
                  />
                </div>
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
                <Button variant="outline" onClick={() => handleDialogOpenChange(false)} className="rounded-xl w-full sm:w-auto">
                  Cancel
                </Button>
                <Button onClick={handleSaveService} disabled={saving} className="rounded-xl w-full sm:w-auto">
                  {saving ? "Saving..." : (editingServiceId ? "Update Service" : "Save Service")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Services Table */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/20 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[200px]">Service Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="hidden sm:table-cell">Delivery</TableHead>
                  <TableHead className="hidden sm:table-cell">Example</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                      No services added yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  services.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell className="font-semibold text-slate-900 dark:text-white">
                        <div className="flex flex-col">
                          <span>{service.name}</span>
                          {/* Mobile-only info to compensate for hidden columns */}
                          <div className="sm:hidden flex items-center gap-2 mt-1 text-xs text-slate-500">
                            <span className="sm:block hidden">{service.deliveryTime || "No delivery set"}</span>
                            {service.exampleUrl && (
                              <a href={service.exampleUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1 sm:block hidden">
                                <ExternalLink className="w-3 h-3" /> URL
                              </a>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md text-[10px] font-semibold">
                          {service.type}
                        </span>
                      </TableCell>
                      <TableCell className="font-bold">
                        ₹{(service.price / 100).toFixed(2)}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-slate-600 dark:text-slate-400">
                        {service.deliveryTime || "-"}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {service.exampleUrl ? (
                          <a href={service.exampleUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline text-xs">
                            <ExternalLink className="w-3 h-3" /> View
                          </a>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger render={<Button variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-slate-900 dark:hover:text-slate-200" />}>
                            <span className="sr-only">Open menu</span>
                            <MoreVertical className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-[160px] rounded-xl">
                            <DropdownMenuGroup>
                              <DropdownMenuLabel className="text-xs text-slate-500">Actions</DropdownMenuLabel>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleEditClick(service)} className="cursor-pointer gap-2">
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>Edit Service</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setServiceToDelete(service.id)} className="cursor-pointer gap-2 text-rose-500 focus:text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-950/50">
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          <span className="font-bold text-slate-700 dark:text-slate-300">💡 Tip: </span>
          Upload a short promo video using the file input, or link an example URL of your previous
          work to help brands understand your style and quality.
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!serviceToDelete} onOpenChange={(open) => !open && setServiceToDelete(null)}>
        <AlertDialogContent className="rounded-2xl sm:max-w-[400px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your service offering.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="rounded-xl bg-rose-500 hover:bg-rose-600 text-white border-transparent">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
