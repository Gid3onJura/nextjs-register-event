import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function POST() {
  const cookieStore = await cookies()

  cookieStore.delete("auth_token")

  return NextResponse.json({ success: true })
}
