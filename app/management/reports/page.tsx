import { generateSalesReport, generateOrderReport, getPerformanceMetrics } from "@/app/actions/report"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3 } from "lucide-react"

export default async function ReportsPage() {
  const today = new Date()
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate())

  const [salesData, orderData, performance] = await Promise.all([
    generateSalesReport(lastMonth, today),
    generateOrderReport(lastMonth, today),
    getPerformanceMetrics(lastMonth, today)
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Laporan Bisnis</h1>
        <p className="text-muted-foreground">Dashboard performa dan statistik usaha.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Penjualan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp {performance.totalRevenue.toLocaleString("id-ID")}</div>
            <p className="text-xs text-muted-foreground mt-1">{performance.totalOrders} pesanan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pesanan Selesai</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performance.completedOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">Total {performance.totalOrders}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tingkat QC</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performance.qcRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">Lolos inspeksi</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" /> Status Pesanan
          </CardTitle>
          <CardDescription>Breakdown pesanan berdasarkan status bulan ini.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(orderData.byStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <span className="text-sm">{status}</span>
                <div className="flex-1 mx-4 bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-600 h-full"
                    style={{
                      width: `${orderData.total > 0 ? ((count as number) / orderData.total) * 100 : 0}%`
                    }}
                  />
                </div>
                <span className="text-sm font-semibold">{count as number}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Statistik Penjualan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Total Pendapatan:</span>
              <span className="font-semibold">Rp {salesData.totalSales.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between">
              <span>Sudah Dibayar:</span>
              <span className="font-semibold">Rp {salesData.totalPaid.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between">
              <span>Tingkat Pembayaran:</span>
              <span className="font-semibold">{salesData.paidRate}%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
