export const login = async () => {
  const API_BASE_URL = process.env.API_BASE_URL ?? null
  const API_KEY = process.env.API_KEY ?? null
  const API_USER_NICKNAME = process.env.API_USER_NICKNAME ?? null
  const API_USER_PASSWORD = process.env.API_USER_PASSWORD ?? null
  // get events from api
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "api-key": API_KEY ?? "",
  }

  const url = "login"

  const body = {
    nickname: API_USER_NICKNAME,
    password: API_USER_PASSWORD,
  }

  try {
    const response = await fetch(API_BASE_URL + "/" + url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(body),
    })

    const data = await response.json()

    return Response.json(data, { status: 200 })
  } catch (error) {
    return Response.json(JSON.stringify(error), { status: 500 })
  }
}
