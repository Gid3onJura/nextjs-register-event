export const login = async () => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? ""
  const API_KEY = process.env.NEXT_PUBLIC_API_KEY ?? ""
  const API_USER_NICKNAME = process.env.NEXT_PUBLIC_API_USER_NICKNAME ?? ""
  const API_USER_PASSWORD = process.env.NEXT_PUBLIC_API_USER_PASSWORD ?? ""
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
