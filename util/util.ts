import jwt from "jsonwebtoken"
import { toast } from "react-toastify"
import { TFormSchema, TFormSchemaOrders } from "./types"
import ical from "ical-generator"
import { fromZonedTime, toZonedTime } from "date-fns-tz"
import { Event } from "./interfaces"

export const isTimestampExpired = (timestamp: number) => {
  const now = Date.now() / 1000
  return now > timestamp
}

type TUser = {
  exp: number
  iat: number
  id: number
  nickname: string
}

export const getProducts = async () => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/products`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })

  const data = await response.json()

  return data
}

export const setOrder = async (values: TFormSchemaOrders) => {
  const API_KEY = process.env.NEXT_PUBLIC_API_KEY ?? ""
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/order`, {
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

  return response
}

export const setRegister = async (values: TFormSchema) => {
  const API_KEY = process.env.NEXT_PUBLIC_API_KEY ?? ""
  const response = await fetch("/api/register", {
    method: "POST",
    body: JSON.stringify({
      firstname: values.firstname,
      lastname: values.lastname,
      event: values.event,
      email: values.email,
      dojo: values.dojo,
      comments: values.comments,
      captchatoken: values.captchatoken,
      options: values.options,
    }),
    headers: { "Content-Type": "application/json", "api-key": API_KEY },
  })

  return response
}

export const verifyAccessToken = async (accessToken: string) => {
  const accessTokenSecret = process.env.NEXT_PUBLIC_ACCESS_TOKEN_SECRET ?? ""
  const apiUserNickname = process.env.NEXT_PUBLIC_API_USER_NICKNAME ?? ""
  const verification = (await Promise.all([
    jwt.verify(accessToken, accessTokenSecret, (error, user) => {
      if (error) {
        return { error: error }
      }
      return { user: user }
    }),
  ])) as unknown[]

  const verifiedUser = verification.find((item: any): item is { user: TUser } => "user" in item)

  if (!verifiedUser || verifiedUser.user.nickname !== apiUserNickname || isTimestampExpired(verifiedUser.user.exp)) {
    return [{ error: "Unauthorized" }, { status: 401 }]
  }
}

export const notify = (message: string, variant: "success" | "error" | "warn" | "info") => {
  const options = {
    autoClose: 5000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "light",
  }

  if (variant === "success") {
    toast.success(message, options)
  }

  if (variant === "error") {
    toast.error(message, options)
  }

  if (variant === "warn") {
    toast.warn(message, options)
  }

  if (variant === "info") {
    toast.info(message, options)
  }
}

const rateLimitMap = new Map<string, { count: number; lastRequest: number }>()
const RATE_LIMIT_WINDOW = process.env.NEXT_PUBLIC_RATE_LIMIT_WINDOW_MILLISECONDS
  ? parseInt(process.env.NEXT_PUBLIC_RATE_LIMIT_WINDOW_MILLISECONDS)
  : 60000 // 1 Minute
const MAX_REQUESTS = process.env.NEXT_PUBLIC_MAX_REQUESTS ? parseInt(process.env.NEXT_PUBLIC_MAX_REQUESTS) : 10 // 10 Anfragen pro Minute

export const isRateLimited = (ip: string): boolean => {
  const now = Date.now()
  const rateData = rateLimitMap.get(ip)

  if (!rateData) {
    // Erster Zugriff der IP
    rateLimitMap.set(ip, { count: 1, lastRequest: now })
    return false
  }

  if (now - rateData.lastRequest > RATE_LIMIT_WINDOW) {
    // Fenster ist abgelaufen, Rate-Limit zurücksetzen
    rateLimitMap.set(ip, { count: 1, lastRequest: now })
    return false
  }

  if (rateData.count > MAX_REQUESTS) {
    // Rate-Limit überschritten
    return true
  }

  // Anfrage zählen und speichern
  rateData.count++
  rateLimitMap.set(ip, rateData)
  return false
}

