import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  MessageCircle, AlertTriangle, Bell, BellOff, RefreshCw,
  Phone, Shield, Globe, Info, CheckCircle, XCircle,
} from 'lucide-react'
import whatsappConfig from '../data/whatsapp'

export default function WhatsAppPage() {
  const [config, setConfig] = useState(whatsappConfig)

  const toggleAlert = (id) => {
    const updated = config.alertTypes.map(a =>
      a.id === id ? { ...a, enabled: !a.enabled } : a
    )
    setConfig({ ...config, alertTypes: updated })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      {/* Header */}
      <div>
        <h1 className="text-xl lg:text-2xl font-extrabold text-white flex items-center gap-2">
          WhatsApp <span className="gold-gradient-text">Alert Center</span>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-obsidian-light/80 text-obsidian-muted border border-obsidian-border">Planned / Mock Mode</span>
        </h1>
        <p className="text-xs text-obsidian-muted mt-1">
          Monitor and manage WhatsApp alert notifications
        </p>
      </div>

      {/* Connection Status */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {config.connected ? (
              <CheckCircle className="w-5 h-5 text-status-live" />
            ) : (
              <XCircle className="w-5 h-5 text-status-error" />
            )}
            <div>
              <h3 className="text-white font-bold text-sm">Connection Status</h3>
              <p className="text-xs text-obsidian-muted">
                {config.connected ? 'Connected' : 'Planned / Not Connected'}
              </p>
            </div>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-obsidian-card text-obsidian-muted border border-obsidian-border hover:text-white transition-all">
            <RefreshCw className="w-3 h-3" /> Test
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-obsidian-card/50 rounded-xl p-3 border border-obsidian-border">
            <div className="flex items-center gap-2 text-xs text-obsidian-muted mb-1">
              <Phone className="w-3 h-3" /> API
            </div>
            <p className="text-sm font-semibold text-white">{config.api}</p>
          </div>
          <div className="bg-obsidian-card/50 rounded-xl p-3 border border-obsidian-border">
            <div className="flex items-center gap-2 text-xs text-obsidian-muted mb-1">
              <Shield className="w-3 h-3" /> Phone Number ID
            </div>
            <p className="text-sm font-semibold text-obsidian-muted">{config.phoneNumberId}</p>
          </div>
          <div className="bg-obsidian-card/50 rounded-xl p-3 border border-obsidian-border">
            <div className="flex items-center gap-2 text-xs text-obsidian-muted mb-1">
              <Globe className="w-3 h-3" /> Business Account ID
            </div>
            <p className="text-sm font-semibold text-obsidian-muted">{config.businessAccountId}</p>
          </div>
        </div>
      </div>

      {/* Alert Types */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-4 h-4 text-gold" />
          <h3 className="text-white font-bold text-sm">Alert Types</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {config.alertTypes.map((alert) => (
            <div
              key={alert.id}
              className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-obsidian-card/50 border border-obsidian-border"
            >
              <div className="flex items-center gap-2">
                {alert.enabled
                  ? <Bell className="w-4 h-4 text-gold" />
                  : <BellOff className="w-4 h-4 text-obsidian-muted" />
                }
                <span className="text-sm text-white">{alert.label}</span>
              </div>
              <button
                onClick={() => toggleAlert(alert.id)}
                className={`relative w-10 h-5 rounded-full transition-all ${
                  alert.enabled ? 'bg-gold/30' : 'bg-obsidian-card border border-obsidian-border'
                }`}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${
                  alert.enabled ? 'bg-gold right-0.5' : 'bg-obsidian-muted left-0.5'
                }`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Warning */}
      <div className="glass-card rounded-2xl p-5 border border-status-warning/20">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-status-warning flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-status-warning mb-1">Security Notice</p>
            <p className="text-xs text-obsidian-muted leading-relaxed">
              {config.warning}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
