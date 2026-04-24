import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? ""
  const API_KEY = process.env.NEXT_PUBLIC_API_KEY ?? ""

  try {
    const response = await fetch(`${API_BASE_URL}/survey/${params.id}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "api-key": API_KEY,
      },
    })

    if (!response.ok) {
      return NextResponse.json({ error: "Umfrage nicht gefunden" }, { status: 404 })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Fehler beim Laden der Umfrage:", error)
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 })
  }
}
