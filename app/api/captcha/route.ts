import axios from "axios"

export async function POST(request: Request) {
  const data = await request.json()
  const { captchatoken } = data
  const secretKey: string | undefined = process.env.NEXT_PUBLIC_RECAPTCHA_SECRET_KEY

  if (!captchatoken) {
    return new Response(JSON.stringify({ message: "Token not found" }), {
      status: 405,
    })
  }

  try {
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify`,
      `secret=${secretKey}&response=${captchatoken}`,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    )

    if (response.data.success) {
      return new Response(JSON.stringify({ message: "Success" }), {
        status: 200,
      })
    } else {
      return new Response(JSON.stringify({ error: "Failed to verify" }), {
        status: 405,
      })
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error }), {
      status: 500,
    })
  }
}
