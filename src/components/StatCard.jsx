import { motion } from 'framer-motion'

export default function StatCard({ icon: Icon, label, value, trend, color = 'gold', onClick }) {
  const colorMap = {
    gold: 'text-gold bg-gold/10 border-gold/20',
    green: 'text-status-live bg-status-live/10 border-status-live/20',
    blue: 'text-status-dev bg-status-dev/10 border-status-dev/20',
    warning: 'text-status-warning bg-status-warning/10 border-status-warning/20',
    error: 'text-status-error bg-status-error/10 border-status-error/20',
    purple: 'text-status-maintenance bg-status-maintenance/10 border-status-maintenance/20',
  }

  const glowMap = {
    gold: 'shadow-gold-sm',
    green: 'shadow-glow-green',
    blue: 'shadow-glow-blue',
    warning: 'shadow-glow-green',
    error: 'shadow-glow-green',
    purple: 'shadow-glow-blue',
  }

  return (
    <motion.div
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      onClick={onClick}
      className={`glass-card rounded-2xl p-5 transition-all duration-300 ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium text-obsidian-muted uppercase tracking-wider">{label}</span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${colorMap[color]}`}>
          <Icon className="w-[18px] h-[18px]" />
        </div>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-extrabold text-white tracking-tight">{value}</span>
        {trend && (
          <span className={`text-xs font-semibold mb-1 ${
            trend.startsWith('+') ? 'text-status-live' : trend.startsWith('-') ? 'text-status-error' : 'text-obsidian-muted'
          }`}>
            {trend}
          </span>
        )}
      </div>
    </motion.div>
  )
}
