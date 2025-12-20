"use client"

import { useState, useMemo, useEffect } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
// import Lottie from "lottie-react"
// import snowAnimation from "../../public/snow.json"
import SnowCanvas from "@/components/SnowCanvas"

function getModeByTime(date = new Date()): "day" | "night" {
  const hour = date.getHours()
  return hour >= 7 && hour < 18 ? "day" : "night"
}

/* 🔀 Türchen zufällig, aber stabil */
const useRandomDays = () =>
  useMemo(() => {
    const arr = Array.from({ length: 24 }, (_, i) => i + 1)

    // Fisher-Yates Shuffle
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }

    return arr
  }, [])

export default function Home() {
  const days = useRandomDays()
  const [openDay, setOpenDay] = useState<number | null>(null)
  const [mode, setMode] = useState<"day" | "night">("night")

  useEffect(() => {
    setMode(getModeByTime())

    // Optional: alle 5 Minuten neu prüfen
    const interval = setInterval(() => {
      setMode(getModeByTime())
    }, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

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

      {/* 🌗 Toggle */}
      {/* <button
        onClick={() => setMode((m) => (m === "night" ? "day" : "night"))}
        className="
          rounded-full
          bg-black/20
          backdrop-blur
          px-3 py-2
          shadow-lg
          text-sm
        "
      >
        {mode === "night" ? "☀️" : "🌙"}
      </button> */}

      {/* Nebel */}
      {/* {mode === "night" && <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-6" />} */}

      {/* Sterne */}
      {/* {mode === "night" && (
        <div className="absolute inset-0 bg-[radial-gradient(white_1px,transparent_1px)] bg-[size:3px_3px] opacity-20" />
      )} */}

      {/* 🎄 Inhalt */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 py-16 mb-20">
        <h1
          className={`
            text-center text-3xl sm:text-5xl md:text-6xl mb-12
            ${mode === "night" ? "text-white" : "text-blue-900"}
          `}
        >
          🎄 Adventskalender 🎄
        </h1>

        {/* 📱 Responsives Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-6 gap-6 justify-items-center">
          {days.map((day) => (
            <motion.button
              key={day}
              whileHover={{ scale: 1.08, rotate: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setOpenDay(day)}
              className="
                h-24
                w-24
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
              "
            >
              {day}
            </motion.button>
          ))}
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
