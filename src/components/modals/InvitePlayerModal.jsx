import { useState } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { Copy, Check } from 'lucide-react'

export default function InvitePlayerModal({ open, onClose, gameUrl, message }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(gameUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Modal open={open} onClose={onClose} title="Invite a Player">
      {message && <p className="text-muted mb-3">{message}</p>}
      <div className="bg-black/20 rounded p-3 mb-3 break-all text-sm text-text">
        {gameUrl}
      </div>
      <Button onClick={handleCopy} className="w-full flex items-center justify-center gap-2">
        {copied ? <Check size={16} /> : <Copy size={16} />}
        {copied ? 'Copied!' : 'Copy Link'}
      </Button>
    </Modal>
  )
}
