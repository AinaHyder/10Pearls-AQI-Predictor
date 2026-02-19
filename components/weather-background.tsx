"use client"

import { useEffect, useRef } from "react"

const AnimatedCloud = ({ duration, delay, size, opacity }: { duration: number; delay: number; size: number; opacity: number }) => {
  return (
    <div
      className="absolute opacity-0"
      style={{
        animation: `float-clouds ${duration}s linear infinite`,
        animationDelay: `${delay}s`,
        width: `${size}px`,
        height: `${size * 0.4}px`,
        opacity: opacity,
      }}
    >
      <svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg" fill="white">
        <path d="M50,40 Q50,20 70,20 Q80,10 90,20 Q110,15 120,30 Q130,25 140,35 Q130,50 110,55 Q90,60 70,55 Q50,60 50,40" />
      </svg>
    </div>
  )
}

const Raindrop = ({ duration, delay, left, opacity }: { duration: number; delay: number; left: number; opacity: number }) => {
  return (
    <div
      className="absolute w-1 bg-blue-300"
      style={{
        height: "20px",
        left: `${left}%`,
        animation: `fall-rain ${duration}s linear infinite`,
        animationDelay: `${delay}s`,
        opacity: opacity,
      }}
    />
  )
}

export default function WeatherBackground({ condition }: { condition: string }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Add animation styles
    const style = document.createElement("style")
    style.textContent = `
      @keyframes float-clouds {
        0% {
          transform: translateX(-100%);
        }
        100% {
          transform: translateX(100vw);
        }
      }

      @keyframes fall-rain {
        0% {
          transform: translateY(-100%);
        }
        100% {
          transform: translateY(100vh);
        }
      }

      @keyframes drift {
        0%, 100% {
          transform: translateX(0px);
        }
        50% {
          transform: translateX(30px);
        }
      }

      @keyframes pulse-glow {
        0%, 100% {
          opacity: 0.3;
        }
        50% {
          opacity: 0.8;
        }
      }
    `
    document.head.appendChild(style)

    return () => {
      document.head.removeChild(style)
    }
  }, [])

  const isRainy = condition.toLowerCase().includes("rain") || condition.toLowerCase().includes("drizzle")
  const isSnowy = condition.toLowerCase().includes("snow")

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Dynamic gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-400 via-blue-300 to-blue-500 dark:from-sky-900 dark:via-blue-800 dark:to-blue-900" />

      {/* Additional overlay for different conditions */}
      {isRainy && <div className="absolute inset-0 bg-gradient-to-t from-slate-400/30 to-transparent" />}
      {isSnowy && <div className="absolute inset-0 bg-gradient-to-b from-slate-100/40 to-transparent" />}

      {/* Animated clouds */}
      <div className="absolute top-0 w-full h-1/3 overflow-hidden">
        <AnimatedCloud duration={80} delay={0} size={150} opacity={0.6} />
        <AnimatedCloud duration={100} delay={10} size={200} opacity={0.5} />
        <AnimatedCloud duration={90} delay={20} size={120} opacity={0.55} />
        <AnimatedCloud duration={110} delay={30} size={180} opacity={0.45} />
      </div>

      {/* Middle floating clouds */}
      <div className="absolute top-1/3 w-full h-1/3 overflow-hidden opacity-40">
        <AnimatedCloud duration={70} delay={5} size={130} opacity={0.3} />
        <AnimatedCloud duration={95} delay={15} size={160} opacity={0.35} />
      </div>

      {/* Rain effect */}
      {isRainy && (
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 50 }).map((_, i) => (
            <Raindrop key={i} duration={0.5 + Math.random() * 0.5} delay={Math.random() * 2} left={Math.random() * 100} opacity={0.4 + Math.random() * 0.3} />
          ))}
        </div>
      )}

      {/* Starfield for night */}
      <div className="absolute inset-0 dark:opacity-30 opacity-0">
        {Array.from({ length: 100 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `pulse-glow ${2 + Math.random() * 3}s infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Atmospheric glow */}
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/5 dark:to-black/20" />
    </div>
  )
}
