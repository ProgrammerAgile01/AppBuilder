"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Database,
  Code,
  Layers,
  TrendingUp,
  Activity,
  Plus,
  ArrowRight,
  CheckCircle,
  Clock,
  AlertCircle,
  BarChart3,
  Settings,
  Zap,
} from "lucide-react"
import { calculateModuleStats, calculateBuilderStats, calculateDatabaseStats } from "@/lib/api"

export default function AdminDashboard() {
  const [moduleStats, setModuleStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    archived: 0,
    total_columns: 0,
  })

  const [builderStats, setBuilderStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    total_modules: 0,
  })

  const [databaseStats, setDatabaseStats] = useState({
    total: 0,
    active: 0,
    maintenance: 0,
    archived: 0,
    total_rows: 0,
    total_columns: 0,
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load statistics
    const loadStats = async () => {
      try {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000))

        setModuleStats(calculateModuleStats())
        setBuilderStats(calculateBuilderStats())
        setDatabaseStats(calculateDatabaseStats())
      } catch (error) {
        console.error("Error loading stats:", error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  const quickActions = [
    {
      title: "Buat Modul Baru",
      description: "Tambah modul CRUD baru",
      icon: Plus,
      href: "/admin/modules/create",
      color: "bg-blue-500",
    },
    {
      title: "CRUD Builder",
      description: "Buat sistem kompleks",
      icon: Code,
      href: "/admin/builder/create",
      color: "bg-purple-500",
    },
    {
      title: "Database Baru",
      description: "Tambah tabel database",
      icon: Database,
      href: "/admin/database/create",
      color: "bg-green-500",
    },
    {
      title: "Lihat Analytics",
      description: "Laporan dan statistik",
      icon: BarChart3,
      href: "/admin/analytics",
      color: "bg-orange-500",
    },
  ]

  const recentActivity = [
    {
      id: 1,
      action: "Module 'User Management' dipublish",
      time: "2 menit yang lalu",
      type: "success",
      icon: CheckCircle,
    },
    {
      id: 2,
      action: "Database 'products' diupdate",
      time: "15 menit yang lalu",
      type: "info",
      icon: Database,
    },
    {
      id: 3,
      action: "Builder 'E-commerce Platform' dalam draft",
      time: "1 jam yang lalu",
      type: "warning",
      icon: Clock,
    },
    {
      id: 4,
      action: "System maintenance scheduled",
      time: "2 jam yang lalu",
      type: "alert",
      icon: AlertCircle,
    },
  ]

  const performanceMetrics = [
    {
      label: "System Performance",
      value: 94,
      color: "bg-green-500",
    },
    {
      label: "Database Health",
      value: 87,
      color: "bg-blue-500",
    },
    {
      label: "API Response Time",
      value: 76,
      color: "bg-yellow-500",
    },
    {
      label: "Storage Usage",
      value: 62,
      color: "bg-purple-500",
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Selamat datang di CRUD Builder Admin Panel</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Activity className="w-3 h-3 mr-1" />
            System Online
          </Badge>
          <Button>
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Main Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Modules Stats */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Total Modules</CardTitle>
            <Layers className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{moduleStats.total}</div>
            <p className="text-xs text-blue-600 mt-1">
              {moduleStats.published} published, {moduleStats.draft} draft
            </p>
          </CardContent>
        </Card>

        {/* Builders Stats */}
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">CRUD Builders</CardTitle>
            <Code className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{builderStats.total}</div>
            <p className="text-xs text-purple-600 mt-1">{builderStats.total_modules} total modules</p>
          </CardContent>
        </Card>

        {/* Database Stats */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Database Tables</CardTitle>
            <Database className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{databaseStats.total}</div>
            <p className="text-xs text-green-600 mt-1">{databaseStats.total_rows.toLocaleString()} total rows</p>
          </CardContent>
        </Card>

        {/* Performance */}
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">94%</div>
            <p className="text-xs text-orange-600 mt-1">System health score</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>Akses cepat ke fitur-fitur utama</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Button
                  key={action.title}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-start gap-2 hover:bg-slate-50 bg-transparent"
                  onClick={() => (window.location.href = action.href)}
                >
                  <div className={`p-2 rounded-lg ${action.color} text-white`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-sm">{action.title}</div>
                    <div className="text-xs text-gray-500">{action.description}</div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 ml-auto" />
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Aktivitas terbaru dalam sistem</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => {
                const Icon = activity.icon
                return (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div
                      className={`p-1 rounded-full ${
                        activity.type === "success"
                          ? "bg-green-100 text-green-600"
                          : activity.type === "info"
                            ? "bg-blue-100 text-blue-600"
                            : activity.type === "warning"
                              ? "bg-yellow-100 text-yellow-600"
                              : "bg-red-100 text-red-600"
                      }`}
                    >
                      <Icon className="h-3 w-3" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Performance Metrics
            </CardTitle>
            <CardDescription>Metrik performa sistem real-time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {performanceMetrics.map((metric) => (
                <div key={metric.label} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">{metric.label}</span>
                    <span className="text-gray-900 font-semibold">{metric.value}%</span>
                  </div>
                  <Progress value={metric.value} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            System Overview
          </CardTitle>
          <CardDescription>Ringkasan status sistem dan database</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{moduleStats.total_columns}</div>
              <p className="text-sm text-gray-600">Total Database Columns</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{databaseStats.total_rows.toLocaleString()}</div>
              <p className="text-sm text-gray-600">Total Database Rows</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{builderStats.total_modules}</div>
              <p className="text-sm text-gray-600">Active Builder Modules</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
