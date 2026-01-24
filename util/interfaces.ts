export interface EventOption {
  id: number
  description: string
  slug: string
  type: string
}
export interface Event {
  id: number
  eventyear: string
  description: string
  eventdate: string
  eventdatetimefrom: string
  eventdatetimeto: string
  deadline: string
  options: EventOption[]
  note: string
}
export interface User {
  id: number
  nickname: string
  roles: string
}

export interface ProtectedRoute {
  path: string
  allowedRoles: string[]
}
