import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { cx } from './cx'

type Tone = 'erro' | 'ok'
type Toast = { id: number; mensagem: string; tone: Tone }

const ToastContext = createContext<(mensagem: string, tone?: Tone) => void>(() => {})

export function useToast() {
  return useContext(ToastContext)
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const remover = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const notificar = useCallback(
    (mensagem: string, tone: Tone = 'erro') => {
      const id = Date.now() + Math.random()
      setToasts((prev) => [...prev, { id, mensagem, tone }])
      window.setTimeout(() => remover(id), 5000)
    },
    [remover],
  )

  return (
    <ToastContext.Provider value={notificar}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 p-4 pb-20 sm:items-end lg:pb-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={cx(
              'pointer-events-auto flex max-w-sm items-start gap-3 rounded-lg border px-4 py-3 text-sm shadow-lg',
              t.tone === 'erro'
                ? 'border-caramel bg-sand/20 text-espresso'
                : 'border-steel bg-mist/50 text-navy',
            )}
          >
            <span className="flex-1">{t.mensagem}</span>
            <button
              onClick={() => remover(t.id)}
              aria-label="Fechar aviso"
              className="-mr-1 -mt-0.5 shrink-0 rounded p-0.5 text-caramel hover:text-espresso focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-steel"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden fill="none">
                <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
