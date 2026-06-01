import { Target, TrendingUp, Award } from 'lucide-react'
import { motion } from 'framer-motion'

export default function GoalCard({ goal, progress, remaining, streak, isCompleted, onComplete }) {
  const percentage = goal > 0 ? Math.min((progress / goal) * 100, 100) : 0

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-gold" />
          <h3 className="text-white font-bold text-sm">Daily Income Goal</h3>
        </div>
        {isCompleted && (
          <div className="flex items-center gap-1 text-status-live">
            <Award className="w-4 h-4" />
            <span className="text-xs font-bold">Completed!</span>
          </div>
        )}
      </div>

      {/* Amount Display */}
      <div className="flex items-end justify-between mb-3">
        <div>
          <p className="text-2xl font-extrabold text-white">${progress}</p>
          <p className="text-xs text-obsidian-muted">of ${goal} goal</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-obsidian-muted">${remaining}</p>
          <p className="text-xs text-obsidian-muted">remaining</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2.5 rounded-full bg-obsidian-card overflow-hidden mb-3">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={`h-full rounded-full transition-all duration-500 ${
            isCompleted ? 'bg-status-live' : 'gold-gradient'
          }`}
        />
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-gold" />
          <span className="text-xs text-obsidian-muted">{percentage.toFixed(0)}% complete</span>
        </div>
        {streak > 0 && (
          <div className="flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-status-warning" />
            <span className="text-xs text-status-warning font-semibold">{streak} day streak</span>
          </div>
        )}
      </div>

      {/* Complete Button */}
      {!isCompleted && (
        <button
          onClick={onComplete}
          className="w-full mt-4 py-2.5 rounded-xl text-xs font-bold gold-gradient text-obsidian-dark hover:opacity-90 transition-all"
        >
          Mark Goal Completed
        </button>
      )}

      {/* Success Message */}
      {isCompleted && (
        <div className="mt-4 p-3 rounded-xl bg-status-live/10 border border-status-live/20">
          <p className="text-xs text-status-live font-semibold text-center">
            🎉 Daily goal achieved! You earned ${progress} today!
          </p>
        </div>
      )}
    </div>
  )
}
