import { motion } from "framer-motion"

export default function Candle({ day }: { day: number }) {
  return (
    <div className="relative flex flex-col items-center">
      {/* 🔥 innere Flamme */}
      <motion.div
        className="absolute w-3 h-7 bg-white/80 rounded-full blur-[0.5px]"
        style={{
          borderRadius: "50% 50% 50% 50% / 65% 65% 35% 35%",
          boxShadow: "0 0 30px rgba(255, 200, 120, 0.7)",
        }}
        animate={{
          scaleY: [1, 1.25, 0.95, 1],
          scaleX: [0.9, 1, 0.95, 0.9],
          rotate: [-2, 2, -1, 0],
          y: [0, -2, 1, 0],
        }}
        transition={{
          duration: 0.9,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* 🔥 äußere Flamme */}
      <motion.div
        className="relative w-3 h-7 bg-gradient-to-t from-yellow-400 via-orange-400 to-white rounded-full blur-[0.5px]"
        style={{
          borderRadius: "50% 50% 50% 50% / 65% 65% 35% 35%",
          boxShadow: "0 0 30px rgba(255, 200, 120, 0.7)",
        }}
        animate={{
          scaleY: [1, 1.25, 0.95, 1],
          scaleX: [0.9, 1, 0.95, 0.9],
          rotate: [-2, 2, -1, 0],
          y: [0, -2, 1, 0],
        }}
        transition={{
          duration: 0.9,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* 🕯️ Kerzenkörper */}
      <div
        className="
          relative
          w-6 h-10
          rounded-sm
          bg-gradient-to-b from-amber-100 to-amber-300
          flex items-center justify-center
          text-[0.65rem]
          font-semibold
          text-amber-900
          shadow-inner
        "
      >
        {/* Nummer */}
        <span
          className="
            leading-none
            opacity-80
            select-none
            text-lg
          "
        >
          {day}
        </span>
      </div>

      {/* Docht */}
      <div className="w-0.5 h-1 bg-black -mt-10 z-10" />
    </div>
  )
}
