"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import * as zod from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

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

const formSchema = zod.object({
  name: zod.string().min(1, { message: "Bitte gib deinen Namen ein" }),
  event: zod.string().refine(
    (value) => {
      if (value === "") {
        return false
      }
      return true
    },
    { message: "Bitte wähle ein Event aus" }
  ),
  email: zod.string().email({ message: "Bitte gib eine gültige E-Mail Adresse ein" }).optional().or(zod.literal("")),
  dojo: zod.string().refine(
    (value) => {
      if (value === "") {
        return false
      }
      return true
    },
    { message: "Bitte wähle ein Dojo aus" }
  ),
  comments: zod.string().optional(),
})
export default function Home() {
  const [events, setEvents] = useState<Event[]>([])
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null)
  const form = useForm<zod.infer<typeof formSchema>>({
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
      const response = await fetch("/api/event", {
        method: "GET",
      })
      const data = await response.json()

      setEvents(data)
    }
    fetchEvents()
  }, [])

  const handleSubmit = (values: zod.infer<typeof formSchema>) => {
    console.log({ values })
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-3xl font-bold">Anmeldung zu einem Shorai-Do-Kempo Merseburg Event</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="max-w-md w-full flex flex-col gap-4">
          {/* Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Name</FormLabel>
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
                  <FormLabel>Event</FormLabel>
                  <FormControl>
                    {/* <Select onValueChange={(value) => setSelectedEvent(value)}> */}
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
                  <FormLabel>Dojo</FormLabel>
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
                    <Input
                      type="text"
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
          <Button type="submit" className="w-full">
            Absenden
          </Button>
        </form>
      </Form>
      <div className="w-full">
        {selectedEvent && <p className="mt-2 text-gray-600">Selected Event ID: {selectedEvent}</p>}
      </div>
    </main>
  )
}
