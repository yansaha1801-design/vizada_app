import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, ExternalLink, PackageX, Printer } from "lucide-react"
import { UserNav } from "@/components/user-nav"
import { StatusBadge } from "@/components/ui/status-badge"

export default async function CustomerOrdersPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect("/login")
  }

  const orders = await prisma.order.findMany({
    where: { customerId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: { product: true }
      }
    }
  })

  const formatRupiah = (price: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(price)
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Top Header */}
      <header className="px-6 lg:px-12 h-20 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 sticky top-0 z-50 backdrop-blur-md">
        <Link className="flex items-center gap-3 group" href="/">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-700 text-white shadow-sm group-hover:bg-blue-800 transition-colors">
            <Printer className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white leading-none">
              VIZADA
            </span>
            <span className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase mt-0.5">
              Percetakan & Digital Print
            </span>
          </div>
        </Link>
        <div className="ml-auto flex items-center gap-4">
          <Link href="/products">
            <Button variant="ghost" size="sm" className="font-semibold text-xs rounded-lg">
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Katalog Produk
            </Button>
          </Link>
          {session?.user && <UserNav user={session.user} />}
        </div>
      </header>

      <main className="flex-1 container px-4 md:px-8 lg:px-12 mx-auto py-8 md:py-12 max-w-5xl">
        <div className="flex flex-col space-y-2 mb-8 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Riwayat Pesanan
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              {orders.length} Transaksi
            </span>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Pantau status pengerjaan, bukti pembayaran, dan riwayat pesanan percetakan Anda.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Daftar Pesanan</h2>
              <p className="text-xs text-slate-500 mt-0.5">Pesanan diurutkan dari transaksi terbaru.</p>
            </div>
            <Link href="/products">
              <Button size="sm" className="bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg shadow-sm">
                + Pesan Baru
              </Button>
            </Link>
          </div>

          <div className="p-2">
            {orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 mb-3">
                  <PackageX className="h-8 w-8" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Belum Ada Pesanan</h3>
                <p className="text-slate-500 text-xs mt-1 max-w-sm mb-5">
                  Anda belum memiliki riwayat transaksi cetak.
                </p>
                <Link href="/products">
                  <Button className="bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold">
                    Mulai Pesanan Baru
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-xs font-bold">No. Invoice</TableHead>
                      <TableHead className="text-xs font-bold">Produk</TableHead>
                      <TableHead className="text-xs font-bold">Tanggal</TableHead>
                      <TableHead className="text-xs font-bold">Total</TableHead>
                      <TableHead className="text-xs font-bold">Status</TableHead>
                      <TableHead className="text-right text-xs font-bold">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => {
                      const itemNames = order.items.map(i => `${i.product.name} (${i.qty}x)`).join(", ")
                      
                      return (
                        <TableRow key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                          <TableCell className="font-mono text-xs font-bold text-blue-700 dark:text-blue-400">
                            {order.orderNumber}
                          </TableCell>
                          <TableCell className="text-xs max-w-xs truncate font-medium text-slate-700 dark:text-slate-300">
                            {itemNames || "Produk kustom"}
                          </TableCell>
                          <TableCell className="text-xs text-slate-500">
                            {new Date(order.createdAt).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric"
                            })}
                          </TableCell>
                          <TableCell className="text-xs font-bold text-slate-900 dark:text-white">
                            {formatRupiah(order.totalAmount)}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={order.status} />
                          </TableCell>
                          <TableCell className="text-right">
                            <Link href={`/orders/${order.id}`}>
                              <Button variant="outline" size="sm" className="h-8 px-2.5 text-xs font-medium rounded-lg">
                                Detail <ExternalLink className="ml-1 h-3 w-3" />
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}