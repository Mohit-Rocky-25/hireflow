import './zodConfig'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './designs/spruce/fonts'
import { registerServiceWorker } from './lib/pwa/registerServiceWorker'

registerServiceWorker()

// Dynamically import App after zodConfig sets globalConfig.jitless = true so
// ESM static-import hoisting never triggers Zod v4's JIT eval probe before CSP check.
void import('./App').then(({ default: App }) => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
