import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingCart, Tag, Printer, ArrowRight } from "lucide-react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { UserNav } from "@/components/user-nav"

export default async function CustomerProductsPage() {
  const session = await getServerSession(authOptions)
  const products = await prisma.product.findMany({
    include: { category: true, designs: true },
    orderBy: { category: { name: "asc" } },
  })

  const formatRupiah = (price: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(price)
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Top Header */}
      <header className="px-6 lg:px-12 h-20 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 sticky top-0 z-50 backdrop-blur-md">
        <Link className="flex items-center gap-3 group" href="/">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-700 text-white shadow-sm group-hover:bg-blue-800 transition-colors">
            <Printer className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white leading-none">
              VIZADA
            </span>
            <span className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase mt-0.5">
              Percetakan & Digital Print
            </span>
          </div>
        </Link>
        <div className="ml-auto flex items-center gap-3">
          {session?.user ? (
            <>
              <Link href="/orders">
                <Button variant="outline" size="sm" className="border-slate-200 dark:border-slate-700 text-xs font-semibold">
                  Riwayat Pesanan
                </Button>
              </Link>
              <UserNav user={session.user} />
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="font-semibold text-xs">Masuk</Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs rounded-lg shadow-sm">
                  Daftar
                </Button>
              </Link>
            </>
          )}
        </div>
      </header>

      <main className="flex-1 container px-4 md:px-8 lg:px-12 mx-auto py-8 md:py-12">
        <div className="flex flex-col space-y-2 mb-10 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Katalog Produk Cetak
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              {products.length} Produk
            </span>
          </div>
          <p className="max-w-[700px] text-slate-600 dark:text-slate-400 text-sm">
            Pilih layanan percetakan yang Anda butuhkan. Tersedia template siap cetak dan opsi unggah file desain sendiri.
          </p>
        </div>

        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 shadow-xs">
            <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 mb-3">
              <ShoppingCart className="h-8 w-8" />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Belum Ada Produk</h2>
            <p className="text-slate-500 text-xs mt-1">Daftar produk cetak sedang diperbarui oleh admin.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => {
              const displayImage = product.imageUrl || product.designs[0]?.imageUrl

              return (
                <Card 
                  key={product.id} 
                  className="group flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl shadow-xs hover:border-slate-300 hover:shadow-sm transition-all"
                >
                  {/* Card Cover Image */}
                  <div className="relative w-full h-48 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    {displayImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img 
                        src={displayImage} 
                        alt={product.name} 
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                        <Tag className="h-8 w-8 mb-1 opacity-50" />
                        <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">Vizada Print</span>
                      </div>
                    )}

                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      <span className="inline-flex items-center rounded-md bg-white/95 dark:bg-slate-900/95 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-xs">
                        {product.category.name}
                      </span>
                    </div>

                    {product.designs.length > 0 && (
                      <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center">
                        <span className="inline-flex items-center rounded-md bg-slate-900/90 text-white px-2 py-0.5 text-[10px] font-semibold shadow-xs">
                          {product.designs.length} Pilihan Desain
                        </span>
                      </div>
                    )}
                  </div>

                  <CardHeader className="pb-2 pt-4 px-5">
                    <CardTitle className="line-clamp-1 text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                      {product.name}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 text-xs h-8 text-slate-500 dark:text-slate-400">
                      {product.description || "Layanan percetakan berkualitas dengan pengerjaan rapi."}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pb-4 px-5 flex-1 flex flex-col justify-end">
                    <div className="flex flex-col pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[11px] text-slate-400 font-medium">Harga</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-bold text-slate-900 dark:text-white">{formatRupiah(product.basePrice)}</span>
                        <span className="text-xs text-slate-500 font-medium">/ {product.unit}</span>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="pt-0 pb-5 px-5">
                    <Link href={`/orders/create?productId=${product.id}`} className="w-full">
                      <Button className="w-full font-semibold text-xs rounded-lg bg-blue-700 hover:bg-blue-800 text-white shadow-xs transition-all">
                        Pesan Sekarang <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}