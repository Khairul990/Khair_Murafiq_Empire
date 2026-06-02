import { ExternalLink, Code, Globe, Shield, FileText, Database, Edit2, Trash2, AlertTriangle, PlusCircle, Activity, Radar, Fingerprint } from 'lucide-react'

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

export default function ProjectCard({ project, onEdit, onDelete, onAddAlert, onUpdateHealth, alerts = [], tasks = [], agentEvents = [] }) {
  const statusClass = statusColors[project.status] || 'offline'
  
  const projectAlerts = alerts.filter(a => a.projectId === project.id && a.status !== 'Fixed' && a.status !== 'Ignored')
  const hasCritical = projectAlerts.some(a => a.severity === 'Critical')

  const projectTasks = tasks.filter(t => t.projectId === project.id)
  const activeTasks = projectTasks.filter(t => t.status !== 'Done')

  const projectAgentEvents = agentEvents.filter(e => e.websiteId === project.id || (project.websiteId && e.websiteId === project.websiteId))

  let computedHealth = project.healthStatus || 'Unknown'
  if (hasCritical) computedHealth = 'Error'
  else if (projectAlerts.some(a => a.severity === 'High')) computedHealth = 'Warning'

  const healthColor = 
    computedHealth === 'Healthy' ? 'text-status-live' :
    computedHealth === 'Warning' ? 'text-status-warning' :
    computedHealth === 'Error' ? 'text-status-error animate-pulse' :
    'text-obsidian-muted'

  // Category Metrics Fallback UI
  const renderCategoryMetrics = () => {
    return (
      <div className="mt-3 p-3 rounded-xl bg-obsidian-dark/50 border border-obsidian-border/50 text-[10px] text-obsidian-muted flex flex-col justify-center items-center text-center">
        <Activity className="w-4 h-4 mb-1 opacity-50" />
        {project.category ? `${project.category} metrics not connected yet` : 'Category metrics not connected yet'}
      </div>
    )
  }

  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col h-full border border-obsidian-border hover:border-gold/20 transition-all group relative overflow-hidden">
      {/* Top Border Glow based on status */}
      <div className={`absolute top-0 left-0 w-full h-1 ${project.status === 'Live' ? 'bg-cyan-signal shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'bg-obsidian-border'}`} />

      {/* Header */}
      <div className="flex items-start justify-between mb-4 mt-1">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-white font-bold text-base truncate">{project.name}</h3>
            {projectAlerts.length > 0 && (
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${hasCritical ? 'text-status-error bg-status-error/10 border-status-error/30 animate-pulse' : 'text-status-warning bg-status-warning/10 border-status-warning/30'}`}>
                {projectAlerts.length} Alerts
              </span>
            )}
            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${activeTasks.length > 0 ? 'text-blue-400 bg-blue-400/10 border-blue-400/30' : 'text-obsidian-muted bg-obsidian-light border-obsidian-border'}`}>
              {activeTasks.length} Tasks
            </span>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gold">{project.category || 'Uncategorized'}</p>
            <span className="text-obsidian-muted/30">•</span>
            <p className="text-[10px] text-obsidian-muted">{project.type}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-3">
          <div className="flex items-center gap-1.5">
            <span className={`status-dot ${statusClass}`} />
            <span className={`text-[10px] font-bold uppercase tracking-wider ${
              project.status === 'Live' ? 'text-status-live' :
              project.status === 'Warning' ? 'text-status-warning' :
              project.status === 'Error' ? 'text-status-error' :
              'text-obsidian-muted'
            }`}>
              {project.status}
            </span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <button onClick={() => onEdit?.(project)} className="p-1 rounded bg-obsidian-dark border border-obsidian-border text-obsidian-muted hover:text-gold hover:border-gold/30 transition-colors">
              <Edit2 className="w-3 h-3" />
            </button>
            <button onClick={() => onDelete?.(project.id)} className="p-1 rounded bg-obsidian-dark border border-obsidian-border text-obsidian-muted hover:text-status-error hover:border-status-error/30 transition-colors">
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Connection Info */}
      <div className="flex items-center gap-2 p-2 rounded-lg bg-obsidian-dark border border-obsidian-border mb-3">
        <Fingerprint className="w-3.5 h-3.5 text-obsidian-muted" />
        <span className="text-[10px] text-obsidian-muted font-mono truncate">{project.id || 'No ID set'}</span>
      </div>

      {/* Details */}
      <div className="space-y-3 mb-4 flex-1">
        <p className="text-xs text-obsidian-muted leading-relaxed line-clamp-2 min-h-[32px]">{project.notes || 'No description provided.'}</p>
        
        {project.issueSummary && (
          <div className="p-2 rounded-lg bg-status-error/5 border border-status-error/20">
            <p className="text-[10px] text-status-error/90 font-bold uppercase tracking-wider mb-0.5">Known Issue</p>
            <p className="text-[11px] text-status-error">{project.issueSummary}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 mt-2">
          <div className="p-2 rounded-lg bg-obsidian-dark border border-obsidian-border flex flex-col justify-center">
            <span className="text-[9px] font-bold text-obsidian-muted uppercase tracking-wider mb-1">Health Score</span>
            <div className="flex items-center gap-1.5">
              <Activity className={`w-3.5 h-3.5 ${healthColor}`} />
              <span className={`text-sm font-black ${healthColor}`}>{project.healthScore ?? 100}%</span>
            </div>
          </div>
          <div className="p-2 rounded-lg bg-obsidian-dark border border-obsidian-border flex flex-col justify-center">
            <span className="text-[9px] font-bold text-obsidian-muted uppercase tracking-wider mb-1">Agent Events</span>
            <div className="flex items-center gap-1.5">
              <Radar className={`w-3.5 h-3.5 ${projectAgentEvents.length > 0 ? 'text-cyan-signal' : 'text-obsidian-muted'}`} />
              <span className={`text-sm font-black ${projectAgentEvents.length > 0 ? 'text-white' : 'text-obsidian-muted'}`}>
                {projectAgentEvents.length}
              </span>
            </div>
          </div>
        </div>

        {renderCategoryMetrics()}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 pt-3 border-t border-obsidian-border mt-auto">
        <a
          href={project.liveUrl && project.liveUrl !== '#' ? project.liveUrl : undefined}
          className={`flex-1 min-w-[45%] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all ${
            project.liveUrl && project.liveUrl !== '#'
              ? 'bg-gold/10 text-gold border border-gold/20 hover:bg-gold/20'
              : 'bg-obsidian-card text-obsidian-muted/50 border border-obsidian-border cursor-not-allowed'
          }`}
          target="_blank" rel="noopener noreferrer"
          onClick={(!project.liveUrl || project.liveUrl === '#') ? (e) => e.preventDefault() : undefined}
        >
          <Globe className="w-3.5 h-3.5" /> {(!project.liveUrl || project.liveUrl === '#') ? 'No URL' : 'Website'}
        </a>
        <a
          href={project.adminUrl && project.adminUrl !== '#' ? project.adminUrl : undefined}
          className={`flex-1 min-w-[45%] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all ${
            project.adminUrl && project.adminUrl !== '#'
              ? 'bg-obsidian-light text-white border border-obsidian-light hover:bg-obsidian-light/80'
              : 'bg-obsidian-card text-obsidian-muted/50 border border-obsidian-border cursor-not-allowed'
          }`}
          target="_blank" rel="noopener noreferrer"
          onClick={(!project.adminUrl || project.adminUrl === '#') ? (e) => e.preventDefault() : undefined}
        >
          <Shield className="w-3.5 h-3.5" /> {(!project.adminUrl || project.adminUrl === '#') ? 'No Admin' : 'Admin'}
        </a>
        
        <div className="w-full grid grid-cols-4 gap-1.5 mt-1">
          <a
            href={project.githubUrl && project.githubUrl !== '#' ? project.githubUrl : undefined}
            className={`flex items-center justify-center p-2 rounded-lg text-obsidian-muted transition-colors ${
              project.githubUrl && project.githubUrl !== '#' ? 'bg-obsidian-dark hover:text-white hover:border-obsidian-light border border-obsidian-border' : 'bg-obsidian-card border border-transparent opacity-50 cursor-not-allowed'
            }`}
            target="_blank" rel="noopener noreferrer" title="GitHub"
            onClick={(!project.githubUrl || project.githubUrl === '#') ? (e) => e.preventDefault() : undefined}
          >
            <Code className="w-3.5 h-3.5" />
          </a>
          <a
            href={project.vercelUrl && project.vercelUrl !== '#' ? project.vercelUrl : undefined}
            className={`flex items-center justify-center p-2 rounded-lg text-obsidian-muted transition-colors ${
              project.vercelUrl && project.vercelUrl !== '#' ? 'bg-obsidian-dark hover:text-white hover:border-obsidian-light border border-obsidian-border' : 'bg-obsidian-card border border-transparent opacity-50 cursor-not-allowed'
            }`}
            target="_blank" rel="noopener noreferrer" title="Vercel"
            onClick={(!project.vercelUrl || project.vercelUrl === '#') ? (e) => e.preventDefault() : undefined}
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button onClick={() => onAddAlert?.(project)} className="flex items-center justify-center p-2 rounded-lg bg-obsidian-dark text-status-warning border border-obsidian-border hover:border-status-warning/50 hover:bg-status-warning/10 transition-all" title="Add Alert">
            <AlertTriangle className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onUpdateHealth?.(project)} className="flex items-center justify-center p-2 rounded-lg bg-obsidian-dark text-status-live border border-obsidian-border hover:border-status-live/50 hover:bg-status-live/10 transition-all" title="Update Health">
            <Activity className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
