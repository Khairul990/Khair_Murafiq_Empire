import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Server, ShieldAlert, Cpu, Key, Activity, ShieldCheck, ToggleRight,
  AlertTriangle, Filter, Search, CheckCircle, Clock, CheckSquare, XSquare, Database, StopCircle, Info, Lock
} from 'lucide-react'
import { getApiAuditLogs } from '../utils/apiAuditLogger'

const initialApis = [
  {
    id: 1, name: 'ElevenLabs Voice', provider: 'ElevenLabs API', purpose: 'Premium natural voice for Empire Assistant', category: 'AI',
    status: 'Planned / Serverless Required', riskLevel: 'Medium', permissionMode: 'Server-side only', needsBackend: true, secretStorage: 'Vercel Env'
  },
  {
    id: 2, name: 'AI Brain: Gemini/OpenAI', provider: 'Google / OpenAI', purpose: 'Smarter assistant reasoning later', category: 'AI',
    status: 'Planned / Serverless Required', riskLevel: 'High', permissionMode: 'Server-side only', needsBackend: true, secretStorage: 'Vercel Env'
  },
  {
    id: 3, name: 'WhatsApp Alerts', provider: 'Meta Business', purpose: 'Critical alert notifications', category: 'Messaging',
    status: 'Planned / Official API Required', riskLevel: 'High', permissionMode: 'Owner Approval Required', needsBackend: true, secretStorage: 'Vercel Env'
  },
  {
    id: 4, name: 'GitHub API', provider: 'GitHub', purpose: 'Repo/deploy/status checks later', category: 'DevOps',
    status: 'Planned / Token Server-side Only', riskLevel: 'Critical', permissionMode: 'Server-side only', needsBackend: true, secretStorage: 'Vercel Env'
  },
  {
    id: 5, name: 'Vercel API', provider: 'Vercel', purpose: 'Deployment status and project health', category: 'DevOps',
    status: 'Planned / Token Server-side Only', riskLevel: 'Critical', permissionMode: 'Server-side only', needsBackend: true, secretStorage: 'Vercel Env'
  },
  {
    id: 6, name: 'Uptime Monitor', provider: 'UptimeRobot/Ping', purpose: 'Real website live/down checks', category: 'Monitoring',
    status: 'Planned / Backend Check Required', riskLevel: 'Low', permissionMode: 'Server-side only', needsBackend: true, secretStorage: 'Vercel Env'
  },
  {
    id: 7, name: 'Payment/Finance API', provider: 'Stripe/SSLCommerz', purpose: 'Payment verification later', category: 'Finance',
    status: 'Not Connected / Future Review', riskLevel: 'Critical', permissionMode: 'Strict Owner Approval', needsBackend: true, secretStorage: 'Vercel Env'
  }
]

