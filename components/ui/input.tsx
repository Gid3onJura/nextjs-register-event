import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, onWheel, ...props }, ref) => {
  const inputRef = React.useRef<HTMLInputElement | null>(null)

  React.useEffect(() => {
    const element = inputRef.current
    if (!element || type !== "number") {
      return
    }

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault()
    }

    element.addEventListener("wheel", handleWheel, { passive: false })
    return () => {
      element.removeEventListener("wheel", handleWheel)
    }
  }, [type])

  const setRefs = React.useCallback(
    (node: HTMLInputElement | null) => {
      inputRef.current = node

      if (typeof ref === "function") {
        ref(node)
      } else if (ref) {
        ;(ref as React.MutableRefObject<HTMLInputElement | null>).current = node
      }
    },
    [ref],
  )

  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={setRefs}
      onWheel={onWheel}
      {...props}
    />
  )
})
Input.displayName = "Input"

export { Input }
