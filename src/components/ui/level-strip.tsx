"use client"

import * as React from "react"

/** Toutes les valeurs de niveau possibles (1 → 8 par paliers de 0,5) */
export const LEVEL_VALUES = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8] as const
export type LevelValue = (typeof LEVEL_VALUES)[number]

interface LevelStripProps {
  /** Niveau exact du joueur — chip noir plein */
  playerLevel?: number
  /** Niveau minimum accepté — définit le début de la plage active */
  minLevel?: number
  /** Niveau maximum accepté — définit la fin de la plage active */
  maxLevel?: number
  /** Taille des chips */
  chipSize?: number
  /** Gap entre chips */
  gap?: number
}

/**
 * LevelStrip — bande horizontale de 15 chips de niveau (1 → 8 par 0,5).
 *
 * Logique de coloration (design-reference/screens/find.jsx) :
 *   - Chip = playerLevel  → fond noir (#000), texte blanc
 *   - Chip dans [minLevel, maxLevel] → fond blanc, border noire 1.5px
 *   - Autres → fond gris (#F2F2F2), border #D8D8DC
 */
export function LevelStrip({
  playerLevel,
  minLevel,
  maxLevel,
  chipSize = 34,
  gap = 6,
}: LevelStripProps) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "nowrap",
        width: "100%",
        gap,
        overflow: "hidden",
      }}
    >
      {LEVEL_VALUES.map((level) => {
        const isPlayer = playerLevel !== undefined && level === playerLevel
        const inRange =
          minLevel !== undefined &&
          maxLevel !== undefined &&
          level >= minLevel &&
          level <= maxLevel

        let bg = "#F2F2F2"
        let border = "1px solid #D8D8DC"
        let color = "#8E8E93"

        if (isPlayer) {
          bg = "#000"
          border = "none"
          color = "#fff"
        } else if (inRange) {
          bg = "#fff"
          border = "1.5px solid #000"
          color = "#000"
        }

        // Affichage : entier ou 1 décimale
        const label = Number.isInteger(level) ? `${level}` : `${level}`
        const isDecimal = !Number.isInteger(level)

        return (
          <div
            key={level}
            title={`Niveau ${level}`}
            style={{
              flex: 1,
              minWidth: 0,
              height: chipSize,
              borderRadius: "var(--radius-chip, 6px)",
              background: bg,
              border,
              color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: isPlayer ? 700 : inRange ? 600 : 400,
              fontSize: isDecimal ? 10 : 12,
              letterSpacing: -0.2,
              transition: "background 0.15s, border 0.15s, color 0.15s",
            }}
          >
            {label}
          </div>
        )
      })}
    </div>
  )
}