export default function ApiControlPage() {
  const [apis, setApis] = useState(initialApis)
  const [searchTerm, setSearchTerm] = useState('')
  const [logs, setLogs] = useState([])
  
  useEffect(() => {
    setLogs(getApiAuditLogs().slice(0, 10))
  }, [])

  const filteredApis = apis.filter(api => 
    api.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    api.provider.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleMockAction = () => {
    alert("Planned mode only. No real API action performed.")
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-24"
    >
      {/* Header */}
      <div>
        <h1 className="text-xl lg:text-2xl font-extrabold text-white flex items-center gap-2">
          API Security <span className="gold-gradient-text">Engine</span>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-obsidian-light/80 text-obsidian-muted border border-obsidian-border">Foundation Only</span>
        </h1>
        <p className="text-xs text-obsidian-muted mt-1">
          High-security control center for all future serverless external services.
        </p>
      </div>

      {/* Real API Readiness Score Panel */}
      <div className="glass-card rounded-2xl p-5 border border-status-live/30 bg-status-live/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-status-live" />
            API Security Readiness
          </h2>
          <ul className="text-[10px] text-obsidian-muted mt-2 space-y-1">
            <li className="flex items-center gap-1.5"><CheckCircle className="w-3 h-3 text-status-live" /> Frontend secrets blocked</li>
            <li className="flex items-center gap-1.5"><CheckCircle className="w-3 h-3 text-status-live" /> Serverless placeholders created</li>
            <li className="flex items-center gap-1.5"><CheckCircle className="w-3 h-3 text-status-live" /> Environment setup documented</li>
            <li className="flex items-center gap-1.5"><CheckCircle className="w-3 h-3 text-status-live" /> Owner approval required</li>
            <li className="flex items-center gap-1.5"><CheckCircle className="w-3 h-3 text-status-live" /> Real APIs not connected</li>
          </ul>
        </div>
        <div className="text-center px-6 py-3 rounded-xl bg-obsidian-dark border border-obsidian-border">
          <p className="text-[10px] text-obsidian-muted font-bold uppercase tracking-wider mb-1">Overall Status</p>
          <p className="text-sm font-black text-status-live">Safe Foundation Ready</p>
        </div>
      </div>

      {/* Part A: API Security Page Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Frontend API Keys', status: 'Blocked', text: 'API keys must never be stored in React/frontend code.', icon: Key, color: 'text-status-error' },
          { label: 'GitHub Secret Protection', status: 'Protected', text: 'Secrets must never be committed to GitHub.', icon: ShieldCheck, color: 'text-status-live' },
          { label: 'LocalStorage Protection', status: 'Blocked', text: 'Secrets must never be stored in localStorage.', icon: Database, color: 'text-status-error' },
          { label: 'Serverless Gateway', status: 'Required', text: 'All real API calls must go through serverless/backend functions.', icon: Server, color: 'text-blue-400' },
          { label: 'Vercel Env Variables', status: 'Required', text: 'Real API keys will be stored only in Vercel server-side env.', icon: Server, color: 'text-gold' },
          { label: 'Owner Approval', status: 'Required', text: 'Risky API actions need owner approval before execution.', icon: CheckSquare, color: 'text-gold' },
          { label: 'API Kill Switch', status: 'Mock / Safe Mode', text: 'Real API shutdown enabled only after backend is connected.', icon: StopCircle, color: 'text-status-warning' },
          { label: 'Real API Status', status: 'Not Connected', text: 'No real external API is connected yet.', icon: Activity, color: 'text-obsidian-muted' },
        ].map((check, i) => (
          <div key={i} className="glass-card rounded-xl p-4 flex flex-col justify-between border border-obsidian-border">
            <div className="flex items-start justify-between mb-2">
              <check.icon className={`w-5 h-5 ${check.color}`} />
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${check.status === 'Protected' || check.status === 'Required' ? 'bg-status-live/10 text-status-live border-status-live/20' : check.status === 'Blocked' ? 'bg-status-error/10 text-status-error border-status-error/20' : 'bg-obsidian-card text-obsidian-muted border-obsidian-border'}`}>
                {check.status}
              </span>
            </div>
            <h3 className="text-xs font-bold text-white mb-1">{check.label}</h3>
            <p className="text-[10px] text-obsidian-muted leading-tight">{check.text}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Left Column: Management UI */}
        <div className="lg:col-span-1 space-y-5">
          
          {/* API Kill Switch */}
          <div className="glass-card rounded-2xl p-5 border border-status-error/30 bg-status-error/5">
            <div className="flex items-center gap-2 mb-4">
              <StopCircle className="w-5 h-5 text-status-error" />
              <h3 className="text-white font-bold text-sm">API Kill Switch</h3>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Global API Kill Switch', active: false, mode: 'Mock / Safe Mode' },
                { label: 'ElevenLabs Voice API', active: false, mode: 'Planned' },
                { label: 'AI Brain API', active: false, mode: 'Planned' },
                { label: 'WhatsApp API', active: false, mode: 'Planned' },
                { label: 'GitHub/Vercel API', active: false, mode: 'Planned' },
              ].map((sw, i) => (
                <div key={i} className="flex flex-col p-3 rounded-xl bg-obsidian-dark border border-obsidian-border">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-white font-medium">{sw.label}</span>
                    <button onClick={() => alert('Demo only — no real API action performed.')} className={`w-8 h-4 rounded-full flex items-center transition-colors ${sw.active ? 'bg-status-error justify-end' : 'bg-obsidian-card border border-obsidian-border justify-start'}`}>
                      <div className="w-3 h-3 rounded-full bg-obsidian-muted mx-0.5 shadow" />
                    </button>
                  </div>
                  <span className="text-[9px] text-status-warning font-bold">{sw.mode}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Owner Approval Queue UI */}
          <div className="glass-card rounded-2xl p-5 border border-gold/20">
            <div className="flex items-center gap-2 mb-4">
              <CheckSquare className="w-5 h-5 text-gold" />
              <h3 className="text-white font-bold text-sm">Owner Approval Queue</h3>
            </div>
            <div className="space-y-3">
              {[
                'Voice generation request',
                'AI report generation',
                'WhatsApp alert send',
                'Uptime check',
                'GitHub/Vercel status check',
                'Deploy action'
              ].map((action, i) => (
                <div key={i} className="p-3 rounded-xl bg-obsidian-dark border border-obsidian-border">
                  <div className="flex flex-col gap-1 mb-2">
                    <span className="text-xs text-white">{action}</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-status-warning/10 text-status-warning self-start">Planned / Requires owner approval</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button onClick={handleMockAction} className="flex-1 py-1.5 px-2 rounded-lg text-[10px] font-bold border border-status-live/30 text-status-live hover:bg-status-live/10 transition-colors">Approve</button>
                    <button onClick={handleMockAction} className="flex-1 py-1.5 px-2 rounded-lg text-[10px] font-bold border border-status-error/30 text-status-error hover:bg-status-error/10 transition-colors">Reject</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-obsidian-dark rounded-lg border border-obsidian-border">
              <p className="text-[10px] text-obsidian-muted flex items-start gap-1.5">
                <Lock className="w-3 h-3 text-gold shrink-0" />
                API gateway must verify Firebase Auth owner before any future real API call. Currently in planned mode only.
              </p>
            </div>
          </div>
          
          {/* API Usage Log */}
          <div className="glass-card rounded-2xl p-5 border border-obsidian-border">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-blue-400" />
              <h3 className="text-white font-bold text-sm">API Activity Logs</h3>
            </div>
            <div className="space-y-2 max-h-[250px] overflow-y-auto empire-scrollbar">
              {logs.length > 0 ? logs.map(log => (
                <div key={log.id} className="p-2 rounded-lg bg-obsidian-dark border border-obsidian-border">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] text-white font-bold">{log.apiName}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${log.status === 'success' ? 'bg-status-live/10 text-status-live' : 'bg-status-error/10 text-status-error'}`}>{log.status}</span>
                  </div>
                  <p className="text-[9px] text-obsidian-muted">{log.note}</p>
                  <p className="text-[8px] text-obsidian-muted/50 mt-1 font-mono">{new Date(log.timestamp).toLocaleString()}</p>
                </div>
              )) : (
                <p className="text-xs text-obsidian-muted text-center py-4">No API logs yet.</p>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Future API Registry */}
        <div className="lg:col-span-2 space-y-4">
          
          <div className="bg-obsidian-dark border border-gold/20 p-4 rounded-xl text-xs text-gold-light font-medium flex items-start gap-2">
             <Info className="w-4 h-4 text-gold shrink-0 mt-0.5" />
             Premium natural voice will be added later through a secure serverless gateway. ElevenLabs API key will never be stored in frontend.
          </div>
          
          {/* Filters */}
          <div className="glass-card rounded-2xl p-4 flex flex-col md:flex-row items-center gap-3 border border-obsidian-border">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-obsidian-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search Planned APIs..." 
                className="w-full bg-obsidian-dark border border-obsidian-border rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:border-gold/30 outline-none transition-colors"
              />
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
                <div className="absolute top-0 left-0 w-1 h-full bg-obsidian-muted/50" />

                <div className="pl-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="text-sm font-bold text-white leading-tight">{api.name}</h3>
                      <p className="text-[10px] text-gold mt-0.5">{api.provider}</p>
                    </div>
                  </div>

                  <p className="text-xs text-obsidian-muted mb-4 h-8">{api.purpose}</p>

                  <div className="grid grid-cols-1 gap-y-2 gap-x-4 text-[10px] mb-3 p-3 rounded-xl bg-obsidian-dark border border-obsidian-border">
                    <div className="flex justify-between border-b border-obsidian-border/50 pb-1">
                      <span className="text-obsidian-muted">Status</span>
                      <span className="font-semibold text-status-warning">{api.status}</span>
                    </div>
                    <div className="flex justify-between border-b border-obsidian-border/50 pb-1">
                      <span className="text-obsidian-muted">Security Note</span>
                      <span className="font-semibold text-white">{api.permissionMode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-obsidian-muted">Secret Storage</span>
                      <span className="font-semibold text-white flex items-center gap-1">
                        <Lock className="w-3 h-3 text-status-live" /> {api.secretStorage}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </motion.div>
  )
}
