import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ListChecks, Plus, Trash2, CheckCircle, Clock, AlertCircle,
  Calendar, User, FolderKanban, X, Edit3,
} from 'lucide-react'
import { loadTasks, saveTasks, getNextId } from '../data/tasks'

const priorityColors = {
  High: 'text-status-error bg-status-error/10 border-status-error/20',
  Medium: 'text-status-warning bg-status-warning/10 border-status-warning/20',
  Low: 'text-status-dev bg-status-dev/10 border-status-dev/20',
}

const statusColors = {
  Pending: 'text-obsidian-muted bg-obsidian-card border-obsidian-border',
  Working: 'text-status-dev bg-status-dev/10 border-status-dev/30',
  Review: 'text-status-warning bg-status-warning/10 border-status-warning/30',
  Done: 'text-status-live bg-status-live/10 border-status-live/30',
}

const projects = ['All', 'BillQyro', 'Khair Murafiq Empire OS', 'TechWithKhairul Blog', 'Embroidery AI Tool', 'Gopal Bhar Cartoon Studio']

export default function TasksPage() {
  const [tasks, setTasks] = useState([])
  const [filter, setFilter] = useState('All')
  const [projectFilter, setProjectFilter] = useState('All')
  const [showAdd, setShowAdd] = useState(false)
  const [newTask, setNewTask] = useState({ title: '', project: 'BillQyro', assignedTo: '', priority: 'Medium', dueDate: '' })

  useEffect(() => {
    setTasks(loadTasks())
  }, [])

  const filtered = tasks.filter(t => {
    const matchStatus = filter === 'All' || t.status === filter
    const matchProject = projectFilter === 'All' || t.project === projectFilter
    return matchStatus && matchProject
  })

  const handleAdd = () => {
    if (!newTask.title.trim()) return
    const updated = [...tasks, { ...newTask, id: getNextId(tasks), status: 'Pending', createdAt: new Date().toISOString().split('T')[0] }]
    setTasks(updated)
    saveTasks(updated)
    setNewTask({ title: '', project: 'BillQyro', assignedTo: '', priority: 'Medium', dueDate: '' })
    setShowAdd(false)
  }

  const handleStatusChange = (id, status) => {
    const updated = tasks.map(t => t.id === id ? { ...t, status } : t)
    setTasks(updated)
    saveTasks(updated)
  }

  const handleDelete = (id) => {
    const updated = tasks.filter(t => t.id !== id)
    setTasks(updated)
    saveTasks(updated)
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
            Task <span className="gold-gradient-text">Manager</span>
          </h1>
          <p className="text-xs text-obsidian-muted mt-1">
            {tasks.filter(t => t.status !== 'Done').length} active tasks · {tasks.filter(t => t.status === 'Done').length} completed
          </p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold gold-gradient text-obsidian-dark hover:opacity-90 transition-all"
        >
          <Plus className="w-3.5 h-3.5" /> Add Task
        </button>
      </div>

      {/* Add Task Form */}
      {showAdd && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-5 space-y-3"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <input
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              placeholder="Task title..."
              className="bg-obsidian-card border border-obsidian-border rounded-xl px-4 py-2.5 text-sm text-white placeholder-obsidian-muted focus:outline-none focus:border-gold/30 transition-colors"
            />
            <select
              value={newTask.project}
              onChange={(e) => setNewTask({ ...newTask, project: e.target.value })}
              className="bg-obsidian-card border border-obsidian-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold/30 transition-colors"
            >
              {projects.filter(p => p !== 'All').map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <select
              value={newTask.priority}
              onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
              className="bg-obsidian-card border border-obsidian-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold/30 transition-colors"
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <input
              type="date"
              value={newTask.dueDate}
              onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
              className="bg-obsidian-card border border-obsidian-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold/30 transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="px-5 py-2 rounded-xl text-xs font-semibold gold-gradient text-obsidian-dark hover:opacity-90 transition-all">
              Create Task
            </button>
            <button onClick={() => setShowAdd(false)} className="px-5 py-2 rounded-xl text-xs font-semibold bg-obsidian-card text-obsidian-muted border border-obsidian-border hover:text-white transition-all">
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-1.5">
        {['All', 'Pending', 'Working', 'Review', 'Done'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === s ? 'bg-gold/10 text-gold border border-gold/20' : 'bg-obsidian-card text-obsidian-muted border border-obsidian-border hover:text-white'
            }`}
          >
            {s}
          </button>
        ))}
        <div className="w-px h-6 bg-obsidian-border mx-1 self-center" />
        {projects.map(p => (
          <button key={p} onClick={() => setProjectFilter(p)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              projectFilter === p ? 'bg-gold/10 text-gold border border-gold/20' : 'bg-obsidian-card text-obsidian-muted border border-obsidian-border hover:text-white'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <ListChecks className="w-12 h-12 text-obsidian-muted/30 mx-auto mb-3" />
            <p className="text-sm text-obsidian-muted">No tasks found.</p>
          </div>
        )}
        {filtered.map((task, i) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="glass-card rounded-2xl p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className={`text-sm font-bold text-white ${task.status === 'Done' ? 'line-through text-obsidian-muted/60' : ''}`}>
                    {task.title}
                  </h3>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold border ${priorityColors[task.priority]}`}>
                    {task.priority}
                  </span>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold border ${statusColors[task.status]}`}>
                    {task.status}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-obsidian-muted">
                  <span className="flex items-center gap-1"><FolderKanban className="w-3 h-3" /> {task.project}</span>
                  {task.assignedTo && <span className="flex items-center gap-1"><User className="w-3 h-3" /> {task.assignedTo}</span>}
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {task.dueDate}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {task.status !== 'Done' && (
                  <>
                    {task.status === 'Pending' && (
                      <button onClick={() => handleStatusChange(task.id, 'Working')} className="p-1.5 rounded-lg hover:bg-status-dev/10 text-status-dev transition-all" title="Start Working">
                        <Clock className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {task.status === 'Working' && (
                      <button onClick={() => handleStatusChange(task.id, 'Review')} className="p-1.5 rounded-lg hover:bg-status-warning/10 text-status-warning transition-all" title="Send to Review">
                        <AlertCircle className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {task.status === 'Review' && (
                      <button onClick={() => handleStatusChange(task.id, 'Done')} className="p-1.5 rounded-lg hover:bg-status-live/10 text-status-live transition-all" title="Mark Done">
                        <CheckCircle className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button onClick={() => handleStatusChange(task.id, 'Pending')} className="p-1.5 rounded-lg hover:bg-obsidian-card text-obsidian-muted transition-all" title="Reset">
                      <X className="w-3 h-3" />
                    </button>
                  </>
                )}
                <button onClick={() => handleDelete(task.id)} className="p-1.5 rounded-lg hover:bg-status-error/10 text-status-error/60 hover:text-status-error transition-all" title="Delete">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
