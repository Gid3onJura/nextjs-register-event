// app/login/page.tsx (Server Component)
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import LoginForm from "@/components/LoginForm"

export default async function LoginPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth_token")?.value

  if (token) {
    redirect("/dashboard") // server-side redirect
  }

  return <LoginForm />
}
