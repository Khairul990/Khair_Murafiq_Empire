import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  FolderKanban, Globe, AlertTriangle, ListChecks, Share2,
  DollarSign, MessageCircle, Users, Activity, Target, ShieldCheck, Loader2
} from 'lucide-react'
import StatCard from '../components/StatCard'
import GoalCard from '../components/GoalCard'
import { storageAdapter } from '../services/storageAdapter'

export default function DashboardPage() {
  const navigate = useNavigate()
  
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [alerts, setAlerts] = useState([])
  const [reports, setReports] = useState([])
  const [isLoading, setIsLoading] = useState(true)

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
        setProjects(p || [])
        setTasks(t || [])
        setAlerts(a || [])
        setReports(r || [])
      } catch (err) {
        console.error("Dashboard data fetch error:", err)
      }
      setIsLoading(false)
    }
    fetchData()
  }, [])

  // Calculate Real Metrics
  const liveWebsites = projects.filter(p => p.status === 'Live').length
  const activeAlerts = alerts.filter(a => a.status !== 'Fixed' && a.status !== 'Ignored').length
  const pendingTasks = tasks.filter(t => t.status !== 'Done').length
  
  const socialPostsPlanned = reports.filter(r => r.docType === 'social_post').length
  const estimatedIncome = reports
    .filter(r => r.type === 'income')
    .reduce((sum, r) => sum + (Number(r.amount) || 0), 0)

  // Real staff tasks
  const staffTasksPending = tasks.filter(t => t.assignedTo && t.assignedTo !== 'Owner' && t.status !== 'Done').length

  // Health calculation
  const projectsWithScore = projects.filter(p => p.healthScore !== undefined)
  const averageHealth = projectsWithScore.length > 0 
    ? Math.round(projectsWithScore.reduce((sum, p) => sum + p.healthScore, 0) / projectsWithScore.length)
    : 100 // Fallback

  const cards = [
    { icon: FolderKanban, label: 'Total Projects', value: isLoading ? '-' : projects.length, trend: 'Real Data', color: 'gold', onClick: () => navigate('/projects') },
    { icon: Globe, label: 'Live Websites', value: isLoading ? '-' : liveWebsites, trend: 'Real Data', color: 'green', onClick: () => navigate('/projects') },
    { icon: AlertTriangle, label: 'Active Alerts', value: isLoading ? '-' : activeAlerts, trend: activeAlerts > 0 ? 'Needs Attention' : 'All Clear', color: 'warning', onClick: () => navigate('/monitoring') },
    { icon: ListChecks, label: 'Pending Tasks', value: isLoading ? '-' : pendingTasks, trend: 'Real Data', color: 'blue', onClick: () => navigate('/tasks') },
    { icon: Share2, label: 'Social Posts Planned', value: isLoading ? '-' : socialPostsPlanned, trend: 'Real Data', color: 'purple', onClick: () => navigate('/social') },
    { icon: DollarSign, label: 'Estimated Income', value: isLoading ? '-' : `$${estimatedIncome.toFixed(2)}`, trend: 'All Time (Real)', color: 'green', onClick: () => navigate('/finance') },
    { icon: MessageCircle, label: 'WhatsApp Alert', value: 'Not connected', trend: 'Planned only', color: 'error', onClick: () => navigate('/whatsapp') },
    { icon: Users, label: 'Staff Tasks Pending', value: isLoading ? '-' : (staffTasksPending > 0 ? staffTasksPending : 'No staff tasks yet'), trend: 'Real Data', color: 'blue', onClick: () => navigate('/staff') },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-5"
    >
      {/* Safety Status Panel */}
      <motion.div variants={itemVariants} className="glass-card rounded-2xl p-4 border border-gold/30 bg-gold/5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gold/20 text-gold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-white font-bold text-sm">Real Data Mode Active</h3>
            <p className="text-[11px] text-obsidian-muted mt-0.5">Mock features clearly labeled • External APIs not connected</p>
          </div>
        </div>
        {isLoading && <Loader2 className="w-5 h-5 text-gold animate-spin" />}
      </motion.div>

      {/* Section Title */}
      <motion.div variants={itemVariants}>
        <h1 className="text-xl lg:text-2xl font-extrabold text-white">
          Empire <span className="gold-gradient-text">Dashboard</span>
        </h1>
        <p className="text-xs text-obsidian-muted mt-1">
          Monitoring {isLoading ? '...' : projects.length} projects across the Khair Murafiq Empire
        </p>
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {cards.map((c, i) => (
          <StatCard key={i} {...c} />
        ))}
      </motion.div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* System Health */}
        <motion.div variants={itemVariants} className="glass-card rounded-2xl p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-gold" />
            <h3 className="text-white font-bold text-sm">System Health (Calculated)</h3>
          </div>
          <div className="w-full h-3 rounded-full bg-obsidian-card overflow-hidden mb-3">
            <div className="h-full rounded-full gold-gradient transition-all duration-1000" style={{ width: `${averageHealth}%` }} />
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-status-live font-semibold">Based on project scores</span>
            <span className="text-obsidian-muted">{averageHealth}% average</span>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-auto pt-4 border-t border-obsidian-border">
            <div className="text-center">
              <p className="text-lg font-extrabold text-white">{isLoading ? '-' : projects.length}</p>
              <p className="text-[10px] text-obsidian-muted">Projects</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-extrabold text-white">{isLoading ? '-' : liveWebsites}</p>
              <p className="text-[10px] text-obsidian-muted">Live</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-extrabold text-white">{isLoading ? '-' : activeAlerts}</p>
              <p className="text-[10px] text-obsidian-muted">Alerts</p>
            </div>
          </div>
        </motion.div>

        {/* Daily Income Goal */}
        <motion.div variants={itemVariants} className="relative">
          <div className="absolute top-2 right-2 z-10 px-2 py-0.5 rounded text-[9px] font-bold bg-obsidian-light/80 text-obsidian-muted border border-obsidian-border">
            Planned / Mock Mode
          </div>
          <GoalCard
            goal={100}
            progress={0}
            remaining={100}
            streak={0}
            isCompleted={false}
          />
        </motion.div>
      </div>
    </motion.div>
  )
}
