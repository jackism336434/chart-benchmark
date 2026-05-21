import { useRef, useCallback } from 'react'

export function useFPSTracker() {
  const framesRef = useRef<number[]>([])
  const rafRef = useRef<number>(0)
  const activeRef = useRef(false)

  const start = useCallback(() => {
    if (activeRef.current) return
    activeRef.current = true
    framesRef.current = []

    const tick = () => {
      framesRef.current.push(performance.now())
      if (framesRef.current.length > 300) {
        framesRef.current = framesRef.current.slice(-300)
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [])

  const stop = useCallback(() => {
    activeRef.current = false
    cancelAnimationFrame(rafRef.current)
  }, [])

  const getMetrics = useCallback(() => {
    const frames = framesRef.current
    if (frames.length < 2) return { avgFPS: null, minFPS: null, fpsSamples: [] as number[] }

    const fpsSamples: number[] = []
    for (let i = 1; i < frames.length; i++) {
      const delta = frames[i] - frames[i - 1]
      if (delta > 0) fpsSamples.push(1000 / delta)
    }

    if (fpsSamples.length === 0) return { avgFPS: null, minFPS: null, fpsSamples: [] as number[] }

    const avg = fpsSamples.reduce((a, b) => a + b, 0) / fpsSamples.length
    const min = Math.min(...fpsSamples.filter((f) => f > 0))

    return { avgFPS: Math.round(avg), minFPS: Math.round(min), fpsSamples }
  }, [])

  return { start, stop, getMetrics }
}