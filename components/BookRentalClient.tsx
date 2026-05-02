"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BookMarked, BookmarkX } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import DashboardPageHeader from "./DashboardPageHeader"
import { IconWithTooltip } from "./IconWithTooltip"
import { User } from "@/util/interfaces"
import { calcDuration, colorDanger, formatDateDE } from "@/util/util"

interface BookRental {
  id: number
  bookname: string
  bookrental: {
    id: number
    user: {
      id: number
      name: string
    }
    rentaldate: Date
    reservationdate: Date
  } | null
}

export default function BookRentalClient() {
  const [book, setBook] = useState("") // ausgewähltes Buch
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [bookRentals, setBookRentals] = useState<BookRental[]>([])
  const [userData, setUserData] = useState<User[]>([])
  const [message, setMessage] = useState("")

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingReturn, setPendingReturn] = useState<{ rentalid: number; bookid: number } | null>(null)
  const [pendingReservation, setPendingReservation] = useState<{ rentalid: number; bookid: number } | null>(null)

  const [showTooltip, setShowTooltip] = useState<string | null>(null)

  const fetchBookRentals = async () => {
    try {
      const response = await fetch("/api/books/rental", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })

      const bookRentalData = await response.json()

      setBookRentals(bookRentalData)
    } catch (error) {
      setBookRentals([])
    }
  }

  const fetchUser = async () => {
    try {
      const response = await fetch("/api/user", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })

      const userDataFromApi = await response.json()

      setUserData(userDataFromApi)
    } catch (error) {
      setUserData([])
    }
  }

  // Beim Start Bücher laden
  useEffect(() => {
    fetchBookRentals()
    fetchUser()
  }, [])

  // ausgeliehene Bücher filtern
  const rentaledBooks = bookRentals.filter((b) => b.bookrental !== null && b.bookrental?.rentaldate !== null)

  // reservierte Bücher filtern
  const reservedBooks = bookRentals.filter(
    (b) => b.bookrental !== null && b.bookrental?.reservationdate !== null && b.bookrental?.rentaldate === null,
  )

  // verfügbare Bücher filtern
  const availableBooks = bookRentals

  //#region handle rental
  async function handleRental(e: React.FormEvent) {
    e.preventDefault()
    setMessage("")

    const selectedUser = userData.find((u) => u.id === selectedUserId) ?? null

    const existingRental = bookRentals.find((b) => b.id === Number(book))

    if (!selectedUser || !book) {
      setMessage("Bitte Name und Buch angeben")
      return
    }

    if (selectedUser.id !== existingRental?.bookrental?.user.id && existingRental?.bookrental?.reservationdate) {
      setMessage("Das Buch ist bereits für jemand anderen reserviert")
      alert("Das Buch ist bereits für jemand anderen reserviert")
      return
    }

    try {
      const res = await fetch("/api/books/rental", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ book, userid: selectedUserId }),
      })

      const data = await res.json()

      if (!res.ok) {
        setMessage("Fehler beim Ausleihen")
        return
      }

      if (data.status > 200) {
        switch (data.status) {
          case 409:
            setMessage("Das Buch wurde bereits ausgeliehen")
            alert("Das Buch wurde bereits ausgeliehen")
            break
          default:
            setMessage("Fehler beim Ausleihen")
            alert("Das Buch wurde bereits ausgeliehen")
            break
        }
      } else {
        setMessage(`Buch erfolgreich ausgeliehen an ${name}`)
      }

      setSelectedUserId(null)
      setBook("")

      // nach erfolgreicher Ausleihe wieder Bücher laden
      const response = await fetch("/api/books/rental", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })

      const bookRentalData = await response.json()

      setBookRentals(bookRentalData)
    } catch (error) {
      setMessage("Fehler beim Ausleihen")
    }
  }

  //#region handle reservation
  async function handleReservation(e: React.FormEvent) {
    e.preventDefault()
    setMessage("")

    const selectedUser = userData.find((u) => u.id === selectedUserId) ?? null

    if (!selectedUser || !book) {
      setMessage("Bitte Name und Buch angeben")
      return
    }

    try {
      const res = await fetch("/api/books/reservation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ book, userid: selectedUser.id }),
      })

      const data = await res.json()

      if (!res.ok) {
        setMessage("Fehler beim Reservieren")
        return
      }

      if (data.status > 200) {
        switch (data.status) {
          case 409:
            setMessage("Das Buch wurde bereits reserviert")
            alert("Das Buch wurde bereits reserviert")
            break
          default:
            setMessage("Fehler beim Reservieren")
            alert("Das Buch wurde bereits reserviert")
            break
        }
      } else {
        setMessage(`Buch erfolgreich reserviert für ${selectedUser.name}`)
      }

      setSelectedUserId(null)
      setBook("")

      // nach erfolgreicher Ausleihe wieder Bücher laden
      const response = await fetch("/api/books/rental", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })

      const bookRentalData = await response.json()

      setBookRentals(bookRentalData)
    } catch (error) {
      setMessage("Fehler beim Ausleihen")
    }
  }

  async function handleReturn() {
    if (!pendingReturn && !pendingReservation) return

    const { rentalid, bookid } = pendingReturn ? pendingReturn : pendingReservation!

    try {
      const res = await fetch("/api/books/rental", {
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
      const response = await fetch("/api/books/rental", {
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

  //#region Render
  return (
    <>
      <div className="flex flex-col gap-8 p-3 pt-5 bg-white min-h-screen">
        <DashboardPageHeader title="Bibliothek" />

        {/* Formular */}
        <form className="flex flex-col gap-4 bg-white p-6 rounded shadow-md">
          <h2 className="text-xl font-semibold">Buch ausleihen</h2>

          {/* User Auswahl */}
          <Select
            onValueChange={(value) => setSelectedUserId(Number(value))}
            value={selectedUserId ? String(selectedUserId) : ""}
          >
            <SelectTrigger>
              <SelectValue placeholder="Wer reserviert oder leiht aus?" />
            </SelectTrigger>

            <SelectContent className="max-w-[90vw] w-full" position="popper">
              {userData.map((user) => (
                <SelectItem key={user.id} value={String(user.id)}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Buch Auswahl */}
          <Select onValueChange={(value) => setBook(value)} value={book}>
            <SelectTrigger>
              <SelectValue placeholder="Welches Buch?" />
            </SelectTrigger>

            <SelectContent className="max-w-[90vw] w-full" position="popper">
              {availableBooks.map((b) => {
                const rentalLabel = b.bookrental?.rentaldate
                  ? "(ausgeliehen)"
                  : b.bookrental?.reservationdate
                    ? "(reserviert)"
                    : ""

                return (
                  <SelectItem
                    key={b.id}
                    value={String(b.id)}
                    disabled={b.bookrental && b.bookrental?.rentaldate !== null ? true : false}
                  >
                    {b.bookname} {rentalLabel}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
          <div className="flex flex-row gap-2 justify-center items-center">
            <Button variant={"outline"} className="w-1/2" onClick={handleReservation}>
              Reservieren
            </Button>
            <Button variant={"default"} className="w-1/2" onClick={handleRental}>
              Ausleihen
            </Button>
          </div>
          {message && <p className="text-sm text-orange-400 mt-2">{message}</p>}
        </form>

        <div className="flex flex-col sm:flex-row gap-2">
          {/* Übersicht Reservierte Bücher */}
          <div className="flex flex-col gap-4 sm:w-1/2 w-full">
            <h2 className="text-xl font-semibold leading-tight text-center bg-white p-4 rounded">Reservierte Bücher</h2>

            {reservedBooks.length === 0 && (
              <div className="text-gray-500 flex justify-center">Keine Bücher reserviert.</div>
            )}

            <div className="flex flex-col gap-4">
              {reservedBooks.map((book) => {
                if (book.bookrental === null) return null

                const reservedDate = new Date(book.bookrental.reservationdate)

                const durationDisplay = calcDuration(reservedDate)

                return (
                  <div key={book.id} className="bg-white p-4 rounded-lg shadow flex flex-col gap-2 relative">
                    <div className="absolute top-2 right-2 text-sm text-white">
                      <div className="flex flex-row justify-center items-center gap-2 item">
                        {/* Reservierung aufheben */}
                        {book.bookrental?.reservationdate && !book.bookrental?.rentaldate && (
                          <button
                            onContextMenu={(e) => {
                              e.preventDefault()
                              setShowTooltip(`${book.id}-reserved`)
                              setTimeout(() => setShowTooltip(null), 1500)
                            }}
                            onClick={() => {
                              setPendingReservation({ rentalid: book.bookrental!.id, bookid: book.id })
                              setConfirmOpen(true)
                            }}
                            className=""
                          >
                            <IconWithTooltip tooltip="Reservierung aufheben">
                              <BookMarked color={colorDanger} size={25} />
                            </IconWithTooltip>
                            {showTooltip === `${book.id}-reserved` && (
                              <div className="absolute bottom-8 right-0 bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                                Reservierung aufheben
                              </div>
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="pr-11">
                      <span className="font-semibold">Das Buch:</span> {book.bookname}
                    </p>

                    <p>
                      <span className="font-semibold">reserviert für:</span> {book.bookrental!.user.name}
                    </p>

                    <p>
                      <span className="font-semibold">am:</span> {formatDateDE(reservedDate, "date")}
                    </p>

                    {durationDisplay && (
                      <p>
                        <span className="font-semibold">Reserviert seit:</span> {durationDisplay}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Übersicht Ausgeliehene Bücher */}
          <div className="flex flex-col gap-4 sm:w-1/2 w-full">
            <h2 className="text-xl font-semibold leading-tight text-center bg-white p-4 rounded">
              Ausgeliehene Bücher
            </h2>

            {rentaledBooks.length === 0 && (
              <p className="text-gray-500 flex justify-center">Keine Bücher ausgeliehen.</p>
            )}

            <div className="flex flex-col gap-4">
              {rentaledBooks.length > 0 &&
                rentaledBooks.map((book) => {
                  if (book.bookrental === null) return null

                  const rentalDate = new Date(book.bookrental.rentaldate)

                  const durationDisplay = calcDuration(rentalDate)

                  return (
                    <div key={book.id} className="bg-white p-4 rounded-lg shadow flex flex-col gap-2 relative">
                      <div className="absolute top-2 right-2 text-sm text-white">
                        <div className="flex flex-row justify-center items-center gap-2 item">
                          {/* Buch zurück geben */}
                          {book.bookrental?.rentaldate && (
                            <button
                              onContextMenu={(e) => {
                                e.preventDefault()
                                setShowTooltip(`${book.id}-return`)
                                setTimeout(() => setShowTooltip(null), 1500)
                              }}
                              onClick={() => {
                                setPendingReturn({ rentalid: book.bookrental!.id, bookid: book.id })
                                setConfirmOpen(true)
                                // handleReturn(book.bookrental!.id, book.id)
                              }}
                              className=""
                            >
                              <IconWithTooltip tooltip="Buch zurückgeben">
                                <BookmarkX color={colorDanger} size={25} />
                              </IconWithTooltip>
                              {showTooltip === `${book.id}-return` && (
                                <div className="absolute bottom-8 right-0 bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                                  Buch zurückgeben
                                </div>
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      <p className="pr-11">
                        <span className="font-semibold">Das Buch:</span> {book.bookname}
                      </p>

                      <p>
                        <span className="font-semibold">ausgeliehen an:</span> {book.bookrental!.user.name}
                      </p>

                      <p>
                        <span className="font-semibold">am:</span> {formatDateDE(rentalDate, "date")}
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
      </div>
      {pendingReservation && (
        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reservierung aufheben?</DialogTitle>
              <DialogDescription>Bist du sicher, dass die Reservierung aufgehoben werden soll?</DialogDescription>
            </DialogHeader>

            <DialogFooter className="flex justify-end gap-2 mt-4">
              <Button
                variant="secondary"
                onClick={() => {
                  setConfirmOpen(false)
                  setPendingReservation(null)
                }}
              >
                Abbrechen
              </Button>

              <Button
                variant="destructive"
                onClick={() => {
                  setConfirmOpen(false)
                  setPendingReservation(null)
                  handleReturn()
                }}
              >
                Ja
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {pendingReturn && (
        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Buch zurückgeben?</DialogTitle>
              <DialogDescription>Bist du sicher, dass dieses Buch zurückgeben wurde?</DialogDescription>
            </DialogHeader>

            <DialogFooter className="flex justify-end gap-2 mt-4">
              <Button
                variant="secondary"
                onClick={() => {
                  setConfirmOpen(false)
                  setPendingReturn(null)
                }}
              >
                Abbrechen
              </Button>

              <Button
                variant="destructive"
                onClick={() => {
                  setConfirmOpen(false)
                  setPendingReturn(null)
                  handleReturn()
                }}
              >
                Ja
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
