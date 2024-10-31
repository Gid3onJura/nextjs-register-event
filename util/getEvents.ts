export const getEvents = async (accessToken: string | null) => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || null
  const API_KEY = process.env.NEXT_PUBLIC_API_KEY || null

  if (!accessToken) {
    return Response.json({ error: "No access token" }, { status: 500 })
  }

  // get events from api
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "api-key": API_KEY ?? "",
    Authorization: "Bearer " + accessToken,
  }

  const url = "event"

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
      { status: 500 }
    )
  }
}
