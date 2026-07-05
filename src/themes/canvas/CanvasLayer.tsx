import { useEffect, useRef } from 'react'
import type { ThemeCanvasEffect } from './types'

interface CanvasLayerProps {
  effect: ThemeCanvasEffect
}

export function CanvasLayer({ effect }: CanvasLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const el = canvasRef.current
    if (!el) return

    const cx = el.getContext('2d')
    if (!cx) return

    let rafId: number
    let cleanup: (() => void) | void

    function resize() {
      const dpr = window.devicePixelRatio || 1
      const w = window.innerWidth
      const h = window.innerHeight
      el!.width = w * dpr
      el!.height = h * dpr
      cx!.scale(dpr, dpr)
      effect.resize?.(cx!, w, h)
    }

    cleanup = effect.setup?.(cx, el)
    resize()

    function frame(time: number) {
      effect.draw(cx!, time, el!)
      rafId = requestAnimationFrame(frame)
    }
    rafId = requestAnimationFrame(frame)

    function onResize() {
      resize()
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', onResize)
      if (cleanup) cleanup()
    }
  }, [effect])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  )
}
