"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { PromoType } from "@/app/generated/prisma/client"
import { v4 as uuidv4 } from "uuid"

export async function createPromotion(formData: FormData) {
  const name = formData.get("name") as string
  const type = formData.get("type") as PromoType
  const value = parseFloat(formData.get("value") as string)
  const startDate = new Date(formData.get("startDate") as string)
  const endDate = new Date(formData.get("endDate") as string)
  if (!name || !type || isNaN(value) || value <= 0) {
    return { error: "Semua kolom wajib diisi dengan benar" }
  }
  if (startDate >= endDate) {
    return { error: "Tanggal awal harus sebelum tanggal akhir" }
  }
  try {
    await prisma.promotion.create({
      data: { name, type, value, startDate, endDate }
    })
    revalidatePath("/admin/promotions")
    return { success: true }
  } catch {
    return { error: "Gagal membuat promosi" }
  }
}

export async function updatePromotion(id: string, formData: FormData) {
  const name = formData.get("name") as string
  const type = formData.get("type") as PromoType
  const value = parseFloat(formData.get("value") as string)
  const startDate = new Date(formData.get("startDate") as string)
  const endDate = new Date(formData.get("endDate") as string)
  const active = formData.get("active") === "true"
  if (!name || !type || isNaN(value) || value <= 0) {
    return { error: "Semua kolom wajib diisi dengan benar" }
  }
  try {
    await prisma.promotion.update({
      where: { id },
      data: { name, type, value, startDate, endDate, active }
    })
    revalidatePath("/admin/promotions")
    return { success: true }
  } catch {
    return { error: "Gagal memperbarui promosi" }
  }
}

export async function deletePromotion(id: string) {
  try {
    await prisma.promotion.delete({ where: { id } })
    revalidatePath("/admin/promotions")
    return { success: true }
  } catch {
    return { error: "Gagal menghapus promosi" }
  }
}

export async function generateVoucherCodes(promotionId: string, quantity: number) {
  if (quantity <= 0 || quantity > 10000) {
    return { error: "Jumlah voucher harus antara 1-10000" }
  }
  try {
    const codes = Array.from({ length: quantity }, () => ({
      code: uuidv4().toUpperCase().slice(0, 12),
      promotionId
    }))
    await prisma.voucherCode.createMany({ data: codes })
    revalidatePath("/admin/promotions")
    return { success: true, quantity }
  } catch {
    return { error: "Gagal membuat kode voucher" }
  }
}

export async function redeemVoucher(code: string, orderId: string) {
  try {
    const voucher = await prisma.voucherCode.findUnique({
      where: { code },
      include: { promotion: true }
    })
    if (!voucher) {
      return { error: "Kode voucher tidak ditemukan" }
    }
    if (voucher.used) {
      return { error: "Kode voucher sudah digunakan" }
    }
    const promo = voucher.promotion
    if (!promo.active || new Date() < promo.startDate || new Date() > promo.endDate) {
      return { error: "Promosi tidak aktif atau sudah berakhir" }
    }
    const order = await prisma.order.findUnique({ where: { id: orderId } })
    if (!order) {
      return { error: "Pesanan tidak ditemukan" }
    }
    if (order.status !== "PENDING_PAYMENT") {
      return { error: "Voucher hanya dapat digunakan pada pesanan yang belum dibayar" }
    }
    const existingUsage = await prisma.promoUsage.findFirst({ where: { orderId } })
    if (existingUsage) {
      return { error: "Pesanan ini sudah menggunakan voucher diskon" }
    }
    let discountAmount = 0
    if (promo.type === PromoType.DISKON_PERSEN) {
      discountAmount = (order.totalAmount * promo.value) / 100
    } else if (promo.type === PromoType.DISKON_NOMINAL) {
      discountAmount = Math.min(promo.value, order.totalAmount)
    }
    await Promise.all([
      prisma.voucherCode.update({
        where: { code },
        data: { used: true, usedAt: new Date() }
      }),
      prisma.promoUsage.create({
        data: {
          promotionId: promo.id,
          voucherCodeId: voucher.id,
          orderId,
          discountAmount
        }
      })
    ])
    revalidatePath(`/orders/${orderId}`)
    return { success: true, discountAmount }
  } catch {
    return { error: "Gagal menebus voucher" }
  }
}

