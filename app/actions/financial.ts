"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { FinancialTransactionType, Prisma } from "@/app/generated/prisma/client"

export async function createFinancialCategory(formData: FormData) {
  const name = formData.get("name") as string
  const type = formData.get("type") as FinancialTransactionType
  if (!name || !type) {
    return { error: "Nama dan tipe kategori wajib diisi" }
  }
  try {
    await prisma.financialCategory.create({
      data: { name, type }
    })
    revalidatePath("/management/finance")
    return { success: true }
  } catch {
    return { error: "Gagal membuat kategori keuangan" }
  }
}

export async function createTransaction(formData: FormData) {
  const categoryId = formData.get("categoryId") as string
  const type = formData.get("type") as FinancialTransactionType
  const amount = parseFloat(formData.get("amount") as string)
  const description = formData.get("description") as string
  if (!categoryId || !type || isNaN(amount) || amount <= 0) {
    return { error: "Semua kolom wajib diisi dengan benar" }
  }
  try {
    await prisma.financialTransaction.create({
      data: { categoryId, type, amount, description }
    })
    revalidatePath("/management/finance")
    return { success: true }
  } catch {
    return { error: "Gagal membuat transaksi keuangan" }
  }
}

export async function updateTransaction(id: string, formData: FormData) {
  const categoryId = formData.get("categoryId") as string
  const type = formData.get("type") as FinancialTransactionType
  const amount = parseFloat(formData.get("amount") as string)
  const description = formData.get("description") as string
  if (!categoryId || !type || isNaN(amount) || amount <= 0) {
    return { error: "Semua kolom wajib diisi dengan benar" }
  }
  try {
    await prisma.financialTransaction.update({
      where: { id },
      data: { categoryId, type, amount, description }
    })
    revalidatePath("/management/finance")
    return { success: true }
  } catch {
    return { error: "Gagal memperbarui transaksi" }
  }
}

export async function deleteTransaction(id: string) {
  try {
    await prisma.financialTransaction.delete({ where: { id } })
    revalidatePath("/management/finance")
    return { success: true }
  } catch {
    return { error: "Gagal menghapus transaksi" }
  }
}

export async function getFinancialSummary(period: "daily" | "monthly" | "yearly") {
  const now = new Date()
  let startDate: Date
  if (period === "daily") {
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  } else if (period === "monthly") {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1)
  } else {
    startDate = new Date(now.getFullYear(), 0, 1)
  }
  const transactions = await prisma.financialTransaction.findMany({
    where: { createdAt: { gte: startDate } },
    include: { category: true }
  })
  const pemasukan = transactions
    .filter(t => t.type === FinancialTransactionType.PEMASUKAN)
    .reduce((sum, t) => sum + t.amount, 0)
  const pengeluaran = transactions
    .filter(t => t.type === FinancialTransactionType.PENGELUARAN)
    .reduce((sum, t) => sum + t.amount, 0)
  return {
    pemasukan,
    pengeluaran,
    profit: pemasukan - pengeluaran,
    transactions
  }
}

export async function getProfitLossReport(startDate: Date, endDate: Date) {
  const transactions = await prisma.financialTransaction.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    },
    include: { category: true }
  })
  const categorized = transactions.reduce((acc, t) => {
    const key = t.category.name
    if (!acc[key]) {
      acc[key] = { pemasukan: 0, pengeluaran: 0 }
    }
    if (t.type === FinancialTransactionType.PEMASUKAN) {
      acc[key].pemasukan += t.amount
    } else {
      acc[key].pengeluaran += t.amount
    }
    return acc
  }, {} as Record<string, { pemasukan: number; pengeluaran: number }>)
  const totalPemasukan = Object.values(categorized).reduce((sum, c) => sum + c.pemasukan, 0)
  const totalPengeluaran = Object.values(categorized).reduce((sum, c) => sum + c.pengeluaran, 0)
  return {
    categorized,
    totalPemasukan,
    totalPengeluaran,
    profit: totalPemasukan - totalPengeluaran
  }
}

export async function getAllTransactions(filters?: {
  categoryId?: string
  type?: FinancialTransactionType
  page?: number
  limit?: number
}) {
  const page = filters?.page || 1
  const limit = filters?.limit || 20
  const skip = (page - 1) * limit
  const where: Prisma.FinancialTransactionWhereInput = {}
  if (filters?.categoryId) where.categoryId = filters.categoryId
  if (filters?.type) where.type = filters.type
  const [transactions, total] = await Promise.all([
    prisma.financialTransaction.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit
    }),
    prisma.financialTransaction.count({ where })
  ])
  return {
    transactions,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  }
}