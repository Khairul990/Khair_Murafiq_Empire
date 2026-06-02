import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Share2, Camera, Globe, Video, Image, Plus, X,
  CheckCircle, Trash2, Hash, Calendar, Link, AlertCircle, Loader2, LayoutDashboard
} from 'lucide-react'
import { storageAdapter } from '../services/storageAdapter'
import { auth } from '../services/firebaseConfig'

const platformIcons = {
  Instagram: Camera,
  Facebook: Globe,
  YouTube: Video,
  Blog: Globe,
  Pinterest: Image,
  Other: Share2
}

const platformColors = {
  Instagram: 'text-pink-400 bg-pink-400/10 border-pink-400/30 shadow-[0_0_10px_rgba(244,114,182,0.1)]',
  Facebook: 'text-blue-400 bg-blue-400/10 border-blue-400/30 shadow-[0_0_10px_rgba(96,165,250,0.1)]',
  YouTube: 'text-red-400 bg-red-400/10 border-red-400/30 shadow-[0_0_10px_rgba(248,113,113,0.1)]',
  Blog: 'text-orange-400 bg-orange-400/10 border-orange-400/30 shadow-[0_0_10px_rgba(251,146,60,0.1)]',
  Pinterest: 'text-red-500 bg-red-500/10 border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.1)]',
  Other: 'text-gold bg-gold/10 border-gold/30 shadow-[0_0_10px_rgba(242,201,76,0.1)]'
}

const statusStyles = {
  Idea: 'text-obsidian-muted bg-obsidian-card border-obsidian-border',
  Draft: 'text-cyan-signal bg-cyan-signal/10 border-cyan-signal/30 shadow-[0_0_10px_rgba(6,182,212,0.1)]',
  Ready: 'text-status-warning bg-status-warning/10 border-status-warning/30 shadow-[0_0_10px_rgba(249,115,22,0.1)]',
  Scheduled: 'text-blue-400 bg-blue-400/10 border-blue-400/30 shadow-[0_0_10px_rgba(96,165,250,0.1)]',
  Posted: 'text-status-live bg-status-live/10 border-status-live/30 shadow-[0_0_10px_rgba(34,197,94,0.1)]',
}

