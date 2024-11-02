import { sendEmail } from "@/util/email"
import { formSchema } from "@/util/types"
import { NextResponse } from "next/server"

type TUser = {
  exp: number
  iat: number
  id: number
  nickname: string
}

export async function POST(request: Request) {
  const body: unknown = await request.json()
  const emailTo = process.env.NEXT_PUBLIC_REGISTER_EMAIL_TO ?? ""

  if (!request.headers.get("Authorization")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  // const accessToken = request.headers.get("Authorization")?.split(" ")[1] ?? ""

  // if (!accessToken) {
  //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  // }

  const apiKey = request.headers.get("api-key")

  if (!apiKey || apiKey !== process.env.NEXT_PUBLIC_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  // validate body
  const result = formSchema.safeParse(body)
  let zodErrors = {}
  if (!result.success) {
    result.error.issues.forEach((issue) => {
      zodErrors = { ...zodErrors, [issue.path[0]]: issue.message }
    })
  }

  if (Object.keys(zodErrors).length > 0) {
    return NextResponse.json({ errors: zodErrors })
  }

  if (!result.success || !result.data) {
    return NextResponse.json({ error: "Die Eingaben sind fehlerhaft" }, { status: 400 })
  }

  if (!emailTo) {
    return NextResponse.json({ error: "Empfänger-Mail fehlt" })
  }

  const name = result.data?.name
  const event = result.data?.event
  const email = result.data?.email
  const dojo = result.data?.dojo
  const comments = result.data?.comments

  const htmlMail = `
  <h1>Anmeldung zum Event: ${event}</h1>\n
  <p>Name: ${name}</p>
  <p>Event: ${event}</p>
  <p>Dojo: ${dojo}</p>
  <p>Kommentare: <br>${comments?.replace(/\n/g, "<br>")}</p>`

  // send email to trainer
  try {
    await sendEmail(
      emailTo,
      email || "",
      `Anmeldung ${event}: ${name}`,
      `Name: ${name}\nEvent: ${event}\nDojo: ${dojo}\nKommentare: ${comments}`,
      htmlMail
    )
    return NextResponse.json({ message: "Anmeldung gesendet" }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: "Anmeldung fehlgeschlagen:" + JSON.stringify(error) }, { status: 500 })
  }
}
