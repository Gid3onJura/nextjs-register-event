import { cookies } from "next/headers"

export async function POST(request: Request) {
  const { book, userid } = await request.json()

  const cookieStore = await cookies()
  const authToken = cookieStore.get("auth_token")?.value

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? ""
  const API_KEY = process.env.NEXT_PUBLIC_API_KEY ?? ""

  // get events from api
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "api-key": API_KEY,
    Authorization: "Bearer " + authToken,
  }

  const url = "bookrental"

  try {
    const response = await fetch(API_BASE_URL + "/" + url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({ bookid: book, userid: userid, reservationdate: new Date().toISOString() }),
    })

    const data = await response.json()

    return Response.json(data, { status: 200 })
  } catch (error) {
    return Response.json(
      { error: JSON.stringify(error), message: "[POST book reservation]: Something went wrong" },
      { status: 500 },
    )
  }
}
