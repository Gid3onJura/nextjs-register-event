"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BookmarkX } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

interface BookRental {
  id: number
  bookname: string
  bookrental: {
    id: number
    readername: string
    rentaldate: string
  } | null
}

export default function DashboardSide() {
  const [name, setName] = useState("")
  const [book, setBook] = useState("") // ausgewähltes Buch
  const [bookRentals, setBookRentals] = useState<BookRental[]>([])
  const [message, setMessage] = useState("")

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingReturn, setPendingReturn] = useState<{ rentalid: number; bookid: number } | null>(null)

  // Beim Start Bücher laden
  useEffect(() => {
    const fetchBookRentals = async () => {
      try {
        const response = await fetch("/api/rental/books", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        })

        const bookRentalData = await response.json()

        setBookRentals(bookRentalData)
      } catch (error) {
        console.log(error)
        setBookRentals([])
      }
    }
    fetchBookRentals()
  }, [])

  // ausgeliehene Bücher filtern
  const rentaledBooks = bookRentals.filter((b) => b.bookrental !== null)

  // verfügbare Bücher filtern
  const availableBooks = bookRentals

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage("")

    if (!name || !book) {
      setMessage("Bitte Name und Buch angeben")
      return
    }

    try {
      const res = await fetch("/api/rental/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ book, name }),
      })

      if (!res.ok) {
        setMessage("Fehler beim Ausleihen")
        return
      }

      setName("")
      setBook("")
      setMessage("Buch erfolgreich ausgeliehen")

      // nach erfolgreicher Ausleihe wieder Bücher laden
      const response = await fetch("/api/rental/books", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })

      const bookRentalData = await response.json()

      setBookRentals(bookRentalData)
    } catch (error) {
      console.log(error)
      setMessage("Fehler beim Ausleihen")
    }
  }

  async function handleReturn() {
    if (!pendingReturn) return

    const { rentalid, bookid } = pendingReturn

    try {
      const res = await fetch("/api/rental/books", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rentalid, bookid }),
      })

      if (!res.ok) {
        setMessage("Fehler beim Zurückgeben")
        return
      }

      setMessage("Buch erfolgreich zurückgegeben")

      // Bücher neu laden
      const response = await fetch("/api/rental/books", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })

      const bookRentalData = await response.json()
      setBookRentals(bookRentalData)
    } catch (err) {
      console.error(err)
      setMessage("Fehler beim Zurückgeben")
    }
  }

  return (
    <>
      <div className="p-8 max-w-4xl mx-auto flex flex-col gap-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>

        {/* Formular */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold">Buch ausleihen</h2>

          <Input placeholder="Wer leiht aus?" value={name} onChange={(e) => setName(e.target.value)} />

          {/* <select value={book} onChange={(e) => setBook(e.target.value)} className="border p-2 rounded">
            <option value="">-- Buch auswählen --</option>

            {availableBooks.map((b) => (
              <option key={b.id} value={b.id} disabled={b.bookrental !== null}>
                {b.bookname} {b.bookrental ? "(ausgeliehen)" : ""}
              </option>
            ))}
          </select> */}
          <Select onValueChange={(value) => setBook(value)} value={book}>
            <SelectTrigger>
              <SelectValue placeholder="Welches Buch?" />
            </SelectTrigger>

            <SelectContent className="max-w-[90vw] w-full" position="popper">
              {availableBooks.map((b) => (
                <SelectItem key={b.id} value={String(b.id)} disabled={b.bookrental !== null}>
                  {b.bookname} {b.bookrental ? "(ausgeliehen)" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button type="submit" className="w-full">
            Ausleihen
          </Button>

          {message && <p className="text-sm text-orange-400 mt-2">{message}</p>}
        </form>

        {/* Übersicht Ausgeliehene */}
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold">Ausgeliehene Bücher</h2>

          {rentaledBooks.length === 0 && <p className="text-gray-500">Keine Bücher ausgeliehen.</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {rentaledBooks.map((book) => {
              const rentalDate = new Date(book.bookrental!.rentaldate)
              const now = new Date()

              const diffTime = now.getTime() - rentalDate.getTime()
              const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
              const diffWeeks = (diffDays / 7).toFixed(1) // z. B. 1.3 Wochen

              let durationDisplay = ""
              if (diffDays >= 7) {
                durationDisplay = `${diffWeeks} Wochen`
              } else if (diffDays >= 1) {
                durationDisplay = `${diffDays} Tage`
              }

              return (
                <div key={book.id} className="bg-white p-4 rounded-lg shadow flex flex-col gap-2 relative">
                  {/* Rückgabe-Button oben rechts */}
                  {book.bookrental && (
                    <button
                      onClick={() => {
                        setPendingReturn({ rentalid: book.bookrental!.id, bookid: book.id })
                        setConfirmOpen(true)
                        // handleReturn(book.bookrental!.id, book.id)
                      }}
                      className="absolute top-2 right-2 text-sm px-1 py-1 text-white rounded transition"
                    >
                      <BookmarkX color="#db3b0a" className="w-5 h-5" />
                    </button>
                  )}

                  <p className="pr-11">
                    <span className="font-semibold">Das Buch:</span> {book.bookname}
                  </p>

                  <p>
                    <span className="font-semibold">ausgeliehen an:</span> {book.bookrental!.readername}
                  </p>

                  <p>
                    <span className="font-semibold">am:</span> {rentalDate.toLocaleDateString()}
                  </p>

                  {durationDisplay && (
                    <p>
                      <span className="font-semibold">Ausgeliehen seit:</span> {durationDisplay}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Buch zurückgeben?</DialogTitle>
            <DialogDescription>Sind Sie sicher, dass Sie dieses Buch zurückgeben möchten?</DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex justify-end gap-2 mt-4">
            <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
              Abbrechen
            </Button>

            <Button
              variant="destructive"
              onClick={() => {
                setConfirmOpen(false)
                handleReturn()
              }}
            >
              Ja, zurückgeben
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
