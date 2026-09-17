'use client'

import { useEffect, useRef } from 'react'

/**
 * Subtle 3D constellation background for the hub hero.
 * Hand-rolled Canvas 2D pinhole projection — no WebGL, no deps.
 * Brand palette only: off-white stars (#e8e6e0) + faint accent links (#44579c).
 * Honours prefers-reduced-motion (renders a single static frame, no loop).
 */
export function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isMobile = window.innerWidth < 768

    const CONFIG = {
      starCount: isMobile ? 800 : 1400,
      viewRadius: 2400, // sphere radius stars live within (wide, deep field)
      focalLength: 820,
      minSize: 0.3,
      maxSize: 1.9,
      autoYawSpeed: 0.00045, // continuous orbit around the cloud
      vertOrbit: 0.14, // vertical bob, as a fraction of viewRadius
      pitchSpeed: 0.00018,
      star: { r: 232, g: 230, b: 224 }, // #e8e6e0
    }

    let width = 0
    let height = 0
    let centerX = 0
    let centerY = 0
    let dpr = Math.min(window.devicePixelRatio || 1, 2)

    // Camera orientation. Baseline = auto spin/tumble.
    let camYaw = 0
    let camPitch = 0
    let autoYaw = 0
    let time = 0
    const orbitR = CONFIG.viewRadius * 1.1
    const orbitVertAmp = CONFIG.viewRadius * CONFIG.vertOrbit
    const camPos = { x: 0, y: 0, z: -orbitR }

    interface Star {
      x: number
      y: number
      z: number
      size: number
      alpha: number
      sx: number
      sy: number
      scale: number
      viewZ: number
      visible: boolean
      color: { r: number, g: number, b: number }
    }

    const TOKYO_COLORS = [
      { r: 125, g: 207, b: 255 }, // Cyan #7dcfff
      { r: 187, g: 154, b: 247 }, // Purple #bb9af7
      { r: 247, g: 118, b: 142 }, // Magenta #f7768e
      { r: 224, g: 175, b: 104 }  // Yellow/Orange #e0af68
    ]

    let stars: Star[] = []
    let order: number[] = []
    let raf = 0

    const rand = (a: number, b: number) => a + Math.random() * (b - a)

    function makeStar(): Star {
      // Uniformly distribute inside a sphere
      let x, y, z
      do {
        x = rand(-1, 1)
        y = rand(-1, 1)
        z = rand(-1, 1)
      } while (x * x + y * y + z * z > 1)
      const r = CONFIG.viewRadius
      const depthBias = Math.random() // more small distant stars
      // ~12% are bright foreground stars — bigger + fuller alpha so they read as close
      const foreground = Math.random() < 0.12
      const size = foreground
        ? rand(CONFIG.maxSize, CONFIG.maxSize * 1.9)
        : rand(CONFIG.minSize, CONFIG.maxSize) * (0.5 + depthBias * 0.5)
      return {
        x: x * r,
        y: y * r,
        z: z * r,
        size,
        alpha: foreground ? rand(0.85, 1) : rand(0.3, 0.85),
        sx: 0,
        sy: 0,
        scale: 0,
        viewZ: 0,
        visible: false,
        color: TOKYO_COLORS[Math.floor(Math.random() * TOKYO_COLORS.length)],
      }
    }

    function resize() {
      const rect = canvas!.getBoundingClientRect()
      width = rect.width
      height = rect.height
      centerX = width / 2
      centerY = height / 2
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas!.width = Math.round(width * dpr)
      canvas!.height = Math.round(height * dpr)
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    function project(s: Star) {
      const dx = s.x - camPos.x
      const dy = s.y - camPos.y
      const dz = s.z - camPos.z

      const cosY = Math.cos(-camYaw)
      const sinY = Math.sin(-camYaw)
      const x1 = dx * cosY - dz * sinY
      const z1 = dx * sinY + dz * cosY

      const cosP = Math.cos(-camPitch)
      const sinP = Math.sin(-camPitch)
      const y2 = dy * cosP - z1 * sinP
      const z2 = dy * sinP + z1 * cosP

      if (z2 < 20) {
        s.visible = false
        return
      }
      const scale = CONFIG.focalLength / z2
      s.sx = centerX + x1 * scale
      s.sy = centerY - y2 * scale
      s.scale = scale
      s.viewZ = z2
      s.visible =
        s.sx > -50 && s.sx < width + 50 && s.sy > -50 && s.sy < height + 50
    }

    function draw() {
      ctx!.clearRect(0, 0, width, height)

      for (let i = 0; i < stars.length; i++) project(stars[i])

      // Painter's order: far → near
      order.sort((a, b) => stars[b].viewZ - stars[a].viewZ)

      // Stars (flat cores, no heavy glow — brand restraint)
      for (let k = 0; k < order.length; k++) {
        const s = stars[order[k]]
        if (!s.visible) continue
        const { r: sr, g: sg, b: sb } = s.color
        const radius = Math.max(0.4, s.size * s.scale)
        // Closer stars (higher scale) read brighter for depth
        const alpha = Math.min(1, s.alpha * (0.45 + Math.min(1.4, s.scale) * 0.55))
        ctx!.fillStyle = `rgba(${sr},${sg},${sb},${alpha})`
        ctx!.beginPath()
        ctx!.arc(s.sx, s.sy, radius, 0, Math.PI * 2)
        ctx!.fill()
        // Faint halo on the nearest/brightest stars — adds a sense of proximity
        if (radius > 3.2) {
          ctx!.fillStyle = `rgba(${sr},${sg},${sb},${alpha * 0.14})`
          ctx!.beginPath()
          ctx!.arc(s.sx, s.sy, radius * 2.4, 0, Math.PI * 2)
          ctx!.fill()
        }
      }
    }

    function frame() {
      time++
      autoYaw += CONFIG.autoYawSpeed

      // Orbit the camera *around* the cloud (position moves, not just angle) so
      // nearer stars parallax past farther ones — that's the depth cue.
      camPos.x = Math.sin(autoYaw) * orbitR
      camPos.z = -Math.cos(autoYaw) * orbitR
      camPos.y = Math.sin(time * CONFIG.pitchSpeed) * orbitVertAmp

      // Always aim back at the field centre
      camYaw = autoYaw
      camPitch = Math.atan2(camPos.y, orbitR)
      draw()
      raf = requestAnimationFrame(frame)
    }

    // Init
    resize()
    stars = Array.from({ length: CONFIG.starCount }, makeStar)
    order = stars.map((_, i) => i)

    if (reduceMotion) {
      draw() // single static frame
      const onResize = () => {
        resize()
        draw()
      }
      window.addEventListener('resize', onResize)
      return () => window.removeEventListener('resize', onResize)
    }

    window.addEventListener('resize', resize)
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="hub-starfield" aria-hidden="true" />
}
