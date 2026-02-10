import { useAuth } from '../../hooks/useAuth'
import { LogOut } from 'lucide-react'

export default function UserWelcome({ name }) {
  const { signOut } = useAuth()

  return (
    <div className="p-4 border-b border-white/10">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted">Welcome,</p>
          <p className="text-text font-semibold capitalize">{name || 'Player'}</p>
        </div>
        <button
          onClick={signOut}
          className="text-muted hover:text-red-400 transition-colors"
          title="Sign Out"
        >
          <LogOut size={18} />
        </button>
      </div>
    </div>
  )
}
