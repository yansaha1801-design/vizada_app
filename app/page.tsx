import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { 
  Printer, 
  Clock, 
  ShieldCheck, 
  ArrowRight, 
  Palette, 
  FileText, 
  Layers, 
  Truck
} from "lucide-react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { UserNav } from "@/components/user-nav"

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 selection:bg-blue-600/15 selection:text-blue-700">
      {/* Top Navigation */}
      <header className="px-6 lg:px-12 h-20 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 sticky top-0 z-50 backdrop-blur-md">
        <div className="flex items-center gap-8">
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

          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-600 dark:text-slate-300">
            <Link className="hover:text-blue-700 dark:hover:text-blue-400 transition-colors" href="/products">
              Produk Cetak
            </Link>
            <Link className="hover:text-blue-700 dark:hover:text-blue-400 transition-colors" href="#kualitas">
              Bahan & Kualitas
            </Link>
            <Link className="hover:text-blue-700 dark:hover:text-blue-400 transition-colors" href="#alur-pesan">
              Cara Pemesanan
            </Link>
            <Link className="hover:text-blue-700 dark:hover:text-blue-400 transition-colors" href="#monitoring">
              Status Pesanan
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {session?.user ? (
            <div className="flex items-center gap-3">
              <Link href="/orders">
                <Button variant="outline" size="sm" className="hidden sm:inline-flex border-slate-200 text-xs font-semibold">
                  Pesanan Saya
                </Button>
              </Link>
              <UserNav user={session.user} />
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="font-semibold text-slate-700 hover:text-slate-900 text-sm">
                  Masuk
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-blue-700 hover:bg-blue-800 text-white font-semibold text-sm px-4 rounded-lg shadow-sm">
                  Daftar
                </Button>
              </Link>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section: Clean Split Layout with Pure Photography */}
        <section className="relative w-full py-12 md:py-18 lg:py-20 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800">
          <div className="container px-4 md:px-8 lg:px-12 mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              
              {/* Left Column: Natural, Direct Copy & CTAs */}
              <div className="lg:col-span-6 space-y-6">
                <div className="space-y-4">
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.18]">
                    Percetakan Digital & Offset Berkualitas untuk Segala Kebutuhan
                  </h1>
                  <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed">
                    Melayani cetak dokumen, buku, brosur, banner, stiker label, kemasan produk, hingga merchandise. Pengerjaan rapi, tepat waktu, dan harga terjangkau.
                  </p>
                </div>

                {/* Direct Actions */}
                <div className="flex flex-col sm:flex-row gap-3.5 pt-1">
                  <Link href="/products">
                    <Button size="lg" className="w-full sm:w-auto h-12 px-7 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg shadow-sm hover:shadow-md transition-all">
                      Mulai Pesanan
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href={session?.user ? "/orders" : "/login"}>
                    <Button variant="outline" size="lg" className="w-full sm:w-auto h-12 px-6 font-semibold rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700">
                      <FileText className="mr-2 h-4 w-4 text-slate-500" />
                      Cek Status Pesanan
                    </Button>
                  </Link>
                </div>

                {/* Natural Trust Points */}
                <div className="pt-6 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <span className="font-bold text-sm block text-slate-900 dark:text-white">Hasil Cetak Rapi</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Warna pekat & potongan presisi</span>
                  </div>
                  <div>
                    <span className="font-bold text-sm block text-slate-900 dark:text-white">Tepat Waktu</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Pengerjaan sesuai jadwal</span>
                  </div>
                  <div>
                    <span className="font-bold text-sm block text-slate-900 dark:text-white">Harga Terjangkau</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Transparan tanpa biaya tersembunyi</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Clean Machinery Photo (Just the Image) */}
              <div className="lg:col-span-6">
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md bg-slate-100 dark:bg-slate-800 aspect-[4/3] w-full">
                  <Image 
                    src="/images/printing-machine-hero.jpg" 
                    alt="Mesin Cetak Vizada" 
                    fill
                    priority
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                  />
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 4 Keunggulan Layanan */}
        <section className="w-full py-12 bg-slate-50 dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800">
          <div className="container px-4 md:px-8 lg:px-12 mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 mb-4">
                  <Printer className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Satuan Maupun Partai Besar</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  Kami melayani pesanan jumlah sedikit untuk kebutuhan pribadi hingga jumlah ribuan untuk perusahaan atau event.
                </p>
              </div>

              <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 mb-4">
                  <Palette className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Hasil Cetak Tajam & Jelas</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  Mesin cetak yang terawat menghasilkan cetakan dengan warna yang tajam, teks terbaca jelas, dan tidak mudah luntur.
                </p>
              </div>

              <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 mb-4">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Pemeriksaan Kualitas Rapi</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  Setiap pesanan diperiksa dan difoto sebelum diserahkan, memastikan barang yang diterima sesuai dengan pesanan.
                </p>
              </div>

              <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 mb-4">
                  <Clock className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Pengerjaan Sesuai Jadwal</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  Alur produksi yang teratur memastikan cetakan selesai tepat waktu sesuai tenggat waktu yang disepakati.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* Bahan & Kualitas (With Pure Photography) */}
        <section id="kualitas" className="w-full py-16 md:py-20 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800">
          <div className="container px-4 md:px-8 lg:px-12 mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              
              {/* Left Column: Clear Material Options */}
              <div className="lg:col-span-6 space-y-6">
                <div className="space-y-3">
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                    Pilihan Bahan & Finishing Berkualitas
                  </h2>
                  <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed">
                    Kami menyediakan beragam varian kertas, stiker, dan opsi finishing untuk memastikan cetakan Anda tampil rapi, awet, dan profesional.
                  </p>
                </div>

                <div className="space-y-4 pt-1">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      Pilihan Kertas Lengkap
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      Tersedia HVS, Art Paper, Art Carton tebal, Kertas Ivory, Kertas Kraft cokelat, hingga Stiker Vinyl tahan air.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      Opsi Finishing Rapi
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      Laminasi Doff atau Glossy, jilid lem panas (buku), spiral kawat, foil emas/perak, dan potong pola sesuai kebutuhan.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      Jaminan Kepuasan Cetak
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      Kami berkomitmen memberikan hasil terbaik. Jika terdapat cacat produksi yang tidak sesuai pesanan, kami siap membantu penyelesaiannya.
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <Link href="/products">
                    <Button className="bg-blue-700 hover:bg-blue-800 text-white font-semibold text-sm px-6 h-11 rounded-lg">
                      Lihat Produk Cetak
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Right Column: Clean Print Sample Photo (Just the Image) */}
              <div className="lg:col-span-6">
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md bg-slate-100 dark:bg-slate-800 aspect-[4/3] w-full">
                  <Image 
                    src="/images/print-quality-showcase.jpg" 
                    alt="Contoh Hasil Cetak Vizada" 
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                  />
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Alur Pemesanan 4 Langkah */}
        <section id="alur-pesan" className="w-full py-16 md:py-20 bg-slate-50 dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800">
          <div className="container px-4 md:px-8 lg:px-12 mx-auto">
            
            <div className="max-w-2xl mb-12 text-center mx-auto space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                Cara Pemesanan di Vizada
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                4 langkah praktis untuk memesan cetakan Anda
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Step 1 */}
              <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="text-2xl font-black text-blue-700 dark:text-blue-400 mb-2">
                  01
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Pilih Produk</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  Pilih produk yang diinginkan, tentukan jenis kertas, ukuran, dan jumlah yang dibutuhkan.
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="text-2xl font-black text-blue-700 dark:text-blue-400 mb-2">
                  02
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Upload Desain</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  Unggah file desain yang siap dicetak berformat PDF, JPG, atau PNG dengan resolusi yang jelas.
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="text-2xl font-black text-blue-700 dark:text-blue-400 mb-2">
                  03
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Proses Cetak</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  Pesanan Anda langsung diproses dan dicek oleh tim produksi agar hasilnya rapi dan sesuai.
                </p>
              </div>

              {/* Step 4 */}
              <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="text-2xl font-black text-blue-700 dark:text-blue-400 mb-2">
                  04
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Selesai & Kirim</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  Pesanan dikemas rapi dan siap diambil di workshop atau dikirimkan langsung ke alamat Anda.
                </p>
              </div>

            </div>

            <div className="mt-10 text-center">
              <Link href="/products">
                <Button size="lg" className="bg-blue-700 hover:bg-blue-800 text-white font-bold px-8 h-12 rounded-lg shadow-sm">
                  Pesan Sekarang
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

          </div>
        </section>

        {/* Monitoring & Status Pesanan */}
        <section id="monitoring" className="w-full py-16 md:py-20 bg-white dark:bg-slate-900">
          <div className="container px-4 md:px-8 lg:px-12 mx-auto">
            <div className="max-w-3xl mx-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-8 sm:p-10">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-700">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    Pantau Perkembangan Pesanan Anda
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    Cek tahapan cetak dan status pengerjaan pesanan Anda secara online
                  </p>
                </div>
                <Link href="/orders">
                  <Button variant="outline" className="text-xs font-bold border-slate-300">
                    Cek Status Pesanan
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
                <div className="space-y-1.5">
                  <span className="text-sm font-bold text-slate-900 dark:text-white block">Status Real-Time</span>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Ketahui apakah pesanan Anda sedang dalam antrean, proses cetak, atau siap diambil.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <span className="text-sm font-bold text-slate-900 dark:text-white block">Foto Hasil Jadi</span>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Lihat dokumentasi foto barang setelah selesai diproduksi langsung di akun Anda.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <span className="text-sm font-bold text-slate-900 dark:text-white block">Riwayat Transaksi</span>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Catatan pesanan dan bukti nota tersimpan rapi untuk memudahkan pemesanan ulang.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-10 px-6 lg:px-12 text-slate-600 dark:text-slate-400 text-sm">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            
            {/* Col 1: Identity */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-700 text-white font-bold text-xs">
                  <Printer className="h-4 w-4" />
                </div>
                <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">VIZADA</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm">
                Layanan percetakan digital dan offset untuk kebutuhan personal, instansi, dan bisnis dengan kualitas terjamin dan pengerjaan tepat waktu.
              </p>
            </div>

            {/* Col 2: Jam Operasional */}
            <div className="space-y-2">
              <div className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
                Jam Operasional
              </div>
              <div className="text-xs space-y-1 text-slate-500 dark:text-slate-400">
                <p>Senin – Jumat: 08.00 – 21.00 WIB</p>
                <p>Sabtu: 08.00 – 17.00 WIB</p>
                <p>Minggu: Libur (Pemesanan online tetap diterima)</p>
              </div>
            </div>

            {/* Col 3: Navigasi Cepat */}
            <div className="space-y-2">
              <div className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
                Tautan Cepat
              </div>
              <ul className="space-y-1.5 text-xs">
                <li><Link href="/products" className="hover:text-blue-700 transition-colors">Katalog Produk</Link></li>
                <li><Link href="/orders" className="hover:text-blue-700 transition-colors">Lacak Pesanan</Link></li>
                <li><Link href="/login" className="hover:text-blue-700 transition-colors">Masuk Akun</Link></li>
              </ul>
            </div>

          </div>

          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
            <div>
              © 2026 Vizada Percetakan. Hak cipta dilindungi.
            </div>
            <div>
              Layanan Percetakan Digital & Offset
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}