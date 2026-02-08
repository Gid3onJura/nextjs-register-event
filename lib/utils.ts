import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calcDuration(dateString: Date) {
  const now = new Date()

  const diffTime = now.getTime() - dateString.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  // Ganze Wochen + Resttage
  const weeks = Math.floor(diffDays / 7)
  const days = diffDays % 7

  let durationDisplay = ""

  if (weeks > 0) {
    durationDisplay = `${weeks} Woche${weeks > 1 ? "n" : ""}`
    if (days > 0) {
      durationDisplay += ` ${days} Tag${days > 1 ? "e" : ""}`
    }
  } else if (days > 0) {
    durationDisplay = `${days} Tag${days > 1 ? "e" : ""}`
  }

  return durationDisplay || "heute"
}