export async function applyPromoToOrder(promotionId: string, orderId: string) {
  try {
    const promo = await prisma.promotion.findUnique({ where: { id: promotionId } })
    const order = await prisma.order.findUnique({ where: { id: orderId } })
    if (!promo || !order) {
      return { error: "Promosi atau pesanan tidak ditemukan" }
    }
    let discountAmount = 0
    if (promo.type === PromoType.DISKON_PERSEN) {
      discountAmount = (order.totalAmount * promo.value) / 100
    } else if (promo.type === PromoType.DISKON_NOMINAL) {
      discountAmount = Math.min(promo.value, order.totalAmount)
    }
    await prisma.promoUsage.create({
      data: {
        promotionId,
        orderId,
        discountAmount
      }
    })
    revalidatePath(`/orders/${orderId}`)
    return { success: true, discountAmount }
  } catch {
    return { error: "Gagal menerapkan promosi" }
  }
}

export async function createBundle(formData: FormData) {
  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const bundlePrice = parseFloat(formData.get("bundlePrice") as string)
  const productsJson = formData.get("products") as string
  if (!name || isNaN(bundlePrice) || bundlePrice <= 0) {
    return { error: "Nama dan harga wajib diisi" }
  }
  try {
    await prisma.bundleProduct.create({
      data: {
        name,
        description,
        bundlePrice,
        products: productsJson || "[]"
      }
    })
    revalidatePath("/admin/promotions")
    return { success: true }
  } catch {
    return { error: "Gagal membuat bundle produk" }
  }
}

export async function updateBundle(id: string, formData: FormData) {
  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const bundlePrice = parseFloat(formData.get("bundlePrice") as string)
  const productsJson = formData.get("products") as string
  const active = formData.get("active") === "true"
  if (!name || isNaN(bundlePrice) || bundlePrice <= 0) {
    return { error: "Nama dan harga wajib diisi" }
  }
  try {
    await prisma.bundleProduct.update({
      where: { id },
      data: {
        name,
        description,
        bundlePrice,
        active,
        products: productsJson || "[]"
      }
    })
    revalidatePath("/admin/promotions")
    return { success: true }
  } catch {
    return { error: "Gagal memperbarui bundle produk" }
  }
}

export async function deleteBundle(id: string) {
  try {
    await prisma.bundleProduct.delete({ where: { id } })
    revalidatePath("/admin/promotions")
    return { success: true }
  } catch {
    return { error: "Gagal menghapus bundle produk" }
  }
}

// ----------------------------------------
// FITUR BARU: Buat Kode Custom & Hapus Kode
// ----------------------------------------

export async function createCustomVoucher(promotionId: string, customCode: string) {
  if (!customCode || customCode.trim() === "") return { error: "Kode voucher tidak boleh kosong" }
  try {
    const existing = await prisma.voucherCode.findUnique({ where: { code: customCode.toUpperCase() } })
    if (existing) return { error: "Kode voucher ini sudah digunakan" }

    await prisma.voucherCode.create({
      data: {
        code: customCode.toUpperCase(),
        promotionId
      }
    })
    revalidatePath("/admin/promotions")
    return { success: true }
  } catch {
    return { error: "Gagal membuat kode voucher" }
  }
}

export async function deleteVoucherCode(id: string) {
  try {
    await prisma.voucherCode.delete({ where: { id } })
    revalidatePath("/admin/promotions")
    return { success: true }
  } catch {
    return { error: "Gagal menghapus kode voucher" }
  }
}