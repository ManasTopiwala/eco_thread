import React from 'react'

interface EchoDecLogoProps {
  size?: number
  className?: string
  style?: React.CSSProperties
}

export default function EchoDecLogo({ size = 32, className = '', style = {} }: EchoDecLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'inline-block', flexShrink: 0, ...style }}
    >
      <defs>
        <linearGradient id="logoBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0F172A" />
          <stop offset="100%" stop-color="#1E293B" />
        </linearGradient>
        <linearGradient id="logoEcoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#00D2BA" />
          <stop offset="60%" stop-color="#00B8A9" />
          <stop offset="100%" stop-color="#10B981" />
        </linearGradient>
      </defs>

      {/* Squircle base */}
      <rect width="64" height="64" rx="16" fill="url(#logoBgGrad)" />
      <rect width="62" height="62" x="1" y="1" rx="15" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1.5" />

      {/* Circular Decarbonization Loop */}
      <path
        d="M32 14 C41.94 14 50 22.06 50 32 C50 35.8 48.8 39.3 46.8 42.2"
        stroke="url(#logoEcoGrad)"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M32 50 C22.06 50 14 41.94 14 32 C14 28.2 15.2 24.7 17.2 21.8"
        stroke="url(#logoEcoGrad)"
        strokeWidth="5"
        strokeLinecap="round"
      />

      {/* Arrowheads */}
      <path
        d="M45 44 L48.5 41.5 L44 38.5"
        fill="none"
        stroke="#10B981"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19 20 L15.5 22.5 L20 25.5"
        fill="none"
        stroke="#00D2BA"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Center Core */}
      <circle cx="32" cy="32" r="5" fill="url(#logoEcoGrad)" />
    </svg>
  )
}
