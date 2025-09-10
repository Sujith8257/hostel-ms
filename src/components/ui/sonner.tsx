import { Toaster as Sonner } from "sonner"
import { useTheme } from "@/contexts/ThemeContext"
import type { ComponentProps } from "react"

const Toaster = ({ ...props }: ComponentProps<typeof Sonner>) => {
  const { actualTheme } = useTheme()

  return (
    <Sonner 
      theme={actualTheme}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
