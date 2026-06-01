import { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings, User, Bell, Globe, Zap, Database, Shield } from 'lucide-react'

export default function SettingsPage() {
  const [ecoMode, setEcoMode] = useState(false)
  const [lang, setLang] = useState('en')
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      <div>
        <h1 className="text-xl lg:text-2xl font-extrabold text-white">
          System <span className="gold-gradient-text">Settings</span>
        </h1>
        <p className="text-xs text-obsidian-muted mt-1">
          Configure your Empire OS preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Profile */}
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-4 h-4 text-gold" />
            <h3 className="text-white font-bold text-sm">Owner Profile</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] text-obsidian-muted uppercase tracking-wider mb-1 block">Name</label>
              <input type="text" defaultValue="Khair Murafiq" className="w-full bg-obsidian-card border border-obsidian-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold/30" />
            </div>
            <div>
              <label className="text-[10px] text-obsidian-muted uppercase tracking-wider mb-1 block">Role</label>
              <input type="text" defaultValue="Super Admin / Owner" disabled className="w-full bg-obsidian-card/50 border border-obsidian-border rounded-xl px-4 py-2.5 text-sm text-obsidian-muted cursor-not-allowed" />
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-4 h-4 text-gold" />
            <h3 className="text-white font-bold text-sm">Preferences</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-obsidian-card/50 border border-obsidian-border">
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-obsidian-muted" />
                <div>
                  <p className="text-sm font-semibold text-white">Language</p>
                  <p className="text-[10px] text-obsidian-muted">Interface language</p>
                </div>
              </div>
              <select value={lang} onChange={(e) => setLang(e.target.value)} className="bg-obsidian-card border border-obsidian-border rounded-lg px-2 py-1 text-xs text-white">
                <option value="en">English</option>
                <option value="bn">Bangla</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-obsidian-card/50 border border-obsidian-border">
              <div className="flex items-center gap-3">
                <Zap className={`w-4 h-4 ${ecoMode ? 'text-status-live' : 'text-gold'}`} />
                <div>
                  <p className="text-sm font-semibold text-white">Performance Mode</p>
                  <p className="text-[10px] text-obsidian-muted">Reduce animations</p>
                </div>
              </div>
              <button onClick={() => setEcoMode(!ecoMode)} className={`px-3 py-1 rounded-lg text-xs font-semibold ${ecoMode ? 'bg-status-live/10 text-status-live border border-status-live/20' : 'bg-gold/10 text-gold border border-gold/20'}`}>
                {ecoMode ? 'Eco Mode' : 'Turbo Mode'}
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-obsidian-card/50 border border-obsidian-border">
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4 text-obsidian-muted" />
                <div>
                  <p className="text-sm font-semibold text-white">Notifications</p>
                  <p className="text-[10px] text-obsidian-muted">Push & Email alerts</p>
                </div>
              </div>
              <div className="w-8 h-4 bg-gold/30 rounded-full relative cursor-pointer border border-gold/20">
                <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-gold rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* API Connections */}
        <div className="glass-card rounded-2xl p-5 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-4 h-4 text-gold" />
            <h3 className="text-white font-bold text-sm">API Connection Status (Phase 1)</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { name: 'Firebase Database', status: 'Mock / LocalStorage' },
              { name: 'WhatsApp Cloud API', status: 'Not Connected' },
              { name: 'Vercel Deployment', status: 'Not Connected' },
            ].map((api, i) => (
              <div key={i} className="p-3 rounded-xl bg-obsidian-card/50 border border-obsidian-border flex items-center justify-between">
                <span className="text-xs text-white">{api.name}</span>
                <span className="px-2 py-0.5 rounded text-[9px] font-semibold text-obsidian-muted bg-obsidian-card border border-obsidian-border">
                  {api.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
