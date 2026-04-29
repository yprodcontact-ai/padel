import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Pill — pastille arrondie radius 999
 *
 * Variants :
 *   - light (défaut) : fond blanc, border --card-border, texte noir
 *   - dark : fond noir, texte blanc, pas de border
 *
 * Tailles :
 *   - default : padding 10px 18px, fontSize 16
 *   - sm      : padding 7px 14px,  fontSize 14
 *   - lg      : padding 14px 22px, fontSize 22 (CTA flottant)
 */

type PillVariant = "light" | "dark"
type PillSize    = "sm" | "default" | "lg"

interface PillProps extends React.ComponentProps<"div"> {
  variant?: PillVariant
  size?: PillSize
  icon?: React.ReactNode
  /** Render as a button (adds role + cursor) */
  asButton?: boolean
}

const variantStyles: Record<PillVariant, React.CSSProperties> = {
  light: {
    background: "var(--card)",
    color: "var(--ink)",
    border: "1px solid var(--card-border)",
  },
  dark: {
    background: "var(--ink)",
    color: "#fff",
    border: "none",
  },
}

const sizeStyles: Record<PillSize, React.CSSProperties> = {
  sm:      { padding: "7px 14px",  fontSize: 14, fontWeight: 500 },
  default: { padding: "10px 18px", fontSize: 16, fontWeight: 500 },
  lg:      { padding: "14px 22px", fontSize: 22, fontWeight: 500 },
}

export function Pill({
  variant = "light",
  size = "default",
  icon,
  asButton = false,
  className,
  children,
  style,
  ...props
}: PillProps) {
  return (
    <div
      role={asButton ? "button" : undefined}
      className={cn("inline-flex items-center select-none", className)}
      style={{
        gap: 8,
        borderRadius: "var(--radius-pill)",
        letterSpacing: -0.3,
        fontFamily: "var(--font-family-sans)",
        cursor: asButton ? "pointer" : undefined,
        ...variantStyles[variant],
        ...sizeStyles[size],
        ...style,
      }}
      {...props}
    >
      {children}
      {icon}
    </div>
  )
}
