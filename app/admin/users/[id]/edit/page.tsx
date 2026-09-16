import { prisma } from "@/lib/prisma"
import { UserForm } from "../../user-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { notFound } from "next/navigation"
import Link from "next/link"

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  
  const user = await prisma.user.findUnique({
    where: { id: resolvedParams.id }
  })

  if (!user) {
    notFound()
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/users">
          <Button variant="outline" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Edit Pengguna</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Perbarui Informasi Akun</CardTitle>
        </CardHeader>
        <CardContent>
          <UserForm initialData={user} isEdit />
        </CardContent>
      </Card>
    </div>
  )
}