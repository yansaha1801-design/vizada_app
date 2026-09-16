"use client"

import { registerUser } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardTitle, CardFooter } from "@/components/ui/card"
import Link from "next/link"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { ArrowLeft, Loader2, Printer } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    
    const formData = new FormData(e.currentTarget)
    const result = await registerUser(formData)

    if (result?.error) {
      toast.error(result.error)
      setIsLoading(false)
    } else if (result?.success) {
      toast.success("Akun berhasil dibuat! Silakan login.")
      router.push("/login")
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4">
      <div className="w-full max-w-md mb-6">
        <Link href="/">
          <Button variant="ghost" size="sm" className="font-semibold text-xs rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800">
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Kembali ke Beranda
          </Button>
        </Link>
      </div>

      <Card className="w-full max-w-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md rounded-2xl overflow-hidden">
        {/* Brand Header */}
        <div className="flex flex-col items-center pt-8 pb-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-700 text-white shadow-sm mb-3">
            <Printer className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Daftar Akun Baru
          </CardTitle>
          <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Buat akun untuk memesan cetakan dan memantau status produksi Anda
          </CardDescription>
        </div>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-3.5 pt-4 px-6 sm:px-8">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-semibold text-slate-700 dark:text-slate-300">Nama Lengkap</Label>
              <Input 
                id="name" 
                name="name" 
                placeholder="Contoh: Budi Santoso" 
                disabled={isLoading} 
                required 
                className="h-10 rounded-lg border-slate-200 dark:border-slate-700 text-sm focus-visible:ring-blue-700"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold text-slate-700 dark:text-slate-300">Alamat Email</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                placeholder="nama@email.com" 
                disabled={isLoading} 
                required 
                className="h-10 rounded-lg border-slate-200 dark:border-slate-700 text-sm focus-visible:ring-blue-700"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs font-semibold text-slate-700 dark:text-slate-300">Nomor WhatsApp</Label>
              <Input 
                id="phone" 
                name="phone" 
                type="tel" 
                placeholder="08123456789" 
                disabled={isLoading} 
                required 
                className="h-10 rounded-lg border-slate-200 dark:border-slate-700 text-sm focus-visible:ring-blue-700"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-semibold text-slate-700 dark:text-slate-300">Kata Sandi</Label>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                placeholder="Minimal 6 karakter" 
                disabled={isLoading} 
                required 
                className="h-10 rounded-lg border-slate-200 dark:border-slate-700 text-sm focus-visible:ring-blue-700"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pt-2 pb-8 px-6 sm:px-8">
            <Button type="submit" className="w-full h-11 text-sm font-bold bg-blue-700 hover:bg-blue-800 text-white rounded-lg shadow-sm" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Mendaftarkan akun...</span>
                </>
              ) : (
                "Buat Akun Sekarang"
              )}
            </Button>
            <div className="text-xs text-center text-slate-500 dark:text-slate-400">
              Sudah memiliki akun?{" "}
              <Link href="/login" className="text-blue-700 dark:text-blue-400 font-semibold hover:underline">
                Masuk disini
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}