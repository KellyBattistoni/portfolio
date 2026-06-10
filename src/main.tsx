import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/styles/index.css'
import '@/lib/i18n' // side-effect — i18n.init() must run before any component subscribes via useTranslation
import { ScrollProvider } from '@/context/ScrollContext'
import App from '@/App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ScrollProvider>
      <App />
    </ScrollProvider>
  </StrictMode>
)
