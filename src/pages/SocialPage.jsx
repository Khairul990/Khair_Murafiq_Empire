import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Share2, Camera, Globe, Video, Image, Plus,
  CheckCircle, Trash2, Hash, Calendar, Link, AlertCircle,
} from 'lucide-react'

const SOCIAL_KEY = 'km_empire_social'

const platformIcons = {
  Instagram: Camera,
  Facebook: Globe,
  YouTube: Video,
  Blogger: Globe,
  Pinterest: Image,
}

const platformColors = {
  Instagram: 'text-pink-400 bg-pink-400/10 border-pink-400/20',
  Facebook: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  YouTube: 'text-red-400 bg-red-400/10 border-red-400/20',
  Blogger: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
  Pinterest: 'text-red-500 bg-red-500/10 border-red-500/20',
}

const statusStyles = {
  Idea: 'text-obsidian-muted bg-obsidian-card border-obsidian-border',
  Draft: 'text-status-dev bg-status-dev/10 border-status-dev/30',
  Ready: 'text-status-warning bg-status-warning/10 border-status-warning/30',
  Posted: 'text-status-live bg-status-live/10 border-status-live/30',
}

const defaultPosts = [
  { id: 1, title: 'BillQyro Launch Announcement', platform: 'Instagram', caption: 'Excited to announce BillQyro — the ultimate billing SaaS for small businesses! #BillQyro #SaaS #Billing', hashtags: ['BillQyro', 'SaaS', 'Billing', 'SmallBusiness'], scheduledDate: '2026-06-15', status: 'Draft', affiliateLink: '' },
  { id: 2, title: 'Empire OS Development Update', platform: 'Facebook', caption: 'Building the Khair Murafiq Empire OS — a centralized control center for all my projects. Golden Obsidian theme! #DevUpdate', hashtags: ['DevUpdate', 'React', 'Dashboard', 'GoldenObsidian'], scheduledDate: '2026-06-10', status: 'Idea', affiliateLink: '' },
  { id: 3, title: 'Embroidery AI Teaser', platform: 'Instagram', caption: 'AI-powered embroidery design coming soon. Stay tuned! #Embroidery #AI #Design', hashtags: ['Embroidery', 'AI', 'Design', 'ComingSoon'], scheduledDate: '2026-06-20', status: 'Idea', affiliateLink: '' },
  { id: 4, title: 'Gopal Bhar Episode Preview', platform: 'YouTube', caption: 'New Gopal Bhar cartoon episode dropping next week! Subscribe for updates. #GopalBhar #Animation #Cartoon', hashtags: ['GopalBhar', 'Animation', 'Cartoon', 'BengaliCartoon'], scheduledDate: '2026-07-01', status: 'Draft', affiliateLink: '' },
  { id: 5, title: 'TechWithKhairul Blog Post', platform: 'Blogger', caption: 'How I built a billing SaaS from scratch — full tech stack breakdown. #WebDev #React #Firebase', hashtags: ['WebDev', 'React', 'Firebase', 'SaaS'], scheduledDate: '2026-06-25', status: 'Draft', affiliateLink: '' },
  { id: 6, title: 'Daily Coding Tips Thread', platform: 'Instagram', caption: 'Daily coding tips for beginners. Follow for more! #CodingTips #WebDev #Programming', hashtags: ['CodingTips', 'WebDev', 'Programming', 'LearnToCode'], scheduledDate: '2026-06-18', status: 'Ready', affiliateLink: '' },
  { id: 7, title: 'Pinterest Embroidery Board', platform: 'Pinterest', caption: 'Curated embroidery design board — inspiration for your next project. #Embroidery #DesignInspo #DIY', hashtags: ['Embroidery', 'DesignInspo', 'DIY', 'Crafts'], scheduledDate: '2026-06-22', status: 'Idea', affiliateLink: '' },
]

const loadPosts = () => {
  try {
    const stored = localStorage.getItem(SOCIAL_KEY)
    if (stored) return JSON.parse(stored)
  } catch {}
  localStorage.setItem(SOCIAL_KEY, JSON.stringify(defaultPosts))
  return [...defaultPosts]
}

