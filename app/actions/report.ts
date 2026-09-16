"use server"

import { prisma } from "@/lib/prisma"
import { OrderStatus } from "@/app/generated/prisma/client"

export async function generateSalesReport(startDate: Date, endDate: Date) {
  const orders = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    },
    include: {
      items: true,
      payment: true
    }
  })
  const totalSales = orders.reduce((sum, o) => sum + o.totalAmount, 0)
  const paidOrders = orders.filter(o => o.payment?.status === "PAID")
  const totalPaid = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0)
  const byDate = orders.reduce((acc, o) => {
    const date = o.createdAt.toISOString().split("T")[0]
    if (!acc[date]) acc[date] = 0
    acc[date] += o.totalAmount
    return acc
  }, {} as Record<string, number>)
  return {
    totalOrders: orders.length,
    totalSales,
    totalPaid,
    paidRate: orders.length > 0 ? ((paidOrders.length / orders.length) * 100).toFixed(2) : "0",
    byDate,
    orders
  }
}

export async function generateOrderReport(startDate: Date, endDate: Date) {
  const orders = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    },
    include: {
      items: true,
      payment: true
    }
  })
  const byStatus = {
    [OrderStatus.PENDING_PAYMENT]: orders.filter(o => o.status === OrderStatus.PENDING_PAYMENT).length,
    [OrderStatus.WAITING_APPROVAL]: orders.filter(o => o.status === OrderStatus.WAITING_APPROVAL).length,
    [OrderStatus.IN_PRODUCTION]: orders.filter(o => o.status === OrderStatus.IN_PRODUCTION).length,
    [OrderStatus.READY_FOR_PICKUP]: orders.filter(o => o.status === OrderStatus.READY_FOR_PICKUP).length,
    [OrderStatus.COMPLETED]: orders.filter(o => o.status === OrderStatus.COMPLETED).length,
    [OrderStatus.CANCELLED]: orders.filter(o => o.status === OrderStatus.CANCELLED).length
  }
  return {
    total: orders.length,
    byStatus,
    orders
  }
}

export async function generateCustomerReport() {
  const customers = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    include: {
      orders: {
        where: { status: { not: OrderStatus.CANCELLED } }
      }
    }
  })
  const activeCustomers = customers.filter(c => c.orders.length > 0)
  const totalSpent = customers.map(c => ({
    ...c,
    spent: c.orders.reduce((sum, o) => sum + o.totalAmount, 0)
  }))
  return {
    total: customers.length,
    active: activeCustomers.length,
    topCustomers: totalSpent.sort((a, b) => b.spent - a.spent).slice(0, 10),
    allCustomers: totalSpent
  }
}

export async function generateMaterialUsageReport(startDate: Date, endDate: Date) {
  const logs = await prisma.inventoryLog.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    },
    include: { material: true }
  })
  const byMaterial = logs.reduce((acc, log) => {
    const key = log.material.name
    if (!acc[key]) {
      acc[key] = { in: 0, out: 0, unit: log.material.unit }
    }
    if (log.type === "IN") {
      acc[key].in += log.qty
    } else {
      acc[key].out += log.qty
    }
    return acc
  }, {} as Record<string, { in: number; out: number; unit: string }>)
  return {
    byMaterial,
    logs
  }
}

export async function getPerformanceMetrics(startDate: Date, endDate: Date) {
  const orders = await prisma.order.findMany({
    where: {
      createdAt: { gte: startDate, lte: endDate }
    },
    include: {
      items: { include: { productionJob: true } },
      payment: true
    }
  })
  const qcItems = await prisma.qCChecklistItem.findMany({
    where: {
      createdAt: { gte: startDate, lte: endDate }
    }
  })
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0)
  const completedOrders = orders.filter(o => o.status === OrderStatus.COMPLETED).length
  const avgOrderValue = orders.length > 0 ? (totalRevenue / orders.length).toFixed(2) : "0"
  const qcPassed = qcItems.filter(i => i.status === "PASSED").length
  const qcRate = qcItems.length > 0 ? ((qcPassed / qcItems.length) * 100).toFixed(2) : "0"
  return {
    totalRevenue,
    totalOrders: orders.length,
    completedOrders,
    avgOrderValue,
    qcRate,
    totalQCChecks: qcItems.length
  }
}

export async function getDailyMetrics(date: Date) {
  const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const endOfDay = new Date(startOfDay)
  endOfDay.setDate(endOfDay.getDate() + 1)
  const orders = await prisma.order.findMany({
    where: {
      createdAt: { gte: startOfDay, lt: endOfDay }
    }
  })
  const transactions = await prisma.financialTransaction.findMany({
    where: {
      createdAt: { gte: startOfDay, lt: endOfDay }
    }
  })
  const logs = await prisma.machineMaintenanceLog.findMany({
    where: {
      createdAt: { gte: startOfDay, lt: endOfDay }
    }
  })
  const dailyRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0)
  const pemasukan = transactions.filter(t => t.type === "PEMASUKAN").reduce((sum, t) => sum + t.amount, 0)
  const pengeluaran = transactions.filter(t => t.type === "PENGELUARAN").reduce((sum, t) => sum + t.amount, 0)
  const maintenanceCost = logs.reduce((sum, l) => sum + (l.cost || 0), 0)
  return {
    date: startOfDay.toISOString().split("T")[0],
    orderCount: orders.length,
    revenue: dailyRevenue,
    pemasukan,
    pengeluaran,
    maintenanceCost,
    netProfit: pemasukan - pengeluaran
  }
}

export async function getMonthlyMetrics(year: number, month: number) {
  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 1)
  const dailyData = []
  for (let d = new Date(startDate); d < endDate; d.setDate(d.getDate() + 1)) {
    const metrics = await getDailyMetrics(new Date(d))
    dailyData.push(metrics)
  }
  const totalRevenue = dailyData.reduce((sum, d) => sum + d.revenue, 0)
  const totalCost = dailyData.reduce((sum, d) => sum + d.pengeluaran, 0)
  const avgDaily = dailyData.length > 0 ? (totalRevenue / dailyData.length).toFixed(2) : "0"
  return {
    year,
    month,
    totalRevenue,
    totalCost,
    profit: totalRevenue - totalCost,
    avgDaily,
    dailyData
  }
}