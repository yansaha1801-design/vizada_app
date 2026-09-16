"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { LogOut, Menu, Printer, Shield } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button" 
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
}

export function SharedDashboardLayout({ 
  children, 
  title, 
  navItems 
}: { 
  children: React.ReactNode
  title: string
  navItems: NavItem[] 
}) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true)
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  const initial = session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "U"

  return (
    <div className="grid h-screen w-full overflow-hidden md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr] bg-background text-foreground">
      {/* Desktop Sidebar */}
      <aside className="hidden border-r border-border/70 bg-card/75 backdrop-blur-xl md:flex flex-col h-full overflow-hidden shadow-xs">
        {/* Brand Header */}
        <div className="flex h-16 items-center px-6 border-b border-border/70 gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-700 text-white shadow-xs">
            <Printer className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
              VIZADA ERP
            </span>
            <span className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground">
              {title}
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <div className="px-3 pb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
              Navigasi Utama
            </span>
          </div>
          <nav className="space-y-1">
            {mounted && navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || (item.href !== navItems[0].href && pathname.startsWith(`${item.href}/`))
              
              return (
                <Link 
                  key={item.href} 
                  href={item.href} 
                  className={`group flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors ${
                    isActive 
                      ? "bg-blue-700 text-white shadow-xs font-semibold" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                  {isActive && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white" />
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="p-3 m-3 rounded-xl bg-muted/50 border border-border/70 space-y-3">
          <div className="flex items-center gap-3">
            <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-700 text-white font-bold text-xs shadow-xs">
              {initial}
              <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-bold text-foreground truncate">
                {session?.user?.name || "Pengguna"}
              </span>
              <span className="text-[10px] text-muted-foreground uppercase font-medium truncate">
                {session?.user?.role || "OPERATOR"}
              </span>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            className="w-full justify-center gap-2 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 hover:border-rose-300 dark:hover:border-rose-800 transition-colors" 
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <LogOut className="h-3.5 w-3.5" />
            Keluar Sistem
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col h-full overflow-hidden">
        {/* Glass Header */}
        <header className="flex h-16 items-center gap-4 glass-header px-4 lg:px-8 shrink-0">
          {mounted ? (
            <Sheet>
              <SheetTrigger className={`${buttonVariants({ variant: "outline", size: "icon" })} shrink-0 md:hidden rounded-xl`}>
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </SheetTrigger>
              <SheetContent side="left" className="flex flex-col w-72 p-0">
                <SheetTitle className="sr-only">Menu Navigasi</SheetTitle> 
                <div className="flex h-16 items-center px-6 border-b gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-700 text-white">
                    <Printer className="h-4 w-4" />
                  </div>
                  <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                    VIZADA ERP
                  </span>
                </div>
                <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href || (item.href !== navItems[0].href && pathname.startsWith(`${item.href}/`))
                    
                    return (
                      <Link 
                        key={item.href} 
                        href={item.href} 
                        className={`flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors ${
                          isActive 
                            ? "bg-blue-700 text-white shadow-xs font-semibold" 
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    )
                  })}
                </nav>
                <div className="p-4 border-t">
                  <Button variant="outline" className="w-full justify-start gap-2 text-rose-600" onClick={() => signOut({ callbackUrl: "/" })}>
                    <LogOut className="h-4 w-4" />
                    Keluar Sistem
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          ) : (
            <div className="shrink-0 md:hidden w-10 h-10" />
          )}

          {/* Header Title / Breadcrumbs */}
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              <Shield className="h-3 w-3 text-blue-700" />
              {title}
            </span>
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-muted-foreground ml-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Sistem Operasional Aktif</span>
            </div>
          </div>

          {/* Right Profile Bar */}
          <div className="ml-auto flex items-center gap-3">
            {mounted && (
              <div className="flex items-center gap-3 pl-3 border-l border-border/70">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-bold text-foreground">
                    {session?.user?.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-medium">
                    {session?.user?.role}
                  </span>
                </div>
                <div className="relative flex h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-400 text-white items-center justify-center font-bold text-xs shadow-xs ring-2 ring-primary/20">
                  {initial}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Page Main Content with smooth fade */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-slate-50/60 dark:bg-slate-950/40">
          <div className="animate-in fade-in-50 duration-300 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}