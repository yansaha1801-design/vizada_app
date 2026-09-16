import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardTitle, CardFooter } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft, CheckCircle2, Clock, CreditCard, Printer, PackageCheck, XCircle } from "lucide-react"
import { PaymentModal } from "./payment-modal"
import { CancelButton } from "./cancel-button"
import { VoucherInput } from "./voucher-input"

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/login")

  const resolvedParams = await params
  const orderId = resolvedParams.id
  if (!orderId) redirect("/products")

  const order = await prisma.order.findFirst({
    where: { id: orderId, customerId: session.user.id },
    include: { items: { include: { product: true } } }
  })

  if (!order) redirect("/products")

  const promoUsage = await prisma.promoUsage.findFirst({
    where: { orderId: order.id }
  })

  const discountAmount = promoUsage?.discountAmount || 0
  const finalTotal = order.totalAmount - discountAmount

  const formatRupiah = (price: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(price)
  }

  const steps = [
    { id: "PENDING_PAYMENT", label: "Belum Bayar", icon: CreditCard },
    { id: "WAITING_APPROVAL", label: "Verifikasi", icon: Clock },
    { id: "IN_PRODUCTION", label: "Diproses", icon: Printer },
    { id: "READY_FOR_PICKUP", label: "Siap Ambil", icon: PackageCheck },
    { id: "COMPLETED", label: "Selesai", icon: CheckCircle2 },
  ]

  const getStepIndex = (status: string) => {
    if (status === "CANCELLED") return -1
    return steps.findIndex(s => s.id === status)
  }

  const currentStepIndex = getStepIndex(order.status)
  const isCancelled = order.status === "CANCELLED"

  return (
    <div className="container max-w-3xl mx-auto py-12 px-4 min-h-screen">
      <div className="mb-6">
        <Link href="/orders">
          <Button variant="ghost" className="pl-0 hover:bg-transparent hover:text-primary">
            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Riwayat Pesanan
          </Button>
        </Link>
      </div>

      <Card className="border border-slate-200 dark:border-slate-800 shadow-md rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
        <div className="bg-slate-50 dark:bg-slate-800/60 px-6 py-8 border-b border-slate-200 dark:border-slate-800 text-center relative overflow-hidden">
          <CardTitle className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">Status Pengerjaan</CardTitle>
          <CardDescription className="text-sm mt-1.5 flex items-center justify-center gap-1.5">
            <span>Invoice:</span> <span className="font-bold text-blue-700 dark:text-blue-400 font-mono text-base">{order.orderNumber}</span>
          </CardDescription>

          {!isCancelled ? (
            <div className="relative flex justify-between items-center mt-12 max-w-xl mx-auto px-4">
              <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full z-0"></div>
              <div 
                className="absolute left-4 top-1/2 -translate-y-1/2 h-1.5 bg-blue-700 rounded-full transition-all duration-500 z-0"
                style={{ width: currentStepIndex > 0 ? `calc(${(currentStepIndex / (steps.length - 1)) * 100}% - 2rem)` : '0%' }}
              ></div>
              
              {steps.map((step, index) => {
                const Icon = step.icon
                const isCompleted = currentStepIndex >= index
                const isActive = currentStepIndex === index

                return (
                  <div key={step.id} className="relative flex flex-col items-center gap-3 z-10 bg-transparent px-1">
                    <div className={`h-11 w-11 rounded-full flex items-center justify-center border-2 transition-all duration-200 ${
                      isCompleted 
                        ? "bg-blue-700 border-blue-700 text-white shadow-xs" 
                        : "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-400"
                    } ${isActive ? "ring-4 ring-blue-700/20 scale-105" : ""}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className={`absolute -bottom-7 w-24 text-center text-[10px] font-bold uppercase tracking-wider ${
                      isCompleted ? "text-slate-900 dark:text-white" : "text-slate-400 hidden sm:block"
                    }`}>
                      {step.label}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="mt-8 flex flex-col items-center">
              <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-4">
                <XCircle className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-red-600">Pesanan Dibatalkan</h3>
              <p className="text-sm text-muted-foreground mt-1">Transaksi ini telah dibatalkan dan tidak akan diproses lebih lanjut.</p>
            </div>
          )}
        </div>

        <CardContent className="space-y-6 pt-12 pb-6 px-6 sm:px-10">
          <div className="bg-background p-5 rounded-xl border border-muted-foreground/20 space-y-4 shadow-sm">
            <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-4">Rincian Item</h4>
            <div className="space-y-4">
              {order.items.map((item) => {
                const specs = item.specifications as { notes?: string; designMode?: "TEMPLATE" | "CUSTOM"; templateTitle?: string } | null

                return (
                  <div key={item.id} className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
                    <div className="flex gap-3.5 items-start">
                      {item.fileUrl && (
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-border/70 bg-muted shrink-0 shadow-xs">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.fileUrl}
                            alt="Desain"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-base">{item.product.name}</p>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {item.qty} {item.product.unit} x {formatRupiah(item.product.basePrice)}
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                          {specs?.designMode === "TEMPLATE" ? (
                            <span className="inline-flex items-center rounded-md bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                              🎨 {specs.templateTitle || "Desain Disediakan"}
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-md bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                              📤 Custom Desain (Upload Sendiri)
                            </span>
                          )}

                          {item.fileUrl && (
                            <a
                              href={item.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-primary underline hover:text-primary/80 ml-1"
                            >
                              Lihat Desain Full
                            </a>
                          )}
                        </div>

                        {specs?.notes && (
                          <p className="text-xs text-muted-foreground bg-muted/40 p-2 rounded mt-2 border">
                            <span className="font-semibold text-foreground">Catatan:</span> {specs.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="font-bold text-base whitespace-nowrap self-end sm:self-start">{formatRupiah(item.subtotal)}</span>
                  </div>
                )
              })}
            </div>
            
            <div className="space-y-2 mt-4 pt-4 border-t border-dashed">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatRupiah(order.totalAmount)}</span>
              </div>
              
              {discountAmount > 0 && (
                <div className="flex justify-between items-center text-sm text-green-600">
                  <span>Diskon Voucher</span>
                  <span className="font-bold">- {formatRupiah(discountAmount)}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center bg-primary/5 p-4 rounded-lg mt-4 border border-primary/10">
              <span className="font-bold text-lg">Total Pembayaran</span>
              <span className="font-extrabold text-2xl text-primary">{formatRupiah(finalTotal)}</span>
            </div>

            {order.status === "PENDING_PAYMENT" && discountAmount === 0 && (
              <VoucherInput orderId={order.id} />
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pb-10 px-6 sm:px-10 bg-muted/10 pt-6 border-t">
          {!isCancelled && (
            <PaymentModal orderId={order.id} status={order.status} />
          )}
          {!isCancelled && (
            <CancelButton orderId={order.id} status={order.status} />
          )}
          <Link href="/products" className="w-full">
            <Button variant="outline" className="w-full h-12 text-base font-semibold border-muted-foreground/30">
              Buat Pesanan Lainnya
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}