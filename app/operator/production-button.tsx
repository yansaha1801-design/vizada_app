"use client"

import { useState } from "react"
import { finishProduction } from "@/app/actions/production"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { CheckCircle2 } from "lucide-react"

export function ProductionButton({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false)

  async function onClick() {
    setLoading(true)
    const formData = new FormData()
    formData.append("orderId", orderId)
    
    const result = await finishProduction(formData)
    setLoading(false)

    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success("Produksi selesai dan dikirim ke antrean QC")
    }
  }

  return (
    <div className="w-full">
      <Button 
        className="w-full font-bold bg-purple-600 hover:bg-purple-700 text-white" 
        onClick={onClick}
        disabled={loading}
      >
        <CheckCircle2 className="mr-2 h-4 w-4" />
        {loading ? "Memproses..." : "Selesai Cetak"}
      </Button>
    </div>
  )
}