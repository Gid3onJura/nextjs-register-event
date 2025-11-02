"use client"

import { useEffect, useState, useRef } from "react"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { formSchema, TFormSchema } from "@/util/types"
import { Textarea } from "@/components/ui/textarea"
import { getEvents } from "@/util/getEvents"
import { type Event } from "@/util/interfaces"

import ReCAPTCHA from "react-google-recaptcha"
import { formatDeadline, formatRelativeDeadline, notify, setRegister } from "@/util/util"
import Link from "next/link"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, ArrowRight, ArrowUp } from "lucide-react"
import { cn } from "@/lib/utils"

const dojos = [
  {
    name: "Merseburg",
    id: "1",
  },
  {
    name: "Leipzig",
    id: "2",
  },
  {
    name: "Halle",
    id: "3",
  },
]

export default function Event() {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const form = useForm<TFormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstname: "",
      lastname: "",
      event: "",
      email: "",
      dojo: "",
      comments: "",
      options: {},
    },
  })

  // captcha
  const recaptchaRef = useRef<ReCAPTCHA>(null)
  const [isVerified, setIsVerified] = useState(false)

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  // const selectedOptions: number[] = form.watch("options") || []

  // placeholder text
  const placeholderEvent = "Wähle ein Event"
  const placeholderDojo = "Zu welchem Dojo gehörst du?"

  // get events from api
  useEffect(() => {
    setIsLoading(true)
    const fetchEvents = async () => {
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

  const handleSubmit = async (values: TFormSchema) => {
    const response = await setRegister(values)

    if (response.headers.get("Content-Type")?.includes("application/json")) {
      const responseData = await response.json()
      if (responseData.errors) {
        const errors = responseData.errors
        if (errors.email) {
          form.setError("email", {
            type: "server",
            message: "Bitte gib eine gültige E-Mail Adresse ein",
          })
        } else if (errors.firstname) {
          form.setError("firstname", {
            type: "server",
            message: "Bitte gib deinen Vornamen ein",
          })
        } else if (errors.lastname) {
          form.setError("lastname", {
            type: "server",
            message: "Bitte gib deinen Nachnamen ein",
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
        } else if (errors.captchatoken) {
          form.setError("captchatoken", {
            type: "server",
            message: "Bitte gib das Captcha ein",
          })
        } else {
          notify("Anmeldung fehlgeschlagen! Bitte prüfe deine Eingaben.", "error")
          return
        }
      }

      if (responseData.message) {
        notify(responseData.message, "success")
      }

      if (responseData.error) {
        console.log("error", responseData.error)
        notify("Anmeldung fehlgeschlagen! Bitte versuche es erneut.", "error")
      }
    } else {
      console.log("Received non-JSON response")
      notify("Bestellung fehlgeschlagen! Bitte versuche es erneut.", "error")
    }

    form.reset({
      firstname: "",
      lastname: "",
      event: "",
      email: "",
      dojo: "",
      comments: "",
      options: {},
    })

    recaptchaRef.current?.reset()
    setIsVerified(false)
    setSelectedEvent(null)
    return
  }

  const handleCaptchaSubmission = async (captchatoken: string | null) => {
    try {
      if (captchatoken) {
        const response = await fetch("/api/captcha", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ captchatoken }),
        })

        const data = await response.json()

        if (data && data.message === "Success") {
          setIsVerified(true)
          return
        }

        setIsVerified(false)
      }
    } catch (error) {
      console.log(error)
      setIsVerified(false)
    }
  }

  const handleChange = (token: string | null) => {
    handleCaptchaSubmission(token)
  }

  const handleExpired = () => {
    setIsVerified(false)
  }

  return (
    <main className="flex min-h-screen flex-col items-center gap-2 p-2 bg-gray-600">
      <div className="flex flex-col gap-4">
        {/* Buttons */}
        <div className="flex flex-row">
          <Button
            asChild
            variant={"interaction"}
            className="text-white p-3 ms-2 rounded-full shadow-md focus:outline-none hover:shadow-lg text-lg sm:text-base"
          >
            <Link href="/" title="zurück">
              <ArrowLeft className="h-5 w-5" strokeWidth={3} />
            </Link>
          </Button>
        </div>
        <Card className="shadow-xl w-full">
          <CardHeader>
            <CardTitle>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight text-center mb-8">
                Anmeldung zu einem Shorai-Do-Kempo Merseburg Event
              </h1>
            </CardTitle>
            {/* <CardDescription>Card Description</CardDescription> */}
          </CardHeader>
          <CardDescription>
            {/* <div className="flex flex-col gap-3 items-center justify-center p-12">
                <div className="text-red-600 font-medium">
                  Hinweis zum Lehrgang: Bitte gib die Anzahl und Namen der Teilnehmer im Bemerkungsfeld mit an. Zu dem
                  wäre es wichtig deinen Budo-Pass zum Lehrgang mitzubringen.
                </div>
              </div> */}
          </CardDescription>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-4">
              <p className="text-black text-xl">Seite wird geladen...</p>
            </div>
          ) : (
            <CardContent className="flex flex-col items-center gap-16">
              {!Array.isArray(events) ? (
                <p className="text-red-500 text-xl">Die Anmeldung ist zur Zeit nicht möglich!</p>
              ) : (
                <Form {...form}>
                  {Array.isArray(events) && events.length > 0 && (
                    <form
                      onSubmit={form.handleSubmit(handleSubmit)}
                      className="max-w-2xl w-full flex flex-col gap-4 justify-center"
                    >
                      {/* Firstname */}
                      <FormField
                        control={form.control}
                        name="firstname"
                        render={({ field }) => {
                          return (
                            <FormItem>
                              <FormLabel>Vorname *</FormLabel>
                              <FormControl>
                                <Input
                                  type="text"
                                  placeholder="Vorname"
                                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )
                        }}
                      />
                      {/* Lastname */}
                      <FormField
                        control={form.control}
                        name="lastname"
                        render={({ field }) => {
                          return (
                            <FormItem>
                              <FormLabel>Nachname *</FormLabel>
                              <FormControl>
                                <Input
                                  type="text"
                                  placeholder="Nachname"
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
                                <Select
                                  onValueChange={(value) => {
                                    field.onChange(value)
                                    const event = events.find((e) => {
                                      return String(e.description + " " + e.eventyear) === value
                                    })

                                    setSelectedEvent(event || null)
                                    form.setValue("options", {}) // Optionen zurücksetzen
                                  }}
                                  defaultValue={field.value}
                                  value={field.value}
                                >
                                  <SelectTrigger>
                                    {field.value ? <SelectValue placeholder={placeholderEvent} /> : placeholderEvent}
                                  </SelectTrigger>
                                  <SelectContent className="max-w-[90vw] w-full" position="popper">
                                    {events.map((event, index) => {
                                      let statusText = ""
                                      let isSelectable = true
                                      let deadlinePassed = false
                                      let tooEarlyToRegister = false

                                      if (event.deadline && event.deadline !== null && event.deadline !== undefined) {
                                        const deadline = new Date(event.deadline)
                                        const now = new Date()

                                        const diffMs = deadline.getTime() - now.getTime()
                                        const diffDays = diffMs / (1000 * 60 * 60 * 24)

                                        deadlinePassed = diffMs <= 0
                                        tooEarlyToRegister =
                                          diffDays > parseInt(process.env.NEXT_PUBLIC_REGISTRATION_PERIOD_DAYS ?? "21")

                                        if (deadlinePassed) {
                                          statusText = "Anmeldung Geschlossen"
                                        } else if (tooEarlyToRegister) {
                                          statusText = "Anmeldung nicht freigeschaltet"
                                        } else {
                                          statusText = `${formatRelativeDeadline(event.deadline)}`
                                        }

                                        isSelectable = !deadlinePassed && !tooEarlyToRegister
                                      }

                                      return (
                                        <SelectItem
                                          key={event.id}
                                          value={`${event.description} ${event.eventyear}`}
                                          disabled={!isSelectable}
                                          className="w-full flex justify-between items-center text-sm"
                                        >
                                          <div className="flex justify-between items-center w-full">
                                            <div className={cn("flex", deadlinePassed && "line-through")}>
                                              {event.description}
                                            </div>
                                            <div
                                              className={cn(
                                                "text-muted-foreground text-right ml-2",
                                                deadlinePassed && "text-red-300",
                                                tooEarlyToRegister && "text-red-800",
                                                isSelectable && "text-green-500"
                                              )}
                                            >
                                              {statusText}
                                            </div>
                                          </div>
                                        </SelectItem>
                                      )
                                    })}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )
                        }}
                      />

                      {selectedEvent && (
                        <div className="rounded-md shadow-md px-3 py-2 border border-gray-100">
                          {/* Event Note */}
                          {selectedEvent && selectedEvent.note && (
                            <div className="flex flex-col gap-3 justify-center p-2">
                              <div className="text-red-600 font-bold">Hinweis zum Event: {selectedEvent?.note}</div>
                            </div>
                          )}

                          {/* Options */}
                          {selectedEvent && (
                            <FormItem>
                              <FormLabel>Optionen</FormLabel>
                              <div className="space-y-3 rounded-lg ps-3 bg-card">
                                {selectedEvent.options?.length > 0 ? (
                                  selectedEvent.options.map((opt) => (
                                    <div key={opt.id} className="flex flex-col space-y-1">
                                      {opt.type === "boolean" && (
                                        <div key={opt.id} className="flex items-center space-x-2">
                                          <Checkbox
                                            id={`option-${opt.id}`}
                                            checked={!!form.watch(`options.${opt.id}`)} // boolean cast
                                            onCheckedChange={(checked) => {
                                              form.setValue(`options.${opt.id}`, !!checked)
                                            }}
                                          />
                                          <label
                                            htmlFor={`option-${opt.id}`}
                                            className="text-sm leading-snug peer-disabled:cursor-not-allowed peer-disabled:opacity-70 break-words whitespace-normal"
                                          >
                                            {opt.description}
                                          </label>
                                        </div>
                                      )}

                                      {opt.type === "number" && (
                                        <div className="flex flex-row items-center justify-start gap-4">
                                          <label
                                            htmlFor={`option-${opt.id}`}
                                            className="text-sm leading-snug peer-disabled:cursor-not-allowed peer-disabled:opacity-70 break-words whitespace-normal"
                                          >
                                            {opt.description}
                                          </label>
                                          <Input
                                            id={`option-${opt.id}`}
                                            type="number"
                                            min={0}
                                            className="w-24"
                                            placeholder="Anzahl"
                                            value={Number(form.watch(`options.${opt.id}`)) || ""}
                                            onChange={(e) => {
                                              const value = e.target.value ? parseInt(e.target.value, 10) : null
                                              form.setValue(`options.${opt.id}`, value)
                                            }}
                                          />
                                        </div>
                                      )}

                                      {opt.type === "string" && (
                                        <div className="flex flex-row items-center justify-start gap-4">
                                          <label
                                            htmlFor={`option-${opt.id}`}
                                            className="text-sm leading-snug peer-disabled:cursor-not-allowed peer-disabled:opacity-70 break-words whitespace-normal"
                                          >
                                            {opt.description}
                                          </label>
                                          <Input
                                            id={`option-${opt.id}`}
                                            type="text"
                                            className="w-full"
                                            value={(() => {
                                              const val = form.watch(`options.${opt.id}`)
                                              if (typeof val === "string" || typeof val === "number") return val
                                              return "" // boolean/null werden hier ausgefiltert
                                            })()}
                                            onChange={(e) => {
                                              const value = e.target.value || ""
                                              form.setValue(`options.${opt.id}`, value)
                                            }}
                                          />
                                        </div>
                                      )}
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-muted-foreground text-sm">Keine Optionen verfügbar.</p>
                                )}
                              </div>
                            </FormItem>
                          )}
                        </div>
                      )}

                      {/* Dojo */}
                      <FormField
                        control={form.control}
                        name="dojo"
                        render={({ field }) => {
                          return (
                            <FormItem>
                              <FormLabel>Dojo *</FormLabel>
                              <FormControl>
                                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                  <SelectTrigger>
                                    {field.value ? <SelectValue placeholder={placeholderDojo} /> : placeholderDojo}
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
                                  placeholder="Bemerkungen"
                                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )
                        }}
                      />

                      {/* Captcha */}
                      <FormField
                        control={form.control}
                        name="captchatoken"
                        render={({ field }) => {
                          return (
                            <FormItem>
                              <div className="flex flex-col gap-4 items-center justify-center mt-7">
                                <FormLabel>Abfrage *</FormLabel>
                                <FormControl>
                                  <ReCAPTCHA
                                    sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""}
                                    ref={recaptchaRef}
                                    onChange={(token) => {
                                      handleChange(token)
                                      field.onChange(token)
                                    }}
                                    onExpired={handleExpired}
                                  />
                                </FormControl>
                                <FormMessage />
                              </div>
                            </FormItem>
                          )
                        }}
                      />

                      <Button
                        type="submit"
                        className="shadow-md hover:shadow-lg w-full rounded-lg sm:rounded-2xl p-4 text-lg sm:text-base"
                        disabled={form.formState.isSubmitting || !isVerified}
                        variant={"interaction"}
                      >
                        Absenden
                      </Button>
                    </form>
                  )}
                </Form>
              )}
            </CardContent>
          )}
        </Card>
      </div>
    </main>
  )
}
