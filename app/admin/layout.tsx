"use client"

import { SharedDashboardLayout } from "@/components/shared-dashboard-layout"
import { ClipboardList, Package, Users, Tag } from "lucide-react"

const navItems = [
  { href: "/admin/orders", label: "Manajemen Pesanan", icon: ClipboardList },
  { href: "/admin/products", label: "Katalog Produk", icon: Package },
  { href: "/admin/users", label: "Manajemen Akun", icon: Users },
  { href: "/admin/promotions", label: "Promosi & Diskon", icon: Tag },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <SharedDashboardLayout title="PANEL ADMIN" navItems={navItems}>{children}</SharedDashboardLayout>
}