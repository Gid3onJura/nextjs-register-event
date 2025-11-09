import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(req: Request) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? ""
  const API_KEY = process.env.NEXT_PUBLIC_API_KEY ?? ""
  const { nickname, password } = await req.json()

  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "api-key": API_KEY,
  }

  // Deine externe API
  const apiResponse = await fetch(API_BASE_URL + "/login", {
    method: "POST",
    headers: headers,
    body: JSON.stringify({ nickname, password }),
  })

  if (!apiResponse.ok) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
  }

  const response = await apiResponse.json()
  const token = response.accessToken

  const cookieStore = await cookies()

  cookieStore.set("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24, // 1 Tag
  })

  return NextResponse.json({ success: true })
}
