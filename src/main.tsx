import { createRoot } from 'react-dom/client'
import '@/styles/index.css'
import '@/lib/i18n' // side-effect — i18n.init() must run before any component subscribes via useTranslation
import { ScrollProvider } from '@/context/ScrollContext'
import App from '@/App.tsx'

// StrictMode removed: its double-invoke cleanup reverts GSAP animation state
// mid-render, causing visible flashes (panel slides in, hero text disappears).
// GSAP explicitly recommends removing StrictMode for animation-heavy apps.
// See: https://gsap.com/resources/React/
createRoot(document.getElementById('root')!).render(
  <ScrollProvider>
    <App />
  </ScrollProvider>
)
