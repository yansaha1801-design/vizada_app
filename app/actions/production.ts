"use server"

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { revalidatePath } from "next/cache"

export async function finishProduction(formData: FormData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return { error: "Sesi tidak valid atau belum login" }
    }
    const role = session.user.role
    if (role !== "OPERATOR" && role !== "ADMIN" && role !== "MANAGEMENT") {
      return { error: "Anda tidak memiliki akses" }
    }
    const orderId = formData.get("orderId") as string
    if (!orderId) {
      return { error: "Data tidak lengkap" }
    }
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true
      }
    })
    if (!order) {
      return { error: "Pesanan tidak ditemukan" }
    }
    if (order.status !== "IN_PRODUCTION") {
      return { error: "Pesanan ini belum disetujui untuk diproduksi" }
    }
    
    await prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        await tx.productionJob.upsert({
          where: { orderItemId: item.id },
          create: {
            orderItemId: item.id,
            operatorId: session.user.id,
            status: "QC_CHECK"
          },
          update: {
            operatorId: session.user.id,
            status: "QC_CHECK"
          }
        })
      }
    })
    revalidatePath("/operator")
    revalidatePath("/operator/quality-control")
    return { success: true }
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message.split('\n').pop() : ""
    return {
      error: errMessage
        ? `Gagal: ${errMessage}`
        : "Gagal memperbarui status produksi"
    }
  }
}