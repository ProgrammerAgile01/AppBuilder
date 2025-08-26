"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2, GripVertical, BarChart3, Sparkles } from "lucide-react"
import * as LucideIcons from "lucide-react"
import type { StatistikData } from "./crud-builder-page"
import { v4 as uuidv4 } from "uuid"
import { translateText } from "./crud-builder-page"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"

interface StatistikBuilderSectionProps {
  statistikData: StatistikData[]
  setStatistikData: (data: StatistikData[]) => void
}

const ICON_OPTIONS = [
  { value: "BarChart3", label: "Bar Chart", icon: LucideIcons.BarChart3 },
  { value: "TrendingUp", label: "Trending Up", icon: LucideIcons.TrendingUp },
  { value: "TrendingDown", label: "Trending Down", icon: LucideIcons.TrendingDown },
  { value: "Users", label: "Users", icon: LucideIcons.Users },
  { value: "DollarSign", label: "Dollar Sign", icon: LucideIcons.DollarSign },
  { value: "ShoppingCart", label: "Shopping Cart", icon: LucideIcons.ShoppingCart },
  { value: "Package", label: "Package", icon: LucideIcons.Package },
  { value: "Activity", label: "Activity", icon: LucideIcons.Activity },
  { value: "Target", label: "Target", icon: LucideIcons.Target },
  { value: "Zap", label: "Zap", icon: LucideIcons.Zap },
]

export function StatistikBuilderSection({ statistikData, setStatistikData }: StatistikBuilderSectionProps) {
  const addStatistik = () => {
    const newStatistik: StatistikData = {
      id: uuidv4(),
      judulStatistik: "",
      queryAngka: "",
      queryResume: "",
      icon: "BarChart3",
    }
    setStatistikData([...statistikData, newStatistik])
  }

  const removeStatistik = (id: string) => {
    setStatistikData(statistikData.filter((s) => s.id !== id))
  }

  const updateStatistik = (id: string, field: keyof StatistikData, value: string) => {
    setStatistikData(statistikData.map((s) => (s.id === id ? { ...s, [field]: value } : s)))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Statistik Data Builder
        </CardTitle>
        <CardDescription>Create dynamic statistics for your dashboard with custom queries</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Button onClick={addStatistik} variant="outline" className="flex items-center gap-2 bg-transparent">
          <Plus className="h-4 w-4" />
          Tambah Statistik
        </Button>

        {statistikData.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Belum ada statistik. Klik "Tambah Statistik" untuk memulai.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {statistikData.map((statistik) => (
              <StatistikInputRow
                key={statistik.id}
                statistik={statistik}
                onUpdate={updateStatistik}
                onRemove={removeStatistik}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface StatistikInputRowProps {
  statistik: StatistikData
  onUpdate: (id: string, field: keyof StatistikData, value: string) => void
  onRemove: (id: string) => void
}

function StatistikInputRow({ statistik, onUpdate, onRemove }: StatistikInputRowProps) {
  const selectedIcon = ICON_OPTIONS.find((icon) => icon.value === statistik.icon)
  const IconComponent = selectedIcon?.icon || LucideIcons.BarChart3

  return (
    <Card className="p-4 bg-gray-50/50 border-l-4 border-l-green-500">
      <div className="flex items-start gap-3">
        <GripVertical className="h-5 w-5 text-gray-400 mt-2 cursor-move" />

        <div className="flex-1 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                Judul Statistik (ID) <span className="text-red-500">*</span>
                <Badge variant="secondary" className="text-xs">
                  Indonesian
                </Badge>
              </Label>
              <Input
                value={statistik.judulStatistik}
                onChange={(e) => onUpdate(statistik.id, "judulStatistik", e.target.value)}
                placeholder="Total Users"
                className="focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                Judul Statistik (EN)
                <Badge variant="outline" className="text-xs">
                  English
                </Badge>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    if (statistik.judulStatistik) {
                      try {
                        const translation = await translateText(statistik.judulStatistik)
                        if (translation && translation !== statistik.judulStatistik) {
                          onUpdate(statistik.id, "judulStatistikEn", translation)
                          toast({
                            title: "Translation Complete!",
                            description: `"${statistik.judulStatistik}" translated to "${translation}"`,
                          })
                        } else {
                          toast({
                            title: "Translation Unavailable",
                            description: "Could not translate title. Please enter manually.",
                            variant: "destructive",
                          })
                        }
                      } catch (error) {
                        console.error("Translation failed:", error)
                        toast({
                          title: "Translation Failed",
                          description: "Could not translate title. Please enter manually.",
                          variant: "destructive",
                        })
                      }
                    }
                  }}
                  disabled={!statistik.judulStatistik}
                  className="h-6 px-2 text-xs"
                >
                  <Sparkles className="h-3 w-3" />
                  Auto
                </Button>
              </Label>
              <Input
                value={statistik.judulStatistikEn}
                onChange={(e) => onUpdate(statistik.id, "judulStatistikEn", e.target.value)}
                placeholder="Total Users"
                className="focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Query Angka *</Label>
            <Textarea
              value={statistik.queryAngka}
              onChange={(e) => onUpdate(statistik.id, "queryAngka", e.target.value)}
              placeholder="SELECT COUNT(*) FROM users WHERE status = 'active'"
              className="min-h-[80px] font-mono text-sm focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Query Resume Bulan Ini vs Bulan Lalu *</Label>
            <Textarea
              value={statistik.queryResume}
              onChange={(e) => onUpdate(statistik.id, "queryResume", e.target.value)}
              placeholder="SELECT 
  COUNT(CASE WHEN MONTH(created_at) = MONTH(NOW()) THEN 1 END) as current_month,
  COUNT(CASE WHEN MONTH(created_at) = MONTH(NOW()) - 1 THEN 1 END) as last_month
FROM users"
              className="min-h-[100px] font-mono text-sm focus:ring-2 focus:ring-blue-500"
              rows={4}
            />
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(statistik.id)}
          className="text-red-500 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  )
}
