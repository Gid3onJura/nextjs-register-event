import { formSchema } from "@/app/util/types"
import { NextResponse } from "next/server"
import { ZodError } from "zod"

export async function POST(request: Request) {
  const body: unknown = await request.json()

  // validate body
  const result = formSchema.safeParse(body)
  let zodErrors = {}
  if (!result.success) {
    result.error.issues.forEach((issue) => {
      zodErrors = { ...zodErrors, [issue.path[0]]: issue.message }
    })
  }

  // send confirmation email

  // send email to trainer

  return NextResponse.json(Object.keys(zodErrors).length > 0 ? { errors: zodErrors } : { success: true })
}
