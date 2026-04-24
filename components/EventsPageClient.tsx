"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { eventCreateSchema, TEventCreateSchema } from "@/util/types"
import { Event } from "@/util/interfaces"
import { formatDateDE, notify } from "@/util/util"
import { Plus, Trash2 } from "lucide-react"
import DashboardPageHeader from "./DashboardPageHeader"

function generateSlug(label: string, type: string): string {
  let prefix
  if (type === "boolean") {
    prefix = "check_"
  } else if (type === "number") {
    prefix = "count_"
  } else {
    prefix = "string_"
  }
  const slugified = label
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
  return prefix + slugified
}

function getEventTypeLabel(typeValue?: string) {
  return eventTypes.find((type) => type.value === typeValue)?.label || typeValue || "Unbekannt"
}

const eventTypes = [
  { label: "Lehrgang", value: "lehrgang" },
  { label: "Training", value: "training" },
  { label: "Seminar", value: "seminar" },
  { label: "Wettstreit", value: "wettstreit" },
  { label: "Sonstiges", value: "sonstiges" },
]

function getCurrentYearStart() {
  const currentYear = new Date().getFullYear()
  return `${currentYear}-01-01T00:00`
}

export default function EventsPageClient() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [options, setOptions] = useState<Array<{ label: string; type: "boolean" | "number" | "string" }>>([])
  const [events, setEvents] = useState<Event[]>([])
  const [isLoadingEvents, setIsLoadingEvents] = useState(true)
  const [descriptionMessage, setDescriptionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const form = useForm<TEventCreateSchema>({
    resolver: zodResolver(eventCreateSchema),
    defaultValues: {
      description: "",
      eventtype: "",
      eventdatetimefrom: getCurrentYearStart(),
      eventdatetimeto: getCurrentYearStart(),
      deadline: getCurrentYearStart(),
      location: "",
      note: "",
      options: [],
    },
  })

  const loadEvents = async () => {
    setIsLoadingEvents(true)

    try {
      const response = await fetch("/api/events")
      if (!response.ok) {
        throw new Error("Events konnten nicht geladen werden")
      }
      const data = await response.json()
      setEvents(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error(error)
      notify("Events konnten nicht geladen werden.", "error")
      setEvents([])
    } finally {
      setIsLoadingEvents(false)
    }
  }

  const handleDeleteEvent = async (eventId: number) => {
    if (!confirm("Event wirklich löschen?")) {
      return
    }

    try {
      const response = await fetch(`/api/events?id=${eventId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const responseData = await response.json()
        notify(responseData.error ?? "Löschen fehlgeschlagen.", "error")
        return
      }

      setEvents((current) => current.filter((event) => event.id !== eventId))
      notify("Event gelöscht.", "success")
    } catch (error) {
      console.error(error)
      notify("Löschen fehlgeschlagen.", "error")
    }
  }

  const handleSubmit = async (values: TEventCreateSchema) => {
    setIsSubmitting(true)

    // Extrahiere eventdate und eventyear aus eventdatetimefrom
    const eventdate = values.eventdatetimefrom.split("T")[0]
    const eventyear = eventdate.split("-")[0]

    // Generiere slugs für options
    const optionsWithSlug = options.map((opt) => ({
      ...opt,
      slug: generateSlug(opt.label, opt.type),
    }))

    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...values, eventdate, eventyear, options: optionsWithSlug }),
      })

      const responseData = await response.json()

      if (!response.ok) {
        if (responseData.errors) {
          Object.entries(responseData.errors).forEach(([key, message]) => {
            form.setError(key as keyof TEventCreateSchema, {
              type: "server",
              message: String(message),
            })
          })
        }

        notify(responseData.error ?? "Event konnte nicht erstellt werden.", "error")
      } else {
        notify("Event erfolgreich erstellt.", "success")
        form.reset({
          description: "",
          eventtype: "",
          eventdatetimefrom: getCurrentYearStart(),
          eventdatetimeto: getCurrentYearStart(),
          deadline: getCurrentYearStart(),
          location: "",
          note: "",
        })
        setDescriptionMessage(null)
        setOptions([])
        await loadEvents()
      }
    } catch (error) {
      console.error(error)
      notify("Event konnte nicht erstellt werden.", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    void loadEvents()
  }, [])

  const checkDescriptionDuplicate = (description: string) => {
    if (!description.trim()) {
      setDescriptionMessage(null)
      return
    }

    const isDuplicate = events.some((event) => event.description.toLowerCase() === description.toLowerCase())

    if (isDuplicate) {
      setDescriptionMessage({
        type: "error",
        text: "⚠️ Ein Event mit diesem Namen existiert bereits.",
      })
    } else {
      setDescriptionMessage({
        type: "success",
        text: "✓ Der Event-Name ist verfügbar.",
      })
    }
  }

  const currentYear = new Date().getFullYear()

  const filteredEvents = events.filter((event) => {
    const year = event.eventyear || event.eventdate?.split("T")[0]?.split("-")[0] || "0"
    return year >= String(currentYear)
  })

  const groupedEvents = filteredEvents.reduce<Record<string, Event[]>>((acc, event) => {
    const year = event.eventyear || event.eventdate?.split("T")[0]?.split("-")[0] || "Unbekannt"
    const normalizedYear = String(year)
    if (!acc[normalizedYear]) {
      acc[normalizedYear] = []
    }
    acc[normalizedYear].push(event)
    return acc
  }, {})

  const years = Object.keys(groupedEvents).sort((a, b) => Number(b) - Number(a))

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      <DashboardPageHeader />
      <div className="mx-auto max-w-4xl">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Neues Event erstellen</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event-Beschreibung *</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Beispiel: Kyu-Prüfung Merseburg"
                          className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e)
                            checkDescriptionDuplicate(e.target.value)
                          }}
                        />
                      </FormControl>
                      {descriptionMessage && (
                        <p
                          className={`text-sm mt-1 ${
                            descriptionMessage.type === "error" ? "text-red-600" : "text-green-600"
                          }`}
                        >
                          {descriptionMessage.text}
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="eventtype"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event-Typ *</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={(value) => field.onChange(value)}
                            value={field.value}
                            defaultValue={field.value}
                          >
                            <SelectTrigger>
                              {field.value ? (
                                <SelectValue placeholder="Wähle einen Event-Typ" />
                              ) : (
                                "Wähle einen Event-Typ"
                              )}
                            </SelectTrigger>
                            <SelectContent>
                              {eventTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="deadline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Anmelde-Deadline</FormLabel>
                        <FormControl>
                          <Input
                            type="datetime-local"
                            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="eventdatetimefrom"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Startzeit *</FormLabel>
                        <FormControl>
                          <Input
                            type="datetime-local"
                            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="eventdatetimeto"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Endzeit *</FormLabel>
                        <FormControl>
                          <Input
                            type="datetime-local"
                            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ort</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Merseburg Trainingshalle"
                          className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="note"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hinweise</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Zusätzliche Informationen zum Event"
                          className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Options */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <FormLabel>Optionen</FormLabel>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setOptions([...options, { label: "", type: "boolean" }])}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Option hinzufügen
                    </Button>
                  </div>
                  {options.map((option, index) => (
                    <Card key={index} className="p-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="text-sm font-medium">Bezeichnung</label>
                          <Input
                            type="text"
                            placeholder="z.B. Bleibe zum Essen"
                            value={option.label}
                            onChange={(e) => {
                              const newOptions = [...options]
                              newOptions[index].label = e.target.value
                              setOptions(newOptions)
                            }}
                            className="mt-1"
                          />
                        </div>
                        <div className="flex items-end gap-2">
                          <div className="flex-1">
                            <label className="text-sm font-medium">Typ</label>
                            <Select
                              value={option.type}
                              onValueChange={(value: "boolean" | "number" | "string") => {
                                const newOptions = [...options]
                                newOptions[index].type = value
                                setOptions(newOptions)
                              }}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="boolean">Ja/Nein</SelectItem>
                                <SelectItem value="number">Anzahl</SelectItem>
                                <SelectItem value="string">Text</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => setOptions(options.filter((_, i) => i !== index))}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Erstelle Event..." : "Event erstellen"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Erstellte Events</h2>
          {isLoadingEvents ? (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-700">
              Lade vorhandene Events...
            </div>
          ) : years.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-700">
              Keine Events gefunden.
            </div>
          ) : (
            <div className="space-y-6">
              {years.map((year) => (
                <div key={year} className="rounded-xl border border-gray-200 bg-white shadow-sm">
                  <div className="border-b border-gray-200 px-5 py-4 bg-gray-50">
                    <h3 className="text-lg font-semibold">{year}</h3>
                  </div>
                  <div className="space-y-3 px-5 py-4">
                    {groupedEvents[year].map((event) => (
                      <div
                        key={event.id}
                        className="rounded-xl border border-gray-100 bg-gray-50 p-4 sm:flex sm:items-center sm:justify-between"
                      >
                        <div className="space-y-2 sm:flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
                            <p className="font-semibold text-base">{event.description}</p>
                            <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                              {getEventTypeLabel(event.eventtype)}
                            </span>
                          </div>
                          <p className="text-sm text-slate-500">
                            {formatDateDE(event.eventdatetimefrom)} – {formatDateDE(event.eventdatetimeto)}
                          </p>
                          {event.note ? <p className="text-sm text-slate-500">Hinweis: {event.note}</p> : null}
                          {event.options?.length ? (
                            <div className="space-y-2 pt-2">
                              <p className="text-sm font-medium text-slate-700">Optionen:</p>
                              <div className="flex flex-wrap gap-2">
                                {event.options.map((option) => (
                                  <span
                                    key={option.id}
                                    className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                                  >
                                    {option.description}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ) : null}
                        </div>
                        <div className="mt-4 flex items-center gap-3 sm:mt-0">
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => void handleDeleteEvent(event.id)}
                          >
                            Löschen
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
