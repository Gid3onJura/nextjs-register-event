import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function POST(request: Request) {
  const cookieStore = await cookies()

  cookieStore.delete("auth_token")

  const redirectUrl = new URL("/login", process.env.NEXT_PUBLIC_BASE_URL)

  return NextResponse.redirect(redirectUrl)
  // return NextResponse.json({ success: true })
}
