"use server"

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { revalidatePath } from "next/cache"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

export async function uploadPaymentProof(formData: FormData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return { error: "Anda tidak memiliki akses" }
    }
    const orderId = formData.get("orderId") as string
    const method = formData.get("method") as string
    const file = formData.get("file") as File
    if (!orderId || !method || !file || file.size === 0) {
      return { error: "Data pembayaran tidak lengkap" }
    }
    const MAX_FILE_SIZE = 5 * 1024 * 1024
    const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/jpg"]
    if (file.size > MAX_FILE_SIZE) {
      return { error: "Ukuran file bukti pembayaran maksimal 5MB" }
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return { error: "Format file tidak didukung, gunakan JPG atau PNG" }
    }
    const order = await prisma.order.findUnique({ where: { id: orderId } })
    if (!order) {
      return { error: "Pesanan tidak ditemukan" }
    }
    const promoUsage = await prisma.promoUsage.findFirst({
      where: { orderId }
    })
    const finalAmount = Math.max(0, order.totalAmount - (promoUsage?.discountAmount || 0))

    const buffer = Buffer.from(await file.arrayBuffer())
    const uploadDir = join(process.cwd(), "public", "uploads", "payments")
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    const fileName = `payment-${uniqueSuffix}-${file.name.replace(/\s+/g, '-')}`
    const filePath = join(uploadDir, fileName)
    await writeFile(filePath, buffer)
    const proofUrl = `/uploads/payments/${fileName}`

    await prisma.payment.upsert({
      where: { orderId },
      create: {
        orderId,
        amount: finalAmount,
        method,
        status: "PENDING",
        proofUrl
      },
      update: {
        amount: finalAmount,
        method,
        status: "PENDING",
        proofUrl
      }
    })
    await prisma.order.update({
      where: { id: orderId },
      data: { status: "WAITING_APPROVAL" }
    })
    revalidatePath(`/orders/${orderId}`)
    revalidatePath("/admin/orders")
    return { success: true }
  } catch {
    return { error: "Gagal mengunggah bukti pembayaran" }
  }
}