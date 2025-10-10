"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { Copyright as CopyrightIcon } from "lucide-react"

export default function CopyrightComponent() {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      className="fixed top-4 left-4 text-sm cursor-default select-none z-50"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      initial={false}
    >
      <motion.div
        className="flex items-center justify-start bg-secondary text-black rounded-full shadow-md px-1 overflow-hidden"
        animate={{
          backgroundColor: hovered ? "#F54927" : "#4b5563",
          width: hovered ? 180 : 22,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <CopyrightIcon size={16} className="flex-shrink-0" />

        <motion.span
          className="overflow-hidden whitespace-nowrap font-semibold"
          initial={false}
          animate={{
            opacity: hovered ? 1 : 0,
            width: hovered ? "auto" : 0,
            marginLeft: hovered ? 2 : 0,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          made by Gideon {new Date().getFullYear()}
        </motion.span>
      </motion.div>
    </motion.div>
  )
}
