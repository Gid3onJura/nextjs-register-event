import jwt from "jsonwebtoken"
import { toast } from "react-toastify"
import { TFormSchema, TFormSchemaOrders } from "./types"

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
      name: values.name,
      event: values.event,
      email: values.email,
      dojo: values.dojo,
      comments: values.comments,
      captchatoken: values.captchatoken,
      option: values.option,
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

export const generateICSFile = (event: { title: string; start: Date; end: Date; description: string }) => {
  return `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:${event.title}
DTSTART:${formatICSDate(event.start)}
DTEND:${formatICSDate(event.end)}
DESCRIPTION:${event.description}
END:VEVENT
END:VCALENDAR`
}

export const formatICSDate = (date: Date) => {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
}

export const generateAllDayICSFile = (event: { title: string; start: Date; end: Date; description: string }) => {
  return `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:${event.title}
DTSTART;VALUE=DATE:${formatAllDayDate(event.start)}
DTEND;VALUE=DATE:${formatAllDayDate(event.end)}
DESCRIPTION:${event.description}
END:VEVENT
END:VCALENDAR`
}

export const formatAllDayDate = (date: Date) => {
  return date.toISOString().split("T")[0].replace(/-/g, "")
}

export const getGoogleCalendarLink = (event: { title: string; start: Date; end: Date; description: string }) => {
  const baseUrl = "https://www.google.com/calendar/render?action=TEMPLATE"
  const params = new URLSearchParams({
    text: event.title,
    dates: `${formatICSDate(event.start)}/${formatICSDate(event.end)}`,
    // location: event.location,
    details: event.description,
  })

  return `${baseUrl}&${params.toString()}`
}

export const getOutlookCalendarLink = (event: { title: string; start: Date; end: Date; description: string }) => {
  const baseUrl = "https://outlook.live.com/calendar/0/deeplink/compose"
  const params = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: event.title,
    startdt: event.start.toISOString(),
    enddt: event.end.toISOString(),
    // location: event.location,
    body: event.description,
  })

  return `${baseUrl}?${params.toString()}`
}

export const convertToISOFormat = (datestring: string) => {
  const dateTimeString = datestring

  // Zahlen extrahieren (Tag, Monat, Jahr, Stunde, Minute, Sekunde)
  const match = dateTimeString.match(/\d+/g)
  if (!match) {
    return ""
  }
  const [day, month, year, hours, minutes, seconds] = match.map(Number)

  // Date-Objekt erstellen (Monate in JS starten bei 0)
  const date = new Date(year, month - 1, day, hours, minutes, seconds)

  // ISO-String generieren (UTC)
  const isoString = date.toISOString()

  return isoString // "2025-03-23T11:10:00.000Z"
}
