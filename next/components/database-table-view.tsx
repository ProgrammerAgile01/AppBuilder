"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Table, Database, Key, Eye, EyeOff } from "lucide-react"
import { useRouter } from "next/navigation"

interface DatabaseTableViewProps {
  tableId: string
}

interface TableColumn {
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
  rows: number
  size: string
  columns: TableColumn[]
  createdAt: string
  updatedAt: string
}

// Mock data
const mockTableData: TableInfo = {
  name: "users",
  schema: "public",
  engine: "InnoDB",
  description: "User management table with authentication data",
  rows: 15420,
  size: "2.4 MB",
  createdAt: "2024-01-15",
  updatedAt: "2024-01-25",
  columns: [
    {
      name: "id",
      type: "INT",
      length: "11",
      nullable: false,
      primaryKey: true,
      autoIncrement: true,
      unique: true,
      index: true,
    },
    {
      name: "username",
      type: "VARCHAR",
      length: "50",
      nullable: false,
      unique: true,
      index: true,
      primaryKey: false,
      autoIncrement: false,
    },
    {
      name: "email",
      type: "VARCHAR",
      length: "100",
      nullable: false,
      unique: true,
      index: true,
      primaryKey: false,
      autoIncrement: false,
    },
    {
      name: "password_hash",
      type: "VARCHAR",
      length: "255",
      nullable: false,
      unique: false,
      index: false,
      primaryKey: false,
      autoIncrement: false,
    },
    {
      name: "first_name",
      type: "VARCHAR",
      length: "50",
      nullable: true,
      unique: false,
      index: false,
      primaryKey: false,
      autoIncrement: false,
    },
    {
      name: "last_name",
      type: "VARCHAR",
      length: "50",
      nullable: true,
      unique: false,
      index: false,
      primaryKey: false,
      autoIncrement: false,
    },
    {
      name: "is_active",
      type: "BOOLEAN",
      nullable: false,
      defaultValue: "true",
      unique: false,
      index: true,
      primaryKey: false,
      autoIncrement: false,
    },
    {
      name: "created_at",
      type: "TIMESTAMP",
      nullable: false,
      defaultValue: "CURRENT_TIMESTAMP",
      unique: false,
      index: true,
      primaryKey: false,
      autoIncrement: false,
    },
    {
      name: "updated_at",
      type: "TIMESTAMP",
      nullable: false,
      defaultValue: "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
      unique: false,
      index: false,
      primaryKey: false,
      autoIncrement: false,
    },
  ],
}

export function DatabaseTableView({ tableId }: DatabaseTableViewProps) {
  const router = useRouter()
  const [tableData, setTableData] = useState<TableInfo | null>(null)
  const [showSensitiveColumns, setShowSensitiveColumns] = useState(false)

  useEffect(() => {
    // In real app, fetch table data from API
    setTableData(mockTableData)
  }, [tableId])

  if (!tableData) {
    return <div>Loading...</div>
  }

  const sensitiveColumns = ["password_hash", "token", "secret"]
  const isSensitiveColumn = (columnName: string) =>
    sensitiveColumns.some((sensitive) => columnName.toLowerCase().includes(sensitive))

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
                  <h1 className="text-xl font-semibold text-slate-900">Table: {tableData.name}</h1>
                  <p className="text-sm text-slate-500">View table structure and information</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setShowSensitiveColumns(!showSensitiveColumns)}
                className="flex items-center gap-2"
              >
                {showSensitiveColumns ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showSensitiveColumns ? "Hide Sensitive" : "Show Sensitive"}
              </Button>
              <Button
                onClick={() => router.push(`/admin/database/edit/${tableId}`)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Table
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Table Information */}
        <Card className="border-0 shadow-lg bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Table Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <p className="text-sm font-medium text-slate-600">Schema</p>
                <p className="text-lg font-semibold text-slate-900">{tableData.schema}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Engine</p>
                <p className="text-lg font-semibold text-slate-900">{tableData.engine}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Rows</p>
                <p className="text-lg font-semibold text-slate-900">{tableData.rows.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Size</p>
                <p className="text-lg font-semibold text-slate-900">{tableData.size}</p>
              </div>
            </div>
            {tableData.description && (
              <div className="mt-6">
                <p className="text-sm font-medium text-slate-600 mb-2">Description</p>
                <p className="text-slate-900">{tableData.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Table Structure */}
        <Card className="border-0 shadow-lg bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Table className="h-5 w-5" />
              Table Structure ({tableData.columns.length} columns)
            </CardTitle>
            <CardDescription>Column definitions and constraints</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Column</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Length</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Nullable</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Default</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Constraints</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.columns.map((column, index) => {
                    const isSensitive = isSensitiveColumn(column.name)
                    const shouldHide = isSensitive && !showSensitiveColumns

                    return (
                      <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className={`font-mono font-medium ${shouldHide ? "blur-sm" : ""}`}>
                              {column.name}
                            </span>
                            {column.primaryKey && <Key className="h-4 w-4 text-yellow-600" />}
                            {isSensitive && (
                              <Badge variant="outline" className="text-xs text-red-600 border-red-200">
                                Sensitive
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono text-sm">{column.type}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono text-sm">{column.length || "-"}</span>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={column.nullable ? "secondary" : "outline"} className="text-xs">
                            {column.nullable ? "YES" : "NO"}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`font-mono text-sm ${shouldHide ? "blur-sm" : ""}`}>
                            {column.defaultValue || "NULL"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {column.primaryKey && (
                              <Badge variant="default" className="text-xs">
                                PRIMARY
                              </Badge>
                            )}
                            {column.unique && (
                              <Badge variant="secondary" className="text-xs">
                                UNIQUE
                              </Badge>
                            )}
                            {column.autoIncrement && (
                              <Badge variant="outline" className="text-xs">
                                AUTO_INCREMENT
                              </Badge>
                            )}
                            {column.index && (
                              <Badge variant="outline" className="text-xs">
                                INDEX
                              </Badge>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Table Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Total Columns</p>
                  <p className="text-3xl font-bold text-blue-900">{tableData.columns.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                  <Table className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Primary Keys</p>
                  <p className="text-3xl font-bold text-green-900">
                    {tableData.columns.filter((col) => col.primaryKey).length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                  <Key className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">Indexes</p>
                  <p className="text-3xl font-bold text-purple-900">
                    {tableData.columns.filter((col) => col.index).length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                  <Database className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Timestamps */}
        <Card className="border-0 shadow-lg bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Table Metadata</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-slate-600">Created At</p>
                <p className="text-lg font-semibold text-slate-900">
                  {new Date(tableData.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Last Updated</p>
                <p className="text-lg font-semibold text-slate-900">
                  {new Date(tableData.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
