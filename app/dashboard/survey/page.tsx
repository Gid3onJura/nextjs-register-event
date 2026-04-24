import SurveyPageClient from "@/components/SurveyPageClient"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default async function SurveyPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth_token")?.value

  if (!token) {
    redirect("/login")
  }

  return <SurveyPageClient />
}
