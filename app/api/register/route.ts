import { sendEmail } from "@/util/email"
import { getEvents } from "@/util/getEvents"
import { Event } from "@/util/interfaces"
import { formSchema } from "@/util/types"
import { createEmailTemplate, createICalEvent, isRateLimited } from "@/util/util"
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

  const allEventsResponse = await getEvents()
  const allEvents = await allEventsResponse.json()

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

  // payload is valid
  const { firstname, lastname, event: eventName, email, dojo, comments, options: selectedOptions } = result.data

  // const logoUrl = `data:image/png;base64,${kamizaBase64}`
  const logoUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/kamiza.png`

  let optionMailText = ""
  let icsFile = null
  let eventHinweis = ""

  // find event
  const eventObj = allEvents.find((e: Event) => `${e.description} ${e.eventyear}` === eventName)

  if (!eventObj) {
    return NextResponse.json(
      { error: "Event existiert scheinbar nicht! Melde dich gerne für ein anderes Event an." },
      { status: 404 }
    )
  }

  if (eventObj) {
    const eventOptions = eventObj.options || []
    eventHinweis = eventObj.note || ""

    if (eventOptions.length > 0) {
      const selectedOptionDescriptions: string[] = []
      const personOptions: { description: string; value: number }[] = []

      Object.entries(selectedOptions).forEach(([id, value]) => {
        const opt = eventOptions.find((o: any) => o.id === Number(id))
        if (!opt) return

        const slug = opt.slug || ""
        const type = opt.type || typeof value

        // 🔹 Sonderfall: Personen zählen
        if (slug.includes("count_persons")) {
          const numericValue = typeof value === "number" ? value : parseInt(value as any, 10)
          if (!isNaN(numericValue) && numericValue > 0) {
            personOptions.push({ description: opt.description, value: numericValue })
          }
          return // Skip reguläre Ausgabe unten
        }

        // 🔹 Normale Optionen
        switch (type) {
          case "boolean":
            if (value) selectedOptionDescriptions.push(`${opt.description}`)
            break
          case "number":
            if (value != 0 && value != null && value !== "")
              selectedOptionDescriptions.push(`${opt.description}: ${value}`)
            break
          case "string":
            if (value) selectedOptionDescriptions.push(`${opt.description}: ${value}`)
            break
          default:
            if (value) selectedOptionDescriptions.push(`${opt.description}: ${value}`)
            break
        }
      })

      // 🔹 Personenabschnitt bauen (falls vorhanden)
      let personsSection = ""
      if (personOptions.length > 0) {
        const total = personOptions.reduce((sum, p) => sum + p.value, 0)
        personsSection = `
        <p><strong>Teilnehmende Personen:</strong></p>
        <ul>
          ${personOptions.map((p) => `<li>${p.description}: ${p.value}</li>`).join("")}
        </ul>
        <p><strong>Personen insgesamt:</strong> ${total}</p>
      `
      }

      // 🔹 Zusammenbauen des Mailtexts
      if (selectedOptionDescriptions.length > 0 || personsSection) {
        optionMailText = `
        ${
          selectedOptionDescriptions.length > 0
            ? `<ul>${selectedOptionDescriptions.map((desc) => `<li>${desc}</li>`).join("")}</ul>`
            : ""
        }
        ${personsSection}
      `
      } else {
        optionMailText = "<p>Keine Option gewählt.</p>"
      }
    } else {
      optionMailText = ""
    }
  }

  // create ical
  const icsFileBuffer: Buffer | null = await createICalEvent(eventObj, emailTo)

  icsFile = icsFileBuffer
    ? {
        filename: "event.ics",
        content: icsFileBuffer,
        contentType: "text/calendar",
      }
    : null

  const htmlMail = createEmailTemplate(
    firstname,
    lastname,
    eventName,
    eventHinweis,
    dojo,
    comments,
    optionMailText,
    logoUrl
  )
  const plainMail = `Name: ${firstname} ${lastname}
                    Event: ${eventName}
                    Dojo: ${dojo}
                    Kommentare: ${comments}
                    ${optionMailText}`

  // send email
  try {
    // email for trainer
    await sendEmail(emailTo, "", `Anmeldung ${eventName}: ${firstname} ${lastname}`, plainMail, htmlMail)

    // email for user
    if (email) {
      await sendEmail(email, "", `Anmeldung ${eventName}: ${firstname} ${lastname}`, plainMail, htmlMail, icsFile)
    }

    return NextResponse.json({ message: "Anmeldung gesendet" }, { status: 200 })
  } catch (error) {
    console.log("Error sending email:", error)
    return NextResponse.json({ error: "Anmeldung fehlgeschlagen:" + JSON.stringify(error) }, { status: 500 })
  }
}
