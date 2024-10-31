"use client"

import { useEffect, useState } from "react"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { formSchema, TFormSchema } from "../util/types"
import { Textarea } from "@/components/ui/textarea"
import { login } from "@/util/login"
import { getEvents } from "@/util/getEvents"

interface Event {
  description: string
  eventcolor: string
  eventdate: string
  eventtype: string
  id: number
  override: boolean
  repeating: boolean
  repetitiontype: string
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
  const [accessToken, setAccessToken] = useState<string | null>(null)
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

  // get events from api
  useEffect(() => {
    const fetchEvents = async () => {
      let userDataJson = null

      try {
        // login into api
        const userData = await login()

        userDataJson = await userData.json()

        if (!userDataJson) {
          return
        }

        setAccessToken(userDataJson.accessToken)
      } catch (error) {
        console.log(error)
        return
      }

      try {
        const eventsResponse = await getEvents(userDataJson.accessToken)

        const eventsData = await eventsResponse.json()

        setEvents(eventsData)
      } catch (error) {
        console.log(error)
        setEvents([])
      }
    }
    fetchEvents()
  }, [])

  const handleSubmit = async (values: TFormSchema) => {
    const API_KEY = process.env.NEXT_PUBLIC_API_KEY ?? ""
    const response = await fetch("/api/register", {
      method: "POST",
      body: JSON.stringify({
        name: values.name,
        event: values.event,
        email: values.email,
        dojo: values.dojo,
        comments: values.comments,
      }),
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + accessToken, "api-key": API_KEY ?? "" },
    })

    const responseData = await response.json()

    if (!response.ok) {
      alert("Anmeldung fehlgeschlagen! Bitte versuche es erneut.")
      return
    }

    if (responseData.errors) {
      const errors = responseData.errors
      if (errors.email) {
        form.setError("email", {
          type: "server",
          message: "Bitte gib eine gültige E-Mail Adresse ein",
        })
      } else if (errors.name) {
        form.setError("name", {
          type: "server",
          message: "Bitte gib deinen Namen ein",
        })
      } else if (errors.event) {
        form.setError("event", {
          type: "server",
          message: "Bitte wähle ein Event aus",
        })
      } else if (errors.dojo) {
        form.setError("dojo", {
          type: "server",
          message: "Bitte wähle ein Dojo aus",
        })
      } else {
        alert("Anmeldung fehlgeschlagen! Bitte prüfe deine Eingaben.")
        return
      }
    }

    if (responseData.message) {
      alert(responseData.message)
    }

    if (responseData.error) {
      console.log("error", responseData.error)
      alert("Anmeldung fehlgeschlagen! Bitte versuche es erneut.")
    }

    return
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-16 p-24">
      <h1 className="text-3xl font-bold">Anmeldung zu einem Shorai-Do-Kempo Merseburg Event</h1>

      {!Array.isArray(events) && <p className="text-red-500 text-xl">Die Anmeldung ist zur Zeit nicht möglich!</p>}
      <Form {...form}>
        {Array.isArray(events) && events.length > 0 && (
          <form onSubmit={form.handleSubmit(handleSubmit)} className="max-w-md w-full flex flex-col gap-4">
            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Name"
                        className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )
              }}
            />
            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>Bestätigungs E-Mail</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="E-Mail"
                        className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )
              }}
            />
            {/* Event */}
            <FormField
              control={form.control}
              name="event"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>Event *</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="An welchem Event möchtest du teilnehmen?" />
                        </SelectTrigger>
                        <SelectContent className="">
                          {events.map((event) => (
                            <SelectItem key={event.id} value={event.description}>
                              {event.description}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )
              }}
            />
            {/* Dojo */}
            <FormField
              control={form.control}
              name="dojo"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>Dojo *</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="In welchem Dojo trainierst du?" />
                        </SelectTrigger>
                        <SelectContent className="">
                          {dojos.map((dojo) => (
                            <SelectItem key={dojo.id} value={dojo.name}>
                              {dojo.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )
              }}
            />
            {/* Comments */}
            <FormField
              control={form.control}
              name="comments"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>Bemerkungen</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={5}
                        placeholder="Bemerkungen (optional)"
                        className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )
              }}
            />
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              Absenden
            </Button>
          </form>
        )}
      </Form>
    </main>
  )
}
