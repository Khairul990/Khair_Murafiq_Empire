import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ListChecks, Plus, Trash2, CheckCircle, Clock, AlertCircle,
  Calendar, FolderKanban, X, AlignLeft, User, Search
} from 'lucide-react'
import { loadTasks, saveTasks, getNextId } from '../data/tasks'
import defaultProjects from '../data/projects'

const priorityColors = {
  Critical: 'text-status-error bg-status-error/10 border-status-error/20 animate-pulse',
  High: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
  Medium: 'text-status-warning bg-status-warning/10 border-status-warning/20',
  Low: 'text-status-dev bg-status-dev/10 border-status-dev/20',
}

const statusColors = {
  Pending: 'text-obsidian-muted bg-obsidian-card border-obsidian-border',
  Working: 'text-status-dev bg-status-dev/10 border-status-dev/30',
  Review: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  Done: 'text-status-live bg-status-live/10 border-status-live/30',
}

const loadAllProjects = () => {
  try {
    const stored = localStorage.getItem('km_empire_projects')
    if (stored) {
      const parsed = JSON.parse(stored)
      const merged = [...defaultProjects]
      parsed.forEach(p => {
        const idx = merged.findIndex(dp => dp.id === p.id)
        if (idx !== -1) merged[idx] = p
        else merged.push(p)
      })
      return merged
    }
  } catch {}
  return [...defaultProjects]
}

