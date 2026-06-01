import { motion } from 'framer-motion'
import { FileText, Download, Calendar, Activity, Globe, Share2, DollarSign, ListChecks } from 'lucide-react'

export default function ReportsPage() {
  const reports = [
    { title: 'Daily Report', desc: 'Summary of today\'s activities and tasks.', icon: Calendar, color: 'text-gold' },
    { title: 'Weekly Report', desc: 'Performance and progress for the week.', icon: FileText, color: 'text-blue-400' },
    { title: 'Website Health', desc: 'Uptime and security status of all sites.', icon: Globe, color: 'text-status-live' },
    { title: 'Social Media', desc: 'Engagement and posting schedule.', icon: Share2, color: 'text-purple-400' },
    { title: 'Income Report', desc: 'Revenue, expenses, and profit margins.', icon: DollarSign, color: 'text-status-warning' },
    { title: 'Pending Tasks', desc: 'Overview of incomplete assignments.', icon: ListChecks, color: 'text-status-dev' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      <div>
        <h1 className="text-xl lg:text-2xl font-extrabold text-white">
          Reports <span className="gold-gradient-text">Center</span>
        </h1>
        <p className="text-xs text-obsidian-muted mt-1">
          Generate and download analytics and summaries
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((r, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card-hover rounded-2xl p-5 flex flex-col"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-obsidian-card border border-obsidian-border flex items-center justify-center">
                <r.icon className={`w-5 h-5 ${r.color}`} />
              </div>
              <h3 className="text-white font-bold text-sm">{r.title}</h3>
            </div>
            <p className="text-xs text-obsidian-muted mb-4 flex-1">{r.desc}</p>
            <button className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold bg-obsidian-card text-obsidian-muted border border-obsidian-border hover:text-white hover:border-obsidian-light transition-all">
              <Download className="w-3.5 h-3.5" /> Generate PDF
            </button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
