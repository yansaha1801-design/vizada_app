"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

async function saveFile(file: File, folder: string, prefix: string): Promise<string | null> {
  if (!file || file.size === 0) return null
  const buffer = Buffer.from(await file.arrayBuffer())
  const uploadDir = join(process.cwd(), "public", "uploads", folder)
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true })
  }
  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
  const cleanName = file.name.replace(/\s+/g, "-")
  const fileName = `${prefix}-${uniqueSuffix}-${cleanName}`
  const filePath = join(uploadDir, fileName)
  await writeFile(filePath, buffer)
  return `/uploads/${folder}/${fileName}`
}

export async function createCategory(formData: FormData) {
  const name = formData.get("name") as string
  if (!name) {
    return { error: "Nama kategori wajib diisi" }
  }
  await prisma.category.create({ data: { name } })
  revalidatePath("/admin/products")
  revalidatePath("/admin/products/create")
  return { success: true }
}

export async function updateCategory(id: string, name: string) {
  if (!name) {
    return { error: "Nama kategori wajib diisi" }
  }
  try {
    await prisma.category.update({
      where: { id },
      data: { name }
    })
    revalidatePath("/admin/products")
    revalidatePath("/admin/products/create")
    return { success: true }
  } catch {
    return { error: "Gagal memperbarui kategori" }
  }
}

export async function deleteCategory(id: string) {
  try {
    const productsCount = await prisma.product.count({
      where: { categoryId: id }
    })
    if (productsCount > 0) {
      return { error: "Gagal menghapus: Kategori ini masih digunakan oleh produk." }
    }
    await prisma.category.delete({ where: { id } })
    revalidatePath("/admin/products")
    revalidatePath("/admin/products/create")
    return { success: true }
  } catch {
    return { error: "Gagal menghapus kategori" }
  }
}

export async function createProduct(formData: FormData) {
  const name = formData.get("name") as string
  const categoryId = formData.get("categoryId") as string
  const description = formData.get("description") as string
  const basePrice = parseFloat(formData.get("basePrice") as string)
  const unit = formData.get("unit") as string
  const bomData = formData.get("bom") as string
  const image = formData.get("image") as File | null

  if (!name || !categoryId || isNaN(basePrice) || !unit) {
    return { error: "Semua kolom utama wajib diisi dengan format yang benar" }
  }

  let imageUrl: string | null = null
  if (image && image.size > 0) {
    imageUrl = await saveFile(image, "products", "cover")
  }

  const designCount = parseInt((formData.get("design_count") as string) || "0")
  const designsCreate: { title: string; imageUrl: string }[] = []
  for (let i = 0; i < designCount; i++) {
    const title = (formData.get(`design_title_${i}`) as string) || `Template ${i + 1}`
    const file = formData.get(`design_file_${i}`) as File | null
    if (file && file.size > 0) {
      const url = await saveFile(file, "products/designs", "template")
      if (url) {
        designsCreate.push({ title, imageUrl: url })
      }
    }
  }

  let materialsCreate = []
  if (bomData) {
    try {
      const parsedBom = JSON.parse(bomData)
      materialsCreate = parsedBom.map((b: { materialId: string; qtyNeeded: string | number }) => ({
        materialId: b.materialId,
        qtyNeeded: parseFloat(b.qtyNeeded.toString())
      }))
    } catch {
      return { error: "Format bahan baku tidak valid" }
    }
  }

  try {
    await prisma.product.create({
      data: {
        name,
        categoryId,
        description,
        basePrice,
        unit,
        imageUrl,
        materials: { create: materialsCreate },
        designs: { create: designsCreate }
      }
    })
    revalidatePath("/admin/products")
    revalidatePath("/products")
    return { success: true }
  } catch (e) {
    console.error("Error createProduct:", e)
    return { error: "Gagal membuat produk" }
  }
}

export async function updateProduct(id: string, formData: FormData) {
  const name = formData.get("name") as string
  const categoryId = formData.get("categoryId") as string
  const description = formData.get("description") as string
  const basePrice = parseFloat(formData.get("basePrice") as string)
  const unit = formData.get("unit") as string
  const bomData = formData.get("bom") as string
  const image = formData.get("image") as File | null

  if (!name || !categoryId || isNaN(basePrice) || !unit) {
    return { error: "Semua kolom utama wajib diisi dengan format yang benar" }
  }

  let newImageUrl: string | null = null
  if (image && image.size > 0) {
    newImageUrl = await saveFile(image, "products", "cover")
  }

  const deletedDesignIdsRaw = formData.get("deleted_design_ids") as string
  let deletedDesignIds: string[] = []
  if (deletedDesignIdsRaw) {
    try {
      deletedDesignIds = JSON.parse(deletedDesignIdsRaw)
    } catch {
      deletedDesignIds = []
    }
  }

  const newDesignCount = parseInt((formData.get("new_design_count") as string) || "0")
  const newDesignsCreate: { title: string; imageUrl: string }[] = []
  for (let i = 0; i < newDesignCount; i++) {
    const title = (formData.get(`new_design_title_${i}`) as string) || `Template ${i + 1}`
    const file = formData.get(`new_design_file_${i}`) as File | null
    if (file && file.size > 0) {
      const url = await saveFile(file, "products/designs", "template")
      if (url) {
        newDesignsCreate.push({ title, imageUrl: url })
      }
    }
  }

  let materialsCreate = []
  if (bomData) {
    try {
      const parsedBom = JSON.parse(bomData)
      materialsCreate = parsedBom.map((b: { materialId: string; qtyNeeded: string | number }) => ({
        materialId: b.materialId,
        qtyNeeded: parseFloat(b.qtyNeeded.toString())
      }))
    } catch {
      return { error: "Format bahan baku tidak valid" }
    }
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.productMaterial.deleteMany({
        where: { productId: id }
      })
      if (deletedDesignIds.length > 0) {
        await tx.productDesign.deleteMany({
          where: { id: { in: deletedDesignIds }, productId: id }
        })
      }
      const updatePayload: {
        name: string
        categoryId: string
        description: string
        basePrice: number
        unit: string
        imageUrl?: string
        materials: { create: typeof materialsCreate }
        designs?: { create: typeof newDesignsCreate }
      } = {
        name,
        categoryId,
        description,
        basePrice,
        unit,
        materials: { create: materialsCreate }
      }
      if (newImageUrl) {
        updatePayload.imageUrl = newImageUrl
      }
      if (newDesignsCreate.length > 0) {
        updatePayload.designs = { create: newDesignsCreate }
      }

      await tx.product.update({
        where: { id },
        data: updatePayload
      })
    })

    revalidatePath("/admin/products")
    revalidatePath("/products")
    return { success: true }
  } catch (e) {
    console.error("Error updateProduct:", e)
    return { error: "Gagal memperbarui produk" }
  }
}

export async function deleteProduct(id: string) {
  try {
    await prisma.product.delete({ where: { id } })
    revalidatePath("/admin/products")
    revalidatePath("/products")
    return { success: true }
  } catch {
    return { error: "Gagal menghapus produk" }
  }
}

export async function deleteProductDesign(id: string) {
  try {
    await prisma.productDesign.delete({ where: { id } })
    revalidatePath("/admin/products")
    revalidatePath("/products")
    return { success: true }
  } catch {
    return { error: "Gagal menghapus template desain" }
  }
}