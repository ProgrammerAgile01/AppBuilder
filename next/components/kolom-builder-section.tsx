"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FolderPlus, Columns } from "lucide-react";
import type { Category } from "./crud-builder-page";
import { CategoryBlock } from "./category-block";

interface KolomBuilderSectionProps {
  categories: Category[];
  setCategories: (categories: Category[]) => void;
  addCategory: (nama: string) => void;
  updateCategory: (categoryId: string, updatedCategory: Category) => void;
  deleteCategory: (categoryId: string) => void;
}

const TIPE_DATA_OPTIONS = [
  { value: "string", label: "String" },
  { value: "integer", label: "Integer" },
  { value: "text", label: "Text" },
  { value: "boolean", label: "Boolean" },
  { value: "date", label: "Date" },
  { value: "datetime", label: "DateTime" },
  { value: "enum", label: "Enum" },
  { value: "foreignId", label: "Foreign ID" },
];

const TIPE_RELASI_OPTIONS = [
  { value: "none", label: "None" },
  { value: "belongsTo", label: "Belongs To" },
  { value: "hasOne", label: "Has One" },
  { value: "hasMany", label: "Has Many" },
];

export function KolomBuilderSection({
  categories,
  addCategory,
  updateCategory,
  deleteCategory,
}: KolomBuilderSectionProps) {
  const [newCategoryName, setNewCategoryName] = useState("");

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      addCategory(newCategoryName.trim());
      setNewCategoryName("");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Columns className="h-5 w-5" />
          Kolom Data Builder
        </CardTitle>
        <CardDescription>
          Organize your columns into categories. Each category can contain
          multiple column definitions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1">
            <Label htmlFor="newCategory" className="sr-only">
              New Category Name
            </Label>
            <Input
              id="newCategory"
              placeholder="Enter category name (e.g., Kontak, Histori)"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAddCategory()}
              className="focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Button
            onClick={handleAddCategory}
            disabled={!newCategoryName.trim()}
            className="flex items-center gap-2"
          >
            <FolderPlus className="h-4 w-4" />
            Tambah Kategori
          </Button>
        </div>

        <div className="space-y-4">
          {categories.map((category, index) => (
            <CategoryBlock
              key={category.id}
              category={category}
              onUpdate={updateCategory}
              onDelete={deleteCategory}
              canDelete={categories.length > 1}
              isFirst={index === 0}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
