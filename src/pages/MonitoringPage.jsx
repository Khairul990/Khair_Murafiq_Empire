import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Activity, Shield, Link as LinkIcon, Gauge, RefreshCw,
  CheckCircle, XCircle, Clock, AlertTriangle, Camera, Trash2
} from 'lucide-react'
import monitoring from '../data/monitoring'

const ALERTS_KEY = 'km_empire_alerts'

const loadAlerts = () => {
  try {
    const stored = localStorage.getItem(ALERTS_KEY)
    if (stored) return JSON.parse(stored)
  } catch {}
  return []
}

export default function MonitoringPage() {
  const [scanning, setScanning] = useState(false)
  const [alerts, setAlerts] = useState(loadAlerts)

  useEffect(() => {
    localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts))
  }, [alerts])

  const handleUpdateStatus = (id, newStatus) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, status: newStatus, updatedAt: new Date().toISOString() } : a))
  }

  const handleDeleteAlert = (id) => {
    if (window.confirm('Are you sure you want to delete this alert?')) {
      setAlerts(alerts.filter(a => a.id !== id))
    }
  }

  const handleRunCheck = () => {
    setScanning(true)
    setTimeout(() => setScanning(false), 2000)
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
        <h1 className="text-xl lg:text-2xl font-extrabold text-white">
          CCTV <span className="gold-gradient-text">Monitoring</span>
        </h1>
        <p className="text-xs text-obsidian-muted mt-1">
          Real-time website monitoring dashboard
        </p>
      </div>

      {/* Status Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: Activity, label: 'Uptime', value: monitoring.uptime, color: 'text-status-live' },
          { icon: Shield, label: 'Deployment', value: monitoring.deploymentHealth, color: 'text-status-live' },
          { icon: Shield, label: 'Security', value: monitoring.securityStatus, color: 'text-status-live' },
          { icon: LinkIcon, label: 'Broken Links', value: '0 Found', color: 'text-status-live' },
          { icon: Gauge, label: 'Performance', value: `${monitoring.performanceScore}/100`, color: monitoring.performanceScore >= 80 ? 'text-status-live' : 'text-status-warning' },
          { icon: Clock, label: 'Last Scan', value: '2 mins ago', color: 'text-obsidian-muted' },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card rounded-2xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <item.icon className="w-4 h-4 text-gold" />
              <span className="text-xs text-obsidian-muted">{item.label}</span>
            </div>
            <p className={`text-lg font-extrabold ${item.color}`}>{item.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Screenshot Placeholder */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Camera className="w-4 h-4 text-gold" />
          <h3 className="text-white font-bold text-sm">Latest Screenshot</h3>
        </div>
        <div className="bg-obsidian-card rounded-xl h-48 flex items-center justify-center border border-obsidian-border">
          <div className="text-center">
            <Camera className="w-10 h-10 text-obsidian-muted/30 mx-auto mb-2" />
            <p className="text-xs text-obsidian-muted">Screenshot placeholder</p>
            <p className="text-[10px] text-obsidian-muted/50 mt-1">Will capture live site screenshots in future</p>
          </div>
        </div>
      </div>

      {/* Services Table */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-gold" />
            <h3 className="text-white font-bold text-sm">Service Status</h3>
          </div>
          <button
            onClick={handleRunCheck}
            disabled={scanning}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold gold-gradient text-obsidian-dark hover:opacity-90 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${scanning ? 'animate-spin' : ''}`} />
            {scanning ? 'Scanning...' : 'Run Check'}
          </button>
        </div>
        <div className="space-y-2">
          {monitoring.services.map((s, i) => (
            <div key={i} className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-obsidian-card/50 border border-obsidian-border">
              <div className="flex items-center gap-3">
                {s.status === 'Operational'
                  ? <CheckCircle className="w-4 h-4 text-status-live" />
                  : <XCircle className="w-4 h-4 text-status-warning" />
                }
                <div>
                  <p className="text-sm font-semibold text-white">{s.name}</p>
                  <p className="text-[10px] text-obsidian-muted">{s.status}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-white">{s.uptime}</p>
                <p className="text-[10px] text-obsidian-muted">{s.response}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Empire Alerts */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-status-warning" />
            <h3 className="text-white font-bold text-sm">Empire Alerts</h3>
            <span className="px-2 py-0.5 rounded-full bg-status-warning/10 text-status-warning text-[10px] font-bold">
              {alerts.length} Total
            </span>
          </div>
        </div>

        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-10 h-10 text-status-live/50 mx-auto mb-2" />
            <p className="text-xs text-obsidian-muted">All systems secure. No active alerts.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className="p-4 rounded-xl bg-obsidian-card/50 border border-obsidian-border flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                      alert.severity === 'Critical' ? 'text-status-error bg-status-error/10 border-status-error/30 animate-pulse' :
                      alert.severity === 'High' ? 'text-orange-400 bg-orange-400/10 border-orange-400/30' :
                      alert.severity === 'Medium' ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30' :
                      'text-blue-400 bg-blue-400/10 border-blue-400/30'
                    }`}>
                      {alert.severity}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                      alert.status === 'Fixed' ? 'text-status-live bg-status-live/10 border-status-live/30' :
                      alert.status === 'Ignored' ? 'text-obsidian-muted bg-obsidian-light border-obsidian-border' :
                      alert.status === 'Reviewing' ? 'text-blue-400 bg-blue-400/10 border-blue-400/30' :
                      'text-status-warning bg-status-warning/10 border-status-warning/30'
                    }`}>
                      {alert.status}
                    </span>
                    <span className="text-xs font-bold text-white ml-2">{alert.projectName}</span>
                  </div>
                  <p className="text-sm text-white font-semibold mb-1">{alert.alertType}</p>
                  <p className="text-xs text-obsidian-muted">{alert.message}</p>
                  <p className="text-[10px] text-obsidian-muted/50 mt-2">Added: {new Date(alert.createdAt).toLocaleString()}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2 md:flex-col md:items-end md:gap-2">
                  <div className="flex gap-2">
                    {alert.status !== 'Fixed' && (
                      <button onClick={() => handleUpdateStatus(alert.id, 'Fixed')} className="px-3 py-1.5 rounded-lg text-[10px] font-semibold bg-status-live/10 text-status-live border border-status-live/20 hover:bg-status-live hover:text-obsidian-dark transition-all">
                        Mark Fixed
                      </button>
                    )}
                    {alert.status !== 'Reviewing' && alert.status !== 'Fixed' && (
                      <button onClick={() => handleUpdateStatus(alert.id, 'Reviewing')} className="px-3 py-1.5 rounded-lg text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500 hover:text-white transition-all">
                        Reviewing
                      </button>
                    )}
                    {alert.status !== 'Ignored' && alert.status !== 'Fixed' && (
                      <button onClick={() => handleUpdateStatus(alert.id, 'Ignored')} className="px-3 py-1.5 rounded-lg text-[10px] font-semibold bg-obsidian-light text-obsidian-muted border border-obsidian-border hover:text-white transition-all">
                        Ignore
                      </button>
                    )}
                  </div>
                  <button onClick={() => handleDeleteAlert(alert.id)} className="px-3 py-1.5 rounded-lg text-[10px] font-semibold bg-status-error/10 text-status-error border border-status-error/20 hover:bg-status-error hover:text-white transition-all flex items-center gap-1 mt-1 md:mt-0">
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
