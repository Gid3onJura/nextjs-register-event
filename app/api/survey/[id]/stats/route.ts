import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? ""
  const API_KEY = process.env.NEXT_PUBLIC_API_KEY ?? ""

  const { id } = await params

  try {
    const response = await fetch(`${API_BASE_URL}/survey/${id}/stats`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "api-key": API_KEY,
      },
    })

    if (!response.ok) {
      return NextResponse.json({ error: "Statistiken nicht gefunden" }, { status: 404 })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Fehler beim Laden der Statistiken:", error)
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 })
  }
}
