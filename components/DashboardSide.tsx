"use client"

import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const router = useRouter()

  async function handleLogout() {
    const res = await fetch("/api/logout", {
      method: "POST",
      credentials: "include",
    })

    if (res.ok) {
      // Nach Logout zur Login-Seite weiterleiten
      window.location.href = "/login"
    } else {
      console.error("Logout fehlgeschlagen")
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <button onClick={handleLogout} className="mt-6 bg-gray-800 text-white p-2 rounded">
        Logout
      </button>
    </div>
  )
}
