import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function proxy(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const { pathname } = req.nextUrl

  const protectedPaths = ["/admin", "/operator", "/management", "/orders"]
  const isProtected = protectedPaths.some(path => pathname.startsWith(path))

  if (!token && isProtected) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  if (token && (pathname === "/login" || pathname === "/register")) {
    if (token.role === "MANAGEMENT") return NextResponse.redirect(new URL("/management", req.url))
    if (token.role === "ADMIN") return NextResponse.redirect(new URL("/admin", req.url))
    if (token.role === "OPERATOR") return NextResponse.redirect(new URL("/operator", req.url))
    return NextResponse.redirect(new URL("/products", req.url))
  }

  if (token) {
    if (pathname.startsWith("/management") && token.role !== "MANAGEMENT") {
      return NextResponse.redirect(new URL("/", req.url))
    }
    if (pathname.startsWith("/admin") && token.role !== "ADMIN" && token.role !== "MANAGEMENT") {
      return NextResponse.redirect(new URL("/", req.url))
    }
    if (pathname.startsWith("/operator") && token.role !== "OPERATOR" && token.role !== "ADMIN" && token.role !== "MANAGEMENT") {
      return NextResponse.redirect(new URL("/", req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/operator/:path*", "/management/:path*", "/orders/:path*", "/login", "/register"]
}