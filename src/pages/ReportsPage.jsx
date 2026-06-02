import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileText, Download, Calendar, Activity, Globe, Share2, DollarSign, ListChecks, Shield, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react'
import { storageAdapter } from '../services/storageAdapter'

export default function ReportsPage() {
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [alerts, setAlerts] = useState([])
  const [reports, setReports] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [timeFilter, setTimeFilter] = useState('All Time')

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [p, t, a, r] = await Promise.all([
          storageAdapter.getProjects(),
          storageAdapter.getTasks(),
          storageAdapter.getAlerts(),
          storageAdapter.getReports()
        ])
        setProjects(p)
        setTasks(t)
        setAlerts(a)
        setReports(r || [])
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

  // Pre-filter arrays based on timeFilter where applicable
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

  const currentMonth = new Date().toISOString().slice(0, 7)
  const thisMonthIncome = reports
    .filter(r => (r.docType === 'finance_entry' || r.amount !== undefined) && r.type === 'income' && (r.date || '').startsWith(currentMonth))
    .reduce((sum, r) => sum + Number(r.amount), 0)
    
  const plannedSocialPosts = reports
    .filter(r => r.docType === 'social_post' || (r.platform && r.caption))
    .length

  const summaryCards = [
    { title: 'Total Projects', value: projects.length, icon: Globe, color: 'text-blue-400' },
    { title: 'Healthy Websites', value: healthyProjects.length, icon: CheckCircle, color: 'text-status-live' },
    { title: 'Warning/Error Sites', value: warningProjects.length, icon: AlertTriangle, color: 'text-status-error' },
    { title: 'Active Alerts', value: activeAlerts.length, icon: Activity, color: 'text-status-warning' },
    { title: 'Pending Directives', value: pendingTasks.length, icon: ListChecks, color: 'text-cyan-signal' },
    { title: 'Completed Directives', value: completedTasks.length, icon: FileText, color: 'text-purple-400' },
    { title: 'MTD Revenue', value: `$${thisMonthIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: DollarSign, color: 'text-gold' },
    { title: 'Social Posts Planned', value: plannedSocialPosts, icon: Share2, color: 'text-obsidian-muted' }
  ]

  const handleDownloadPDF = () => {
    alert("PDF Generation module is not yet connected.")
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-20"
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-3xl font-extrabold text-white flex items-center gap-3">
            Intelligence <span className="gold-gradient-text">Reports</span>
            {isLoading && <Loader2 className="w-5 h-5 animate-spin text-gold" />}
          </h1>
          <p className="text-xs text-obsidian-muted mt-1 uppercase tracking-widest font-bold">
            {isLoading ? 'Syncing Intelligence Data...' : 'Generate and view analytics across the empire'}
          </p>
          {errorMsg && <p className="text-[10px] text-status-error mt-2 bg-status-error/10 px-2 py-1 rounded inline-block">{errorMsg}</p>}
        </div>
        
        <div className="flex gap-2 bg-obsidian-dark/50 p-1.5 rounded-xl border border-obsidian-border flex-wrap overflow-x-auto empire-scrollbar">
          {['Today', 'This Week', 'This Month', 'All Time'].map(f => (
            <button
              key={f}
              onClick={() => setTimeFilter(f)}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                timeFilter === f ? 'bg-gold/10 text-gold border border-gold/30 shadow-[0_0_10px_rgba(242,201,76,0.1)]' : 'text-obsidian-muted hover:bg-obsidian-card border border-transparent'
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
            className="glass-card rounded-2xl p-5 flex flex-col justify-between border border-obsidian-border hover:border-gold/30 transition-all group relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-obsidian-muted/20 group-hover:bg-gold/50 transition-colors" />
            <div className="pl-3">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[9px] font-black uppercase tracking-wider text-obsidian-muted">{c.title}</span>
                <c.icon className={`w-4 h-4 ${c.color}`} />
              </div>
              <div>
                <p className={`text-2xl font-black tracking-tight ${c.color}`}>{c.value}</p>
                {c.note && <p className="text-[9px] font-bold uppercase tracking-wider text-obsidian-muted mt-2">{c.note}</p>}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Website-wise Report Table */}
      <div className="glass-card rounded-2xl p-6 overflow-hidden border border-gold/20 relative">
        <div className="absolute top-0 left-0 w-full h-1 gold-gradient" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-3">
            <Shield className="w-5 h-5 text-gold" />
            Asset Health Matrix
          </h3>
          <button onClick={handleDownloadPDF} className="flex items-center justify-center gap-2 px-4 py-2 bg-obsidian-dark text-[10px] font-black uppercase tracking-wider text-white rounded-xl border border-obsidian-border hover:border-gold/50 transition-all">
            <Download className="w-4 h-4" /> Export Report
          </button>
        </div>

        <div className="overflow-x-auto empire-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-obsidian-border/50 text-[9px] uppercase tracking-widest text-obsidian-muted">
                <th className="pb-4 pr-4 font-black">Asset Identifier</th>
                <th className="pb-4 px-4 font-black">Status</th>
                <th className="pb-4 px-4 font-black">Score</th>
                <th className="pb-4 px-4 font-black text-center">Active Alerts</th>
                <th className="pb-4 px-4 font-black text-center">Pending Directives</th>
                <th className="pb-4 px-4 font-black">Last Sync</th>
                <th className="pb-4 pl-4 font-black">Telemetry Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-obsidian-border/30">
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
                  
                const hBg = 
                  computedHealth === 'Healthy' ? 'bg-status-live/10' :
                  computedHealth === 'Warning' ? 'bg-status-warning/10' :
                  computedHealth === 'Error' ? 'bg-status-error/10' : 'bg-obsidian-dark/50'

                return (
                  <tr key={p.id} className="hover:bg-obsidian-dark/50 transition-colors group">
                    <td className="py-4 pr-4 text-xs font-bold text-white whitespace-nowrap group-hover:text-gold transition-colors">{p.name}</td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider ${hColor} ${hBg} border border-transparent`}>
                        {computedHealth}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-xs font-black text-gold whitespace-nowrap">{p.healthScore ?? '-'}</td>
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-black ${pAlerts.length > 0 ? 'bg-status-warning/10 text-status-warning border border-status-warning/30 shadow-[0_0_10px_rgba(249,115,22,0.2)]' : 'bg-obsidian-dark/50 text-obsidian-muted border border-obsidian-border'}`}>
                        {pAlerts.length}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-black ${pTasks.length > 0 ? 'bg-cyan-signal/10 text-cyan-signal border border-cyan-signal/30 shadow-[0_0_10px_rgba(6,182,212,0.2)]' : 'bg-obsidian-dark/50 text-obsidian-muted border border-obsidian-border'}`}>
                        {pTasks.length}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-[10px] font-bold uppercase tracking-wider text-obsidian-muted whitespace-nowrap">{p.lastCheckedAt ? new Date(p.lastCheckedAt).toLocaleDateString() : 'N/A'}</td>
                    <td className="py-4 pl-4 text-obsidian-muted text-[10px] font-medium max-w-[200px] truncate leading-relaxed" title={p.issueSummary || p.uptimeNote || p.notes}>
                      {p.issueSummary || p.uptimeNote || p.notes || '-'}
                    </td>
                  </tr>
                )
              })}
              {projects.length === 0 && !isLoading && (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-obsidian-muted border-t border-obsidian-border border-dashed">
                    <p className="text-[10px] font-black uppercase tracking-wider">No Asset Telemetry Available</p>
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
