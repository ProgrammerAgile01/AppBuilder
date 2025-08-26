"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Save, Plus, Trash2, Table, Database } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"

interface DatabaseTableFormProps {
  tableId?: string
}

interface TableColumn {
  id: string
  name: string
  type: string
  length?: string
  nullable: boolean
  defaultValue?: string
  primaryKey: boolean
  autoIncrement: boolean
  unique: boolean
  index: boolean
}

interface TableInfo {
  name: string
  schema: string
  engine: string
  description: string
  columns: TableColumn[]
}

const DATA_TYPES = [
  "VARCHAR",
  "CHAR",
  "TEXT",
  "MEDIUMTEXT",
  "LONGTEXT",
  "INT",
  "BIGINT",
  "SMALLINT",
  "TINYINT",
  "DECIMAL",
  "FLOAT",
  "DOUBLE",
  "DATE",
  "DATETIME",
  "TIMESTAMP",
  "TIME",
  "YEAR",
  "BOOLEAN",
  "JSON",
  "ENUM",
]

const ENGINES = ["InnoDB", "MyISAM", "Memory", "Archive"]

export function DatabaseTableForm({ tableId }: DatabaseTableFormProps) {
  const router = useRouter()
  const isEditing = !!tableId

  const [tableInfo, setTableInfo] = useState<TableInfo>({
    name: "",
    schema: "public",
    engine: "InnoDB",
    description: "",
    columns: [
      {
        id: "1",
        name: "id",
        type: "INT",
        length: "11",
        nullable: false,
        primaryKey: true,
        autoIncrement: true,
        unique: true,
        index: true,
      },
    ],
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (tableId) {
      // In real app, fetch table data from API
      console.log("Loading table data for ID:", tableId)
    }
  }, [tableId])

  const addColumn = () => {
    const newColumn: TableColumn = {
      id: Date.now().toString(),
      name: "",
      type: "VARCHAR",
      length: "255",
      nullable: true,
      primaryKey: false,
      autoIncrement: false,
      unique: false,
      index: false,
    }
    setTableInfo({
      ...tableInfo,
      columns: [...tableInfo.columns, newColumn],
    })
  }

  const updateColumn = (columnId: string, field: keyof TableColumn, value: any) => {
    setTableInfo({
      ...tableInfo,
      columns: tableInfo.columns.map((col) => (col.id === columnId ? { ...col, [field]: value } : col)),
    })
  }

  const removeColumn = (columnId: string) => {
    if (tableInfo.columns.length > 1) {
      setTableInfo({
        ...tableInfo,
        columns: tableInfo.columns.filter((col) => col.id !== columnId),
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Validation
    if (!tableInfo.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Table name is required.",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    const invalidColumns = tableInfo.columns.filter((col) => !col.name.trim() || !col.type)
    if (invalidColumns.length > 0) {
      toast({
        title: "Validation Error",
        description: "All columns must have a name and type.",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      console.log("Table Data:", tableInfo)

      toast({
        title: "Success!",
        description: `Table "${tableInfo.name}" has been ${isEditing ? "updated" : "created"} successfully.`,
      })

      router.push("/admin/database")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save table. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

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
                onClick={() => router.push("/admin/database")}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Database</span>
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Table className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-slate-900">{isEditing ? "Edit Table" : "Create Table"}</h1>
                  <p className="text-sm text-slate-500">Define your database table structure</p>
                </div>
              </div>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? "Saving..." : isEditing ? "Update Table" : "Create Table"}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Table Information */}
          <Card className="border-0 shadow-lg bg-white/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Table Information
              </CardTitle>
              <CardDescription>Basic information about your database table</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="tableName">Table Name *</Label>
                  <Input
                    id="tableName"
                    value={tableInfo.name}
                    onChange={(e) => setTableInfo({ ...tableInfo, name: e.target.value })}
                    placeholder="users"
                    className="font-mono"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schema">Schema</Label>
                  <Select
                    value={tableInfo.schema}
                    onValueChange={(value) => setTableInfo({ ...tableInfo, schema: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">public</SelectItem>
                      <SelectItem value="private">private</SelectItem>
                      <SelectItem value="archive">archive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="engine">Engine</Label>
                  <Select
                    value={tableInfo.engine}
                    onValueChange={(value) => setTableInfo({ ...tableInfo, engine: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ENGINES.map((engine) => (
                        <SelectItem key={engine} value={engine}>
                          {engine}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={tableInfo.description}
                  onChange={(e) => setTableInfo({ ...tableInfo, description: e.target.value })}
                  placeholder="Describe the purpose of this table..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Columns */}
          <Card className="border-0 shadow-lg bg-white/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Table className="h-5 w-5" />
                    Table Columns
                  </CardTitle>
                  <CardDescription>Define the structure of your table columns</CardDescription>
                </div>
                <Button onClick={addColumn} variant="outline" className="flex items-center gap-2 bg-transparent">
                  <Plus className="h-4 w-4" />
                  Add Column
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tableInfo.columns.map((column, index) => (
                  <div key={column.id} className="p-4 border border-slate-200 rounded-lg bg-white/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="space-y-2">
                        <Label>Column Name *</Label>
                        <Input
                          value={column.name}
                          onChange={(e) => updateColumn(column.id, "name", e.target.value)}
                          placeholder="column_name"
                          className="font-mono"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Data Type *</Label>
                        <Select value={column.type} onValueChange={(value) => updateColumn(column.id, "type", value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {DATA_TYPES.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Length</Label>
                        <Input
                          value={column.length || ""}
                          onChange={(e) => updateColumn(column.id, "length", e.target.value)}
                          placeholder="255"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Default Value</Label>
                        <Input
                          value={column.defaultValue || ""}
                          onChange={(e) => updateColumn(column.id, "defaultValue", e.target.value)}
                          placeholder="NULL"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`nullable-${column.id}`}
                            checked={column.nullable}
                            onCheckedChange={(checked) => updateColumn(column.id, "nullable", checked)}
                          />
                          <Label htmlFor={`nullable-${column.id}`} className="text-sm">
                            Nullable
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`primary-${column.id}`}
                            checked={column.primaryKey}
                            onCheckedChange={(checked) => updateColumn(column.id, "primaryKey", checked)}
                          />
                          <Label htmlFor={`primary-${column.id}`} className="text-sm">
                            Primary Key
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`auto-${column.id}`}
                            checked={column.autoIncrement}
                            onCheckedChange={(checked) => updateColumn(column.id, "autoIncrement", checked)}
                          />
                          <Label htmlFor={`auto-${column.id}`} className="text-sm">
                            Auto Increment
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`unique-${column.id}`}
                            checked={column.unique}
                            onCheckedChange={(checked) => updateColumn(column.id, "unique", checked)}
                          />
                          <Label htmlFor={`unique-${column.id}`} className="text-sm">
                            Unique
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`index-${column.id}`}
                            checked={column.index}
                            onCheckedChange={(checked) => updateColumn(column.id, "index", checked)}
                          />
                          <Label htmlFor={`index-${column.id}`} className="text-sm">
                            Index
                          </Label>
                        </div>
                      </div>
                      {tableInfo.columns.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeColumn(column.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  )
}
