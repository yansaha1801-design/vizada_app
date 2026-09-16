import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckSquare } from "lucide-react"
import { getQCQueue } from "@/app/actions/quality-control"

export default async function QualityControlPage() {
  const queue = await getQCQueue()

  const stats = await prisma.qCChecklistItem.groupBy({
    by: ["status"],
    _count: true
  })

  const passed = stats.find(s => s.status === "PASSED")?._count || 0
  const rejected = stats.find(s => s.status === "REJECTED")?._count || 0
  const rework = stats.find(s => s.status === "NEEDS_REWORK")?._count || 0
  const total = passed + rejected + rework

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Quality Control</h1>
        <p className="text-muted-foreground">Inspeksi kualitas hasil cetak dan tracking perbaikan.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Inspeksi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-600">Lolos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{passed}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {total > 0 ? ((passed / total) * 100).toFixed(1) : 0}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-red-600">Ditolak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rejected}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-yellow-600">Perbaikan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rework}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" /> Antrian QC
          </CardTitle>
          <CardDescription>Pesanan yang menunggu inspeksi kualitas.</CardDescription>
        </CardHeader>
        <CardContent>
          {queue.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg">
              Tidak ada pesanan dalam antrian QC.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No. Pesanan</TableHead>
                    <TableHead>Produk</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {queue.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell className="font-medium">{job.orderItem.order.orderNumber}</TableCell>
                      <TableCell>{job.orderItem.product.name}</TableCell>
                      <TableCell>{job.orderItem.qty}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-800">
                          QC Check
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/operator/quality-control/${job.id}`} className="text-blue-600 hover:underline text-sm font-medium">
                          Lihat Detail
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
