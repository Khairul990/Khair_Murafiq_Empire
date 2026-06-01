import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  CheckCircle, XCircle, Clock, AlertTriangle, Camera, Trash2, Plus, X, Loader2
} from 'lucide-react'
import monitoring from '../data/monitoring'
import { auth } from '../services/firebaseConfig'
import { storageAdapter } from '../services/storageAdapter'

export default function MonitoringPage() {
  const [scanning, setScanning] = useState(false)
  const [alerts, setAlerts] = useState([])
  const [projects, setProjects] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    projectId: '', alertType: 'Website Down', severity: 'High', message: '', status: 'New'
  })

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [a, p] = await Promise.all([
          storageAdapter.getAlerts(),
          storageAdapter.getProjects()
        ])
        setAlerts(a)
        setProjects(p)
      } catch (err) {
        setErrorMsg('Firebase unavailable. Showing local backup data.')
      }
      setIsLoading(false)
    }
    fetchData()
  }, [])

  const handleUpdateStatus = async (id, newStatus) => {
    const updatedAlert = { ...alerts.find(a => a.id === id), status: newStatus, updatedAt: new Date().toISOString() }
    const updatedAlerts = alerts.map(a => a.id === id ? updatedAlert : a)
    setAlerts(updatedAlerts)
    await storageAdapter.saveAlert(updatedAlert, updatedAlerts)
  }

  const handleDeleteAlert = async (id) => {
    if (!auth.currentUser || auth.currentUser.email !== 'khairul2052007@gmail.com') {
      alert("Access Denied: Owner login required for this dangerous action.")
      return
    }
    if (window.confirm("Are you sure you want to delete this alert?")) {
      const updatedAlerts = alerts.filter(a => a.id !== id)
      setAlerts(updatedAlerts)
      await storageAdapter.deleteAlert(id, updatedAlerts)
    }
  }

  const handleRunCheck = () => {
    setScanning(true)
    setTimeout(() => setScanning(false), 2000)
  }

  const handleSaveAlert = async (e) => {
    e.preventDefault()
    if (!formData.projectId) {
      alert('Please select a website')
      return
    }

    const selectedProject = projects.find(p => p.id === formData.projectId)
    
    const newAlert = {
      id: Date.now().toString(),
      projectId: formData.projectId,
      projectName: selectedProject ? selectedProject.name : 'Unknown',
      alertType: formData.alertType,
      severity: formData.severity,
      message: formData.message,
      status: formData.status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const newAlerts = [newAlert, ...alerts]
    setAlerts(newAlerts)
    setShowAddForm(false)
    setFormData({ projectId: '', alertType: 'Website Down', severity: 'High', message: '', status: 'New' })
    
    await storageAdapter.saveAlert(newAlert, newAlerts)
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
          Alert Center & <span className="gold-gradient-text">Monitoring</span>
          {isLoading && <Loader2 className="w-4 h-4 animate-spin text-gold" />}
        </h1>
        <p className="text-xs text-obsidian-muted mt-1">
          {isLoading ? 'Loading from Firebase...' : 'Real-time website monitoring and alert management'}
        </p>
        {errorMsg && <p className="text-[10px] text-status-error mt-1">{errorMsg}</p>}
      </div>

      {/* Status Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: Activity, label: 'Uptime', value: monitoring.uptime, color: 'text-status-live' },
          { icon: Shield, label: 'Deployment', value: monitoring.deploymentHealth, color: 'text-status-live' },
          { icon: Shield, label: 'Security', value: monitoring.securityStatus, color: 'text-status-live' },
          { icon: Gauge, label: 'Performance', value: `${monitoring.performanceScore}/100`, color: monitoring.performanceScore >= 80 ? 'text-status-live' : 'text-status-warning' },
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

      {/* Add Alert Form */}
      {showAddForm && (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="glass-card rounded-2xl p-5 border border-gold/20"
          onSubmit={handleSaveAlert}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-white">Create Manual Alert</h3>
            <button type="button" onClick={() => setShowAddForm(false)} className="text-obsidian-muted hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] text-obsidian-muted font-medium ml-1">Select Website *</label>
              <select required value={formData.projectId} onChange={e => setFormData({...formData, projectId: e.target.value})} className="w-full bg-obsidian-dark border border-obsidian-border rounded-xl px-3 py-2 text-sm text-white focus:border-gold/30 outline-none transition-colors">
                <option value="" disabled>Choose a project...</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-obsidian-muted font-medium ml-1">Alert Type</label>
              <select value={formData.alertType} onChange={e => setFormData({...formData, alertType: e.target.value})} className="w-full bg-obsidian-dark border border-obsidian-border rounded-xl px-3 py-2 text-sm text-white focus:border-gold/30 outline-none transition-colors">
                {['Website Down', 'Deploy Failed', 'Firebase Pending', 'Security Warning', 'User Problem', 'Payment Problem', 'Manual Note'].map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-obsidian-muted font-medium ml-1">Severity</label>
              <select value={formData.severity} onChange={e => setFormData({...formData, severity: e.target.value})} className="w-full bg-obsidian-dark border border-obsidian-border rounded-xl px-3 py-2 text-sm text-white focus:border-gold/30 outline-none transition-colors">
                {['Low', 'Medium', 'High', 'Critical'].map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-obsidian-muted font-medium ml-1">Initial Status</label>
              <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-obsidian-dark border border-obsidian-border rounded-xl px-3 py-2 text-sm text-white focus:border-gold/30 outline-none transition-colors">
                {['New', 'Seen', 'Fixed', 'Ignored'].map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div className="col-span-1 md:col-span-2 lg:col-span-4 space-y-1">
              <label className="text-[11px] text-obsidian-muted font-medium ml-1">Message / Description</label>
              <textarea required value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="w-full bg-obsidian-dark border border-obsidian-border rounded-xl px-3 py-2 text-sm text-white focus:border-gold/30 outline-none transition-colors h-16 resize-none" placeholder="Describe the warning or issue..."></textarea>
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <button type="submit" className="px-5 py-2.5 rounded-xl text-xs font-bold gold-gradient text-obsidian-dark hover:opacity-90 transition-all">
              Save Alert
            </button>
          </div>
        </motion.form>
      )}

      {/* Empire Alerts */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-status-warning" />
            <h3 className="text-white font-bold text-sm">Empire Alerts</h3>
            <span className="px-2 py-0.5 rounded-full bg-status-warning/10 text-status-warning text-[10px] font-bold">
              {alerts.length} Total
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-obsidian-dark text-white border border-obsidian-border hover:border-gold/50 transition-all"
            >
              {showAddForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              {showAddForm ? 'Close' : 'Add Alert'}
            </button>
          </div>
        </div>

        {alerts.length === 0 ? (
          <div className="text-center py-8 bg-obsidian-dark/50 rounded-xl border border-obsidian-border">
            <CheckCircle className="w-10 h-10 text-status-live/50 mx-auto mb-2" />
            <p className="text-xs font-bold text-white">All systems secure</p>
            <p className="text-[10px] text-obsidian-muted">No active alerts found across the empire.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className="p-4 rounded-xl bg-obsidian-card/50 border border-obsidian-border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:bg-obsidian-card">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase tracking-wider ${
                      alert.severity === 'Critical' ? 'text-status-error bg-status-error/10 border-status-error/30 animate-pulse' :
                      alert.severity === 'High' ? 'text-orange-400 bg-orange-400/10 border-orange-400/30' :
                      alert.severity === 'Medium' ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30' :
                      'text-blue-400 bg-blue-400/10 border-blue-400/30'
                    }`}>
                      {alert.severity}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase tracking-wider ${
                      alert.status === 'Fixed' ? 'text-status-live bg-status-live/10 border-status-live/30' :
                      alert.status === 'Ignored' ? 'text-obsidian-muted bg-obsidian-light border-obsidian-border' :
                      alert.status === 'Seen' ? 'text-blue-400 bg-blue-400/10 border-blue-400/30' :
                      'text-status-warning bg-status-warning/10 border-status-warning/30'
                    }`}>
                      {alert.status}
                    </span>
                    <span className="text-xs font-bold text-white ml-2 flex items-center gap-1">
                      {alert.projectName}
                    </span>
                  </div>
                  <p className="text-sm text-gold font-bold mb-1">{alert.alertType}</p>
                  <p className="text-xs text-obsidian-muted leading-relaxed max-w-2xl">{alert.message}</p>
                  <p className="text-[10px] text-obsidian-muted/50 mt-2 font-mono">ID: {alert.id} | Added: {new Date(alert.createdAt).toLocaleString()}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2 md:flex-col md:items-end md:gap-2">
                  <div className="flex gap-2">
                    {alert.status !== 'Fixed' && (
                      <button onClick={() => handleUpdateStatus(alert.id, 'Fixed')} className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-status-live/10 text-status-live border border-status-live/20 hover:bg-status-live hover:text-obsidian-dark transition-all">
                        Mark Fixed
                      </button>
                    )}
                    {alert.status === 'New' && (
                      <button onClick={() => handleUpdateStatus(alert.id, 'Seen')} className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500 hover:text-white transition-all">
                        Mark Seen
                      </button>
                    )}
                    {alert.status !== 'Ignored' && alert.status !== 'Fixed' && (
                      <button onClick={() => handleUpdateStatus(alert.id, 'Ignored')} className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-obsidian-light text-obsidian-muted border border-obsidian-border hover:text-white transition-all">
                        Ignore
                      </button>
                    )}
                  </div>
                  <button onClick={() => handleDeleteAlert(alert.id)} className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-status-error/10 text-status-error border border-status-error/20 hover:bg-status-error hover:text-white transition-all flex items-center gap-1 mt-1 md:mt-0">
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
