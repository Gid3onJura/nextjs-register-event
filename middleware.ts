import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { ProtectedRoute } from "./util/interfaces"

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? ""
  const API_KEY = process.env.NEXT_PUBLIC_API_KEY ?? ""

  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "api-key": API_KEY,
  }

  // Definiere geschützte Routes mit erforderlichen Rollen
  const protectedRoutes: ProtectedRoute[] = [
    { path: "/dashboard", allowedRoles: ["user"] },
    { path: "/dashboard/settings", allowedRoles: ["admin"] },
    { path: "/dashboard/profile", allowedRoles: ["user"] },
  ]

  const isProtected = protectedRoutes.some((route) => req.nextUrl.pathname.startsWith(route.path))

  const matchedRoute = protectedRoutes.find((route) => req.nextUrl.pathname.startsWith(route.path))

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
      const userRoles = response.user.roles

      if (!isValid) {
        return NextResponse.redirect(new URL("/login", req.url))
      }

      // Prüfe Rolle vom Server
      if (
        matchedRoute &&
        (!Array.isArray(userRoles) || !userRoles.some((role) => matchedRoute.allowedRoles.includes(role)))
      ) {
        return NextResponse.redirect(new URL("/", req.url))
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
