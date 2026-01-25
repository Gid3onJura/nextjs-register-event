"use client"

import DashboardPageHeader from "@/components/DashboardPageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"

export default function ProfilePageClient() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  })

  const [message, setMessage] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage("Profil aktualisiert")
    // Hier würde die API-Integration folgen
  }

  return (
    <div className="flex flex-col gap-8 p-3 pt-5 bg-white min-h-screen">
      <DashboardPageHeader title="Profil" />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md p-6 bg-white rounded shadow-md">
        <h2 className="text-xl font-semibold">Mein Profil</h2>

        <Input placeholder="Name" name="name" value={formData.name} onChange={handleChange} />
        <Input placeholder="E-Mail" name="email" type="email" value={formData.email} onChange={handleChange} />
        <Input placeholder="Telefon" name="phone" value={formData.phone} onChange={handleChange} />

        <Button type="submit" className="w-full">
          Speichern
        </Button>

        {message && <p className="text-sm text-green-600 mt-2">{message}</p>}
      </form>
    </div>
  )
}
