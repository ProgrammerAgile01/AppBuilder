"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Plus, Trash2, Edit2, Check, X, Columns, ChevronDown, ChevronRight, Folder, Sparkles } from "lucide-react"
import { ColumnInput } from "./column-input"
import type { SubCategory, Column } from "./crud-builder-page"
import { v4 as uuidv4 } from "uuid"
import { translateText } from "./crud-builder-page"

interface SubCategoryBlockProps {
  categoryId: string
  categoryName: string
  subCategory: SubCategory
  onUpdate: (updatedSubCategory: SubCategory) => void
  onDelete: () => void
  onMoveColumn: (
    columnId: string,
    targetCategoryId: string,
    fromSubCategoryId?: string,
    toSubCategoryId?: string,
  ) => void
  getAllDestinations: () => Array<{ id: string; nama: string; categoryId?: string; subCategoryId?: string }>
}

export function SubCategoryBlock({
  categoryId,
  categoryName,
  subCategory,
  onUpdate,
  onDelete,
  onMoveColumn,
  getAllDestinations,
}: SubCategoryBlockProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(subCategory.nama)
  const [editNameEn, setEditNameEn] = useState(subCategory.namaEn)

  const addColumn = () => {
    const newColumn: Column = {
      id: uuidv4(),
      namaKolom: "",
      labelTampilan: "",
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
      noUrutKolom: subCategory.columns.length + 1,
      alignKolom: "left",
      defaultValue: "",
      options: [],
    }

    onUpdate({
      ...subCategory,
      columns: [...subCategory.columns, newColumn],
    })
  }

  const updateColumn = (columnId: string, updatedColumn: Column) => {
    onUpdate({
      ...subCategory,
      columns: subCategory.columns.map((col) => (col.id === columnId ? updatedColumn : col)),
    })
  }

  const deleteColumn = (columnId: string) => {
    onUpdate({
      ...subCategory,
      columns: subCategory.columns.filter((col) => col.id !== columnId),
    })
  }

  const handleSaveEdit = () => {
    if (editName.trim()) {
      onUpdate({
        ...subCategory,
        nama: editName.trim(),
        namaEn: editNameEn.trim(),
      })
      setIsEditing(false)
    }
  }

  const handleCancelEdit = () => {
    setEditName(subCategory.nama)
    setEditNameEn(subCategory.namaEn)
    setIsEditing(false)
  }

  const handleMoveColumn = (
    columnId: string,
    targetCategoryId: string,
    fromSubCategoryId?: string,
    toSubCategoryId?: string,
  ) => {
    onMoveColumn(columnId, targetCategoryId, subCategory.id, toSubCategoryId)
  }

  return (
    <Card className="ml-4 border-l-4 border-l-purple-400 bg-purple-50/30">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-3">
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-3">
                {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}

                {isEditing ? (
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <div className="space-y-1">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="h-6 w-32 text-xs"
                        placeholder="Sub-category (ID)"
                        onKeyPress={(e) => e.key === "Enter" && handleSaveEdit()}
                        autoFocus
                      />
                      <Input
                        value={editNameEn}
                        onChange={(e) => setEditNameEn(e.target.value)}
                        className="h-6 w-32 text-xs"
                        placeholder="Sub-category (EN)"
                      />
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={async () => {
                        if (editName && !editNameEn) {
                          try {
                            const translation = await translateText(editName)
                            if (translation && translation !== editName) {
                              setEditNameEn(translation)
                            }
                          } catch (error) {
                            console.error("Translation failed:", error)
                            // Don't show error toast here, just fail silently
                          }
                        }
                      }}
                      className="h-6 w-6 p-0"
                      disabled={!editName}
                    >
                      <Sparkles className="h-2 w-2 text-purple-600" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={handleSaveEdit} className="h-6 w-6 p-0">
                      <Check className="h-2 w-2 text-green-600" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={handleCancelEdit} className="h-6 w-6 p-0">
                      <X className="h-2 w-2 text-red-600" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <Folder className="h-4 w-4 text-purple-600" />
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{subCategory.nama}</span>
                      {subCategory.namaEn && <span className="text-xs text-gray-500 italic">{subCategory.namaEn}</span>}
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {subCategory.columns.length} kolom
                    </Badge>
                  </>
                )}
              </div>

              {!isEditing && (
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsEditing(true)}
                    className="h-7 w-7 p-0 text-gray-500 hover:text-gray-700"
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={onDelete}
                    className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </CollapsibleTrigger>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-4">
              <Button
                onClick={addColumn}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 bg-transparent text-xs"
              >
                <Plus className="h-3 w-3" />
                Tambah Kolom
              </Button>

              {subCategory.columns.length === 0 ? (
                <div className="text-center py-6 text-gray-500 bg-white/50 rounded-lg border border-dashed">
                  <Columns className="h-6 w-6 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">Belum ada kolom dalam sub-kategori ini</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {subCategory.columns.map((column) => (
                    <ColumnInput
                      key={column.id}
                      column={column}
                      onUpdate={updateColumn}
                      onDelete={deleteColumn}
                      onMoveToCategory={handleMoveColumn}
                      getAllDestinations={getAllDestinations}
                      currentLocation={`${categoryName} > ${subCategory.nama}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
