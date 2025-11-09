import { cookies } from "next/headers"
import ToolbarClient from "./ToolbarClient"

export default async function Toolbar() {
  const token = (await cookies()).get("auth_token")?.value
  const isLoggedIn = Boolean(token)

  return <ToolbarClient isLoggedIn={isLoggedIn} />
}
