import { sendEmail } from "@/app/util/email"
import { formSchema } from "@/app/util/types"
import { NextResponse } from "next/server"

import jwt from "jsonwebtoken"

export async function POST(request: Request) {
  const body: unknown = await request.json()
  const emailTo = process.env.REGISTER_EMAIL_TO ?? ""
  const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET ?? ""

  if (!request.headers.get("Authorization")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const accessToken = request.headers.get("Authorization")?.split(" ")[1] ?? ""
  jwt.verify(accessToken, accessTokenSecret, (error, user) => {
    if (error) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  })

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
  <p>Comments: <br>${comments?.replace(/\n/g, "<br>")}</p>`

  // send email to trainer
  try {
    await sendEmail(
      emailTo,
      email || "",
      `Anmeldung ${event}: ${name}`,
      `Name: ${name}\nEvent: ${event}\nDojo: ${dojo}\nComments: ${comments}`,
      htmlMail
    )
    return NextResponse.json({ message: "Anmeldung gesendet" }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: "Anmeldung fehlgeschlagen" }, { status: 500 })
  }
}
