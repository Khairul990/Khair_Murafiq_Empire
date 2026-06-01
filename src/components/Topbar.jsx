import { useLocation } from 'react-router-dom'
import { Bell, User, Zap, Moon } from 'lucide-react'
import { useState } from 'react'

const pageTitles = {
  '/': 'Dashboard',
  '/projects': 'Website Control Room',
  '/monitoring': 'CCTV Monitoring',
  '/staff': 'Staff Management',
  '/tasks': 'Task Manager',
  '/finance': 'Finance Ledger',
  '/whatsapp': 'WhatsApp Alert Center',
  '/social': 'Social Media Planner',
  '/affiliate': 'Affiliate Link Tracker',
  '/goals': 'Goals & Challenges',
  '/reports': 'Reports Center',
  '/safety': 'Safety & Compliance',
  '/settings': 'System Settings',
}

export default function Topbar({ onToggleAssistant }) {
  const location = useLocation()
  const title = pageTitles[location.pathname] || 'Dashboard'
  const [turboMode, setTurboMode] = useState(false)

  return (
    <header className="sticky top-0 z-30 bg-obsidian-surface/80 backdrop-blur-xl border-b border-obsidian-border">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <h2 className="text-lg lg:text-xl font-bold text-white lg:hidden">KM Empire</h2>
          <h2 className="text-lg lg:text-xl font-bold text-white hidden lg:block">{title}</h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Turbo / Eco Mode Toggle */}
          <button
            onClick={() => setTurboMode(!turboMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              turboMode
                ? 'bg-gold/10 text-gold border border-gold/20'
                : 'bg-obsidian-card border border-obsidian-border text-obsidian-muted hover:text-white'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${turboMode ? 'fill-gold' : ''}`} />
            {turboMode ? 'Turbo' : 'Eco'}
          </button>

          {/* Notifications */}
          <button className="relative p-2 text-obsidian-muted hover:text-gold transition-colors rounded-lg hover:bg-white/[0.04]">
            <Bell className="w-[18px] h-[18px]" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-status-error rounded-full animate-pulse" />
          </button>

          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold/30 to-gold-dark/30 border border-gold/20 flex items-center justify-center">
            <User className="w-4 h-4 text-gold" />
          </div>
        </div>
      </div>
    </header>
  )
}
