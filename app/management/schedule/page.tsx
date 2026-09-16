import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Wrench, User, Clock } from "lucide-react"
import { AssignScheduleModal } from "./schedule-modal"

export default async function SchedulePage() {
  const [orders, machines, operators] = await Promise.all([
    prisma.order.findMany({
      where: { status: "IN_PRODUCTION" },
      include: {
        items: {
          include: {
            product: true,
            productionJob: {
              include: {
                machine: true,
                operator: true,
                schedules: { orderBy: { createdAt: "desc" }, take: 1 }
              }
            }
          }
        },
        customer: true
      },
      orderBy: { deadline: "asc" }
    }),
    prisma.machine.findMany({ orderBy: { name: "asc" } }),
    prisma.user.findMany({ where: { role: "OPERATOR" }, orderBy: { name: "asc" } })
  ])
  
  type OrderWithItems = typeof orders[0]

  const byDate = orders.reduce((acc, order) => {
    if (!order.deadline) return acc
    const date = order.deadline.toISOString().split("T")[0]
    if (!acc[date]) acc[date] = []
    acc[date].push(order)
    return acc
  }, {} as Record<string, OrderWithItems[]>)

  const totalJobs = orders.reduce((sum, o) => sum + o.items.length, 0)
  const scheduledJobs = orders.reduce((sum, o) => sum + o.items.filter(i => i.productionJob?.machineId).length, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Jadwal & Alokasi Produksi</h1>
        <p className="text-muted-foreground">Tinjau antrean produksi, alokasikan mesin cetak, dan tugaskan operator.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-purple-50/50 border-purple-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">Total Pesanan Aktif</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{orders.length}</div>
            <p className="text-xs text-purple-600 mt-1">{totalJobs} item pekerjaan cetak</p>
          </CardContent>
        </Card>

        <Card className="bg-blue-50/50 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Sudah Terjadwal Mesin</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{scheduledJobs} / {totalJobs}</div>
            <p className="text-xs text-blue-600 mt-1">Item produksi yang sudah dialokasikan</p>
          </CardContent>
        </Card>

        <Card className="bg-emerald-50/50 border-emerald-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-emerald-800">Mesin Tersedia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-900">
              {machines.filter(m => m.status === "AVAILABLE").length} / {machines.length}
            </div>
            <p className="text-xs text-emerald-600 mt-1">Mesin cetak siap digunakan</p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-600" /> Antrean Produksi & Alokasi Mesin
          </CardTitle>
          <CardDescription>Daftar pesanan aktif dikelompokkan berdasarkan batas waktu (deadline).</CardDescription>
        </CardHeader>
        <CardContent>
          {Object.keys(byDate).length === 0 ? (
            <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg">
              Tidak ada pesanan produksi yang aktif saat ini.
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(byDate).map(([date, dateOrders]) => (
                <div key={date} className="border rounded-xl p-5 bg-card shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b pb-3">
                    <h3 className="font-bold text-base flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      {new Date(date).toLocaleDateString("id-ID", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                      })}
                    </h3>
                    <span className="text-xs font-semibold text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                      {dateOrders.length} Pesanan
                    </span>
                  </div>

                  <div className="space-y-4">
                    {dateOrders.map((order) => (
                      <div
                        key={order.id}
                        className="p-4 rounded-lg border border-border/80 bg-muted/20 space-y-3"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-base text-foreground">
                              {order.orderNumber}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Pelanggan: <span className="font-medium text-foreground">{order.customer.name}</span>
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {order.items.map(item => {
                            const job = item.productionJob
                            const latestSchedule = job?.schedules?.[0]
                            const priority = latestSchedule?.priority || "NORMAL"

                            return (
                              <div key={item.id} className="p-3 rounded-lg bg-background border flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-sm">{item.product.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                      ({item.qty} {item.product.unit})
                                    </span>
                                    {latestSchedule && (
                                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                        priority === "URGENT" ? "bg-red-100 text-red-700" : priority === "LOW" ? "bg-slate-100 text-slate-700" : "bg-blue-100 text-blue-700"
                                      }`}>
                                        {priority}
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <Wrench className="h-3 w-3" />
                                      {job?.machine ? (
                                        <span className="font-medium text-foreground">{job.machine.name}</span>
                                      ) : (
                                        <span className="italic text-amber-600">Belum ada mesin</span>
                                      )}
                                    </span>

                                    <span className="flex items-center gap-1">
                                      <User className="h-3 w-3" />
                                      {job?.operator ? (
                                        <span className="font-medium text-foreground">{job.operator.name}</span>
                                      ) : (
                                        <span className="italic text-amber-600">Belum ditugaskan</span>
                                      )}
                                    </span>

                                    {latestSchedule && (
                                      <span className="flex items-center gap-1 text-slate-600">
                                        <Clock className="h-3 w-3" />
                                        Mulai: {new Date(latestSchedule.scheduledDate).toLocaleDateString("id-ID")}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {job && (
                                  <AssignScheduleModal
                                    productionJobId={job.id}
                                    productName={item.product.name}
                                    orderNumber={order.orderNumber}
                                    currentMachineId={job.machineId}
                                    currentOperatorId={job.operatorId}
                                    defaultDate={order.deadline ? order.deadline.toISOString().split("T")[0] : undefined}
                                    machines={machines}
                                    operators={operators}
                                  />
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}