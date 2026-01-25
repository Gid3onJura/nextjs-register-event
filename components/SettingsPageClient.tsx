"use client"

import DashboardPageHeader from "@/components/DashboardPageHeader"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export default function SettingsPageClient() {
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
  })

  const [message, setMessage] = useState("")

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage("Einstellungen gespeichert")
    // Hier würde die API-Integration folgen
  }

  return (
    <div className="flex flex-col gap-8 p-3 pt-5 bg-white min-h-screen">
      <DashboardPageHeader title="Einstellungen" />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md p-6 bg-white rounded shadow-md">
        <h2 className="text-xl font-semibold">Einstellungen</h2>

        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Benachrichtigungen</label>
          <input
            type="checkbox"
            checked={settings.notifications}
            onChange={() => handleToggle("notifications")}
            className="w-4 h-4"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Dunkler Modus</label>
          <input
            type="checkbox"
            checked={settings.darkMode}
            onChange={() => handleToggle("darkMode")}
            className="w-4 h-4"
          />
        </div>

        <Button type="submit" className="w-full mt-4">
          Speichern
        </Button>

        {message && <p className="text-sm text-green-600 mt-2">{message}</p>}
      </form>
    </div>
  )
}
