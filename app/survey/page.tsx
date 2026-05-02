"use client"

import { useEffect, useState, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import ReCAPTCHA from "react-google-recaptcha"
import { notify } from "@/util/util"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { z } from "zod"

interface SurveyQuestion {
  id: string
  question: string
  type: "number" | "select" | "multiselect" | "textarea" | "boolean"
  required: boolean
  options?: string[]
  min?: number
  max?: number
}

interface SurveyContent {
  title: string
  description: string
  questions: SurveyQuestion[]
}

interface SurveyItem {
  id: number
  deadline: string
  survey: SurveyContent
}

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? ""

// Dynamisches Schema basierend auf Fragen
function createSurveySchema(questions: SurveyQuestion[]) {
  const schema: Record<string, z.ZodTypeAny> = {}

  questions.forEach((q) => {
    let fieldSchema: any

    switch (q.type) {
      case "number":
        fieldSchema = z.number({
          required_error: q.required ? "Dieses Feld ist erforderlich" : undefined,
          invalid_type_error: "Bitte geben Sie eine gültige Zahl ein",
        })
        if (q.min !== undefined) fieldSchema = fieldSchema.min(q.min, `Mindestens ${q.min}`)
        if (q.max !== undefined) fieldSchema = fieldSchema.max(q.max, `Höchstens ${q.max}`)
        break
      case "select":
        fieldSchema = z.string({
          required_error: q.required ? "Bitte wählen Sie eine Option aus" : undefined,
        })
        if (q.options) fieldSchema = fieldSchema.refine((val: string) => q.options!.includes(val), "Ungültige Auswahl")
        break
      case "multiselect":
        fieldSchema = z.array(z.string()).optional()
        break
      case "textarea":
        fieldSchema = z.string().optional()
        break
      case "boolean":
        fieldSchema = z.boolean().optional()
        break
      default:
        fieldSchema = z.string().optional()
    }

    if (!q.required && q.type !== "boolean") {
      fieldSchema = fieldSchema.optional()
    }

    schema[q.id] = fieldSchema
  })

  schema.captchatoken = z.string().min(1, "Bitte bestätigen Sie, dass Sie kein Roboter sind")

  return z.object(schema)
}

export default function Survey() {
  const [surveys, setSurveys] = useState<SurveyItem[]>([])
  const [selectedSurvey, setSelectedSurvey] = useState<SurveyItem | null>(null)
  const [step, setStep] = useState<"select" | "form">("select")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const recaptchaRef = useRef<ReCAPTCHA>(null)

  useEffect(() => {
    fetch("/api/survey")
      .then((res) => res.json())
      .then((data: SurveyItem[]) => {
        // Filter abgelaufene Umfragen
        const now = new Date()
        const activeSurveys = data.filter((item) => new Date(item.deadline) > now)
        setSurveys(activeSurveys)
        setIsLoading(false)
      })
      .catch((err) => {
        console.error("Fehler beim Laden der Umfragen:", err)
        notify("Fehler beim Laden der Umfragen", "error")
        setIsLoading(false)
      })
  }, [])

  const form = useForm({
    resolver: selectedSurvey ? zodResolver(createSurveySchema(selectedSurvey.survey.questions)) : undefined,
    defaultValues: selectedSurvey
      ? selectedSurvey.survey.questions.reduce(
          (acc, q) => {
            if (q.type === "multiselect") acc[q.id] = []
            else if (q.type === "boolean") acc[q.id] = false
            else if (q.type === "number") acc[q.id] = undefined
            else acc[q.id] = ""
            return acc
          },
          {} as Record<string, any>,
        )
      : {},
  })

  const onSubmit = async (data: any) => {
    setIsSubmitting(true)
    try {
      const { captchatoken, ...filteredData } = data
      console.log("Formulardaten:", filteredData)
      console.log("umfrage:", selectedSurvey?.id)
      const response = await fetch("/api/survey", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...filteredData, surveyId: selectedSurvey?.id }),
      })

      if (response.ok) {
        notify("Umfrage erfolgreich abgesendet!", "success")
        form.reset()
        recaptchaRef.current?.reset()
        setStep("select")
        setSelectedSurvey(null)
      } else {
        const error = await response.json()
        notify(error.message || "Fehler beim Absenden der Umfrage", "error")
      }
    } catch (error) {
      console.error("Submit error:", error)
      notify("Netzwerkfehler beim Absenden", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4">Lade Umfragen...</p>
        </div>
      </div>
    )
  }

  if (surveys.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Ups...</CardTitle>
            <CardDescription>Keine Umfragen verfügbar.</CardDescription>
          </CardHeader>
          {/* <CardFooter>
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Zurück zur Startseite
              </Button>
            </Link>
          </CardFooter> */}
        </Card>
      </div>
    )
  }

  if (step === "select") {
    return (
      <div className="min-h-screen bg-white p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">Umfragen</h1>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {surveys.map((item) => (
              <Card
                key={item.id}
                className="cursor-pointer hover:shadow-lg transition-shadow flex flex-col"
                onClick={() => {
                  setSelectedSurvey(item)
                  setStep("form")
                }}
              >
                <CardHeader>
                  <CardTitle>{item.survey.title}</CardTitle>
                  <CardDescription>{item.survey.description}</CardDescription>
                </CardHeader>
                <CardFooter className="flex flex-col items-start mt-auto">
                  <p className="text-sm text-gray-500 mb-2">
                    Deadline: {new Date(item.deadline).toLocaleDateString("de-DE")}
                  </p>
                  <Button className="w-full">Diese Umfrage ausfüllen</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          {/* <div className="mt-8 text-center">
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Zurück zur Startseite
              </Button>
            </Link>
          </div> */}
        </div>
      </div>
    )
  }

  if (!selectedSurvey) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Ups...</CardTitle>
            <CardDescription>Keine Umfrage ausgewählt.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => setStep("select")}>Zurück zur Auswahl</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <Button
          type="button"
          variant="outline"
          className="mb-4"
          onClick={() => {
            setStep("select")
            setSelectedSurvey(null)
            form.reset()
          }}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Zurück zur Auswahl
        </Button>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">{selectedSurvey.survey.title}</CardTitle>
            <CardDescription className="text-center">{selectedSurvey.survey.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {selectedSurvey.survey.questions.map((question) => (
                  <FormField
                    key={question.id}
                    control={form.control}
                    name={question.id}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {question.question}
                          {question.required && <span className="text-red-500 ml-1">*</span>}
                        </FormLabel>
                        <FormControl>
                          {(() => {
                            switch (question.type) {
                              case "number":
                                return (
                                  <Input
                                    type="number"
                                    min={question.min}
                                    max={question.max}
                                    value={field.value?.toString() ?? ""}
                                    onChange={(e) =>
                                      field.onChange(e.target.value ? parseInt(e.target.value, 10) : undefined)
                                    }
                                  />
                                )
                              case "select":
                                if (!question.options) return null
                                return (
                                  <Select onValueChange={field.onChange} value={field.value ?? ""}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Bitte auswählen" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {question.options.map((option) => (
                                        <SelectItem key={option} value={option}>
                                          {option}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                )
                              case "multiselect":
                                if (!question.options) return null
                                return (
                                  <div className="space-y-2">
                                    {question.options.map((option) => (
                                      <div key={option} className="flex items-center space-x-2">
                                        <Checkbox
                                          id={`${question.id}-${option}`}
                                          checked={field.value?.includes(option) || false}
                                          onCheckedChange={(checked) => {
                                            const current = field.value || []
                                            if (checked) {
                                              field.onChange([...current, option])
                                            } else {
                                              field.onChange(current.filter((val: string) => val !== option))
                                            }
                                          }}
                                        />
                                        <label htmlFor={`${question.id}-${option}`} className="text-sm">
                                          {option}
                                        </label>
                                      </div>
                                    ))}
                                  </div>
                                )
                              case "textarea":
                                return <Textarea {...field} />
                              case "boolean":
                                return (
                                  <div className="flex items-center space-x-2">
                                    <Checkbox
                                      id={question.id}
                                      checked={field.value ?? false}
                                      onCheckedChange={field.onChange}
                                    />
                                    <label htmlFor={question.id} className="text-sm">
                                      Ja
                                    </label>
                                  </div>
                                )
                              default:
                                return null
                            }
                          })()}
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}

                <FormField
                  control={form.control}
                  name="captchatoken"
                  render={({ field }) => (
                    <FormItem className="flex justify-center">
                      <FormControl>
                        <ReCAPTCHA
                          ref={recaptchaRef}
                          sitekey={RECAPTCHA_SITE_KEY}
                          onChange={(token) => field.onChange(token)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-4">
                  <Button type="submit" className="flex-1" disabled={isSubmitting || !form.formState.isValid}>
                    {isSubmitting ? "Wird gesendet..." : "Umfrage absenden"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
