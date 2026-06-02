import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Shield, ShieldAlert, Activity, AlertTriangle, CheckCircle, Clock, Server, FileText, Send } from 'lucide-react'
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
      className="space-y-5"
    >
      {/* Header */}
      <div>
        <h1 className="text-xl lg:text-2xl font-extrabold text-white flex items-center gap-2">
          Website Agent <span className="gold-gradient-text">Receiver</span>
        </h1>
        <p className="text-xs text-obsidian-muted mt-1">
          Secure central receiver for all connected website agents.
        </p>
        {errorMsg && <p className="text-[10px] text-status-error mt-1">{errorMsg}</p>}
      </div>

      {/* Security Label */}
      <div className="glass-card rounded-xl p-4 border border-status-live/20 bg-status-live/5">
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-status-live shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-status-live">Security Rule Enforced</h4>
            <p className="text-xs text-status-live/80 mt-1 leading-relaxed">
              Website Agent accepts safe metadata only. Never send passwords, API keys, customer private data, or payment full data.
            </p>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <motion.div className="glass-card rounded-2xl p-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-gold" />
            <span className="text-xs text-obsidian-muted">Total Events</span>
          </div>
          <p className="text-lg font-extrabold text-white">{events.length}</p>
        </motion.div>
        <motion.div className="glass-card rounded-2xl p-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-status-error" />
            <span className="text-xs text-obsidian-muted">Recent Errors</span>
          </div>
          <p className="text-lg font-extrabold text-status-error">{recentErrors.length}</p>
        </motion.div>
        <motion.div className="glass-card rounded-2xl p-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-status-warning" />
            <span className="text-xs text-obsidian-muted">Critical Events</span>
          </div>
          <p className="text-lg font-extrabold text-status-warning">{criticalEvents.length}</p>
        </motion.div>
        <motion.div className="glass-card rounded-2xl p-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-obsidian-muted">Health Pings</span>
          </div>
          <p className="text-lg font-extrabold text-blue-400">{healthData.length}</p>
        </motion.div>
      </div>

      {/* Action Bar */}
      <div className="flex justify-end">
        <button
          onClick={handleTestEvent}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold gold-gradient text-obsidian-dark hover:opacity-90 transition-all"
        >
          <Send className="w-4 h-4" />
          Send Test Agent Event
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Event Feed */}
        <div className="glass-card rounded-2xl p-5 flex flex-col h-[500px]">
          <div className="flex items-center gap-2 mb-4 shrink-0">
            <FileText className="w-5 h-5 text-gold" />
            <h3 className="text-white font-bold text-sm">Event Feed</h3>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 empire-scrollbar pr-2">
            {events.length === 0 ? (
              <p className="text-xs text-obsidian-muted text-center py-4">No events received.</p>
            ) : (
              events.map((evt, i) => (
                <div key={evt.id || i} className="p-3 rounded-xl bg-obsidian-dark/50 border border-obsidian-border text-xs">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-white">{evt.websiteName}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                      evt.severity === 'Critical' ? 'text-status-error border-status-error' :
                      evt.severity === 'High' ? 'text-orange-400 border-orange-400' :
                      evt.severity === 'Medium' ? 'text-yellow-400 border-yellow-400' :
                      'text-status-live border-status-live'
                    }`}>
                      {evt.severity}
                    </span>
                  </div>
                  <p className="text-gold font-medium">{evt.eventType}</p>
                  <p className="text-obsidian-muted mt-1">{evt.message}</p>
                  <div className="flex justify-between items-center mt-2 text-[10px] text-obsidian-muted/50">
                    <span>Page: {evt.page}</span>
                    <span>{new Date(evt.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Error Feed */}
        <div className="glass-card rounded-2xl p-5 flex flex-col h-[500px]">
          <div className="flex items-center gap-2 mb-4 shrink-0">
            <AlertTriangle className="w-5 h-5 text-status-error" />
            <h3 className="text-white font-bold text-sm">Error Feed</h3>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 empire-scrollbar pr-2">
            {errors.length === 0 ? (
              <p className="text-xs text-obsidian-muted text-center py-4">No errors received.</p>
            ) : (
              errors.map((err, i) => (
                <div key={err.id || i} className="p-3 rounded-xl bg-status-error/5 border border-status-error/20 text-xs">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-status-error">{err.websiteName}</span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold border text-status-error border-status-error">
                      {err.severity}
                    </span>
                  </div>
                  <p className="text-white font-medium">{err.errorType}</p>
                  <p className="text-obsidian-muted mt-1">{err.message}</p>
                  <div className="flex justify-between items-center mt-2 text-[10px] text-obsidian-muted/50">
                    <span>Page: {err.page}</span>
                    <span>{new Date(err.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Health Feed */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Server className="w-5 h-5 text-blue-400" />
          <h3 className="text-white font-bold text-sm">Health Feed</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {healthData.length === 0 ? (
            <p className="text-xs text-obsidian-muted col-span-full py-2">No health data received.</p>
          ) : (
            healthData.map((h, i) => (
              <div key={h.id || i} className="p-3 rounded-xl bg-obsidian-dark/50 border border-obsidian-border flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">{h.websiteName}</h4>
                  <p className="text-[10px] text-obsidian-muted mt-0.5">{h.note || 'No notes'}</p>
                </div>
                <div className="text-right">
                  <div className={`text-xs font-bold ${
                    h.status === 'Healthy' ? 'text-status-live' :
                    h.status === 'Warning' ? 'text-status-warning' :
                    'text-status-error'
                  }`}>
                    {h.status}
                  </div>
                  <div className="text-[10px] text-obsidian-muted/50 mt-1">
                    Score: {h.healthScore} | {new Date(h.lastPingAt).toLocaleTimeString()}
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
