import { lazy, StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { MotionConfig } from 'motion/react'
import './index.css'
import { normalize, site } from './lib/content'
import { ToastProvider } from './components/Toast'
import Layout from './components/Layout'
import Home, { NotFound } from './pages/Home'
import Catalog from './pages/Catalog'
import AppPage from './pages/AppPage'
import About from './pages/About'

const AdminApp = lazy(() => import('./admin/AdminApp'))
const PREVIEW_KEY = 'jl-preview'

// Vista previa del borrador del panel (solo en este navegador).
let preview = false
try {
  const raw = localStorage.getItem(PREVIEW_KEY)
  if (raw && !location.pathname.startsWith('/admin')) { Object.assign(site, normalize(JSON.parse(raw))); preview = true }
} catch { /* ignore */ }

function PreviewBanner() {
  if (!preview) return null
  return (
    <div className="fixed inset-x-0 top-0 z-[70] flex items-center justify-center gap-3 bg-orange px-4 py-1.5 text-xs font-bold text-bg">
      Vista previa del borrador
      <button className="rounded bg-bg/20 px-2 py-0.5" onClick={() => { localStorage.removeItem(PREVIEW_KEY); location.reload() }}>Salir</button>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <ToastProvider>
        <BrowserRouter>
          <PreviewBanner />
          <Routes>
            <Route path="/admin/*" element={<Suspense fallback={<div className="min-h-dvh bg-bg" />}><AdminApp /></Suspense>} />
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="apps" element={<Catalog />} />
              <Route path="sobre-mi" element={<About />} />
              <Route path=":slug" element={<AppPage />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </MotionConfig>
  </StrictMode>,
)
