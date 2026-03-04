import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const cookieStore = await cookies()
  const authToken = cookieStore.get("auth_token")?.value
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? ""
  const API_KEY = process.env.NEXT_PUBLIC_API_KEY ?? ""

  // userid aus Query-Parametern auslesen
  const { searchParams } = new URL(request.url)
  const userid = searchParams.get("userid")

  let url = ""

  if (!authToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  // get events from api
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "api-key": API_KEY,
    Authorization: "Bearer " + authToken,
  }

  if (userid) {
    url = `user/${userid}`
  } else {
    url = "user"
  }

  if (!url) return NextResponse.json({ error: "route is undefined" }, { status: 400 })

  try {
    const response = await fetch(API_BASE_URL + "/" + url, {
      method: "GET",
      headers: headers,
    })

    const data = await response.json()

    return Response.json(data, { status: 200 })
  } catch (error) {
    return Response.json({ error: JSON.stringify(error), message: "[GET user]: Something went wrong" }, { status: 500 })
  }
}
