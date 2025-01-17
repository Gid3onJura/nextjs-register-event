"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-16 p-24">
      {/* Buttons */}
      <div className="flex gap-4 flex-col">
        <Button asChild>
          <Link href="/events" className="">
            Anmeldung zum Event
          </Link>
        </Button>
        <Button asChild>
          <Link href="/order" className="">
            Bestellung aufgeben
          </Link>
        </Button>
      </div>
    </main>
  )
}
