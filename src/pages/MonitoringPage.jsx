import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Activity, Shield, Link as LinkIcon, Gauge, RefreshCw,
  CheckCircle, XCircle, Clock, AlertTriangle, Camera,
} from 'lucide-react'
import monitoring from '../data/monitoring'

export default function MonitoringPage() {
  const [scanning, setScanning] = useState(false)

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

      {/* Recent Incidents */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-4 h-4 text-gold" />
          <h3 className="text-white font-bold text-sm">Recent Incidents</h3>
          <span className="text-[10px] text-obsidian-muted ml-1">(Last 30 days)</span>
        </div>
        <div className="space-y-2">
          {monitoring.recentIncidents.map((inc, i) => (
            <div key={i} className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-obsidian-card/50 border border-obsidian-border">
              <div className="flex items-center gap-3">
                {inc.resolved
                  ? <CheckCircle className="w-4 h-4 text-status-live" />
                  : <AlertTriangle className="w-4 h-4 text-status-warning" />
                }
                <div>
                  <p className="text-sm font-semibold text-white">{inc.type}</p>
                  <p className="text-xs text-obsidian-muted">{inc.description}</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0 ml-3">
                <span className={`text-[10px] font-semibold ${inc.resolved ? 'text-status-live' : 'text-status-warning'}`}>
                  {inc.resolved ? 'Resolved' : 'Open'}
                </span>
                <p className="text-[10px] text-obsidian-muted">{inc.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
