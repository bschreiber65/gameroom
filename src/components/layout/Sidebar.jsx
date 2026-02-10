import { useAuth } from '../../hooks/useAuth'
import UserWelcome from '../sidebar/UserWelcome'
import NavLinks from '../sidebar/NavLinks'
import FriendsList from '../sidebar/FriendsList'
import GamesList from '../sidebar/GamesList'
import ChatPanel from '../sidebar/ChatPanel'

export default function Sidebar({ open, onClose, onUnreadChange }) {
  const { profile } = useAuth()

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-full w-72 bg-dark border-r border-white/10 transform transition-transform duration-200 overflow-y-auto lg:relative lg:translate-x-0 ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex flex-col h-full">
        <UserWelcome name={profile?.name} />
        <NavLinks onNavigate={onClose} />
        <FriendsList />
        <GamesList />
        <div className="flex-1" />
        <ChatPanel onUnreadChange={onUnreadChange} />
      </div>
    </aside>
  )
}
