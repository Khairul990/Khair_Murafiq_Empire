import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, FolderKanban, Activity, Users, ListChecks,
  DollarSign, MessageCircle, Share2, Link, Target,
  Crown, ChevronLeft, Menu, X, Bot, FileText, ShieldAlert, Settings, Server, Radar
} from 'lucide-react'

const navSections = [
  {
    title: 'Command',
    items: [
      { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/tasks', icon: ListChecks, label: 'Task Manager' },
      { to: '/finance', icon: DollarSign, label: 'Finance Ledger' },
      { to: '/goals', icon: Target, label: 'Goals' },
    ]
  },
  {
    title: 'Operations',
    items: [
      { to: '/projects', icon: FolderKanban, label: 'Website Control' },
      { to: '/social', icon: Share2, label: 'Social Planner' },
      { to: '/whatsapp', icon: MessageCircle, label: 'WhatsApp Alerts' },
      { to: '/affiliate', icon: Link, label: 'Link Tracker' },
    ]
  },
  {
    title: 'Intelligence',
    items: [
      { to: '/reports', icon: FileText, label: 'Reports Center' },
      { to: '/website-agent', icon: Radar, label: 'Website Agent' },
      { to: '/monitoring', icon: Activity, label: 'CCTV Monitoring' },
    ]
  },
  {
    title: 'Security',
    items: [
      { to: '/safety', icon: ShieldAlert, label: 'Safety Rules' },
      { to: '/api-engine', icon: Server, label: 'API Control Engine' },
    ]
  },
  {
    title: 'Settings',
    items: [
      { to: '/staff', icon: Users, label: 'Staff Management' },
      { to: '/assistant-settings', icon: Bot, label: 'Assistant Settings' },
      { to: '/settings', icon: Settings, label: 'Settings' },
    ]
  }
]

export default function Sidebar({ collapsed, setCollapsed }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-[60] lg:hidden bg-obsidian-card border border-obsidian-border rounded-lg p-2 text-gold shadow-lg"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[55] lg:hidden" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" />
        </div>
      )}

      {/* Sidebar */}
      <aside
        className={`${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed left-0 top-0 h-screen z-[60] transition-all duration-300 flex flex-col
          ${collapsed ? 'w-[72px]' : 'w-64'}
          bg-obsidian-surface border-r border-obsidian-border`}
      >
        {/* Logo */}
        <div className={`flex items-center gap-3 px-5 py-5 border-b border-obsidian-border ${collapsed ? 'justify-center px-0' : ''}`}>
          <div className="w-9 h-9 rounded-xl gold-gradient flex items-center justify-center shadow-gold-sm flex-shrink-0">
            <Crown className="w-5 h-5 text-obsidian-dark" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <h1 className="text-white font-extrabold text-[15px] leading-tight tracking-tight truncate">KM Empire</h1>
              <p className="text-[9px] text-gold uppercase tracking-[0.2em] font-bold">Command Center</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-4 empire-scrollbar">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {!collapsed && (
                <div className="px-3 mb-1.5">
                  <span className="text-[9px] font-black uppercase tracking-widest text-obsidian-muted/60">
                    {section.title}
                  </span>
                </div>
              )}
              {collapsed && <div className="h-4 border-b border-obsidian-border/30 w-8 mx-auto mb-2" />}
              
              {section.items.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative
                    ${collapsed ? 'justify-center px-0 w-12 mx-auto' : 'px-3'} 
                    ${isActive
                        ? 'text-gold bg-gold/10 shadow-[0_0_12px_rgba(242,201,76,0.15)] border border-gold/20'
                        : 'text-obsidian-muted hover:text-white hover:bg-white/[0.04] border border-transparent'
                    }`
                  }
                  title={collapsed ? label : undefined}
                >
                  <Icon className={`w-[18px] h-[18px] flex-shrink-0 transition-transform duration-200 group-hover:scale-110`} />
                  {!collapsed && <span className="truncate">{label}</span>}
                  
                  {/* Active Indicator Line */}
                  {collapsed && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-gold opacity-0 transition-opacity" />
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex items-center justify-center py-4 border-t border-obsidian-border text-obsidian-muted hover:text-gold transition-colors hover:bg-obsidian-card"
        >
          <ChevronLeft className={`w-5 h-5 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
        </button>

        {/* Mobile close */}
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden py-4 border-t border-obsidian-border text-obsidian-muted hover:text-gold flex items-center justify-center gap-2 transition-colors hover:bg-obsidian-card"
        >
          <X className="w-5 h-5" /> <span className="text-xs font-bold">CLOSE MENU</span>
        </button>
      </aside>
    </>
  )
}
