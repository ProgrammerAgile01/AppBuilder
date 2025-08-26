"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Database, Languages, Loader2, Sparkles, Hash, Folder, Users, Package, ShoppingCart } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { translateText } from "./crud-builder-page"
import { toast } from "@/hooks/use-toast"
import type { DataMaster } from "./crud-builder-page"
import * as LucideIcons from "lucide-react"

interface DataMasterSectionProps {
  dataMaster: DataMaster
  setDataMaster: (data: DataMaster) => void
}

const MODULE_GROUPS = [
  { value: "users", label: "User Management", icon: Users },
  { value: "products", label: "Product Management", icon: Package },
  { value: "orders", label: "Order Management", icon: ShoppingCart },
  { value: "content", label: "Content Management", icon: Folder },
  { value: "system", label: "System Management", icon: Database },
]

const MENU_ICONS = [
  { value: "Database", label: "Database", icon: LucideIcons.Database },
  { value: "Users", label: "Users", icon: LucideIcons.Users },
  { value: "Package", label: "Package", icon: LucideIcons.Package },
  { value: "ShoppingCart", label: "Shopping Cart", icon: LucideIcons.ShoppingCart },
  { value: "Folder", label: "Folder", icon: LucideIcons.Folder },
  { value: "Settings", label: "Settings", icon: LucideIcons.Settings },
  { value: "FileText", label: "File Text", icon: LucideIcons.FileText },
  { value: "BarChart3", label: "Bar Chart", icon: LucideIcons.BarChart3 },
]

