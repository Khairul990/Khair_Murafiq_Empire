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
  Instagram: 'text-pink-400 bg-pink-400/10 border-pink-400/20',
  Facebook: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  YouTube: 'text-red-400 bg-red-400/10 border-red-400/20',
  Blog: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
  Pinterest: 'text-red-500 bg-red-500/10 border-red-500/20',
  Other: 'text-gold bg-gold/10 border-gold/20'
}

const statusStyles = {
  Idea: 'text-obsidian-muted bg-obsidian-card border-obsidian-border',
  Draft: 'text-status-dev bg-status-dev/10 border-status-dev/30',
  Ready: 'text-status-warning bg-status-warning/10 border-status-warning/30',
  Scheduled: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  Posted: 'text-status-live bg-status-live/10 border-status-live/30',
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
      className="space-y-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-extrabold text-white flex items-center gap-2">
            Social <span className="gold-gradient-text">Planner</span>
            {isLoading && <Loader2 className="w-4 h-4 animate-spin text-gold" />}
          </h1>
          <p className="text-xs text-obsidian-muted mt-1">
            {isLoading ? 'Loading...' : `Plan and schedule posts across your ecosystem`}
          </p>
          {errorMsg && <p className="text-[10px] text-status-error mt-1">{errorMsg}</p>}
        </div>
        <button
          onClick={() => {
            setEditingId(null)
            setFormData({ platform: 'Instagram', websiteLink: '', title: '', caption: '', hashtags: '', contentType: 'Post', status: 'Idea', scheduledDate: '', notes: '' })
            setShowAdd(!showAdd)
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold gold-gradient text-obsidian-dark hover:opacity-90 transition-all flex-shrink-0"
        >
          {showAdd ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          {showAdd ? 'Close Form' : 'Add Post'}
        </button>
      </div>

      {/* Manual Warning Note */}
      <div className="glass-card rounded-2xl p-4 border border-status-dev/30 bg-status-dev/5">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-status-dev flex-shrink-0" />
          <p className="text-sm font-semibold text-status-dev">
            Manual planning only. <span className="font-normal text-obsidian-muted">Auto-posting requires official API later. Do not store social media passwords here.</span>
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <LayoutDashboard className="w-4 h-4 text-obsidian-muted" />
            <span className="text-xs text-obsidian-muted">Total Planned</span>
          </div>
          <p className="text-xl font-extrabold text-white">{totalPlanned}</p>
        </div>
        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-status-warning" />
            <span className="text-xs text-obsidian-muted">Ready Posts</span>
          </div>
          <p className="text-xl font-extrabold text-status-warning">{totalReady}</p>
        </div>
        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-obsidian-muted">Scheduled</span>
          </div>
          <p className="text-xl font-extrabold text-blue-400">{totalScheduled}</p>
        </div>
        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Share2 className="w-4 h-4 text-status-live" />
            <span className="text-xs text-obsidian-muted">Posted</span>
          </div>
          <p className="text-xl font-extrabold text-status-live">{totalPosted}</p>
        </div>
      </div>

      {/* Add / Edit Form */}
      {showAdd && (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="glass-card rounded-2xl p-5 border border-gold/20"
          onSubmit={handleSave}
        >
          <h3 className="text-sm font-bold text-white mb-4">{editingId ? 'Edit Post' : 'Add New Post'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] text-obsidian-muted font-medium ml-1">Platform *</label>
              <select required value={formData.platform} onChange={e => setFormData({...formData, platform: e.target.value})} className="w-full bg-obsidian-dark border border-obsidian-border rounded-xl px-3 py-2 text-sm text-white focus:border-gold/30 outline-none transition-colors">
                {['Facebook', 'Instagram', 'YouTube', 'Pinterest', 'Blog', 'Other'].map(opt => (
                  <option key={opt} value={opt} className="bg-obsidian-dark">{opt}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-obsidian-muted font-medium ml-1">Content Type</label>
              <select value={formData.contentType} onChange={e => setFormData({...formData, contentType: e.target.value})} className="w-full bg-obsidian-dark border border-obsidian-border rounded-xl px-3 py-2 text-sm text-white focus:border-gold/30 outline-none transition-colors">
                {['Post', 'Reel', 'Story', 'Blog', 'Video'].map(opt => (
                  <option key={opt} value={opt} className="bg-obsidian-dark">{opt}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-obsidian-muted font-medium ml-1">Status</label>
              <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-obsidian-dark border border-obsidian-border rounded-xl px-3 py-2 text-sm text-white focus:border-gold/30 outline-none transition-colors">
                {['Idea', 'Draft', 'Ready', 'Scheduled', 'Posted'].map(opt => (
                  <option key={opt} value={opt} className="bg-obsidian-dark">{opt}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-obsidian-muted font-medium ml-1">Post Title *</label>
              <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-obsidian-dark border border-obsidian-border rounded-xl px-3 py-2 text-sm text-white focus:border-gold/30 outline-none transition-colors" placeholder="Internal name for this post" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-obsidian-muted font-medium ml-1">Website / Project Link</label>
              <input value={formData.websiteLink} onChange={e => setFormData({...formData, websiteLink: e.target.value})} className="w-full bg-obsidian-dark border border-obsidian-border rounded-xl px-3 py-2 text-sm text-white focus:border-gold/30 outline-none transition-colors" placeholder="https://..." />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-obsidian-muted font-medium ml-1">Scheduled Date</label>
              <input type="date" value={formData.scheduledDate} onChange={e => setFormData({...formData, scheduledDate: e.target.value})} className="w-full bg-obsidian-dark border border-obsidian-border rounded-xl px-3 py-2 text-sm text-white focus:border-gold/30 outline-none transition-colors" />
            </div>
            <div className="col-span-1 md:col-span-2 lg:col-span-3 space-y-1">
              <label className="text-[11px] text-obsidian-muted font-medium ml-1">Caption / Content *</label>
              <textarea required value={formData.caption} onChange={e => setFormData({...formData, caption: e.target.value})} className="w-full bg-obsidian-dark border border-obsidian-border rounded-xl px-3 py-2 text-sm text-white focus:border-gold/30 outline-none transition-colors h-24 resize-none" placeholder="Write the actual post caption here..." />
            </div>
            <div className="col-span-1 md:col-span-2 space-y-1">
              <label className="text-[11px] text-obsidian-muted font-medium ml-1">Hashtags</label>
              <input value={formData.hashtags} onChange={e => setFormData({...formData, hashtags: e.target.value})} className="w-full bg-obsidian-dark border border-obsidian-border rounded-xl px-3 py-2 text-sm text-white focus:border-gold/30 outline-none transition-colors" placeholder="Comma separated (e.g. SaaS, Business, Tech)" />
            </div>
            <div className="col-span-1 md:col-span-2 lg:col-span-3 space-y-1">
              <label className="text-[11px] text-obsidian-muted font-medium ml-1">Internal Notes</label>
              <input value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full bg-obsidian-dark border border-obsidian-border rounded-xl px-3 py-2 text-sm text-white focus:border-gold/30 outline-none transition-colors" placeholder="Reminders, tags, or team notes..." />
            </div>
          </div>
          <div className="mt-5 flex gap-3">
            <button type="submit" className="px-5 py-2 rounded-xl text-xs font-bold gold-gradient text-obsidian-dark hover:opacity-90 transition-all">
              {editingId ? 'Update Post' : 'Save Post'}
            </button>
            <button type="button" onClick={() => setShowAdd(false)} className="px-5 py-2 rounded-xl text-xs font-bold bg-obsidian-dark text-obsidian-muted border border-obsidian-border hover:text-white transition-all">
              Cancel
            </button>
          </div>
        </motion.form>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {['All', 'Idea', 'Draft', 'Ready', 'Scheduled', 'Posted'].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filterStatus === s ? 'bg-gold/10 text-gold border border-gold/20' : 'bg-obsidian-card text-obsidian-muted border border-obsidian-border hover:text-white'
            }`}
          >
            {s}
          </button>
        ))}
        <div className="w-px h-5 bg-obsidian-border mx-1" />
        {['All', 'Facebook', 'Instagram', 'YouTube', 'Pinterest', 'Blog', 'Other'].map(p => (
          <button key={p} onClick={() => setFilterPlatform(p)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filterPlatform === p ? 'bg-gold/10 text-gold border border-gold/20' : 'bg-obsidian-card text-obsidian-muted border border-obsidian-border hover:text-white'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Post Cards */}
      <div className="space-y-3">
        {filtered.map((post, i) => {
          const PlatformIcon = platformIcons[post.platform] || platformIcons.Other
          const hashtagArray = Array.isArray(post.hashtags) ? post.hashtags : (post.hashtags || '').split(',').filter(Boolean)
          
          return (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="glass-card rounded-2xl p-4 hover:border-gold/20 transition-all cursor-pointer group"
              onClick={() => handleEdit(post)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${platformColors[post.platform] || platformColors.Other}`}>
                      <PlatformIcon className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="text-sm font-bold text-white group-hover:text-gold transition-colors">{post.title}</h3>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold border ${statusStyles[post.status] || statusStyles.Idea}`}>
                      {post.status}
                    </span>
                    {post.contentType && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-obsidian-dark text-obsidian-muted border border-obsidian-border">
                        {post.contentType}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-obsidian-muted/80 line-clamp-2 mb-2">{post.caption}</p>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-obsidian-muted">
                    {post.scheduledDate && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {post.scheduledDate}</span>}
                    {hashtagArray.length > 0 && <span className="flex items-center gap-1"><Hash className="w-3 h-3" /> {hashtagArray.slice(0, 3).join(', ')}{hashtagArray.length > 3 ? '...' : ''}</span>}
                    {post.websiteLink && <span className="flex items-center gap-1"><Link className="w-3 h-3" /> Link Included</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(post.id) }} className="p-2 rounded-lg hover:bg-status-error/10 text-status-error/60 hover:text-status-error transition-all" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {filtered.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Globe className="w-12 h-12 text-obsidian-muted/30 mx-auto mb-3" />
          <p className="text-sm text-obsidian-muted">No social posts yet</p>
        </div>
      )}
    </motion.div>
  )
}
