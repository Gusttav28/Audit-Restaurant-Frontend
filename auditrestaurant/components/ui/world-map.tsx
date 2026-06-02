"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import DottedMap from "dotted-map"
import { motion } from "motion/react"
import { useTheme } from "next-themes"

interface MapProps {
  dots?: Array<{
    start: { lat: number; lng: number; label?: string }
    end: { lat: number; lng: number; label?: string }
  }>
  lineColor?: string
  className?: string
}

export default function WorldMap({ dots = [], lineColor = "#0f6cb4", className = "" }: MapProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme, theme } = useTheme()
  const isDark = !mounted || (resolvedTheme ?? theme) === "dark"

  useEffect(() => {
    setMounted(true)
  }, [])

  const svgMap = useMemo(() => {
    const map = new DottedMap({ height: 100, grid: "diagonal" })

    return map.getSVG({
      radius: 0.22,
      color: isDark ? "#f8fafc45" : "#0f172a35",
      shape: "circle",
      backgroundColor: "transparent",
    })
  }, [isDark])

  const projectPoint = (lat: number, lng: number) => {
    const x = (lng + 180) * (800 / 360)
    const y = (90 - lat) * (400 / 180)
    return { x, y }
  }

  const createCurvedPath = (start: { x: number; y: number }, end: { x: number; y: number }) => {
    const midX = (start.x + end.x) / 2
    const midY = Math.min(start.y, end.y) - 50
    return `M ${start.x} ${start.y} Q ${midX} ${midY} ${end.x} ${end.y}`
  }

  return (
    <div className={`relative aspect-[2/1] w-full overflow-hidden rounded-lg bg-transparent font-sans ${className}`}>
      <img
        src={`data:image/svg+xml;utf8,${encodeURIComponent(svgMap)}`}
        className="h-full w-full select-none opacity-95 [mask-image:linear-gradient(to_bottom,transparent,white_8%,white_92%,transparent)]"
        alt="world map"
        height="495"
        width="1056"
        draggable={false}
      />
      <svg ref={svgRef} viewBox="0 0 800 400" className="pointer-events-none absolute inset-0 h-full w-full select-none">
        {dots.map((dot, index) => {
          const startPoint = projectPoint(dot.start.lat, dot.start.lng)
          const endPoint = projectPoint(dot.end.lat, dot.end.lng)

          return (
            <g key={`path-group-${index}`}>
              <motion.path
                d={createCurvedPath(startPoint, endPoint)}
                fill="none"
                stroke="url(#path-gradient)"
                strokeWidth="1.5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{
                  duration: 1.1,
                  delay: 0.3 * index,
                  ease: "easeOut",
                }}
              />
            </g>
          )
        })}

        <defs>
          <linearGradient id="path-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={lineColor} stopOpacity="0" />
            <stop offset="8%" stopColor={lineColor} stopOpacity="1" />
            <stop offset="92%" stopColor={lineColor} stopOpacity="1" />
            <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
          </linearGradient>
        </defs>

        {dots.map((dot, index) => (
          <g key={`points-group-${index}`}>
            {[dot.start, dot.end].map((point, pointIndex) => {
              const projected = projectPoint(point.lat, point.lng)

              return (
                <g key={`${index}-${pointIndex}`}>
                  <circle cx={projected.x} cy={projected.y} r="2.5" fill={lineColor} />
                  <circle cx={projected.x} cy={projected.y} r="2.5" fill={lineColor} opacity="0.45">
                    <animate attributeName="r" from="2.5" to="10" dur="1.7s" begin="0s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from="0.45" to="0" dur="1.7s" begin="0s" repeatCount="indefinite" />
                  </circle>
                </g>
              )
            })}
          </g>
        ))}
      </svg>
    </div>
  )
}
