import { sendEmail } from "@/util/email"
import { formSchemaOrders } from "@/util/types"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const body: unknown = await request.json()
  const emailTo = process.env.NEXT_PUBLIC_REGISTER_EMAIL_TO ?? ""

  const apiKey = request.headers.get("api-key")

  if (!apiKey || apiKey !== process.env.NEXT_PUBLIC_API_KEY) {
    return NextResponse.json({ error: "Forbidden" }, { status: 404 })
  }

  // validate body
  const result = formSchemaOrders.safeParse(body)
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

  return NextResponse.json({ result }, { status: 200 })

  const name = result.data?.name
  const products = result.data?.products
  const email = result.data?.email
  const comments = result.data?.comments

  const htmlMail = `
  <h1>Hi ${name}</h1>
  <p>Folgende Artikel wurden bestellt: </p>\n
  ${products?.map((product: any) => {
    return `<p>${product.name}</p>`
  })}
  <p>Kommentare: <br>${comments?.replace(/\n/g, "<br>")}</p>`

  // send email to trainer
  try {
    await sendEmail(
      emailTo,
      email || "",
      `Bestellung von ${name}`,
      `Name: ${name}\nArtikel: ${products?.map((product: any) => {
        return `${product.name}\n`
      })}\nKommentare: ${comments}`,
      htmlMail
    )
    return NextResponse.json({ message: "Anmeldung gesendet" }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: "Anmeldung fehlgeschlagen:" + JSON.stringify(error) }, { status: 500 })
  }
}
