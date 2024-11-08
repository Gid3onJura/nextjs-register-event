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
        captchatoken: values.captchatoken,
      }),
      headers: { "Content-Type": "application/json", "api-key": API_KEY },
    })

    const responseData = await response.json()

    if (!response.ok) {
      notify("Anmeldung fehlgeschlagen! Bitte versuche es erneut.", "warn")
      return
    }

    if (responseData.errors) {
      const errors = responseData.errors
      console.log(errors)
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

    form.reset({
      name: "",
      event: "",
      email: "",
      dojo: "",
      comments: "",
    })
    recaptchaRef.current?.reset()
    setIsVerified(false)
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
    <main className="flex min-h-screen flex-col items-center justify-center gap-16 p-24">
      <h1 className="text-3xl font-bold">Anmeldung zu einem Shorai-Do-Kempo Merseburg Event</h1>
      {isLoading ? (
        <p className="text-black text-xl">Seite wird geladen...</p>
      ) : (
        <>
          {!Array.isArray(events) ? (
            <p className="text-red-500 text-xl">Die Anmeldung ist zur Zeit nicht möglich!</p>
          ) : (
            <Form {...form}>
              {Array.isArray(events) && events.length > 0 && (
                <form
                  onSubmit={form.handleSubmit(handleSubmit)}
                  className="max-w-md w-full flex flex-col gap-4 justify-center"
                >
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
                            <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                              <SelectTrigger>
                                {field.value ? <SelectValue placeholder={placeholderEvent} /> : placeholderEvent}
                              </SelectTrigger>
                              <SelectContent>
                                {events.map((event, index) => (
                                  <SelectItem key={index} value={event.description + " " + event.eventyear}>
                                    {event.description + " " + event.eventyear}
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
                  {/* Captcha */}
                  <FormField
                    control={form.control}
                    name="captchatoken"
                    render={({ field }) => {
                      return (
                        <FormItem>
                          <div className="flex flex-col gap-4 items-center justify-center">
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

                  <Button type="submit" className="w-full" disabled={form.formState.isSubmitting || !isVerified}>
                    Absenden
                  </Button>
                </form>
              )}
            </Form>
          )}
        </>
      )}
    </main>
  )
}
