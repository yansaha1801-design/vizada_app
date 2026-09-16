"use client"

import { useState } from "react"
import { cancelOrder } from "@/app/actions/customer-order"
import { Button, buttonVariants } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"
import { Loader2, XCircle } from "lucide-react"

export function CancelButton({ orderId, status }: { orderId: string, status: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  if (status !== "PENDING_PAYMENT") return null

  const handleCancel = async () => {
    setIsLoading(true)
    const result = await cancelOrder(orderId)

    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success("Pesanan berhasil dibatalkan")
      setIsOpen(false)
    }
    setIsLoading(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className={buttonVariants({ variant: "destructive", className: "w-full h-12 text-base font-semibold bg-red-50 text-red-600 hover:bg-red-100 border-0 shadow-none cursor-pointer" })}>
        <XCircle className="mr-2 h-4 w-4" /> Batalkan Pesanan
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Batalkan Pesanan</DialogTitle>
          <DialogDescription>
            Apakah Anda yakin ingin membatalkan pesanan ini? Tindakan ini tidak dapat diurungkan.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4 gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
            Tutup
          </Button>
          <Button variant="destructive" onClick={handleCancel} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Ya, Batalkan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}