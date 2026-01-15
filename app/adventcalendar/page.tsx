"use client"

import { useState, useMemo, useEffect } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
// import Lottie from "lottie-react"
// import snowAnimation from "../../public/snow.json"
import SnowCanvas from "@/components/SnowCanvas"
import Candle from "@/components/Candle"
import { Wind, Sun, Moon, DoorClosed } from "lucide-react"
import { Great_Vibes } from "next/font/google"

function getModeByTime(date = new Date()): "day" | "night" {
  const hour = date.getHours()
  return hour >= 7 && hour < 18 ? "day" : "night"
}

function getTodayAdventDay() {
  const now = new Date()
  const month = now.getMonth() // 0 = Januar
  const day = now.getDate()

  // Nur im Dezember
  if (month !== 0) return 0

  return Math.min(day, 24)
}

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
})

export default function Home() {
  const days = [17, 4, 22, 9, 1, 14, 6, 19, 11, 3, 24, 8, 15, 2, 20, 7, 13, 10, 5, 18, 16, 12, 23, 21]
  const [openDay, setOpenDay] = useState<number | null>(null)
  const [mode, setMode] = useState<"day" | "night">("night")
  const [today, setToday] = useState<number>(0)
  const [openedDays, setOpenedDays] = useState<number[]>([])
  const [blowing, setBlowing] = useState(false)

  useEffect(() => {
    setMode(getModeByTime())
    setToday(getTodayAdventDay())

    // open days
    const stored = localStorage.getItem("opened-days")
    if (stored) setOpenedDays(JSON.parse(stored))

    // Optional: alle 5 Minuten neu prüfen
    const interval = setInterval(() => {
      setMode(getModeByTime())
    }, 1 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  function openDoor(day: number) {
    setOpenDay(day)

    setOpenedDays((prev) => {
      if (prev.includes(day)) return prev
      const next = [...prev, day]
      localStorage.setItem("opened-days", JSON.stringify(next))
      return next
    })
  }

  function blowOutCandles() {
    setBlowing(true)

    setTimeout(() => {
      setOpenDay(null)
      setOpenedDays([])
      localStorage.removeItem("opened-days")
      setBlowing(false)
    }, 400)
  }

  return (
    <main
      className={`
        min-h-screen
        relative
        overflow-hidden
        transition-colors
        duration-1000
        ${
          mode === "night"
            ? "bg-gradient-to-b from-slate-950 via-indigo-950 to-blue-900"
            : "bg-gradient-to-b from-sky-300 via-sky-200 to-sky-100"
        }
      `}
    >
      {/* ❄️ Schnee */}
      {mode === "night" ? (
        <>
          <SnowCanvas density={140} speedMultiplier={1.1} opacity={0.9} />
          <SnowCanvas density={80} speedMultiplier={0.6} opacity={0.4} />
        </>
      ) : (
        <>
          <SnowCanvas density={90} speedMultiplier={0.9} opacity={0.7} />
          <SnowCanvas density={50} speedMultiplier={0.4} opacity={0.25} />
        </>
      )}

      <div className="flex flex-row gap-3 mt-1 ml-2">
        {/* Tag/Nacht-Toggle */}
        {/* <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setMode((m) => (m === "night" ? "day" : "night"))}
          className="rounded-full bg-black/20 backdrop-blur px-3 py-3 shadow-lg text-sm text-yellow-400"
        >
          {mode === "night" ? <Sun /> : <Moon />}
        </motion.button> */}

        {/* Toggle Blowing */}
        {openedDays.length > 0 && !blowing && (
          <motion.button
            onClick={blowOutCandles}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-3 py-3 rounded-full bg-white/80 backdrop-blur shadow-lg text-lg"
          >
            <Wind />
          </motion.button>
        )}
      </div>

      {/* 🎄 Inhalt */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 py-16 mb-20">
        <div className="flex flex-row text-center text-5xl sm:text-6xl md:text-7xl mb-12 justify-between items-center gap-1">
          <p>🎄</p>
          <motion.h1
            className={`
            ${greatVibes.className}
            ${mode === "night" ? "text-white" : "text-blue-900"}
          `}
            animate={{
              opacity: [1, 0.95, 1],
              textShadow: [
                // ruhig
                "0 0 10px rgba(255,180,90,0.35), 0 0 25px rgba(255,140,60,0.25)",
                // starkes Aufglühen
                "0 0 18px rgba(255,210,120,0.65), 0 0 45px rgba(255,160,80,0.45)",
                // zurück
                "0 0 10px rgba(255,180,90,0.35), 0 0 25px rgba(255,140,60,0.25)",
              ],
            }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            SDKM - Adventskalender
          </motion.h1>
          <p>🎄</p>
        </div>

        {/* 📱 Responsives Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-6 gap-4 justify-items-center">
          {days.map((day) => {
            const isLocked = day > today
            const isOpened = openedDays.includes(day)

            return (
              <motion.button
                key={day}
                disabled={isLocked}
                whileHover={!isLocked ? { scale: 1.08 } : undefined}
                whileTap={!isLocked ? { scale: 0.95 } : undefined}
                onClick={() => !isLocked && openDoor(day)}
                className={`
                h-20
                w-20
                rounded-2xl
                bg-white/10
                backdrop-blur
                shadow-lg
                flex
                items-center
                justify-center
                text-3xl
                sm:text-4xl
                cursor-pointer

                ${isLocked ? "bg-white/5 text-white/40 cursor-not-allowed" : "bg-white/15 text-white shadow-lg"}
              `}
              >
                {isOpened ? <Candle day={day} /> : isLocked ? <DoorClosed size={34} /> : day}
              </motion.button>
            )
          })}
        </div>
      </section>

      {/* 🎁 Modal */}
      {openDay && (
        <motion.div
          key={openDay}
          className="
            fixed
            inset-0
            bg-black/60
            z-20
            flex
            items-center
            justify-center
            px-4
          "
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setOpenDay(null)}
        >
          <motion.div
            initial={{ scale: 0.8, rotate: -5 }}
            animate={{ scale: 1, rotate: 0 }}
            className="
              bg-white
              text-red-900
              rounded-3xl
              p-10
              max-w-md
              text-center
            "
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-4xl mb-4">Türchen {openDay}</h2>
            <p className="text-lg">✨ Frohe Weihnachten! ✨</p>
          </motion.div>
        </motion.div>
      )}
    </main>
  )
}
