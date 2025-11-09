"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function LoginForm() {
  const router = useRouter()
  const [nickname, setNickname] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nickname, password }),
      credentials: "include",
    })

    if (!res.ok) {
      setError("Login fehlgeschlagen")
      return
    }

    window.location.href = "/dashboard"
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6 max-w-sm w-full">
        <h1 className="text-2xl font-bold">Login</h1>

        <input
          className="border p-2 rounded"
          type="text"
          placeholder="Nickname"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
        />

        <input
          className="border p-2 rounded"
          type="password"
          placeholder="Passwort"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="text-red-500">{error}</p>}

        <Button
          className="shadow-md hover:shadow-lg w-full rounded-lg sm:rounded-2xl p-4 text-lg sm:text-base"
          variant={"interaction"}
        >
          Login
        </Button>
      </form>
    </div>
  )
}
