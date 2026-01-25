import { Award } from "lucide-react"
import { cn } from "@/lib/utils"

const Belt = ({ rank }: { rank: number }) => {
  const ranks = ["black", "brown", "blue", "green", "orange", "yellow", "white", "white"]
  const colorMap = {
    black: "text-black",
    brown: "text-[#654321]",
    blue: "text-blue-900",
    green: "text-green-900",
    orange: "text-orange-600",
    yellow: "text-yellow-400",
    white: "text-white",
  }

  const color = colorMap[ranks[rank - 1] as keyof typeof colorMap] || "#ffffff"

  return <Award className={cn(color)} size={30} />
}

export default Belt
