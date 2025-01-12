import fsPromises from "fs/promises"

export async function GET(request: Request) {
  try {
    const file = await fsPromises.readFile("./products.json", "utf8")
    const data = JSON.parse(file)

    return new Response(JSON.stringify(data), {
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error }), {
      status: 500,
    })
  }
}
