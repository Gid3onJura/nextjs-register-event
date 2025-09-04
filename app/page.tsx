"use client"

import KamizaImage from "@/components/KamizaImage"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-16 p-6 sm:p-12 bg-discreet-gradient">
      {/* Buttons */}
      <KamizaImage />
      <div className="flex flex-col gap-4 w-full max-w-md">
        <Button asChild className="shadow-md hover:shadow-lg w-full rounded-lg sm:rounded-2xl p-4 text-lg sm:text-base">
          <Link className="btn-color-interaction" href="/events">
            Anmeldung zum Event
          </Link>
        </Button>
        {/* <Button asChild className="shadow-md hover:shadow-lg w-full rounded-lg sm:rounded-2xl p-4 text-lg sm:text-base">
          <Link href="/order">Bestellung aufgeben</Link>
        </Button> */}
      </div>
    </main>
  )
}
