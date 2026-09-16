"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createUser, updateUser } from "@/app/actions/user"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

interface UserFormProps {
  initialData?: {
    id: string
    name: string
    email: string
    phone?: string | null
    role: string
  }
  isEdit?: boolean
}

export function UserForm({ initialData, isEdit }: UserFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    
    const formData = new FormData(e.currentTarget)
    
    const result = isEdit && initialData 
      ? await updateUser(initialData.id, formData)
      : await createUser(formData)

    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success(isEdit ? "Data pengguna berhasil diperbarui" : "Pengguna berhasil ditambahkan")
      router.push("/admin/users")
      router.refresh()
    }
    
    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nama Lengkap</Label>
        <Input id="name" name="name" defaultValue={initialData?.name} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" defaultValue={initialData?.email} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Nomor Telepon</Label>
        <Input id="phone" name="phone" defaultValue={initialData?.phone || ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="role">Hak Akses (Role)</Label>
        <Select name="role" defaultValue={initialData?.role || "CUSTOMER"}>
          <SelectTrigger>
            <SelectValue placeholder="Pilih Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="CUSTOMER">Customer</SelectItem>
            <SelectItem value="OPERATOR">Operator Produksi</SelectItem>
            <SelectItem value="MANAGEMENT">Manajemen</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">{isEdit ? "Password Baru (Kosongkan jika tidak diubah)" : "Password"}</Label>
        <Input id="password" name="password" type="password" required={!isEdit} />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Menyimpan..." : "Simpan Pengguna"}
      </Button>
    </form>
  )
}