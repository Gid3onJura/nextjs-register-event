"use client"

import Link from "next/link"
import { BookOpen, ClipboardList, Settings, User } from "lucide-react"
import { useEffect, useState } from "react"
import { DashboardCard } from "@/util/interfaces"

export default function DashboardOverview() {
  const [userRoles, setUserRoles] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserRoles = async () => {
      try {
        const response = await fetch("/api/user/roles")
        if (response.ok) {
          const data = await response.json()
          setUserRoles(data.roles || [])
        }
      } catch (error) {
        console.error("Error fetching user roles:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserRoles()
  }, [])

  const allCards: DashboardCard[] = [
    {
      title: "Bibliothek",
      description: "Verwalte ausgeliehene Bücher",
      icon: <BookOpen />,
      href: "/dashboard/rental",
      allowedRoles: ["admin", "sensei"],
    },
    {
      title: "Profil",
      description: "Bearbeite dein Profil und deine Daten",
      icon: <User />,
      href: "/dashboard/profile",
      allowedRoles: ["user", "admin"],
    },
    {
      title: "Einstellungen",
      description: "Konfiguriere deine Einstellungen",
      icon: <Settings />,
      href: "/dashboard/settings",
      allowedRoles: ["admin"],
    },
    {
      title: "Events",
      description: "Erstelle Events",
      icon: <ClipboardList />,
      href: "/dashboard/events",
      allowedRoles: ["admin", "sensei"],
    },
  ]

  // Filtere Kacheln basierend auf User-Rollen
  const visibleCards = allCards.filter((card) => card.allowedRoles.some((role) => userRoles.includes(role)))

  if (loading) {
    return (
      <div className="flex flex-col gap-8 p-3 pt-5 bg-white min-h-screen justify-center items-center">
        <p className="text-center text-xl text-gray-800">Wird geladen...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 p-3 pt-5 bg-white min-h-screen">
      {/* <h1 className="shadow-md w-full text-xl sm:text-2xl md:text-3xl font-bold leading-tight text-center bg-white p-4 rounded">
        Übersicht
      </h1> */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleCards.map((card) => (
          <Link key={card.href} href={card.href}>
            <div className="bg-blue-50 hover:bg-blue-100 p-3 rounded-lg shadow-md cursor-pointer flex flex-col gap-2 h-full">
              <div className="flex flex-row gap-2 items-center">
                <div className="w-8 h-8 text-gray-800 flex justify-center items-center">{card.icon}</div>
                <div className="text-xl font-semibold">{card.title}</div>
              </div>
              <p className="text-gray-600 text-sm">{card.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
