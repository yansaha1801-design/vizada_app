"use client"

import { useState } from "react"
import { createMachine, updateMachine, deleteMachine, logMaintenance, createMaintenanceSchedule } from "@/app/actions/machine"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { toast } from "sonner"
import { Plus, Loader2, Edit, Trash2 } from "lucide-react"

interface Machine {
  id: string
  name: string
  status: string
}

export function CreateMachineModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await createMachine(formData)

    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success("Mesin berhasil ditambahkan")
      setIsOpen(false)
      ;(e.target as HTMLFormElement).reset()
    }
    setIsLoading(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className={buttonVariants({ className: "gap-2 cursor-pointer" })}>
        <Plus className="h-4 w-4" /> Tambah Mesin
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tambah Mesin Cetak</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Mesin</Label>
            <Input
              id="name"
              name="name"
              placeholder="Mesin Cetak UV 100x60"
              required
              disabled={isLoading}
            />
          </div>
          <Button type="submit" className="w-full mt-2" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Simpan Mesin"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function EditMachineModal({ machine }: { machine: Machine }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await updateMachine(machine.id, formData)

    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success("Mesin berhasil diperbarui")
      setIsOpen(false)
    }
    setIsLoading(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className="text-blue-600 hover:text-blue-800">
        <Edit className="h-4 w-4" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Mesin</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Mesin</Label>
            <Input
              id="name"
              name="name"
              defaultValue={machine.name}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select name="status" defaultValue={machine.status} required>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AVAILABLE">Tersedia</SelectItem>
                <SelectItem value="IN_USE">Digunakan</SelectItem>
                <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full mt-2" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Perbarui Mesin"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function DeleteMachineModal({ machineId }: { machineId: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async () => {
    setIsLoading(true)
    const result = await deleteMachine(machineId)

    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success("Mesin berhasil dihapus")
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
          <DialogTitle>Hapus Mesin</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">Apakah Anda yakin ingin menghapus mesin ini?</p>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Batal
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Hapus"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function LogMaintenanceModal({ machineId }: { machineId: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    formData.append("machineId", machineId)
    const result = await logMaintenance(formData)

    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success("Catatan perawatan berhasil disimpan")
      setIsOpen(false)
    }
    setIsLoading(false)
  }

  return (
    <>
      <Button variant="outline" size="sm" className="h-8" onClick={() => setIsOpen(true)}>Catat Perawatan</Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Catat Perawatan Mesin</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="type">Tipe Perawatan</Label>
            <Select name="type" required>
              <SelectTrigger>
                <SelectValue placeholder="Pilih tipe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="RUTIN">Rutin</SelectItem>
                <SelectItem value="PERBAIKAN">Perbaikan</SelectItem>
                <SelectItem value="INSPEKSI">Inspeksi</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea name="description" placeholder="Ganti oli, ganti part X..." required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cost">Biaya (Opsional)</Label>
            <Input name="cost" type="number" min="0" placeholder="0" />
          </div>
          <Button type="submit" className="w-full mt-2" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Simpan Catatan"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
    </>
  )
}

export function ScheduleMaintenanceModal({ machineId }: { machineId: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    formData.append("machineId", machineId)
    const result = await createMaintenanceSchedule(formData)

    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success("Jadwal perawatan berhasil dibuat")
      setIsOpen(false)
    }
    setIsLoading(false)
  }

  return (
    <>
      <Button variant="secondary" size="sm" className="h-8" onClick={() => setIsOpen(true)}>Buat Jadwal</Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Jadwal Perawatan Baru</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="nextDue">Tanggal Jadwal</Label>
            <Input name="nextDue" type="date" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="interval">Interval (Hari)</Label>
            <Input name="interval" type="number" min="1" defaultValue="30" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Catatan (Opsional)</Label>
            <Textarea name="notes" placeholder="Perawatan rutin bulan depan..." />
          </div>
          <Button type="submit" className="w-full mt-2" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Simpan Jadwal"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
    </>
  )
}
