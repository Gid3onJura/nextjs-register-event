import { eventCreateSchema } from "@/util/types"
import { cookies } from "next/headers"

export async function GET(request: Request) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? ""
  const API_KEY = process.env.NEXT_PUBLIC_API_KEY ?? ""

  if (!API_BASE_URL || !API_KEY) {
    return Response.json({ error: "Prüfe deine Konfiguration" }, { status: 500 })
  }

  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "api-key": API_KEY,
  }

  const url = "event/reduced"

  try {
    const response = await fetch(API_BASE_URL + "/" + url, {
      method: "GET",
      headers: headers,
    })

    const data = await response.json()

    return Response.json(data, { status: 200 })
  } catch (error) {
    return Response.json(
      { error: JSON.stringify(error), message: "[GET all events]: Something went wrong" },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? ""
  const API_KEY = process.env.NEXT_PUBLIC_API_KEY ?? ""

  const cookieStore = await cookies()
  const authToken = cookieStore.get("auth_token")?.value

  if (!API_BASE_URL || !API_KEY) {
    return Response.json({ error: "Prüfe deine Konfiguration" }, { status: 500 })
  }

  const body: unknown = await request.json()

  const result = eventCreateSchema.safeParse(body)

  console.log(result)

  if (!result.success) {
    const errors: Record<string, string> = {}
    result.error.issues.forEach((issue) => {
      errors[issue.path[0] as string] = issue.message
    })
    return Response.json({ errors }, { status: 400 })
  }

  try {
    const response = await fetch(API_BASE_URL + "/event", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "api-key": API_KEY,
        Authorization: "Bearer " + authToken,
      },
      body: JSON.stringify(result.data),
    })

    const data = await response.json()

    if (!response.ok) {
      return Response.json(
        { error: data.error, message: data.message ?? "Event konnte nicht erstellt werden" },
        { status: response.status },
      )
    }

    return Response.json(data, { status: 200 })
  } catch (error) {
    return Response.json({ error: "Event konnte nicht erstellt werden", details: String(error) }, { status: 500 })
  }
}
