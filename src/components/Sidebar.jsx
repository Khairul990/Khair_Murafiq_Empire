import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, FolderKanban, Activity, Users, ListChecks,
  DollarSign, MessageCircle, Share2, Link, Target,
  Crown, ChevronLeft, Menu, X, Shield, Bot, FileText, ShieldAlert, Settings, Server
} from 'lucide-react'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/projects', icon: FolderKanban, label: 'Website Control' },
  { to: '/monitoring', icon: Activity, label: 'CCTV Monitoring' },
  { to: '/staff', icon: Users, label: 'Staff Management' },
  { to: '/tasks', icon: ListChecks, label: 'Task Manager' },
  { to: '/finance', icon: DollarSign, label: 'Finance Ledger' },
  { to: '/whatsapp', icon: MessageCircle, label: 'WhatsApp Alerts' },
  { to: '/social', icon: Share2, label: 'Social Planner' },
  { to: '/affiliate', icon: Link, label: 'Link Tracker' },
  { to: '/goals', icon: Target, label: 'Goals' },
  { to: '/reports', icon: FileText, label: 'Reports Center' },
  { to: '/api-engine', icon: Server, label: 'API Control Engine' },
  { to: '/safety', icon: ShieldAlert, label: 'Safety Rules' },
  { to: '/assistant-settings', icon: Bot, label: 'Assistant Settings' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar({ collapsed, setCollapsed }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-obsidian-card border border-obsidian-border rounded-lg p-2 text-gold"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        </div>
      )}

      {/* Sidebar */}
      <aside
        className={`${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed left-0 top-0 h-screen z-50 transition-all duration-300 flex flex-col
          ${collapsed ? 'w-20' : 'w-64'}
          bg-obsidian-surface border-r border-obsidian-border`}
      >
        {/* Logo */}
        <div className={`flex items-center gap-3 px-5 py-5 border-b border-obsidian-border ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-9 h-9 rounded-xl gold-gradient flex items-center justify-center shadow-gold-sm flex-shrink-0">
            <Crown className="w-5 h-5 text-obsidian-dark" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <h1 className="text-white font-extrabold text-[15px] leading-tight tracking-tight truncate">KM Empire</h1>
              <p className="text-[9px] text-obsidian-muted uppercase tracking-[0.2em] font-medium">Control Center</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5 empire-scrollbar">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  collapsed ? 'justify-center' : ''
                } ${
                  isActive
                    ? 'text-gold bg-gold/10 shadow-gold-sm'
                    : 'text-obsidian-muted hover:text-white hover:bg-white/[0.04]'
                }`
              }
            >
              <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${collapsed ? '' : ''}`} />
              {!collapsed && <span className="truncate">{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex items-center justify-center py-3 border-t border-obsidian-border text-obsidian-muted hover:text-gold transition-colors"
        >
          <ChevronLeft className={`w-4 h-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
        </button>

        {/* Mobile close */}
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden py-3 border-t border-obsidian-border text-obsidian-muted hover:text-gold flex items-center justify-center gap-2 transition-colors"
        >
          <X className="w-4 h-4" /> <span className="text-xs">Close</span>
        </button>

        {/* Footer */}
        {!collapsed && (
          <div className="px-5 py-3 border-t border-obsidian-border">
            <p className="text-[9px] text-obsidian-muted/60 text-center">Khair Murafiq Empire © 2026</p>
          </div>
        )}
      </aside>
    </>
  )
}
