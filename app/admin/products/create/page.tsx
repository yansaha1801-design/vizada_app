import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import CreateProductForm from "./form"

export default async function CreateProductPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" }
  })

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/admin/products">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tambah Produk Baru</h1>
          <p className="text-muted-foreground text-sm">Tambahkan layanan cetak beserta harga dan kategorinya.</p>
        </div>
      </div>
      
      <CreateProductForm categories={categories} />
    </div>
  )
}