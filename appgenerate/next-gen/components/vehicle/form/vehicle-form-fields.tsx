"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useMemo, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Camera, Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type ImageUploadValue = File | string | undefined;

type ImageUploadProps = {
  title: string;
  description?: string;
  /** Preview/current image URL (blob/url) yang dikontrol parent */
  image?: string;
  /** Defaultnya kirim File ke parent (match stub Anda). Bisa "url" bila mau kirim string. */
  returnType?: "file" | "url";
  onImageChange: (value: ImageUploadValue) => void;
  accept?: string;
  maxSizeMB?: number;
};

function slugify(s: string) {
  return s.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "");
}

export function ImageUpload({
  title,
  description,
  image,
  onImageChange,
  returnType = "file",
  accept = "image/*",
  maxSizeMB = 5,
}: ImageUploadProps) {
  const inputId = useMemo(() => `upload-${slugify(title)}`, [title]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      // Anda bisa ganti dengan toast
      alert(`File terlalu besar. Maks ${maxSizeMB}MB`);
      return;
    }

    if (returnType === "file") {
      // Kirim File ke parent (rekomendasi untuk stub Anda)
      onImageChange(file);
    } else {
      // Opsi: kirim URL (misal blob url)
      const url = URL.createObjectURL(file);
      onImageChange(url);
    }
  };

  const handleRemoveImage = () => onImageChange(undefined);

  return (
    <div className="space-y-2">
      <Label htmlFor={inputId} className="text-foreground font-medium">
        {title}
      </Label>
      {description ? (
        <p className="text-sm text-muted-foreground">{description}</p>
      ) : null}

      {image ? (
        <div className="relative">
          <Image
            src={image || "/placeholder.svg"}
            alt={title}
            width={300}
            height={200}
            className="w-full h-48 object-cover rounded-lg border"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2 h-8 w-8 p-0"
            onClick={handleRemoveImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Label htmlFor={inputId} className="cursor-pointer block">
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
            <Camera className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-2">
              Click to upload {title.toLowerCase()}
            </p>
            <p className="text-sm text-muted-foreground">
              Supports: JPG, PNG, WebP (Max {maxSizeMB}MB)
            </p>
          </div>
          <Input
            id={inputId}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
          />
        </Label>
      )}
    </div>
  );
}

