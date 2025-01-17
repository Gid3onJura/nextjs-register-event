import { sendEmail } from "@/util/email"
import { formSchemaOrders } from "@/util/types"
import { getProducts } from "@/util/util"
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

  /* Bsp. body:
  {
    "result": {
        "success": true,
        "data": {
            "name": "3434",
            "products": [
                {
                    "quantity": 1
                },
                {},
                {},
                {},
                {},
                {},
                {},
                {},
                {},
                {},
                {
                    "quantity": 1
                }
            ],
            "email": "",
            "comments": "",
            "captchatoken": ...
          }
      }
  }
  */
  // return NextResponse.json({ result }, { status: 200 })

  const name = result.data?.name
  const orderedProducts = result.data?.products
  const email = result.data?.email
  const comments = result.data?.comments ?? ""
  const orderBill: any[] = []
  let productList = null
  let sum = 0

  // get products from database
  try {
    productList = await getProducts()
  } catch (error) {
    return NextResponse.json(
      { error: JSON.stringify(error), message: "Produktliste konnte nicht geladen werden" },
      { status: 500 }
    )
  }

  // compare ordered products with products from database
  orderedProducts?.forEach((product: any, orderIndex: number) => {
    productList.forEach((item: any, listIndex: number) => {
      if (orderIndex === listIndex && product.quantity) {
        orderBill.push({ ...item, quantity: product.quantity })
        console.log(item.price, product.quantity)
        sum += item.cost * product.quantity
      }
    })
  })

  const orderList = orderBill.map((product: any) => {
    return (
      "<tr>" +
      "<td>" +
      product.name +
      "</td>" +
      "<td>" +
      product.cost +
      " €</td>" +
      "<td>" +
      product.quantity +
      "</td>" +
      "<td>" +
      product.cost * product.quantity +
      "€</td>" +
      "</tr>"
    )
  })

  const htmlMail = `
  <h1>Bestellung von ${name}</h1>
  <p>Folgende Artikel wurden bestellt: </p>\n
  <table>
    <tr>
      <th style='margin-right: 10px;'>Artikel</th>
      <th style='margin-right: 10px;'>Preis/Stk.</th>
      <th style='margin-right: 10px;'>Anzahl</th>
      <th style='margin-right: 10px;'>Summe</th>
    </tr>
  ${orderList.join("")} 
  </table>
  <hr/>
  <p>Gesamt: ${sum} €</p>
  <p>Kommentare: <br>${comments?.replace(/\n/g, "<br>")}</p>`

  console.log(htmlMail)

  // send email to trainer
  try {
    await sendEmail(emailTo, email || "", `Bestellung von ${name}`, "", htmlMail)
    return NextResponse.json({ message: "Anmeldung gesendet" }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: "Anmeldung fehlgeschlagen:" + JSON.stringify(error) }, { status: 500 })
  }
}
