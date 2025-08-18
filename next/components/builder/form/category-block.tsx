"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Columns,
  FolderPlus,
  Folder,
  Sparkles,
} from "lucide-react";
import { ColumnInput } from "./column-input";
import { SubCategoryBlock } from "./sub-category-block";
import type { Category, Column, SubCategory } from "./crud-builder-page";
import { v4 as uuidv4 } from "uuid";
import { translateText } from "./crud-builder-page";

interface CategoryBlockProps {
  category: Category;
  onUpdate: (categoryId: string, updatedCategory: Category) => void;
  onDelete: (categoryId: string) => void;
  onAddSubCategory: (categoryId: string, subCategoryName: string) => void;
  onUpdateSubCategory: (
    categoryId: string,
    subCategoryId: string,
    updatedSubCategory: SubCategory
  ) => void;
  onDeleteSubCategory: (categoryId: string, subCategoryId: string) => void;
  onMoveColumn: (
    fromCategoryId: string,
    columnId: string,
    toCategoryId: string,
    fromSubCategoryId?: string,
    toSubCategoryId?: string
  ) => void;
  getAllDestinations: () => Array<{
    id: string;
    nama: string;
    categoryId?: string;
    subCategoryId?: string;
  }>;
  canDelete: boolean;
  isFirst: boolean;
}