export function VehicleFormFields({
    formData,
    setFormData,
    mode,
}: {
    formData: Record<string, any>;
    setFormData: React.Dispatch<React.SetStateAction<Record<string, any>>>;
    mode: "create" | "edit";
}) {
    const [newTags, setNewTags] = useState("");

    const parseJSON = (s: any) => {
      if (typeof s !== "string") return s;
      try {
        return JSON.parse(s);
      } catch {
        return s;
      }
    };

    const toArray = (v: any): any[] => {
      const p = parseJSON(v);
      return Array.isArray(p) ? p : [];
    };

    // Ambil label dari berbagai bentuk objek
    const toTag = (item: any): string => {
      if (typeof item === "string") return item.trim();
      if (item && typeof item === "object") {
        return String(
          item.label ?? item.text ?? item.name ?? item.value ?? ""
        ).trim();
      }
      return "";
    };

    // Fungsinya: apa pun bentuk `formData.features`, hasil akhirnya array<string> rapi
    const normalizeTags = (v: any): string[] =>
      toArray(v).map(toTag).filter(Boolean);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
    <CardHeader>
        <CardTitle className="text-foreground">Basic Information</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
  <Label htmlFor="plate_number" className="text-foreground">Plate Number*</Label>
  <Input
    type="text"
    id="plate_number"
    placeholder="e.g., B 1234 ABC"
    value={formData.plate_number || ""}
    onChange={(e) => setFormData((prev) => ({ ...prev, "plate_number": e.target.value }))}
    className="text-foreground placeholder:text-muted-foreground"
    required
  />
</div>

<div className="space-y-1">
  <Label htmlFor="brand" className="text-foreground">Brand*</Label>
  <Input
    type="text"
    id="brand"
    placeholder="e.g., Toyota"
    value={formData.brand || ""}
    onChange={(e) => setFormData((prev) => ({ ...prev, "brand": e.target.value }))}
    className="text-foreground placeholder:text-muted-foreground"
    required
  />
</div>

<div className="space-y-1">
  <Label htmlFor="model" className="text-foreground">Model*</Label>
  <Input
    type="text"
    id="model"
    placeholder="e.g., Avanza"
    value={formData.model || ""}
    onChange={(e) => setFormData((prev) => ({ ...prev, "model": e.target.value }))}
    className="text-foreground placeholder:text-muted-foreground"
    required
  />
</div>

<div className="space-y-1">
  <Label htmlFor="year" className="text-foreground">Year*</Label>
  <Input
    type="number"
    id="year"
    placeholder="e.g., 2023"
    value={formData.year || ""}
    onChange={(e) => setFormData((prev) => ({ ...prev, "year": e.target.value }))}
    className="text-foreground placeholder:text-muted-foreground"
    required
  />
</div>

<div className="space-y-1">
  <Label htmlFor="color" className="text-foreground">Color*</Label>
  <Input
    type="text"
    id="color"
    placeholder="e.g., White"
    value={formData.color || ""}
    onChange={(e) => setFormData((prev) => ({ ...prev, "color": e.target.value }))}
    className="text-foreground placeholder:text-muted-foreground"
    required
  />
</div>

<div className="space-y-1">
  <Label htmlFor="vehicle_type" className="text-foreground">Vehicle Type*</Label>
  <Select
    value={formData.vehicle_type || ""}
    onValueChange={(val) => setFormData((prev) => ({ ...prev, "vehicle_type": val }))}
    required
  >
    <SelectTrigger>
      <SelectValue placeholder="e.g., Car" />
    </SelectTrigger>
    <SelectContent>
          <SelectItem value="Car">Car</SelectItem>
    <SelectItem value="SUV">SUV</SelectItem>
    <SelectItem value="Van">Van</SelectItem>
    <SelectItem value="Truck">Truck</SelectItem>
    <SelectItem value="Motorcycle">Motorcycle</SelectItem>
    </SelectContent>
  </Select>
</div>


        </div>
    </CardContent>
</Card>

<Card>
    <CardHeader>
        <CardTitle className="text-foreground">Technical Specifications</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
  <Label htmlFor="fuel_type" className="text-foreground">Fuel Type*</Label>
  <Select
    value={formData.fuel_type || ""}
    onValueChange={(val) => setFormData((prev) => ({ ...prev, "fuel_type": val }))}
    required
  >
    <SelectTrigger>
      <SelectValue placeholder="e.g., Gasoline" />
    </SelectTrigger>
    <SelectContent>
          <SelectItem value="Gasoline">Gasoline</SelectItem>
    <SelectItem value="Diesel">Diesel</SelectItem>
    <SelectItem value="Electric">Electric</SelectItem>
    <SelectItem value="Hybrid">Hybrid</SelectItem>
    </SelectContent>
  </Select>
</div>

<div className="space-y-1">
  <Label htmlFor="transmission" className="text-foreground">Transmission*</Label>
  <Select
    value={formData.transmission || ""}
    onValueChange={(val) => setFormData((prev) => ({ ...prev, "transmission": val }))}
    required
  >
    <SelectTrigger>
      <SelectValue placeholder="e.g., Manual" />
    </SelectTrigger>
    <SelectContent>
          <SelectItem value="Manual">Manual</SelectItem>
    <SelectItem value="Automatic">Automatic</SelectItem>
    <SelectItem value="CVT">CVT</SelectItem>
    </SelectContent>
  </Select>
</div>

<div className="space-y-1">
  <Label htmlFor="number_of_seats" className="text-foreground">Number Of Seats*</Label>
  <Input
    type="number"
    id="number_of_seats"
    placeholder="e.g., 7"
    value={formData.number_of_seats || ""}
    onChange={(e) => setFormData((prev) => ({ ...prev, "number_of_seats": e.target.value }))}
    className="text-foreground placeholder:text-muted-foreground"
    required
  />
</div>

<div className="space-y-1">
  <Label htmlFor="mileage" className="text-foreground">Mileage (Km)*</Label>
  <Input
    type="number"
    id="mileage"
    placeholder="e.g., 50000"
    value={formData.mileage || ""}
    onChange={(e) => setFormData((prev) => ({ ...prev, "mileage": e.target.value }))}
    className="text-foreground placeholder:text-muted-foreground"
    required
  />
</div>


        </div>
    </CardContent>
</Card>

<Card>
    <CardHeader>
        <CardTitle className="text-foreground">Pricing & Location</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
  <Label htmlFor="daily_rate" className="text-foreground">Daily Rate (Idr)*</Label>
  <Input
    type="number"
    id="daily_rate"
    placeholder="e.g., 300000"
    value={formData.daily_rate || ""}
    onChange={(e) => setFormData((prev) => ({ ...prev, "daily_rate": e.target.value }))}
    className="text-foreground placeholder:text-muted-foreground"
    required
  />
</div>

<div className="space-y-1">
  <Label htmlFor="location" className="text-foreground">Location*</Label>
  <Input
    type="text"
    id="location"
    placeholder="e.g., Jakarta"
    value={formData.location || ""}
    onChange={(e) => setFormData((prev) => ({ ...prev, "location": e.target.value }))}
    className="text-foreground placeholder:text-muted-foreground"
    required
  />
</div>

<div className="space-y-1">
  <Label htmlFor="status" className="text-foreground">Status*</Label>
  <Select
    value={formData.status || ""}
    onValueChange={(val) => setFormData((prev) => ({ ...prev, "status": val }))}
    required
  >
    <SelectTrigger>
      <SelectValue placeholder="e.g., Available" />
    </SelectTrigger>
    <SelectContent>
          <SelectItem value="Available">Available</SelectItem>
    <SelectItem value="Rented">Rented</SelectItem>
    <SelectItem value="Maintenance">Maintenance</SelectItem>
    <SelectItem value="Out Of Service">Out Of Service</SelectItem>
    </SelectContent>
  </Select>
</div>


        </div>
    </CardContent>
</Card>

<Card>
    <CardHeader>
        <CardTitle className="text-foreground">Features</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <div className="flex gap-2">
    <Input
      value={newTags}
      onChange={(e) => setNewTags(e.target.value)}
      placeholder="Add a tags..."
      onKeyPress={(e) =>
        e.key === "Enter" && (e.preventDefault(), handleAddTags())
      }
      className="text-foreground placeholder:text-muted-foreground"
    />
    <Button type="button" onClick={handleAddTags} size="sm">
      <Plus className="h-4 w-4" />
    </Button>
  </div>

  <div className="flex flex-wrap gap-2">
    {tags.map((tag: any, index: any) => (
      <Badge
        key={index}
        variant="secondary"
        className="flex items-center gap-1"
      >
        {tag}
        <X
          className="h-3 w-3 cursor-pointer hover:text-destructive"
          onClick={() => handleRemoveTag(tag)}
        />
      </Badge>
    ))}
  </div>


        </div>
    </CardContent>
</Card>

<Card>
    <CardHeader>
        <CardTitle className="text-foreground">Vehicle Images</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ImageUpload
  title="Front Photo"
  description="Upload Front Photo"
  image={formData.front_photo_preview || formData.front_photo_url}
  // returnType default "file" → val akan berupa File
  onImageChange={(val) => {
    if (val instanceof File) {
      // Simpan File + preview (match pola stub lama Anda)
      const preview = URL.createObjectURL(val);
      setFormData((prev) => ({
        ...prev,
        "front_photo": val,
        "front_photo_preview": preview,
        // reset url kalau sebelumnya pakai url
        "front_photo_url": undefined,
      }));
    } else {
      // Kalau suatu saat Anda ingin kirim URL string (mis. hasil upload)
      setFormData((prev) => ({
        ...prev,
        "front_photo": undefined,
        "front_photo_preview": undefined,
        "front_photo_url": val,
      }));
    }
  }}
/>

<ImageUpload
  title="Side Photo"
  description="Upload Side Photo"
  image={formData.side_photo_preview || formData.side_photo_url}
  // returnType default "file" → val akan berupa File
  onImageChange={(val) => {
    if (val instanceof File) {
      // Simpan File + preview (match pola stub lama Anda)
      const preview = URL.createObjectURL(val);
      setFormData((prev) => ({
        ...prev,
        "side_photo": val,
        "side_photo_preview": preview,
        // reset url kalau sebelumnya pakai url
        "side_photo_url": undefined,
      }));
    } else {
      // Kalau suatu saat Anda ingin kirim URL string (mis. hasil upload)
      setFormData((prev) => ({
        ...prev,
        "side_photo": undefined,
        "side_photo_preview": undefined,
        "side_photo_url": val,
      }));
    }
  }}
/>

<ImageUpload
  title="Back Photo"
  description="Upload Back Photo"
  image={formData.back_photo_preview || formData.back_photo_url}
  // returnType default "file" → val akan berupa File
  onImageChange={(val) => {
    if (val instanceof File) {
      // Simpan File + preview (match pola stub lama Anda)
      const preview = URL.createObjectURL(val);
      setFormData((prev) => ({
        ...prev,
        "back_photo": val,
        "back_photo_preview": preview,
        // reset url kalau sebelumnya pakai url
        "back_photo_url": undefined,
      }));
    } else {
      // Kalau suatu saat Anda ingin kirim URL string (mis. hasil upload)
      setFormData((prev) => ({
        ...prev,
        "back_photo": undefined,
        "back_photo_preview": undefined,
        "back_photo_url": val,
      }));
    }
  }}
/>


        </div>
    </CardContent>
</Card>

<Card>
    <CardHeader>
        <CardTitle className="text-foreground">Description</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
  <Textarea
    value={formData.description || ""}
    onChange={(e) => setFormData((prev) => ({ ...prev, "description": e.target.value }))}
    placeholder="Enter vehicle description..."
    rows={4}
    className="text-foreground placeholder:text-muted-foreground"
    required
  />
</div>


        </div>
    </CardContent>
</Card>


        </div>
    )
}