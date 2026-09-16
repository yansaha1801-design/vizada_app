"use client"

import { useState } from "react"
import { createMaterial, adjustStock, updateMaterial, deleteMaterial } from "@/app/actions/inventory"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { toast } from "sonner"
import { Plus, Loader2, ArrowRightLeft, Edit, Trash2 } from "lucide-react"

interface MaterialData {
  id: string
  name: string
  unit: string
  minStock: number
}

export function CreateMaterialModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await createMaterial(formData)

    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success("Bahan baku berhasil ditambahkan")
      setIsOpen(false)
    }
    setIsLoading(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className={buttonVariants({ className: "gap-2 cursor-pointer" })}>
        <Plus className="h-4 w-4" /> Tambah Bahan Baku
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tambah Bahan Baku Baru</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Material</Label>
            <Input id="name" name="name" placeholder="Kertas HVS A4 80gr" required disabled={isLoading} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unit">Satuan</Label>
              <Input id="unit" name="unit" placeholder="Rim / Roll / Liter" required disabled={isLoading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minStock">Batas Minimum</Label>
              <Input id="minStock" name="minStock" type="number" step="0.01" min="0" required disabled={isLoading} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="initialStock">Stok Awal (Opsional)</Label>
            <Input id="initialStock" name="initialStock" type="number" step="0.01" min="0" defaultValue="0" disabled={isLoading} />
          </div>
          <Button type="submit" className="w-full mt-2" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Simpan Data"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function AdjustStockModal({ materialId, materialName, unit }: { materialId: string, materialName: string, unit: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    formData.append("materialId", materialId)
    
    const result = await adjustStock(formData)

    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success("Stok berhasil diperbarui")
      setIsOpen(false)
    }
    setIsLoading(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className={buttonVariants({ variant: "outline", size: "sm", className: "h-8 gap-2 cursor-pointer" })}>
        <ArrowRightLeft className="h-3.5 w-3.5" /> Penyesuaian
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Penyesuaian Stok: {materialName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="type">Jenis Aktivitas</Label>
            <Select name="type" required disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih jenis aktivitas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IN">Stok Masuk (Restock)</SelectItem>
                <SelectItem value="OUT">Stok Keluar (Pemakaian / Rusak)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="qty">Jumlah ({unit})</Label>
            <Input id="qty" name="qty" type="number" step="0.01" min="0.1" required disabled={isLoading} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Catatan Keterangan</Label>
            <Input id="notes" name="notes" placeholder="Contoh: Beli dari supplier A" required disabled={isLoading} />
          </div>
          <Button type="submit" className="w-full mt-2" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Simpan Perubahan"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function EditMaterialModal({ material }: { material: MaterialData }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    formData.append("id", material.id)
    
    const result = await updateMaterial(formData)

    if (result?.error) toast.error(result.error)
    else {
      toast.success("Data bahan baku diperbarui")
      setIsOpen(false)
    }
    setIsLoading(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className={buttonVariants({ variant: "ghost", size: "icon", className: "h-8 w-8 cursor-pointer" })}>
        <Edit className="h-4 w-4 text-blue-600" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Bahan Baku</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Material</Label>
            <Input id="name" name="name" defaultValue={material.name} required disabled={isLoading} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unit">Satuan</Label>
              <Input id="unit" name="unit" defaultValue={material.unit} required disabled={isLoading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minStock">Batas Minimum</Label>
              <Input id="minStock" name="minStock" type="number" step="0.01" min="0" defaultValue={material.minStock} required disabled={isLoading} />
            </div>
          </div>
          <Button type="submit" className="w-full mt-2" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Simpan Perubahan"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function DeleteMaterialModal({ materialId, materialName }: { materialId: string, materialName: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async () => {
    setIsLoading(true)
    const formData = new FormData()
    formData.append("id", materialId)
    
    const result = await deleteMaterial(formData)

    if (result?.error) toast.error(result.error)
    else {
      toast.success("Bahan baku dihapus")
      setIsOpen(false)
    }
    setIsLoading(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className={buttonVariants({ variant: "ghost", size: "icon", className: "h-8 w-8 cursor-pointer hover:bg-red-100" })}>
        <Trash2 className="h-4 w-4 text-red-600" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Hapus Bahan Baku</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            Apakah Anda yakin ingin menghapus <strong>{materialName}</strong>? Semua riwayat stok untuk bahan baku ini juga akan ikut terhapus secara permanen.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>Batal</Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Ya, Hapus"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}