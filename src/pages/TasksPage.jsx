import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ListChecks, Plus, Trash2, CheckCircle, Clock, AlertCircle,
  Calendar, FolderKanban, X, AlignLeft, User, Search, Loader2
} from 'lucide-react'
import { getNextId } from '../data/tasks'
import { auth } from '../services/firebaseConfig'
import { storageAdapter } from '../services/storageAdapter'

const priorityColors = {
  Critical: 'text-status-error bg-status-error/10 border-status-error/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]',
  High: 'text-orange-400 bg-orange-400/10 border-orange-400/20 shadow-[0_0_15px_rgba(249,115,22,0.1)]',
  Medium: 'text-status-warning bg-status-warning/10 border-status-warning/20',
  Low: 'text-status-dev bg-status-dev/10 border-status-dev/20',
}

const statusColors = {
  Pending: 'text-obsidian-muted bg-obsidian-dark/50 border-obsidian-border',
  Working: 'text-status-dev bg-status-dev/10 border-status-dev/30',
  Review: 'text-cyan-signal bg-cyan-signal/10 border-cyan-signal/30',
  Done: 'text-status-live bg-status-live/10 border-status-live/30',
}

export default function TasksPage() {
  const [tasks, setTasks] = useState([])
  const [allProjects, setAllProjects] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  
  const [filter, setFilter] = useState('All')
  const [projectFilter, setProjectFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  
  const [newTask, setNewTask] = useState({ 
    title: '', description: '', projectId: '', assignedTo: 'Khairul', priority: 'Medium', status: 'Pending', dueDate: '' 
  })

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [p, t] = await Promise.all([
          storageAdapter.getProjects(),
          storageAdapter.getTasks()
        ])
        setAllProjects(p)
        setTasks(t)
      } catch (err) {
        setErrorMsg('Firebase unavailable. Local fallback active.')
      }
      setIsLoading(false)
    }
    fetchData()
  }, [])

  const filtered = tasks.filter(t => {
    const matchStatus = filter === 'All' || t.status === filter
    const matchProject = projectFilter === 'All' || t.projectId === projectFilter
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) || 
                        (t.description && t.description.toLowerCase().includes(search.toLowerCase()))
    return matchStatus && matchProject && matchSearch
  })

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!newTask.title.trim()) return

    const selProject = allProjects.find(p => p.id === newTask.projectId)
    const pName = selProject ? selProject.name : 'General / No Project'
    const pId = selProject ? selProject.id : 'general'

    const newTaskObj = { 
      ...newTask, 
      projectId: pId,
      projectName: pName,
      id: getNextId(tasks).toString(), 
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    const updated = [newTaskObj, ...tasks]
    
    setTasks(updated)
    setNewTask({ title: '', description: '', projectId: '', assignedTo: 'Khairul', priority: 'Medium', status: 'Pending', dueDate: '' })
    setShowAdd(false)
    
    await storageAdapter.saveTask(newTaskObj, updated)
  }

  const handleStatusChange = async (id, status) => {
    const updatedTask = { ...tasks.find(t => t.id === id), status, updatedAt: new Date().toISOString() }
    const updated = tasks.map(t => t.id === id ? updatedTask : t)
    setTasks(updated)
    await storageAdapter.saveTask(updatedTask, updated)
  }

  const handleDelete = async (id) => {
    if (!auth.currentUser || auth.currentUser.email !== 'khairul2052007@gmail.com') {
      alert("Access Denied: Owner login required for this dangerous action.")
      return
    }
    if (window.confirm("Are you sure you want to delete this task?")) {
      const updated = tasks.filter(t => t.id !== id)
      setTasks(updated)
      await storageAdapter.deleteTask(id, updated)
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
      className="space-y-6 pb-20"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-3xl font-extrabold text-white flex items-center gap-3">
            Task <span className="gold-gradient-text">Directives</span>
            {isLoading && <Loader2 className="w-5 h-5 animate-spin text-gold" />}
          </h1>
          <p className="text-xs text-obsidian-muted mt-1 uppercase tracking-widest font-bold">
            {isLoading ? 'Syncing Directives...' : `${tasks.filter(t => t.status !== 'Done').length} Active · ${tasks.filter(t => t.status === 'Done').length} Completed`}
          </p>
          {errorMsg && <p className="text-[10px] text-status-error mt-2 bg-status-error/10 px-2 py-1 rounded inline-block">{errorMsg}</p>}
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider gold-gradient text-obsidian-dark hover:shadow-[0_0_20px_rgba(242,201,76,0.3)] transition-all flex-shrink-0"
        >
          {showAdd ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showAdd ? 'Cancel Directive' : 'New Directive'}
        </button>
      </div>

      {/* Add Task Form */}
      {showAdd && (
        <motion.form
          onSubmit={handleAdd}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-6 border border-gold/30 shadow-[0_0_30px_rgba(242,201,76,0.1)] relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 gold-gradient" />
          <h3 className="text-sm font-black text-white mb-5 uppercase tracking-wider flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-gold" />
            Issue New Directive
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-5">
            
            <div className="space-y-1.5 lg:col-span-2">
              <label className="text-[10px] text-obsidian-muted font-bold uppercase tracking-wider ml-1">Task Title *</label>
              <input
                required
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="What needs to be done?"
                className="w-full bg-obsidian-dark/50 border border-obsidian-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold/50 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-obsidian-muted font-bold uppercase tracking-wider ml-1">Target Asset</label>
              <select
                value={newTask.projectId}
                onChange={(e) => setNewTask({ ...newTask, projectId: e.target.value })}
                className="w-full bg-obsidian-dark/50 border border-obsidian-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold/50 transition-all"
              >
                <option value="">General / No Project</option>
                {allProjects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-obsidian-muted font-bold uppercase tracking-wider ml-1">Assigned Operative</label>
              <input
                value={newTask.assignedTo}
                onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                placeholder="e.g. Khairul"
                className="w-full bg-obsidian-dark/50 border border-obsidian-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold/50 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-obsidian-muted font-bold uppercase tracking-wider ml-1">Priority Level</label>
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                className="w-full bg-obsidian-dark/50 border border-obsidian-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold/50 transition-all"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] text-obsidian-muted font-bold uppercase tracking-wider ml-1">Initial Status</label>
              <select
                value={newTask.status}
                onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                className="w-full bg-obsidian-dark/50 border border-obsidian-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold/50 transition-all"
              >
                <option value="Pending">Pending</option>
                <option value="Working">Working</option>
                <option value="Review">Review</option>
                <option value="Done">Done</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-obsidian-muted font-bold uppercase tracking-wider ml-1">Deadline</label>
              <input
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                className="w-full bg-obsidian-dark/50 border border-obsidian-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold/50 transition-all"
              />
            </div>

            <div className="space-y-1.5 lg:col-span-3 xl:col-span-4">
              <label className="text-[10px] text-obsidian-muted font-bold uppercase tracking-wider ml-1">Directive Details</label>
              <textarea
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Context and requirements..."
                className="w-full h-20 resize-none bg-obsidian-dark/50 border border-obsidian-border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-gold/50 transition-all"
              />
            </div>
            
          </div>

          <div className="flex flex-wrap gap-3">
            <button type="submit" className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider gold-gradient text-obsidian-dark hover:shadow-[0_0_20px_rgba(242,201,76,0.3)] transition-all flex-1 sm:flex-none">
              Deploy Task
            </button>
            <button type="button" onClick={() => setShowAdd(false)} className="px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-obsidian-dark text-obsidian-muted border border-obsidian-border hover:text-white transition-all flex-1 sm:flex-none">
              Cancel
            </button>
          </div>
        </motion.form>
      )}

      {/* Filters */}
      <div className="glass-card p-2 rounded-2xl border border-obsidian-border flex flex-col md:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-obsidian-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="w-full bg-obsidian-dark/50 border border-transparent rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder-obsidian-muted focus:outline-none focus:border-gold/30 transition-all"
          />
        </div>
        
        <div className="h-px md:h-auto w-full md:w-px bg-obsidian-border mx-1" />

        <div className="flex flex-col md:flex-row gap-2 overflow-x-auto empire-scrollbar py-1 px-1">
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="bg-obsidian-dark/50 border border-transparent hover:border-gold/30 rounded-xl px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-white focus:outline-none transition-all flex-shrink-0"
          >
            {uniqueProjectFilters.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <div className="h-px md:h-auto w-full md:w-px bg-obsidian-border mx-1" />

          <div className="flex gap-1.5 flex-shrink-0">
            {['All', 'Pending', 'Working', 'Review', 'Done'].map(s => (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                  filter === s ? 'bg-gold/10 text-gold border border-gold/30 shadow-[0_0_10px_rgba(242,201,76,0.1)]' : 'bg-transparent text-obsidian-muted border border-transparent hover:bg-obsidian-dark hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {filtered.length === 0 && !isLoading && (
          <div className="text-center py-20 bg-obsidian-dark/50 rounded-2xl border border-obsidian-border border-dashed">
            <ListChecks className="w-12 h-12 text-obsidian-muted/30 mx-auto mb-4" />
            <p className="text-sm font-black uppercase tracking-wider text-white mb-1">No Directives Found</p>
            <p className="text-xs text-obsidian-muted">Modify parameters or deploy a new task.</p>
          </div>
        )}
        {filtered.map((task, i) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="glass-card rounded-2xl p-6 border border-obsidian-border flex flex-col lg:flex-row gap-5 justify-between transition-all hover:border-gold/30 group"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className={`px-2.5 py-1 rounded-md text-[9px] font-black border uppercase tracking-wider ${priorityColors[task.priority]}`}>
                  {task.priority}
                </span>
                <span className={`px-2.5 py-1 rounded-md text-[9px] font-black border uppercase tracking-wider ${statusColors[task.status]}`}>
                  {task.status}
                </span>
                <h3 className={`text-base font-bold text-white ml-2 transition-colors group-hover:text-gold-light ${task.status === 'Done' ? 'line-through text-obsidian-muted/50' : ''}`}>
                  {task.title}
                </h3>
              </div>
              
              {task.description && (
                <div className="flex items-start gap-2 mb-4 text-xs font-medium text-obsidian-muted">
                  <AlignLeft className="w-4 h-4 mt-0.5 flex-shrink-0 text-obsidian-muted/50" />
                  <p className="leading-relaxed whitespace-pre-wrap">{task.description}</p>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold uppercase tracking-wider text-obsidian-muted">
                <span className="flex items-center gap-1.5 text-cyan-signal bg-cyan-signal/10 px-2 py-1 rounded-md">
                  <FolderKanban className="w-3.5 h-3.5" /> {task.projectName}
                </span>
                <span className="flex items-center gap-1.5 bg-obsidian-dark px-2 py-1 rounded-md border border-obsidian-border">
                  <User className="w-3.5 h-3.5" /> {task.assignedTo || 'Unassigned'}
                </span>
                {task.dueDate && (
                  <span className="flex items-center gap-1.5 bg-obsidian-dark px-2 py-1 rounded-md border border-obsidian-border">
                    <Calendar className="w-3.5 h-3.5" /> Due: {task.dueDate}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0 lg:flex-col lg:items-end justify-center border-t border-obsidian-border/50 lg:border-t-0 lg:border-l lg:border-obsidian-border pt-4 lg:pt-0 lg:pl-5 mt-4 lg:mt-0">
              <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                {task.status !== 'Working' && task.status !== 'Done' && (
                  <button onClick={() => handleStatusChange(task.id, 'Working')} className="flex-1 lg:flex-none px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider bg-status-dev/10 text-status-dev border border-status-dev/20 hover:bg-status-dev hover:text-obsidian-dark transition-all flex items-center justify-center gap-1.5 whitespace-nowrap">
                    <Clock className="w-3.5 h-3.5" /> Working
                  </button>
                )}
                {task.status !== 'Review' && task.status !== 'Done' && (
                  <button onClick={() => handleStatusChange(task.id, 'Review')} className="flex-1 lg:flex-none px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider bg-cyan-signal/10 text-cyan-signal border border-cyan-signal/20 hover:bg-cyan-signal hover:text-obsidian-dark transition-all flex items-center justify-center gap-1.5 whitespace-nowrap">
                    <AlertCircle className="w-3.5 h-3.5" /> Review
                  </button>
                )}
                {task.status !== 'Done' && (
                  <button onClick={() => handleStatusChange(task.id, 'Done')} className="flex-1 lg:flex-none px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider bg-status-live/10 text-status-live border border-status-live/20 hover:bg-status-live hover:text-obsidian-dark transition-all flex items-center justify-center gap-1.5 whitespace-nowrap">
                    <CheckCircle className="w-3.5 h-3.5" /> Done
                  </button>
                )}
                <button onClick={() => handleDelete(task.id)} className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider bg-obsidian-card text-obsidian-muted border border-obsidian-border hover:bg-status-error/20 hover:text-status-error hover:border-status-error/50 transition-all" title="Delete Directive">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
