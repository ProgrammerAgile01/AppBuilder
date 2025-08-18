"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Save,
  Database,
  Columns,
  BarChart3,
  ArrowLeft,
  Plus,
  Table,
} from "lucide-react";
import { DataMasterSection } from "./data-master-section";
import { CategoryBlock } from "./category-block";
import { StatistikBuilderSection } from "./statistik-builder-section";
import { TabelLayoutSection } from "./builder/form/tabel-layout-section";
import { toast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";

// Enhanced interfaces with new fields
export interface DataMaster {
  judul: string;
  judulEn: string;
  judulMenu: string;
  judulMenuEn: string;
  namaTabel: string;
  deskripsi: string;
  deskripsiEn: string;
  moduleGroup: string;
  menuIcon: string;
}

export interface StatistikData {
  id: string;
  judulStatistik: string;
  judulStatistikEn: string;
  queryAngka: string;
  queryResume: string;
  icon: string;
}

export interface Column {
  id: string;
  namaKolom: string;
  labelTampilan: string;
  labelTampilanEn: string;
  tipeData: string;
  length: string;
  tipeInput: string;
  enumValues: string[];
  enumValuesEn: string[];
  aktifkanRelasi: boolean;
  tipeRelasi: string;
  tabelRelasi: string;
  kolomRelasi: string;
  isNullable: boolean;
  isUnique: boolean;
  isRequired: boolean;
  isHide: boolean;
  isReadonly: boolean;
  noUrutKolom: number;
  alignKolom: string;
  defaultValue: string;
  options: string[];
  optionsEn: string[];
}

export interface SubCategory {
  id: string;
  nama: string;
  namaEn: string;
  columns: Column[];
}

export interface Category {
  id: string;
  nama: string;
  namaEn: string;
  columns: Column[];
  subCategories: SubCategory[];
}

export interface TableColumnContent {
  id: string;
  columnId: string;
  displayType: "text" | "image" | "badge" | "currency" | "date" | "icon_text";
  label: string;
  labelEn: string;
  position: number;
  styling: {
    fontSize?: string;
    fontWeight?: string;
    color?: string;
    backgroundColor?: string;
    textAlign?: string;
  };
  imageSettings?: {
    width: string;
    height: string;
    objectFit: "cover" | "contain" | "fill" | "scale-down";
    borderRadius: string;
  };
}

export interface TableColumn {
  id: string;
  headerLabel: string;
  headerLabelEn: string;
  width: string;
  alignment: "left" | "center" | "right";
  isVisible: boolean;
  position: number;
  layout: "single" | "two_columns";
  contents: TableColumnContent[];
  imageColumnContents: TableColumnContent[];
}

export interface TableLayout {
  id: string;
  name: string;
  nameEn: string;
  columns: TableColumn[];
  showActions: boolean;
  actionsPosition: "left" | "right";
  rowHeight: "compact" | "normal" | "comfortable";
  showBorders: boolean;
  alternateRowColors: boolean;
}

interface CrudBuilderPageProps {
  builderId?: string;
}

export function CrudBuilderPage({ builderId }: CrudBuilderPageProps) {
  const router = useRouter();
  const isEditing = !!builderId;

  const [dataMaster, setDataMaster] = useState<DataMaster>({
    judul: "",
    judulEn: "",
    judulMenu: "",
    judulMenuEn: "",
    namaTabel: "",
    deskripsi: "",
    deskripsiEn: "",
    moduleGroup: "",
    menuIcon: "Database",
  });

  const [categories, setCategories] = useState<Category[]>([
    {
      id: uuidv4(),
      nama: "General",
      namaEn: "General",
      columns: [],
      subCategories: [],
    },
  ]);

  const [statistikData, setStatistikData] = useState<StatistikData[]>([]);
  const [tableLayout, setTableLayout] = useState<TableLayout>({
    id: uuidv4(),
    name: "Default Layout",
    nameEn: "Default Layout",
    columns: [],
    showActions: true,
    actionsPosition: "right",
    rowHeight: "normal",
    showBorders: true,
    alternateRowColors: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("master-data");

  // Load data if editing
  useEffect(() => {
    if (builderId) {
      // In real app, fetch data from API
      // For now, we'll use mock data
      console.log("Loading builder data for ID:", builderId);
    }
  }, [builderId]);

  // Get all available columns for filter selection
  const getAllColumns = (): Array<{
    id: string;
    label: string;
    namaKolom: string;
  }> => {
    const allColumns: Array<{ id: string; label: string; namaKolom: string }> =
      [];

    categories.forEach((category) => {
      // Add direct columns
      category.columns.forEach((column) => {
        allColumns.push({
          id: column.id,
          label: column.labelTampilan || column.namaKolom,
          namaKolom: column.namaKolom,
        });
      });

      // Add sub-category columns
      category.subCategories.forEach((subCategory) => {
        subCategory.columns.forEach((column) => {
          allColumns.push({
            id: column.id,
            label: column.labelTampilan || column.namaKolom,
            namaKolom: column.namaKolom,
          });
        });
      });
    });

    return allColumns.filter((col) => col.namaKolom && col.namaKolom.trim());
  };

  // Category management functions
  const addCategory = (nama: string) => {
    const newCategory: Category = {
      id: uuidv4(),
      nama: nama.trim(),
      namaEn: "",
      columns: [],
      subCategories: [],
    };
    setCategories([...categories, newCategory]);

    // Auto-translate category name
    if (nama.trim()) {
      translateText(nama.trim()).then((translation) => {
        updateCategory(newCategory.id, { ...newCategory, namaEn: translation });
      });
    }
  };

  const updateCategory = (categoryId: string, updatedCategory: Category) => {
    setCategories(
      categories.map((cat) => (cat.id === categoryId ? updatedCategory : cat))
    );
  };

  const deleteCategory = (categoryId: string) => {
    if (categories.length > 1) {
      setCategories(categories.filter((cat) => cat.id !== categoryId));
    } else {
      toast({
        title: "Cannot Delete",
        description: "At least one category is required.",
        variant: "destructive",
      });
    }
  };

  // Sub-category management functions
  const addSubCategory = (categoryId: string, subCategoryName: string) => {
    const newSubCategory: SubCategory = {
      id: uuidv4(),
      nama: subCategoryName.trim(),
      namaEn: "",
      columns: [],
    };

    setCategories(
      categories.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              subCategories: [...cat.subCategories, newSubCategory],
            }
          : cat
      )
    );

    // Auto-translate sub-category name
    if (subCategoryName.trim()) {
      translateText(subCategoryName.trim()).then((translation) => {
        updateSubCategory(categoryId, newSubCategory.id, {
          ...newSubCategory,
          namaEn: translation,
        });
      });
    }
  };

  const updateSubCategory = (
    categoryId: string,
    subCategoryId: string,
    updatedSubCategory: SubCategory
  ) => {
    setCategories(
      categories.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              subCategories: cat.subCategories.map((subCat) =>
                subCat.id === subCategoryId ? updatedSubCategory : subCat
              ),
            }
          : cat
      )
    );
  };

  const deleteSubCategory = (categoryId: string, subCategoryId: string) => {
    setCategories(
      categories.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              subCategories: cat.subCategories.filter(
                (subCat) => subCat.id !== subCategoryId
              ),
            }
          : cat
      )
    );
  };

  // Enhanced move column function to handle sub-categories
  const moveColumn = (
    fromCategoryId: string,
    columnId: string,
    toCategoryId: string,
    fromSubCategoryId?: string,
    toSubCategoryId?: string
  ) => {
    let columnToMove: Column | undefined;
    let fromCategoryName = "";
    let toCategoryName = "";

    // Find the column to move and source info
    const fromCategory = categories.find((cat) => cat.id === fromCategoryId);
    if (!fromCategory) return;

    if (fromSubCategoryId) {
      const fromSubCategory = fromCategory.subCategories.find(
        (sub) => sub.id === fromSubCategoryId
      );
      columnToMove = fromSubCategory?.columns.find(
        (col) => col.id === columnId
      );
      fromCategoryName = `${fromCategory.nama} > ${fromSubCategory?.nama}`;
    } else {
      columnToMove = fromCategory.columns.find((col) => col.id === columnId);
      fromCategoryName = fromCategory.nama;
    }

    if (!columnToMove) {
      toast({
        title: "Error",
        description: "Could not find column to move.",
        variant: "destructive",
      });
      return;
    }

    // Find target category info
    const toCategory = categories.find((cat) => cat.id === toCategoryId);
    if (!toCategory) return;

    if (toSubCategoryId) {
      const toSubCategory = toCategory.subCategories.find(
        (sub) => sub.id === toSubCategoryId
      );
      toCategoryName = `${toCategory.nama} > ${toSubCategory?.nama}`;
    } else {
      toCategoryName = toCategory.nama;
    }

    // Update categories
    const updatedCategories = categories.map((cat) => {
      if (cat.id === fromCategoryId) {
        // Remove from source
        if (fromSubCategoryId) {
          return {
            ...cat,
            subCategories: cat.subCategories.map((subCat) =>
              subCat.id === fromSubCategoryId
                ? {
                    ...subCat,
                    columns: subCat.columns.filter(
                      (col) => col.id !== columnId
                    ),
                  }
                : subCat
            ),
          };
        } else {
          return {
            ...cat,
            columns: cat.columns.filter((col) => col.id !== columnId),
          };
        }
      }

      if (cat.id === toCategoryId) {
        // Add to target
        if (toSubCategoryId) {
          return {
            ...cat,
            subCategories: cat.subCategories.map((subCat) =>
              subCat.id === toSubCategoryId
                ? { ...subCat, columns: [...subCat.columns, columnToMove!] }
                : subCat
            ),
          };
        } else {
          return {
            ...cat,
            columns: [...cat.columns, columnToMove!],
          };
        }
      }

      return cat;
    });

    setCategories(updatedCategories);

    toast({
      title: "Success!",
      description: `Column "${columnToMove.labelTampilan}" moved from "${fromCategoryName}" to "${toCategoryName}".`,
    });
  };

  // Get all available destinations for column movement
  const getAllDestinations = () => {
    const destinations: Array<{
      id: string;
      nama: string;
      categoryId?: string;
      subCategoryId?: string;
    }> = [];

    categories.forEach((cat) => {
      // Add category itself as destination
      destinations.push({
        id: cat.id,
        nama: cat.nama,
        categoryId: cat.id,
      });

      // Add sub-categories as destinations
      cat.subCategories.forEach((subCat) => {
        destinations.push({
          id: `${cat.id}-${subCat.id}`,
          nama: `${cat.nama} > ${subCat.nama}`,
          categoryId: cat.id,
          subCategoryId: subCat.id,
        });
      });
    });

    return destinations;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate Master Data
    if (!dataMaster.judul || !dataMaster.judulMenu || !dataMaster.namaTabel) {
      toast({
        title: "Validation Error",
        description:
          "Please fill in all required fields in Master Data section.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    // Validate Categories and Columns (including sub-categories)
    const invalidCategories = categories.filter(
      (cat) =>
        cat.columns.length === 0 &&
        cat.subCategories.every((sub) => sub.columns.length === 0)
    );

    if (invalidCategories.length > 0) {
      toast({
        title: "Validation Error",
        description: `Categories "${invalidCategories
          .map((cat) => cat.nama)
          .join('", "')}" must have at least one column.`,
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    // Validate all columns (both direct and in sub-categories)
    const invalidColumns: Column[] = [];
    categories.forEach((cat) => {
      // Check direct columns
      cat.columns.forEach((col) => {
        if (!col.namaKolom || !col.labelTampilan || !col.tipeData) {
          invalidColumns.push(col);
        }
      });
      // Check sub-category columns
      cat.subCategories.forEach((subCat) => {
        subCat.columns.forEach((col) => {
          if (!col.namaKolom || !col.labelTampilan || !col.tipeData) {
            invalidColumns.push(col);
          }
        });
      });
    });

    if (invalidColumns.length > 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields for all columns.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const formData = {
        dataMaster,
        categories,
        statistikData,
        tableLayout,
      };

      console.log("Complete CRUD Builder Data:", formData);

      toast({
        title: "Success!",
        description: `CRUD Builder has been ${
          isEditing ? "updated" : "created"
        } successfully.`,
      });

      // Redirect back to builder dashboard
      router.push("/admin/builder");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save CRUD Builder. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/admin/builder")}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Builders</span>
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Database className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-slate-900">
                    {isEditing ? "Edit CRUD Builder" : "Create CRUD Builder"}
                  </h1>
                  <p className="text-sm text-slate-500">
                    Build your data structure with ease
                  </p>
                </div>
              </div>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting
                ? "Saving..."
                : isEditing
                ? "Update Builder"
                : "Save Builder"}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Desktop Tabs */}
          <div className="hidden md:block">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3 bg-slate-100/50 p-1 rounded-xl">
                <TabsTrigger
                  value="master-data"
                  className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all duration-200"
                >
                  <Database className="h-4 w-4" />
                  <span className="hidden sm:inline">Master Data</span>
                </TabsTrigger>
                <TabsTrigger
                  value="column-data"
                  className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all duration-200"
                >
                  <Columns className="h-4 w-4" />
                  <span className="hidden sm:inline">Column Data</span>
                </TabsTrigger>
                <TabsTrigger
                  value="table-layout"
                  className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all duration-200"
                >
                  <Table className="h-4 w-4" />
                  <span className="hidden sm:inline">Table Layout</span>
                </TabsTrigger>
                <TabsTrigger
                  value="statistics"
                  className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all duration-200"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Statistics</span>
                </TabsTrigger>
              </TabsList>

              <div className="mt-8">
                <TabsContent value="master-data" className="space-y-6">
                  <DataMasterSection
                    dataMaster={dataMaster}
                    setDataMaster={setDataMaster}
                  />
                </TabsContent>

                <TabsContent value="column-data" className="space-y-6">
                  <KolomBuilderSection
                    categories={categories}
                    setCategories={setCategories}
                    addCategory={addCategory}
                    updateCategory={updateCategory}
                    deleteCategory={deleteCategory}
                    addSubCategory={addSubCategory}
                    updateSubCategory={updateSubCategory}
                    deleteSubCategory={deleteSubCategory}
                    moveColumn={moveColumn}
                    getAllDestinations={getAllDestinations}
                  />
                </TabsContent>

                <TabsContent value="table-layout" className="space-y-6">
                  <TabelLayoutSection
                    tableLayout={tableLayout}
                    setTableLayout={setTableLayout}
                    availableColumns={getAllColumns()}
                  />
                </TabsContent>

                <TabsContent value="statistics" className="space-y-6">
                  <StatistikBuilderSection
                    statistikData={statistikData}
                    setStatistikData={setStatistikData}
                  />
                </TabsContent>
              </div>
            </Tabs>
          </div>

          {/* Mobile Segmented Control */}
          <div className="md:hidden">
            <div className="sticky top-16 z-40 bg-white/90 backdrop-blur-sm border-b border-slate-200 -mx-4 px-4 py-3">
              <div className="flex bg-slate-100 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setActiveTab("master-data")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 ${
                    activeTab === "master-data"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Database className="h-4 w-4" />
                  Master
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("column-data")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 ${
                    activeTab === "column-data"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Columns className="h-4 w-4" />
                  Columns
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("table-layout")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 ${
                    activeTab === "table-layout"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Table className="h-4 w-4" />
                  Layout
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("statistics")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 ${
                    activeTab === "statistics"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <BarChart3 className="h-4 w-4" />
                  Stats
                </button>
              </div>
            </div>

            <div className="mt-6">
              {activeTab === "master-data" && (
                <DataMasterSection
                  dataMaster={dataMaster}
                  setDataMaster={setDataMaster}
                />
              )}
              {activeTab === "column-data" && (
                <KolomBuilderSection
                  categories={categories}
                  setCategories={setCategories}
                  addCategory={addCategory}
                  updateCategory={updateCategory}
                  deleteCategory={deleteCategory}
                  addSubCategory={addSubCategory}
                  updateSubCategory={updateSubCategory}
                  deleteSubCategory={deleteSubCategory}
                  moveColumn={moveColumn}
                  getAllDestinations={getAllDestinations}
                />
              )}
              {activeTab === "table-layout" && (
                <TabelLayoutSection
                  tableLayout={tableLayout}
                  setTableLayout={setTableLayout}
                  availableColumns={getAllColumns()}
                />
              )}
              {activeTab === "statistics" && (
                <StatistikBuilderSection
                  statistikData={statistikData}
                  setStatistikData={setStatistikData}
                />
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

interface KolomBuilderSectionProps {
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  addCategory: (name: string) => void;
  updateCategory: (categoryId: string, updatedCategory: Category) => void;
  deleteCategory: (categoryId: string) => void;
  addSubCategory: (categoryId: string, subCategoryName: string) => void;
  updateSubCategory: (
    categoryId: string,
    subCategoryId: string,
    updatedSubCategory: SubCategory
  ) => void;
  deleteSubCategory: (categoryId: string, subCategoryId: string) => void;
  moveColumn: (
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
}

function KolomBuilderSection({
  categories,
  setCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  addSubCategory,
  updateSubCategory,
  deleteSubCategory,
  moveColumn,
  getAllDestinations,
}: KolomBuilderSectionProps) {
  const [newCategoryName, setNewCategoryName] = useState("");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Column Data</h2>
          <p className="text-slate-600 mt-1">
            Define your database columns and organize them into categories
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 sm:w-64">
            <input
              type="text"
              placeholder="Enter category name..."
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (newCategoryName.trim()) {
                    addCategory(newCategoryName);
                    setNewCategoryName("");
                  }
                }
              }}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
          <Button
            onClick={() => {
              if (newCategoryName.trim()) {
                addCategory(newCategoryName);
                setNewCategoryName("");
              }
            }}
            disabled={!newCategoryName.trim()}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-4">
        {categories.map((category, index) => (
          <CategoryBlock
            key={category.id}
            category={category}
            onUpdate={updateCategory}
            onDelete={deleteCategory}
            onAddSubCategory={addSubCategory}
            onUpdateSubCategory={updateSubCategory}
            onDeleteSubCategory={deleteSubCategory}
            onMoveColumn={moveColumn}
            getAllDestinations={getAllDestinations}
            canDelete={categories.length > 1}
            isFirst={index === 0}
          />
        ))}
      </div>
    </div>
  );
}

// AI Translation function using Gemini API with better error handling
async function translateText(text: string): Promise<string> {
  if (!text || !text.trim()) {
    console.warn("No text provided for translation");
    return text;
  }

  try {
    const response = await fetch("/api/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: text.trim(),
        targetLanguage: "en",
      }),
    });

    // Always try to parse the response, even if not ok
    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      console.error("Failed to parse translation response:", parseError);
      return text; // Return original text if we can't parse response
    }

    // Check if we got a valid translation
    if (
      data.translatedText &&
      data.translatedText !== text &&
      data.translatedText.trim()
    ) {
      return data.translatedText;
    }

    // Log any errors but don't throw
    if (data.error) {
      console.warn("Translation service error:", data.error);
    }

    // Always return original text as fallback
    return text;
  } catch (error) {
    console.error("Translation request failed:", error);
    // Return original text as fallback instead of throwing
    return text;
  }
}

// Export the translation function for use in other components
export { translateText };
