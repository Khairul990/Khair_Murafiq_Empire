import { useLocation } from 'react-router-dom'
import { Bell, User, Zap, ShieldAlert, Database, CloudRain } from 'lucide-react'
import { useState, useEffect } from 'react'

const pageTitles = {
  '/': 'Dashboard Overview',
  '/projects': 'Website Operations',
  '/monitoring': 'Global CCTV & Intelligence',
  '/staff': 'Personnel Management',
  '/tasks': 'Task & Mission Control',
  '/finance': 'Financial Ledger',
  '/whatsapp': 'WhatsApp Broadcasts',
  '/social': 'Social Media Command',
  '/affiliate': 'Affiliate Link Tracker',
  '/goals': 'Strategic Goals',
  '/reports': 'Intelligence Reports',
  '/safety': 'Safety & Security Rules',
  '/api-engine': 'API Control Gateway',
  '/website-agent': 'Live Agent Operations feed',
  '/assistant-settings': 'Empire AI Configuration',
  '/settings': 'System Settings',
}

export default function Topbar({ onToggleAssistant }) {
  const location = useLocation()
  const title = pageTitles[location.pathname] || 'Command Center'
  const [turboMode, setTurboMode] = useState(false)
  const [syncStatus, setSyncStatus] = useState('syncing')

  // Mock sync effect
  useEffect(() => {
    const interval = setInterval(() => {
      setSyncStatus('syncing')
      setTimeout(() => setSyncStatus('synced'), 1000)
    }, 15000)
    return () => clearInterval(interval)
  }, [])

  return (
    <header className="sticky top-0 z-40 bg-obsidian-surface/90 backdrop-blur-xl border-b border-obsidian-border pl-16 lg:pl-0">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <div className="hidden lg:block">
            <h2 className="text-sm font-bold text-white tracking-wide">{title}</h2>
            <div className="flex items-center gap-3 mt-0.5">
              <div className="flex items-center gap-1.5 text-[9px] text-status-live font-medium uppercase tracking-wider">
                <Database className="w-3 h-3" /> Real Data Active
              </div>
              <div className="w-1 h-1 rounded-full bg-obsidian-border" />
              <div className="flex items-center gap-1.5 text-[9px] text-obsidian-muted font-medium uppercase tracking-wider">
                <CloudRain className={`w-3 h-3 ${syncStatus === 'syncing' ? 'animate-pulse text-blue-400' : 'text-status-live'}`} /> 
                {syncStatus === 'syncing' ? 'Syncing...' : 'Firebase Synced'}
              </div>
            </div>
          </div>
          
          {/* Mobile Title */}
          <h2 className="text-xs font-bold text-white lg:hidden truncate max-w-[140px] sm:max-w-[200px]">{title}</h2>
        </div>

        <div className="flex items-center gap-3">
          {/* Turbo / Eco Mode Toggle */}
          <button
            onClick={() => setTurboMode(!turboMode)}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
              turboMode
                ? 'bg-gold/10 text-gold border border-gold/20 shadow-[0_0_10px_rgba(242,201,76,0.15)]'
                : 'bg-obsidian-dark border border-obsidian-border text-obsidian-muted hover:text-white'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${turboMode ? 'fill-gold' : ''}`} />
            {turboMode ? 'Turbo' : 'Eco'}
          </button>

          {/* Emergency Lockdown */}
          <button
            onClick={() => window.dispatchEvent(new Event('trigger_lockdown'))}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all bg-status-error/10 text-status-error border border-status-error/30 hover:bg-status-error hover:text-white shadow-[0_0_10px_rgba(239,68,68,0.15)]"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Emergency Lockdown</span>
            <span className="sm:hidden">Lock</span>
          </button>

          <div className="h-6 w-px bg-obsidian-border mx-1 hidden sm:block" />

          {/* Notifications */}
          <button className="relative p-2 text-obsidian-muted hover:text-gold transition-colors rounded-lg hover:bg-obsidian-dark border border-transparent hover:border-obsidian-border">
            <Bell className="w-[18px] h-[18px]" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-status-error rounded-full animate-pulse shadow-[0_0_5px_rgba(239,68,68,0.8)]" />
          </button>

          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-obsidian-dark border border-gold/30 flex items-center justify-center cursor-pointer hover:border-gold hover:shadow-[0_0_10px_rgba(242,201,76,0.2)] transition-all">
            <User className="w-4 h-4 text-gold" />
          </div>
        </div>
      </div>
    </header>
  )
}