export default function TasksPage() {
  const [tasks, setTasks] = useState([])
  const [allProjects, setAllProjects] = useState([])
  
  const [filter, setFilter] = useState('All')
  const [projectFilter, setProjectFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  
  const [newTask, setNewTask] = useState({ 
    title: '', description: '', projectId: '', assignedTo: 'Khairul', priority: 'Medium', status: 'Pending', dueDate: '' 
  })

  useEffect(() => {
    setTasks(loadTasks())
    setAllProjects(loadAllProjects())
  }, [])

  const filtered = tasks.filter(t => {
    const matchStatus = filter === 'All' || t.status === filter
    const matchProject = projectFilter === 'All' || t.projectId === projectFilter
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) || 
                        (t.description && t.description.toLowerCase().includes(search.toLowerCase()))
    return matchStatus && matchProject && matchSearch
  })

  const handleAdd = (e) => {
    e.preventDefault()
    if (!newTask.title.trim()) return

    const selProject = allProjects.find(p => p.id === newTask.projectId)
    const pName = selProject ? selProject.name : 'General / No Project'
    const pId = selProject ? selProject.id : 'general'

    const updated = [{ 
      ...newTask, 
      projectId: pId,
      projectName: pName,
      id: getNextId(tasks).toString(), 
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }, ...tasks]
    
    setTasks(updated)
    saveTasks(updated)
    setNewTask({ title: '', description: '', projectId: '', assignedTo: 'Khairul', priority: 'Medium', status: 'Pending', dueDate: '' })
    setShowAdd(false)
  }

  const handleStatusChange = (id, status) => {
    const updated = tasks.map(t => t.id === id ? { ...t, status, updatedAt: new Date().toISOString() } : t)
    setTasks(updated)
    saveTasks(updated)
  }

  const handleDelete = (id) => {
    if (!localStorage.getItem('km_empire_owner_session')) {
      alert("Access Denied: Owner login required for this dangerous action.")
      return
    }
    if (window.confirm("Are you sure you want to delete this task?")) {
      const updated = tasks.filter(t => t.id !== id)
      setTasks(updated)
      saveTasks(updated)
    }
  }

  const uniqueProjectFilters = [
    { id: 'All', name: 'All Projects' },
    { id: 'general', name: 'General / No Project' },
    ...allProjects.map(p => ({ id: p.id, name: p.name }))
  ]

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
            Empire <span className="gold-gradient-text">Task Manager</span>
          </h1>
          <p className="text-xs text-obsidian-muted mt-1">
            {tasks.filter(t => t.status !== 'Done').length} active tasks · {tasks.filter(t => t.status === 'Done').length} completed
          </p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold gold-gradient text-obsidian-dark hover:opacity-90 transition-all"
        >
          {showAdd ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          {showAdd ? 'Close Form' : 'Add Task'}
        </button>
      </div>

      {/* Add Task Form */}
      {showAdd && (
        <motion.form
          onSubmit={handleAdd}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-5 border border-gold/20 shadow-2xl"
        >
          <h3 className="text-sm font-bold text-white mb-4">Create New Task</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
            
            <div className="space-y-1 lg:col-span-2">
              <label className="text-[11px] text-obsidian-muted font-bold uppercase tracking-wider ml-1">Task Title *</label>
              <input
                required
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="What needs to be done?"
                className="w-full bg-obsidian-dark border border-obsidian-border rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-gold/30 transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-obsidian-muted font-bold uppercase tracking-wider ml-1">Website / Project</label>
              <select
                value={newTask.projectId}
                onChange={(e) => setNewTask({ ...newTask, projectId: e.target.value })}
                className="w-full bg-obsidian-dark border border-obsidian-border rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-gold/30 transition-colors"
              >
                <option value="">General / No Project</option>
                {allProjects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-obsidian-muted font-bold uppercase tracking-wider ml-1">Assigned To</label>
              <input
                value={newTask.assignedTo}
                onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                placeholder="e.g. Khairul"
                className="w-full bg-obsidian-dark border border-obsidian-border rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-gold/30 transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-obsidian-muted font-bold uppercase tracking-wider ml-1">Priority</label>
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                className="w-full bg-obsidian-dark border border-obsidian-border rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-gold/30 transition-colors"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
            
            <div className="space-y-1">
              <label className="text-[11px] text-obsidian-muted font-bold uppercase tracking-wider ml-1">Status</label>
              <select
                value={newTask.status}
                onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                className="w-full bg-obsidian-dark border border-obsidian-border rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-gold/30 transition-colors"
              >
                <option value="Pending">Pending</option>
                <option value="Working">Working</option>
                <option value="Review">Review</option>
                <option value="Done">Done</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-obsidian-muted font-bold uppercase tracking-wider ml-1">Due Date</label>
              <input
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                className="w-full bg-obsidian-dark border border-obsidian-border rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-gold/30 transition-colors"
              />
            </div>

            <div className="space-y-1 lg:col-span-3 xl:col-span-4">
              <label className="text-[11px] text-obsidian-muted font-bold uppercase tracking-wider ml-1">Description</label>
              <textarea
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Task details and context..."
                className="w-full h-16 resize-none bg-obsidian-dark border border-obsidian-border rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-gold/30 transition-colors"
              />
            </div>
            
          </div>

          <div className="flex gap-3">
            <button type="submit" className="px-6 py-2 rounded-xl text-xs font-bold gold-gradient text-obsidian-dark hover:opacity-90 transition-all">
              Save Task
            </button>
            <button type="button" onClick={() => setShowAdd(false)} className="px-6 py-2 rounded-xl text-xs font-bold bg-obsidian-dark text-obsidian-muted border border-obsidian-border hover:text-white transition-all">
              Cancel
            </button>
          </div>
        </motion.form>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
        <div className="relative w-full md:w-64 flex-shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-obsidian-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="w-full bg-obsidian-card border border-obsidian-border rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-obsidian-muted focus:outline-none focus:border-gold/30 transition-colors"
          />
        </div>
        <div className="flex flex-wrap gap-1.5 flex-1">
          {['All', 'Pending', 'Working', 'Review', 'Done'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                filter === s ? 'bg-gold/10 text-gold border border-gold/20' : 'bg-obsidian-card text-obsidian-muted border border-obsidian-border hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <select
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value)}
          className="bg-obsidian-card border border-obsidian-border rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider text-white focus:outline-none focus:border-gold/30 transition-colors w-full md:w-auto"
        >
          {uniqueProjectFilters.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-12 bg-obsidian-dark/50 rounded-2xl border border-obsidian-border/50">
            <ListChecks className="w-12 h-12 text-obsidian-muted/30 mx-auto mb-3" />
            <p className="text-sm font-bold text-white">No tasks found</p>
            <p className="text-xs text-obsidian-muted mt-1">Try adjusting your filters or create a new task.</p>
          </div>
        )}
        {filtered.map((task, i) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="glass-card rounded-2xl p-5 border border-obsidian-border flex flex-col lg:flex-row gap-4 justify-between transition-all hover:bg-obsidian-card"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase tracking-wider ${priorityColors[task.priority]}`}>
                  {task.priority}
                </span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase tracking-wider ${statusColors[task.status]}`}>
                  {task.status}
                </span>
                <h3 className={`text-sm font-bold text-white ml-1 ${task.status === 'Done' ? 'line-through text-obsidian-muted/60' : ''}`}>
                  {task.title}
                </h3>
              </div>
              
              {task.description && (
                <div className="flex items-start gap-1.5 mb-3 text-xs text-obsidian-muted">
                  <AlignLeft className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  <p className="leading-relaxed whitespace-pre-wrap">{task.description}</p>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-4 text-[11px] font-semibold text-obsidian-muted">
                <span className="flex items-center gap-1.5 text-blue-400">
                  <FolderKanban className="w-3.5 h-3.5" /> {task.projectName}
                </span>
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> {task.assignedTo || 'Unassigned'}
                </span>
                {task.dueDate && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> Due: {task.dueDate}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0 lg:flex-col lg:items-end justify-center border-t border-obsidian-border/50 lg:border-t-0 lg:border-l pt-3 lg:pt-0 lg:pl-4 mt-2 lg:mt-0">
              <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                {task.status !== 'Working' && task.status !== 'Done' && (
                  <button onClick={() => handleStatusChange(task.id, 'Working')} className="flex-1 lg:flex-none px-3 py-1.5 rounded-lg text-[10px] font-bold bg-status-dev/10 text-status-dev border border-status-dev/20 hover:bg-status-dev hover:text-obsidian-dark transition-all flex items-center justify-center gap-1.5 whitespace-nowrap">
                    <Clock className="w-3 h-3" /> Mark Working
                  </button>
                )}
                {task.status !== 'Review' && task.status !== 'Done' && (
                  <button onClick={() => handleStatusChange(task.id, 'Review')} className="flex-1 lg:flex-none px-3 py-1.5 rounded-lg text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500 hover:text-white transition-all flex items-center justify-center gap-1.5 whitespace-nowrap">
                    <AlertCircle className="w-3 h-3" /> Mark Review
                  </button>
                )}
                {task.status !== 'Done' && (
                  <button onClick={() => handleStatusChange(task.id, 'Done')} className="flex-1 lg:flex-none px-3 py-1.5 rounded-lg text-[10px] font-bold bg-status-live/10 text-status-live border border-status-live/20 hover:bg-status-live hover:text-obsidian-dark transition-all flex items-center justify-center gap-1.5 whitespace-nowrap">
                    <CheckCircle className="w-3 h-3" /> Mark Done
                  </button>
                )}
                <button onClick={() => handleDelete(task.id)} className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-obsidian-card text-obsidian-muted border border-obsidian-border hover:bg-status-error/20 hover:text-status-error transition-all" title="Delete">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
