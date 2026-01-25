"use client"

import Link from "next/link"
import { ChevronLeft } from "lucide-react"

interface DashboardPageHeaderProps {
  title?: string
}

export default function DashboardPageHeader({ title }: DashboardPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/dashboard"
        className="w-fit flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
      >
        <ChevronLeft className="w-4 h-4" />
        Dashboard
      </Link>
      <div className="flex justify-center items-center">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      </div>
    </div>
  )
}
