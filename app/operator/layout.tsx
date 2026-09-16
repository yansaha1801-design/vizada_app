"use client"

import { SharedDashboardLayout } from "@/components/shared-dashboard-layout"
import { Printer, CheckSquare } from "lucide-react"

const navItems = [
  { href: "/operator", label: "Antrean Produksi", icon: Printer },
  { href: "/operator/quality-control", label: "Quality Control", icon: CheckSquare },
]

export default function OperatorLayout({ children }: { children: React.ReactNode }) {
  return <SharedDashboardLayout title="RUANG MESIN" navItems={navItems}>{children}</SharedDashboardLayout>
}