import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './designs/spruce/fonts'
import App from './App'
import { registerServiceWorker } from './lib/pwa/registerServiceWorker'

registerServiceWorker()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
