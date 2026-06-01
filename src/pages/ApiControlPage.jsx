import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Server, ShieldAlert, Cpu, Key, Activity, ShieldCheck, ToggleRight,
  AlertTriangle, Filter, Search, CheckCircle, Clock, CheckSquare, XSquare, Database, StopCircle
} from 'lucide-react'

const initialApis = [
  {
    id: 1, name: 'Website Health Engine', provider: 'UptimeRobot API', purpose: 'Live status monitoring', category: 'Monitoring',
    status: 'Planned', riskLevel: 'Low', permissionMode: 'Read Only', needsBackend: false, secretStorage: 'Not Required', lastChecked: 'N/A'
  },
  {
    id: 2, name: 'GitHub Integration', provider: 'GitHub API', purpose: 'Commit & deployment tracking', category: 'DevOps',
    status: 'Not Connected', riskLevel: 'Medium', permissionMode: 'Read Only', needsBackend: true, secretStorage: 'Vercel Env', lastChecked: 'N/A'
  },
  {
    id: 3, name: 'Vercel Deployment', provider: 'Vercel API', purpose: 'Trigger builds & clear cache', category: 'DevOps',
    status: 'Planned', riskLevel: 'High', permissionMode: 'Owner Approval Required', needsBackend: true, secretStorage: 'Vercel Env', lastChecked: 'N/A'
  },
  {
    id: 4, name: 'Firebase Database', provider: 'Firebase Web SDK', purpose: 'Realtime database syncing', category: 'Database',
    status: 'Active', riskLevel: 'Medium', permissionMode: 'Owner Auth Checked', needsBackend: false, secretStorage: 'Frontend Safe', lastChecked: 'Just now'
  },
  {
    id: 5, name: 'Empire Assistant AI', provider: 'OpenAI / Gemini', purpose: 'Smart text generation', category: 'AI',
    status: 'Planned', riskLevel: 'Medium', permissionMode: 'Read Only', needsBackend: true, secretStorage: 'Backend', lastChecked: 'N/A'
  },
  {
    id: 6, name: 'Social Auto-Poster', provider: 'Meta API', purpose: 'Direct publishing to pages', category: 'Social',
    status: 'Blocked', riskLevel: 'High', permissionMode: 'Write Disabled', needsBackend: true, secretStorage: 'Backend', lastChecked: 'N/A'
  },
  {
    id: 7, name: 'WhatsApp Official Alert', provider: 'Meta Business', purpose: 'Push notifications for errors', category: 'Messaging',
    status: 'Not Connected', riskLevel: 'Critical', permissionMode: 'Owner Approval Required', needsBackend: true, secretStorage: 'Backend', lastChecked: 'N/A'
  }
]

