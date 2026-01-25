import ProfilePageClient from "@/components/ProfilePageClient"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default async function ProfilPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth_token")?.value
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? ""
  const API_KEY = process.env.NEXT_PUBLIC_API_KEY ?? ""
  let userid: number = 0

  if (!token) {
    redirect("/login")
  }

  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "api-key": API_KEY,
  }

  try {
    const responseValidation = await fetch(API_BASE_URL + "/utils/validatetoken", {
      method: "POST",
      headers: headers,
      body: JSON.stringify({ token }),
    })

    if (!responseValidation.ok) {
      redirect("/login")
    }

    const response = await responseValidation.json()

    const isValid = response.valid
    userid = response.user.id

    if (!isValid || !userid) {
      redirect("/login")
    }
  } catch (error) {
    redirect("/login")
  }

  return <ProfilePageClient userid={userid} />
}
