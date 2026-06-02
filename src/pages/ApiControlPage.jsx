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
        <h1 className="text-xl lg:text-3xl font-extrabold text-white flex items-center gap-3">
          API Security <span className="gold-gradient-text">Gateway</span>
          <span className="px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider bg-obsidian-light/80 text-obsidian-muted border border-obsidian-border">Foundation Mode</span>
        </h1>
        <p className="text-xs text-obsidian-muted mt-1 uppercase tracking-widest font-bold">
          High-security control center for future serverless integrations
        </p>
      </div>

      {/* Real API Readiness Score Panel */}
      <div className="glass-card rounded-2xl p-6 border border-status-live/30 bg-status-live/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-status-live" />
        <div>
          <h2 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-status-live" />
            Gateway Security Posture
          </h2>
          <ul className="text-[10px] font-bold text-obsidian-muted uppercase tracking-wider mt-3 space-y-2">
            <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-status-live" /> Frontend payloads blocked</li>
            <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-status-live" /> Serverless nodes deployed</li>
            <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-status-live" /> Environment variables sealed</li>
            <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-status-live" /> Owner approval enforced</li>
            <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-status-live" /> External channels closed</li>
          </ul>
        </div>
        <div className="text-center px-8 py-4 rounded-xl bg-obsidian-dark border border-status-live/20 shadow-[0_0_30px_rgba(34,197,94,0.1)] w-full md:w-auto">
          <p className="text-[10px] text-obsidian-muted font-bold uppercase tracking-wider mb-1.5">Gateway Status</p>
          <p className="text-lg font-black text-status-live uppercase tracking-wider">Nominal Ready</p>
        </div>
      </div>

      {/* Part A: API Security Page Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Frontend Keys', status: 'Blocked', text: 'Keys locked out of React code.', icon: Key, color: 'text-status-error' },
          { label: 'GitHub Shield', status: 'Protected', text: 'Secrets blocked from Git repo.', icon: ShieldCheck, color: 'text-status-live' },
          { label: 'Local Storage', status: 'Blocked', text: 'Local payload storage denied.', icon: Database, color: 'text-status-error' },
          { label: 'Edge Gateway', status: 'Required', text: 'All traffic via Edge nodes.', icon: Server, color: 'text-cyan-signal' },
          { label: 'Vercel Env', status: 'Required', text: 'Server-side key storage only.', icon: Server, color: 'text-gold' },
          { label: 'Owner Auth', status: 'Required', text: 'Strict MFA approval checks.', icon: CheckSquare, color: 'text-gold' },
          { label: 'Kill Switch', status: 'Safe Mode', text: 'Global API shutdown ready.', icon: StopCircle, color: 'text-status-warning' },
          { label: 'Live Uplink', status: 'Offline', text: 'No active external payloads.', icon: Activity, color: 'text-obsidian-muted' },
        ].map((check, i) => (
          <div key={i} className={`glass-card rounded-xl p-5 flex flex-col justify-between border ${check.color === 'text-cyan-signal' ? 'border-cyan-signal/20' : 'border-obsidian-border'}`}>
            <div className="flex items-start justify-between mb-3">
              <check.icon className={`w-5 h-5 ${check.color}`} />
              <span className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest border ${
                check.status === 'Protected' || check.status === 'Required' ? 'bg-status-live/10 text-status-live border-status-live/20' : 
                check.status === 'Blocked' ? 'bg-status-error/10 text-status-error border-status-error/20' : 
                'bg-obsidian-card text-obsidian-muted border-obsidian-border'
              }`}>
                {check.status}
              </span>
            </div>
            <h3 className="text-xs font-black uppercase tracking-wider text-white mb-1.5">{check.label}</h3>
            <p className="text-[10px] text-obsidian-muted leading-relaxed">{check.text}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Management UI */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* API Kill Switch */}
          <div className="glass-card rounded-2xl p-6 border border-status-error/30 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-status-error/50 group-hover:bg-status-error transition-colors" />
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 bg-status-error/10 rounded-lg">
                <StopCircle className="w-5 h-5 text-status-error" />
              </div>
              <h3 className="text-white font-black uppercase tracking-wider text-sm">Kill Switch Array</h3>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Global Array Switch', active: false, mode: 'Mock / Safe Mode' },
                { label: 'ElevenLabs Voice', active: false, mode: 'Planned' },
                { label: 'AI Operations', active: false, mode: 'Planned' },
                { label: 'WhatsApp Relays', active: false, mode: 'Planned' },
                { label: 'DevOps / GitHub', active: false, mode: 'Planned' },
              ].map((sw, i) => (
                <div key={i} className="flex flex-col p-4 rounded-xl bg-obsidian-dark/50 border border-obsidian-border hover:border-status-error/20 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] text-white font-bold uppercase tracking-wider">{sw.label}</span>
                    <button onClick={() => alert('Command rejected: Array offline.')} className={`w-10 h-5 rounded-full flex items-center transition-colors ${sw.active ? 'bg-status-error justify-end' : 'bg-obsidian-card border border-obsidian-border justify-start'}`}>
                      <div className="w-4 h-4 rounded-full bg-obsidian-muted mx-0.5 shadow" />
                    </button>
                  </div>
                  <span className="text-[9px] text-status-warning font-bold uppercase tracking-wider">{sw.mode}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Owner Approval Queue UI */}
          <div className="glass-card rounded-2xl p-6 border border-gold/20 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gold/50" />
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 bg-gold/10 rounded-lg">
                <CheckSquare className="w-5 h-5 text-gold" />
              </div>
              <h3 className="text-white font-black uppercase tracking-wider text-sm">Command Queue</h3>
            </div>
            <div className="space-y-3">
              {[
                'Voice Render Req',
                'AI Analysis Req',
                'Comm Relay Req',
                'Uptime Ping Req',
                'GitHub PR Check',
                'Vercel Deploy Req'
              ].map((action, i) => (
                <div key={i} className="p-4 rounded-xl bg-obsidian-dark/50 border border-obsidian-border">
                  <div className="flex flex-col gap-2 mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-white">{action}</span>
                    <span className="px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-wider bg-status-warning/10 text-status-warning self-start">Awaiting Authorization</span>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={handleMockAction} className="flex-1 py-2 px-3 rounded-lg text-[10px] font-black uppercase tracking-wider border border-status-live/30 text-status-live hover:bg-status-live hover:text-obsidian-dark transition-all">Authorize</button>
                    <button onClick={handleMockAction} className="flex-1 py-2 px-3 rounded-lg text-[10px] font-black uppercase tracking-wider border border-status-error/30 text-status-error hover:bg-status-error hover:text-obsidian-dark transition-all">Deny</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 p-4 bg-obsidian-dark/50 rounded-xl border border-obsidian-border text-center">
              <Lock className="w-4 h-4 text-gold mx-auto mb-2" />
              <p className="text-[9px] text-obsidian-muted font-bold uppercase tracking-wider leading-relaxed">
                MFA Authentication required for external API authorizations. System currently sandboxed.
              </p>
            </div>
          </div>
          
          {/* API Usage Log */}
          <div className="glass-card rounded-2xl p-6 border border-cyan-signal/20 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-cyan-signal/50" />
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 bg-cyan-signal/10 rounded-lg">
                <Activity className="w-5 h-5 text-cyan-signal" />
              </div>
              <h3 className="text-white font-black uppercase tracking-wider text-sm">Telemetry Logs</h3>
            </div>
            <div className="space-y-3 max-h-[300px] overflow-y-auto empire-scrollbar pr-2">
              {logs.length > 0 ? logs.map(log => (
                <div key={log.id} className="p-3 rounded-xl bg-obsidian-dark/50 border border-obsidian-border">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <span className="text-[10px] text-white font-bold uppercase tracking-wider">{log.apiName}</span>
                    <span className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-wider ${log.status === 'success' ? 'bg-status-live/10 text-status-live' : 'bg-status-error/10 text-status-error'}`}>{log.status}</span>
                  </div>
                  <p className="text-[10px] text-obsidian-muted">{log.note}</p>
                  <p className="text-[9px] font-bold text-obsidian-muted/50 mt-2 font-mono">{new Date(log.timestamp).toLocaleString()}</p>
                </div>
              )) : (
                <p className="text-[10px] font-bold uppercase tracking-wider text-obsidian-muted text-center py-6 border border-dashed border-obsidian-border rounded-xl">No Telemetry Recorded</p>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Future API Registry */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-obsidian-dark/50 border border-gold/30 p-5 rounded-2xl text-[11px] text-gold font-bold uppercase tracking-wider flex items-start gap-3 leading-relaxed shadow-[0_0_20px_rgba(242,201,76,0.05)]">
             <Info className="w-5 h-5 text-gold shrink-0" />
             <p>Premium modules (Voice, GenAI) will deploy via secure Edge nodes. Secret payloads will strictly reside in server environment.</p>
          </div>
          
          {/* Filters */}
          <div className="glass-card rounded-2xl p-3 flex flex-col md:flex-row items-center gap-3 border border-obsidian-border">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-obsidian-muted absolute left-4 top-1/2 -translate-y-1/2" />
              <input 
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search registry databases..." 
                className="w-full bg-obsidian-dark/50 border border-transparent rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-obsidian-muted focus:border-gold/30 outline-none transition-all font-medium"
              />
            </div>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredApis.map((api, i) => (
              <motion.div
                key={api.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card rounded-2xl p-5 border border-obsidian-border hover:border-gold/30 transition-all flex flex-col relative overflow-hidden group"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-obsidian-muted/30 group-hover:bg-gold/50 transition-colors" />

                <div className="pl-3">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="text-sm font-black text-white uppercase tracking-wider">{api.name}</h3>
                      <p className="text-[10px] font-bold text-gold uppercase tracking-wider mt-1">{api.provider}</p>
                    </div>
                  </div>

                  <p className="text-xs text-obsidian-muted font-medium mb-5 h-8 leading-relaxed">{api.purpose}</p>

                  <div className="grid grid-cols-1 gap-y-3 gap-x-4 text-[10px] p-4 rounded-xl bg-obsidian-dark/50 border border-obsidian-border">
                    <div className="flex justify-between items-center border-b border-obsidian-border/50 pb-2">
                      <span className="font-bold text-obsidian-muted uppercase tracking-wider">Status</span>
                      <span className="font-black text-status-warning uppercase tracking-wider">{api.status}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-obsidian-border/50 pb-2">
                      <span className="font-bold text-obsidian-muted uppercase tracking-wider">Security</span>
                      <span className="font-black text-white uppercase tracking-wider">{api.permissionMode}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-obsidian-muted uppercase tracking-wider">Vault Node</span>
                      <span className="font-black text-white flex items-center gap-1.5 uppercase tracking-wider">
                        <Lock className="w-3.5 h-3.5 text-status-live" /> {api.secretStorage}
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
