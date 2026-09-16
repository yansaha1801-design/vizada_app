import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Wrench } from "lucide-react"
import { CreateMachineModal, EditMachineModal, DeleteMachineModal, LogMaintenanceModal, ScheduleMaintenanceModal } from "./machine-modals"
import { StatusBadge } from "@/components/ui/status-badge"

export default async function MachinePage() {
  const machines = await prisma.machine.findMany({
    include: {
      maintenanceLogs: { orderBy: { createdAt: "desc" }, take: 1 },
      schedules: { orderBy: { nextDue: "asc" }, take: 1 }
    },
    orderBy: { name: "asc" }
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manajemen Mesin Cetak</h1>
          <p className="text-muted-foreground">Kelola data mesin, jadwal perawatan, dan riwayat kerusakan.</p>
        </div>
        <CreateMachineModal />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" /> Daftar Mesin
          </CardTitle>
          <CardDescription>Seluruh mesin cetak dan statusnya.</CardDescription>
        </CardHeader>
        <CardContent>
          {machines.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg">
              Belum ada data mesin cetak.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Mesin</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Perawatan Terakhir</TableHead>
                    <TableHead>Jadwal Perawatan</TableHead>
                    <TableHead className="text-right">Aksi Data</TableHead>
                    <TableHead className="text-right">Perawatan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {machines.map((machine) => (
                    <TableRow key={machine.id}>
                      <TableCell className="font-medium">{machine.name}</TableCell>
                      <TableCell>
                        <StatusBadge status={machine.status} size="sm" />
                      </TableCell>
                      <TableCell>
                        {machine.maintenanceLogs.length > 0
                          ? new Date(machine.maintenanceLogs[0].createdAt).toLocaleDateString("id-ID")
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {machine.schedules.length > 0
                          ? new Date(machine.schedules[0].nextDue).toLocaleDateString("id-ID")
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <EditMachineModal machine={machine} />
                        <DeleteMachineModal machineId={machine.id} />
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <LogMaintenanceModal machineId={machine.id} />
                        <ScheduleMaintenanceModal machineId={machine.id} />
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
