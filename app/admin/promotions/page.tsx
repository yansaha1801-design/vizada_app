import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tag } from "lucide-react"
import { CreatePromotionModal, EditPromotionModal, DeletePromotionModal, ManageVoucherModal } from "./promotion-modals"

export default async function PromotionPage() {
  const promotions = await prisma.promotion.findMany({
    include: { vouchers: true }, // MENGAMBIL SEMUA KODE VOUCHER
    orderBy: { createdAt: "desc" }
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kelola Promosi</h1>
          <p className="text-muted-foreground">Buat dan kelola diskon, voucher, dan bundling produk.</p>
        </div>
        <CreatePromotionModal />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" /> Daftar Promosi
          </CardTitle>
          <CardDescription>Semua promosi aktif dan mendatang.</CardDescription>
        </CardHeader>
        <CardContent>
          {promotions.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg">
              Belum ada promosi.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Promosi</TableHead>
                    <TableHead>Tipe</TableHead>
                    <TableHead>Nilai</TableHead>
                    <TableHead>Tanggal Mulai</TableHead>
                    <TableHead>Tanggal Akhir</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {promotions.map((promo) => {
                    const now = new Date()
                    const isActive = promo.active && now >= promo.startDate && now <= promo.endDate

                    return (
                      <TableRow key={promo.id}>
                        <TableCell className="font-medium">{promo.name}</TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {promo.type === "DISKON_PERSEN"
                              ? "Diskon %"
                              : promo.type === "DISKON_NOMINAL"
                              ? "Diskon Nominal"
                              : promo.type === "VOUCHER"
                              ? "Voucher"
                              : "Bundling"}
                          </span>
                        </TableCell>
                        <TableCell>{promo.value}</TableCell>
                        <TableCell>{new Date(promo.startDate).toLocaleDateString("id-ID")}</TableCell>
                        <TableCell>{new Date(promo.endDate).toLocaleDateString("id-ID")}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                          }`}>
                            {isActive ? "Aktif" : "Tidak Aktif"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          {/* TOMBOL MANAGE VOUCHER */}
                          <ManageVoucherModal promo={promo} vouchers={promo.vouchers} />
                          <EditPromotionModal promo={promo} />
                          <DeletePromotionModal promoId={promo.id} />
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}