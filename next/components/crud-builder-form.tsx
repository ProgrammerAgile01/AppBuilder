"use client"

import type React from "react"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Save, Database, Columns, BarChart3 } from "lucide-react"
import { DataMasterSection } from "./data-master-section"
import { KolomBuilderSection } from "./kolom-builder-section"
import { StatistikBuilderSection } from "./statistik-builder-section"
import { toast } from "@/hooks/use-toast"

export interface DataMaster {
  judul: string
  judulMenu: string
  namaTabel: string
  deskripsi: string
}

export interface KolomData {
  id: string
  kategori: string
  namaKolom: string
  labelTampilan: string
  tipeData: string
  tipeRelasi: string
  tabelRelasi: string
  kolomRelasi: string
  isNullable: boolean
  isUnique: boolean
  defaultValue: string
  options: string[]
}

export interface StatistikData {
  id: string
  judulStatistik: string
  queryAngka: string
  queryResume: string
  icon: string
}

export function CrudBuilderForm() {
  const [dataMaster, setDataMaster] = useState<DataMaster>({
    judul: "",
    judulMenu: "",
    namaTabel: "",
    deskripsi: "",
  })

  const [kolomData, setKolomData] = useState<KolomData[]>([])
  const [statistikData, setStatistikData] = useState<StatistikData[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Validate required fields
    if (!dataMaster.judul || !dataMaster.judulMenu || !dataMaster.namaTabel) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields in Data Master section.",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    // Validate kolom data
    const invalidKolom = kolomData.find((k) => !k.namaKolom || !k.labelTampilan || !k.tipeData)
    if (invalidKolom) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields for all columns.",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const formData = {
        dataMaster,
        kolomData,
        statistikData,
      }

      console.log("Form Data:", formData)

      toast({
        title: "Success!",
        description: "CRUD Builder has been saved successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save CRUD Builder. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="data-master" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="data-master" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Data Master
          </TabsTrigger>
          <TabsTrigger value="kolom-builder" className="flex items-center gap-2">
            <Columns className="h-4 w-4" />
            Kolom Builder
          </TabsTrigger>
          <TabsTrigger value="statistik-builder" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Statistik Builder
          </TabsTrigger>
        </TabsList>

        <TabsContent value="data-master">
          <DataMasterSection dataMaster={dataMaster} setDataMaster={setDataMaster} />
        </TabsContent>

        <TabsContent value="kolom-builder">
          <KolomBuilderSection kolomData={kolomData} setKolomData={setKolomData} />
        </TabsContent>

        <TabsContent value="statistik-builder">
          <StatistikBuilderSection statistikData={statistikData} setStatistikData={setStatistikData} />
        </TabsContent>
      </Tabs>

      <div className="flex justify-end pt-6 border-t">
        <Button type="submit" size="lg" disabled={isSubmitting} className="min-w-[200px]">
          <Save className="h-4 w-4 mr-2" />
          {isSubmitting ? "Menyimpan..." : "Simpan Builder"}
        </Button>
      </div>
    </form>
  )
}
