/**
 * Centralized GSAP module — register all plugins exactly once at module level.
 *
 * CRITICAL: Never import gsap or ScrollTrigger directly in component files.
 * All GSAP imports across the codebase MUST come from '@/lib/gsap'. This:
 *   - Guarantees plugins are registered before first use
 *   - Prevents double-registration warnings when code-splitting occurs
 *   - Prevents tree-shaking from dropping the useGSAP hook
 *
 * Registration of both ScrollTrigger and useGSAP happens in a single
 * registerPlugin() call. Registering useGSAP itself is the GSAP-team-
 * recommended way to keep the hook from being tree-shaken in production
 * builds.
 *
 * Source: https://gsap.com/resources/React/
 */

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, useGSAP)

export { gsap, ScrollTrigger, useGSAP }
