"use client"

import { useEffect, useState, useRef } from "react"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { formSchemaOrders, TFormSchemaOrders } from "@/util/types"
import { Textarea } from "@/components/ui/textarea"
import { getEvents } from "@/util/getEvents"

import ReCAPTCHA from "react-google-recaptcha"
import { notify } from "@/util/util"
import Link from "next/link"
import { Checkbox } from "@/components/ui/checkbox"

interface Products {
  name: string
  description: string
}

export default function Order() {
  const [products, setProducts] = useState<Products[]>([])

  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<TFormSchemaOrders>({
    resolver: zodResolver(formSchemaOrders),
    defaultValues: {
      name: "",
      products: [],
      email: "",
      comments: "",
    },
  })

  // captcha
  const recaptchaRef = useRef<ReCAPTCHA>(null)
  const [isVerified, setIsVerified] = useState(false)

  // placeholder text
  const placeholderEvent = "Wähle ein Artikel"

  // get products from json file
  useEffect(() => {
    setIsLoading(true)
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products", {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        })

        const data = await response.json()

        setProducts(data)
        setIsLoading(false)
      } catch (error) {
        console.log(error)
        setIsLoading(false)
        setProducts([])
      }
    }
    fetchProducts()
  }, [])

  const handleSubmit = async (values: TFormSchemaOrders) => {
    const API_KEY = process.env.NEXT_PUBLIC_API_KEY ?? ""
    const response = await fetch("/api/order", {
      method: "POST",
      body: JSON.stringify({
        name: values.name,
        products: values.products,
        email: values.email,
        comments: values.comments,
        captchatoken: values.captchatoken,
      }),
      headers: { "Content-Type": "application/json", "api-key": API_KEY },
    })

    const responseData = await response.json()

    if (!response.ok) {
      notify("Bestellung fehlgeschlagen! Bitte versuche es erneut.", "warn")
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
      } else if (errors.products) {
        form.setError("products", {
          type: "server",
          message: "Bitte wähle einen Artikel aus",
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
      products: [],
      email: "",
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
      {/* Buttons */}
      <div className="flex gap-4 flex-col">
        <Button asChild>
          <Link href="/" className="">
            Zurück zur Auswahl
          </Link>
        </Button>
      </div>

      <h1 className="text-3xl font-bold">Bestellung von Sachartikeln/Ausrüstung</h1>
      {isLoading ? (
        <p className="text-black text-xl">Seite wird geladen...</p>
      ) : (
        <>
          {!Array.isArray(products) ? (
            <p className="text-red-500 text-xl">Die Anmeldung ist zur Zeit nicht möglich!</p>
          ) : (
            <Form {...form}>
              {Array.isArray(products) && products.length > 0 && (
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
                  {/* Products */}
                  <FormField
                    control={form.control}
                    name="products"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel>Artikel</FormLabel>
                          {/* <FormDescription>Welche(n) Artikel willst du bestellen?</FormDescription> */}
                        </div>
                        {products.map((product, index) => (
                          <FormField
                            key={index}
                            control={form.control}
                            name="products"
                            render={({ field }) => {
                              return (
                                <FormItem key={index} className="flex flex-row items-start space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(product.name)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, product.name])
                                          : field.onChange(field.value?.filter((value) => value !== product.name))
                                      }}
                                    />
                                  </FormControl>
                                  <div className="flex flex-col justify-start">
                                    <FormLabel className="text-sm font-normal">{product.name}</FormLabel>
                                    <FormDescription>{product.description}</FormDescription>
                                  </div>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                        <FormMessage />
                      </FormItem>
                    )}
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
