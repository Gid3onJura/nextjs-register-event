import { sendEmail } from "@/util/email"
import { formSchema } from "@/util/types"
import { createEmailTemplate, isRateLimited } from "@/util/util"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  // rate limiting
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("remote-addr") || "unknown"

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Maximale Anzahl an Anmeldungen erreicht! Versuche es später nochmal." },
      { status: 429 }
    )
  }

  const body: unknown = await request.json()
  const emailTo = process.env.NEXT_PUBLIC_REGISTER_EMAIL_TO ?? ""

  const apiKey = request.headers.get("api-key")

  if (!apiKey || apiKey !== process.env.NEXT_PUBLIC_API_KEY) {
    return NextResponse.json({ error: "Forbidden" }, { status: 404 })
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

  const firstname = result.data?.firstname
  const lastname = result.data?.lastname
  const event = result.data?.event
  const email = result.data?.email
  const dojo = result.data?.dojo
  const comments = result.data?.comments
  const option = result.data?.option

  // let optionMailText = ""

  // if (option) {
  //   optionMailText = `nehme am anschließendem Essen teil\n`
  // } else {
  //   optionMailText = `nehme <strong>nicht</strong> am anschließendem Essen teil\n`
  // }

  // const logoUrl = `data:image/png;base64,${kamizaBase64}`
  const logoUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/kamiza.png`

  const htmlMail = createEmailTemplate(firstname, lastname, event, dojo, comments, "", logoUrl)

  // send email to trainer
  try {
    await sendEmail(
      emailTo,
      email || "",
      `Anmeldung ${event}: ${firstname} ${lastname}`,
      `Name: ${firstname} ${lastname}\n
      Event: ${event}\n
      Dojo: ${dojo}\n
      Kommentare: ${comments}`,
      htmlMail
    )
    return NextResponse.json({ message: "Anmeldung gesendet" }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: "Anmeldung fehlgeschlagen:" + JSON.stringify(error) }, { status: 500 })
  }
}
