import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Globe, Plus, X, ChevronDown } from 'lucide-react'
import ProjectCard from '../components/ProjectCard'
import defaultProjects from '../data/projects'
import { loadTasks } from '../data/tasks'

const PROJECTS_KEY = 'km_empire_projects'
const ALERTS_KEY = 'km_empire_alerts'

const loadAlerts = () => {
  try {
    const stored = localStorage.getItem(ALERTS_KEY)
    if (stored) return JSON.parse(stored)
  } catch {}
  return []
}

const loadProjects = () => {
  try {
    const stored = localStorage.getItem(PROJECTS_KEY)
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

export default function ProjectsPage() {
  const [projects, setProjects] = useState(loadProjects)
  const [alerts, setAlerts] = useState(loadAlerts)
  const [tasks] = useState(loadTasks)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  
  const [showAdd, setShowAdd] = useState(false)
  const [isStatusOpen, setIsStatusOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  
  const [alertProject, setAlertProject] = useState(null)
  const [alertFormData, setAlertFormData] = useState({
    alertType: 'Website Down', severity: 'High', message: ''
  })
  const [formData, setFormData] = useState({
    name: '', id: '', type: '', status: 'Development',
    liveUrl: '', adminUrl: '', githubUrl: '', vercelUrl: '', firebaseRoot: '', notes: ''
  })

  useEffect(() => {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects))
  }, [projects])

  useEffect(() => {
    localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts))
  }, [alerts])

  const handleAddAlertSave = (e) => {
    e.preventDefault()
    if (!alertProject) return

    const newAlert = {
      id: Date.now().toString(),
      projectId: alertProject.id,
      projectName: alertProject.name,
      ...alertFormData,
      status: 'New',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    setAlerts([newAlert, ...alerts])
    setAlertProject(null)
    setAlertFormData({ alertType: 'Website Down', severity: 'High', message: '' })
  }

  const filters = ['All', 'Live', 'Development', 'Maintenance', 'Warning', 'Error', 'Paused', 'Planning', 'Building']

  const handleSave = (e) => {
    e.preventDefault()
    
    let newId = formData.id.trim()
    if (!newId) newId = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')

    const projectToSave = {
      ...formData,
      id: newId,
      lastChecked: 'Just now'
    }

    if (editingId) {
      setProjects(projects.map(p => p.id === editingId ? projectToSave : p))
    } else {
      // Add to front so it shows first
      setProjects([projectToSave, ...projects])
    }

    setShowAdd(false)
    setEditingId(null)
    setFormData({ name: '', id: '', type: '', status: 'Development', liveUrl: '', adminUrl: '', githubUrl: '', vercelUrl: '', firebaseRoot: '', notes: '' })
  }

  const handleEdit = (project) => {
    setFormData({
      name: project.name || '',
      id: project.id || '',
      type: project.type || '',
      status: project.status || 'Development',
      liveUrl: project.liveUrl === '#' ? '' : (project.liveUrl || ''),
      adminUrl: project.adminUrl === '#' ? '' : (project.adminUrl || ''),
      githubUrl: project.githubUrl === '#' ? '' : (project.githubUrl || ''),
      vercelUrl: project.vercelUrl === '#' ? '' : (project.vercelUrl || ''),
      firebaseRoot: project.firebaseRoot || '',
      notes: project.notes || ''
    })
    setEditingId(project.id)
    setShowAdd(true)
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this website? This action cannot be undone.')) {
      setProjects(projects.filter(p => p.id !== id))
    }
  }

  const filtered = projects.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                        (p.type && p.type.toLowerCase().includes(search.toLowerCase()))
    const matchFilter = filter === 'All' || p.status === filter
    return matchSearch && matchFilter
  })

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-extrabold text-white">
            Website <span className="gold-gradient-text">Control Room</span>
          </h1>
          <p className="text-xs text-obsidian-muted mt-1">
            Manage all {projects.length} empire projects from one place
          </p>
        </div>
        <button
          onClick={() => {
            setEditingId(null)
            setFormData({ name: '', id: '', type: '', status: 'Development', liveUrl: '', adminUrl: '', githubUrl: '', vercelUrl: '', firebaseRoot: '', notes: '' })
            setShowAdd(!showAdd)
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold gold-gradient text-obsidian-dark hover:opacity-90 transition-all flex-shrink-0"
        >
          {showAdd ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          {showAdd ? 'Close Form' : 'Add Website'}
        </button>
      </div>

      {/* Add Website Form */}
      {showAdd && (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="glass-card rounded-2xl p-5 border border-gold/20"
          onSubmit={handleSave}
        >
          <h3 className="text-sm font-bold text-white mb-4">{editingId ? 'Edit Website' : 'Add New Website'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] text-obsidian-muted font-medium ml-1">Website Name *</label>
              <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-obsidian-dark border border-obsidian-border rounded-xl px-3 py-2 text-sm text-white focus:border-gold/30 outline-none transition-colors" placeholder="e.g. BillQyro" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-obsidian-muted font-medium ml-1">Website ID (Optional)</label>
              <input value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} className="w-full bg-obsidian-dark border border-obsidian-border rounded-xl px-3 py-2 text-sm text-white focus:border-gold/30 outline-none transition-colors" placeholder="auto-generated if empty" disabled={!!editingId} />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-obsidian-muted font-medium ml-1">Type</label>
              <input value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-obsidian-dark border border-obsidian-border rounded-xl px-3 py-2 text-sm text-white focus:border-gold/30 outline-none transition-colors" placeholder="e.g. Billing SaaS" />
            </div>
            <div className="space-y-1 relative">
              <label className="text-[11px] text-obsidian-muted font-medium ml-1">Status</label>
              <div 
                onClick={() => setIsStatusOpen(!isStatusOpen)}
                className="w-full bg-obsidian-dark border border-obsidian-border rounded-xl px-3 py-2 text-sm text-white hover:border-gold/30 transition-colors flex items-center justify-between cursor-pointer"
              >
                <span>{formData.status}</span>
                <ChevronDown className="w-4 h-4 text-obsidian-muted" />
              </div>
              {isStatusOpen && (
                <div className="absolute z-10 w-full top-full mt-1 bg-obsidian-card border border-obsidian-border rounded-xl shadow-2xl overflow-hidden py-1">
                  {['Development', 'Live', 'Maintenance', 'Warning', 'Error'].map(opt => (
                    <div 
                      key={opt}
                      onClick={() => {
                        setFormData({...formData, status: opt})
                        setIsStatusOpen(false)
                      }}
                      className={`px-3 py-2 text-sm cursor-pointer transition-colors ${
                        formData.status === opt ? 'bg-gold/10 text-gold' : 'text-obsidian-muted hover:bg-obsidian-light hover:text-white'
                      }`}
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-obsidian-muted font-medium ml-1">Live URL</label>
              <input value={formData.liveUrl} onChange={e => setFormData({...formData, liveUrl: e.target.value})} className="w-full bg-obsidian-dark border border-obsidian-border rounded-xl px-3 py-2 text-sm text-white focus:border-gold/30 outline-none transition-colors" placeholder="https://..." />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-obsidian-muted font-medium ml-1">Admin URL</label>
              <input value={formData.adminUrl} onChange={e => setFormData({...formData, adminUrl: e.target.value})} className="w-full bg-obsidian-dark border border-obsidian-border rounded-xl px-3 py-2 text-sm text-white focus:border-gold/30 outline-none transition-colors" placeholder="https://..." />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-obsidian-muted font-medium ml-1">GitHub URL</label>
              <input value={formData.githubUrl} onChange={e => setFormData({...formData, githubUrl: e.target.value})} className="w-full bg-obsidian-dark border border-obsidian-border rounded-xl px-3 py-2 text-sm text-white focus:border-gold/30 outline-none transition-colors" placeholder="https://github.com/..." />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-obsidian-muted font-medium ml-1">Vercel URL</label>
              <input value={formData.vercelUrl} onChange={e => setFormData({...formData, vercelUrl: e.target.value})} className="w-full bg-obsidian-dark border border-obsidian-border rounded-xl px-3 py-2 text-sm text-white focus:border-gold/30 outline-none transition-colors" placeholder="https://vercel.com/..." />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-obsidian-muted font-medium ml-1">Firebase Root / DB</label>
              <input value={formData.firebaseRoot} onChange={e => setFormData({...formData, firebaseRoot: e.target.value})} className="w-full bg-obsidian-dark border border-obsidian-border rounded-xl px-3 py-2 text-sm text-white focus:border-gold/30 outline-none transition-colors" placeholder="e.g. projects/billqyro" />
            </div>
            <div className="col-span-1 md:col-span-2 lg:col-span-3 space-y-1">
              <label className="text-[11px] text-obsidian-muted font-medium ml-1">Notes</label>
              <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full bg-obsidian-dark border border-obsidian-border rounded-xl px-3 py-2 text-sm text-white focus:border-gold/30 outline-none transition-colors h-16 resize-none" placeholder="Project details and notes..." />
            </div>
          </div>
          <div className="mt-5 flex gap-3">
            <button type="submit" className="px-5 py-2 rounded-xl text-xs font-bold gold-gradient text-obsidian-dark hover:opacity-90 transition-all">
              {editingId ? 'Update Website' : 'Save Website'}
            </button>
            <button type="button" onClick={() => setShowAdd(false)} className="px-5 py-2 rounded-xl text-xs font-bold bg-obsidian-dark text-obsidian-muted border border-obsidian-border hover:text-white transition-all">
              Cancel
            </button>
          </div>
        </motion.form>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-obsidian-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="w-full bg-obsidian-card border border-obsidian-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-obsidian-muted focus:outline-none focus:border-gold/30 transition-colors"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {['All', 'Live', 'Development', 'Planning', 'Building'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === f
                  ? 'bg-gold/10 text-gold border border-gold/20'
                  : 'bg-obsidian-card text-obsidian-muted border border-obsidian-border hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Project Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ProjectCard project={p} onEdit={handleEdit} onDelete={handleDelete} onAddAlert={setAlertProject} alerts={alerts} tasks={tasks} />
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <Globe className="w-12 h-12 text-obsidian-muted/30 mx-auto mb-3" />
          <p className="text-sm text-obsidian-muted">No projects match your search.</p>
        </div>
      )}

      {/* Add Alert Modal */}
      {alertProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-dark/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md glass-card rounded-2xl p-6 border border-status-warning/30 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white">Create Alert: <span className="text-gold">{alertProject.name}</span></h3>
              <button onClick={() => setAlertProject(null)} className="text-obsidian-muted hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddAlertSave} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] text-obsidian-muted font-medium ml-1">Alert Type</label>
                <select value={alertFormData.alertType} onChange={e => setAlertFormData({...alertFormData, alertType: e.target.value})} className="w-full bg-obsidian-dark border border-obsidian-border rounded-xl px-3 py-2 text-sm text-white focus:border-status-warning/50 outline-none transition-colors">
                  {['Website Down', 'Deploy Failed', 'Firebase Pending', 'Security Warning', 'Design Issue', 'Manual Note', 'Other'].map(opt => (
                    <option key={opt} value={opt} className="bg-obsidian-dark">{opt}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-obsidian-muted font-medium ml-1">Severity</label>
                <select value={alertFormData.severity} onChange={e => setAlertFormData({...alertFormData, severity: e.target.value})} className="w-full bg-obsidian-dark border border-obsidian-border rounded-xl px-3 py-2 text-sm text-white focus:border-status-warning/50 outline-none transition-colors">
                  {['Low', 'Medium', 'High', 'Critical'].map(opt => (
                    <option key={opt} value={opt} className="bg-obsidian-dark">{opt}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-obsidian-muted font-medium ml-1">Message</label>
                <textarea required value={alertFormData.message} onChange={e => setAlertFormData({...alertFormData, message: e.target.value})} className="w-full bg-obsidian-dark border border-obsidian-border rounded-xl px-3 py-2 text-sm text-white focus:border-status-warning/50 outline-none transition-colors h-24 resize-none" placeholder="Describe the issue..."></textarea>
              </div>

              <div className="pt-2 flex gap-3">
                <button type="submit" className="flex-1 py-2 rounded-xl text-sm font-bold bg-status-warning/10 text-status-warning border border-status-warning/30 hover:bg-status-warning hover:text-obsidian-dark transition-all">
                  Create Alert
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
