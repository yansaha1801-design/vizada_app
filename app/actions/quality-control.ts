"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { QCChecklistStatus, QCStatus, Prisma } from "@/app/generated/prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

async function saveQCPhotoFile(file: File): Promise<string | null> {
  if (!file || file.size === 0) return null
  const MAX_FILE_SIZE = 5 * 1024 * 1024
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/jpg", "image/webp"]
  if (file.size > MAX_FILE_SIZE || !ALLOWED_TYPES.includes(file.type)) {
    return null
  }
  const buffer = Buffer.from(await file.arrayBuffer())
  const uploadDir = join(process.cwd(), "public", "uploads", "qc")
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true })
  }
  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
  const cleanName = file.name.replace(/\s+/g, "-")
  const fileName = `qc-${uniqueSuffix}-${cleanName}`
  const filePath = join(uploadDir, fileName)
  await writeFile(filePath, buffer)
  return `/uploads/qc/${fileName}`
}

interface ChecklistItem {
  name: string
  status: QCChecklistStatus
  notes?: string
}

export async function submitQCCheck(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { error: "Anda harus login untuk melakukan inspeksi QC" }
  }

  const productionJobId = formData.get("productionJobId") as string
  const checklistJson = formData.get("checklist") as string
  const notes = formData.get("notes") as string
  const photoFile = formData.get("photo") as File | null

  if (!productionJobId) {
    return { error: "Production job wajib diisi" }
  }
  try {
    const checklist: ChecklistItem[] = JSON.parse(checklistJson || "[]")
    const statuses = checklist.map(item => item.status)
    let overallStatus: QCChecklistStatus = QCChecklistStatus.PASSED
    if (statuses.includes(QCChecklistStatus.REJECTED)) {
      overallStatus = QCChecklistStatus.REJECTED
    } else if (statuses.includes(QCChecklistStatus.NEEDS_REWORK)) {
      overallStatus = QCChecklistStatus.NEEDS_REWORK
    }
    
    const job = await prisma.productionJob.findUnique({
      where: { id: productionJobId },
      include: {
        orderItem: {
          include: {
            order: true,
            product: { include: { materials: true } }
          }
        }
      }
    })
    
    if (!job) return { error: "Pekerjaan produksi tidak ditemukan" }

    let photoUrl: string | null = null
    if (photoFile && photoFile.size > 0) {
      photoUrl = await saveQCPhotoFile(photoFile)
    }

    await prisma.$transaction(async (tx) => {
      await Promise.all(
        checklist.map(item =>
          tx.qCChecklistItem.create({
            data: {
              productionJobId,
              checkName: item.name,
              status: item.status,
              notes: item.notes || null
            }
          })
        )
      )
      
      await tx.qualityControl.upsert({
        where: { productionJobId },
        create: {
          productionJobId,
          inspectorId: session.user.id,
          status: overallStatus as unknown as QCStatus,
          notes: notes || null
        },
        update: {
          inspectorId: session.user.id,
          status: overallStatus as unknown as QCStatus,
          notes: notes || null,
          checkedAt: new Date()
        }
      })

      if (photoUrl) {
        await tx.photoRecord.create({
          data: {
            productionJobId,
            photoUrl,
            notes: notes || "Foto bukti inspeksi QC"
          }
        })
      }

      await tx.productionJob.update({
        where: { id: productionJobId },
        data: { 
          status: overallStatus === QCChecklistStatus.PASSED ? "DONE" : "QUEUE",
          notes: overallStatus === QCChecklistStatus.PASSED ? null : (notes || "Perlu perbaikan QC")
        }
      })
      
      if (overallStatus === QCChecklistStatus.PASSED) {
        for (const bom of job.orderItem.product.materials) {
          const totalNeeded = bom.qtyNeeded * job.orderItem.qty
          await tx.material.update({
            where: { id: bom.materialId },
            data: { stockQty: { decrement: totalNeeded } }
          })
          await tx.inventoryLog.create({
            data: {
              materialId: bom.materialId,
              type: "OUT",
              qty: totalNeeded,
              notes: `Otomatis: QC Lolos Order ${job.orderItem.order.orderNumber} (${job.orderItem.product.name})`
            }
          })
        }
        
        const otherJobs = await tx.productionJob.findMany({
          where: { 
            orderItem: { orderId: job.orderItem.orderId },
            id: { not: productionJobId }
          }
        })
        
        const allDone = otherJobs.every(j => j.status === "DONE")
        if (allDone || otherJobs.length === 0) {
          await tx.order.update({
            where: { id: job.orderItem.orderId },
            data: { status: "READY_FOR_PICKUP" }
          })
        }
      }
    })
    revalidatePath("/operator")
    revalidatePath("/operator/quality-control")
    return { success: true, overallStatus, notes }
  } catch {
    return { error: "Gagal mengirim QC check" }
  }
}

export async function uploadQCPhoto(formData: FormData) {
  const productionJobId = formData.get("productionJobId") as string
  const notes = formData.get("notes") as string
  const file = formData.get("file") as File | null
  let photoUrl = formData.get("photoUrl") as string | null

  if (file && file.size > 0) {
    photoUrl = await saveQCPhotoFile(file)
  }

  if (!productionJobId || !photoUrl) {
    return { error: "File foto bukti QC wajib diunggah (JPG/PNG max 5MB)" }
  }
  try {
    await prisma.photoRecord.create({
      data: { productionJobId, photoUrl, notes }
    })
    revalidatePath("/operator/quality-control")
    return { success: true }
  } catch {
    return { error: "Gagal upload foto QC" }
  }
}

export async function deleteQCPhoto(photoId: string) {
  try {
    await prisma.photoRecord.delete({ where: { id: photoId } })
    revalidatePath("/operator/quality-control")
    return { success: true }
  } catch {
    return { error: "Gagal menghapus foto" }
  }
}

export async function getQCQueue() {
  const jobs = await prisma.productionJob.findMany({
    where: { status: "QC_CHECK" },
    include: {
      orderItem: { include: { order: true, product: true } },
      qcItems: true,
      photos: true
    },
    orderBy: { createdAt: "asc" }
  })
  return jobs
}

export async function getQCStatistics() {
  const [total, passed, rejected, rework] = await Promise.all([
    prisma.qCChecklistItem.count(),
    prisma.qCChecklistItem.count({ where: { status: QCChecklistStatus.PASSED } }),
    prisma.qCChecklistItem.count({ where: { status: QCChecklistStatus.REJECTED } }),
    prisma.qCChecklistItem.count({ where: { status: QCChecklistStatus.NEEDS_REWORK } })
  ])
  return {
    total,
    passed,
    rejected,
    rework,
    passRate: total > 0 ? ((passed / total) * 100).toFixed(2) : "0"
  }
}

export async function getQCHistory(filters?: {
  status?: QCChecklistStatus
  page?: number
  limit?: number
}) {
  const page = filters?.page || 1
  const limit = filters?.limit || 20
  const skip = (page - 1) * limit
  const where: Prisma.QCChecklistItemWhereInput = {}
  if (filters?.status) where.status = filters.status
  const [items, total] = await Promise.all([
    prisma.qCChecklistItem.findMany({
      where,
      include: { productionJob: { include: { orderItem: { include: { product: true } } } } },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit
    }),
    prisma.qCChecklistItem.count({ where })
  ])
  return {
    items,
    pagination: { total, page, limit, pages: Math.ceil(total / limit) }
  }
}