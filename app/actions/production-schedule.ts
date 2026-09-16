"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { SchedulePriority } from "@/app/generated/prisma/client"

export async function createScheduleEntry(formData: FormData) {
  const productionJobId = formData.get("productionJobId") as string
  const machineId = formData.get("machineId") as string
  const operatorId = formData.get("operatorId") as string
  const scheduledDate = new Date(formData.get("scheduledDate") as string)
  const priority = (formData.get("priority") as SchedulePriority) || SchedulePriority.NORMAL
  const notes = formData.get("notes") as string
  if (!productionJobId || !scheduledDate) {
    return { error: "Production job dan tanggal wajib diisi" }
  }
  try {
    await prisma.$transaction(async (tx) => {
      await tx.productionSchedule.create({
        data: {
          productionJobId,
          machineId: machineId || null,
          operatorId: operatorId || null,
          scheduledDate,
          priority,
          notes
        }
      })

      await tx.productionJob.update({
        where: { id: productionJobId },
        data: {
          machineId: machineId || undefined,
          operatorId: operatorId || undefined,
          status: "PRINTING"
        }
      })

      if (machineId) {
        await tx.machine.update({
          where: { id: machineId },
          data: { status: "IN_USE" }
        })
      }
    })

    revalidatePath("/management/schedule")
    revalidatePath("/management/machines")
    revalidatePath("/operator")
    return { success: true }
  } catch {
    return { error: "Gagal membuat jadwal" }
  }
}

export async function updateScheduleEntry(id: string, formData: FormData) {
  const machineId = formData.get("machineId") as string
  const operatorId = formData.get("operatorId") as string
  const scheduledDate = new Date(formData.get("scheduledDate") as string)
  const priority = (formData.get("priority") as SchedulePriority) || SchedulePriority.NORMAL
  const status = formData.get("status") as string
  const notes = formData.get("notes") as string
  try {
    await prisma.productionSchedule.update({
      where: { id },
      data: {
        machineId: machineId || null,
        operatorId: operatorId || null,
        scheduledDate,
        priority,
        status,
        notes
      }
    })
    revalidatePath("/management/schedule")
    return { success: true }
  } catch {
    return { error: "Gagal memperbarui jadwal" }
  }
}

export async function deleteScheduleEntry(id: string) {
  try {
    await prisma.productionSchedule.delete({ where: { id } })
    revalidatePath("/management/schedule")
    return { success: true }
  } catch {
    return { error: "Gagal menghapus jadwal" }
  }
}

export async function getScheduleByDate(date: Date) {
  const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const endOfDay = new Date(startOfDay)
  endOfDay.setDate(endOfDay.getDate() + 1)
  const schedules = await prisma.productionSchedule.findMany({
    where: {
      scheduledDate: {
        gte: startOfDay,
        lt: endOfDay
      }
    },
    include: {
      productionJob: {
        include: {
          orderItem: { include: { product: true } }
        }
      }
    },
    orderBy: { scheduledDate: "asc" }
  })
  return schedules
}

export async function getScheduleRange(startDate: Date, endDate: Date) {
  const schedules = await prisma.productionSchedule.findMany({
    where: {
      scheduledDate: {
        gte: startDate,
        lte: endDate
      }
    },
    include: {
      productionJob: {
        include: {
          orderItem: { include: { product: true, order: true } }
        }
      }
    },
    orderBy: { scheduledDate: "asc" }
  })
  return schedules
}

export async function calculateMaterialNeeds(productionJobId: string) {
  const job = await prisma.productionJob.findUnique({
    where: { id: productionJobId },
    include: {
      orderItem: {
        include: {
          product: {
            include: {
              materials: true
            }
          }
        }
      }
    }
  })
  if (!job) {
    return { error: "Production job tidak ditemukan" }
  }
  const qty = job.orderItem.qty
  const needs = job.orderItem.product.materials.map(pm => ({
    materialId: pm.materialId,
    estimatedQty: pm.qtyNeeded * qty
  }))
  try {
    await Promise.all(
      needs.map(need =>
        prisma.materialEstimate.create({
          data: {
            ...need,
            orderId: job.orderItem.orderId
          }
        })
      )
    )
    revalidatePath("/management/schedule")
    return { success: true, needs }
  } catch {
    return { error: "Gagal menghitung kebutuhan material" }
  }
}

export async function updateSchedulePriority(id: string, priority: SchedulePriority) {
  try {
    await prisma.productionSchedule.update({
      where: { id },
      data: { priority }
    })
    revalidatePath("/management/schedule")
    return { success: true }
  } catch {
    return { error: "Gagal memperbarui prioritas" }
  }
}

export async function getUpcomingSchedules(days: number = 7) {
  const now = new Date()
  const future = new Date()
  future.setDate(future.getDate() + days)
  const schedules = await prisma.productionSchedule.findMany({
    where: {
      scheduledDate: {
        gte: now,
        lte: future
      }
    },
    include: {
      productionJob: {
        include: {
          orderItem: { include: { product: true } }
        }
      }
    },
    orderBy: { scheduledDate: "asc" }
  })
  return schedules
}