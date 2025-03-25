import { sendEmail } from "@/util/email"
import { getEvents } from "@/util/getEvents"
import { formSchema } from "@/util/types"
import { generateICSFile, getGoogleCalendarLink, getOutlookCalendarLink, isRateLimited } from "@/util/util"
import { NextResponse } from "next/server"

interface EventData {
  description: string
  eventyear: string
  eventdate: string
}

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

  const name = result.data?.name
  const event = result.data?.event
  const email = result.data?.email
  const dojo = result.data?.dojo
  const comments = result.data?.comments
  const option = result.data?.option

  const eventsResponse = await getEvents()

  const eventsData: EventData[] = await eventsResponse.json()

  let eventExists = null

  if (eventsData) {
    eventExists = eventsData.find((item: EventData) => item.description === event)
  }

  if (!eventExists) {
    return NextResponse.json({ error: "Event nicht gefunden" }, { status: 404 })
  }

  let endDate = new Date(eventExists.eventdate)
  endDate.setHours(endDate.getHours() + 4)

  const calendarEvent = {
    title: event,
    description: event,
    start: new Date(eventExists.eventdate),
    end: endDate,
  }

  const googleLink = getGoogleCalendarLink(calendarEvent)
  const outlookLink = getOutlookCalendarLink(calendarEvent)

  let optionMailText = ""

  if (option) {
    optionMailText = `nehme am anschließendem Essen teil\n`
  } else {
    optionMailText = `nehme <strong>nicht</strong> am anschließendem Essen teil\n`
  }

  const htmlMail = `
  <h1>Anmeldung zum Event: ${event}</h1>\n
  <p>Name: ${name}</p>
  <p>Event: ${event}</p>
  <p>Dojo: ${dojo}</p>
  <p>Option: ${optionMailText}</p>
  <p>Kommentare: <br>${comments?.replace(/\n/g, "<br>")}</p>
  <hr/>
  <p>Hier ist dein Kalendereintrag für das Event. Prüfe bitte das Start- und End-Datum des Kalendereintrags mit deiner Einladung zum Event. Wir wollen ja nicht, dass du zu spät kommt 😉</p>
      <ul>
        <li><a href="${googleLink}">📅 Google Calendar</a></li>
        <li><a href="${outlookLink}">📅 Outlook</a></li>
      </ul>
      <p>Für Apple-Nutzer empfehlen wir den .ics-Download im Anhang.</p>`

  // attachments
  const attachments = [
    {
      filename: "event.ics",
      content: generateICSFile(calendarEvent),
      contentType: "text/calendar",
    },
  ]

  // send email to trainer
  try {
    await sendEmail(
      emailTo,
      email || "",
      `Anmeldung ${event}: ${name}`,
      `Name: ${name}\nEvent: ${event}\nDojo: ${dojo}\nKommentare: ${comments}`,
      htmlMail,
      attachments
    )
    return NextResponse.json({ message: "Anmeldung gesendet" }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: "Anmeldung fehlgeschlagen:" + JSON.stringify(error) }, { status: 500 })
  }
}
