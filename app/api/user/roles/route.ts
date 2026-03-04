import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth_token")?.value
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? ""
  const API_KEY = process.env.NEXT_PUBLIC_API_KEY ?? ""

  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  try {
    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
      "api-key": API_KEY,
    }

    const response = await fetch(API_BASE_URL + "/utils/validatetoken", {
      method: "POST",
      headers: headers,
      body: JSON.stringify({ token }),
    })

    if (!response.ok) {
      return NextResponse.json({ error: "Token validation failed" }, { status: 401 })
    }

    const data = await response.json()

    return NextResponse.json({
      roles: data.user?.roles ? JSON.parse(data.user.roles) : [],
    })
  } catch (error) {
    console.error("Error fetching user roles:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
