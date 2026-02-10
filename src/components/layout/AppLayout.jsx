import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import { Menu, MessageCircle } from 'lucide-react'

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [unreadMessages, setUnreadMessages] = useState(0)

  return (
    <div className="flex min-h-screen bg-bg">
      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onUnreadChange={setUnreadMessages}
      />

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="flex items-center gap-3 px-4 py-3 bg-dark border-b border-white/10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-text hover:text-primary transition-colors lg:hidden"
          >
            <Menu size={24} />
          </button>
          <button
            onClick={() => setSidebarOpen(prev => !prev)}
            className="text-text hover:text-primary transition-colors hidden lg:block"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-xl font-bold text-primary tracking-wide">Codenames</h1>
          <div className="flex-1" />
          <button
            onClick={() => setSidebarOpen(true)}
            className="relative text-text hover:text-primary transition-colors"
          >
            <MessageCircle size={22} />
            {unreadMessages > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {unreadMessages}
              </span>
            )}
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
