"use client"

import { useEffect, useState, useRef } from "react"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { formSchema, TFormSchema } from "../util/types"
import { Textarea } from "@/components/ui/textarea"
import { getEvents } from "@/util/getEvents"

import ReCAPTCHA from "react-google-recaptcha"
import { notify } from "@/util/util"
import Link from "next/link"

interface Event {
  description: string
  eventyear: string
}

const dojos = [
  {
    name: "Merseburg",
    id: "1",
  },
  {
    name: "Leipzig",
    id: "2",
  },
]

export default function Home() {
  const [events, setEvents] = useState<Event[]>([])
  // const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const form = useForm<TFormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      event: "",
      email: "",
      dojo: "",
      comments: "",
    },
  })

  // captcha
  const recaptchaRef = useRef<ReCAPTCHA>(null)
  const [isVerified, setIsVerified] = useState(false)

  // placeholder text
  const placeholderEvent = "Wähle ein Event"
  const placeholderDojo = "Wähle ein Dojo"

  // get events from api
  useEffect(() => {
    setIsLoading(true)
    const fetchEvents = async () => {
      // let userDataJson = null

      // try {
      //   // login into api
      //   const userData = await login()

      //   userDataJson = await userData.json()

      //   if (!userDataJson || !userDataJson.accessToken) {
      //     console.log("No access token")
      //     setIsLoading(false)
      //     return
      //   }

      //   setAccessToken(userDataJson.accessToken)
      // } catch (error) {
      //   console.log(error)
      //   setIsLoading(false)
      //   return
      // }

      try {
        const eventsResponse = await getEvents()

        const eventsData = await eventsResponse.json()

        setEvents(eventsData)
        setIsLoading(false)
      } catch (error) {
        console.log(error)
        setIsLoading(false)
        setEvents([])
      }
    }
    fetchEvents()
  }, [])

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
