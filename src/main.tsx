import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ErrorBoundary, ThemeProvider } from '@/components'
import { TooltipProvider } from '@/components/ui/tooltip'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="preview-code-theme">
      <TooltipProvider>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </TooltipProvider>
    </ThemeProvider>
  </StrictMode>,
)
