"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import {
  Trash2,
  GripVertical,
  HelpCircle,
  Link,
  Save,
  Lightbulb,
  Settings,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ArrowRightLeft,
  Sparkles,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Column } from "./crud-builder-page";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { translateText } from "./crud-builder-page";

interface ColumnInputProps {
  column: Column;
  onUpdate: (columnId: string, updatedColumn: Column) => void;
  onDelete: (columnId: string) => void;
  onMoveToCategory: (
    columnId: string,
    targetCategoryId: string,
    fromSubCategoryId?: string,
    toSubCategoryId?: string
  ) => void;
  getAllDestinations: () => Array<{
    id: string;
    nama: string;
    categoryId?: string;
    subCategoryId?: string;
  }>;
  currentLocation: string;
}

// MySQL Data Types
const DATA_TYPES = [
  // String Types
  {
    value: "string",
    label: "STRING",
    description: "Variable-length string (1-65,535)",
    category: "String",
  },
  {
    value: "char",
    label: "CHAR",
    description: "Fixed-length string (1-255)",
    category: "String",
  },
  {
    value: "text",
    label: "TEXT",
    description: "Long text (up to 65,535 characters)",
    category: "String",
  },
  {
    value: "longText",
    label: "LONGTEXT",
    description: "Long text (up to 4,294,967,295 characters)",
    category: "String",
  },
  {
    value: "enum",
    label: "ENUM",
    description: "Enumeration of predefined values",
    category: "String",
  },

  // Numeric Types
  {
    value: "int",
    label: "INT",
    description: "Integer (-2,147,483,648 to 2,147,483,647)",
    category: "Numeric",
  },
  {
    value: "bigInteger",
    label: "BIGINT",
    description: "Large integer",
    category: "Numeric",
  },
  {
    value: "smallInteger",
    label: "SMALLINT",
    description: "Small integer (-32,768 to 32,767)",
    category: "Numeric",
  },
  {
    value: "tinyInteger",
    label: "TINYINT",
    description: "Tiny integer (-128 to 127)",
    category: "Numeric",
  },
  {
    value: "decimal",
    label: "DECIMAL",
    description: "Fixed-point decimal",
    category: "Numeric",
  },
  {
    value: "float",
    label: "FLOAT",
    description: "Single-precision floating point",
    category: "Numeric",
  },
  {
    value: "double",
    label: "DOUBLE",
    description: "Double-precision floating point",
    category: "Numeric",
  },

  // Date/Time Types
  {
    value: "date",
    label: "DATE",
    description: "Date (YYYY-MM-DD)",
    category: "Date/Time",
  },
  {
    value: "dateTime",
    label: "DATETIME",
    description: "Date and time",
    category: "Date/Time",
  },
  {
    value: "timestamp",
    label: "TIMESTAMP",
    description: "Timestamp with timezone",
    category: "Date/Time",
  },
  {
    value: "time",
    label: "TIME",
    description: "Time (HH:MM:SS)",
    category: "Date/Time",
  },
  {
    value: "year",
    label: "YEAR",
    description: "Year (1901-2155)",
    category: "Date/Time",
  },

  // Boolean
  {
    value: "boolean",
    label: "BOOLEAN",
    description: "True/False values",
    category: "Boolean",
  },

  // JSON
  { value: "json", label: "JSON", description: "JSON data", category: "JSON" },
];

const INPUT_TYPES = [
  { value: "text", label: "Text Input", description: "Single line text input" },
  {
    value: "textarea",
    label: "Textarea",
    description: "Multi-line text input",
  },
  {
    value: "number",
    label: "Number Input",
    description: "Numeric input with validation",
  },
  {
    value: "select",
    label: "Select Dropdown",
    description: "Dropdown selection",
  },
  {
    value: "radio",
    label: "Radio Buttons",
    description: "Single choice from options",
  },
  {
    value: "checkbox",
    label: "Checkbox",
    description: "Multiple selections or boolean",
  },
  { value: "switch", label: "Switch Toggle", description: "On/off toggle" },
  { value: "date", label: "Date Picker", description: "Date selection" },
  {
    value: "datetime",
    label: "DateTime Picker",
    description: "Date and time selection",
  },
  { value: "time", label: "Time Picker", description: "Time selection" },
  {
    value: "password",
    label: "Password Input",
    description: "Hidden text input",
  },
  {
    value: "email",
    label: "Email Input",
    description: "Email input with validation",
  },
  {
    value: "url",
    label: "URL Input",
    description: "URL input with validation",
  },
  { value: "tags", label: "Tags Input", description: "Tags input" },
  { value: "image", label: "Image Upload", description: "Image upload input" },
  { value: "file", label: "File Upload", description: "File upload input" },
  { value: "color", label: "Color Picker", description: "Color selection" },
];

