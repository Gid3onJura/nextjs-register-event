import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? ""
  const API_KEY = process.env.NEXT_PUBLIC_API_KEY ?? ""

  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "api-key": API_KEY,
  }

  const protectedRoutes = ["/dashboard", "/dashboard/settings", "/dashboard/profile"]

  const isProtected = protectedRoutes.some((route) => req.nextUrl.pathname.startsWith(route))
  // const isProtected = req.nextUrl.pathname.startsWith("/dashboard")

  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  if (isProtected && token) {
    try {
      const responseValidation = await fetch(API_BASE_URL + "/utils/validatetoken", {
        method: "POST",
        headers: headers,
        body: JSON.stringify({ token }),
      })

      if (!responseValidation.ok) {
        return NextResponse.redirect(new URL("/", req.url))
      }

      const response = await responseValidation.json()
      const isValid = response.valid

      if (!isValid) {
        return NextResponse.redirect(new URL("/login", req.url))
      }

      return NextResponse.next()
    } catch (error) {
      return NextResponse.redirect(new URL("/", req.url))
    }
  }
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*"],
}
