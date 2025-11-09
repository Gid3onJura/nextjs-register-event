"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Loan {
  id: number
  name: string
  book: string
  date: string
}

const availableBooks = ["Harry Potter", "Der kleine Prinz", "1984", "Lord of the Rings"]

export default function DashboardSide() {
  const [name, setName] = useState("")
  const [book, setBook] = useState("")
  const [loans, setLoans] = useState<Loan[]>([])
  const [message, setMessage] = useState("") // für Erfolg/Fehler

  // Lade ausgeliehene Bücher beim Mount
  useEffect(() => {
    fetch("/api/loans")
      .then((res) => res.json())
      .then((data) => setLoans(data))
      .catch((err) => console.error(err))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage("")

    if (!name || !book) {
      setMessage("Bitte Name und Buch angeben")
      return
    }

    try {
      const res = await fetch("/api/loans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, book }),
      })

      if (!res.ok) {
        setMessage("Fehler beim Ausleihen")
        return
      }

      const newLoan = await res.json()
      setLoans((prev) => [...prev, newLoan])
      setName("")
      setBook("")
      setMessage("Buch erfolgreich ausgeliehen")
    } catch (err) {
      setMessage("Fehler beim Ausleihen")
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto flex flex-col gap-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* Formular */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold">Buch ausleihen</h2>

        <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />

        <select value={book} onChange={(e) => setBook(e.target.value)} className="border p-2 rounded">
          <option value="">-- Buch auswählen --</option>
          {availableBooks.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>

        <Button type="submit" className="w-full">
          Ausleihen
        </Button>

        {message && <p className="text-sm text-red-600 mt-2">{message}</p>}
      </form>

      {/* Übersicht */}
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Ausgeliehene Bücher</h2>
        {loans.length === 0 && <p className="text-gray-500">Keine Bücher ausgeliehen.</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {loans.map((loan) => (
            <div key={loan.id} className="bg-white p-4 rounded-lg shadow flex flex-col gap-2">
              <p>
                <span className="font-semibold">Name:</span> {loan.name}
              </p>
              <p>
                <span className="font-semibold">Buch:</span> {loan.book}
              </p>
              <p>
                <span className="font-semibold">Datum:</span> {new Date(loan.date).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
