"use server"

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { revalidatePath } from "next/cache"

export async function cancelOrder(orderId: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return { error: "Anda tidak memiliki akses" }
    }
    const order = await prisma.order.findUnique({ where: { id: orderId } })
    if (!order) {
      return { error: "Pesanan tidak ditemukan" }
    }
    if (order.customerId !== session.user.id) {
      return { error: "Anda tidak memiliki izin" }
    }
    if (order.status !== "PENDING_PAYMENT") {
      return { error: "Pesanan yang sudah diproses tidak dapat dibatalkan" }
    }
    await prisma.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED" }
    })
    revalidatePath(`/orders/${orderId}`)
    revalidatePath("/orders")
    return { success: true }
  } catch {
    return { error: "Gagal membatalkan pesanan" }
  }
}