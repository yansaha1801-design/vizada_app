import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import EditProductForm from "./edit-form"

interface EditProductPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params

  const product = await prisma.product.findUnique({
    where: { id },
    include: { designs: true }
  })

  if (!product) {
    notFound()
  }

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" }
  })

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Produk</h1>
        <p className="text-muted-foreground">Perbarui informasi layanan cetak Anda.</p>
      </div>
      
      <EditProductForm product={product} categories={categories} />
    </div>
  )
}