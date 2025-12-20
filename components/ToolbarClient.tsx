"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X, Home, LogIn, LogOut, LayoutDashboard, Tickets, TreePine } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ToolbarClient({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [open, setOpen] = useState(false)

  return (
    <header
      className="
      w-full z-50 
      backdrop-blur-md bg-gray-800 
      text-white shadow-sm
    "
    >
      <div className="max-w-5xl mx-auto flex justify-between items-center p-4">
        {/* Left: Logo / Home */}
        <Link href="/" className="flex items-center gap-1 hover:text-gray-500">
          <Home size={20} /> Startseite
        </Link>

        <Link href="/events" className="flex items-center gap-1 hover:text-gray-500">
          <Tickets size={20} /> Anmeldung
        </Link>

        {/* <Link href="/adventcalendar" className="flex items-center gap-1 hover:text-gray-500">
          <TreePine size={20} /> Adventskalender
        </Link> */}

        {/* Mobile Button */}
        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center gap-6">
          {isLoggedIn && (
            <Link href="/dashboard" className="flex items-center gap-1 hover:text-gray-500">
              <LayoutDashboard size={20} /> Dashboard
            </Link>
          )}

          {!isLoggedIn ? (
            <Link href="/login">
              <Button variant="secondary" className="flex items-center gap-2">
                <LogIn size={18} /> Login
              </Button>
            </Link>
          ) : (
            <form action="/api/logout" method="POST">
              <Button variant="destructive" className="flex items-center gap-2">
                <LogOut size={18} /> Logout
              </Button>
            </form>
          )}
        </nav>
      </div>

      {/* Mobile Menü */}
      {open && (
        <div className="md:hidden bg-gray-900/95 backdrop-blur-md p-4 border-t border-gray-700">
          <nav className="flex flex-col gap-4 text-lg">
            {isLoggedIn && (
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 hover:text-blue-300"
              >
                <LayoutDashboard size={22} /> Dashboard
              </Link>
            )}

            {!isLoggedIn ? (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 hover:text-blue-300"
              >
                <LogIn size={22} /> Login
              </Link>
            ) : (
              <form action="/api/logout" method="POST" className="flex">
                <Button variant="destructive" className="flex items-center gap-2 w-full">
                  <LogOut size={22} /> Logout
                </Button>
              </form>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
