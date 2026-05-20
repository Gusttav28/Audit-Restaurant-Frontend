"use client"

import { motion } from "motion/react"
import type { ReactNode } from "react"

type TextBlurFadeInProps = {
  text: string
  as?: "h1" | "p"
  className?: string
  delay?: number
  stagger?: number
}

export function TextBlurFadeIn({
  text,
  as: Component = "p",
  className,
  delay = 0,
  stagger = 0.014,
}: TextBlurFadeInProps) {
  const words = text.split(" ")
  const content = words.map((word, index) => (
    <motion.span
      key={`${word}-${index}`}
      aria-hidden="true"
      className="inline-block"
      initial={{ opacity: 0, filter: "blur(6px)", y: 6 }}
      whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{
        duration: 0.28,
        ease: "easeOut",
        delay: delay + index * stagger,
      }}
    >
      {word}
      {index < words.length - 1 ? "\u00A0" : ""}
    </motion.span>
  ))

  if (Component === "h1") {
    return (
      <h1 className={className} aria-label={text}>
        {content}
      </h1>
    )
  }

  return (
    <p className={className} aria-label={text}>
      {content}
    </p>
  )
}

export function BlurFadeIn({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, filter: "blur(6px)", y: 8 }}
      whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.32, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  )
}
