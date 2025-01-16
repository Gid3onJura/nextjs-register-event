import jwt from "jsonwebtoken"
import { toast } from "react-toastify"
import { TFormSchemaOrders } from "./types"

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

  // const responseData = await response.json()

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
