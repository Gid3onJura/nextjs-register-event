import { cookies } from "next/headers"

export async function getAuthToken() {
  const cookieStore = await cookies()
  return cookieStore.get("auth_token")?.value || null
}

export async function loadUserProfile() {
  const token = await getAuthToken()

  console.log("====================================")
  console.log("token", token)
  console.log("====================================")

  const response = await fetch("https://deine-api/user", {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  })

  if (!response.ok) return null

  return response.json()
}
