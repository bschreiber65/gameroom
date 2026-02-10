import { Link, useLocation } from 'react-router-dom'
import { Home, Plus } from 'lucide-react'

const links = [
  { to: '/', icon: Home, label: 'Lobby' },
  { to: '/new-game', icon: Plus, label: 'New Game' },
]

export default function NavLinks({ onNavigate }) {
  const location = useLocation()

  return (
    <nav className="p-2">
      {links.map(({ to, icon: Icon, label }) => (
        <Link
          key={to}
          to={to}
          onClick={onNavigate}
          className={`flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors ${
            location.pathname === to
              ? 'bg-primary/20 text-primary'
              : 'text-muted hover:text-text hover:bg-white/5'
          }`}
        >
          <Icon size={16} />
          {label}
        </Link>
      ))}
    </nav>
  )
}
