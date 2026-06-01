import { ExternalLink, Code, Globe, Shield, FileText } from 'lucide-react'

const statusColors = {
  Live: 'live',
  Development: 'dev',
  Warning: 'warning',
  Error: 'error',
  Maintenance: 'maintenance',
  Paused: 'paused',
  Planning: 'planning',
  Building: 'building',
}

export default function ProjectCard({ project }) {
  const statusClass = statusColors[project.status] || 'offline'

  return (
    <div className="glass-card-hover rounded-2xl p-5 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-white font-bold text-base truncate">{project.name}</h3>
          <p className="text-xs text-obsidian-muted mt-0.5">{project.type}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-3">
          <span className={`status-dot ${statusClass}`} />
          <span className={`text-[11px] font-semibold ${
            project.status === 'Live' ? 'text-status-live' :
            project.status === 'Development' || project.status === 'Building' ? 'text-status-dev' :
            project.status === 'Warning' ? 'text-status-warning' :
            project.status === 'Error' ? 'text-status-error' :
            project.status === 'Maintenance' ? 'text-status-maintenance' :
            'text-obsidian-muted'
          }`}>
            {project.status}
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-1.5 mb-4 flex-1">
        <p className="text-xs text-obsidian-muted leading-relaxed line-clamp-2">{project.notes}</p>
        
        <div className="flex items-center gap-4 pt-2">
          <div className="flex items-center gap-1.5">
            <Globe className="w-3 h-3 text-obsidian-muted" />
            <span className="text-[11px] text-obsidian-muted">{project.lastChecked}</span>
          </div>
        </div>

        {project.tech && project.tech.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {project.tech.map((t, i) => (
              <span key={i} className="px-2 py-0.5 text-[10px] font-medium bg-obsidian-light/30 text-obsidian-muted rounded-md">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 pt-3 border-t border-obsidian-border mt-auto">
        <a
          href={project.liveUrl !== '#' ? project.liveUrl : undefined}
          className={`flex-1 min-w-[45%] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
            project.liveUrl !== '#'
              ? 'bg-gold/10 text-gold border border-gold/20 hover:bg-gold/20'
              : 'bg-obsidian-card text-obsidian-muted/50 border border-obsidian-border cursor-not-allowed'
          }`}
          target="_blank" rel="noopener noreferrer"
          onClick={project.liveUrl === '#' ? (e) => e.preventDefault() : undefined}
        >
          <Globe className="w-3 h-3" /> Website
        </a>
        <a
          href={project.adminUrl !== '#' ? project.adminUrl : undefined}
          className={`flex-1 min-w-[45%] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
            project.adminUrl !== '#'
              ? 'bg-obsidian-light text-white border border-obsidian-light hover:bg-obsidian-light/80'
              : 'bg-obsidian-card text-obsidian-muted/50 border border-obsidian-border cursor-not-allowed'
          }`}
          target="_blank" rel="noopener noreferrer"
          onClick={project.adminUrl === '#' ? (e) => e.preventDefault() : undefined}
        >
          <Shield className="w-3 h-3" /> Admin
        </a>
        <a
          href={project.githubUrl !== '#' ? project.githubUrl : undefined}
          className="flex-1 min-w-[30%] flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl text-[11px] font-semibold bg-obsidian-card text-obsidian-muted border border-obsidian-border hover:border-obsidian-light hover:text-white transition-all"
          target="_blank" rel="noopener noreferrer"
          onClick={project.githubUrl === '#' ? (e) => e.preventDefault() : undefined}
        >
          <Code className="w-3 h-3" /> GitHub
        </a>
        <a
          href={project.vercelUrl !== '#' ? project.vercelUrl : undefined}
          className="flex-1 min-w-[30%] flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl text-[11px] font-semibold bg-obsidian-card text-obsidian-muted border border-obsidian-border hover:border-obsidian-light hover:text-white transition-all"
          target="_blank" rel="noopener noreferrer"
          onClick={project.vercelUrl === '#' ? (e) => e.preventDefault() : undefined}
        >
          <ExternalLink className="w-3 h-3" /> Vercel
        </a>
        <button className="flex-1 min-w-[30%] flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl text-[11px] font-semibold bg-obsidian-card text-obsidian-muted border border-obsidian-border hover:text-gold transition-all">
          <FileText className="w-3 h-3" /> Details
        </button>
      </div>
    </div>
  )
}
