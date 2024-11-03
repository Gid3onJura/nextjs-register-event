import jwt from "jsonwebtoken"
import { toast } from "react-toastify"

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
