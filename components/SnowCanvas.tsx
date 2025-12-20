"use client"

import { useEffect, useRef } from "react"
import { useScroll, useTransform, motion } from "framer-motion"

type Snowflake = {
  x: number
  y: number
  radius: number
  speed: number
  drift: number
}

export default function SnowCanvas({
  density = 120,
  speedMultiplier = 1,
  opacity = 1,
}: {
  density?: number
  speedMultiplier?: number
  opacity?: number
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const flakes = useRef<Snowflake[]>([])

  const { scrollY } = useScroll()
  const parallaxY = useTransform(scrollY, [0, 1000], [0, 60])

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext("2d")!
    let animationId: number

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resize()
    window.addEventListener("resize", resize)

    flakes.current = Array.from({ length: density }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 3 + 0.5,
      speed: Math.random() * 0.6 + 0.4,
      drift: Math.random() * 1.2 - 0.6,
    }))

    const update = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = `rgba(255,255,255,${opacity})`

      flakes.current.forEach((f) => {
        f.y += f.speed * speedMultiplier
        f.x += f.drift

        if (f.y > canvas.height) {
          f.y = -10
          f.x = Math.random() * canvas.width
        }

        if (f.x > canvas.width) f.x = 0
        if (f.x < 0) f.x = canvas.width

        ctx.beginPath()
        ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2)
        ctx.fill()
      })

      animationId = requestAnimationFrame(update)
    }

    update()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener("resize", resize)
    }
  }, [density, speedMultiplier, opacity])

  return <motion.canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" style={{ y: parallaxY }} />
}
