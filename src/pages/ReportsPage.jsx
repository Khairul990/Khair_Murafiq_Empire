import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileText, Download, Calendar, Activity, Globe, Share2, DollarSign, ListChecks, Shield, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react'
import { storageAdapter } from '../services/storageAdapter'

export default function ReportsPage() {
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [alerts, setAlerts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [timeFilter, setTimeFilter] = useState('All Time')

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [p, t, a] = await Promise.all([
          storageAdapter.getProjects(),
          storageAdapter.getTasks(),
          storageAdapter.getAlerts()
        ])
        setProjects(p)
        setTasks(t)
        setAlerts(a)
      } catch (err) {
        setErrorMsg('Firebase unavailable. Local fallback active.')
      }
      setIsLoading(false)
    }
    fetchData()
  }, [])

  const filterByTime = (dateString) => {
    if (!dateString) return false
    if (timeFilter === 'All Time') return true
    const date = new Date(dateString)
    const now = new Date()
    if (timeFilter === 'Today') {
      return date.toDateString() === now.toDateString()
    }
    if (timeFilter === 'This Week') {
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - now.getDay())
      return date >= startOfWeek
    }
    if (timeFilter === 'This Month') {
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
    }
    return true
  }

  // Pre-filter arrays based on timeFilter where applicable (e.g., tasks updated, alerts created)
  // For the main dashboard counts, we might just filter everything. 
  // However, project health is current state, so we don't time-filter projects themselves easily.
  // We'll apply time filters mostly to alerts and tasks.
  const filteredTasks = tasks.filter(t => filterByTime(t.updatedAt || t.id))
  const filteredAlerts = alerts.filter(a => filterByTime(a.createdAt))

  const activeAlerts = filteredAlerts.filter(a => a.status !== 'Fixed' && a.status !== 'Ignored')
  const pendingTasks = filteredTasks.filter(t => t.status !== 'Done')
  const completedTasks = filteredTasks.filter(t => t.status === 'Done')

  const healthyProjects = projects.filter(p => {
    const pAlerts = activeAlerts.filter(a => a.projectId === p.id)
    const hasCritical = pAlerts.some(a => a.severity === 'Critical')
    return p.healthStatus === 'Healthy' && !hasCritical
  })

  const warningProjects = projects.filter(p => {
    const pAlerts = activeAlerts.filter(a => a.projectId === p.id)
    const hasCritical = pAlerts.some(a => a.severity === 'Critical')
    return hasCritical || p.healthStatus === 'Warning' || p.healthStatus === 'Error'
  })

  const summaryCards = [
    { title: 'Total Projects', value: projects.length, icon: Globe, color: 'text-blue-400' },
    { title: 'Healthy Websites', value: healthyProjects.length, icon: CheckCircle, color: 'text-status-live' },
    { title: 'Warning/Error Sites', value: warningProjects.length, icon: AlertTriangle, color: 'text-status-error' },
    { title: 'Active Alerts', value: activeAlerts.length, icon: Activity, color: 'text-status-warning' },
    { title: 'Pending Tasks', value: pendingTasks.length, icon: ListChecks, color: 'text-status-dev' },
    { title: 'Completed Tasks', value: completedTasks.length, icon: FileText, color: 'text-purple-400' },
    { title: 'This Month Income', value: '$0.00', icon: DollarSign, color: 'text-gold', note: 'Module pending' },
    { title: 'Social Posts Planned', value: '0', icon: Share2, color: 'text-obsidian-muted', note: 'Module pending' }
  ]

  const handleDownloadPDF = () => {
    alert("PDF Generation module is not yet connected.")
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-extrabold text-white flex items-center gap-2">
            Reports <span className="gold-gradient-text">Center</span>
            {isLoading && <Loader2 className="w-4 h-4 animate-spin text-gold" />}
          </h1>
          <p className="text-xs text-obsidian-muted mt-1">
            {isLoading ? 'Loading from Firebase...' : 'Generate and view analytics across the empire'}
          </p>
          {errorMsg && <p className="text-[10px] text-status-error mt-1">{errorMsg}</p>}
        </div>
        
        <div className="flex gap-2 bg-obsidian-card p-1.5 rounded-xl border border-obsidian-border flex-wrap">
          {['Today', 'This Week', 'This Month', 'All Time'].map(f => (
            <button
              key={f}
              onClick={() => setTimeFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                timeFilter === f ? 'bg-gold/10 text-gold' : 'text-obsidian-muted hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((c, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card-hover rounded-2xl p-4 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-obsidian-muted">{c.title}</span>
              <c.icon className={`w-4 h-4 ${c.color}`} />
            </div>
            <div>
              <p className={`text-xl font-extrabold ${c.color}`}>{c.value}</p>
              {c.note && <p className="text-[9px] text-obsidian-muted mt-1">{c.note}</p>}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Website-wise Report Table */}
      <div className="glass-card rounded-2xl p-5 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-gold" />
            Website Health Report
          </h3>
          <button onClick={handleDownloadPDF} className="flex items-center gap-1.5 px-3 py-1.5 bg-obsidian-dark text-xs text-white rounded-lg border border-obsidian-border hover:border-gold/30 transition-all">
            <Download className="w-3.5 h-3.5" /> Export PDF
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-obsidian-border text-[10px] uppercase tracking-wider text-obsidian-muted">
                <th className="pb-3 pr-4 font-semibold">Website</th>
                <th className="pb-3 px-4 font-semibold">Health</th>
                <th className="pb-3 px-4 font-semibold">Score</th>
                <th className="pb-3 px-4 font-semibold text-center">Alerts</th>
                <th className="pb-3 px-4 font-semibold text-center">Tasks</th>
                <th className="pb-3 px-4 font-semibold">Last Checked</th>
                <th className="pb-3 pl-4 font-semibold">Notes / Issues</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-obsidian-border">
              {projects.map(p => {
                const pAlerts = activeAlerts.filter(a => a.projectId === p.id)
                const pTasks = pendingTasks.filter(t => t.projectId === p.id)
                
                let computedHealth = p.healthStatus || 'Unknown'
                if (pAlerts.some(a => a.severity === 'Critical')) computedHealth = 'Error'
                else if (pAlerts.some(a => a.severity === 'High')) computedHealth = 'Warning'

                const hColor = 
                  computedHealth === 'Healthy' ? 'text-status-live' :
                  computedHealth === 'Warning' ? 'text-status-warning' :
                  computedHealth === 'Error' ? 'text-status-error' : 'text-obsidian-muted'

                return (
                  <tr key={p.id} className="text-xs hover:bg-obsidian-dark/30 transition-colors">
                    <td className="py-3 pr-4 font-bold text-white whitespace-nowrap">{p.name}</td>
                    <td className={`py-3 px-4 font-bold ${hColor} whitespace-nowrap`}>{computedHealth}</td>
                    <td className="py-3 px-4 text-gold whitespace-nowrap">{p.healthScore ?? '-'}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${pAlerts.length > 0 ? 'bg-status-warning/10 text-status-warning' : 'bg-obsidian-dark text-obsidian-muted'}`}>
                        {pAlerts.length}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${pTasks.length > 0 ? 'bg-status-dev/10 text-status-dev' : 'bg-obsidian-dark text-obsidian-muted'}`}>
                        {pTasks.length}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-obsidian-muted whitespace-nowrap">{p.lastCheckedAt ? new Date(p.lastCheckedAt).toLocaleDateString() : 'N/A'}</td>
                    <td className="py-3 pl-4 text-obsidian-muted text-[11px] max-w-[200px] truncate" title={p.issueSummary || p.uptimeNote || p.notes}>
                      {p.issueSummary || p.uptimeNote || p.notes || '-'}
                    </td>
                  </tr>
                )
              })}
              {projects.length === 0 && !isLoading && (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-obsidian-muted text-xs">
                    No website data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  )
}
