import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { QCForm } from "./qc-form"

type PageProps = {
  params: Promise<{ id: string }> | { id: string }
}

export default async function QCDetailPage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params)
  const job = await prisma.productionJob.findUnique({
    where: { id: resolvedParams.id },
    include: {
      orderItem: {
        include: {
          order: {
            include: { customer: true }
          },
          product: true
        }
      },
      qcItems: true,
      photos: true
    }
  })

  if (!job) notFound()
  if (job.status !== "QC_CHECK") {
    redirect("/operator/quality-control")
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Detail Inspeksi QC</h1>
        <p className="text-muted-foreground mt-1">Lakukan pemeriksaan menyeluruh pada hasil produksi.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <div className="bg-muted/30 p-5 rounded-xl border">
            <h3 className="font-semibold text-lg border-b pb-3 mb-3">Info Pesanan</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground">No. Pesanan</p>
                <p className="font-medium">{job.orderItem.order.orderNumber}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Pelanggan</p>
                <p className="font-medium">{job.orderItem.order.customer.name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Produk</p>
                <p className="font-medium">{job.orderItem.product.name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Jumlah</p>
                <p className="font-medium">{job.orderItem.qty} {job.orderItem.product.unit}</p>
              </div>
              {job.notes && (
                <div>
                  <p className="text-muted-foreground">Catatan Produksi</p>
                  <p className="font-medium text-red-600">{job.notes}</p>
                </div>
              )}
            </div>
          </div>

          {job.photos && job.photos.length > 0 && (
            <div className="bg-muted/30 p-5 rounded-xl border space-y-3">
              <h4 className="font-semibold text-sm">Foto Bukti Sebelumnya</h4>
              <div className="grid grid-cols-2 gap-2">
                {job.photos.map((photo) => (
                  <a key={photo.id} href={photo.photoUrl} target="_blank" rel="noreferrer" className="block relative aspect-square rounded-lg overflow-hidden border bg-background hover:opacity-90">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo.photoUrl} alt="Foto QC" className="w-full h-full object-cover" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="md:col-span-2">
          <QCForm productionJobId={job.id} />
        </div>
      </div>
    </div>
  )
}
