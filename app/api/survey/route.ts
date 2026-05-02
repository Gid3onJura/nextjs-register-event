import { NextResponse } from "next/server"
import { z } from "zod"
import { isRateLimited } from "@/util/util"

// Survey Antwort Schema - wird dynamisch erstellt basierend auf Fragen
function createSurveyResponseSchema(questions: any[]) {
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
        if (q.options) fieldSchema = fieldSchema.refine((val: string) => q.options.includes(val), "Ungültige Auswahl")
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

  return z.object(schema)
}

export async function POST(request: Request) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? ""
  const API_KEY = process.env.NEXT_PUBLIC_API_KEY ?? ""

  // Rate limiting
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("remote-addr") || "unknown"

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Maximale Anzahl an Umfrage-Teilnahmen erreicht! Versuche es später nochmal." },
      { status: 429 },
    )
  }

  try {
    const body: unknown = await request.json()
    const { surveyId, ...responses } = body as any

    // Lade Survey-Konfiguration basierend auf surveyId
    const surveyResponse = await fetch(`${API_BASE_URL}/survey/${surveyId}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "api-key": API_KEY,
      },
    })

    if (!surveyResponse.ok) {
      return NextResponse.json({ error: "Umfrage-Konfiguration nicht gefunden" }, { status: 500 })
    }
    const surveyItem = await surveyResponse.json()
    const surveyData = surveyItem.survey

    // Validiere mit dynamischem Schema
    const surveySchema = createSurveyResponseSchema(surveyData.questions)
    const result = surveySchema.safeParse(responses)

    let zodErrors = {}
    if (!result.success) {
      result.error.issues.forEach((issue) => {
        zodErrors = { ...zodErrors, [issue.path[0]]: issue.message }
      })
      return NextResponse.json({ errors: zodErrors })
    }

    if (!result.success || !result.data) {
      return NextResponse.json({ error: "Die Eingaben sind fehlerhaft" }, { status: 400 })
    }

    const submitUrl = "survey/complete"

    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
      "api-key": API_KEY,
    }

    const submitResponse = await fetch(API_BASE_URL + "/" + submitUrl, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        id: surveyId || "default",
        answers: result.data,
      }),
    })

    if (!submitResponse.ok) {
      throw new Error("Fehler beim Speichern der Umfrage")
    }

    return NextResponse.json({ message: "Umfrage erfolgreich gespeichert" })
  } catch (error) {
    console.error("Survey submit error:", error)
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? ""
  const API_KEY = process.env.NEXT_PUBLIC_API_KEY ?? ""

  try {
    const response = await fetch(`${API_BASE_URL}/survey`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "api-key": API_KEY,
      },
    })

    if (!response.ok) {
      throw new Error("Fehler beim Laden der Umfragen")
    }

    const surveys = await response.json()
    return NextResponse.json(surveys)
  } catch (error) {
    console.error("Survey list error:", error)
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 })
  }
}
