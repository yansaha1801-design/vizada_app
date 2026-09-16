"use client"

import { useState, useMemo } from "react"
import { createCategory, updateCategory, deleteCategory } from "@/app/actions/product"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { Tags, Pencil, Trash2, X, Check, Plus, Search, Loader2 } from "lucide-react"

interface Category {
  id: string
  name: string
  _count?: {
    products: number
  }
}

export function CategoryManagement({ categories }: { categories: Category[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filteredCategories = useMemo(() => {
    return categories.filter(cat =>
      cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [categories, searchTerm])

  const handleCreate = async (formData: FormData) => {
    setIsLoading(true)
    const result = await createCategory(formData)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Kategori berhasil ditambahkan!")
      const form = document.getElementById("create-category-form") as HTMLFormElement
      form?.reset()
    }
    setIsLoading(false)
  }

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return toast.error("Nama tidak boleh kosong")
    setIsLoading(true)
    const result = await updateCategory(id, editName)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Kategori berhasil diperbarui!")
      setEditingId(null)
    }
    setIsLoading(false)
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setIsLoading(true)
    const result = await deleteCategory(deleteId)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Kategori berhasil dihapus!")
      setDeleteId(null)
    }
    setIsLoading(false)
  }

  const startEditing = (cat: Category) => {
    setEditingId(cat.id)
    setEditName(cat.name)
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger className={buttonVariants({ variant: "outline", className: "gap-2 cursor-pointer" })}>
          <Tags className="h-4 w-4" /> Kelola Kategori
        </DialogTrigger>

        <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col p-0 rounded-2xl overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b bg-muted/30 shrink-0">
            <DialogTitle>Manajemen Kategori Produk</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 p-6 overflow-hidden flex-1 min-h-0">
            <form
              id="create-category-form"
              action={handleCreate}
              className="flex flex-col sm:flex-row gap-3 shrink-0"
            >
              <Input
                name="name"
                placeholder="Nama kategori baru..."
                required
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading} className="shrink-0 gap-2">
                <Plus className="h-4 w-4" /> Tambah Kategori
              </Button>
            </form>

            <div className="relative shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari kategori..."
                className="pl-9"
                disabled={isLoading}
              />
            </div>

            <div className="border rounded-md overflow-hidden flex-1 min-h-0 flex flex-col">
              <div className="overflow-y-auto flex-1">
                <Table>
                  <TableHeader className="bg-muted/50 sticky top-0 z-10">
                    <TableRow>
                      <TableHead className="px-4">Nama Kategori</TableHead>
                      <TableHead className="text-center w-[140px]">Jumlah Produk</TableHead>
                      <TableHead className="text-right w-[160px] px-4">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCategories.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground py-10">
                          {categories.length === 0 ? "Belum ada kategori" : "Kategori tidak ditemukan"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCategories.map((category) => (
                        <TableRow key={category.id}>
                          <TableCell className="px-4">
                            {editingId === category.id ? (
                              <Input
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="h-8 w-full"
                                autoFocus
                                disabled={isLoading}
                              />
                            ) : (
                              <span className="font-medium text-sm line-clamp-1">{category.name}</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center w-[140px]">
                            <span className="bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full text-xs font-bold">
                              {category._count?.products ?? 0}
                            </span>
                          </TableCell>
                          <TableCell className="text-right w-[160px] px-4">
                            {editingId === category.id ? (
                              <div className="flex justify-end gap-1.5">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 gap-1.5 text-green-600 hover:text-green-700 hover:bg-green-50"
                                  onClick={() => handleUpdate(category.id)}
                                  disabled={isLoading}
                                >
                                  <Check className="h-4 w-4" /> Simpan
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 gap-1.5 text-muted-foreground"
                                  onClick={() => setEditingId(null)}
                                  disabled={isLoading}
                                >
                                  <X className="h-4 w-4" /> Batal
                                </Button>
                              </div>
                            ) : (
                              <div className="flex justify-end gap-1.5">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                  onClick={() => startEditing(category)}
                                  disabled={isLoading}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => setDeleteId(category.id)}
                                  disabled={isLoading || (category._count?.products ?? 0) > 0}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Hapus Kategori</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Apakah Anda yakin ingin menghapus kategori ini? Tindakan ini tidak dapat dibatalkan.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)} disabled={isLoading}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Ya, Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}