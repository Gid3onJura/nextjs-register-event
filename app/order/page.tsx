"use client"

import { useEffect, useState, useRef } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { formSchemaOrders, TFormSchemaOrders } from "@/util/types"
import { Textarea } from "@/components/ui/textarea"

import ReCAPTCHA from "react-google-recaptcha"
import { getProducts, notify, setOrder } from "@/util/util"
import Link from "next/link"

interface Products {
  name: string
  description: string
  cost: number
}

export default function Order() {
  const [products, setProducts] = useState<Products[]>([])

  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<TFormSchemaOrders>({
    resolver: zodResolver(formSchemaOrders),
    defaultValues: {
      name: "",
      products: products.map((product) => ({
        name: product.name,
        description: product.description,
        cost: product.cost,
        quantity: 0, // Important: Initialize quantity
      })),
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
        const data = await getProducts()

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
    const response = await setOrder(values)

    // if (!response.ok) {
    //   notify("Bestellung fehlgeschlagen! Prüfe deine Eingaben und versuche es erneut.", "warn")
    //   return
    // }

    if (response.headers.get("Content-Type")?.includes("application/json")) {
      const responseData = await response.json()
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
          notify("Bestellung fehlgeschlagen! Bitte prüfe deine Eingaben.", "error")
          return
        }
      }

      if (responseData.message) {
        notify(responseData.message, "success")
      }

      if (responseData.error) {
        console.log("error", responseData.error)
        notify(responseData.error, "error")
      }
    } else {
      console.log("Received non-JSON response")
      notify("Bestellung fehlgeschlagen! Bitte versuche es erneut.", "error")
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
    <main className="flex min-h-screen flex-col items-center gap-16 p-24">
      {/* Buttons */}
      <div className="flex gap-4 flex-col">
        <Button asChild>
          <Link href="/" className="">
            Zurück zur Auswahl
          </Link>
        </Button>
      </div>

      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight text-center sm:text-left">
        Bestellung von Sachartikeln/Ausrüstung
      </h1>
      {isLoading ? (
        <p className="text-black text-xl">Seite wird geladen...</p>
      ) : (
        <>
          {!Array.isArray(products) ? (
            <p className="text-red-500 text-xl">Das Bestellen ist zur Zeit nicht möglich!</p>
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
                    // control={form.control}
                    name="products"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel>Artikel</FormLabel>
                        </div>
                        <div className="flex flex-col gap-4 w-full">
                          {products.map((product, index) => {
                            return (
                              <div key={index} className="flex flex-col gap-2 shadow-md p-4 rounded-md">
                                <Controller
                                  control={form.control}
                                  name={`products.${index}.quantity`}
                                  render={({ field, fieldState }) => (
                                    <FormItem>
                                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                        <div className="flex flex-col gap-1 sm:gap-2 w-full">
                                          <FormLabel>{products[index].name}</FormLabel>
                                          <div className="flex flex-wrap text-sm text-gray-500">
                                            {product.description}
                                          </div>
                                        </div>
                                        <div className="flex sm:flex-row items-center w-full justify-between">
                                          <div className="flex flex-row sm:w-28 text-sm">{product.cost} €/Stk.</div>
                                          <FormControl>
                                            <Input
                                              type="text"
                                              placeholder="Anzahl"
                                              min={0}
                                              className="w-[6em] rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                                              {...field}
                                              onChange={(e) => {
                                                const value = parseInt(e.target.value, 10) || 0
                                                field.onChange(value) // Use field.onChange to update form state
                                              }}
                                              value={field.value ?? ""} // Ensure a defined value to avoid uncontrolled behavior
                                            />
                                          </FormControl>
                                        </div>
                                      </div>
                                      <FormMessage>
                                        {fieldState.error?.message}
                                        {/* {form.formState.errors.products?.[index]?.quantity?.message} */}
                                      </FormMessage>
                                    </FormItem>
                                  )}
                                />
                                {/* <hr className="w-full border-t border-gray-300" /> */}
                              </div>
                            )
                          })}
                        </div>
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
