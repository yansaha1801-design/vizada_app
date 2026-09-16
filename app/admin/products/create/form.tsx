"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createProduct, createCategory } from "@/app/actions/product"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2, Plus } from "lucide-react"

interface Category {
  id: string;
  name: string;
}

interface CreateProductFormProps {
  categories: Category[];
}

interface TemplateRow {
  id: string
  title: string
  file: File | null
  previewUrl: string | null
}

export default function CreateProductForm({ categories }: CreateProductFormProps) {
  const router = useRouter()
  const [isLoadingProd, setIsLoadingProd] = useState(false)
  const [isLoadingCat, setIsLoadingCat] = useState(false)
  const [categoryId, setCategoryId] = useState("")
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [templates, setTemplates] = useState<TemplateRow[]>([])

  const addTemplateRow = () => {
    setTemplates((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        title: "",
        file: null,
        previewUrl: null
      }
    ])
  }

  const removeTemplateRow = (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id))
  }

  const updateTemplateTitle = (id: string, title: string) => {
    setTemplates((prev) => prev.map((t) => (t.id === id ? { ...t, title } : t)))
  }

  const updateTemplateFile = (id: string, file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error(`Ukuran file "${file.name}" melebihi batas 5MB! Silakan gunakan file berukuran lebih kecil.`)
      return
    }
    setTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, file, previewUrl: URL.createObjectURL(file) } : t))
    )
  }

  const handleProductSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoadingProd(true)
    const formData = new FormData(e.currentTarget)
    
    if (!categoryId) {
      toast.error("Silakan pilih kategori produk terlebih dahulu")
      setIsLoadingProd(false)
      return
    }

    formData.append("design_count", templates.length.toString())
    templates.forEach((tpl, index) => {
      formData.append(`design_title_${index}`, tpl.title)
      if (tpl.file) {
        formData.append(`design_file_${index}`, tpl.file)
      }
    })

    const result = await createProduct(formData)
    
    if (result?.error) {
      toast.error(result.error)
      setIsLoadingProd(false)
    } else {
      toast.success("Produk berhasil ditambahkan!")
      router.push("/admin/products")
    }
  }

  const handleCategorySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoadingCat(true)
    const formData = new FormData(e.currentTarget)
    
    const result = await createCategory(formData)
    
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success("Kategori baru berhasil ditambahkan!")
      ;(e.target as HTMLFormElement).reset()
    }
    
    setIsLoadingCat(false)
  }

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_300px] items-start">
      <Card>
        <CardHeader>
          <CardTitle>Informasi Produk Baru</CardTitle>
          <CardDescription>Masukkan detail layanan cetak yang akan ditawarkan ke pelanggan.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProductSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Produk</Label>
              <Input id="name" name="name" placeholder="Contoh: Cetak Banner Flexi 280gr" required />
            </div>
            
            <div className="space-y-2">
              <Label>Kategori</Label>
              <input type="hidden" name="categoryId" value={categoryId} />
              <Select value={categoryId} onValueChange={(value) => setCategoryId(value || "")} required>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori produk">
                    {categoryId ? categories.find((cat) => cat.id === categoryId)?.name : undefined}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {categories.length === 0 ? (
                    <SelectItem value="empty" disabled>Belum ada kategori</SelectItem>
                  ) : (
                    categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="basePrice">Harga Dasar (Rp)</Label>
                <Input id="basePrice" name="basePrice" type="number" min="0" placeholder="15000" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Satuan Hitung</Label>
                <Input id="unit" name="unit" placeholder="Contoh: Meter, Lembar, Pcs" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi (Opsional)</Label>
              <Input id="description" name="description" placeholder="Penjelasan singkat mengenai produk ini" />
            </div>

            {/* Upload Cover Produk */}
            <div className="space-y-2 pt-2 border-t">
              <div className="flex justify-between items-center">
                <Label htmlFor="image" className="font-semibold">Foto Utama Produk (Katalog)</Label>
                <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                  Maks. 5MB
                </span>
              </div>
              <Input 
                id="image" 
                name="image" 
                type="file" 
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    if (file.size > 5 * 1024 * 1024) {
                      toast.error("Ukuran file cover melebihi batas 5MB! Silakan pilih gambar yang lebih kecil.")
                      e.target.value = ""
                      setCoverPreview(null)
                      return
                    }
                    setCoverPreview(URL.createObjectURL(file))
                  } else {
                    setCoverPreview(null)
                  }
                }}
              />
              <p className="text-xs text-muted-foreground">Foto ini akan ditampilkan sebagai sampul produk di katalog (JPG, PNG, WebP maks. 5MB).</p>
              {coverPreview && (
                <div className="relative w-36 h-36 mt-2 rounded-lg overflow-hidden border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={coverPreview} alt="Cover Preview" className="w-full h-full object-cover" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6"
                    onClick={() => {
                      setCoverPreview(null)
                      const input = document.getElementById("image") as HTMLInputElement
                      if (input) input.value = ""
                    }}
                  >
                    ×
                  </Button>
                </div>
              )}
            </div>

            {/* Template Desain yang Disediakan Admin */}
            <div className="space-y-4 pt-4 border-t">
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <Label className="text-base font-semibold">Template Desain Siap Pakai (Admin)</Label>
                    <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                      Maks. 5MB/file
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">Desain yang Anda sediakan agar dapat dipilih langsung oleh pelanggan saat memesan.</p>
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={addTemplateRow}
                  className="gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" /> Tambah Template
                </Button>
              </div>

              {templates.length === 0 ? (
                <div className="p-4 border border-dashed rounded-lg text-center text-sm text-muted-foreground bg-muted/20">
                  Belum ada template desain ditambahkan. Klik &quot;Tambah Template&quot; untuk mengunggah desain siap pakai.
                </div>
              ) : (
                <div className="space-y-3">
                  {templates.map((tpl, idx) => (
                    <div key={tpl.id} className="p-3 border rounded-lg bg-muted/10 space-y-3 relative">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-muted-foreground uppercase">Template #{idx + 1}</span>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 text-xs text-destructive hover:bg-destructive/10"
                          onClick={() => removeTemplateRow(tpl.id)}
                        >
                          Hapus
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
                        <div className="space-y-1">
                          <Label className="text-xs">Judul / Nama Template</Label>
                          <Input 
                            value={tpl.title}
                            onChange={(e) => updateTemplateTitle(tpl.id, e.target.value)}
                            placeholder="Contoh: Template Wisuda Elegan"
                            required
                          />
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs">File Gambar Template</Label>
                          <Input 
                            type="file" 
                            accept="image/*"
                            required
                            onChange={(e) => {
                              const f = e.target.files?.[0]
                              if (f) updateTemplateFile(tpl.id, f)
                            }}
                          />
                        </div>
                      </div>

                      {tpl.previewUrl && (
                        <div className="mt-2 w-28 h-28 rounded border overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={tpl.previewUrl} alt={tpl.title} className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button type="submit" className="w-full mt-6" disabled={isLoadingProd || categories.length === 0}>
              {isLoadingProd ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Simpan Produk"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-muted/40">
        <CardHeader>
          <CardTitle className="text-lg">Tambah Kategori</CardTitle>
          <CardDescription>Buat kategori baru jika belum tersedia di pilihan.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCategorySubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="catName">Nama Kategori</Label>
              <Input id="catName" name="name" placeholder="Contoh: Large Format" required />
            </div>
            <Button type="submit" variant="secondary" className="w-full" disabled={isLoadingCat}>
              {isLoadingCat ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <><Plus className="mr-2 h-4 w-4" /> Tambah Kategori</>}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}