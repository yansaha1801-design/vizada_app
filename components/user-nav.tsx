"use client"

import { signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, FileText, LayoutDashboard, Shield, Printer, Package, Sparkles } from "lucide-react"

export function UserNav({ user }: { user: { name?: string | null; role?: string } }) {
  const router = useRouter()

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800"
      case "MANAGEMENT":
        return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
      case "OPERATOR":
        return "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800"
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700"
    }
  }

  const initial = user.name ? user.name.charAt(0).toUpperCase() : "U"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs transition-all duration-150 cursor-pointer outline-none">
        <div className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-700 text-white font-bold text-xs shadow-xs">
          {initial}
          <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
        </div>
        <span className="hidden sm:inline-block text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[120px] truncate">
          {user.name}
        </span>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-60 p-2 rounded-xl shadow-lg border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex flex-col p-2 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900 dark:text-white truncate">{user.name || "Pengguna"}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getRoleBadge(user.role)}`}>
                {user.role || "CUSTOMER"}
              </span>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Shield className="h-3 w-3 text-blue-700" /> Akun Terverifikasi
            </span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="my-1.5" />

          {user.role === "ADMIN" && (
            <DropdownMenuItem 
              className="cursor-pointer flex items-center gap-2.5 py-2 px-2.5 rounded-xl font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
              onClick={() => router.push("/admin")}
            >
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600">
                <Shield className="h-4 w-4" />
              </div>
              <span>Panel Admin</span>
            </DropdownMenuItem>
          )}

          {user.role === "MANAGEMENT" && (
            <DropdownMenuItem 
              className="cursor-pointer flex items-center gap-2.5 py-2 px-2.5 rounded-xl font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
              onClick={() => router.push("/management")}
            >
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600">
                <LayoutDashboard className="h-4 w-4" />
              </div>
              <span>Panel Owner</span>
            </DropdownMenuItem>
          )}

          {user.role === "OPERATOR" && (
            <DropdownMenuItem 
              className="cursor-pointer flex items-center gap-2.5 py-2 px-2.5 rounded-xl font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 transition-colors"
              onClick={() => router.push("/operator")}
            >
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600">
                <Printer className="h-4 w-4" />
              </div>
              <span>Ruang Mesin</span>
            </DropdownMenuItem>
          )}

          {(user.role === "ADMIN" || user.role === "MANAGEMENT" || user.role === "OPERATOR") && (
            <DropdownMenuSeparator className="my-1.5" />
          )}

          <DropdownMenuItem 
            className="cursor-pointer flex items-center gap-2.5 py-2 px-2.5 rounded-xl text-sm font-medium hover:bg-muted transition-colors"
            onClick={() => router.push("/products")}
          >
            <div className="p-1.5 rounded-lg bg-muted text-muted-foreground">
              <Package className="h-4 w-4" />
            </div>
            <span>Katalog Layanan Cetak</span>
          </DropdownMenuItem>

          <DropdownMenuItem 
            className="cursor-pointer flex items-center gap-2.5 py-2 px-2.5 rounded-xl text-sm font-medium hover:bg-muted transition-colors"
            onClick={() => router.push("/orders")}
          >
            <div className="p-1.5 rounded-lg bg-muted text-muted-foreground">
              <FileText className="h-4 w-4" />
            </div>
            <span>Riwayat Pesanan Saya</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator className="my-1.5" />
        
        <DropdownMenuItem 
          className="cursor-pointer text-rose-600 focus:text-rose-600 hover:bg-rose-500/10 flex items-center gap-2.5 py-2 px-2.5 rounded-xl text-sm font-medium transition-colors" 
          onClick={() => signOut({ callbackUrl: '/' })}
        >
          <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600">
            <LogOut className="h-4 w-4" />
          </div>
          <span>Keluar dari Akun</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}