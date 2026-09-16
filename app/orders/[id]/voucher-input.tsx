"use client"

import { useState } from "react"
import { redeemVoucher } from "@/app/actions/promotion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Tag, Loader2 } from "lucide-react"

export function VoucherInput({ orderId }: { orderId: string }) {
  const [code, setCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleApplyVoucher = async () => {
    if (!code) {
      toast.error("Masukkan kode voucher")
      return
    }
    
    setIsLoading(true)
    const result = await redeemVoucher(code, orderId)
    
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success("Voucher berhasil digunakan!")
      setCode("")
    }
    setIsLoading(false)
  }

  return (
    <div className="flex gap-2 mt-4">
      <Input 
        placeholder="Masukkan Kode Voucher..." 
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        disabled={isLoading}
      />
      <Button onClick={handleApplyVoucher} disabled={isLoading || !code} variant="secondary">
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Tag className="mr-2 h-4 w-4" />}
        Gunakan
      </Button>
    </div>
  )
}