import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Shield, ShieldAlert, Activity, AlertTriangle, CheckCircle, Clock, Server, FileText, Send, Radio } from 'lucide-react'
import { storageAdapter } from '../services/storageAdapter'
import { auth } from '../services/firebaseConfig'

export default function WebsiteAgentPage() {
  const [events, setEvents] = useState([])
  const [errors, setErrors] = useState([])
  const [healthData, setHealthData] = useState([])
  const [alerts, setAlerts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    setErrorMsg('')
    try {
      const [evts, errs, health, alts] = await Promise.all([
        storageAdapter.getWebsiteEvents(),
        storageAdapter.getWebsiteErrors(),
        storageAdapter.getWebsiteHealth(),
        storageAdapter.getAlerts()
      ])
      
      setEvents(evts || [])
      setErrors(errs || [])
      setHealthData(health || [])
      setAlerts(alts || [])

      // Auto Alert Rule Logic (Client Side for now)
      if (evts && errs && alts) {
        checkAndCreateAlerts(evts, errs, alts)
      }

    } catch (err) {
      setErrorMsg('Firebase unavailable. Local fallback active.')
    }
    setIsLoading(false)
  }

  const checkAndCreateAlerts = async (currentEvents, currentErrors, currentAlerts) => {
    let newAlertsNeeded = []
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

    const checkItems = (items, typePrefix) => {
      items.forEach(item => {
        if ((item.severity === 'High' || item.severity === 'Critical') && new Date(item.createdAt) > oneDayAgo) {
          // Check if an alert already exists for this event
          const exists = currentAlerts.some(a => a.originalEventId === item.id || a.message.includes(item.id))
          const newlyAdded = newAlertsNeeded.some(a => a.originalEventId === item.id)
          
          if (!exists && !newlyAdded) {
            newAlertsNeeded.push({
              id: Date.now().toString() + Math.random().toString(36).substring(7),
              projectId: item.websiteId || 'unknown',
              projectName: item.websiteName || 'Unknown Website',
              alertType: `${typePrefix} Agent Alert`,
              severity: item.severity,
              message: `[Agent Auto-Alert] ${item.message} (Event ID: ${item.id})`,
              status: 'New',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              originalEventId: item.id
            })
          }
        }
      })
    }

    checkItems(currentEvents, 'Event')
    checkItems(currentErrors, 'Error')

    if (newAlertsNeeded.length > 0) {
      const allAlerts = [...newAlertsNeeded, ...currentAlerts]
      setAlerts(allAlerts)
      for (const alert of newAlertsNeeded) {
        await storageAdapter.saveAlert(alert, allAlerts)
      }
    }
  }

  const handleTestEvent = async () => {
    const newEvent = {
      id: Date.now().toString(),
      websiteId: "test_website",
      websiteName: "Test Website",
      eventType: "test_event",
      message: "Control Room agent receiver test event",
      severity: "Low",
      page: "/test",
      source: "manual_test",
      createdAt: new Date().toISOString()
    }
    
    const newEvents = [newEvent, ...events]
    setEvents(newEvents)
    await storageAdapter.saveWebsiteEvent(newEvent, newEvents)
    alert("Test Event Sent!")
  }

  const criticalEvents = events.filter(e => e.severity === 'Critical' || e.severity === 'High')
  const recentErrors = errors.filter(e => new Date(e.createdAt) > new Date(Date.now() - 24*60*60*1000))

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-20"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-3xl font-extrabold text-white flex items-center gap-3">
            Agent <span className="gold-gradient-text">Operations</span>
            <div className="relative flex items-center justify-center w-6 h-6">
              <span className="absolute inline-flex h-full w-full rounded-full bg-cyan-signal/30 animate-ping"></span>
              <Radio className="relative w-5 h-5 text-cyan-signal" />
            </div>
          </h1>
          <p className="text-xs text-obsidian-muted mt-1 uppercase tracking-widest font-bold">
            Live telemetry stream from connected assets
          </p>
          {errorMsg && <p className="text-[10px] text-status-error mt-2 bg-status-error/10 px-2 py-1 rounded inline-block">{errorMsg}</p>}
        </div>
        <button
          onClick={handleTestEvent}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider gold-gradient text-obsidian-dark hover:shadow-[0_0_20px_rgba(242,201,76,0.3)] transition-all flex-shrink-0"
        >
          <Send className="w-4 h-4" />
          Transmit Test Packet
        </button>
      </div>

      {/* Security Label */}
      <div className="glass-card rounded-2xl p-5 border border-status-live/30 bg-status-live/5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-status-live" />
        <div className="flex items-start gap-4">
          <div className="p-2 bg-status-live/10 rounded-lg">
            <ShieldAlert className="w-6 h-6 text-status-live shrink-0" />
          </div>
          <div>
            <h4 className="text-sm font-black text-status-live uppercase tracking-wider">Protocol Enforced</h4>
            <p className="text-xs text-status-live/80 mt-1.5 leading-relaxed font-medium">
              Agent Receiver processes telemetry and health data only. Strict firewall active: NO API keys, NO customer PII, NO payment payloads are accepted.
            </p>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div className="glass-card rounded-2xl p-5 border border-cyan-signal/20 relative overflow-hidden" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-cyan-signal/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-cyan-signal" />
            <span className="text-[10px] font-bold text-obsidian-muted uppercase tracking-wider">Total Events</span>
          </div>
          <p className="text-2xl font-black text-white">{events.length}</p>
        </motion.div>
        
        <motion.div className="glass-card rounded-2xl p-5 border border-status-error/20 relative overflow-hidden" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-status-error/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-status-error" />
            <span className="text-[10px] font-bold text-obsidian-muted uppercase tracking-wider">Recent Errors</span>
          </div>
          <p className="text-2xl font-black text-status-error">{recentErrors.length}</p>
        </motion.div>
        
        <motion.div className="glass-card rounded-2xl p-5 border border-status-warning/20 relative overflow-hidden" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-status-warning/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-status-warning" />
            <span className="text-[10px] font-bold text-obsidian-muted uppercase tracking-wider">Critical Events</span>
          </div>
          <p className="text-2xl font-black text-status-warning">{criticalEvents.length}</p>
        </motion.div>
        
        <motion.div className="glass-card rounded-2xl p-5 border border-status-live/20 relative overflow-hidden" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-status-live/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-status-live" />
            <span className="text-[10px] font-bold text-obsidian-muted uppercase tracking-wider">Health Pings</span>
          </div>
          <p className="text-2xl font-black text-status-live">{healthData.length}</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Event Feed */}
        <div className="glass-card rounded-2xl p-6 flex flex-col h-[500px] border border-cyan-signal/10">
          <div className="flex items-center gap-3 mb-5 shrink-0 border-b border-obsidian-border pb-4">
            <div className="p-2 bg-cyan-signal/10 rounded-lg">
              <FileText className="w-5 h-5 text-cyan-signal" />
            </div>
            <h3 className="text-white font-black text-sm uppercase tracking-wider">Event Stream</h3>
          </div>
          <div className="flex-1 overflow-y-auto space-y-4 empire-scrollbar pr-2">
            {events.length === 0 ? (
              <p className="text-xs font-bold uppercase tracking-wider text-obsidian-muted text-center py-8 border border-dashed border-obsidian-border rounded-xl">Awaiting telemetry...</p>
            ) : (
              events.map((evt, i) => (
                <div key={evt.id || i} className="p-4 rounded-xl bg-obsidian-dark/50 border border-obsidian-border hover:border-cyan-signal/30 transition-all group relative overflow-hidden">
                  <div className="absolute left-0 top-0 w-1 h-full opacity-0 group-hover:opacity-100 transition-opacity bg-cyan-signal" />
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-white text-sm">{evt.websiteName}</span>
                    <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider border ${
                      evt.severity === 'Critical' ? 'text-status-error border-status-error bg-status-error/10' :
                      evt.severity === 'High' ? 'text-status-warning border-status-warning bg-status-warning/10' :
                      evt.severity === 'Medium' ? 'text-gold border-gold bg-gold/10' :
                      'text-cyan-signal border-cyan-signal bg-cyan-signal/10'
                    }`}>
                      {evt.severity}
                    </span>
                  </div>
                  <p className="text-cyan-signal font-bold text-xs uppercase tracking-wide">{evt.eventType}</p>
                  <p className="text-obsidian-muted text-xs mt-1.5 leading-relaxed">{evt.message}</p>
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-obsidian-border/50 text-[10px] font-bold text-obsidian-muted uppercase tracking-wider">
                    <span>{evt.page}</span>
                    <span>{new Date(evt.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Error Feed */}
        <div className="glass-card rounded-2xl p-6 flex flex-col h-[500px] border border-status-error/20">
          <div className="flex items-center gap-3 mb-5 shrink-0 border-b border-status-error/20 pb-4">
            <div className="p-2 bg-status-error/10 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-status-error" />
            </div>
            <h3 className="text-status-error font-black text-sm uppercase tracking-wider">Exception Stream</h3>
          </div>
          <div className="flex-1 overflow-y-auto space-y-4 empire-scrollbar pr-2">
            {errors.length === 0 ? (
              <p className="text-xs font-bold uppercase tracking-wider text-obsidian-muted text-center py-8 border border-dashed border-obsidian-border rounded-xl">No active anomalies.</p>
            ) : (
              errors.map((err, i) => (
                <div key={err.id || i} className="p-4 rounded-xl bg-status-error/5 border border-status-error/20 hover:bg-status-error/10 transition-all relative overflow-hidden">
                  <div className="absolute left-0 top-0 w-1 h-full bg-status-error" />
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-status-error text-sm">{err.websiteName}</span>
                    <span className="px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider border text-status-error border-status-error bg-status-error/10">
                      {err.severity}
                    </span>
                  </div>
                  <p className="text-white font-bold text-xs uppercase tracking-wide">{err.errorType}</p>
                  <p className="text-status-error/80 text-xs mt-1.5 leading-relaxed">{err.message}</p>
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-status-error/10 text-[10px] font-bold text-status-error/60 uppercase tracking-wider">
                    <span>{err.page}</span>
                    <span>{new Date(err.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Health Feed */}
      <div className="glass-card rounded-2xl p-6 border border-status-live/20">
        <div className="flex items-center gap-3 mb-6 border-b border-obsidian-border pb-4">
          <div className="p-2 bg-status-live/10 rounded-lg">
            <Server className="w-5 h-5 text-status-live" />
          </div>
          <h3 className="text-white font-black text-sm uppercase tracking-wider">Fleet Health Status</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {healthData.length === 0 ? (
            <p className="text-xs font-bold uppercase tracking-wider text-obsidian-muted col-span-full py-8 text-center border border-dashed border-obsidian-border rounded-xl">No health telemetry available.</p>
          ) : (
            healthData.map((h, i) => (
              <div key={h.id || i} className="p-4 rounded-xl bg-obsidian-dark/50 border border-obsidian-border flex flex-col justify-between hover:border-status-live/30 transition-all group relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-full h-1 ${
                  h.status === 'Healthy' ? 'bg-status-live' :
                  h.status === 'Warning' ? 'bg-status-warning' :
                  'bg-status-error'
                }`} />
                <div className="mb-3">
                  <h4 className="text-sm font-black text-white">{h.websiteName}</h4>
                  <p className="text-[10px] font-medium text-obsidian-muted mt-1 leading-relaxed line-clamp-2">{h.note || 'Nominal operation'}</p>
                </div>
                <div className="flex items-end justify-between border-t border-obsidian-border/50 pt-3">
                  <div>
                    <div className="text-[9px] font-bold text-obsidian-muted uppercase tracking-wider mb-0.5">Status</div>
                    <div className={`text-xs font-black uppercase tracking-wider ${
                      h.status === 'Healthy' ? 'text-status-live' :
                      h.status === 'Warning' ? 'text-status-warning' :
                      'text-status-error'
                    }`}>
                      {h.status}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[9px] font-bold text-obsidian-muted uppercase tracking-wider mb-0.5">
                      {new Date(h.lastPingAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                    <div className="text-xs font-mono font-bold text-white">
                      {h.healthScore}/100
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  )
}