const RELATION_TYPES = [
  {
    value: "belongsTo",
    label: "Belongs To",
    description: "This record belongs to one parent",
  },
  {
    value: "hasOne",
    label: "Has One",
    description: "This record has one related record",
  },
  {
    value: "hasMany",
    label: "Has Many",
    description: "This record has many related records",
  },
];

// Smart UI: Filter input types based on data type
const getAvailableInputTypes = (dataType: string) => {
  switch (dataType) {
    case "boolean":
      return INPUT_TYPES.filter((type) =>
        ["checkbox", "radio", "switch", "select"].includes(type.value)
      );
    case "int":
    case "bigint":
    case "smallint":
    case "tinyint":
    case "decimal":
    case "float":
    case "double":
      return INPUT_TYPES.filter((type) =>
        ["number", "select", "radio"].includes(type.value)
      );
    case "date":
      return INPUT_TYPES.filter((type) =>
        ["date", "text"].includes(type.value)
      );
    case "datetime":
    case "timestamp":
      return INPUT_TYPES.filter((type) =>
        ["datetime", "text"].includes(type.value)
      );
    case "time":
      return INPUT_TYPES.filter((type) =>
        ["time", "text"].includes(type.value)
      );
    case "year":
      return INPUT_TYPES.filter((type) =>
        ["number", "select", "text"].includes(type.value)
      );
    case "enum":
      return INPUT_TYPES.filter((type) =>
        ["select", "radio", "checkbox"].includes(type.value)
      );
    case "text":
    case "mediumtext":
    case "longtext":
      return INPUT_TYPES.filter((type) =>
        ["textarea", "text"].includes(type.value)
      );
    case "json":
      return INPUT_TYPES.filter((type) =>
        ["textarea", "text"].includes(type.value)
      );
    case "string":
    case "char":
    default:
      return INPUT_TYPES.filter(
        (type) => !["datetime", "date", "time"].includes(type.value)
      );
  }
};

// Get suggested input type based on data type
const getSuggestedInputType = (dataType: string) => {
  switch (dataType) {
    case "boolean":
      return "checkbox";
    case "int":
    case "bigint":
    case "smallint":
    case "tinyint":
    case "decimal":
    case "float":
    case "double":
      return "number";
    case "date":
      return "date";
    case "datetime":
    case "timestamp":
      return "datetime";
    case "time":
      return "time";
    case "year":
      return "number";
    case "enum":
      return "select";
    case "text":
    case "mediumtext":
    case "longtext":
    case "json":
      return "textarea";
    case "string":
    case "char":
    default:
      return "text";
  }
};

// Get default length based on data type
const getDefaultLength = (dataType: string) => {
  switch (dataType) {
    case "string":
      return "255";
    case "char":
      return "50";
    case "int":
      return "11";
    case "bigint":
      return "20";
    case "smallint":
      return "6";
    case "tinyint":
      return "4";
    case "decimal":
      return "10,2";
    case "float":
      return "7,4";
    case "double":
      return "15,8";
    default:
      return "";
  }
};