export default function SocialPage() {
  const [posts, setPosts] = useState(loadPosts)
  const [filter, setFilter] = useState('All')
  const [platform, setPlatform] = useState('All')

  const savePosts = (updated) => {
    localStorage.setItem(SOCIAL_KEY, JSON.stringify(updated))
    setPosts(updated)
  }

  const handleStatusChange = (id, status) => {
    savePosts(posts.map(p => p.id === id ? { ...p, status } : p))
  }

  const handleDelete = (id) => {
    savePosts(posts.filter(p => p.id !== id))
  }

  const filtered = posts.filter(p => {
    const matchStatus = filter === 'All' || p.status === filter
    const matchPlatform = platform === 'All' || p.platform === platform
    return matchStatus && matchPlatform
  })

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      {/* Header */}
      <div>
        <h1 className="text-xl lg:text-2xl font-extrabold text-white">
          Social Media <span className="gold-gradient-text">Planner</span>
        </h1>
        <p className="text-xs text-obsidian-muted mt-1">
          Plan and schedule posts across {posts.filter(p => p.status === 'Posted').length} platforms
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {['All', 'Idea', 'Draft', 'Ready', 'Posted'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === s ? 'bg-gold/10 text-gold border border-gold/20' : 'bg-obsidian-card text-obsidian-muted border border-obsidian-border hover:text-white'
            }`}
          >
            {s}
          </button>
        ))}
        <div className="w-px h-5 bg-obsidian-border mx-1" />
        {['All', 'Instagram', 'Facebook', 'YouTube', 'Blogger', 'Pinterest'].map(p => (
          <button key={p} onClick={() => setPlatform(p)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              platform === p ? 'bg-gold/10 text-gold border border-gold/20' : 'bg-obsidian-card text-obsidian-muted border border-obsidian-border hover:text-white'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Post Cards */}
      <div className="space-y-3">
        {filtered.map((post, i) => {
          const PlatformIcon = platformIcons[post.platform] || Globe
          return (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="glass-card rounded-2xl p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${platformColors[post.platform]}`}>
                      <PlatformIcon className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="text-sm font-bold text-white">{post.title}</h3>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold border ${statusStyles[post.status]}`}>
                      {post.status}
                    </span>
                  </div>
                  <p className="text-xs text-obsidian-muted/80 line-clamp-2 mb-2">{post.caption}</p>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-obsidian-muted">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {post.scheduledDate}</span>
                    <span className="flex items-center gap-1"><Hash className="w-3 h-3" /> {post.hashtags.slice(0, 3).join(', ')}{post.hashtags.length > 3 ? '...' : ''}</span>
                    {post.affiliateLink && <span className="flex items-center gap-1"><Link className="w-3 h-3" /> Affiliate</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {post.status === 'Idea' && (
                    <button onClick={() => handleStatusChange(post.id, 'Draft')} className="px-2 py-1 text-[10px] font-medium bg-status-dev/10 text-status-dev border border-status-dev/20 rounded-lg hover:bg-status-dev/20 transition-all">
                      To Draft
                    </button>
                  )}
                  {post.status === 'Draft' && (
                    <button onClick={() => handleStatusChange(post.id, 'Ready')} className="px-2 py-1 text-[10px] font-medium bg-status-warning/10 text-status-warning border border-status-warning/20 rounded-lg hover:bg-status-warning/20 transition-all">
                      Mark Ready
                    </button>
                  )}
                  {post.status === 'Ready' && (
                    <button onClick={() => handleStatusChange(post.id, 'Posted')} className="px-2 py-1 text-[10px] font-medium bg-status-live/10 text-status-live border border-status-live/20 rounded-lg hover:bg-status-live/20 transition-all">
                      Mark Posted
                    </button>
                  )}
                  <button onClick={() => handleDelete(post.id)} className="p-1.5 rounded-lg hover:bg-status-error/10 text-status-error/60 hover:text-status-error transition-all" title="Delete">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Note */}
      <div className="glass-card rounded-2xl p-4 border border-status-dev/20">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-status-dev" />
          <p className="text-xs text-obsidian-muted">
            Auto posting will be added later only through official APIs.
          </p>
        </div>
      </div>
    </motion.div>
  )
}
