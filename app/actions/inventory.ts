"use server"

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { revalidatePath } from "next/cache"
import { InventoryLogType } from "@/app/generated/prisma/client"

export async function createMaterial(formData: FormData) {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== "MANAGEMENT" && session?.user?.role !== "ADMIN") {
      return { error: "Anda tidak memiliki akses" }
    }
    const name = formData.get("name") as string
    const unit = formData.get("unit") as string
    const minStock = parseFloat(formData.get("minStock") as string)
    const initialStock = parseFloat(formData.get("initialStock") as string) || 0
    if (!name || !unit || isNaN(minStock)) {
      return { error: "Data bahan baku tidak lengkap" }
    }
    const material = await prisma.material.create({
      data: { name, unit, minStock, stockQty: initialStock }
    })
    if (initialStock > 0) {
      await prisma.inventoryLog.create({
        data: { materialId: material.id, type: InventoryLogType.IN, qty: initialStock, notes: "Stok awal sistem" }
      })
    }
    revalidatePath("/management/inventory")
    return { success: true }
  } catch {
    return { error: "Gagal menambahkan bahan baku" }
  }
}

export async function adjustStock(formData: FormData) {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== "MANAGEMENT" && session?.user?.role !== "ADMIN") {
      return { error: "Anda tidak memiliki akses" }
    }
    const materialId = formData.get("materialId") as string
    const type = formData.get("type") as InventoryLogType
    const qty = parseFloat(formData.get("qty") as string)
    const notes = formData.get("notes") as string
    if (!materialId || !type || isNaN(qty) || qty <= 0) {
      return { error: "Data input tidak valid" }
    }
    const material = await prisma.material.findUnique({ where: { id: materialId } })
    if (!material) {
      return { error: "Bahan baku tidak ditemukan" }
    }
    const newStock = type === InventoryLogType.IN ? material.stockQty + qty : material.stockQty - qty
    if (newStock < 0) {
      return { error: "Stok tidak mencukupi untuk dikeluarkan" }
    }
    await prisma.$transaction([
      prisma.material.update({
        where: { id: materialId },
        data: { stockQty: newStock }
      }),
      prisma.inventoryLog.create({
        data: { materialId, type, qty, notes }
      })
    ])
    revalidatePath("/management/inventory")
    return { success: true }
  } catch {
    return { error: "Gagal memperbarui stok" }
  }
}

export async function updateMaterial(formData: FormData) {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== "MANAGEMENT" && session?.user?.role !== "ADMIN") {
      return { error: "Anda tidak memiliki akses" }
    }
    const id = formData.get("id") as string
    const name = formData.get("name") as string
    const unit = formData.get("unit") as string
    const minStock = parseFloat(formData.get("minStock") as string)
    if (!id || !name || !unit || isNaN(minStock)) {
      return { error: "Data tidak lengkap" }
    }
    await prisma.material.update({
      where: { id },
      data: { name, unit, minStock }
    })
    revalidatePath("/management/inventory")
    return { success: true }
  } catch {
    return { error: "Gagal memperbarui bahan baku" }
  }
}

export async function deleteMaterial(formData: FormData) {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== "MANAGEMENT" && session?.user?.role !== "ADMIN") {
      return { error: "Anda tidak memiliki akses" }
    }
    const id = formData.get("id") as string
    if (!id) {
      return { error: "ID tidak valid" }
    }
    await prisma.inventoryLog.deleteMany({
      where: { materialId: id }
    })
    await prisma.material.delete({
      where: { id }
    })
    revalidatePath("/management/inventory")
    return { success: true }
  } catch {
    return { error: "Gagal menghapus bahan baku" }
  }
}