import BookRentalDashboard from "@/components/BookRentalDashboard"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default async function RentalPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth_token")?.value

  if (!token) {
    redirect("/login")
  }

  return <BookRentalDashboard />
}
