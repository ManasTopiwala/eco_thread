import { useState, useEffect } from 'react'
import { RefreshCw, ShieldCheck, Sparkles } from 'lucide-react'

interface ConnectingLoaderProps {
  title?: string
  subtitle?: string
  steps?: string[]
}

export default function ConnectingLoader({
  title = 'Connecting to EchoDec Engine',
  subtitle = 'Securing your session and synchronizing emission models...',
  steps = [
    'Establishing encrypted TLS handshake...',
    'Verifying credentials with Supabase Auth...',
    'Loading textile emission baselines...',
  ],
}: ConnectingLoaderProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev + 1) % steps.length)
    }, 1200)
    return () => clearInterval(interval)
  }, [steps.length])

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px',
      animation: 'fadeIn 0.25s ease-out',
    }}>
      <div style={{
        background: 'var(--color-surface, #ffffff)',
        borderRadius: '20px',
        padding: '36px 32px',
        maxWidth: '400px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Top ambient glow */}
        <div style={{
          position: 'absolute',
          top: '-40px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '180px',
          height: '100px',
          background: 'radial-gradient(circle, rgba(0, 184, 169, 0.35) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Central animated icon */}
        <div style={{ position: 'relative', width: '72px', height: '72px', margin: '0 auto 20px' }}>
          {/* Pulsing ring */}
          <div style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: 'rgba(0, 184, 169, 0.15)',
            animation: 'ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite',
          }} />
          {/* Rotating outer ring */}
          <div style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '2px dashed var(--color-loop, #00B8A9)',
            animation: 'spin 6s linear infinite',
          }} />
          {/* Inner core */}
          <div style={{
            position: 'absolute',
            inset: '6px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #00B8A9 0%, #0F9D58 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 16px rgba(0, 184, 169, 0.4)',
          }}>
            <RefreshCw size={28} color="#FFFFFF" className="animate-spin" style={{ animationDuration: '2s' }} />
          </div>
        </div>

        {/* Title */}
        <h3 style={{
          fontFamily: 'Plus Jakarta Sans, sans-serif',
          fontSize: '1.2rem',
          fontWeight: 800,
          color: 'var(--color-ink, #1E293B)',
          marginBottom: '6px',
        }}>
          {title}
        </h3>

        {/* Subtitle */}
        <p style={{
          fontSize: '0.85rem',
          color: 'var(--color-text-secondary, #64748B)',
          lineHeight: 1.45,
          marginBottom: '20px',
        }}>
          {subtitle}
        </p>

        {/* Live step indicator */}
        <div style={{
          background: 'rgba(0, 184, 169, 0.08)',
          border: '1px solid rgba(0, 184, 169, 0.2)',
          borderRadius: '10px',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          textAlign: 'left',
        }}>
          <Sparkles size={16} color="var(--color-loop, #00B8A9)" style={{ flexShrink: 0 }} />
          <span style={{
            fontSize: '0.8rem',
            fontWeight: 600,
            color: 'var(--color-loop, #00B8A9)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {steps[currentStepIndex]}
          </span>
        </div>

        {/* Security badge */}
        <div style={{
          marginTop: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          fontSize: '0.75rem',
          color: 'var(--color-text-muted, #94A3B8)',
        }}>
          <ShieldCheck size={14} color="#10B981" />
          <span>256-bit encrypted session</span>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes ping {
          75%, 100% {
            transform: scale(1.4);
            opacity: 0;
          }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
