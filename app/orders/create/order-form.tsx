"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createOrder } from "@/app/actions/order"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { ArrowLeft, CheckCircle2, Eye, LayoutGrid, Loader2, Sparkles, UploadCloud } from "lucide-react"
import Link from "next/link"

interface ProductDesign {
  id: string
  title: string
  imageUrl: string
}

interface ProductProps {
  id: string
  name: string
  basePrice: number
  unit: string
  imageUrl?: string | null
  category: { name: string }
  designs?: ProductDesign[]
}

export default function OrderForm({ product }: { product: ProductProps }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [qty, setQty] = useState(1)

  const hasTemplates = Boolean(product.designs && product.designs.length > 0)
  const [designMode, setDesignMode] = useState<"TEMPLATE" | "CUSTOM">(
    hasTemplates ? "TEMPLATE" : "CUSTOM"
  )
  const [selectedDesignId, setSelectedDesignId] = useState<string>(
    product.designs?.[0]?.id || ""
  )
  const [previewImage, setPreviewImage] = useState<{ title: string; url: string } | null>(null)
  const [customFilePreview, setCustomFilePreview] = useState<string | null>(null)

  const formatRupiah = (price: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(price)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formElement = e.currentTarget
    const formData = new FormData(formElement)

    if (designMode === "TEMPLATE") {
      if (!selectedDesignId) {
        toast.error("Silakan pilih salah satu template desain yang disediakan")
        setIsLoading(false)
        return
      }
      formData.set("designMode", "TEMPLATE")
      formData.set("templateDesignId", selectedDesignId)
    } else {
      formData.set("designMode", "CUSTOM")
      const file = formData.get("file") as File | null
      if (!file || file.size === 0) {
        toast.error("Silakan upload file desain Anda untuk mode Custom Desain")
        setIsLoading(false)
        return
      }
    }

    const specObj = {
      notes: (formData.get("notes") as string) || "",
      designMode,
    }

    formData.append("specifications", JSON.stringify(specObj))
    formData.append("productId", product.id)

    const result = await createOrder(formData)

    if (result?.error) {
      toast.error(result.error)
      setIsLoading(false)
    } else if (result?.success) {
      toast.success("Pesanan berhasil dibuat!")
      router.push(`/orders/${result.orderId}`)
    }
  }

  return (
    <div className="space-y-6">
      <Link href="/products">
        <Button variant="ghost" className="pl-0 hover:bg-transparent hover:text-primary">
          <ArrowLeft className="mr-2 h-4 w-4" /> Batal & Kembali
        </Button>
      </Link>

      <Card className="border-0 shadow-xl bg-background rounded-2xl overflow-hidden">
        <CardHeader className="bg-muted/30 border-b pb-6">
          <div className="flex flex-wrap justify-between items-start gap-2">
            <div>
              <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-2">
                {product.category.name}
              </span>
              <CardTitle className="text-3xl font-black tracking-tight">{product.name}</CardTitle>
              <CardDescription className="mt-1 text-sm">
                Lengkapi spesifikasi pemesanan dan tentukan pilihan desain yang Anda inginkan.
              </CardDescription>
            </div>
            <div className="text-right">
              <span className="text-xs text-muted-foreground">Harga Layanan</span>
              <p className="text-2xl font-black text-primary">
                {formatRupiah(product.basePrice)} <span className="text-xs font-normal text-muted-foreground">/ {product.unit}</span>
              </p>
            </div>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-8 pt-6">
            {/* Bagian Pilihan Desain */}
            <div className="space-y-4">
              <div>
                <Label className="text-base font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Opsi Desain Cetak
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Pilih apakah Anda ingin menggunakan template yang sudah kami sediakan atau mengunggah desain Anda sendiri.
                </p>
              </div>

              {/* Mode Switcher */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDesignMode("TEMPLATE")}
                  className={`flex items-start gap-3.5 p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                    designMode === "TEMPLATE"
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover:border-muted-foreground/40 bg-background"
                  }`}
                >
                  <div className={`p-2.5 rounded-lg ${designMode === "TEMPLATE" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    <LayoutGrid className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm">Pilih Desain Disediakan</span>
                      {designMode === "TEMPLATE" && (
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Pilih dari template desain siap pakai yang sudah disediakan oleh tim Vizada.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setDesignMode("CUSTOM")}
                  className={`flex items-start gap-3.5 p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                    designMode === "CUSTOM"
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover:border-muted-foreground/40 bg-background"
                  }`}
                >
                  <div className={`p-2.5 rounded-lg ${designMode === "CUSTOM" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    <UploadCloud className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm">Custom Desain (Upload Sendiri)</span>
                      {designMode === "CUSTOM" && (
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Unggah file desain milik Anda sendiri dalam format JPG, PNG, atau PDF.
                    </p>
                  </div>
                </button>
              </div>

              {/* Konten Pilihan 1: Desain Disediakan */}
              {designMode === "TEMPLATE" && (
                <div className="p-4 rounded-xl border bg-muted/20 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-foreground">
                      Katalog Desain Tersedia ({product.designs?.length || 0})
                    </span>
                    <span className="text-xs text-muted-foreground">Klik desain untuk memilih</span>
                  </div>

                  {!hasTemplates ? (
                    <div className="text-center py-8 px-4 border border-dashed rounded-lg bg-background">
                      <LayoutGrid className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm font-semibold">Belum ada template desain untuk layanan ini</p>
                      <p className="text-xs text-muted-foreground mt-1 mb-3">
                        Admin belum mengunggah template desain siap pakai untuk produk ini.
                      </p>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setDesignMode("CUSTOM")}
                      >
                        Beralih ke Custom Desain
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                      {product.designs?.map((design) => {
                        const isSelected = selectedDesignId === design.id

                        return (
                          <div
                            key={design.id}
                            onClick={() => setSelectedDesignId(design.id)}
                            className={`group relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                              isSelected
                                ? "border-primary ring-2 ring-primary/20 shadow-md scale-[1.02] bg-primary/5"
                                : "border-border/80 hover:border-muted-foreground/50 bg-background"
                            }`}
                          >
                            <div className="relative aspect-square w-full overflow-hidden bg-muted">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={design.imageUrl}
                                alt={design.title}
                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                              />

                              {/* Preview Button */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setPreviewImage({ title: design.title, url: design.imageUrl })
                                }}
                                className="absolute bottom-2 right-2 p-1.5 rounded-full bg-background/80 hover:bg-background text-foreground shadow-sm backdrop-blur-sm transition-all"
                                title="Lihat ukuran penuh"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </button>

                              {isSelected && (
                                <div className="absolute top-2 left-2 bg-primary text-primary-foreground p-1 rounded-full shadow">
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                </div>
                              )}
                            </div>

                            <div className="p-2.5">
                              <p className={`text-xs font-semibold line-clamp-1 ${isSelected ? "text-primary font-bold" : "text-foreground"}`}>
                                {design.title}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Konten Pilihan 2: Custom Upload */}
              {designMode === "CUSTOM" && (
                <div className="p-4 rounded-xl border bg-muted/20 space-y-3">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="file" className="text-sm font-bold">
                      Upload File Desain Anda
                    </Label>
                    <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                      Maks. 10MB
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <Input
                        id="file"
                        name="file"
                        type="file"
                        accept="image/png, image/jpeg, image/jpg, application/pdf"
                        required={designMode === "CUSTOM"}
                        disabled={isLoading}
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            if (file.size > 10 * 1024 * 1024) {
                              toast.error("Ukuran file desain melebihi batas maksimal 10MB! Silakan gunakan file yang lebih kecil.")
                              e.target.value = ""
                              setCustomFilePreview(null)
                              return
                            }
                            if (file.type.startsWith("image/")) {
                              setCustomFilePreview(URL.createObjectURL(file))
                            } else {
                              setCustomFilePreview(null)
                            }
                          } else {
                            setCustomFilePreview(null)
                          }
                        }}
                        className="cursor-pointer file:cursor-pointer file:bg-primary/10 file:text-primary file:font-semibold file:border-0 file:rounded-md file:px-4 file:py-1 hover:file:bg-primary/20"
                      />
                    </div>
                    <UploadCloud className="h-6 w-6 text-muted-foreground shrink-0" />
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">
                    Format yang didukung: JPG, PNG, atau PDF (maksimal ukuran file 10MB).
                  </p>

                  {customFilePreview && (
                    <div className="mt-2 w-32 h-32 rounded-lg border overflow-hidden bg-background">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={customFilePreview} alt="Preview Desain" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Spesifikasi Pesanan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
              <div className="space-y-2">
                <Label htmlFor="qty" className="font-semibold">Jumlah ({product.unit})</Label>
                <Input
                  id="qty"
                  name="qty"
                  type="number"
                  min="1"
                  value={qty}
                  onChange={(e) => setQty(parseInt(e.target.value) || 1)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline" className="font-semibold">Tenggat Waktu Selesai (Deadline)</Label>
                <Input
                  id="deadline"
                  name="deadline"
                  type="date"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="font-semibold">Instruksi & Catatan Tambahan</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder={
                  designMode === "TEMPLATE"
                    ? "Contoh: Mohon teks di banner diganti dengan 'Selamat Wisuda Budi Santoso S.Kom', warna dasar tetap biru."
                    : "Contoh: Cetak ukuran 2x3 meter, bahan flexi 280gr, berikan mata ayam di 4 sudut."
                }
                rows={3}
                required
                disabled={isLoading}
              />
            </div>

            <div className="p-4 bg-primary/5 rounded-xl flex justify-between items-center border border-primary/20">
              <span className="font-semibold text-sm">Estimasi Total Biaya</span>
              <span className="text-2xl font-black text-primary">{formatRupiah(product.basePrice * qty)}</span>
            </div>
          </CardContent>

          <CardFooter className="pt-2 pb-6 px-6 bg-muted/10 border-t">
            <Button type="submit" className="w-full h-12 text-base font-bold rounded-xl shadow-md" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Kirim Pesanan"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Dialog Preview Fullsize Template */}
      <Dialog open={Boolean(previewImage)} onOpenChange={(open) => !open && setPreviewImage(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{previewImage?.title}</DialogTitle>
          </DialogHeader>
          <div className="w-full max-h-[70vh] overflow-auto rounded-lg bg-muted flex items-center justify-center p-2">
            {previewImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewImage.url}
                alt={previewImage.title}
                className="max-h-[65vh] w-auto object-contain rounded"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}