export function CategoryBlock({
  category,
  onUpdate,
  onDelete,
  onAddSubCategory,
  onUpdateSubCategory,
  onDeleteSubCategory,
  onMoveColumn,
  getAllDestinations,
  canDelete,
  isFirst,
}: CategoryBlockProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(category.nama);
  const [editNameEn, setEditNameEn] = useState(category.namaEn);
  const [newSubCategoryName, setNewSubCategoryName] = useState("");

  const totalColumns =
    category.columns.length +
    category.subCategories.reduce((sum, sub) => sum + sub.columns.length, 0);

  const addColumn = () => {
    const newColumn: Column = {
      id: uuidv4(),
      namaKolom: "",
      labelTampilan: "",
      labelTampilanEn: "",
      placeholder_id: "",
      placeholder_en: "",
      tipeData: "varchar",
      length: "255",
      tipeInput: "text",
      aktifkanRelasi: false,
      tipeRelasi: "belongsTo",
      tabelRelasi: "",
      kolomRelasi: "",
      isNullable: false,
      isUnique: false,
      isRequired: false,
      isHide: false,
      isReadonly: false,
      noUrutKolom: category.columns.length + 1,
      alignKolom: "left",
      defaultValue: "",
      enumValues: [],
      enumValuesEn: [],
      options: [],
      optionsEn: [],
    };

    onUpdate(category.id, {
      ...category,
      columns: [...category.columns, newColumn],
    });
  };

  const updateColumn = (columnId: string, updatedColumn: Column) => {
    onUpdate(category.id, {
      ...category,
      columns: category.columns.map((col) =>
        col.id === columnId ? updatedColumn : col
      ),
    });
  };

  const deleteColumn = (columnId: string) => {
    onUpdate(category.id, {
      ...category,
      columns: category.columns.filter((col) => col.id !== columnId),
    });
  };

  const handleSaveEdit = () => {
    if (editName.trim()) {
      onUpdate(category.id, {
        ...category,
        nama: editName.trim(),
        namaEn: editNameEn.trim(),
      });
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditName(category.nama);
    setEditNameEn(category.namaEn);
    setIsEditing(false);
  };

  const handleAddSubCategory = () => {
    if (newSubCategoryName.trim()) {
      onAddSubCategory(category.id, newSubCategoryName.trim());
      setNewSubCategoryName("");
    }
  };

  const handleMoveColumn = (
    columnId: string,
    targetCategoryId: string,
    fromSubCategoryId?: string,
    toSubCategoryId?: string
  ) => {
    onMoveColumn(
      category.id,
      columnId,
      targetCategoryId,
      fromSubCategoryId,
      toSubCategoryId
    );
  };

  return (
    <Accordion
      type="single"
      collapsible
      defaultValue={isFirst ? category.id : undefined}
    >
      <AccordionItem value={category.id} className="border rounded-lg">
        <AccordionTrigger className="px-4 hover:no-underline">
          <div className="flex items-center justify-between w-full mr-4">
            <div className="flex items-center gap-3">
              {isEditing ? (
                <div
                  className="flex items-center gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="space-y-2">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="h-7 w-40 text-sm"
                      placeholder="Category name (ID)"
                      onKeyPress={(e) => e.key === "Enter" && handleSaveEdit()}
                      autoFocus
                    />
                    <Input
                      value={editNameEn}
                      onChange={(e) => setEditNameEn(e.target.value)}
                      className="h-7 w-40 text-sm"
                      placeholder="Category name (EN)"
                    />
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={async () => {
                      if (editName && !editNameEn) {
                        try {
                          const translation = await translateText(editName);
                          if (translation && translation !== editName) {
                            setEditNameEn(translation);
                          }
                        } catch (error) {
                          console.error("Translation failed:", error);
                          // Don't show error toast here, just fail silently
                        }
                      }
                    }}
                    className="h-7 w-7 p-0"
                    disabled={!editName}
                  >
                    <Sparkles className="h-3 w-3 text-blue-600" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleSaveEdit}
                    className="h-7 w-7 p-0"
                  >
                    <Check className="h-3 w-3 text-green-600" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCancelEdit}
                    className="h-7 w-7 p-0"
                  >
                    <X className="h-3 w-3 text-red-600" />
                  </Button>
                </div>
              ) : (
                <>
                  <Folder className="h-5 w-5 text-blue-600" />
                  <div className="flex flex-col">
                    <span className="font-medium text-lg">{category.nama}</span>
                    {category.namaEn && (
                      <span className="text-sm text-gray-500 italic">
                        {category.namaEn}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {totalColumns} kolom
                    </Badge>
                    {category.subCategories.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {category.subCategories.length} sub-kategori
                      </Badge>
                    )}
                  </div>
                </>
              )}
            </div>

            {!isEditing && (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                {canDelete && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(category.id);
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </AccordionTrigger>

        <AccordionContent className="px-4 pb-4">
          <div className="space-y-6">
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={addColumn}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 bg-transparent"
              >
                <Plus className="h-4 w-4" />
                Tambah Kolom Langsung
              </Button>

              <div className="flex items-center gap-2">
                <Input
                  placeholder="Nama sub-kategori"
                  value={newSubCategoryName}
                  onChange={(e) => setNewSubCategoryName(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && handleAddSubCategory()
                  }
                  className="h-9 w-48 text-sm"
                />
                <Button
                  onClick={handleAddSubCategory}
                  disabled={!newSubCategoryName.trim()}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 bg-transparent"
                >
                  <FolderPlus className="h-4 w-4" />
                  Tambah Sub-Kategori
                </Button>
              </div>
            </div>

            {/* Direct Columns */}
            {category.columns.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Columns className="h-4 w-4" />
                  Kolom Langsung ({category.columns.length})
                </div>
                <div className="space-y-3 pl-4 border-l-2 border-gray-200">
                  {category.columns.map((column) => (
                    <ColumnInput
                      key={column.id}
                      column={column}
                      onUpdate={updateColumn}
                      onDelete={deleteColumn}
                      onMoveToCategory={handleMoveColumn}
                      getAllDestinations={getAllDestinations}
                      currentLocation={category.nama}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Sub-Categories */}
            {category.subCategories.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <FolderPlus className="h-4 w-4" />
                  Sub-Kategori ({category.subCategories.length})
                </div>
                <div className="space-y-3">
                  {category.subCategories.map((subCategory) => (
                    <SubCategoryBlock
                      key={subCategory.id}
                      categoryId={category.id}
                      categoryName={category.nama}
                      subCategory={subCategory}
                      onUpdate={(updatedSubCategory) =>
                        onUpdateSubCategory(
                          category.id,
                          subCategory.id,
                          updatedSubCategory
                        )
                      }
                      onDelete={() =>
                        onDeleteSubCategory(category.id, subCategory.id)
                      }
                      onMoveColumn={handleMoveColumn}
                      getAllDestinations={getAllDestinations}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {category.columns.length === 0 &&
              category.subCategories.length === 0 && (
                <div className="text-center py-8 text-gray-500 bg-gray-50/50 rounded-lg border-2 border-dashed">
                  <Folder className="h-8 w-8 mx-auto mb-3 text-gray-300" />
                  <p>Belum ada kolom atau sub-kategori</p>
                  <p className="text-sm">
                    Tambah kolom langsung atau buat sub-kategori terlebih dahulu
                  </p>
                </div>
              )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
