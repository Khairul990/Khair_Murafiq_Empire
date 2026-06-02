import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Globe, Plus, X, ChevronDown, Loader2, Target, Briefcase, DollarSign, Fingerprint } from 'lucide-react'
import ProjectCard from '../components/ProjectCard'
import { auth } from '../services/firebaseConfig'
import { storageAdapter } from '../services/storageAdapter'

export default function ProjectsPage() {
  const [projects, setProjects] = useState([])
  const [alerts, setAlerts] = useState([])
  const [tasks, setTasks] = useState([])
  const [agentEvents, setAgentEvents] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [categoryFilter, setCategoryFilter] = useState('All')
  
  const [showAdd, setShowAdd] = useState(false)
  const [isStatusOpen, setIsStatusOpen] = useState(false)
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  
  const [alertProject, setAlertProject] = useState(null)
  const [alertFormData, setAlertFormData] = useState({
    alertType: 'Website Down', severity: 'High', message: ''
  })
  
  const [healthProject, setHealthProject] = useState(null)
  const [healthFormData, setHealthFormData] = useState({
    healthStatus: 'Healthy', healthScore: 100, issueSummary: '', uptimeNote: ''
  })

  const [formData, setFormData] = useState({
    name: '', id: '', type: '', category: '', businessModel: '', mainIncomeType: '', status: 'Development',
    liveUrl: '', adminUrl: '', githubUrl: '', vercelUrl: '', firebaseRoot: '', notes: ''
  })

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [p, a, t, e] = await Promise.all([
          storageAdapter.getProjects(),
          storageAdapter.getAlerts(),
          storageAdapter.getTasks(),
          storageAdapter.getWebsiteEvents()
        ])
        setProjects(p)
        setAlerts(a)
        setTasks(t)
        setAgentEvents(e || [])
      } catch (err) {
        setErrorMsg('Firebase unavailable. Local fallback active.')
      }
      setIsLoading(false)
    }
    fetchData()
  }, [])

  const handleAddAlertSave = async (e) => {
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

    const newAlerts = [newAlert, ...alerts]
    setAlerts(newAlerts)
    setAlertProject(null)
    setAlertFormData({ alertType: 'Website Down', severity: 'High', message: '' })
    
    await storageAdapter.saveAlert(newAlert, newAlerts)
  }

  const handleUpdateHealthSave = async (e) => {
    e.preventDefault()
    if (!healthProject) return
    
    const updatedProject = {
      ...healthProject,
      healthStatus: healthFormData.healthStatus,
      healthScore: parseInt(healthFormData.healthScore, 10),
      issueSummary: healthFormData.issueSummary,
      uptimeNote: healthFormData.uptimeNote,
      lastCheckedAt: new Date().toISOString()
    }

    const newProjects = projects.map(p => p.id === updatedProject.id ? updatedProject : p)
    setProjects(newProjects)
    setHealthProject(null)
    
    await storageAdapter.saveProject(updatedProject, newProjects)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    
    let newId = formData.id.trim()
    if (!newId) newId = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')

    const projectToSave = {
      ...formData,
      id: newId,
      lastChecked: 'Just now'
    }

    const newProjects = editingId
      ? projects.map(p => p.id === editingId ? projectToSave : p)
      : [projectToSave, ...projects]

    setProjects(newProjects)
    setShowAdd(false)
    setEditingId(null)
    setFormData({ name: '', id: '', type: '', category: '', businessModel: '', mainIncomeType: '', status: 'Development', liveUrl: '', adminUrl: '', githubUrl: '', vercelUrl: '', firebaseRoot: '', notes: '' })
    
    await storageAdapter.saveProject(projectToSave, newProjects)
  }

  const handleEdit = (project) => {
    if (!auth.currentUser || auth.currentUser.email !== 'khairul2052007@gmail.com') {
      alert("Access Denied: Owner login required for this dangerous action.")
      return
    }
    setFormData({
      name: project.name || '',
      id: project.id || '',
      type: project.type || '',
      category: project.category || '',
      businessModel: project.businessModel || '',
      mainIncomeType: project.mainIncomeType || '',
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
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
    if (!auth.currentUser || auth.currentUser.email !== 'khairul2052007@gmail.com') {
      alert("Access Denied: Owner login required for this dangerous action.")
      return
    }
    if (window.confirm('Are you sure you want to delete this website? This action cannot be undone.')) {
      const newProjects = projects.filter(p => p.id !== id)
      setProjects(newProjects)
      await storageAdapter.deleteProject(id, newProjects)
    }
  }

  const filtered = projects.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                        (p.type && p.type.toLowerCase().includes(search.toLowerCase()))
    const matchFilter = filter === 'All' || p.status === filter
    const matchCategory = categoryFilter === 'All' || p.category === categoryFilter
    return matchSearch && matchFilter && matchCategory
  })

  const categories = ['All', 'SaaS', 'E-commerce', 'Content / Blog', 'Game', 'Tool / Utility', 'Portfolio', 'Other']

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
            Website <span className="gold-gradient-text">Operations</span>
            {isLoading && <Loader2 className="w-5 h-5 animate-spin text-gold" />}
          </h1>
          <p className="text-xs text-obsidian-muted mt-1 uppercase tracking-widest font-bold">
            {isLoading ? 'Syncing...' : `${projects.length} Controlled Assets`}
          </p>
          {errorMsg && <p className="text-[10px] text-status-error mt-2 bg-status-error/10 px-2 py-1 rounded inline-block">{errorMsg}</p>}
        </div>
        <button
          onClick={() => {
            setEditingId(null)
            setFormData({ name: '', id: '', type: '', category: '', businessModel: '', mainIncomeType: '', status: 'Development', liveUrl: '', adminUrl: '', githubUrl: '', vercelUrl: '', firebaseRoot: '', notes: '' })
            setShowAdd(!showAdd)
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider gold-gradient text-obsidian-dark hover:shadow-[0_0_20px_rgba(242,201,76,0.3)] transition-all flex-shrink-0"
        >
          {showAdd ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showAdd ? 'Close Command' : 'Deploy New Asset'}
        </button>
      </div>

      {/* Add Website Form */}
      {showAdd && (
        <motion.form
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-6 border border-gold/30 shadow-[0_0_30px_rgba(242,201,76,0.1)] relative overflow-hidden"
          onSubmit={handleSave}
        >
          <div className="absolute top-0 left-0 w-full h-1 gold-gradient" />
          <h3 className="text-lg font-black text-white mb-6 uppercase tracking-wider flex items-center gap-2">
            <Globe className="w-5 h-5 text-gold" />
            {editingId ? 'Configure Asset' : 'Initialize New Asset'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {/* Core Info */}
            <div className="space-y-1.5 xl:col-span-2">
              <label className="text-[10px] text-obsidian-muted font-bold uppercase tracking-wider ml-1">Asset Name *</label>
              <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-obsidian-dark/50 border border-obsidian-border rounded-xl px-4 py-2.5 text-sm text-white focus:border-gold/50 focus:bg-obsidian-dark outline-none transition-all" placeholder="e.g. BillQyro" />
            </div>
            
            <div className="space-y-1.5 xl:col-span-2">
              <label className="text-[10px] text-obsidian-muted font-bold uppercase tracking-wider ml-1 flex items-center gap-1.5">
                <Fingerprint className="w-3 h-3" /> Asset ID (Crucial for Agent)
              </label>
              <input value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} className="w-full bg-obsidian-dark/50 border border-obsidian-border rounded-xl px-4 py-2.5 text-sm text-white focus:border-gold/50 focus:bg-obsidian-dark outline-none transition-all font-mono" placeholder="auto-generated if empty" disabled={!!editingId} />
              <p className="text-[9px] text-obsidian-muted ml-1">Must match exactly in website's EMPIRE_CONNECTION_INFO.md</p>
            </div>

            {/* Classification */}
            <div className="space-y-1.5 relative">
              <label className="text-[10px] text-obsidian-muted font-bold uppercase tracking-wider ml-1 flex items-center gap-1.5">
                <Target className="w-3 h-3" /> Category
              </label>
              <div 
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className="w-full bg-obsidian-dark/50 border border-obsidian-border rounded-xl px-4 py-2.5 text-sm text-white hover:border-gold/30 transition-all flex items-center justify-between cursor-pointer"
              >
                <span>{formData.category || 'Select...'}</span>
                <ChevronDown className="w-4 h-4 text-obsidian-muted" />
              </div>
              {isCategoryOpen && (
                <div className="absolute z-20 w-full top-[calc(100%+4px)] bg-obsidian-card border border-obsidian-border rounded-xl shadow-2xl overflow-hidden py-1">
                  {categories.filter(c => c !== 'All').map(opt => (
                    <div 
                      key={opt}
                      onClick={() => {
                        setFormData({...formData, category: opt})
                        setIsCategoryOpen(false)
                      }}
                      className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                        formData.category === opt ? 'bg-gold/10 text-gold font-bold' : 'text-obsidian-muted hover:bg-obsidian-light hover:text-white'
                      }`}
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-1.5 relative">
              <label className="text-[10px] text-obsidian-muted font-bold uppercase tracking-wider ml-1">Status</label>
              <div 
                onClick={() => setIsStatusOpen(!isStatusOpen)}
                className="w-full bg-obsidian-dark/50 border border-obsidian-border rounded-xl px-4 py-2.5 text-sm text-white hover:border-gold/30 transition-all flex items-center justify-between cursor-pointer"
              >
                <span className={
                  formData.status === 'Live' ? 'text-status-live font-bold' :
                  formData.status === 'Error' ? 'text-status-error font-bold' :
                  formData.status === 'Warning' ? 'text-status-warning font-bold' :
                  ''
                }>{formData.status}</span>
                <ChevronDown className="w-4 h-4 text-obsidian-muted" />
              </div>
              {isStatusOpen && (
                <div className="absolute z-20 w-full top-[calc(100%+4px)] bg-obsidian-card border border-obsidian-border rounded-xl shadow-2xl overflow-hidden py-1">
                  {['Development', 'Live', 'Maintenance', 'Warning', 'Error', 'Paused', 'Planning', 'Building'].map(opt => (
                    <div 
                      key={opt}
                      onClick={() => {
                        setFormData({...formData, status: opt})
                        setIsStatusOpen(false)
                      }}
                      className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                        formData.status === opt ? 'bg-gold/10 text-gold font-bold' : 'text-obsidian-muted hover:bg-obsidian-light hover:text-white'
                      }`}
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-obsidian-muted font-bold uppercase tracking-wider ml-1">Tech / Type</label>
              <input value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-obsidian-dark/50 border border-obsidian-border rounded-xl px-4 py-2.5 text-sm text-white focus:border-gold/50 focus:bg-obsidian-dark outline-none transition-all" placeholder="e.g. Next.js App Router" />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-obsidian-muted font-bold uppercase tracking-wider ml-1">Firebase Root</label>
              <input value={formData.firebaseRoot} onChange={e => setFormData({...formData, firebaseRoot: e.target.value})} className="w-full bg-obsidian-dark/50 border border-obsidian-border rounded-xl px-4 py-2.5 text-sm text-white focus:border-gold/50 focus:bg-obsidian-dark outline-none transition-all" placeholder="e.g. projects/billqyro" />
            </div>

            {/* URLs */}
            <div className="space-y-1.5 xl:col-span-2">
              <label className="text-[10px] text-obsidian-muted font-bold uppercase tracking-wider ml-1">Live URL</label>
              <input value={formData.liveUrl} onChange={e => setFormData({...formData, liveUrl: e.target.value})} className="w-full bg-obsidian-dark/50 border border-obsidian-border rounded-xl px-4 py-2.5 text-sm text-white focus:border-gold/50 focus:bg-obsidian-dark outline-none transition-all" placeholder="https://..." />
            </div>
            <div className="space-y-1.5 xl:col-span-2">
              <label className="text-[10px] text-obsidian-muted font-bold uppercase tracking-wider ml-1">Admin URL</label>
              <input value={formData.adminUrl} onChange={e => setFormData({...formData, adminUrl: e.target.value})} className="w-full bg-obsidian-dark/50 border border-obsidian-border rounded-xl px-4 py-2.5 text-sm text-white focus:border-gold/50 focus:bg-obsidian-dark outline-none transition-all" placeholder="https://..." />
            </div>
            <div className="space-y-1.5 xl:col-span-2">
              <label className="text-[10px] text-obsidian-muted font-bold uppercase tracking-wider ml-1">GitHub URL</label>
              <input value={formData.githubUrl} onChange={e => setFormData({...formData, githubUrl: e.target.value})} className="w-full bg-obsidian-dark/50 border border-obsidian-border rounded-xl px-4 py-2.5 text-sm text-white focus:border-gold/50 focus:bg-obsidian-dark outline-none transition-all" placeholder="https://github.com/..." />
            </div>
            <div className="space-y-1.5 xl:col-span-2">
              <label className="text-[10px] text-obsidian-muted font-bold uppercase tracking-wider ml-1">Vercel URL</label>
              <input value={formData.vercelUrl} onChange={e => setFormData({...formData, vercelUrl: e.target.value})} className="w-full bg-obsidian-dark/50 border border-obsidian-border rounded-xl px-4 py-2.5 text-sm text-white focus:border-gold/50 focus:bg-obsidian-dark outline-none transition-all" placeholder="https://vercel.com/..." />
            </div>

            {/* Business Logic */}
            <div className="space-y-1.5 xl:col-span-2">
              <label className="text-[10px] text-obsidian-muted font-bold uppercase tracking-wider ml-1 flex items-center gap-1.5">
                <Briefcase className="w-3 h-3" /> Business Model
              </label>
              <input value={formData.businessModel} onChange={e => setFormData({...formData, businessModel: e.target.value})} className="w-full bg-obsidian-dark/50 border border-obsidian-border rounded-xl px-4 py-2.5 text-sm text-white focus:border-gold/50 focus:bg-obsidian-dark outline-none transition-all" placeholder="e.g. B2B Subscription, Ad Revenue" />
            </div>
            <div className="space-y-1.5 xl:col-span-2">
              <label className="text-[10px] text-obsidian-muted font-bold uppercase tracking-wider ml-1 flex items-center gap-1.5">
                <DollarSign className="w-3 h-3" /> Main Income Type
              </label>
              <input value={formData.mainIncomeType} onChange={e => setFormData({...formData, mainIncomeType: e.target.value})} className="w-full bg-obsidian-dark/50 border border-obsidian-border rounded-xl px-4 py-2.5 text-sm text-white focus:border-gold/50 focus:bg-obsidian-dark outline-none transition-all" placeholder="e.g. Stripe MRR, AdSense" />
            </div>

            <div className="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4 space-y-1.5">
              <label className="text-[10px] text-obsidian-muted font-bold uppercase tracking-wider ml-1">Strategic Notes</label>
              <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full bg-obsidian-dark/50 border border-obsidian-border rounded-xl px-4 py-3 text-sm text-white focus:border-gold/50 focus:bg-obsidian-dark outline-none transition-all min-h-[80px] resize-none" placeholder="Project roadmap, technical debt, marketing focus..." />
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="submit" className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider gold-gradient text-obsidian-dark hover:shadow-[0_0_20px_rgba(242,201,76,0.3)] transition-all flex-1 sm:flex-none">
              {editingId ? 'Update Asset' : 'Save New Asset'}
            </button>
            <button type="button" onClick={() => setShowAdd(false)} className="px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-obsidian-dark text-obsidian-muted border border-obsidian-border hover:text-white hover:border-obsidian-muted transition-all flex-1 sm:flex-none">
              Cancel
            </button>
          </div>
        </motion.form>
      )}

      {/* Controls */}
      <div className="glass-card p-2 rounded-2xl border border-obsidian-border flex flex-col xl:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-obsidian-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, ID, or tech..."
            className="w-full bg-obsidian-dark/50 border border-transparent rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-obsidian-muted focus:outline-none focus:border-gold/30 transition-all"
          />
        </div>
        
        <div className="h-px xl:h-auto w-full xl:w-px bg-obsidian-border mx-1" />
        
        <div className="flex items-center gap-2 overflow-x-auto empire-scrollbar py-1 px-1">
          <Filter className="w-4 h-4 text-obsidian-muted mx-2 flex-shrink-0" />
          <div className="flex gap-1.5 border-r border-obsidian-border pr-3 mr-1 flex-shrink-0">
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setCategoryFilter(c)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                  categoryFilter === c
                    ? 'bg-gold/10 text-gold border border-gold/30 shadow-[0_0_10px_rgba(242,201,76,0.1)]'
                    : 'bg-transparent text-obsidian-muted border border-transparent hover:bg-obsidian-dark hover:text-white'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="flex gap-1.5 flex-shrink-0">
            {['All', 'Live', 'Development', 'Warning', 'Error'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                  filter === f
                    ? 'bg-cyan-signal/10 text-cyan-signal border border-cyan-signal/30'
                    : 'bg-transparent text-obsidian-muted border border-transparent hover:bg-obsidian-dark hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Project Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ProjectCard 
              project={p} 
              onEdit={handleEdit} 
              onDelete={handleDelete} 
              onAddAlert={setAlertProject} 
              onUpdateHealth={(proj) => {
                setHealthProject(proj)
                setHealthFormData({
                  healthStatus: proj.healthStatus || 'Healthy',
                  healthScore: proj.healthScore ?? 100,
                  issueSummary: proj.issueSummary || '',
                  uptimeNote: proj.uptimeNote || ''
                })
              }}
              alerts={alerts} 
              tasks={tasks} 
              agentEvents={agentEvents}
            />
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && !isLoading && (
        <div className="text-center py-20 glass-card rounded-2xl border border-obsidian-border border-dashed">
          <Globe className="w-12 h-12 text-obsidian-muted/30 mx-auto mb-4" />
          <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-1">No Assets Found</h3>
          <p className="text-xs text-obsidian-muted">Adjust your filters or deploy a new asset.</p>
        </div>
      )}

      {/* Add Alert Modal */}
      {alertProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-dark/90 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md glass-card rounded-2xl p-6 border border-status-warning/50 shadow-[0_0_50px_rgba(234,179,8,0.15)] relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-status-warning" />
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">Deploy Alert</h3>
                <p className="text-xs text-gold mt-1">Target: {alertProject.name}</p>
              </div>
              <button onClick={() => setAlertProject(null)} className="text-obsidian-muted hover:text-white transition-colors bg-obsidian-dark p-2 rounded-lg border border-obsidian-border">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleAddAlertSave} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-obsidian-muted font-bold uppercase tracking-wider ml-1">Alert Classification</label>
                <select value={alertFormData.alertType} onChange={e => setAlertFormData({...alertFormData, alertType: e.target.value})} className="w-full bg-obsidian-dark border border-obsidian-border rounded-xl px-4 py-2.5 text-sm text-white focus:border-status-warning/50 outline-none transition-colors">
                  {['Website Down', 'Deploy Failed', 'Firebase Pending', 'Security Warning', 'Design Issue', 'Manual Note', 'Other'].map(opt => (
                    <option key={opt} value={opt} className="bg-obsidian-dark">{opt}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-obsidian-muted font-bold uppercase tracking-wider ml-1">Severity Level</label>
                <select value={alertFormData.severity} onChange={e => setAlertFormData({...alertFormData, severity: e.target.value})} className="w-full bg-obsidian-dark border border-obsidian-border rounded-xl px-4 py-2.5 text-sm text-white focus:border-status-warning/50 outline-none transition-colors">
                  {['Low', 'Medium', 'High', 'Critical'].map(opt => (
                    <option key={opt} value={opt} className="bg-obsidian-dark">{opt}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-obsidian-muted font-bold uppercase tracking-wider ml-1">Intel / Message</label>
                <textarea required value={alertFormData.message} onChange={e => setAlertFormData({...alertFormData, message: e.target.value})} className="w-full bg-obsidian-dark border border-obsidian-border rounded-xl px-4 py-3 text-sm text-white focus:border-status-warning/50 outline-none transition-colors h-24 resize-none" placeholder="Describe the tactical situation..."></textarea>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="submit" className="flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-status-warning/20 text-status-warning border border-status-warning/50 hover:bg-status-warning hover:text-obsidian-dark transition-all">
                  Deploy Alert
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Update Health Modal */}
      {healthProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-dark/90 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md glass-card rounded-2xl p-6 border border-status-live/50 shadow-[0_0_50px_rgba(34,197,94,0.15)] relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-status-live" />
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">Health Diagnostics</h3>
                <p className="text-xs text-status-live mt-1">Target: {healthProject.name}</p>
              </div>
              <button onClick={() => setHealthProject(null)} className="text-obsidian-muted hover:text-white transition-colors bg-obsidian-dark p-2 rounded-lg border border-obsidian-border">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateHealthSave} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-obsidian-muted font-bold uppercase tracking-wider ml-1">System Status</label>
                <select value={healthFormData.healthStatus} onChange={e => setHealthFormData({...healthFormData, healthStatus: e.target.value})} className="w-full bg-obsidian-dark border border-obsidian-border rounded-xl px-4 py-2.5 text-sm text-white focus:border-status-live/50 outline-none transition-colors">
                  {['Healthy', 'Warning', 'Error', 'Unknown'].map(opt => (
                    <option key={opt} value={opt} className="bg-obsidian-dark">{opt}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-obsidian-muted font-bold uppercase tracking-wider ml-1">Health Score (0-100)</label>
                <input type="number" min="0" max="100" required value={healthFormData.healthScore} onChange={e => setHealthFormData({...healthFormData, healthScore: e.target.value})} className="w-full bg-obsidian-dark border border-obsidian-border rounded-xl px-4 py-2.5 text-sm text-white focus:border-status-live/50 outline-none transition-colors font-mono" />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[10px] text-obsidian-muted font-bold uppercase tracking-wider ml-1">Known Issues</label>
                <input type="text" value={healthFormData.issueSummary} onChange={e => setHealthFormData({...healthFormData, issueSummary: e.target.value})} className="w-full bg-obsidian-dark border border-obsidian-border rounded-xl px-4 py-2.5 text-sm text-white focus:border-status-live/50 outline-none transition-colors" placeholder="e.g., SSL expires in 2 days" />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-obsidian-muted font-bold uppercase tracking-wider ml-1">Diagnostic Notes</label>
                <textarea value={healthFormData.uptimeNote} onChange={e => setHealthFormData({...healthFormData, uptimeNote: e.target.value})} className="w-full bg-obsidian-dark border border-obsidian-border rounded-xl px-4 py-3 text-sm text-white focus:border-status-live/50 outline-none transition-colors h-24 resize-none" placeholder="Add manual health notes..."></textarea>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="submit" className="flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-status-live/20 text-status-live border border-status-live/50 hover:bg-status-live hover:text-obsidian-dark transition-all">
                  Commit Diagnostics
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
