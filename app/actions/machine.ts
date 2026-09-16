"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { MachineStatus, MachineMaintenanceType } from "@/app/generated/prisma/client"

export async function createMachine(formData: FormData) {
  const name = formData.get("name") as string
  if (!name) {
    return { error: "Nama mesin wajib diisi" }
  }
  try {
    await prisma.machine.create({
      data: { name, status: MachineStatus.AVAILABLE }
    })
    revalidatePath("/management/machines")
    return { success: true }
  } catch {
    return { error: "Gagal membuat mesin" }
  }
}

export async function updateMachine(id: string, formData: FormData) {
  const name = formData.get("name") as string
  const status = formData.get("status") as MachineStatus
  if (!name) {
    return { error: "Nama mesin wajib diisi" }
  }
  try {
    await prisma.machine.update({
      where: { id },
      data: { name, status }
    })
    revalidatePath("/management/machines")
    return { success: true }
  } catch {
    return { error: "Gagal memperbarui mesin" }
  }
}

export async function deleteMachine(id: string) {
  try {
    const jobsCount = await prisma.productionJob.count({ where: { machineId: id } })
    if (jobsCount > 0) {
      return { error: "Gagal menghapus: Mesin masih digunakan oleh job produksi" }
    }
    await prisma.machine.delete({ where: { id } })
    revalidatePath("/management/machines")
    return { success: true }
  } catch {
    return { error: "Gagal menghapus mesin" }
  }
}

export async function logMaintenance(formData: FormData) {
  const machineId = formData.get("machineId") as string
  const type = formData.get("type") as MachineMaintenanceType
  const description = formData.get("description") as string
  const cost = parseFloat(formData.get("cost") as string)
  if (!machineId || !type) {
    return { error: "Mesin dan tipe perawatan wajib diisi" }
  }
  try {
    await prisma.$transaction(async (tx) => {
      const machine = await tx.machine.findUnique({ where: { id: machineId } })
      await tx.machineMaintenanceLog.create({
        data: {
          machineId,
          type,
          description,
          cost: isNaN(cost) ? null : cost
        }
      })

      if (!isNaN(cost) && cost > 0) {
        let expenseCat = await tx.financialCategory.findFirst({
          where: { type: "PENGELUARAN", name: { contains: "Maintenance", mode: "insensitive" } }
        })
        if (!expenseCat) {
          expenseCat = await tx.financialCategory.create({
            data: { name: "Maintenance & Perbaikan", type: "PENGELUARAN" }
          })
        }
        await tx.financialTransaction.create({
          data: {
            categoryId: expenseCat.id,
            type: "PENGELUARAN",
            amount: cost,
            description: `Perawatan Mesin ${machine?.name || ""} (${type}): ${description || "Perawatan"}`
          }
        })
      }
    })
    revalidatePath("/management/machines")
    revalidatePath("/management/finance")
    revalidatePath("/management")
    return { success: true }
  } catch {
    return { error: "Gagal membuat log perawatan" }
  }
}

export async function createMaintenanceSchedule(formData: FormData) {
  const machineId = formData.get("machineId") as string
  const interval = parseInt(formData.get("interval") as string)
  const nextDue = new Date(formData.get("nextDue") as string)
  const notes = formData.get("notes") as string
  if (!machineId || !interval || !nextDue) {
    return { error: "Semua kolom wajib diisi" }
  }
  try {
    await prisma.maintenanceSchedule.create({
      data: { machineId, interval, nextDue, notes }
    })
    revalidatePath("/management/machines")
    return { success: true }
  } catch {
    return { error: "Gagal membuat jadwal perawatan" }
  }
}

export async function updateMaintenanceSchedule(id: string, formData: FormData) {
  const interval = parseInt(formData.get("interval") as string)
  const nextDue = new Date(formData.get("nextDue") as string)
  const notes = formData.get("notes") as string
  if (!interval || !nextDue) {
    return { error: "Semua kolom wajib diisi" }
  }
  try {
    await prisma.maintenanceSchedule.update({
      where: { id },
      data: { interval, nextDue, notes }
    })
    revalidatePath("/management/machines")
    return { success: true }
  } catch {
    return { error: "Gagal memperbarui jadwal perawatan" }
  }
}

export async function deleteMaintenanceSchedule(id: string) {
  try {
    await prisma.maintenanceSchedule.delete({ where: { id } })
    revalidatePath("/management/machines")
    return { success: true }
  } catch {
    return { error: "Gagal menghapus jadwal perawatan" }
  }
}

export async function getMachineUtilization() {
  const machines = await prisma.machine.findMany({
    include: {
      productionJobs: {
        where: { status: { not: "DONE" } }
      }
    }
  })
  return machines.map(m => ({
    id: m.id,
    name: m.name,
    status: m.status,
    activeJobs: m.productionJobs.length
  }))
}

export async function updateMachineStatus(machineId: string, status: MachineStatus) {
  try {
    await prisma.machine.update({
      where: { id: machineId },
      data: { status }
    })
    revalidatePath("/management/machines")
    return { success: true }
  } catch {
    return { error: "Gagal memperbarui status mesin" }
  }
}