import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, ExternalLink, Globe } from 'lucide-react'
import ProjectCard from '../components/ProjectCard'
import projects from '../data/projects'

export default function ProjectsPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')

  const filters = ['All', 'Live', 'Development', 'Planning', 'Building']

  const filtered = projects.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                        p.type.toLowerCase().includes(search.toLowerCase())
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
      <div>
        <h1 className="text-xl lg:text-2xl font-extrabold text-white">
          Website <span className="gold-gradient-text">Control Room</span>
        </h1>
        <p className="text-xs text-obsidian-muted mt-1">
          Manage all {projects.length} empire projects from one place
        </p>
      </div>

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
          {filters.map(f => (
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
            <ProjectCard project={p} />
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <Globe className="w-12 h-12 text-obsidian-muted/30 mx-auto mb-3" />
          <p className="text-sm text-obsidian-muted">No projects match your search.</p>
        </div>
      )}
    </motion.div>
  )
}
