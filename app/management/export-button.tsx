"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

interface ExportData {
  createdAt: string | Date
  orderNumber: string
  customer?: { name?: string | null } | null
  totalAmount: number
  status: string
}

export function ExportButton({ data }: { data: ExportData[] }) {
  const handleExport = () => {
    const headers = ["No. Invoice", "Nama Pelanggan", "Total Pembayaran", "Status Pesanan", "Tanggal Masuk"]
    
    const csvData = data.map(row => {
      const date = new Date(row.createdAt).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric"
      })
      return `${row.orderNumber},${row.customer?.name || "-"},${row.totalAmount},${row.status},${date}`
    })
    
    const csvContent = [headers.join(","), ...csvData].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `Laporan_Transaksi_Vizada_${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Button onClick={handleExport} variant="outline" className="gap-2 cursor-pointer">
      <Download className="h-4 w-4" /> Export Laporan (CSV)
    </Button>
  )
}