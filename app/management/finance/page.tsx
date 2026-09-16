import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DollarSign } from "lucide-react"
import { CreateTransactionModal, EditTransactionModal, DeleteTransactionModal } from "./finance-modals"

export default async function FinancePage() {
  const transactions = await prisma.financialTransaction.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
    take: 50
  })

  const categories = await prisma.financialCategory.findMany({
    orderBy: { name: "asc" }
  })

  const totalIncome = transactions
    .filter(t => t.type === "PEMASUKAN")
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpense = transactions
    .filter(t => t.type === "PENGELUARAN")
    .reduce((sum, t) => sum + t.amount, 0)

  const profit = totalIncome - totalExpense

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manajemen Keuangan</h1>
          <p className="text-muted-foreground">Pencatatan pemasukan dan pengeluaran bisnis.</p>
        </div>
        <CreateTransactionModal categories={categories} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Pemasukan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp {totalIncome.toLocaleString("id-ID")}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Pengeluaran</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp {totalExpense.toLocaleString("id-ID")}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Laba/Rugi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${profit >= 0 ? "text-green-600" : "text-red-600"}`}>
              Rp {profit.toLocaleString("id-ID")}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" /> Riwayat Transaksi
          </CardTitle>
          <CardDescription>Daftar lengkap pemasukan dan pengeluaran keuangan.</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg">
              Belum ada data transaksi keuangan.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Tipe</TableHead>
                    <TableHead>Jumlah</TableHead>
                    <TableHead>Deskripsi</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{new Date(transaction.createdAt).toLocaleDateString("id-ID")}</TableCell>
                      <TableCell>{transaction.category.name}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          transaction.type === "PEMASUKAN"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                          {transaction.type === "PEMASUKAN" ? "Pemasukan" : "Pengeluaran"}
                        </span>
                      </TableCell>
                      <TableCell className="font-semibold">
                        Rp {transaction.amount.toLocaleString("id-ID")}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{transaction.description}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <EditTransactionModal transaction={transaction} categories={categories} />
                        <DeleteTransactionModal transactionId={transaction.id} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
