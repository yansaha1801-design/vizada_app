"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { Role } from "@/app/generated/prisma/client"
import { hash } from "bcryptjs"

export async function createUser(formData: FormData) {
  try {
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const phone = formData.get("phone") as string
    const role = formData.get("role") as Role
    const password = formData.get("password") as string
    if (!name || !email || !password) {
      return { error: "Nama, email, dan password wajib diisi." }
    }
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return { error: "Email sudah terdaftar." }
    }
    const passwordHash = await hash(password, 10)
    await prisma.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        role: role || "CUSTOMER",
        passwordHash,
      }
    })
    revalidatePath("/admin/users")
    return { success: true }
  } catch {
    return { error: "Gagal menambahkan pengguna." }
  }
}

export async function updateUser(id: string, formData: FormData) {
  try {
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const phone = formData.get("phone") as string
    const role = formData.get("role") as Role
    const password = formData.get("password") as string
    if (!name || !email) {
      return { error: "Nama dan email wajib diisi." }
    }
    const dataToUpdate: { name: string; email: string; phone: string | null; role: Role; passwordHash?: string } = {
      name,
      email,
      phone: phone || null,
      role
    }
    if (password) {
      dataToUpdate.passwordHash = await hash(password, 10)
    }
    await prisma.user.update({
      where: { id },
      data: dataToUpdate
    })
    revalidatePath("/admin/users")
    return { success: true }
  } catch {
    return { error: "Gagal memperbarui pengguna." }
  }
}

export async function deleteUser(id: string) {
  try {
    await prisma.user.delete({
      where: { id }
    })
    revalidatePath("/admin/users")
    return { success: true }
  } catch {
    return { error: "Gagal menghapus pengguna." }
  }
}