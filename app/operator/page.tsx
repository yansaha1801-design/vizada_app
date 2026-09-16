import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@/app/generated/prisma/client"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Printer, Calendar, StickyNote, DownloadCloud, AlertCircle, Clock, AlertTriangle } from "lucide-react"
import { ProductionButton } from "./production-button"
import { DataFilter } from "@/components/data-filter"

type PageProps = {
  searchParams: Promise<{ q?: string; page?: string; limit?: string }> | { q?: string; page?: string; limit?: string }
}

export default async function ProductionQueuePage({ searchParams }: PageProps) {
  const sp = await Promise.resolve(searchParams)
  const q = sp?.q || ""
  const page = parseInt(sp?.page || "1")
  const limit = parseInt(sp?.limit || "10")
  const skip = (page - 1) * limit

  const where: Prisma.OrderWhereInput = q ? {
    status: "IN_PRODUCTION",
    OR: [
      { orderNumber: { contains: q, mode: "insensitive" } },
      { customer: { name: { contains: q, mode: "insensitive" } } }
    ]
  } : {
    status: "IN_PRODUCTION"
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { deadline: "asc" },
      skip,
      take: limit,
      include: {
        items: { 
          include: { 
            product: true,
            productionJob: true
          } 
        },
        customer: true
      }
    }),
    prisma.order.count({ where })
  ])

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Antrean Produksi</h1>
        <p className="text-muted-foreground mt-1">Daftar pesanan yang harus segera dicetak oleh operator mesin.</p>
      </div>

      <DataFilter 
        searchPlaceholder="Cari invoice atau nama..." 
        defaultQuery={q} 
        defaultLimit={limit} 
        limitOptions={[
          { label: "10 data per halaman", value: 10 },
          { label: "25 data per halaman", value: 25 },
          { label: "50 data per halaman", value: 50 },
        ]}
      />

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-xl bg-muted/20">
          <Printer className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-lg font-bold">Data Tidak Ditemukan</h3>
          <p className="text-muted-foreground mt-1">Belum ada antrean pesanan yang cocok dengan pencarian.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {orders.map((order) => {
              const allInQC = order.items.length > 0 && order.items.every(item => item.productionJob?.status === "QC_CHECK" || item.productionJob?.status === "DONE")
              const hasRework = order.items.some(item => item.productionJob?.notes && item.productionJob?.status === "QUEUE")

              return (
              <Card key={order.id} className={`flex flex-col border-t-4 shadow-xs hover-lift rounded-2xl border border-border/70 transition-all duration-300 ${hasRework ? "border-t-amber-500" : allInQC ? "border-t-sky-500 opacity-90" : "border-t-indigo-600"}`}>
                <CardHeader className="pb-3 bg-muted/10">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-xl font-bold">{order.orderNumber}</CardTitle>
                        {allInQC && (
                          <span className="bg-blue-100 text-blue-800 text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Di QC
                          </span>
                        )}
                        {hasRework && (
                          <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" /> Revisi QC
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-muted-foreground mt-1">{order.customer.name}</p>
                    </div>
                    {order.deadline && (
                      <div className="flex items-center gap-1.5 bg-red-100 text-red-800 px-2.5 py-1 rounded-md text-xs font-bold">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short" }).format(order.deadline)}
                      </div>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="flex-1 py-4 space-y-4">
                  {order.items.map((item) => {
                    const specs = item.specifications as { notes?: string; designMode?: "TEMPLATE" | "CUSTOM"; templateTitle?: string } | null
                    
                    return (
                      <div key={item.id} className="space-y-3">
                        <div className="flex justify-between items-start border-b pb-3">
                          <div>
                            <p className="font-bold text-lg">{item.product.name}</p>
                            <div className="flex flex-wrap items-center gap-2 mt-0.5">
                              <p className="text-sm font-medium text-muted-foreground">
                                Jumlah: <span className="text-foreground font-bold">{item.qty} {item.product.unit}</span>
                              </p>
                              {specs?.designMode === "TEMPLATE" ? (
                                <span className="inline-flex items-center rounded-md bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                  🎨 {specs.templateTitle || "Desain Bawaan"}
                                </span>
                              ) : (
                                <span className="inline-flex items-center rounded-md bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 text-xs font-bold text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                                  📤 Custom Desain
                                </span>
                              )}
                              {item.productionJob?.status === "QC_CHECK" && (
                                <span className="inline-flex items-center rounded-md bg-sky-50 dark:bg-sky-950/40 px-2 py-0.5 text-xs font-bold text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-800">
                                  🔍 Antrean QC
                                </span>
                              )}
                            </div>
                          </div>
                          {item.fileUrl && (
                            <a href={item.fileUrl} download target="_blank" rel="noreferrer" title="Unduh File Desain">
                              <Button size="icon" variant="secondary" className="h-10 w-10 shrink-0 rounded-full">
                                <DownloadCloud className="h-5 w-5 text-primary" />
                              </Button>
                            </a>
                          )}
                        </div>

                        {item.productionJob?.notes && item.productionJob?.status === "QUEUE" && (
                          <div className="bg-red-50 dark:bg-red-950/30 p-3 rounded-md border border-red-300 dark:border-red-900">
                            <p className="text-xs font-bold text-red-800 dark:text-red-400 flex items-center gap-1.5 mb-1">
                              <AlertTriangle className="h-3.5 w-3.5" /> Catatan Revisi / Evaluasi QC:
                            </p>
                            <p className="text-sm text-red-900 dark:text-red-200 leading-relaxed font-semibold">
                              {item.productionJob.notes}
                            </p>
                          </div>
                        )}

                        {specs?.notes ? (
                          <div className="bg-yellow-50 dark:bg-yellow-950/30 p-3 rounded-md border border-yellow-200 dark:border-yellow-900">
                            <p className="text-xs font-bold text-yellow-800 dark:text-yellow-500 flex items-center gap-1.5 mb-1.5">
                              <StickyNote className="h-3.5 w-3.5" /> Instruksi Kerja (SPK):
                            </p>
                            <p className="text-sm text-yellow-900 dark:text-yellow-200 leading-relaxed font-medium">
                              {specs.notes}
                            </p>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground italic">
                            <AlertCircle className="h-4 w-4" /> Tidak ada catatan spesifikasi khusus.
                          </div>
                        )}
                      </div>
                    )
                  })}
                </CardContent>
                
                <CardFooter className="pt-0 pb-5 px-6 mt-auto">
                  {allInQC ? (
                    <div className="w-full py-2.5 px-4 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-center font-bold text-sm border border-blue-200 dark:border-blue-800 flex items-center justify-center gap-2">
                      <Clock className="h-4 w-4" /> Sedang Diperiksa Tim QC
                    </div>
                  ) : (
                    <ProductionButton orderId={order.id} />
                  )}
                </CardFooter>
              </Card>
            )})}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <span className="text-sm text-muted-foreground">
                Menampilkan {orders.length} dari {total} antrean
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
        </>
      )}
    </div>
  )
}