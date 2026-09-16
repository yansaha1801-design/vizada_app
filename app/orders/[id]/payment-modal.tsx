"use client"

import { useState } from "react"
import { uploadPaymentProof } from "@/app/actions/payment"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"
import { CreditCard, Loader2, UploadCloud, Landmark, FileImage, Clock, CheckCircle2 } from "lucide-react"

export function PaymentModal({ orderId, status }: { orderId: string, status: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [fileName, setFileName] = useState<string>("")

  if (status === "WAITING_APPROVAL") {
    return (
      <div className="w-full h-11 flex items-center justify-center gap-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 text-sm font-semibold">
        <Clock className="h-4 w-4" /> Bukti Pembayaran Sedang Diverifikasi Admin
      </div>
    )
  }

  if (status === "IN_PRODUCTION" || status === "READY_FOR_PICKUP" || status === "COMPLETED") {
    return (
      <div className="w-full h-11 flex items-center justify-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-sm font-semibold">
        <CheckCircle2 className="h-4 w-4" /> Pembayaran Terverifikasi (Lunas)
      </div>
    )
  }

  if (status !== "PENDING_PAYMENT") {
    return null
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    formData.append("orderId", orderId)

    const result = await uploadPaymentProof(formData)

    if (result?.error) {
      toast.error(result.error)
      setIsLoading(false)
    } else if (result?.success) {
      toast.success("Bukti pembayaran berhasil diunggah!")
      setIsOpen(false)
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className={buttonVariants({ className: "w-full h-10 text-sm font-semibold cursor-pointer rounded-lg shadow-sm" })}>
        <CreditCard className="mr-2 h-4 w-4" /> Konfirmasi Pembayaran
      </DialogTrigger>
      
      <DialogContent className="w-[95vw] sm:max-w-md p-0 overflow-hidden rounded-xl">
        <DialogHeader className="px-6 py-5 border-b bg-muted/30">
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            Konfirmasi Pembayaran
          </DialogTitle>
          <DialogDescription className="text-xs mt-1.5">
            Silakan transfer sesuai nominal tagihan dan unggah bukti transfer.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          <div className="space-y-2.5">
            <Label className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
              <Landmark className="h-3.5 w-3.5 text-primary" /> Bank Tujuan
            </Label>
            <Select name="method" required disabled={isLoading}>
              <SelectTrigger className="w-full h-10 text-sm rounded-lg border-muted-foreground/20 bg-muted/10">
                <SelectValue placeholder="Pilih rekening tujuan" />
              </SelectTrigger>
              <SelectContent className="rounded-lg w-full">
                <SelectItem value="BCA - 1234567890 (Vizada)" className="py-2 text-sm">
                  <span className="font-semibold text-blue-600 dark:text-blue-400 mr-1.5">BCA</span> 
                  1234567890 a.n Vizada
                </SelectItem>
                <SelectItem value="BRI - 0987654321 (Vizada)" className="py-2 text-sm">
                  <span className="font-semibold text-blue-600 dark:text-blue-400 mr-1.5">BRI</span> 
                  0987654321 a.n Vizada
                </SelectItem>
                <SelectItem value="Mandiri - 1122334455 (Vizada)" className="py-2 text-sm">
                  <span className="font-semibold text-blue-600 dark:text-blue-400 mr-1.5">Mandiri</span> 
                  1122334455 a.n Vizada
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2.5">
            <Label htmlFor="file" className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
              <FileImage className="h-3.5 w-3.5 text-primary" /> Unggah Bukti Transfer
            </Label>
            
            <div className="relative group">
              <div className="flex flex-col items-center justify-center w-full h-24 px-4 transition bg-muted/10 border border-dashed rounded-lg border-muted-foreground/30 hover:bg-muted/20 hover:border-primary/50 group-focus-within:border-primary/50 group-focus-within:ring-1 group-focus-within:ring-primary/50">
                <div className="flex flex-col items-center justify-center pt-4 pb-4">
                  <UploadCloud className="w-6 h-6 mb-2 text-muted-foreground group-hover:text-primary transition-colors" />
                  <p className="mb-1 text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">Klik unggah</span> atau seret file
                  </p>
                  <p className="text-[10px] text-muted-foreground/70">JPG / PNG (Maks. 5MB)</p>
                  {fileName && (
                    <p className="mt-1.5 text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full truncate max-w-[200px]">
                      {fileName}
                    </p>
                  )}
                </div>
                <Input 
                  id="file" 
                  name="file" 
                  type="file" 
                  accept="image/png, image/jpeg, image/jpg"
                  required 
                  disabled={isLoading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      if (file.size > 5 * 1024 * 1024) {
                        toast.error("Ukuran bukti transfer melebihi batas maksimal 5MB! Silakan gunakan file yang lebih kecil.")
                        e.target.value = ""
                        setFileName("")
                        return
                      }
                      setFileName(file.name)
                    }
                  }}
                />
              </div>
            </div>
          </div>

          <div className="pt-3 mt-1 border-t">
            <Button type="submit" className="w-full h-10 text-sm font-semibold rounded-lg" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mengunggah...
                </>
              ) : (
                "Kirim Pembayaran"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}