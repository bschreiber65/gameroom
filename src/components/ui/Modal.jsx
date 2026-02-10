import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Modal({
  open,
  onClose,
  title,
  children,
  className = '',
}) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className={`bg-surface rounded-lg shadow-xl max-w-md w-full mx-4 ${className}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="text-lg font-semibold text-text">{title}</h3>
          {onClose && (
            <button
              onClick={onClose}
              className="text-muted hover:text-text transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  )
}
