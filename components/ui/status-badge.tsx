import React from "react"
import { cn } from "@/lib/utils"

export type OrderStatus = 
  | "PENDING_PAYMENT" 
  | "WAITING_APPROVAL" 
  | "IN_PRODUCTION" 
  | "READY_FOR_PICKUP" 
  | "COMPLETED" 
  | "CANCELLED" 
  | string

interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: OrderStatus
  size?: "sm" | "default" | "lg"
  withDot?: boolean
}

export function StatusBadge({
  status,
  size = "default",
  withDot = true,
  className,
  ...props
}: StatusBadgeProps) {
  const getStatusConfig = (val: string) => {
    switch (val) {
      case "PENDING_PAYMENT":
        return {
          label: "Menunggu Pembayaran",
          bg: "bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30",
          dot: "bg-amber-500",
          pulse: true,
        }
      case "WAITING_APPROVAL":
        return {
          label: "Menunggu Persetujuan",
          bg: "bg-sky-500/10 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 border-sky-500/30",
          dot: "bg-sky-500",
          pulse: true,
        }
      case "IN_PRODUCTION":
      case "PRINTING":
        return {
          label: "Sedang Diproduksi",
          bg: "bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-500/30",
          dot: "bg-indigo-500",
          pulse: true,
        }
      case "READY_FOR_PICKUP":
        return {
          label: "Siap Diambil",
          bg: "bg-teal-500/10 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 border-teal-500/30",
          dot: "bg-teal-500",
          pulse: false,
        }
      case "COMPLETED":
      case "AVAILABLE":
      case "PASSED":
        return {
          label: val === "AVAILABLE" ? "Tersedia" : val === "PASSED" ? "Lolos QC" : "Selesai",
          bg: "bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
          dot: "bg-emerald-500",
          pulse: false,
        }
      case "CANCELLED":
      case "REJECTED":
      case "BROKEN":
        return {
          label: val === "BROKEN" ? "Rusak" : val === "REJECTED" ? "Ditolak" : "Dibatalkan",
          bg: "bg-rose-500/10 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/30",
          dot: "bg-rose-500",
          pulse: false,
        }
      case "IN_USE":
        return {
          label: "Sedang Digunakan",
          bg: "bg-blue-500/10 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30",
          dot: "bg-blue-500",
          pulse: true,
        }
      case "MAINTENANCE":
        return {
          label: "Perawatan",
          bg: "bg-orange-500/10 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-500/30",
          dot: "bg-orange-500",
          pulse: true,
        }
      default:
        return {
          label: val,
          bg: "bg-slate-500/10 dark:bg-slate-500/20 text-slate-700 dark:text-slate-300 border-slate-500/30",
          dot: "bg-slate-500",
          pulse: false,
        }
    }
  }

  const config = getStatusConfig(status)

  const sizeClasses = {
    sm: "text-[11px] px-2 py-0.5 gap-1.5",
    default: "text-xs px-2.5 py-1 gap-1.5",
    lg: "text-sm px-3.5 py-1.5 gap-2 font-medium",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full border shadow-xs transition-all duration-200 backdrop-blur-xs",
        config.bg,
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {withDot && (
        <span className="relative flex h-2 w-2">
          {config.pulse && (
            <span
              className={cn(
                "absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping",
                config.dot
              )}
            />
          )}
          <span
            className={cn(
              "relative inline-flex rounded-full h-2 w-2",
              config.dot
            )}
          />
        </span>
      )}
      <span>{config.label}</span>
    </span>
  )
}
