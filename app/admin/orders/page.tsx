import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { OrderDetailModal } from "./order-detail-modal"
import { DataFilter } from "@/components/data-filter"
import { StatusBadge } from "@/components/ui/status-badge"

type PageProps = {
  searchParams: Promise<{ q?: string; page?: string; limit?: string }> | { q?: string; page?: string; limit?: string }
}

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const sp = await Promise.resolve(searchParams)
  const q = sp?.q || ""
  const page = parseInt(sp?.page || "1")
  const limit = parseInt(sp?.limit || "10")
  const skip = (page - 1) * limit

  const where = q ? {
    OR: [
      { orderNumber: { contains: q, mode: "insensitive" as const } },
      { customer: { name: { contains: q, mode: "insensitive" as const } } }
    ]
  } : {}

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        customer: true,
        payment: true,
        items: {
          include: { product: true }
        }
      }
    }),
    prisma.order.count({ where })
  ])

  const totalPages = Math.ceil(total / limit)

  const formatRupiah = (price: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(price)
  }



  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manajemen Pesanan</h1>
        <p className="text-muted-foreground">Pantau dan kelola semua pesanan masuk dari pelanggan.</p>
      </div>

      <DataFilter 
        searchPlaceholder="Cari invoice atau nama..." 
        defaultQuery={q} 
        defaultLimit={limit} 
      />
      
      <Card>
        <CardHeader>
          <CardTitle>Daftar Pesanan Masuk</CardTitle>
          <CardDescription>Diurutkan berdasarkan pesanan paling baru.</CardDescription>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              Data pesanan tidak ditemukan.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No. Invoice</TableHead>
                    <TableHead>Pelanggan</TableHead>
                    <TableHead>Layanan</TableHead>
                    <TableHead>Tenggat Waktu</TableHead>
                    <TableHead>Total Biaya</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => {
                    const formattedOrder = {
                      ...order,
                      payment: order.payment ? {
                        ...order.payment,
                        method: order.payment.method || "-",
                        proofUrl: order.payment.proofUrl || ""
                      } : null,
                      items: order.items.map(item => ({
                        ...item,
                        specifications: item.specifications as { notes?: string } | undefined
                      }))
                    }

                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.orderNumber}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-semibold">{order.customer.name}</span>
                            <span className="text-xs text-muted-foreground">{order.customer.phone || order.customer.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="line-clamp-1">{order.items[0]?.product.name}</span>
                          <span className="text-xs text-muted-foreground">{order.items[0]?.qty} {order.items[0]?.product.unit}</span>
                        </TableCell>
                        <TableCell>
                          {order.deadline ? new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(order.deadline) : "-"}
                        </TableCell>
                        <TableCell className="font-semibold">{formatRupiah(order.totalAmount)}</TableCell>
                        <TableCell><StatusBadge status={order.status} size="sm" /></TableCell>
                        <TableCell className="text-center">
                          <OrderDetailModal order={formattedOrder} />
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <span className="text-sm text-muted-foreground">
                Menampilkan {orders.length} dari {total} pesanan
              </span>
              <div className="flex gap-2">
                <Link
                  href={`?q=${q}&limit=${limit}&page=${page - 1}`}
                  className={`inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 ${page <= 1 ? "pointer-events-none opacity-50" : ""}`}
                >
                  Sebelumnya
                </Link>
                <Link
                  href={`?q=${q}&limit=${limit}&page=${page + 1}`}
                  className={`inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 ${page >= totalPages ? "pointer-events-none opacity-50" : ""}`}
                >
                  Selanjutnya
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}