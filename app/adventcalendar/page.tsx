"use client"

import { useState, useMemo, useEffect } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import adventCalendar from "../../adventcalendar.json"
// import Lottie from "lottie-react"
// import snowAnimation from "../../public/snow.json"
import SnowCanvas from "@/components/SnowCanvas"
import Candle from "@/components/Candle"
import { Wind, Sun, Moon, DoorClosed, Snowflake } from "lucide-react"
import { Great_Vibes } from "next/font/google"

function getModeByTime(date = new Date()): "day" | "night" {
  const hour = date.getHours()
  return hour >= 7 && hour < 16 ? "day" : "night"
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
  const [completedDays, setCompletedDays] = useState<number[]>([])
  const [blowing, setBlowing] = useState(false)
  const selectedDay = adventCalendar.find((item) => item.day === openDay)
  const isExerciseCompleted = openDay !== null && completedDays.includes(openDay)

  useEffect(() => {
    setMode(getModeByTime())
    setToday(getTodayAdventDay())

    // open days
    const stored = localStorage.getItem("opened-days")
    if (stored) setOpenedDays(JSON.parse(stored))
    const completed = localStorage.getItem("completed-days")
    if (completed) setCompletedDays(JSON.parse(completed))
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

  function completeExercise(day: number) {
    setCompletedDays((prev) => {
      if (prev.includes(day)) return prev
      const next = [...prev, day]
      localStorage.setItem("completed-days", JSON.stringify(next))
      return next
    })
  }

  function blowOutCandles() {
    setBlowing(true)

    setTimeout(() => {
      setOpenDay(null)
      setOpenedDays([])
      setCompletedDays([])
      localStorage.removeItem("opened-days")
      localStorage.removeItem("completed-days")
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
          <p>{mode === "day" ? "🌲" : "🎄"}</p>
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
          <p>{mode === "day" ? "🌲" : "🎄"}</p>
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
                border
                border-emerald-100/35
                bg-gradient-to-br
                from-emerald-950/55
                via-emerald-900/30
                to-red-950/30
                backdrop-blur
                shadow-lg
                transition-colors
                flex
                items-center
                justify-center
                text-3xl
                sm:text-4xl
                cursor-pointer

                ${isLocked ? "border-white/10 bg-white/5 text-white/40 cursor-not-allowed" : "text-white hover:border-amber-200/70 hover:shadow-amber-200/15"}
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
              relative
              overflow-hidden
              rounded-2xl
              border
              border-amber-200/80
              bg-gradient-to-b
              from-amber-50
              to-white
              p-8
              text-emerald-950
              max-w-md
              text-center
              shadow-2xl
            "
            onClick={(e) => e.stopPropagation()}
          >
            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-700 via-amber-400 to-red-700"
            />
            <Snowflake aria-hidden="true" className="mx-auto mb-2 h-6 w-6 text-emerald-700" />
            {/* <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-red-800">Adventskalender</p> */}
            <h2 className="mb-4 text-3xl">Türchen {openDay}</h2>
            <p className="mb-2 text-sm font-semibold text-emerald-800">Deine Übung</p>
            <p className="text-base leading-relaxed text-slate-700">
              {selectedDay?.exercise ?? "Für dieses Türchen wurde keine Übung gefunden."}
            </p>
            {isExerciseCompleted ? (
              <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-semibold text-emerald-900">Dein Lösungsbuchstabe</p>
                <p className="my-1 text-4xl font-bold">
                  {selectedDay?.letter} {selectedDay?.position}
                </p>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => completeExercise(openDay)}
                className="mt-6 rounded-lg bg-emerald-800 px-5 py-3 font-semibold text-white transition-colors hover:bg-emerald-900"
              >
                Übung abgeschlossen?
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </main>
  )
}
