import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Target, Trophy, TrendingUp, Calendar, Award,
  Flame, CheckCircle, Plus, Trash2,
} from 'lucide-react'
import GoalCard from '../components/GoalCard'

const GOALS_KEY = 'km_empire_goals'

const loadGoals = () => {
  try {
    const stored = localStorage.getItem(GOALS_KEY)
    if (stored) return JSON.parse(stored)
  } catch {}
  const defaultGoals = {
    dailyIncomeGoal: 500,
    currentProgress: 0,
    remaining: 500,
    streak: 0,
    lastCompletedDate: null,
    isCompleted: false,
    history: [],
    customGoals: [
      { id: 1, title: 'Launch BillQyro to production', target: 'Jun 2026', progress: 75, status: 'In Progress' },
      { id: 2, title: 'Publish 10 blog posts', target: '5 completed', progress: 50, status: 'In Progress' },
      { id: 3, title: 'Reach 1000 social media followers', target: '0 followers', progress: 0, status: 'Pending' },
    ],
  }
  localStorage.setItem(GOALS_KEY, JSON.stringify(defaultGoals))
  return defaultGoals
}

export default function GoalsPage() {
  const [data, setData] = useState(loadGoals)
  const [showAdd, setShowAdd] = useState(false)
  const [newGoal, setNewGoal] = useState({ title: '', target: '' })

  const saveGoals = (updated) => {
    localStorage.setItem(GOALS_KEY, JSON.stringify(updated))
    setData(updated)
  }

  const handleCompleteDaily = () => {
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    const newStreak = data.lastCompletedDate === yesterday ? data.streak + 1 : 1
    saveGoals({
      ...data,
      isCompleted: true,
      streak: newStreak,
      lastCompletedDate: today,
      history: [...data.history, { date: today, amount: data.currentProgress }],
    })
  }

  const handleAddGoal = () => {
    if (!newGoal.title.trim()) return
    const customGoals = [...data.customGoals, {
      id: Date.now(),
      title: newGoal.title,
      target: newGoal.target || 'TBD',
      progress: 0,
      status: 'Pending',
    }]
    saveGoals({ ...data, customGoals })
    setNewGoal({ title: '', target: '' })
    setShowAdd(false)
  }

  const handleDeleteGoal = (id) => {
    saveGoals({ ...data, customGoals: data.customGoals.filter(g => g.id !== id) })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl lg:text-2xl font-extrabold text-white">
            Goals & <span className="gold-gradient-text">Challenges</span>
          </h1>
          <p className="text-xs text-obsidian-muted mt-1">
            Track your daily income goals and project milestones
          </p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold gold-gradient text-obsidian-dark hover:opacity-90 transition-all"
        >
          <Plus className="w-3.5 h-3.5" /> Add Goal
        </button>
      </div>

      {/* Daily Income Goal */}
      <GoalCard
        goal={data.dailyIncomeGoal}
        progress={data.currentProgress}
        remaining={data.remaining}
        streak={data.streak}
        isCompleted={data.isCompleted}
        onComplete={handleCompleteDaily}
      />

      {/* Add Custom Goal Form */}
      {showAdd && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-5 space-y-3"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              value={newGoal.title}
              onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
              placeholder="Goal title..."
              className="bg-obsidian-card border border-obsidian-border rounded-xl px-4 py-2.5 text-sm text-white placeholder-obsidian-muted focus:outline-none focus:border-gold/30"
            />
            <input
              value={newGoal.target}
              onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
              placeholder="Target (e.g. Launch by June)"
              className="bg-obsidian-card border border-obsidian-border rounded-xl px-4 py-2.5 text-sm text-white placeholder-obsidian-muted focus:outline-none focus:border-gold/30"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={handleAddGoal} className="px-5 py-2 rounded-xl text-xs font-semibold gold-gradient text-obsidian-dark hover:opacity-90 transition-all">
              Create Goal
            </button>
            <button onClick={() => setShowAdd(false)} className="px-5 py-2 rounded-xl text-xs font-semibold bg-obsidian-card text-obsidian-muted border border-obsidian-border hover:text-white transition-all">
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Custom Goals */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-4 h-4 text-gold" />
          <h3 className="text-white font-bold text-sm">Project Milestones</h3>
        </div>
        <div className="space-y-2">
          {data.customGoals.length === 0 && (
            <p className="text-xs text-obsidian-muted text-center py-4">No custom goals yet. Add your first goal!</p>
          )}
          {data.customGoals.map((goal) => (
            <div key={goal.id} className="flex items-center justify-between py-3 px-4 rounded-xl bg-obsidian-card/50 border border-obsidian-border">
              <div className="flex-1 min-w-0 mr-4">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-white">{goal.title}</h4>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${
                    goal.status === 'Completed' ? 'text-status-live bg-status-live/10' :
                    goal.status === 'In Progress' ? 'text-status-dev bg-status-dev/10' :
                    'text-obsidian-muted bg-obsidian-card'
                  }`}>
                    {goal.status}
                  </span>
                </div>
                <p className="text-[11px] text-obsidian-muted mt-0.5">{goal.target}</p>
                {/* Mini progress bar */}
                <div className="w-full h-1.5 rounded-full bg-obsidian-card mt-2 overflow-hidden">
                  <div
                    className="h-full rounded-full gold-gradient"
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs font-bold text-white">{goal.progress}%</span>
                <button onClick={() => handleDeleteGoal(goal.id)} className="p-1.5 rounded-lg hover:bg-status-error/10 text-status-error/60 hover:text-status-error transition-all">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Streak Display */}
      {data.streak > 0 && (
        <div className="glass-card rounded-2xl p-5 border border-gold/20">
          <div className="flex items-center gap-3">
            <Flame className="w-8 h-8 text-status-warning" />
            <div>
              <p className="text-lg font-extrabold text-white">{data.streak} Day Streak!</p>
              <p className="text-xs text-obsidian-muted">Keep going! You're building momentum.</p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}
