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
import type { Category, SubCategory } from "./crud-builder-page";
import { CategoryBlock } from "./category-block";
import { SubCategoryBlock } from "./sub-category-block";
import { v4 as uuidv4 } from "uuid";

interface KolomBuilderSectionProps {
  categories: Category[];
  setCategories: (categories: Category[]) => void;
  addCategory: (nama: string) => void;
  updateCategory: (categoryId: string, updatedCategory: Category) => void;
  deleteCategory: (categoryId: string) => void;
}

export function KolomBuilderSection({
  categories,
  setCategories,
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

  const handleAddSubCategory = (
    categoryId: string,
    subCategoryName: string
  ) => {
    const updated = categories.map((cat) => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          subCategories: [
            ...cat.subCategories,
            {
              id: uuidv4(),
              nama: subCategoryName,
              namaEn: "",
              columns: [],
            },
          ],
        };
      }
      return cat;
    });
    setCategories(updated);
  };

  const handleUpdateSubCategory = (
    categoryId: string,
    subCategoryId: string,
    updatedSubCategory: SubCategory
  ) => {
    const updated = categories.map((cat) => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          subCategories: cat.subCategories.map((sub) =>
            sub.id === subCategoryId ? updatedSubCategory : sub
          ),
        };
      }
      return cat;
    });
    setCategories(updated);
  };

  const handleDeleteSubCategory = (
    categoryId: string,
    subCategoryId: string
  ) => {
    const updated = categories.map((cat) => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          subCategories: cat.subCategories.filter(
            (sub) => sub.id !== subCategoryId
          ),
        };
      }
      return cat;
    });
    setCategories(updated);
  };

  const handleMoveColumn = (
    fromCategoryId: string,
    columnId: string,
    toCategoryId: string,
    fromSubCategoryId?: string,
    toSubCategoryId?: string
  ) => {
    if (
      fromCategoryId === toCategoryId &&
      fromSubCategoryId === toSubCategoryId
    )
      return;

    const updated = [...categories];

    let movingColumn = null;

    // Remove from source
    const fromCat = updated.find((c) => c.id === fromCategoryId);
    if (!fromCat) return;

    if (fromSubCategoryId) {
      const fromSub = fromCat.subCategories.find(
        (s) => s.id === fromSubCategoryId
      );
      if (fromSub) {
        const index = fromSub.columns.findIndex((col) => col.id === columnId);
        if (index !== -1) {
          movingColumn = fromSub.columns[index];
          fromSub.columns.splice(index, 1);
        }
      }
    } else {
      const index = fromCat.columns.findIndex((col) => col.id === columnId);
      if (index !== -1) {
        movingColumn = fromCat.columns[index];
        fromCat.columns.splice(index, 1);
      }
    }

    if (!movingColumn) return;

    // Add to destination
    const toCat = updated.find((c) => c.id === toCategoryId);
    if (!toCat) return;

    if (toSubCategoryId) {
      const toSub = toCat.subCategories.find((s) => s.id === toSubCategoryId);
      if (toSub) {
        toSub.columns.push(movingColumn);
      }
    } else {
      toCat.columns.push(movingColumn);
    }

    setCategories(updated);
  };

  const getAllDestinations = () => {
    const destinations: {
      id: string;
      nama: string;
      categoryId?: string;
      subCategoryId?: string;
    }[] = [];

    categories.forEach((cat) => {
      destinations.push({ id: cat.id, nama: cat.nama, categoryId: cat.id });
      cat.subCategories.forEach((sub) => {
        destinations.push({
          id: sub.id,
          nama: `${cat.nama} > ${sub.nama}`,
          categoryId: cat.id,
          subCategoryId: sub.id,
        });
      });
    });

    return destinations;
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
              onAddSubCategory={handleAddSubCategory}
              onUpdateSubCategory={handleUpdateSubCategory}
              onDeleteSubCategory={handleDeleteSubCategory}
              onMoveColumn={handleMoveColumn}
              getAllDestinations={getAllDestinations}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
