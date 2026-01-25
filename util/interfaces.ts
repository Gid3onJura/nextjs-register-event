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
// export interface UserInToken {
//   id: number
//   nickname: string
//   roles: string
// }

export interface ProtectedRoute {
  path: string
  allowedRoles: string[]
}

export interface DashboardCard {
  title: string
  description: string
  icon: React.ReactNode
  href: string
  allowedRoles: string[]
}

export interface Exam {
  id: number
  rank: number
  category: string
  color: string
  user: number
  graduatedon: string
}

export interface User {
  id: number
  nickname: string
  name: string
  email: string | null
  dojo: number
  activated: boolean
  birth: string
  roles: string[]
  exams: Exam[]
}
