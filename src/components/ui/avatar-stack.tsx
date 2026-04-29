"use client"

import * as React from "react"

export interface PlayerSlot {
  user_id: string
  prenom: string
  nom: string
  niveau: number
  photo_url: string | null
  initials: string
  hue?: number
}

interface AvatarStackProps {
  players: PlayerSlot[]
  /** Nombre total de places (ex. 4). Slots vides = totalSlots - players.length */
  totalSlots?: number
  size?: number
}

/**
 * AvatarStack — empile les avatars avec chevauchement -10px.
 * Les places vides sont affichées comme des cercles en pointillé.
 * Correspond à AvatarStack du design-reference/screens/shared.jsx
 */
export function AvatarStack({ players, totalSlots = 4, size = 36 }: AvatarStackProps) {
  const emptySlots = Math.max(0, totalSlots - players.length)

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {players.map((p, i) => (
        <PlayerAvatar
          key={p.user_id}
          player={p}
          size={size}
          style={{ marginLeft: i === 0 ? 0 : -10 }}
        />
      ))}
      {Array.from({ length: emptySlots }).map((_, i) => (
        <EmptySlot
          key={`empty-${i}`}
          size={size}
          style={{ marginLeft: players.length === 0 && i === 0 ? 0 : -10 }}
        />
      ))}
    </div>
  )
}

/* ── Sub-components ── */

function PlayerAvatar({
  player,
  size,
  style,
}: {
  player: PlayerSlot
  size: number
  style?: React.CSSProperties
}) {
  const hue = player.hue ?? 220
  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        borderRadius: "50%",
        flexShrink: 0,
        boxShadow: "0 0 0 2px #fff",
        ...style,
      }}
    >
      {player.photo_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={player.photo_url}
          alt={player.prenom}
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            background: `linear-gradient(135deg, oklch(0.62 0.14 ${hue}), oklch(0.42 0.13 ${hue + 30}))`,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 600,
            fontSize: Math.round(size * 0.36),
            letterSpacing: -0.3,
          }}
        >
          {player.initials}
        </div>
      )}
      {/* Badge niveau */}
      <span
        style={{
          position: "absolute",
          bottom: -2,
          left: "50%",
          transform: "translateX(-50%)",
          background: "#000",
          color: "#fff",
          borderRadius: 999,
          fontSize: 9,
          fontWeight: 600,
          padding: "1px 5px",
          border: "1.5px solid #fff",
          whiteSpace: "nowrap",
          lineHeight: 1.4,
        }}
      >
        {player.niveau}
      </span>
    </div>
  )
}

function EmptySlot({ size, style }: { size: number; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        border: "1.5px dashed #B5B5BA",
        background: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#8E8E93",
        fontSize: Math.round(size * 0.45),
        fontWeight: 300,
        flexShrink: 0,
        ...style,
      }}
    >
      +
    </div>
  )
}
