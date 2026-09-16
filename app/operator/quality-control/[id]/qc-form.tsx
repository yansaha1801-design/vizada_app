"use client"

import { useState } from "react"
import { submitQCCheck } from "@/app/actions/quality-control"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Camera, UploadCloud, X, Loader2 } from "lucide-react"

export function QCForm({ productionJobId }: { productionJobId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [checklist, setChecklist] = useState([
    { name: "Kualitas Warna (Sesuai Proof)", status: "PASSED", notes: "" },
    { name: "Presisi Potongan / Finishing", status: "PASSED", notes: "" },
    { name: "Kebersihan (Bebas Noda/Cacat)", status: "PASSED", notes: "" },
  ])
  const [generalNotes, setGeneralNotes] = useState("")

  const updateChecklist = (index: number, field: string, value: string) => {
    const newChecklist = [...checklist]
    newChecklist[index] = { ...newChecklist[index], [field]: value }
    setChecklist(newChecklist)
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Ukuran file foto maksimal 5MB")
        return
      }
      setPhotoFile(file)
      const url = URL.createObjectURL(file)
      setPhotoPreview(url)
    }
  }

  const removePhoto = () => {
    setPhotoFile(null)
    if (photoPreview) URL.revokeObjectURL(photoPreview)
    setPhotoPreview(null)
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData()
    formData.append("productionJobId", productionJobId)
    formData.append("checklist", JSON.stringify(checklist))
    formData.append("notes", generalNotes)
    if (photoFile) {
      formData.append("photo", photoFile)
    }

    const result = await submitQCCheck(formData)
    setLoading(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Hasil Quality Control & foto bukti berhasil disimpan!")
      router.push("/operator/quality-control")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Form Checklist Quality Control</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-4">
            {checklist.map((item, index) => (
              <div key={index} className="grid grid-cols-1 sm:grid-cols-12 gap-4 p-4 border rounded-lg items-start">
                <div className="sm:col-span-4">
                  <p className="font-medium">{item.name}</p>
                </div>
                <div className="sm:col-span-3">
                  <Select 
                    value={item.status} 
                    onValueChange={(val) => updateChecklist(index, "status", val || "PASSED")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PASSED">Lolos</SelectItem>
                      <SelectItem value="NEEDS_REWORK">Perbaikan</SelectItem>
                      <SelectItem value="REJECTED">Ditolak</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-5">
                  <Textarea 
                    placeholder="Catatan (opsional)" 
                    value={item.notes}
                    onChange={(e) => updateChecklist(index, "notes", e.target.value)}
                    className="min-h-10 resize-y"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <label className="font-medium text-sm flex items-center gap-1.5">
              <Camera className="h-4 w-4 text-primary" /> Foto Bukti Hasil Cetak (Opsional)
            </label>
            {photoPreview ? (
              <div className="relative w-40 h-40 rounded-lg overflow-hidden border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photoPreview} alt="Preview QC" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={removePhoto}
                  className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-28 px-4 transition bg-muted/10 border border-dashed rounded-lg border-muted-foreground/30 hover:bg-muted/20 hover:border-primary/50 cursor-pointer">
                <div className="flex flex-col items-center justify-center">
                  <UploadCloud className="w-6 h-6 mb-1 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">Klik untuk upload foto QC</span> (JPG / PNG max 5MB)
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  className="hidden"
                  onChange={handlePhotoChange}
                  disabled={loading}
                />
              </label>
            )}
          </div>

          <div className="space-y-2">
            <label className="font-medium text-sm">Catatan Keseluruhan (Opsional)</label>
            <Textarea 
              placeholder="Berikan ringkasan jika ada hal yang perlu diperhatikan..."
              value={generalNotes}
              onChange={(e) => setGeneralNotes(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan Hasil QC...
              </>
            ) : (
              "Simpan Hasil QC"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
