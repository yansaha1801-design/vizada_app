"use client"

import { useState } from "react"
import { createScheduleEntry } from "@/app/actions/production-schedule"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"
import { Calendar, Loader2, Wrench, User } from "lucide-react"

interface MachineOption {
  id: string
  name: string
  status: string
}

interface OperatorOption {
  id: string
  name: string
}

interface AssignScheduleModalProps {
  productionJobId: string
  productName: string
  orderNumber: string
  currentMachineId?: string | null
  currentOperatorId?: string | null
  defaultDate?: string
  machines: MachineOption[]
  operators: OperatorOption[]
}

export function AssignScheduleModal({
  productionJobId,
  productName,
  orderNumber,
  currentMachineId,
  currentOperatorId,
  defaultDate,
  machines,
  operators,
}: AssignScheduleModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [machineId, setMachineId] = useState(currentMachineId || "")
  const [operatorId, setOperatorId] = useState(currentOperatorId || "")
  const [priority, setPriority] = useState("NORMAL")
  const [scheduledDate, setScheduledDate] = useState(
    defaultDate || new Date().toISOString().split("T")[0]
  )
  const [notes, setNotes] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData()
    formData.append("productionJobId", productionJobId)
    formData.append("machineId", machineId)
    formData.append("operatorId", operatorId)
    formData.append("scheduledDate", scheduledDate)
    formData.append("priority", priority)
    formData.append("notes", notes)

    const result = await createScheduleEntry(formData)
    setIsLoading(false)

    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success("Jadwal dan alokasi mesin berhasil disimpan!")
      setIsOpen(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-md bg-purple-100 text-purple-800 hover:bg-purple-200 transition-colors cursor-pointer">
        <Calendar className="h-3.5 w-3.5" />
        {currentMachineId ? "Ubah Jadwal & Mesin" : "Alokasikan Jadwal"}
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-600" />
            Alokasi Mesin & Jadwal
          </DialogTitle>
          <DialogDescription className="text-xs">
            Atur jadwal pengerjaan untuk <span className="font-semibold text-foreground">{productName}</span> ({orderNumber}).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label className="text-xs font-semibold flex items-center gap-1.5">
              <Wrench className="h-3.5 w-3.5 text-muted-foreground" /> Pilih Mesin Cetak
            </Label>
            <Select value={machineId} onValueChange={(val) => setMachineId(val || "")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih mesin cetak..." />
              </SelectTrigger>
              <SelectContent>
                {machines.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name} ({m.status === "AVAILABLE" ? "Tersedia" : m.status === "IN_USE" ? "Sedang Digunakan" : "Maintenance"})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-muted-foreground" /> Tugaskan Operator
            </Label>
            <Select value={operatorId} onValueChange={(val) => setOperatorId(val || "")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih operator..." />
              </SelectTrigger>
              <SelectContent>
                {operators.map((op) => (
                  <SelectItem key={op.id} value={op.id}>
                    {op.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Tanggal Mulai Cetak</Label>
              <Input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">Prioritas</Label>
              <Select value={priority} onValueChange={(val) => setPriority(val || "NORMAL")}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="URGENT">Urgent (Segera)</SelectItem>
                  <SelectItem value="NORMAL">Normal</SelectItem>
                  <SelectItem value="LOW">Low (Santai)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold">Catatan Alokasi (Opsional)</Label>
            <Textarea
              placeholder="Instruksi khusus penjadwalan..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="resize-none h-18 text-xs"
              disabled={isLoading}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...
              </>
            ) : (
              "Simpan Jadwal Produksi"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
