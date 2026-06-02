import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  FolderKanban, Globe, AlertTriangle, ListChecks,
  DollarSign, Activity, ShieldCheck, Loader2, Radar, Server, Heart, CloudOff
} from 'lucide-react'
import { storageAdapter } from '../services/storageAdapter'

export default function DashboardPage() {
  const navigate = useNavigate()
  
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [alerts, setAlerts] = useState([])
  const [reports, setReports] = useState([])
  const [agentEvents, setAgentEvents] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [p, t, a, r, e] = await Promise.all([
          storageAdapter.getProjects(),
          storageAdapter.getTasks(),
          storageAdapter.getAlerts(),
          storageAdapter.getReports(),
          storageAdapter.getWebsiteEvents()
        ])
        setProjects(p || [])
        setTasks(t || [])
        setAlerts(a || [])
        setReports(r || [])
        setAgentEvents(e || [])
      } catch (err) {
        console.error("Dashboard data fetch error:", err)
      }
      setIsLoading(false)
    }
    fetchData()
  }, [])

  // Calculate Real Metrics
  const liveWebsites = projects.filter(p => p.status === 'Live')
  const activeAlerts = alerts.filter(a => a.status !== 'Fixed' && a.status !== 'Ignored')
  const criticalAlerts = activeAlerts.filter(a => a.severity === 'Critical')
  const pendingTasks = tasks.filter(t => t.status !== 'Done')
  const urgentTasks = pendingTasks.filter(t => t.priority === 'High')
  
  const estimatedIncome = reports
    .filter(r => r.type === 'income')
    .reduce((sum, r) => sum + (Number(r.amount) || 0), 0)

  // Health calculation
  const projectsWithScore = projects.filter(p => p.healthScore !== undefined)
  const averageHealth = projectsWithScore.length > 0 
    ? Math.round(projectsWithScore.reduce((sum, p) => sum + p.healthScore, 0) / projectsWithScore.length)
    : 100 // Fallback

  const empireStatus = criticalAlerts.length > 0 ? 'Critical' : (activeAlerts.length > 0 ? 'Warning' : 'Safe')

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  }
  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 pb-20">
      {/* Page Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-3xl font-extrabold text-white flex items-center gap-3">
            Empire <span className="gold-gradient-text">Command Center</span>
          </h1>
          <p className="text-xs text-obsidian-muted mt-1 uppercase tracking-widest font-bold">
            Real Data Active <span className="text-status-live px-1">•</span> Global View
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-2 ${
            empireStatus === 'Safe' ? 'bg-status-live/10 text-status-live border border-status-live/20 shadow-[0_0_15px_rgba(34,197,94,0.15)]' :
            empireStatus === 'Warning' ? 'bg-status-warning/10 text-status-warning border border-status-warning/20 shadow-[0_0_15px_rgba(234,179,8,0.15)]' :
            'bg-status-error/10 text-status-error border border-status-error/20 shadow-[0_0_15px_rgba(239,68,68,0.15)] animate-pulse'
          }`}>
            <ShieldCheck className="w-4 h-4" />
            Status: {empireStatus}
          </div>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-gold animate-spin" /></div>
      ) : (
        <>
          {/* Section 1: Empire Status Hero Board */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'Total Websites', value: projects.length, icon: Globe, color: 'text-blue-400', onClick: () => navigate('/projects') },
              { label: 'Live Projects', value: liveWebsites.length, icon: Activity, color: 'text-status-live', onClick: () => navigate('/projects') },
              { label: 'Active Alerts', value: activeAlerts.length, icon: AlertTriangle, color: activeAlerts.length > 0 ? 'text-status-error' : 'text-obsidian-muted', onClick: () => navigate('/monitoring') },
              { label: 'Pending Tasks', value: pendingTasks.length, icon: ListChecks, color: 'text-gold', onClick: () => navigate('/tasks') },
              { label: 'Agent Events', value: agentEvents.length, icon: Radar, color: 'text-cyan-signal', onClick: () => navigate('/website-agent') },
              { label: 'Est. Income', value: `$${estimatedIncome}`, icon: DollarSign, color: 'text-status-live', onClick: () => navigate('/finance') },
            ].map((stat, i) => (
              <div key={i} onClick={stat.onClick} className="glass-card rounded-2xl p-4 flex flex-col justify-between cursor-pointer glass-card-hover group border border-obsidian-border">
                <div className="flex justify-between items-start mb-2">
                  <stat.icon className={`w-5 h-5 ${stat.color} transition-transform group-hover:scale-110`} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white">{stat.value}</h3>
                  <p className="text-[10px] text-obsidian-muted uppercase font-bold tracking-wider mt-1">{stat.label}</p>
                </div>
              </div>
            ))}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Section 2: Empire Live Command Map */}
            <motion.div variants={itemVariants} className="lg:col-span-2 glass-card rounded-2xl p-5 border border-obsidian-border relative overflow-hidden flex flex-col">
              <div className="absolute inset-0 bg-empire-pattern opacity-50 pointer-events-none" />
              <div className="flex items-center justify-between mb-4 relative z-10">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-widest">
                  <Radar className="w-4 h-4 text-cyan-signal" /> Live Command Map
                </h3>
              </div>
              
              <div className="flex-1 min-h-[300px] relative flex items-center justify-center bg-obsidian-dark/50 rounded-xl border border-obsidian-border/50">
                {projects.length === 0 ? (
                  <div className="text-center p-6">
                    <CloudOff className="w-10 h-10 text-obsidian-muted/30 mx-auto mb-3" />
                    <p className="text-xs text-obsidian-muted font-medium">No connected websites yet.<br/>Add your first website from Website Control.</p>
                  </div>
                ) : (
                  <div className="relative w-full h-full max-w-lg aspect-square">
                    {/* Core Node */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full gold-gradient shadow-[0_0_30px_rgba(242,201,76,0.3)] flex items-center justify-center z-20 border-2 border-white/20">
                      <Crown className="w-6 h-6 text-obsidian-dark" />
                    </div>
                    
                    {/* Project Nodes Orbiting */}
                    {projects.slice(0, 8).map((project, i) => {
                      const total = Math.min(projects.length, 8)
                      const angle = (i * (360 / total)) * (Math.PI / 180)
                      const radius = 120
                      const x = Math.cos(angle) * radius
                      const y = Math.sin(angle) * radius
                      
                      const isLive = project.status === 'Live'
                      const hasAlert = activeAlerts.some(a => a.projectId === project.id)
                      const nodeColor = hasAlert ? 'bg-status-error shadow-[0_0_15px_rgba(239,68,68,0.4)]' : (isLive ? 'bg-cyan-signal shadow-[0_0_15px_rgba(6,182,212,0.4)]' : 'bg-obsidian-muted')

                      return (
                        <div key={project.id}>
                          {/* Connection Line */}
                          <svg className="absolute top-1/2 left-1/2 overflow-visible z-0 pointer-events-none" style={{ transform: 'translate(-50%, -50%)' }}>
                            <line x1="0" y1="0" x2={x} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                            {isLive && !hasAlert && (
                              <line x1="0" y1="0" x2={x} y2={y} stroke="#06b6d4" strokeWidth="2" strokeDasharray="4 8" className="animate-signal-pulse" />
                            )}
                          </svg>
                          
                          {/* Node */}
                          <div 
                            className={`absolute w-3 h-3 rounded-full z-10 -ml-1.5 -mt-1.5 transition-transform hover:scale-150 cursor-pointer ${nodeColor}`}
                            style={{ top: `calc(50% + ${y}px)`, left: `calc(50% + ${x}px)` }}
                            title={`${project.name} - ${project.status}`}
                            onClick={() => navigate('/projects')}
                          />
                          
                          {/* Label */}
                          <div 
                            className="absolute z-10 text-[9px] font-bold text-white/70 whitespace-nowrap bg-obsidian-dark/80 px-1.5 py-0.5 rounded border border-obsidian-border pointer-events-none"
                            style={{ top: `calc(50% + ${y + 12}px)`, left: `calc(50% + ${x}px)`, transform: 'translateX(-50%)' }}
                          >
                            {project.name}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </motion.div>

            <div className="space-y-6">
              {/* Section 4: Empire Health Ring */}
              <motion.div variants={itemVariants} className="glass-card rounded-2xl p-5 border border-obsidian-border text-center">
                <h3 className="text-xs font-bold text-obsidian-muted uppercase tracking-widest mb-4">Empire Health</h3>
                <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                    <circle 
                      cx="50" cy="50" r="45" fill="none" 
                      stroke={averageHealth > 80 ? '#22c55e' : averageHealth > 50 ? '#eab308' : '#ef4444'} 
                      strokeWidth="8" strokeDasharray="283" strokeDashoffset={283 - (283 * averageHealth) / 100}
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-white">{averageHealth}%</span>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-[9px] font-bold uppercase text-obsidian-muted">
                  <div className="bg-obsidian-dark py-1.5 rounded border border-obsidian-border">Sec: Safe</div>
                  <div className="bg-obsidian-dark py-1.5 rounded border border-obsidian-border">Sync: Active</div>
                </div>
              </motion.div>

              {/* Section 3: Critical Focus Panel */}
              <motion.div variants={itemVariants} className="glass-card rounded-2xl p-5 border border-obsidian-border">
                <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-status-warning" /> Critical Focus
                </h3>
                {criticalAlerts.length === 0 && urgentTasks.length === 0 ? (
                  <div className="p-4 rounded-xl bg-status-live/10 border border-status-live/20 text-center">
                    <Heart className="w-6 h-6 text-status-live mx-auto mb-2" />
                    <p className="text-xs text-status-live font-bold">সব শান্ত ও সুরক্ষিত আছে, আলহামদুলিল্লাহ।</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {criticalAlerts.slice(0, 2).map((a, i) => (
                      <div key={i} className="p-2.5 rounded-lg bg-status-error/10 border border-status-error/20 flex flex-col">
                        <span className="text-[10px] font-bold text-status-error uppercase mb-0.5">Critical Alert</span>
                        <span className="text-xs text-white truncate">{a.title}</span>
                      </div>
                    ))}
                    {urgentTasks.slice(0, 2).map((t, i) => (
                      <div key={i} className="p-2.5 rounded-lg bg-status-warning/10 border border-status-warning/20 flex flex-col">
                        <span className="text-[10px] font-bold text-status-warning uppercase mb-0.5">Urgent Task</span>
                        <span className="text-xs text-white truncate">{t.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Section 6: Website Quick Grid */}
            <motion.div variants={itemVariants} className="lg:col-span-2 glass-card rounded-2xl p-5 border border-obsidian-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-widest">
                  <Server className="w-4 h-4 text-gold" /> Live Operations Quick Grid
                </h3>
                <button onClick={() => navigate('/projects')} className="text-[10px] text-gold hover:underline font-bold uppercase">View All</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {projects.slice(0, 4).map(project => {
                  const pAlerts = activeAlerts.filter(a => a.projectId === project.id).length
                  const pEvents = agentEvents.filter(e => e.websiteId === project.websiteId).length
                  return (
                    <div key={project.id} className="p-3 rounded-xl bg-obsidian-dark border border-obsidian-border hover:border-gold/30 transition-colors flex flex-col justify-between">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="text-xs font-bold text-white truncate w-32 sm:w-40">{project.name}</h4>
                          <span className={`text-[9px] font-bold uppercase ${project.status === 'Live' ? 'text-cyan-signal' : 'text-obsidian-muted'}`}>{project.status}</span>
                        </div>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-obsidian-card border border-obsidian-border">{project.healthScore || 100}%</span>
                      </div>
                      <div className="flex gap-2 text-[9px] font-bold uppercase mt-2">
                        <span className={`px-1.5 py-0.5 rounded ${pAlerts > 0 ? 'bg-status-error/10 text-status-error' : 'bg-obsidian-card text-obsidian-muted'}`}>
                          {pAlerts} Alerts
                        </span>
                        <span className={`px-1.5 py-0.5 rounded ${pEvents > 0 ? 'bg-blue-400/10 text-blue-400' : 'bg-obsidian-card text-obsidian-muted'}`}>
                          {pEvents} Events
                        </span>
                      </div>
                    </div>
                  )
                })}
                {projects.length === 0 && (
                  <div className="col-span-2 text-center py-8 text-xs text-obsidian-muted">No websites connected.</div>
                )}
              </div>
            </motion.div>

            {/* Section 5: Activity Radar */}
            <motion.div variants={itemVariants} className="glass-card rounded-2xl p-5 border border-obsidian-border flex flex-col">
              <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2 mb-4">
                <Activity className="w-4 h-4 text-blue-400" /> Activity Radar
              </h3>
              <div className="flex-1 overflow-y-auto pr-2 empire-scrollbar max-h-[250px] space-y-3">
                {[...agentEvents]
                  .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                  .slice(0, 5)
                  .map(event => (
                    <div key={event.id} className="relative pl-4 border-l border-obsidian-border/50 pb-2">
                      <div className="absolute w-2 h-2 rounded-full bg-cyan-signal -left-[5px] top-1 shadow-[0_0_5px_rgba(6,182,212,0.5)]" />
                      <p className="text-[10px] text-obsidian-muted font-mono">{new Date(event.timestamp).toLocaleString()}</p>
                      <p className="text-xs font-bold text-white mt-0.5">{event.eventType} <span className="text-obsidian-muted font-normal">on</span> {event.websiteId}</p>
                    </div>
                  ))}
                {agentEvents.length === 0 && (
                  <p className="text-xs text-obsidian-muted text-center py-8">No recent activity yet.</p>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </motion.div>
  )
}
