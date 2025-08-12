"use client"

import { useEffect, useRef } from "react"
import { useIntersectionObserver } from "@/hooks/use-intersection-observer"

export function GlucoseAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [containerRef, isVisible] = useIntersectionObserver<HTMLDivElement>({ once: true })

  useEffect(() => {
    if (!isVisible) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const resizeCanvas = () => {
      const container = canvas.parentElement
      if (container) {
        canvas.width = container.offsetWidth
        canvas.height = container.offsetHeight
      }
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Colors
    const glucoseColor = "#09fbb7"
    const insulinColor = "#006c67"
    const lineColor = "rgba(9, 251, 183, 0.2)"
    const centerRingColor = "rgba(0, 108, 103, 0.3)"

    // Center position
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const centerRadius = 50

    // Particles
    const particles = []
    const numParticles = 40

    // Create particles
    for (let i = 0; i < numParticles; i++) {
      const isInsulin = i < numParticles / 4 // 25% are insulin particles

      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: isInsulin ? 6 + Math.random() * 4 : 3 + Math.random() * 2,
        speedX: (Math.random() - 0.5) * 2,
        speedY: (Math.random() - 0.5) * 2,
        color: isInsulin ? insulinColor : glucoseColor,
        opacity: 0.6 + Math.random() * 0.4,
        isInsulin,
        connectedTo: [],
        distanceToCenter: 0,
        angle: 0,
      })
    }

    // Animation function
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw center ring
      ctx.beginPath()
      ctx.arc(centerX, centerY, centerRadius, 0, Math.PI * 2)
      ctx.fillStyle = centerRingColor
      ctx.fill()

      ctx.beginPath()
      ctx.arc(centerX, centerY, centerRadius, 0, Math.PI * 2)
      ctx.strokeStyle = insulinColor
      ctx.lineWidth = 2
      ctx.stroke()

      // Calculate distances and connections
      particles.forEach((particle) => {
        // Calculate distance to center
        const dx = centerX - particle.x
        const dy = centerY - particle.y
        particle.distanceToCenter = Math.sqrt(dx * dx + dy * dy)
        particle.angle = Math.atan2(dy, dx)

        // Clear previous connections
        particle.connectedTo = []

        // Find connections to other particles
        particles.forEach((other) => {
          if (particle !== other) {
            const dx = particle.x - other.x
            const dy = particle.y - other.y
            const distance = Math.sqrt(dx * dx + dy * dy)

            if (distance < 100) {
              particle.connectedTo.push({
                particle: other,
                distance,
              })
            }
          }
        })
      })

      // Draw connections
      particles.forEach((particle) => {
        // Draw connections to other particles
        particle.connectedTo.forEach((connection) => {
          const opacity = 0.5 * (1 - connection.distance / 100)
          ctx.beginPath()
          ctx.moveTo(particle.x, particle.y)
          ctx.lineTo(connection.particle.x, connection.particle.y)
          ctx.strokeStyle = `rgba(9, 251, 183, ${opacity})`
          ctx.lineWidth = 1
          ctx.stroke()
        })

        // Draw connection to center if close enough
        if (particle.distanceToCenter < 150) {
          const opacity = 0.3 * (1 - particle.distanceToCenter / 150)
          ctx.beginPath()
          ctx.moveTo(particle.x, particle.y)
          ctx.lineTo(centerX, centerY)
          ctx.strokeStyle = `rgba(0, 108, 103, ${opacity})`
          ctx.lineWidth = 1
          ctx.stroke()
        }
      })

      // Draw particles
      particles.forEach((particle) => {
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
        ctx.fillStyle = `${particle.color}${Math.floor(particle.opacity * 255)
          .toString(16)
          .padStart(2, "0")}`
        ctx.fill()

        // Move particles
        particle.x += particle.speedX
        particle.y += particle.speedY

        // Bounce off walls
        if (particle.x < particle.radius || particle.x > canvas.width - particle.radius) {
          particle.speedX *= -1
        }
        if (particle.y < particle.radius || particle.y > canvas.height - particle.radius) {
          particle.speedY *= -1
        }

        // Attraction to center for insulin particles
        if (particle.isInsulin && particle.distanceToCenter > centerRadius) {
          const attractionStrength = 0.02
          particle.speedX += Math.cos(particle.angle) * attractionStrength
          particle.speedY += Math.sin(particle.angle) * attractionStrength

          // Limit speed
          const speed = Math.sqrt(particle.speedX * particle.speedX + particle.speedY * particle.speedY)
          if (speed > 3) {
            particle.speedX = (particle.speedX / speed) * 3
            particle.speedY = (particle.speedY / speed) * 3
          }
        }

        // Interaction between particles
        particles.forEach((other) => {
          if (particle !== other) {
            const dx = particle.x - other.x
            const dy = particle.y - other.y
            const distance = Math.sqrt(dx * dx + dy * dy)

            if (distance < particle.radius + other.radius) {
              // Collision detected
              if (particle.isInsulin && !other.isInsulin) {
                // Insulin slows down glucose
                other.speedX *= 0.9
                other.speedY *= 0.9
              }

              // Simple collision response
              const angle = Math.atan2(dy, dx)
              const sin = Math.sin(angle)
              const cos = Math.cos(angle)

              // Rotate velocities
              const vx1 = particle.speedX * cos + particle.speedY * sin
              const vy1 = particle.speedY * cos - particle.speedX * sin
              const vx2 = other.speedX * cos + other.speedY * sin
              const vy2 = other.speedY * cos - other.speedX * sin

              // Swap velocities
              particle.speedX = vx2 * cos - vy1 * sin
              particle.speedY = vy1 * cos + vx2 * sin
              other.speedX = vx1 * cos - vy2 * sin
              other.speedY = vy2 * cos + vx1 * sin
            }
          }
        })
      })

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [isVisible])

  return (
    <div
      ref={containerRef}
      className={`w-full max-w-4xl mx-auto my-12 overflow-hidden rounded-lg transition-all duration-1000 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="relative w-full h-[300px] bg-[#e6fff9] rounded-lg flex items-center justify-center">
        <canvas ref={canvasRef} className="w-full h-full" style={{ maxWidth: "100%", maxHeight: "100%" }} />
      </div>
    </div>
  )
}
