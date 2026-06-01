import { ExternalLink, Code, Globe, Shield, FileText, Database, Edit2, Trash2, AlertTriangle, PlusCircle, Activity } from 'lucide-react'

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

export default function ProjectCard({ project, onEdit, onDelete, onAddAlert, onUpdateHealth, alerts = [], tasks = [] }) {
  const statusClass = statusColors[project.status] || 'offline'
  
  const projectAlerts = alerts.filter(a => a.projectId === project.id && a.status !== 'Fixed' && a.status !== 'Ignored')
  const hasCritical = projectAlerts.some(a => a.severity === 'Critical')
  const criticalHighCount = projectAlerts.filter(a => a.severity === 'Critical' || a.severity === 'High').length

  const projectTasks = tasks.filter(t => t.projectId === project.id)
  const activeTasks = projectTasks.filter(t => t.status !== 'Done')
  const hasBlockedOrCriticalTask = activeTasks.some(t => t.status === 'Blocked' || t.priority === 'Critical')

  let computedHealth = project.healthStatus || 'Unknown'
  if (hasCritical) computedHealth = 'Error'
  else if (projectAlerts.some(a => a.severity === 'High')) computedHealth = 'Warning'

  const healthColor = 
    computedHealth === 'Healthy' ? 'text-status-live bg-status-live/10 border-status-live/30' :
    computedHealth === 'Warning' ? 'text-status-warning bg-status-warning/10 border-status-warning/30' :
    computedHealth === 'Error' ? 'text-status-error bg-status-error/10 border-status-error/30 animate-pulse' :
    'text-obsidian-muted bg-obsidian-light border-obsidian-border'

  return (
    <div className="glass-card-hover rounded-2xl p-5 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-white font-bold text-base truncate">{project.name}</h3>
            {projectAlerts.length > 0 ? (
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${
                hasCritical ? 'text-status-error bg-status-error/10 border-status-error/30 animate-pulse' : 'text-status-warning bg-status-warning/10 border-status-warning/30'
              }`}>
                {projectAlerts.length} {projectAlerts.length === 1 ? 'Alert' : 'Alerts'}
                {criticalHighCount > 0 && ` (${criticalHighCount} Critical/High)`}
              </span>
            ) : (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold border text-status-live bg-status-live/10 border-status-live/30">
                No Alerts
              </span>
            )}
            <div className="relative">
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${
                activeTasks.length > 0 ? 'text-blue-400 bg-blue-400/10 border-blue-400/30' : 'text-obsidian-muted bg-obsidian-light border-obsidian-border'
              }`}>
                {activeTasks.length === 0 ? 'No Tasks' : `${activeTasks.length} ${activeTasks.length === 1 ? 'Task' : 'Tasks'}`}
              </span>
              {hasBlockedOrCriticalTask && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-status-error rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
              )}
            </div>
          </div>
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
          <div className="flex items-center gap-1 ml-2 pl-2 border-l border-obsidian-border">
            <button onClick={() => onEdit?.(project)} className="p-1 rounded-md text-obsidian-muted hover:text-gold hover:bg-gold/10 transition-colors">
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => onDelete?.(project.id)} className="p-1 rounded-md text-obsidian-muted hover:text-status-error hover:bg-status-error/10 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-1.5 mb-4 flex-1">
        <p className="text-xs text-obsidian-muted leading-relaxed line-clamp-2">{project.notes}</p>
        
        {project.issueSummary && (
          <div className="mt-2 p-2 rounded-lg bg-status-error/5 border border-status-error/20">
            <p className="text-[11px] text-status-error/90 font-medium">Issue: {project.issueSummary}</p>
          </div>
        )}

        <div className="flex items-center gap-4 pt-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Globe className="w-3 h-3 text-obsidian-muted" />
            <span className="text-[11px] text-obsidian-muted">{project.lastCheckedAt ? new Date(project.lastCheckedAt).toLocaleString() : 'Not checked'}</span>
          </div>
          {project.healthScore !== undefined && (
            <div className="flex items-center gap-1.5">
              <Activity className="w-3 h-3 text-gold" />
              <span className="text-[11px] text-gold">Score: {project.healthScore}/100</span>
            </div>
          )}
          {project.firebaseRoot && (
            <div className="flex items-center gap-1.5">
              <Database className="w-3 h-3 text-gold/70" />
              <span className="text-[11px] text-gold/70">{project.firebaseRoot}</span>
            </div>
          )}
        </div>

        <div className="mt-1 flex items-center gap-2">
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${healthColor}`}>
            Health: {computedHealth}
          </span>
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
          href={project.liveUrl && project.liveUrl !== '#' ? project.liveUrl : undefined}
          className={`flex-1 min-w-[45%] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
            project.liveUrl && project.liveUrl !== '#'
              ? 'bg-gold/10 text-gold border border-gold/20 hover:bg-gold/20'
              : 'bg-obsidian-card text-obsidian-muted/50 border border-obsidian-border cursor-not-allowed'
          }`}
          target="_blank" rel="noopener noreferrer"
          onClick={(!project.liveUrl || project.liveUrl === '#') ? (e) => e.preventDefault() : undefined}
        >
          <Globe className="w-3 h-3" /> {(!project.liveUrl || project.liveUrl === '#') ? 'No URL' : 'Website'}
        </a>
        <a
          href={project.adminUrl && project.adminUrl !== '#' ? project.adminUrl : undefined}
          className={`flex-1 min-w-[45%] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
            project.adminUrl && project.adminUrl !== '#'
              ? 'bg-obsidian-light text-white border border-obsidian-light hover:bg-obsidian-light/80'
              : 'bg-obsidian-card text-obsidian-muted/50 border border-obsidian-border cursor-not-allowed'
          }`}
          target="_blank" rel="noopener noreferrer"
          onClick={(!project.adminUrl || project.adminUrl === '#') ? (e) => e.preventDefault() : undefined}
        >
          <Shield className="w-3 h-3" /> {(!project.adminUrl || project.adminUrl === '#') ? 'No Admin' : 'Admin'}
        </a>
        <a
          href={project.githubUrl && project.githubUrl !== '#' ? project.githubUrl : undefined}
          className={`flex-1 min-w-[30%] flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl text-[11px] font-semibold transition-all ${
            project.githubUrl && project.githubUrl !== '#'
              ? 'bg-obsidian-card text-obsidian-muted border border-obsidian-border hover:border-obsidian-light hover:text-white'
              : 'bg-obsidian-card text-obsidian-muted/30 border border-obsidian-border/50 cursor-not-allowed'
          }`}
          target="_blank" rel="noopener noreferrer"
          onClick={(!project.githubUrl || project.githubUrl === '#') ? (e) => e.preventDefault() : undefined}
        >
          <Code className="w-3 h-3" /> GitHub
        </a>
        <a
          href={project.vercelUrl && project.vercelUrl !== '#' ? project.vercelUrl : undefined}
          className={`flex-1 min-w-[30%] flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl text-[11px] font-semibold transition-all ${
            project.vercelUrl && project.vercelUrl !== '#'
              ? 'bg-obsidian-card text-obsidian-muted border border-obsidian-border hover:border-obsidian-light hover:text-white'
              : 'bg-obsidian-card text-obsidian-muted/30 border border-obsidian-border/50 cursor-not-allowed'
          }`}
          target="_blank" rel="noopener noreferrer"
          onClick={(!project.vercelUrl || project.vercelUrl === '#') ? (e) => e.preventDefault() : undefined}
        >
          <ExternalLink className="w-3 h-3" /> Vercel
        </a>
        <button onClick={() => onAddAlert?.(project)} className="flex-1 min-w-[30%] flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl text-[11px] font-semibold bg-obsidian-card text-status-warning border border-obsidian-border hover:border-status-warning/50 hover:bg-status-warning/10 transition-all">
          <AlertTriangle className="w-3 h-3" /> Add Alert
        </button>
        <button onClick={() => onUpdateHealth?.(project)} className="flex-1 min-w-[30%] flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl text-[11px] font-semibold bg-obsidian-card text-status-live border border-obsidian-border hover:border-status-live/50 hover:bg-status-live/10 transition-all">
          <Activity className="w-3 h-3" /> Health Update
        </button>
      </div>
    </div>
  )
}
