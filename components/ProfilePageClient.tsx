"use client"

import DashboardPageHeader from "@/components/DashboardPageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useEffect, useState } from "react"
import { Label } from "./ui/label"
import { User } from "@/util/interfaces"
import Belt from "./Belt"

export default function ProfilePageClient({ userid }: { userid: number }) {
  const emptyUser: User = {
    id: 0,
    nickname: "",
    name: "",
    email: "",
    dojo: 0,
    activated: false,
    birth: "",
    roles: [],
    exams: [],
  }

  const [message, setMessage] = useState("")
  const [userData, setUserData] = useState<User>(emptyUser)
  const [formData, setFormData] = useState({
    email: "",
  })
  const [userBirth, setUserBirth] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    const fetchUserById = async () => {
      try {
        const response = await fetch(`/api/user?userid=${userid}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        })

        const userData = await response.json()

        setUserData(userData)
        setFormData({ email: userData.email ?? "" })
        setUserBirth(
          new Date(userData.birth).toLocaleDateString("de-DE", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
        )
      } catch (error) {
        console.log(error)
        setUserData(emptyUser)
        setFormData({ email: "" })
      }
    }
    fetchUserById()
    setIsLoading(false)
  }, [userid])

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

  // Ermittle die letzte Prüfung
  const lastExam =
    userData.exams.length > 0
      ? userData.exams.reduce((latest, exam) =>
          new Date(exam.graduatedon) > new Date(latest.graduatedon) ? exam : latest,
        )
      : null
  const lastRank = lastExam?.rank ?? null

  return (
    <div className="flex flex-col gap-8 p-3 pt-5 bg-white min-h-screen mb-4">
      <DashboardPageHeader />

      <div className="flex flex-col md:flex-row gap-6 w-full items-start">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6 bg-white rounded shadow-md w-full">
          <h2 className="text-xl font-semibold">Wie können wir dich erreichen</h2>

          <Label htmlFor="email">E-Mail</Label>
          <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} />

          <Button type="submit" className="w-full">
            Speichern
          </Button>

          {message && <p className="text-sm text-green-600 mt-2">{message}</p>}
        </form>

        {isLoading ? (
          <div className="flex flex-col gap-4 p-6 bg-gray-800 text-white rounded shadow-md w-full">
            Daten werden geladen...
          </div>
        ) : (
          <div className="flex flex-col gap-4 p-6 bg-gray-800 text-white rounded shadow-md w-full">
            <h2 className="text-xl font-semibold">Dein Profil</h2>

            <div className="grid grid-cols-1 gap-4">
              <div className="flex flex-row gap-2">
                <strong>Nickname:</strong>
                <p>{userData.nickname}</p>
              </div>
              <div className="flex flex-row gap-2">
                <strong>Name:</strong>
                <p>{userData.name}</p>
              </div>
              <div className="flex flex-row gap-2">
                <strong>E-Mail:</strong>
                <p>{userData.email ?? "Keine E-Mail hinterlegt"}</p>
              </div>
              <div className="flex flex-row gap-2">
                <strong>Geburtsdatum:</strong>
                <p>{userBirth}</p>
              </div>
              <div className="flex flex-row gap-2">
                <strong>Rollen:</strong>
                <p>{userData.roles.join(", ")}</p>
              </div>
              <div className="flex flex-row gap-2 items-center">
                <strong>Aktueller Rang:</strong> {lastRank && <Belt rank={lastRank} />}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
