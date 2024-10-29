import { login } from "@/app/util/util"

export async function GET(request: Request) {
  const API_BASE_URL = process.env.API_BASE_URL || null
  const API_KEY = process.env.API_KEY || null
  let userDataJson = null

  try {
    // login into api
    const userData = await login()

    userDataJson = await userData.json()

    if (!userDataJson) {
      return Response.json({ message: "Login failed! User data not exists", status: 500 }, { status: 500 })
    }
  } catch (error) {
    return Response.json({ error: JSON.stringify(error), message: "[POST login]: Login failed!" }, { status: 500 })
  }

  // get events from api
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "api-key": API_KEY ?? "",
    Authorization: "Bearer " + userDataJson.accessToken,
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
