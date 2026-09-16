"use client"

import { useState } from "react"
import { updateOrderStatus } from "@/app/actions/admin-order"
import { Button, buttonVariants } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { OrderStatus } from "@/app/generated/prisma/client"
import { toast } from "sonner"
import { Eye, DownloadCloud, User, CreditCard, Package, StickyNote, Phone } from "lucide-react"

interface OrderItem {
  id: string
  qty: number
  subtotal: number
  product: {
    name: string
    unit: string
    basePrice: number
  }
  specifications?: {
    notes?: string
    designMode?: "TEMPLATE" | "CUSTOM"
    templateTitle?: string
  }
  fileUrl?: string | null
}

interface OrderData {
  id: string
  orderNumber: string
  status: OrderStatus
  totalAmount: number
  customer: {
    name: string
    email: string
    phone?: string | null
  }
  payment?: {
    method: string
    amount: number
    proofUrl: string
  } | null
  items: OrderItem[]
}

const STATUS_MAP: Record<string, string> = {
  PENDING_PAYMENT: "Menunggu Pembayaran",
  WAITING_APPROVAL: "Menunggu Persetujuan",
  IN_PRODUCTION: "Sedang Diproduksi",
  READY_FOR_PICKUP: "Siap Diambil",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan"
}

export function OrderDetailModal({ order }: { order: OrderData }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<OrderStatus>(order.status)

  const handleStatusChange = async (newStatus: string | null) => {
    if (!newStatus) return

    setIsLoading(true)
    const validStatus = newStatus as OrderStatus
    setStatus(validStatus)
    
    const result = await updateOrderStatus(order.id, validStatus)
    
    if (result?.error) toast.error(result.error)
    else toast.success("Status pesanan diperbarui!")
    
    setIsLoading(false)
  }

  const formatRupiah = (price: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(price)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className={buttonVariants({ variant: "outline", size: "sm", className: "gap-2 cursor-pointer h-8 text-xs" })}>
        <Eye className="h-3.5 w-3.5" /> Detail
      </DialogTrigger>
      
      <DialogContent className="w-[95vw] sm:max-w-[90vw] lg:max-w-4xl max-h-[90vh] flex flex-col overflow-hidden p-0 rounded-xl">
        <DialogHeader className="px-6 py-4 border-b bg-muted/30">
          <DialogTitle className="text-lg font-bold flex items-center justify-between">
            <span className="flex items-center gap-2">
              Detail Pesanan <span className="text-primary">#{order.orderNumber}</span>
            </span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="overflow-y-auto px-6 py-5 flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 space-y-5">
              <div className="bg-card p-4 rounded-lg border shadow-sm">
                <h4 className="text-xs font-bold text-muted-foreground flex items-center gap-2 mb-3 uppercase tracking-wider">
                  <User className="h-3.5 w-3.5" /> Informasi Pelanggan
                </h4>
                <div className="space-y-2">
                  <div>
                    <p className="font-semibold text-sm">{order.customer.name}</p>
                    <p className="text-muted-foreground text-xs">{order.customer.email}</p>
                  </div>
                  {order.customer.phone && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <Phone className="h-3.5 w-3.5" />
                      <span>{order.customer.phone}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-card p-4 rounded-lg border shadow-sm">
                <h4 className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wider">
                  Status Pesanan
                </h4>
                <Select value={status} onValueChange={handleStatusChange} disabled={isLoading}>
                  <SelectTrigger className="h-9 w-full text-sm font-medium">
                    <SelectValue placeholder="Pilih Status">
                      {STATUS_MAP[status]}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING_PAYMENT" className="text-sm">Menunggu Pembayaran</SelectItem>
                    <SelectItem value="WAITING_APPROVAL" className="text-sm">Menunggu Persetujuan</SelectItem>
                    <SelectItem value="IN_PRODUCTION" className="text-sm">Sedang Diproduksi</SelectItem>
                    <SelectItem value="READY_FOR_PICKUP" className="text-sm">Siap Diambil</SelectItem>
                    <SelectItem value="COMPLETED" className="text-sm">Selesai</SelectItem>
                    <SelectItem value="CANCELLED" className="text-sm">Dibatalkan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {order.payment && (
                <div className="bg-blue-50/50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-100 dark:border-blue-900 shadow-sm">
                  <h4 className="text-xs font-bold text-blue-800 dark:text-blue-400 flex items-center gap-2 mb-3 uppercase tracking-wider">
                    <CreditCard className="h-3.5 w-3.5" /> Informasi Pembayaran
                  </h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white dark:bg-slate-900 p-2.5 rounded border border-blue-100 dark:border-blue-800">
                        <p className="text-[10px] text-muted-foreground mb-0.5 uppercase">Metode</p>
                        <p className="font-semibold text-xs line-clamp-1">{order.payment.method}</p>
                      </div>
                      <div className="bg-white dark:bg-slate-900 p-2.5 rounded border border-blue-100 dark:border-blue-800">
                        <p className="text-[10px] text-muted-foreground mb-0.5 uppercase">Nominal</p>
                        <p className="font-semibold text-xs text-blue-600 dark:text-blue-400">{formatRupiah(order.payment.amount)}</p>
                      </div>
                    </div>
                    <a href={order.payment.proofUrl} target="_blank" rel="noreferrer" className="block w-full">
                      <Button className="w-full gap-2 font-medium h-9 text-xs" variant="default">
                        <Eye className="h-3.5 w-3.5" /> Lihat Bukti Transfer
                      </Button>
                    </a>
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-7 flex flex-col h-full space-y-5">
              <div className="bg-card p-4 rounded-lg border shadow-sm flex-1">
                <h4 className="text-xs font-bold text-muted-foreground flex items-center gap-2 mb-4 uppercase tracking-wider">
                  <Package className="h-3.5 w-3.5" /> Rincian Item Cetak
                </h4>
                
                <div className="space-y-3">
                  {order.items.map((item: OrderItem) => (
                    <div key={item.id} className="p-3.5 bg-muted/30 border rounded-lg shadow-sm">
                      <div className="flex justify-between items-start gap-3 mb-2">
                        <div>
                          <p className="font-semibold text-sm leading-tight text-foreground">{item.product.name}</p>
                          <p className="text-xs text-muted-foreground mt-1 font-medium">
                            {item.qty} {item.product.unit} <span className="mx-0.5 text-muted-foreground/50">×</span> {formatRupiah(item.product.basePrice)}
                          </p>
                        </div>
                        <span className="font-bold text-sm whitespace-nowrap bg-background px-2.5 py-1 rounded border">
                          {formatRupiah(item.subtotal)}
                        </span>
                      </div>

                      {item.specifications?.designMode === "TEMPLATE" ? (
                        <div className="mt-2">
                          <span className="inline-flex items-center rounded-md bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                            🎨 Template: {item.specifications.templateTitle || "Desain Disediakan"}
                          </span>
                        </div>
                      ) : (
                        <div className="mt-2">
                          <span className="inline-flex items-center rounded-md bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 text-xs font-bold text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                            📤 Custom Desain (Upload Pelanggan)
                          </span>
                        </div>
                      )}
                      
                      {item.specifications?.notes && (
                        <div className="mt-3 bg-yellow-50/80 dark:bg-yellow-950/20 p-2.5 rounded border border-yellow-200/60 dark:border-yellow-900/50">
                          <p className="text-[10px] font-bold text-yellow-800 dark:text-yellow-500 flex items-center gap-1.5 mb-1 uppercase tracking-wider">
                            <StickyNote className="h-3 w-3" /> Catatan / Instruksi:
                          </p>
                          <p className="text-xs text-yellow-900 dark:text-yellow-200/80 wrap-break-words leading-relaxed">
                            {item.specifications.notes}
                          </p>
                        </div>
                      )}

                      {item.fileUrl && (
                        <div className="mt-3 pt-3 border-t flex flex-col gap-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={item.fileUrl} 
                            alt="Preview Desain" 
                            className="max-h-36 w-full object-contain rounded border bg-muted" 
                            onError={(e) => {
                              // If it's a PDF, hide image element
                              ;(e.target as HTMLElement).style.display = "none"
                            }}
                          />
                          <a href={item.fileUrl} download target="_blank" rel="noreferrer" className="block">
                            <Button size="sm" variant="secondary" className="w-full gap-2 h-8 text-xs font-medium">
                              <DownloadCloud className="h-3.5 w-3.5" /> Unduh / Lihat Desain Full
                            </Button>
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center p-4 bg-primary/5 dark:bg-primary/10 rounded-lg border border-primary/20 shadow-sm mt-auto">
                <span className="font-bold text-primary uppercase tracking-wider text-xs">Total Tagihan</span>
                <span className="font-black text-xl text-primary">{formatRupiah(order.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}