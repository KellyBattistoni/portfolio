/**
 * Plasma — pure OGL background component.
 *
 * Responsibilities (and ONLY these):
 *   • Mount a WebGL2 canvas filling its parent container.
 *   • Run the verbatim-ported Plasma fragment shader.
 *   • Clean up the WebGL context correctly on unmount (StrictMode-hard).
 *
 * EXPLICITLY NOT this component's job:
 *   • Reading device capabilities (gated by HeroBackdrop in plan 04-02).
 *   • Scroll-driven mount/unmount logic (HeroBackdrop's job).
 *   • Error boundaries or fallback rendering.
 *
 * Cleanup order (DO NOT REORDER — see RESEARCH §Pitfall 1):
 *   1. cancelAnimationFrame   — stop the loop before freeing GL.
 *   2. ResizeObserver.disconnect
 *   3. removeEventListener('mousemove')
 *   4. WEBGL_lose_context.loseContext()  — release GPU memory.
 *   5. canvas.width = 0; canvas.height = 0  — iOS Safari texture release.
 *   6. container.removeChild(canvas)  — wrapped in try/catch.
 */

import { useEffect, useRef } from 'react'
import { Mesh, Program, Renderer, Triangle } from 'ogl'

import { fragment, vertex } from './Plasma.shaders'

export interface PlasmaProps {
  /** Hex color tinting the plasma. Default '#FF4500' (brand accent). */
  color?: string
  /** Animation speed multiplier. Default 0.35 (slow + meditative). */
  speed?: number
  /**
   * Temporal flow direction. Locked to `'forward'` — pingpong/reverse
   * branches removed from the inspo port (dead code in a hot rAF loop).
   */
  direction?: 'forward'
  /** Pattern zoom level. Default 1.1. */
  scale?: number
  /** Global output transparency. Default 0.85. */
  opacity?: number
  /**
   * If true, listens for mousemove on the container (NOT window) and
   * forwards the position into the shader's `uMouse` uniform. Caller is
   * responsible for passing `!isMobile`.
   */
  mouseInteractive?: boolean
}

/** Port verbatim from inspo.txt /src/Component.tsx. */
const hexToRgb = (hex: string): [number, number, number] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return [1, 0.5, 0.2]
  return [
    parseInt(result[1], 16) / 255,
    parseInt(result[2], 16) / 255,
    parseInt(result[3], 16) / 255,
  ]
}

export function Plasma({
  color = '#FF4500',
  speed = 0.35,
  direction = 'forward',
  scale = 1.1,
  opacity = 0.85,
  mouseInteractive = true,
}: PlasmaProps) {
  // `direction` is declared so the dependency array can include it; the
  // shader uniform is a literal 1.0 because the type is locked to 'forward'.
  void direction

  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // --- Renderer (matches inspo: webgl2, alpha, no MSAA, DPR cap ≤ 2) ---
    const renderer = new Renderer({
      webgl: 2,
      alpha: true,
      antialias: false,
      dpr: Math.min(window.devicePixelRatio || 1, 2),
    })
    const gl = renderer.gl
    const canvas = gl.canvas as HTMLCanvasElement
    canvas.style.display = 'block'
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    container.appendChild(canvas)

    // --- Program ---
    const geometry = new Triangle(gl)
    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new Float32Array([1, 1]) },
        uCustomColor: { value: new Float32Array(hexToRgb(color)) },
        uUseCustomColor: { value: 1.0 },
        // inspo trick: maps slider [0..1] into actual shader speed range.
        uSpeed: { value: speed * 0.4 },
        // Locked 'forward' — no reverse/pingpong.
        uDirection: { value: 1.0 },
        uScale: { value: scale },
        uOpacity: { value: opacity },
        uMouse: { value: new Float32Array([0, 0]) },
        uMouseInteractive: { value: mouseInteractive ? 1.0 : 0.0 },
      },
    })
    const mesh = new Mesh(gl, { geometry, program })

    // --- ResizeObserver: write into iResolution Float32Array in place ---
    const setSize = () => {
      const rect = container.getBoundingClientRect()
      const w = Math.max(1, Math.floor(rect.width))
      const h = Math.max(1, Math.floor(rect.height))
      renderer.setSize(w, h)
      const res = program.uniforms.iResolution.value as Float32Array
      res[0] = gl.drawingBufferWidth
      res[1] = gl.drawingBufferHeight
    }
    const ro = new ResizeObserver(setSize)
    ro.observe(container)
    setSize()

    // --- Document-level mousemove with container bounds check ---
    // The canvas lives on a GPU compositor layer and is excluded from Chrome's
    // DOM hit-test tree, so mousemove never reaches the container directly.
    // Listening on document and filtering by getBoundingClientRect() preserves
    // the "only active over the canvas area" contract from CONTEXT.md.
    let handleMouseMove: ((e: MouseEvent) => void) | null = null
    if (mouseInteractive) {
      handleMouseMove = (e: MouseEvent) => {
        const rect = container.getBoundingClientRect()
        if (
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom
        ) {
          const u = program.uniforms.uMouse.value as Float32Array
          u[0] = e.clientX - rect.left
          u[1] = e.clientY - rect.top
        }
      }
      document.addEventListener('mousemove', handleMouseMove, { passive: true })
    }

    // --- rAF loop ---
    let raf = 0
    const t0 = performance.now()
    const loop = (t: number) => {
      ;(program.uniforms.iTime as { value: number }).value = (t - t0) * 0.001
      renderer.render({ scene: mesh })
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    // --- StrictMode-hard cleanup — order is load-bearing ---
    return () => {
      // 1. Stop the loop FIRST so the next paint can't read freed GL.
      cancelAnimationFrame(raf)

      // 2. Stop ResizeObserver.
      ro.disconnect()

      // 3. Remove the mouse listener (null-guard — listener may never have
      //    been attached if mouseInteractive was false).
      if (handleMouseMove) {
        document.removeEventListener('mousemove', handleMouseMove)
      }

      // 4. Release the GL context BEFORE detaching the canvas. Optional
      //    chaining: not all browsers expose the extension.
      const loseExt = gl.getExtension('WEBGL_lose_context')
      loseExt?.loseContext()

      // 5. Force iOS Safari to release the backing-store texture memory.
      //    Without this, repeated mount/unmount cycles crash mobile tabs.
      canvas.width = 0
      canvas.height = 0

      // 6. Detach from DOM (wrapped — StrictMode may have already detached).
      try {
        if (canvas.parentNode === container) {
          container.removeChild(canvas)
        }
      } catch (err) {
        console.warn('[Plasma] cleanup: canvas removal failed:', err)
      }
    }
  }, [color, speed, direction, scale, opacity, mouseInteractive])

  return (
    <div
      ref={containerRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      aria-hidden="true"
    />
  )
}
