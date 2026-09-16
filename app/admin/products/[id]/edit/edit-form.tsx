"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { updateProduct } from "@/app/actions/product"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface Category {
  id: string
  name: string
}

interface ProductDesignItem {
  id: string
  title: string
  imageUrl: string
}

interface Product {
  id: string
  name: string
  categoryId: string
  description: string | null
  basePrice: number
  unit: string
  imageUrl?: string | null
  designs?: ProductDesignItem[]
}

interface EditProductFormProps {
  product: Product
  categories: Category[]
}

interface NewTemplateRow {
  id: string
  title: string
  file: File | null
  previewUrl: string | null
}

export default function EditProductForm({ product, categories }: EditProductFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [categoryId, setCategoryId] = useState(product.categoryId)
  const [coverPreview, setCoverPreview] = useState<string | null>(product.imageUrl || null)
  const [existingDesigns, setExistingDesigns] = useState<ProductDesignItem[]>(product.designs || [])
  const [deletedDesignIds, setDeletedDesignIds] = useState<string[]>([])
  const [newTemplates, setNewTemplates] = useState<NewTemplateRow[]>([])

  const addNewTemplateRow = () => {
    setNewTemplates((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        title: "",
        file: null,
        previewUrl: null
      }
    ])
  }

  const removeNewTemplateRow = (id: string) => {
    setNewTemplates((prev) => prev.filter((t) => t.id !== id))
  }

  const updateNewTemplateTitle = (id: string, title: string) => {
    setNewTemplates((prev) => prev.map((t) => (t.id === id ? { ...t, title } : t)))
  }

  const updateNewTemplateFile = (id: string, file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error(`Ukuran file "${file.name}" melebihi batas 5MB! Silakan gunakan file yang lebih kecil.`)
      return
    }
    setNewTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, file, previewUrl: URL.createObjectURL(file) } : t))
    )
  }

  const markDesignForDeletion = (designId: string) => {
    setDeletedDesignIds((prev) => [...prev, designId])
    setExistingDesigns((prev) => prev.filter((d) => d.id !== designId))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    const formData = new FormData(e.currentTarget)
    
    if (!categoryId) {
      toast.error("Silakan pilih kategori produk")
      setIsLoading(false)
      return
    }

    formData.append("deleted_design_ids", JSON.stringify(deletedDesignIds))
    formData.append("new_design_count", newTemplates.length.toString())
    newTemplates.forEach((tpl, index) => {
      formData.append(`new_design_title_${index}`, tpl.title)
      if (tpl.file) {
        formData.append(`new_design_file_${index}`, tpl.file)
      }
    })

    const result = await updateProduct(product.id, formData)
    
    if (result?.error) {
      toast.error(result.error)
      setIsLoading(false)
    } else {
      toast.success("Produk berhasil diperbarui!")
      router.push("/admin/products")
      router.refresh()
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Produk</Label>
            <Input id="name" name="name" defaultValue={product.name} required />
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
              <Input 
                id="basePrice" 
                name="basePrice" 
                type="number" 
                min="0" 
                defaultValue={product.basePrice} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Satuan Hitung</Label>
              <Input 
                id="unit" 
                name="unit" 
                defaultValue={product.unit} 
                required 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi (Opsional)</Label>
            <Input 
              id="description" 
              name="description" 
              defaultValue={product.description || ""} 
            />
          </div>

          {/* Cover Image */}
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
                    setCoverPreview(product.imageUrl || null)
                    return
                  }
                  setCoverPreview(URL.createObjectURL(file))
                }
              }}
            />
            <p className="text-xs text-muted-foreground">Pilih gambar baru jika ingin mengganti foto sampul (JPG, PNG, WebP maks. 5MB).</p>
            {coverPreview && (
              <div className="relative w-36 h-36 mt-2 rounded-lg overflow-hidden border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={coverPreview} alt="Cover Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          {/* Template Desain Admin */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2">
                  <Label className="text-base font-semibold">Template Desain Siap Pakai (Admin)</Label>
                  <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                    Maks. 5MB/file
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">Kelola desain yang Anda sediakan untuk produk ini.</p>
              </div>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={addNewTemplateRow}
                className="gap-1.5"
              >
                + Tambah Template
              </Button>
            </div>

            {/* Existing designs */}
            {existingDesigns.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Template Aktif Saat Ini</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {existingDesigns.map((d) => (
                    <div key={d.id} className="relative border rounded-lg p-2 bg-background flex flex-col group">
                      <div className="w-full h-28 rounded overflow-hidden bg-muted">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={d.imageUrl} alt={d.title} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-xs font-medium mt-1.5 line-clamp-1">{d.title}</span>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="mt-2 h-7 text-xs"
                        onClick={() => markDesignForDeletion(d.id)}
                      >
                        Hapus
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New templates being added */}
            {newTemplates.length > 0 && (
              <div className="space-y-3 pt-2">
                <span className="text-xs font-semibold text-primary uppercase">Template Baru yang Akan Ditambahkan</span>
                {newTemplates.map((tpl, idx) => (
                  <div key={tpl.id} className="p-3 border rounded-lg bg-muted/10 space-y-3 relative">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-muted-foreground uppercase">Template Baru #{idx + 1}</span>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 text-xs text-destructive hover:bg-destructive/10"
                        onClick={() => removeNewTemplateRow(tpl.id)}
                      >
                        Batal
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
                      <div className="space-y-1">
                        <Label className="text-xs">Judul / Nama Template</Label>
                        <Input 
                          value={tpl.title}
                          onChange={(e) => updateNewTemplateTitle(tpl.id, e.target.value)}
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
                            if (f) updateNewTemplateFile(tpl.id, f)
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

            {existingDesigns.length === 0 && newTemplates.length === 0 && (
              <div className="p-4 border border-dashed rounded-lg text-center text-sm text-muted-foreground bg-muted/20">
                Belum ada template desain untuk produk ini. Klik &quot;+ Tambah Template&quot; di atas untuk menambahkan.
              </div>
            )}
          </div>

          <div className="flex gap-4 mt-6">
            <Button 
              type="button" 
              variant="outline" 
              className="w-full" 
              onClick={() => router.push("/admin/products")}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Simpan Perubahan"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}