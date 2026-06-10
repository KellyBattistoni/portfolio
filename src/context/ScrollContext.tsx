/**
 * ScrollContext — single-source scroll backbone for every animated component.
 *
 * Architecture:
 *   - Scroll values (`y`, `progress`) live in module-level mutable variables,
 *     NOT React state. Setting state on every scroll tick (60fps) would
 *     trigger React reconciliation cascades across every Context consumer.
 *   - A single passive scroll listener is mounted by ScrollProvider.
 *     Burst scroll events are coalesced via requestAnimationFrame to a
 *     single update per frame.
 *   - Consumers subscribe via a pub/sub external store (scrollStore).
 *     GSAP-driven components read the ref directly via `getRef()` from
 *     inside the GSAP ticker — zero React subscription overhead.
 *   - React components that genuinely need to re-render on scroll
 *     (PillNav visibility threshold, Plasma unmount) pair `scrollStore`
 *     with `useSyncExternalStore` and a coarse snapshot selector.
 *
 * Why zero useState: at 60fps with N context consumers, useState-based
 * scroll storage produces ~N × 60 React reconciliation cycles per second.
 * The ref-store + subscriber pattern removes scroll from React's render
 * path entirely.
 *
 * Source: react.dev/reference/react/useSyncExternalStore + GSAP ticker docs.
 */

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from 'react'

/**
 * Snapshot shape consumed by useSyncExternalStore selectors and by
 * GSAP ticker callbacks reading via `scrollStore.getRef()`.
 */
export interface ScrollSnapshot {
  /** Current vertical scroll position in pixels (window.scrollY). */
  y: number
  /**
   * Scroll progress through the document, clamped to [0, 1].
   * 0 = at top, 1 = at bottom. Returns 0 when the document is not
   * scrollable.
   */
  progress: number
}

// -----------------------------------------------------------------------------
// Module-level mutable state — intentionally NOT React state.
// -----------------------------------------------------------------------------

let scrollY = 0
let scrollProgress = 0
const listeners = new Set<() => void>()

// Snapshot object reused across reads. useSyncExternalStore requires
// referential stability when nothing changed — emitting a new object on
// every getSnapshot() call would cause "getSnapshot should be cached"
// warnings and unnecessary re-renders. We mutate this same object in-place
// after each rAF tick.
let snapshot: ScrollSnapshot = { y: 0, progress: 0 }

/**
 * Compute scroll progress as a [0, 1] ratio.
 * Reads documentElement scrollHeight / clientHeight on every call —
 * intentional, because content height can change (font load, image load,
 * route change). Guards against division by zero on non-scrollable pages.
 */
function computeProgress(): number {
  const doc = document.documentElement
  const scrollable = doc.scrollHeight - doc.clientHeight
  if (scrollable <= 0) return 0
  const ratio = scrollY / scrollable
  // Clamp to [0, 1] — overscroll bounce can push window.scrollY past max.
  if (ratio < 0) return 0
  if (ratio > 1) return 1
  return ratio
}

// -----------------------------------------------------------------------------
// External store — pub/sub interface consumed by useSyncExternalStore and
// by GSAP-driven components reading directly via getRef().
// -----------------------------------------------------------------------------

interface ScrollStore {
  /** Subscribe to scroll updates. Returns an unsubscribe function. */
  subscribe: (callback: () => void) => () => void
  /** Cached snapshot — safe for useSyncExternalStore. */
  getSnapshot: () => ScrollSnapshot
  /**
   * Direct ref read — same shape as getSnapshot but intended for the
   * GSAP ticker / animation hot path. Identical semantics today; kept
   * as a distinct API so consumer intent is explicit.
   */
  getRef: () => ScrollSnapshot
}

export const scrollStore: ScrollStore = {
  subscribe(callback: () => void): () => void {
    listeners.add(callback)
    return () => {
      listeners.delete(callback)
    }
  },
  getSnapshot(): ScrollSnapshot {
    return snapshot
  },
  getRef(): ScrollSnapshot {
    return snapshot
  },
}

// -----------------------------------------------------------------------------
// React Context — exposes the store to descendants and serves as the
// hook-guard mechanism (useScrollContext throws outside ScrollProvider).
// -----------------------------------------------------------------------------

const ScrollContext = createContext<ScrollStore | null>(null)

interface ScrollProviderProps {
  children: ReactNode
}

/**
 * ScrollProvider — mounts the single passive scroll listener with rAF
 * coalescing and exposes the scrollStore via Context.
 *
 * Lifecycle:
 *   - On mount: registers `window` scroll listener with `{ passive: true }`
 *   - On scroll: cancels any pending rAF, schedules a new rAF that
 *     updates scrollY / scrollProgress and notifies all subscribers
 *   - On unmount: removes the listener and cancels any pending rAF
 */
export function ScrollProvider({ children }: ScrollProviderProps) {
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    // Initialize snapshot with the current scroll position so consumers
    // mounting before the first scroll event get the correct value.
    scrollY = window.scrollY
    scrollProgress = computeProgress()
    snapshot = { y: scrollY, progress: scrollProgress }

    const onScroll = () => {
      // Coalesce burst scroll events to one update per animation frame.
      // Cancel-and-reschedule guarantees the rAF callback always reads
      // the latest scroll position, never a stale one from earlier in the
      // burst.
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
      }
      rafRef.current = requestAnimationFrame(() => {
        scrollY = window.scrollY
        scrollProgress = computeProgress()
        // Allocate a fresh snapshot so useSyncExternalStore detects a
        // change via reference inequality. The old object is intentionally
        // discarded — subscribers that already read it still see a valid
        // immutable value.
        snapshot = { y: scrollY, progress: scrollProgress }
        listeners.forEach((cb) => cb())
        rafRef.current = null
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', onScroll)
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }
  }, [])

  return (
    <ScrollContext.Provider value={scrollStore}>
      {children}
    </ScrollContext.Provider>
  )
}

/**
 * Access the scroll store from inside a ScrollProvider subtree.
 * Throws a descriptive error if called outside the provider — surfaces
 * misconfiguration loudly during development rather than failing
 * silently with stale-zero values.
 */
export function useScrollContext(): ScrollStore {
  const ctx = useContext(ScrollContext)
  if (!ctx) {
    throw new Error(
      'useScrollContext must be used within ScrollProvider. ' +
        'Wrap your app root with <ScrollProvider> in src/main.tsx or App.tsx.'
    )
  }
  return ctx
}
