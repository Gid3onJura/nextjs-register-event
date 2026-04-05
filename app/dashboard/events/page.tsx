import EventsPageClient from "@/components/EventsPageClient"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default async function EventsPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth_token")?.value

  if (!token) {
    redirect("/login")
  }

  return <EventsPageClient />
}
