import { NextResponse } from "next/server"

export async function GET() {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? ""
  const API_KEY = process.env.NEXT_PUBLIC_API_KEY ?? ""

  try {
    const response = await fetch(`${API_BASE_URL}/survey`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "api-key": API_KEY,
      },
    })

    if (!response.ok) {
      throw new Error("Fehler beim Laden der Umfragen")
    }

    const surveys = await response.json()
    return NextResponse.json(surveys)
  } catch (error) {
    console.error("Survey list error:", error)
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 })
  }
}
