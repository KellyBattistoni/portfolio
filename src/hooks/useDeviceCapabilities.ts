import { useState, useEffect } from 'react'

/**
 * Reactive device capability detection — the animation kill-switch.
 *
 * All future animation code must consult this hook before running:
 *  - Respect OS-level reduced-motion preference (WCAG 2.3.3)
 *  - Downgrade gracefully on small viewports and low-end hardware
 *  - Avoid WebGL2-dependent paths when the context is unavailable
 *
 * `prefersReducedMotion` and `isMobile` are reactive (listen for OS / viewport
 * changes). `isLowEnd` and `supportsWebGL2` are sampled once on mount — they do
 * not change at runtime.
 */
export interface DeviceCapabilities {
  prefersReducedMotion: boolean
  isMobile: boolean
  isLowEnd: boolean
  supportsWebGL2: boolean
}

/**
 * Chromium-only `navigator.deviceMemory` extension. Firefox and Safari do not
 * implement this property — always guard reads with `typeof !== 'undefined'`.
 */
type NavigatorWithDeviceMemory = Navigator & { deviceMemory?: number }

const MOBILE_BREAKPOINT_PX = 1080
const LOW_END_CORE_THRESHOLD = 4
const LOW_END_MEMORY_THRESHOLD_GB = 4
const RESIZE_DEBOUNCE_MS = 16 // ~1 rAF frame at 60 Hz

const DEFAULT_CAPABILITIES: DeviceCapabilities = {
  prefersReducedMotion: false,
  isMobile: false,
  isLowEnd: false,
  supportsWebGL2: false,
}

function getInitialCapabilities(): DeviceCapabilities {
  // SSR / non-browser environment — return safe defaults.
  if (typeof window === 'undefined') {
    return DEFAULT_CAPABILITIES
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const isMobile = window.innerWidth <= MOBILE_BREAKPOINT_PX

  // isLowEnd: hardwareConcurrency primary (all modern browsers),
  // deviceMemory secondary (Chromium only — must be undefined-guarded).
  const lowByCores =
    typeof navigator.hardwareConcurrency !== 'undefined'
      ? navigator.hardwareConcurrency <= LOW_END_CORE_THRESHOLD
      : false

  const nav = navigator as NavigatorWithDeviceMemory
  const lowByMemory =
    typeof nav.deviceMemory !== 'undefined' ? nav.deviceMemory < LOW_END_MEMORY_THRESHOLD_GB : false

  const isLowEnd = lowByCores || lowByMemory

  // supportsWebGL2: probe an offscreen canvas, discard immediately.
  let supportsWebGL2: boolean
  try {
    const canvas = document.createElement('canvas')
    supportsWebGL2 = !!canvas.getContext('webgl2')
  } catch {
    supportsWebGL2 = false
  }

  return { prefersReducedMotion, isMobile, isLowEnd, supportsWebGL2 }
}

export function useDeviceCapabilities(): DeviceCapabilities {
  // Compute synchronously so the first render reflects real capabilities
  // (no flash of wrong state).
  const [capabilities, setCapabilities] = useState<DeviceCapabilities>(getInitialCapabilities)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // 1. Reactive: prefers-reduced-motion (WCAG — must update without reload)
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleMotionChange = (e: MediaQueryListEvent) => {
      setCapabilities((prev) => ({ ...prev, prefersReducedMotion: e.matches }))
    }
    mql.addEventListener('change', handleMotionChange)

    // 2. Reactive: isMobile — debounced to one rAF frame to coalesce resize bursts.
    let resizeTimer: ReturnType<typeof setTimeout> | undefined
    const handleResize = () => {
      if (resizeTimer !== undefined) clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        setCapabilities((prev) => {
          const next = window.innerWidth <= MOBILE_BREAKPOINT_PX
          if (prev.isMobile === next) return prev
          return { ...prev, isMobile: next }
        })
      }, RESIZE_DEBOUNCE_MS)
    }
    window.addEventListener('resize', handleResize, { passive: true })

    return () => {
      mql.removeEventListener('change', handleMotionChange)
      window.removeEventListener('resize', handleResize)
      if (resizeTimer !== undefined) clearTimeout(resizeTimer)
    }
  }, [])

  return capabilities
}
