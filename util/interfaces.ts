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
