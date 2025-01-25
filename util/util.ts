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