export default function ApiControlPage() {
  const [apis, setApis] = useState(initialApis)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')
  const [filterRisk, setFilterRisk] = useState('All')
  
  const categories = ['All', ...new Set(initialApis.map(a => a.category))]
  const statuses = ['All', 'Active', 'Planned', 'Not Connected', 'Blocked']
  const risks = ['All', 'Low', 'Medium', 'High', 'Critical']

  const filteredApis = apis.filter(api => {
    const matchSearch = api.name.toLowerCase().includes(searchTerm.toLowerCase()) || api.provider.toLowerCase().includes(searchTerm.toLowerCase())
    const matchCat = filterCategory === 'All' || api.category === filterCategory
    const matchStatus = filterStatus === 'All' || api.status === filterStatus
    const matchRisk = filterRisk === 'All' || api.riskLevel === filterRisk
    return matchSearch && matchCat && matchStatus && matchRisk
  })

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-xl lg:text-2xl font-extrabold text-white flex items-center gap-2">
          API Security <span className="gold-gradient-text">Engine</span>
        </h1>
        <p className="text-xs text-obsidian-muted mt-1">
          High-security control center for all external services and API integrations
        </p>
      </div>

      {/* Security Checklist */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'No Frontend Secrets', icon: Key, color: 'text-status-live' },
          { label: 'No GitHub Leaks', icon: ShieldCheck, color: 'text-status-live' },
          { label: 'No LocalStorage Secrets', icon: Database, color: 'text-status-live' },
          { label: 'Backend Required', icon: Server, color: 'text-blue-400' },
          { label: 'Owner Auth Checked', icon: CheckSquare, color: 'text-gold' },
          { label: 'Dangerous Actions Blocked', icon: AlertTriangle, color: 'text-status-warning' },
        ].map((check, i) => (
          <div key={i} className="glass-card rounded-xl p-3 flex flex-col items-center justify-center text-center gap-2">
            <check.icon className={`w-5 h-5 ${check.color}`} />
            <span className="text-[9px] font-bold text-obsidian-muted uppercase tracking-wider">{check.label}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Left Column: Management UI */}
        <div className="lg:col-span-1 space-y-5">
          
          {/* Kill Switch */}
          <div className="glass-card rounded-2xl p-5 border border-status-error/30 bg-status-error/5">
            <div className="flex items-center gap-2 mb-4">
              <StopCircle className="w-5 h-5 text-status-error" />
              <h3 className="text-white font-bold text-sm">Global Kill Switches</h3>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Disable All Real APIs', active: true },
                { label: 'Block Auto-Deploy Actions', active: true },
                { label: 'Stop Auto-Posting', active: true },
              ].map((sw, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-obsidian-dark border border-obsidian-border">
                  <span className="text-xs text-white font-medium">{sw.label}</span>
                  <button onClick={() => alert('Demo only — no real API action performed.')} className={`w-8 h-4 rounded-full flex items-center transition-colors ${sw.active ? 'bg-status-error justify-end' : 'bg-obsidian-card justify-start'}`}>
                    <div className="w-3 h-3 rounded-full bg-white mx-0.5 shadow" />
                  </button>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-status-error/70 mt-3 text-center">
              (UI Mockup - Features safely disabled by default)
            </p>
          </div>

          {/* Owner Approval Queue */}
          <div className="glass-card rounded-2xl p-5 border border-gold/20">
            <div className="flex items-center gap-2 mb-4">
              <CheckSquare className="w-5 h-5 text-gold" />
              <h3 className="text-white font-bold text-sm">Owner Approval Queue</h3>
            </div>
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-obsidian-dark border border-obsidian-border">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-status-error/10 text-status-error">High Risk</span>
                  <span className="text-xs text-white">Vercel Production Deploy</span>
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => alert('Mock: Approve Action Disabled')} className="flex-1 py-1.5 rounded-lg text-xs font-bold gold-gradient text-obsidian-dark hover:opacity-90 transition-all">Approve</button>
                  <button onClick={() => alert('Mock: Reject Action Disabled')} className="flex-1 py-1.5 rounded-lg text-xs font-bold bg-obsidian-card text-obsidian-muted border border-obsidian-border hover:text-white transition-all">Reject</button>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Log */}
          <div className="glass-card rounded-2xl p-5 border border-obsidian-border">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-blue-400" />
              <h3 className="text-white font-bold text-sm">Engine Activity</h3>
            </div>
            <div className="space-y-3">
              <div className="flex gap-3 text-xs text-obsidian-muted">
                <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                <p>Social Poster API marked as <span className="text-status-error">Blocked</span></p>
              </div>
              <div className="flex gap-3 text-xs text-obsidian-muted">
                <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                <p>OpenAI API set to <span className="text-blue-400">Backend Required</span></p>
              </div>
              <div className="flex gap-3 text-xs text-obsidian-muted">
                <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                <p>Firebase Web SDK auth verified successfully</p>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: API Registry */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Filters */}
          <div className="glass-card rounded-2xl p-4 flex flex-col md:flex-row items-center gap-3 border border-gold/10">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-obsidian-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search APIs..." 
                className="w-full bg-obsidian-dark border border-obsidian-border rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:border-gold/30 outline-none transition-colors"
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto overflow-x-auto empire-scrollbar pb-1 md:pb-0">
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="bg-obsidian-dark border border-obsidian-border rounded-xl px-3 py-2 text-xs text-white outline-none">
                {statuses.map(s => <option key={s} value={s}>{s} Status</option>)}
              </select>
              <select value={filterRisk} onChange={e => setFilterRisk(e.target.value)} className="bg-obsidian-dark border border-obsidian-border rounded-xl px-3 py-2 text-xs text-white outline-none">
                {risks.map(r => <option key={r} value={r}>{r} Risk</option>)}
              </select>
            </div>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredApis.map((api, i) => (
              <motion.div
                key={api.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card rounded-2xl p-4 border border-obsidian-border hover:border-gold/20 transition-all flex flex-col relative overflow-hidden"
              >
                {/* Status Indicator Bar */}
                <div className={`absolute top-0 left-0 w-1 h-full ${
                  api.status === 'Active' ? 'bg-status-live' : 
                  api.status === 'Blocked' ? 'bg-status-error' : 
                  'bg-obsidian-muted'
                }`} />

                <div className="pl-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="text-sm font-bold text-white leading-tight">{api.name}</h3>
                      <p className="text-[10px] text-gold mt-0.5">{api.provider}</p>
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        api.riskLevel === 'Critical' ? 'bg-status-error/10 text-status-error border border-status-error/20' :
                        api.riskLevel === 'High' ? 'bg-status-warning/10 text-status-warning border border-status-warning/20' :
                        api.riskLevel === 'Medium' ? 'bg-blue-400/10 text-blue-400 border border-blue-400/20' :
                        'bg-status-live/10 text-status-live border border-status-live/20'
                      }`}>
                        {api.riskLevel} Risk
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-obsidian-muted mb-4 h-8">{api.purpose}</p>

                  <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-[10px] mb-3 p-3 rounded-xl bg-obsidian-dark border border-obsidian-border">
                    <div>
                      <span className="text-obsidian-muted block mb-0.5">Status</span>
                      <span className={`font-semibold ${api.status === 'Active' ? 'text-status-live' : api.status === 'Blocked' ? 'text-status-error' : 'text-white'}`}>{api.status}</span>
                    </div>
                    <div>
                      <span className="text-obsidian-muted block mb-0.5">Permission</span>
                      <span className="font-semibold text-white">{api.permissionMode}</span>
                    </div>
                    <div>
                      <span className="text-obsidian-muted block mb-0.5">Architecture</span>
                      <span className="font-semibold text-white">{api.needsBackend ? 'Backend Required' : 'Frontend Safe'}</span>
                    </div>
                    <div>
                      <span className="text-obsidian-muted block mb-0.5">Secret Logic</span>
                      <span className="font-semibold text-white">{api.secretStorage}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[9px] text-obsidian-muted/60">
                    <span>Cat: {api.category}</span>
                    <span>Last Ping: {api.lastChecked}</span>
                  </div>
                </div>
              </motion.div>
            ))}

            {filteredApis.length === 0 && (
              <div className="col-span-1 md:col-span-2 text-center py-10">
                <Cpu className="w-10 h-10 text-obsidian-muted/30 mx-auto mb-2" />
                <p className="text-sm text-obsidian-muted">No APIs match your security filters.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </motion.div>
  )
}
