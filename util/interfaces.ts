export interface EventOption {
  id: number
  description: string
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
