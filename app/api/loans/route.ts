// app/api/loans/route.ts
import { NextResponse } from "next/server"

interface Loan {
  id: number
  name: string
  book: string
  date: string
}

// Temporärer Speicher (in Memory, geht verloren beim Neustart)
let loans: Loan[] = []

export async function GET() {
  return NextResponse.json(loans)
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, book } = body

    if (!name || !book) {
      return NextResponse.json({ error: "Name und Buch erforderlich" }, { status: 400 })
    }

    const newLoan: Loan = {
      id: loans.length + 1, // einfache ID
      name,
      book,
      date: new Date().toISOString(),
    }

    loans.push(newLoan)

    return NextResponse.json(newLoan, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Fehler beim Ausleihen" }, { status: 500 })
  }
}