export const createEmailTemplate = (
  firstname: string,
  lastname: string,
  event: string,
  dojo: string,
  comments: string | undefined,
  optionMailText: string,
  logoUrl: string
) => {
  const htmlMail = `
  <div style="font-family: Arial, sans-serif; background-color: #f5f7fa; padding: 20px;">
    <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
      <div style="background-color: #1e3a8a; padding: 20px; text-align: center;">
        <img src="cid:kamiza" alt="Kamiza Logo" style="max-height: 60px; margin-bottom: 10px;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Anmeldung zum Event: ${event}</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #1e293b;">Teilnehmerdaten</h2>
        <p style="margin: 8px 0;"><strong>Name:</strong> ${firstname} ${lastname}</p>
        <p style="margin: 8px 0;"><strong>Event:</strong> ${event}</p>
        <p style="margin: 8px 0;"><strong>Dojo:</strong> ${dojo}</p>
        ${optionMailText ? `<p style="margin: 8px 0;"><strong>Optionen:</strong><br>${optionMailText}</p>` : ""}
        <p style="margin: 8px 0;"><strong>Kommentare:</strong><br>${comments?.replace(/\n/g, "<br>") || ""}</p>
      </div>
      <div style="background-color: #f1f5f9; text-align: center; padding: 15px; font-size: 12px; color: #64748b;">
        Diese E-Mail wurde automatisch generiert. Bitte nicht darauf antworten.
      </div>
    </div>
  </div>`

  return htmlMail
}

export const createICalEvent = async (event: Event, emailOganizer: string) => {
  // 📅 ICS-Kalendereintrag erzeugen (wenn Event-Zeiten vorhanden)
  if (!event?.eventdatetimefrom || !event?.eventdatetimeto) {
    return null
  }

  const timeZone = "Europe/Berlin"

  // Lokale Zeit (Berlin) → UTC konvertieren für Kalender
  const startUtc = fromZonedTime(new Date(event.eventdatetimefrom), timeZone)
  const endUtc = fromZonedTime(new Date(event.eventdatetimeto), timeZone)

  // Kalender erstellen
  const cal = ical({
    name: `Event: ${event.description}`,
    timezone: timeZone,
    // prodId: "//dein-verein.de//Event-System//DE",
  })

  // Event hinzufügen
  cal.createEvent({
    start: startUtc,
    end: endUtc,
    summary: event.description,
    description: `Ein Event des Shorai-Do-Kempo Merseburg`,
    location: "steht in der Einladung - bitte hier ergänzen",
    organizer: {
      name: "Shorai-Do-Kempo Merseburg",
      email: emailOganizer,
    },
  })

  // ICS-Datei als Buffer zurückgeben (z. B. für Mailanhang)
  return Buffer.from(cal.toString())
}

export function formatDeadline(dateString: string): string {
  const date = new Date(dateString)
  return (
    date.toLocaleString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }) + " Uhr"
  )
}

export function formatRelativeDeadline(dateString: string): string {
  try {
    const deadline = new Date(dateString)
    const now = new Date()
    const diffMs = deadline.getTime() - now.getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffMs > 0) {
      // Noch bevorstehend
      if (diffMinutes < 60) {
        return `noch ${diffMinutes} ${diffMinutes === 1 ? "Minute" : "Minuten"}`
      } else if (diffHours < 24) {
        return `noch ${diffHours} ${diffHours === 1 ? "Stunde" : "Stunden"}`
      } else if (diffDays === 1) {
        return "noch 1 Tag"
      } else {
        return `noch ${diffDays} Tage`
      }
    } else {
      // Bereits abgelaufen
      const absMs = Math.abs(diffMs)
      const absHours = Math.floor(absMs / (1000 * 60 * 60))
      const absDays = Math.floor(absHours / 24)

      if (absDays >= 2) {
        return "abgelaufen"
      } else if (absDays === 1) {
        return "vor 1 Tag abgelaufen"
      } else {
        return `vor ${absHours} ${absHours === 1 ? "Stunde" : "Stunden"} abgelaufen`
      }
    }
  } catch (error) {
    console.log("Error parsing date:", error)
    return ""
  }
}

export const kamizaBase64 =
  "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"
