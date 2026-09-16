"use client"

import { SharedDashboardLayout } from "@/components/shared-dashboard-layout"
import { LayoutDashboard, Package, DollarSign, Wrench, Calendar, BarChart3} from "lucide-react"

const navItems = [
  { href: "/management", label: "Dashboard Utama", icon: LayoutDashboard },
  { href: "/management/inventory", label: "Manajemen Inventaris", icon: Package },
  { href: "/management/finance", label: "Manajemen Keuangan", icon: DollarSign },
  { href: "/management/machines", label: "Mesin Cetak", icon: Wrench },
  { href: "/management/schedule", label: "Jadwal Produksi", icon: Calendar },
  { href: "/management/reports", label: "Laporan Bisnis", icon: BarChart3 },
]

export default function ManagementLayout({ children }: { children: React.ReactNode }) {
  return <SharedDashboardLayout title="PANEL OWNER" navItems={navItems}>{children}</SharedDashboardLayout>
}