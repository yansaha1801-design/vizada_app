"use client"

import { useState } from "react"
import { createPromotion, updatePromotion, deletePromotion, generateVoucherCodes, createCustomVoucher, deleteVoucherCode } from "@/app/actions/promotion"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { toast } from "sonner"
import { PromoType } from "@/app/generated/prisma/client"
import { Plus, Loader2, Edit, Trash2, Ticket } from "lucide-react"

interface Promotion {
  id: string
  name: string
  type: string
  value: number
  startDate: Date
  endDate: Date
  active: boolean
}

export function CreatePromotionModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await createPromotion(formData)

    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success("Promosi berhasil dibuat")
      setIsOpen(false)
      ;(e.target as HTMLFormElement).reset()
    }
    setIsLoading(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className={buttonVariants({ className: "gap-2 cursor-pointer" })}>
        <Plus className="h-4 w-4" /> Buat Promosi
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Buat Promosi Baru</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Promosi</Label>
            <Input id="name" name="name" placeholder="Diskon Akhir Tahun" required disabled={isLoading} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Tipe Promosi</Label>
            <Select name="type" required>
              <SelectTrigger id="type"><SelectValue placeholder="Pilih tipe" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="DISKON_PERSEN">Diskon Persen (%)</SelectItem>
                <SelectItem value="DISKON_NOMINAL">Diskon Nominal (Rp)</SelectItem>
                <SelectItem value="VOUCHER">Voucher</SelectItem>
                <SelectItem value="BUNDLING">Bundling</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="value">Nilai</Label>
            <Input id="value" name="value" type="number" step="0.01" min="0" placeholder="0" required disabled={isLoading} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Tanggal Mulai</Label>
              <Input id="startDate" name="startDate" type="date" required disabled={isLoading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Tanggal Akhir</Label>
              <Input id="endDate" name="endDate" type="date" required disabled={isLoading} />
            </div>
          </div>
          <Button type="submit" className="w-full mt-2" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Buat Promosi"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function EditPromotionForm({ promo, onClose }: { promo: Promotion; onClose: () => void }) {
  const [isLoading, setIsLoading] = useState(false)

  const [name, setName] = useState(promo.name)
  const [type, setType] = useState(promo.type)
  const [value, setValue] = useState(promo.value.toString())
  const [startDate, setStartDate] = useState(new Date(promo.startDate).toISOString().split("T")[0])
  const [endDate, setEndDate] = useState(new Date(promo.endDate).toISOString().split("T")[0])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await updatePromotion(promo.id, formData)

    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success("Promosi berhasil diperbarui")
      onClose()
    }
    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nama Promosi</Label>
        <Input id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} required disabled={isLoading} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="type">Tipe Promosi</Label>
        <Select name="type" value={type} onValueChange={(val) => setType(val as PromoType)} required>
          <SelectTrigger id="type"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="DISKON_PERSEN">Diskon Persen (%)</SelectItem>
            <SelectItem value="DISKON_NOMINAL">Diskon Nominal (Rp)</SelectItem>
            <SelectItem value="VOUCHER">Voucher</SelectItem>
            <SelectItem value="BUNDLING">Bundling</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="value">Nilai</Label>
        <Input id="value" name="value" type="number" step="0.01" min="0" value={value} onChange={(e) => setValue(e.target.value)} required disabled={isLoading} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Tanggal Mulai</Label>
          <Input id="startDate" name="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required disabled={isLoading} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">Tanggal Akhir</Label>
          <Input id="endDate" name="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required disabled={isLoading} />
        </div>
      </div>
      <Button type="submit" className="w-full mt-2" disabled={isLoading}>
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Perbarui Promosi"}
      </Button>
    </form>
  )
}

export function EditPromotionModal({ promo }: { promo: Promotion }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className="text-blue-600 hover:text-blue-800">
        <Edit className="h-4 w-4" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Promosi</DialogTitle>
        </DialogHeader>
        {isOpen && <EditPromotionForm promo={promo} onClose={() => setIsOpen(false)} />}
      </DialogContent>
    </Dialog>
  )
}

export function DeletePromotionModal({ promoId }: { promoId: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async () => {
    setIsLoading(true)
    const result = await deletePromotion(promoId)

    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success("Promosi berhasil dihapus")
      setIsOpen(false)
    }
    setIsLoading(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className="text-red-600 hover:text-red-800">
        <Trash2 className="h-4 w-4" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Hapus Promosi</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">Apakah Anda yakin ingin menghapus promosi ini?</p>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Batal</Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Hapus"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function DeleteVoucherModal({ voucherId, code }: { voucherId: string; code: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async () => {
    setIsLoading(true)
    const result = await deleteVoucherCode(voucherId)
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success("Kode berhasil dihapus")
      setIsOpen(false)
    }
    setIsLoading(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className={buttonVariants({ variant: "ghost", size: "sm", className: "h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-100 cursor-pointer" })}>
        <Trash2 className="h-4 w-4" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Hapus Kode Voucher</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Apakah Anda yakin ingin menghapus kode voucher <span className="font-mono font-bold text-foreground">{code}</span>?
        </p>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
            Batal
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Hapus"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface VoucherItem {
  id: string
  code: string
  used: boolean
  usedAt?: Date | string | null
  createdAt?: Date | string
}

export function ManageVoucherModal({ promo, vouchers }: { promo: Promotion; vouchers: VoucherItem[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [customCode, setCustomCode] = useState("")
  const [qty, setQty] = useState("1")

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const result = await createCustomVoucher(promo.id, customCode)
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success("Kode voucher berhasil dibuat")
      setCustomCode("")
    }
    setIsLoading(false)
  }

  const handleGenerateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const result = await generateVoucherCodes(promo.id, parseInt(qty))
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success(`${result.quantity} kode berhasil digenerate`)
      setQty("1")
    }
    setIsLoading(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className="text-green-600 hover:text-green-800" title="Kelola Voucher">
        <Ticket className="h-4 w-4" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Kelola Kode Voucher</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 mt-2">
          <form onSubmit={handleCustomSubmit} className="flex gap-2 items-end">
            <div className="space-y-2 flex-1">
              <Label>Buat Kode Kustom</Label>
              <Input 
                placeholder="Misal: PROMO2026" 
                value={customCode} 
                onChange={(e) => setCustomCode(e.target.value.toUpperCase())} 
                required 
                disabled={isLoading}
              />
            </div>
            <Button type="submit" disabled={isLoading || !customCode}>Buat</Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Atau</span></div>
          </div>

          <form onSubmit={handleGenerateSubmit} className="flex gap-2 items-end">
            <div className="space-y-2 flex-1">
              <Label>Generate Kode Acak</Label>
              <Input 
                type="number" 
                min="1" 
                max="100" 
                value={qty} 
                onChange={(e) => setQty(e.target.value)} 
                required 
                disabled={isLoading}
              />
            </div>
            <Button type="submit" variant="secondary" disabled={isLoading}>Generate Acak</Button>
          </form>

          <div className="space-y-2 border-t pt-4">
            <Label>Daftar Kode ({vouchers.length})</Label>
            <div className="max-h-50 overflow-y-auto border rounded-md p-2 space-y-2">
              {vouchers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Belum ada kode untuk promo ini.</p>
              ) : (
                vouchers.map((v) => (
                  <div key={v.id} className="flex justify-between items-center bg-muted/50 p-2 rounded-md border">
                    <div>
                      <span className="font-mono font-bold">{v.code}</span>
                      {v.used && <span className="ml-2 text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded uppercase font-bold">Terpakai</span>}
                    </div>
                    <DeleteVoucherModal voucherId={v.id} code={v.code} />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}