export function ColumnInput({
  column,
  onUpdate,
  onDelete,
  onMoveToCategory,
  getAllDestinations,
  currentLocation,
}: ColumnInputProps) {
  const [isRelationOpen, setIsRelationOpen] = useState(column.aktifkanRelasi);
  const [editedPlaceholderId, setEditedPlaceholderId] = useState(
    column.placeholder_id
  );
  const [editedPlaceholderEn, setEditedPlaceholderEn] = useState(
    column.placeholder_en
  );

  const { toast } = useToast();

  const handleUpdate = (field: keyof Column, value: any) => {
    onUpdate(column.id, { ...column, [field]: value });
  };

  // di komponen form kolom
  const [rawEnumInput, setRawEnumInput] = useState(
    (column.enumValues || []).join(", ")
  );

  // kalau column berubah (mis. ganti field), sinkronkan tampilan
  useEffect(() => {
    setRawEnumInput((column.enumValues || []).join(", "));
  }, [column.id]); // atau dependency yang relevan

  const parseEnum = (v: string) =>
    v
      .split(/[\n,]+/) // dukung koma dan enter
      .map((s) => s.trim())
      .filter(Boolean); // buang kosong

  // onChange: jangan normalisasi, biarkan user mengetik bebas
  const handleRawChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRawEnumInput(e.target.value);
  };

  // onBlur: baru normalisasi & kirim ke parent
  const handleBlur = () => {
    const options = parseEnum(rawEnumInput);
    handleUpdate("enumValues", options);
    // optional: rapikan tampilan setelah blur
    setRawEnumInput(options.join(", "));
  };

  // Auto-update input type and length when data type changes
  useEffect(() => {
    const availableTypes = getAvailableInputTypes(column.tipeData);
    const currentInputTypeAvailable = availableTypes.some(
      (type) => type.value === column.tipeInput
    );

    if (!currentInputTypeAvailable) {
      const suggestedType = getSuggestedInputType(column.tipeData);
      handleUpdate("tipeInput", suggestedType);
    }

    // Auto-set default length if empty
    if (!column.length) {
      const defaultLength = getDefaultLength(column.tipeData);
      if (defaultLength) {
        handleUpdate("length", defaultLength);
      }
    }
  }, [column.tipeData]);

  const availableInputTypes = getAvailableInputTypes(column.tipeData);
  const suggestedInputType = getSuggestedInputType(column.tipeData);
  const needsOptions =
    column.tipeData === "enum" ||
    ["select", "radio", "checkbox"].includes(column.tipeInput);
  const needsLength = [
    "string",
    "char",
    "int",
    "bigint",
    "smallint",
    "tinyint",
    "decimal",
    "float",
    "double",
  ].includes(column.tipeData);

  const handleSaveColumn = () => {
    // Validasi kolom individual
    if (!column.namaKolom || !column.labelTampilan) {
      toast({
        title: "Validation Error",
        description: "Nama Kolom dan Label Tampilan harus diisi.",
        variant: "destructive",
      });
      return;
    }

    if (needsOptions && column.options.length === 0) {
      toast({
        title: "Validation Error",
        description:
          "Options harus diisi untuk tipe data enum atau input select/radio/checkbox.",
        variant: "destructive",
      });
      return;
    }

    if (needsLength && !column.length) {
      toast({
        title: "Validation Error",
        description: "Length harus diisi untuk tipe data ini.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success!",
      description: `Kolom "${column.labelTampilan}" berhasil disimpan.`,
    });
  };

  // Group data types by category
  const groupedDataTypes = DATA_TYPES.reduce((acc, type) => {
    if (!acc[type.category]) {
      acc[type.category] = [];
    }
    acc[type.category].push(type);
    return acc;
  }, {} as Record<string, typeof DATA_TYPES>);

  const allDestinations = getAllDestinations();
  const availableDestinations = allDestinations.filter(
    (dest) => dest.nama !== currentLocation
  );
  // Helper function untuk menangani perubahan input placeholder
  const handlePlaceholderIdChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newPlaceholder = e.target.value;
    setEditedPlaceholderId(newPlaceholder);
    handleUpdate("placeholder_id", newPlaceholder);
  };

  const handlePlaceholderEnChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newPlaceholder = e.target.value;
    setEditedPlaceholderEn(newPlaceholder);
    handleUpdate("placeholder_en", newPlaceholder);
  };

  return (
    <TooltipProvider>
      <Card className="bg-white border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <GripVertical className="h-5 w-5 text-gray-400 mt-2 cursor-move" />

            <div className="flex-1 space-y-4">
              {/* Basic Information */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-1">
                    Nama Kolom(Tabel) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={column.namaKolom}
                    onChange={(e) => handleUpdate("namaKolom", e.target.value)}
                    placeholder="nama_kolom"
                    className="focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-1">
                    Label Tampilan (ID) <span className="text-red-500">*</span>
                    <Badge variant="secondary" className="text-xs">
                      Indonesian
                    </Badge>
                  </Label>
                  <Input
                    value={column.labelTampilan}
                    onChange={(e) =>
                      handleUpdate("labelTampilan", e.target.value)
                    }
                    placeholder="Label Tampilan"
                    className="focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-1">
                    Label Tampilan (EN)
                    <Badge variant="outline" className="text-xs">
                      English
                    </Badge>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        if (column.labelTampilan) {
                          try {
                            const translation = await translateText(
                              column.labelTampilan
                            );
                            if (
                              translation &&
                              translation !== column.labelTampilan
                            ) {
                              handleUpdate("labelTampilanEn", translation);
                              toast({
                                title: "Translation Complete!",
                                description: `"${column.labelTampilan}" translated to "${translation}"`,
                              });
                            } else {
                              toast({
                                title: "Translation Unavailable",
                                description:
                                  "Could not translate label. Please enter manually.",
                                variant: "destructive",
                              });
                            }
                          } catch (error) {
                            console.error("Translation failed:", error);
                            toast({
                              title: "Translation Failed",
                              description:
                                "Could not translate label. Please enter manually.",
                              variant: "destructive",
                            });
                          }
                        }
                      }}
                      disabled={!column.labelTampilan}
                      className="h-6 px-2 text-xs"
                    >
                      <Sparkles className="h-3 w-3" />
                      Auto
                    </Button>
                  </Label>
                  <Input
                    value={column.labelTampilanEn}
                    onChange={(e) =>
                      handleUpdate("labelTampilanEn", e.target.value)
                    }
                    placeholder="Display Label"
                    className="focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Kolom Placeholder ID */}
                <div className="space-y-2">
                  <Label htmlFor={`placeholder-id-${column.id}`}>
                    Placeholder (ID)
                  </Label>
                  <Input
                    id={`placeholder-id-${column.id}`}
                    value={editedPlaceholderId}
                    onChange={(e) => {
                      setEditedPlaceholderId(e.target.value);
                      onUpdate(column.id, {
                        ...column,
                        placeholder_id: e.target.value,
                      });
                    }}
                    placeholder="e.g., Masukkan nama lengkap"
                  />
                </div>

                {/* Kolom Placeholder EN */}
                <div className="space-y-2">
                  <Label htmlFor={`placeholder-en-${column.id}`}>
                    Placeholder (EN)
                  </Label>
                  <Input
                    id={`placeholder-en-${column.id}`}
                    value={editedPlaceholderEn}
                    onChange={(e) => {
                      setEditedPlaceholderEn(e.target.value);
                      onUpdate(column.id, {
                        ...column,
                        placeholder_en: e.target.value,
                      });
                    }}
                    placeholder="e.g., Enter full name"
                  />
                </div>
              </div>
              {/* Data Type and Length */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-1">
                    Tipe Data <span className="text-red-500">*</span>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Choose the MySQL data type for this column</p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <Select
                    value={column.tipeData}
                    onValueChange={(value) => handleUpdate("tipeData", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {Object.entries(groupedDataTypes).map(
                        ([category, types]) => (
                          <div key={category}>
                            <div className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100">
                              {category}
                            </div>
                            {types.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                <div className="flex flex-col">
                                  <span>{type.label}</span>
                                  <span className="text-xs text-gray-500">
                                    {type.description}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </div>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {needsLength && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-1">
                      Length <span className="text-red-500">*</span>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-4 w-4 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            {column.tipeData === "decimal" ||
                            column.tipeData === "float" ||
                            column.tipeData === "double"
                              ? "Format: precision,scale (e.g., 10,2)"
                              : "Maximum length or display width"}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <Input
                      value={column.length}
                      onChange={(e) => handleUpdate("length", e.target.value)}
                      placeholder={getDefaultLength(column.tipeData)}
                      className="focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>

              {/* Input Type */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-1">
                  Tipe Input <span className="text-red-500">*</span>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Choose how this field will be displayed in forms</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <Select
                  value={column.tipeInput}
                  onValueChange={(value) => handleUpdate("tipeInput", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableInputTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <div className="flex flex-col">
                            <span className="flex items-center gap-1">
                              {type.label}
                              {type.value === suggestedInputType && (
                                <Lightbulb className="h-3 w-3 text-yellow-500" />
                              )}
                            </span>
                            <span className="text-xs text-gray-500">
                              {type.description}
                            </span>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {column.tipeInput === suggestedInputType && (
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <Lightbulb className="h-3 w-3" />
                    Recommended for {column.tipeData} data type
                  </div>
                )}
              </div>

              {/* Move to Category/Sub-Category */}
              {availableDestinations.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-1">
                    <ArrowRightLeft className="h-4 w-4" />
                    Pindah ke Lokasi Lain
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          Move this column to a different category or
                          sub-category
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Current: </span>
                    <Badge variant="outline" className="text-xs">
                      {currentLocation}
                    </Badge>
                    <Select
                      value=""
                      onValueChange={(destinationId) => {
                        if (destinationId) {
                          const destination = allDestinations.find(
                            (dest) => dest.id === destinationId
                          );
                          if (destination) {
                            onMoveToCategory(
                              column.id,
                              destination.categoryId!,
                              undefined,
                              destination.subCategoryId
                            );
                          }
                        }
                      }}
                    >
                      <SelectTrigger className="w-64">
                        <SelectValue placeholder="Select destination" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableDestinations.map((destination) => (
                          <SelectItem
                            key={destination.id}
                            value={destination.id}
                          >
                            <div className="flex items-center gap-2">
                              <ArrowRightLeft className="h-3 w-3" />
                              Move to: {destination.nama}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Options for enum/select/radio/checkbox */}
              {needsOptions && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-1">
                      Options (ID) <span className="text-red-500">*</span>
                      <Badge variant="secondary" className="text-xs">
                        Indonesian
                      </Badge>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-4 w-4 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Enter each option on a new line</p>
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <Textarea
                      value={rawEnumInput}
                      onChange={handleRawChange}
                      onBlur={handleBlur}
                      placeholder="Option 1, Option 2, Option 3"
                      className="min-h-[80px] focus:ring-2 focus:ring-blue-500"
                    />
                    {column.enumValues.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {column.enumValues.map((option, index) => (
                          <Badge
                            key={`${option}-${index}`}
                            variant="secondary"
                            className="text-xs"
                          >
                            {option}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-1">
                      Options (EN)
                      <Badge variant="outline" className="text-xs">
                        English
                      </Badge>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                          if (column.options.length > 0) {
                            try {
                              const translations = [];
                              let successCount = 0;

                              // Translate options one by one
                              for (const option of column.options) {
                                try {
                                  const translation = await translateText(
                                    option
                                  );
                                  if (translation && translation !== option) {
                                    translations.push(translation);
                                    successCount++;
                                  } else {
                                    translations.push(option); // Keep original if translation fails
                                  }
                                  // Add small delay between requests
                                  await new Promise((resolve) =>
                                    setTimeout(resolve, 300)
                                  );
                                } catch (error) {
                                  console.error(
                                    `Failed to translate option "${option}":`,
                                    error
                                  );
                                  translations.push(option); // Keep original if translation fails
                                }
                              }

                              handleUpdate("optionsEn", translations);

                              if (successCount > 0) {
                                toast({
                                  title: "Options Translated!",
                                  description: `${successCount} out of ${column.options.length} options have been translated.`,
                                });
                              } else {
                                toast({
                                  title: "Translation Unavailable",
                                  description:
                                    "Could not translate options. Please enter manually.",
                                  variant: "destructive",
                                });
                              }
                            } catch (error) {
                              console.error(
                                "Options translation failed:",
                                error
                              );
                              toast({
                                title: "Translation Failed",
                                description:
                                  "Could not translate options. Please enter manually.",
                                variant: "destructive",
                              });
                            }
                          }
                        }}
                        disabled={column.options.length === 0}
                        className="h-6 px-2 text-xs"
                      >
                        <Sparkles className="h-3 w-3" />
                        Auto Translate
                      </Button>
                    </Label>
                    <Textarea
                      value={column.optionsEn.join("\n")}
                      onChange={(e) => {
                        const optionsEn = e.target.value
                          .split("\n")
                          .map((opt) => opt.trim())
                          .filter((opt) => opt);
                        handleUpdate("optionsEn", optionsEn);
                      }}
                      placeholder="Option 1\nOption 2\nOption 3"
                      className="min-h-[80px] focus:ring-2 focus:ring-blue-500"
                    />
                    {column.optionsEn.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {column.optionsEn.map((option, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {option}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Relations */}
              <Collapsible
                open={isRelationOpen}
                onOpenChange={setIsRelationOpen}
              >
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`relasi-${column.id}`}
                      checked={column.aktifkanRelasi}
                      onCheckedChange={(checked) => {
                        handleUpdate("aktifkanRelasi", checked);
                        setIsRelationOpen(!!checked);
                      }}
                    />
                    <Label
                      htmlFor={`relasi-${column.id}`}
                      className="text-sm font-medium flex items-center gap-1"
                    >
                      <Link className="h-4 w-4" />
                      Aktifkan Relasi
                    </Label>
                  </div>

                  <CollapsibleContent className="space-y-4">
                    <div className="pl-6 border-l-2 border-blue-200 space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          Tipe Relasi
                        </Label>
                        <Select
                          value={column.tipeRelasi}
                          onValueChange={(value) =>
                            handleUpdate("tipeRelasi", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {RELATION_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                <div className="flex flex-col">
                                  <span>{type.label}</span>
                                  <span className="text-xs text-gray-500">
                                    {type.description}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">
                            Tabel Relasi
                          </Label>
                          <Input
                            value={column.tabelRelasi}
                            onChange={(e) =>
                              handleUpdate("tabelRelasi", e.target.value)
                            }
                            placeholder="users"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium">
                            Kolom Relasi
                          </Label>
                          <Input
                            value={column.kolomRelasi}
                            onChange={(e) =>
                              handleUpdate("kolomRelasi", e.target.value)
                            }
                            placeholder="id"
                          />
                        </div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>

              {/* Column Properties - Complete from Version 5 & 6 */}
              <div className="space-y-4 pt-4 border-t">
                <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Column Properties
                </h4>

                {/* First Row - Validation Properties */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`required-${column.id}`}
                      checked={column.isRequired}
                      onCheckedChange={(checked) =>
                        handleUpdate("isRequired", checked)
                      }
                    />
                    <Label
                      htmlFor={`required-${column.id}`}
                      className="text-sm"
                    >
                      Is Required
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`nullable-${column.id}`}
                      checked={column.isNullable}
                      onCheckedChange={(checked) =>
                        handleUpdate("isNullable", checked)
                      }
                    />
                    <Label
                      htmlFor={`nullable-${column.id}`}
                      className="text-sm"
                    >
                      Is Nullable
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`unique-${column.id}`}
                      checked={column.isUnique}
                      onCheckedChange={(checked) =>
                        handleUpdate("isUnique", checked)
                      }
                    />
                    <Label htmlFor={`unique-${column.id}`} className="text-sm">
                      Is Unique
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`hide-${column.id}`}
                      checked={column.isHide}
                      onCheckedChange={(checked) =>
                        handleUpdate("isHide", checked)
                      }
                    />
                    <Label htmlFor={`hide-${column.id}`} className="text-sm">
                      Is Hide
                    </Label>
                  </div>
                </div>

                {/* Second Row - Display Properties */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`readonly-${column.id}`}
                      checked={column.isReadonly}
                      onCheckedChange={(checked) =>
                        handleUpdate("isReadonly", checked)
                      }
                    />
                    <Label
                      htmlFor={`readonly-${column.id}`}
                      className="text-sm"
                    >
                      Is Readonly
                    </Label>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">No Urut Kolom</Label>
                    <Input
                      type="number"
                      value={column.noUrutKolom}
                      onChange={(e) =>
                        handleUpdate(
                          "noUrutKolom",
                          Number.parseInt(e.target.value) || 1
                        )
                      }
                      placeholder="1"
                      className="text-sm"
                      min="1"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Align Kolom</Label>
                    <Select
                      value={column.alignKolom}
                      onValueChange={(value) =>
                        handleUpdate("alignKolom", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">
                          <div className="flex items-center gap-2">
                            <AlignLeft className="h-4 w-4" />
                            Left
                          </div>
                        </SelectItem>
                        <SelectItem value="center">
                          <div className="flex items-center gap-2">
                            <AlignCenter className="h-4 w-4" />
                            Center
                          </div>
                        </SelectItem>
                        <SelectItem value="right">
                          <div className="flex items-center gap-2">
                            <AlignRight className="h-4 w-4" />
                            Right
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Third Row - Default Value */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Default Value</Label>
                  <Input
                    value={column.defaultValue}
                    onChange={(e) =>
                      handleUpdate("defaultValue", e.target.value)
                    }
                    placeholder="Default value"
                    className="text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                onClick={handleSaveColumn}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Save className="h-4 w-4 mr-1" />
                Simpan Kolom
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(column.id)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
