"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { eventCreateSchema, TEventCreateSchema } from "@/util/types"
import { notify } from "@/util/util"
import { Plus, Trash2 } from "lucide-react"

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

const eventTypes = [
  { label: "Lehrgang", value: "lehrgang" },
  { label: "Training", value: "training" },
  { label: "Seminar", value: "seminar" },
  { label: "Sonstiges", value: "sonstiges" },
]

export default function EventsPageClient() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [options, setOptions] = useState<Array<{ label: string; type: "boolean" | "number" | "string" }>>([])
  const form = useForm<TEventCreateSchema>({
    resolver: zodResolver(eventCreateSchema),
    defaultValues: {
      description: "",
      eventtype: "",
      eventdatetimefrom: "",
      eventdatetimeto: "",
      deadline: "",
      location: "",
      note: "",
      options: [],
    },
  })

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
          eventdatetimefrom: "",
          eventdatetimeto: "",
          deadline: "",
          location: "",
          note: "",
        })
        setOptions([])
      }
    } catch (error) {
      console.error(error)
      notify("Event konnte nicht erstellt werden.", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
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
                        />
                      </FormControl>
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
      </div>
    </div>
  )
}