export function DataMasterSection({ dataMaster, setDataMaster }: DataMasterSectionProps) {
  const [isTranslating, setIsTranslating] = useState<Record<string, boolean>>({})

  const handleChange = (field: keyof DataMaster, value: string) => {
    setDataMaster({
      ...dataMaster,
      [field]: value,
    })

    // Auto-generate table name from title
    if (field === "judul" && value) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .replace(/\s+/g, "_")
        .substring(0, 50)
      setDataMaster((prev) => ({ ...prev, namaTabel: slug }))
    }
  }

  const handleAutoTranslate = async (field: "judul" | "judulMenu" | "deskripsi") => {
    const sourceText = dataMaster[field]
    if (!sourceText.trim()) {
      toast({
        title: "No Text to Translate",
        description: "Please enter text in the Indonesian field first.",
        variant: "destructive",
      })
      return
    }

    const targetField = `${field}En` as keyof DataMaster
    setIsTranslating((prev) => ({ ...prev, [field]: true }))

    try {
      const translation = await translateText(sourceText)

      // Only update if translation is different from original and not empty
      if (translation && translation !== sourceText && translation.trim()) {
        handleChange(targetField, translation)
        toast({
          title: "Translation Complete!",
          description: `"${sourceText}" has been translated to "${translation}"`,
        })
      } else {
        toast({
          title: "Translation Unavailable",
          description: "Translation service is currently unavailable. Please enter manually.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Translation failed:", error)
      toast({
        title: "Translation Failed",
        description: "Could not translate text. Please try again or enter manually.",
        variant: "destructive",
      })
    } finally {
      setIsTranslating((prev) => ({ ...prev, [field]: false }))
    }
  }

  const handleBulkTranslate = async () => {
    const fieldsToTranslate: Array<"judul" | "judulMenu" | "deskripsi"> = []

    if (dataMaster.judul && !dataMaster.judulEn) fieldsToTranslate.push("judul")
    if (dataMaster.judulMenu && !dataMaster.judulMenuEn) fieldsToTranslate.push("judulMenu")
    if (dataMaster.deskripsi && !dataMaster.deskripsiEn) fieldsToTranslate.push("deskripsi")

    if (fieldsToTranslate.length === 0) {
      toast({
        title: "Nothing to Translate",
        description: "All English fields are already filled or Indonesian fields are empty.",
        variant: "destructive",
      })
      return
    }

    setIsTranslating((prev) => {
      const newState = { ...prev }
      fieldsToTranslate.forEach((field) => {
        newState[field] = true
      })
      return newState
    })

    try {
      let successCount = 0
      const updatedData = { ...dataMaster }

      // Translate fields one by one to avoid rate limiting
      for (const field of fieldsToTranslate) {
        try {
          const translation = await translateText(dataMaster[field])
          if (translation && translation !== dataMaster[field] && translation.trim()) {
            updatedData[`${field}En` as keyof DataMaster] = translation
            successCount++
          }
          // Add small delay between requests
          await new Promise((resolve) => setTimeout(resolve, 500))
        } catch (error) {
          console.error(`Failed to translate ${field}:`, error)
        }
      }

      if (successCount > 0) {
        setDataMaster(updatedData)
        toast({
          title: "Bulk Translation Complete!",
          description: `${successCount} out of ${fieldsToTranslate.length} fields have been translated successfully.`,
        })
      } else {
        toast({
          title: "Translation Service Unavailable",
          description: "Translation service is currently unavailable. Please enter translations manually.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Bulk translation error:", error)
      toast({
        title: "Translation Service Error",
        description: "Translation service encountered an error. Please try individual translations.",
        variant: "destructive",
      })
    } finally {
      setIsTranslating({})
    }
  }

  const selectedIcon = MENU_ICONS.find((icon) => icon.value === dataMaster.menuIcon)
  const IconComponent = selectedIcon?.icon || LucideIcons.Database

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Master Data</h2>
          <p className="text-slate-600 mt-1">Configure the basic information for your CRUD module</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="flex items-center gap-2 px-3 py-1">
            <Languages className="h-3 w-3" />
            Multilingual Support
          </Badge>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleBulkTranslate}
            disabled={Object.values(isTranslating).some(Boolean)}
            className="flex items-center gap-2 bg-transparent"
          >
            {Object.values(isTranslating).some(Boolean) ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Auto Translate All
          </Button>
        </div>
      </div>

      {/* Main Form */}
      <Card className="border-0 shadow-lg bg-white/50 backdrop-blur-sm">
        <CardContent className="p-8 space-y-8">
          {/* Title Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label htmlFor="judul" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                Title (Indonesian) <span className="text-red-500">*</span>
                <Badge variant="secondary" className="text-xs">
                  ID
                </Badge>
              </Label>
              <Input
                id="judul"
                value={dataMaster.judul}
                onChange={(e) => handleChange("judul", e.target.value)}
                placeholder="Enter module title..."
                className="h-11 border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="judulEn" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                Title (English)
                <Badge variant="outline" className="text-xs">
                  EN
                </Badge>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAutoTranslate("judul")}
                  disabled={isTranslating.judul || !dataMaster.judul}
                  className="h-6 px-2 text-xs hover:bg-blue-50"
                >
                  {isTranslating.judul ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Sparkles className="h-3 w-3" />
                  )}
                  Auto
                </Button>
              </Label>
              <Input
                id="judulEn"
                value={dataMaster.judulEn}
                onChange={(e) => handleChange("judulEn", e.target.value)}
                placeholder="Enter module title in English..."
                className="h-11 border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Menu Title Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label htmlFor="judulMenu" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                Menu Title (Indonesian) <span className="text-red-500">*</span>
                <Badge variant="secondary" className="text-xs">
                  ID
                </Badge>
              </Label>
              <Input
                id="judulMenu"
                value={dataMaster.judulMenu}
                onChange={(e) => handleChange("judulMenu", e.target.value)}
                placeholder="Enter menu title..."
                className="h-11 border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="judulMenuEn" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                Menu Title (English)
                <Badge variant="outline" className="text-xs">
                  EN
                </Badge>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAutoTranslate("judulMenu")}
                  disabled={isTranslating.judulMenu || !dataMaster.judulMenu}
                  className="h-6 px-2 text-xs hover:bg-blue-50"
                >
                  {isTranslating.judulMenu ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Sparkles className="h-3 w-3" />
                  )}
                  Auto
                </Button>
              </Label>
              <Input
                id="judulMenuEn"
                value={dataMaster.judulMenuEn}
                onChange={(e) => handleChange("judulMenuEn", e.target.value)}
                placeholder="Enter menu title in English..."
                className="h-11 border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Table Name and Module Group */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label htmlFor="namaTabel" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Table Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="namaTabel"
                value={dataMaster.namaTabel}
                onChange={(e) => handleChange("namaTabel", e.target.value)}
                placeholder="table_name"
                className="h-11 border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                required
              />
              <p className="text-xs text-slate-500">Auto-generated from title, but you can customize it</p>
            </div>

            <div className="space-y-3">
              <Label htmlFor="moduleGroup" className="text-sm font-medium text-slate-700">
                Module Group
              </Label>
              <Select value={dataMaster.moduleGroup} onValueChange={(value) => handleChange("moduleGroup", value)}>
                <SelectTrigger className="h-11 border-slate-200 focus:ring-2 focus:ring-blue-500">
                  <SelectValue placeholder="Select module group..." />
                </SelectTrigger>
                <SelectContent>
                  {MODULE_GROUPS.map((group) => {
                    const Icon = group.icon
                    return (
                      <SelectItem key={group.value} value={group.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {group.label}
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Menu Icon */}
          <div className="space-y-3">
            <Label htmlFor="menuIcon" className="text-sm font-medium text-slate-700">
              Menu Icon
            </Label>
            <Select value={dataMaster.menuIcon} onValueChange={(value) => handleChange("menuIcon", value)}>
              <SelectTrigger className="h-11 border-slate-200 focus:ring-2 focus:ring-blue-500">
                <SelectValue>
                  <div className="flex items-center gap-2">
                    <IconComponent className="h-4 w-4" />
                    {selectedIcon?.label}
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {MENU_ICONS.map((icon) => {
                  const Icon = icon.icon
                  return (
                    <SelectItem key={icon.value} value={icon.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {icon.label}
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Description Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label htmlFor="deskripsi" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                Description (Indonesian)
                <Badge variant="secondary" className="text-xs">
                  ID
                </Badge>
              </Label>
              <Textarea
                id="deskripsi"
                value={dataMaster.deskripsi}
                onChange={(e) => handleChange("deskripsi", e.target.value)}
                placeholder="Enter module description..."
                className="min-h-[120px] border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={5}
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="deskripsiEn" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                Description (English)
                <Badge variant="outline" className="text-xs">
                  EN
                </Badge>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAutoTranslate("deskripsi")}
                  disabled={isTranslating.deskripsi || !dataMaster.deskripsi}
                  className="h-6 px-2 text-xs hover:bg-blue-50"
                >
                  {isTranslating.deskripsi ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Sparkles className="h-3 w-3" />
                  )}
                  Auto
                </Button>
              </Label>
              <Textarea
                id="deskripsiEn"
                value={dataMaster.deskripsiEn}
                onChange={(e) => handleChange("deskripsiEn", e.target.value)}
                placeholder="Enter module description in English..."
                className="min-h-[120px] border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={5}
              />
            </div>
          </div>

          {/* Translation Status */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-100">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-800 mb-3">
              <Languages className="h-4 w-4" />
              Translation Status
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={dataMaster.judulEn ? "default" : "secondary"}
                className={`text-xs ${
                  dataMaster.judulEn
                    ? "bg-green-100 text-green-800 border-green-200"
                    : "bg-slate-100 text-slate-600 border-slate-200"
                }`}
              >
                Title: {dataMaster.judulEn ? "Translated" : "Not translated"}
              </Badge>
              <Badge
                variant={dataMaster.judulMenuEn ? "default" : "secondary"}
                className={`text-xs ${
                  dataMaster.judulMenuEn
                    ? "bg-green-100 text-green-800 border-green-200"
                    : "bg-slate-100 text-slate-600 border-slate-200"
                }`}
              >
                Menu: {dataMaster.judulMenuEn ? "Translated" : "Not translated"}
              </Badge>
              <Badge
                variant={dataMaster.deskripsiEn ? "default" : "secondary"}
                className={`text-xs ${
                  dataMaster.deskripsiEn
                    ? "bg-green-100 text-green-800 border-green-200"
                    : "bg-slate-100 text-slate-600 border-slate-200"
                }`}
              >
                Description: {dataMaster.deskripsiEn ? "Translated" : "Not translated"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
