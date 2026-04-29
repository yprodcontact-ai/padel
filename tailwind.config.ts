import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // ── Tokens design handoff v2 ──
        bg:          "var(--bg)",
        ink:         "var(--ink)",
        "ink-2":     "var(--ink-2)",
        muted:       "var(--muted)",
        "muted-2":   "var(--muted-2)",
        divider:     "var(--divider)",
        "stroke-soft": "var(--stroke-soft)",
        accent:      "var(--accent)",

        // ── Mapping shadcn ──
        border:      "var(--border)",
        input:       "var(--input)",
        ring:        "var(--ring)",
        background:  "var(--background)",
        foreground:  "var(--foreground)",
        primary: {
          DEFAULT:    "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT:    "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT:    "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        card: {
          DEFAULT:    "var(--card)",
          foreground: "var(--card-foreground)",
          border:     "var(--card-border)",
        },
        popover: {
          DEFAULT:    "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
      },
      borderRadius: {
        // ── Radius design handoff v2 ──
        card:  "var(--radius-card)",   // 28px
        pill:  "var(--radius-pill)",   // 999px
        tile:  "var(--radius-tile)",   // 14px
        chip:  "var(--radius-chip)",   // 6px

        // ── Valeurs legacy shadcn (conservées) ──
        lg: "var(--radius-card)",
        md: "calc(var(--radius-card) - 4px)",
        sm: "calc(var(--radius-card) - 8px)",
      },
      spacing: {
        // ── Spacing design handoff v2 ──
        "screen-x":      "22px",
        "screen-top":    "64px",
        "screen-bottom": "130px",
        "card-gap":      "14px",
      },
      boxShadow: {
        cta: "0 12px 30px rgba(0,0,0,0.12)",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "SF Pro Text",
          "system-ui",
          "sans-serif",
        ],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
