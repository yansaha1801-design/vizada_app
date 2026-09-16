"use server"

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function registerUser(formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const phone = formData.get("phone") as string
  if (!name || !email || !password || !phone) {
    return { error: "Semua kolom wajib diisi" }
  }
  if (password.length < 6) {
    return { error: "Password minimal 6 karakter" }
  }
  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
    return { error: "Email sudah terdaftar, silakan gunakan email lain" }
  }
  const passwordHash = await bcrypt.hash(password, 10)
  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      phone,
      role: "CUSTOMER"
    }
  })
  return { success: true }
}