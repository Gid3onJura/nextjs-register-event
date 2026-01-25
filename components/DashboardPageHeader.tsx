"use client"

import Link from "next/link"
import { ChevronLeft } from "lucide-react"

interface DashboardPageHeaderProps {
  title: string
}

export default function DashboardPageHeader({ title }: DashboardPageHeaderProps) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <Link
        href="/dashboard"
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
      >
        <ChevronLeft className="w-4 h-4" />
        Zurück
      </Link>
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
    </div>
  )
}
