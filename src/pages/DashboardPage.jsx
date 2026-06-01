import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  FolderKanban, Globe, AlertTriangle, ListChecks, Share2,
  DollarSign, MessageCircle, Users, Activity, Target,
} from 'lucide-react'
import StatCard from '../components/StatCard'
import GoalCard from '../components/GoalCard'
import stats from '../data/stats'
import challenge from '../data/challenge'

export default function DashboardPage() {
  const navigate = useNavigate()

  const cards = [
    { icon: FolderKanban, label: 'Total Projects', value: stats.totalProjects, trend: '+1 this month', color: 'gold', onClick: () => navigate('/projects') },
    { icon: Globe, label: 'Live Websites', value: stats.liveWebsites, trend: 'BillQyro live', color: 'green', onClick: () => navigate('/projects') },
    { icon: AlertTriangle, label: 'Active Alerts', value: stats.activeAlerts, trend: '2 warnings', color: 'warning', onClick: () => navigate('/monitoring') },
    { icon: ListChecks, label: 'Pending Tasks', value: stats.pendingTasks, trend: `${stats.staffTasksPending} staff tasks`, color: 'blue', onClick: () => navigate('/tasks') },
    { icon: Share2, label: 'Social Posts Planned', value: stats.socialPostsPlanned, trend: '5 platforms', color: 'purple', onClick: () => navigate('/social') },
    { icon: DollarSign, label: 'Estimated Income', value: `$${stats.estimatedIncome}`, trend: 'This month', color: 'green', onClick: () => navigate('/finance') },
    { icon: MessageCircle, label: 'WhatsApp Alert', value: stats.whatsappConnected ? 'Connected' : 'Offline', trend: stats.whatsappConnected ? 'Active' : 'Not connected', color: stats.whatsappConnected ? 'green' : 'error', onClick: () => navigate('/whatsapp') },
    { icon: Users, label: 'Staff Tasks Pending', value: stats.staffTasksPending, trend: `${stats.staffTasksPending} need review`, color: 'blue', onClick: () => navigate('/staff') },
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
      {/* Section Title */}
      <motion.div variants={itemVariants}>
        <h1 className="text-xl lg:text-2xl font-extrabold text-white">
          Empire <span className="gold-gradient-text">Dashboard</span>
        </h1>
        <p className="text-xs text-obsidian-muted mt-1">
          Monitoring {stats.totalProjects} projects across the Khair Murafiq Empire
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
        <motion.div variants={itemVariants} className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-gold" />
            <h3 className="text-white font-bold text-sm">System Health</h3>
          </div>
          <div className="w-full h-3 rounded-full bg-obsidian-card overflow-hidden mb-3">
            <div className="h-full rounded-full gold-gradient" style={{ width: '98%' }} />
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-status-live font-semibold">All systems operational</span>
            <span className="text-obsidian-muted">98% uptime</span>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-obsidian-border">
            <div className="text-center">
              <p className="text-lg font-extrabold text-white">{stats.totalProjects}</p>
              <p className="text-[10px] text-obsidian-muted">Projects</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-extrabold text-white">{stats.liveWebsites}</p>
              <p className="text-[10px] text-obsidian-muted">Live</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-extrabold text-white">{stats.activeAlerts}</p>
              <p className="text-[10px] text-obsidian-muted">Alerts</p>
            </div>
          </div>
        </motion.div>

        {/* Daily Income Goal */}
        <motion.div variants={itemVariants}>
          <GoalCard
            goal={challenge.dailyIncomeGoal}
            progress={challenge.currentProgress}
            remaining={challenge.remaining}
            streak={challenge.streak}
            isCompleted={challenge.isCompleted}
          />
        </motion.div>
      </div>
    </motion.div>
  )
}