export default function SocialPage() {
  const [posts, setPosts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  
  const [filterStatus, setFilterStatus] = useState('All')
  const [filterPlatform, setFilterPlatform] = useState('All')

  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    platform: 'Instagram', websiteLink: '', title: '', caption: '', hashtags: '', 
    contentType: 'Post', status: 'Idea', scheduledDate: '', notes: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const reports = await storageAdapter.getReports()
      // Filter strictly for social posts
      const social = reports.filter(r => r.docType === 'social_post')
      setPosts(social)
    } catch (err) {
      setErrorMsg('Firebase unavailable. Local fallback active.')
    }
    setIsLoading(false)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    
    const postToSave = {
      ...formData,
      id: editingId || Date.now().toString(),
      docType: 'social_post',
      ownerEmail: auth.currentUser?.email || 'khairul2052007@gmail.com',
      createdAt: editingId ? (posts.find(p => p.id === editingId)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const newPosts = editingId
      ? posts.map(p => p.id === editingId ? postToSave : p)
      : [postToSave, ...posts]

    setPosts(newPosts)
    setShowAdd(false)
    setEditingId(null)
    setFormData({ platform: 'Instagram', websiteLink: '', title: '', caption: '', hashtags: '', contentType: 'Post', status: 'Idea', scheduledDate: '', notes: '' })
    
    // We need to pass allReports to storageAdapter, but we only have social posts in state.
    // So we must fetch all reports, replace the matching ones, and save.
    // Or storageAdapter can just save one report to Firebase and append to localFallback.
    // For local fallback safety, we fetch all first:
    const allReports = await storageAdapter.getReports()
    const updatedReports = editingId
      ? allReports.map(r => r.id === editingId ? postToSave : r)
      : [postToSave, ...allReports]
      
    await storageAdapter.saveReport(postToSave, updatedReports)
  }

  const handleEdit = (post) => {
    if (!auth.currentUser || auth.currentUser.email !== 'khairul2052007@gmail.com') {
      alert("Access Denied: Owner login required.")
      return
    }
    setFormData({
      platform: post.platform || 'Instagram',
      websiteLink: post.websiteLink || post.affiliateLink || '',
      title: post.title || '',
      caption: post.caption || '',
      hashtags: Array.isArray(post.hashtags) ? post.hashtags.join(', ') : (post.hashtags || ''),
      contentType: post.contentType || 'Post',
      status: post.status || 'Idea',
      scheduledDate: post.scheduledDate || '',
      notes: post.notes || ''
    })
    setEditingId(post.id)
    setShowAdd(true)
  }

  const handleDelete = async (id) => {
    if (!auth.currentUser || auth.currentUser.email !== 'khairul2052007@gmail.com') {
      alert("Access Denied: Owner login required for this dangerous action.")
      return
    }
    if (window.confirm('Are you sure you want to delete this post?')) {
      const newPosts = posts.filter(p => p.id !== id)
      setPosts(newPosts)
      
      const allReports = await storageAdapter.getReports()
      const updatedReports = allReports.filter(r => r.id !== id)
      await storageAdapter.deleteReport(id, updatedReports)
    }
  }

  const filtered = posts.filter(p => {
    const matchStatus = filterStatus === 'All' || p.status === filterStatus
    const matchPlatform = filterPlatform === 'All' || p.platform === filterPlatform
    return matchStatus && matchPlatform
  })

  // Summary Metrics
  const totalPlanned = posts.length
  const totalReady = posts.filter(p => p.status === 'Ready').length
  const totalScheduled = posts.filter(p => p.status === 'Scheduled').length
  const totalPosted = posts.filter(p => p.status === 'Posted').length

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
            Social <span className="gold-gradient-text">Planner</span>
            {isLoading && <Loader2 className="w-5 h-5 animate-spin text-gold" />}
          </h1>
          <p className="text-xs text-obsidian-muted mt-1 uppercase tracking-widest font-bold">
            {isLoading ? 'Syncing...' : `Plan and schedule posts across your ecosystem`}
          </p>
          {errorMsg && <p className="text-[10px] text-status-error mt-2 bg-status-error/10 px-2 py-1 rounded inline-block">{errorMsg}</p>}
        </div>
        <button
          onClick={() => {
            setEditingId(null)
            setFormData({ platform: 'Instagram', websiteLink: '', title: '', caption: '', hashtags: '', contentType: 'Post', status: 'Idea', scheduledDate: '', notes: '' })
            setShowAdd(!showAdd)
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider gold-gradient text-obsidian-dark hover:shadow-[0_0_20px_rgba(242,201,76,0.3)] transition-all flex-shrink-0"
        >
          {showAdd ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showAdd ? 'Cancel Edit' : 'New Content'}
        </button>
      </div>

      {/* Manual Warning Note */}
      <div className="glass-card rounded-2xl p-5 border border-cyan-signal/30 bg-cyan-signal/5 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 h-full bg-cyan-signal" />
        <div className="flex items-center gap-3 pl-2">
          <AlertCircle className="w-5 h-5 text-cyan-signal flex-shrink-0 animate-pulse" />
          <p className="text-[11px] font-bold uppercase tracking-wide text-cyan-signal">
            Manual Planning Mode Active. <span className="text-obsidian-muted font-medium ml-1">Auto-posting requires official API integration. Do not store social media passwords here.</span>
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-obsidian-border hover:border-gold/30 transition-colors relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-gold/5 blur-[20px] group-hover:bg-gold/10 transition-colors" />
          <div className="flex items-center gap-2 mb-3">
            <LayoutDashboard className="w-4 h-4 text-obsidian-muted" />
            <span className="text-[10px] font-black uppercase tracking-wider text-obsidian-muted">Total Planned</span>
          </div>
          <p className="text-2xl font-black text-white">{totalPlanned}</p>
        </div>
        <div className="glass-card rounded-2xl p-5 border border-status-warning/20 hover:border-status-warning/40 transition-colors relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-16 h-16 bg-status-warning/5 blur-[20px] group-hover:bg-status-warning/10 transition-colors" />
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-4 h-4 text-status-warning" />
            <span className="text-[10px] font-black uppercase tracking-wider text-obsidian-muted">Ready to Post</span>
          </div>
          <p className="text-2xl font-black text-status-warning">{totalReady}</p>
        </div>
        <div className="glass-card rounded-2xl p-5 border border-blue-400/20 hover:border-blue-400/40 transition-colors relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-16 h-16 bg-blue-400/5 blur-[20px] group-hover:bg-blue-400/10 transition-colors" />
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-blue-400" />
            <span className="text-[10px] font-black uppercase tracking-wider text-obsidian-muted">Scheduled</span>
          </div>
          <p className="text-2xl font-black text-blue-400">{totalScheduled}</p>
        </div>
        <div className="glass-card rounded-2xl p-5 border border-status-live/20 hover:border-status-live/40 transition-colors relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-16 h-16 bg-status-live/5 blur-[20px] group-hover:bg-status-live/10 transition-colors" />
          <div className="flex items-center gap-2 mb-3">
            <Share2 className="w-4 h-4 text-status-live" />
            <span className="text-[10px] font-black uppercase tracking-wider text-obsidian-muted">Successfully Posted</span>
          </div>
          <p className="text-2xl font-black text-status-live">{totalPosted}</p>
        </div>
      </div>

      {/* Add / Edit Form */}
      {showAdd && (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="glass-card rounded-2xl p-6 border border-gold/30 shadow-[0_0_30px_rgba(242,201,76,0.1)] relative overflow-hidden"
          onSubmit={handleSave}
        >
          <div className="absolute top-0 left-0 w-full h-1 gold-gradient" />
          <h3 className="text-sm font-black text-white mb-5 uppercase tracking-wider flex items-center gap-2">
             <Share2 className="w-5 h-5 text-gold" />
             {editingId ? 'Modify Content' : 'Draft New Content'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="space-y-1.5">
              <label className="text-[10px] text-obsidian-muted font-bold uppercase tracking-wider ml-1">Platform *</label>
              <select required value={formData.platform} onChange={e => setFormData({...formData, platform: e.target.value})} className="w-full bg-obsidian-dark/50 border border-obsidian-border rounded-xl px-4 py-2.5 text-sm text-white focus:border-gold/50 outline-none transition-all">
                {['Facebook', 'Instagram', 'YouTube', 'Pinterest', 'Blog', 'Other'].map(opt => (
                  <option key={opt} value={opt} className="bg-obsidian-dark">{opt}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] text-obsidian-muted font-bold uppercase tracking-wider ml-1">Format Type</label>
              <select value={formData.contentType} onChange={e => setFormData({...formData, contentType: e.target.value})} className="w-full bg-obsidian-dark/50 border border-obsidian-border rounded-xl px-4 py-2.5 text-sm text-white focus:border-gold/50 outline-none transition-all">
                {['Post', 'Reel', 'Story', 'Blog', 'Video'].map(opt => (
                  <option key={opt} value={opt} className="bg-obsidian-dark">{opt}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] text-obsidian-muted font-bold uppercase tracking-wider ml-1">Status</label>
              <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-obsidian-dark/50 border border-obsidian-border rounded-xl px-4 py-2.5 text-sm text-white focus:border-gold/50 outline-none transition-all">
                {['Idea', 'Draft', 'Ready', 'Scheduled', 'Posted'].map(opt => (
                  <option key={opt} value={opt} className="bg-obsidian-dark">{opt}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] text-obsidian-muted font-bold uppercase tracking-wider ml-1">Content Title *</label>
              <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-obsidian-dark/50 border border-obsidian-border rounded-xl px-4 py-2.5 text-sm text-white focus:border-gold/50 outline-none transition-all" placeholder="Internal name for this post" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] text-obsidian-muted font-bold uppercase tracking-wider ml-1">Target URL</label>
              <input value={formData.websiteLink} onChange={e => setFormData({...formData, websiteLink: e.target.value})} className="w-full bg-obsidian-dark/50 border border-obsidian-border rounded-xl px-4 py-2.5 text-sm text-white focus:border-gold/50 outline-none transition-all" placeholder="https://..." />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] text-obsidian-muted font-bold uppercase tracking-wider ml-1">Scheduled Date</label>
              <input type="date" value={formData.scheduledDate} onChange={e => setFormData({...formData, scheduledDate: e.target.value})} className="w-full bg-obsidian-dark/50 border border-obsidian-border rounded-xl px-4 py-2.5 text-sm text-white focus:border-gold/50 outline-none transition-all" />
            </div>
            <div className="col-span-1 md:col-span-2 lg:col-span-3 space-y-1.5">
              <label className="text-[10px] text-obsidian-muted font-bold uppercase tracking-wider ml-1">Caption / Script *</label>
              <textarea required value={formData.caption} onChange={e => setFormData({...formData, caption: e.target.value})} className="w-full bg-obsidian-dark/50 border border-obsidian-border rounded-xl px-4 py-3 text-sm text-white focus:border-gold/50 outline-none transition-all h-28 resize-none" placeholder="Write the actual post caption here..." />
            </div>
            <div className="col-span-1 md:col-span-2 space-y-1.5">
              <label className="text-[10px] text-obsidian-muted font-bold uppercase tracking-wider ml-1">Hashtags</label>
              <input value={formData.hashtags} onChange={e => setFormData({...formData, hashtags: e.target.value})} className="w-full bg-obsidian-dark/50 border border-obsidian-border rounded-xl px-4 py-2.5 text-sm text-white focus:border-gold/50 outline-none transition-all" placeholder="Comma separated (e.g. SaaS, Business, Tech)" />
            </div>
            <div className="col-span-1 md:col-span-2 lg:col-span-3 space-y-1.5">
              <label className="text-[10px] text-obsidian-muted font-bold uppercase tracking-wider ml-1">Internal Notes</label>
              <input value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full bg-obsidian-dark/50 border border-obsidian-border rounded-xl px-4 py-2.5 text-sm text-white focus:border-gold/50 outline-none transition-all" placeholder="Reminders, tags, or team notes..." />
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="submit" className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider gold-gradient text-obsidian-dark hover:shadow-[0_0_20px_rgba(242,201,76,0.3)] transition-all flex-1 sm:flex-none">
              {editingId ? 'Update Content' : 'Save Content'}
            </button>
            <button type="button" onClick={() => setShowAdd(false)} className="px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-obsidian-dark text-obsidian-muted border border-obsidian-border hover:text-white transition-all flex-1 sm:flex-none">
              Cancel
            </button>
          </div>
        </motion.form>
      )}

      {/* Filters */}
      <div className="glass-card p-2 rounded-2xl border border-obsidian-border flex flex-wrap items-center gap-2">
        <div className="flex gap-1.5 p-1 overflow-x-auto empire-scrollbar">
          {['All', 'Idea', 'Draft', 'Ready', 'Scheduled', 'Posted'].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                filterStatus === s ? 'bg-gold/10 text-gold border border-gold/30 shadow-[0_0_10px_rgba(242,201,76,0.1)]' : 'bg-transparent text-obsidian-muted border border-transparent hover:bg-obsidian-dark hover:text-white'
              }`}
            >
              {s === 'All' ? 'All Status' : s}
            </button>
          ))}
        </div>
        
        <div className="hidden lg:block h-6 w-px bg-obsidian-border mx-2" />
        
        <div className="flex gap-1.5 p-1 overflow-x-auto empire-scrollbar flex-1">
          {['All', 'Facebook', 'Instagram', 'YouTube', 'Pinterest', 'Blog', 'Other'].map(p => (
            <button key={p} onClick={() => setFilterPlatform(p)}
              className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 whitespace-nowrap ${
                filterPlatform === p ? 'bg-gold/10 text-gold border border-gold/30 shadow-[0_0_10px_rgba(242,201,76,0.1)]' : 'bg-transparent text-obsidian-muted border border-transparent hover:bg-obsidian-dark hover:text-white'
              }`}
            >
              {p === 'All' ? 'All Platforms' : p}
            </button>
          ))}
        </div>
      </div>

      {/* Post Cards */}
      <div className="space-y-4">
        {filtered.map((post, i) => {
          const PlatformIcon = platformIcons[post.platform] || platformIcons.Other
          const hashtagArray = Array.isArray(post.hashtags) ? post.hashtags : (post.hashtags || '').split(',').filter(Boolean)
          
          return (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="glass-card rounded-2xl p-5 hover:border-gold/30 transition-all cursor-pointer group"
              onClick={() => handleEdit(post)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${platformColors[post.platform] || platformColors.Other}`}>
                      <PlatformIcon className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-white group-hover:text-gold transition-colors">{post.title}</h3>
                    <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider border ${statusStyles[post.status] || statusStyles.Idea}`}>
                      {post.status}
                    </span>
                    {post.contentType && (
                      <span className="px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider bg-obsidian-dark text-obsidian-muted border border-obsidian-border">
                        {post.contentType}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-obsidian-muted/80 line-clamp-2 mb-3 mt-1 leading-relaxed">{post.caption}</p>
                  <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold uppercase tracking-wider text-obsidian-muted">
                    {post.scheduledDate && <span className="flex items-center gap-1.5 text-blue-400"><Calendar className="w-3.5 h-3.5" /> {post.scheduledDate}</span>}
                    {hashtagArray.length > 0 && <span className="flex items-center gap-1.5"><Hash className="w-3.5 h-3.5" /> {hashtagArray.slice(0, 3).join(', ')}{hashtagArray.length > 3 ? '...' : ''}</span>}
                    {post.websiteLink && <span className="flex items-center gap-1.5"><Link className="w-3.5 h-3.5" /> Link Included</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(post.id) }} className="p-2.5 rounded-xl hover:bg-status-error/20 text-status-error/60 hover:text-status-error border border-transparent hover:border-status-error/30 transition-all" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {filtered.length === 0 && !isLoading && (
        <div className="text-center py-16 border border-dashed border-obsidian-border rounded-2xl glass-card">
          <Globe className="w-12 h-12 text-obsidian-muted/30 mx-auto mb-4" />
          <p className="text-sm font-black uppercase tracking-wider text-white mb-1">No Social Content</p>
          <p className="text-xs text-obsidian-muted">Draft a new post to populate your planner.</p>
        </div>
      )}
    </motion.div>
  )
}
