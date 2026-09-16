"use client"

import { signIn, getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardTitle, CardFooter } from "@/components/ui/card"
import Link from "next/link"
import { toast } from "sonner"
import { ArrowLeft, Loader2, Printer } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    if (!email || !password) {
      toast.error("Email dan password wajib diisi")
      setIsLoading(false)
      return
    }

    const res = await signIn("credentials", { email, password, redirect: false })

    if (res?.error) {
      toast.error("Email atau password salah")
      setIsLoading(false)
    } else {
      toast.success("Login berhasil!")

      const session = await getSession()
      const role = session?.user?.role

      if (role === "MANAGEMENT") {
        router.push("/management")
      } else if (role === "ADMIN") {
        router.push("/admin")
      } else if (role === "OPERATOR") {
        router.push("/operator")
      } else {
        router.push("/products")
      }
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
        {/* Brand Icon Header */}
        <div className="flex flex-col items-center pt-8 pb-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-700 text-white shadow-sm mb-3">
            <Printer className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Masuk ke Vizada
          </CardTitle>
          <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Masuk dengan akun Anda untuk memesan atau memantau status pesanan
          </CardDescription>
        </div>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pt-4 px-6 sm:px-8">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold text-slate-700 dark:text-slate-300">Email</Label>
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-semibold text-slate-700 dark:text-slate-300">Password</Label>
              </div>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                placeholder="••••••••" 
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
                  <span>Memverifikasi...</span>
                </>
              ) : (
                "Masuk ke Akun"
              )}
            </Button>
            <div className="text-xs text-center text-slate-500 dark:text-slate-400">
              Belum memiliki akun?{" "}
              <Link href="/register" className="text-blue-700 dark:text-blue-400 font-semibold hover:underline">
                Daftar sekarang
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}