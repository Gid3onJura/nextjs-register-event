import { cookies } from "next/headers"

export async function GET(request: Request) {
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
      method: "GET",
      headers: headers,
    })

    const data = await response.json()

    return Response.json(data, { status: 200 })
  } catch (error) {
    return Response.json(
      { error: JSON.stringify(error), message: "[GET all book rentals]: Something went wrong" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const { book, name } = await request.json()

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
      body: JSON.stringify({ bookid: book, readername: name, rentaldate: new Date().toISOString() }),
    })

    const data = await response.json()

    return Response.json(data, { status: 200 })
  } catch (error) {
    return Response.json(
      { error: JSON.stringify(error), message: "[POST book rentals]: Something went wrong" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  const { rentalid, bookid } = await request.json()

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
      method: "DELETE",
      headers: headers,
      body: JSON.stringify({ rentalid, bookid }),
    })

    const data = await response.json()

    return Response.json(data, { status: 200 })
  } catch (error) {
    return Response.json(
      { error: JSON.stringify(error), message: "[DELETE book rentals]: Something went wrong" },
      { status: 500 }
    )
  }
}
