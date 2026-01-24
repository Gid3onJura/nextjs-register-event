"use client"

import Link from "next/link"
import { BookOpen, Settings, User } from "lucide-react"

interface DashboardCard {
  title: string
  description: string
  icon: React.ReactNode
  href: string
  color: string
}

export default function DashboardOverview() {
  const cards: DashboardCard[] = [
    {
      title: "Bücherverwaltung",
      description: "Verwalte ausgeliehene Bücher und Rentals",
      icon: <BookOpen className="w-8 h-8" />,
      href: "/dashboard/rental",
      color: "bg-blue-50 hover:bg-blue-100",
    },
    {
      title: "Profil",
      description: "Bearbeite dein Profil und deine Daten",
      icon: <User className="w-8 h-8" />,
      href: "/dashboard/profile",
      color: "bg-green-50 hover:bg-green-100",
    },
    {
      title: "Einstellungen",
      description: "Konfiguriere deine Einstellungen",
      icon: <Settings className="w-8 h-8" />,
      href: "/dashboard/settings",
      color: "bg-purple-50 hover:bg-purple-100",
    },
  ]

  return (
    <div className="flex flex-col gap-8 p-3 pt-5 bg-white min-h-screen">
      <h1 className="shadow-md w-full text-xl sm:text-2xl md:text-3xl font-bold leading-tight text-center bg-white p-4 rounded">
        Übersicht
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <Link key={card.href} href={card.href}>
            <div className={`${card.color} p-6 rounded-lg shadow-md cursor-pointer flex flex-col gap-4 h-full`}>
              <div className="text-blue-600">{card.icon}</div>
              <div>
                <h2 className="text-xl font-semibold">{card.title}</h2>
                <p className="text-gray-600 text-sm mt-2">{card.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
