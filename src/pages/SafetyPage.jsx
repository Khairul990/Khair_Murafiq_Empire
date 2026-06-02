import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ShieldAlert, KeyRound, Lock, AlertTriangle, CheckCircle, Database, FileText, Trash2 } from 'lucide-react'
import { getAuditLogs, clearAuditLogs } from '../utils/auditLogger'

export default function SafetyPage() {
  const rules = [
    { title: 'No Secret Keys in Frontend', desc: 'Never store API keys, tokens, or credentials in client-side code.', icon: KeyRound, status: 'Enforced' },
    { title: 'No Password Storage', desc: 'Use secure auth providers; do not store raw passwords.', icon: Lock, status: 'Enforced' },
    { title: 'No Real Auto-Posting in Phase 1', desc: 'Social media automation is strictly disabled during early phases.', icon: ShieldAlert, status: 'Active' },
    { title: 'No Automatic Ad Spending', desc: 'Financial transactions require explicit manual approval.', icon: AlertTriangle, status: 'Enforced' },
    { title: 'No Dangerous Auto-Fixes', desc: 'Automated code or system fixes must be reviewed by the owner.', icon: AlertTriangle, status: 'Active' },
    { title: 'Future Integrations (Serverless)', desc: 'All risky actions will route through secure backend functions.', icon: Database, status: 'Planned' },
  ]

  const [logs, setLogs] = useState([])

  useEffect(() => {
    setLogs(getAuditLogs().slice(0, 10))
  }, [])

  const handleClearLogs = () => {
    if (window.confirm("Clear local assistant logs only?")) {
      clearAuditLogs()
      setLogs([])
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-20"
    >
      <div>
        <h1 className="text-xl lg:text-3xl font-extrabold text-white flex items-center gap-3">
          Emergency <span className="gold-gradient-text">Lockdown</span> & Safety
        </h1>
        <p className="text-xs text-obsidian-muted mt-1 uppercase tracking-widest font-bold">
          Security protocols and empire safety rules
        </p>
      </div>

      <div className="glass-card rounded-2xl p-6 border border-status-warning/30 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 h-full bg-status-warning" />
        <div className="flex items-center gap-3 mb-4 pl-2">
          <ShieldAlert className="w-6 h-6 text-status-warning animate-pulse" />
          <h3 className="text-white font-black uppercase tracking-wider text-sm">Strict Security Notice</h3>
        </div>
        <p className="text-xs text-obsidian-muted font-bold leading-relaxed pl-2">
          All risky actions require explicit confirmation from the Owner. 
          Do not connect real APIs or financial accounts during Phase 1 testing.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {rules.map((rule, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-start gap-4 p-5 rounded-2xl glass-card border border-obsidian-border hover:border-gold/30 transition-all group relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-transparent group-hover:bg-gold/50 transition-colors" />
            <div className="w-10 h-10 rounded-xl bg-status-live/10 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(34,197,94,0.1)] group-hover:shadow-[0_0_20px_rgba(242,201,76,0.2)] transition-shadow">
              <rule.icon className="w-5 h-5 text-status-live group-hover:text-gold transition-colors" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h4 className="text-sm font-black uppercase tracking-wider text-white">{rule.title}</h4>
                <span className="px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider text-status-live bg-status-live/10 border border-status-live/30">
                  {rule.status}
                </span>
              </div>
              <p className="text-[11px] font-medium text-obsidian-muted leading-relaxed">{rule.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Final System Audit Section */}
      <div className="mt-10 pt-10 border-t border-obsidian-border/50 relative">
        <h2 className="text-lg lg:text-xl font-extrabold text-white flex items-center gap-3 mb-6 uppercase tracking-wider">
          <CheckCircle className="w-6 h-6 text-status-live shadow-[0_0_15px_rgba(34,197,94,0.3)] rounded-full" />
          Final System <span className="gold-gradient-text">Audit</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <div className="glass-card rounded-2xl p-6 border border-status-live/30 bg-status-live/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-status-live/10 blur-[30px]" />
            <h3 className="text-sm font-black uppercase tracking-wider text-white mb-5 flex items-center gap-2">
              <Database className="w-4 h-4 text-status-live" /> System Status
            </h3>
            <ul className="space-y-3 text-[11px] font-bold tracking-wide text-obsidian-muted">
              <li className="flex justify-between items-center py-1 border-b border-status-live/10"><span>Overall Condition:</span> <span className="font-black text-status-live uppercase tracking-wider bg-status-live/10 px-2 py-1 rounded">Safe & Secure</span></li>
              <li className="flex justify-between items-center py-1 border-b border-status-live/10"><span>Firebase Connection:</span> <span className="font-black text-status-live uppercase tracking-wider bg-status-live/10 px-2 py-1 rounded">Active (Owner Only)</span></li>
              <li className="flex justify-between items-center py-1 border-b border-status-live/10"><span>Local Storage:</span> <span className="font-black text-status-live uppercase tracking-wider bg-status-live/10 px-2 py-1 rounded">Fallback Enabled</span></li>
              <li className="flex justify-between items-center py-1"><span>Security Threats:</span> <span className="font-black text-white uppercase tracking-wider">None Found</span></li>
            </ul>
          </div>
          
          <div className="glass-card rounded-2xl p-6 border border-gold/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-gold/10 blur-[30px]" />
            <h3 className="text-sm font-black uppercase tracking-wider text-white mb-5 flex items-center gap-2">
              <Lock className="w-4 h-4 text-gold" /> Security Checklist
            </h3>
            <ul className="space-y-4 text-[11px] font-bold text-obsidian-muted">
              <li className="flex items-center gap-3"><CheckCircle className="w-4 h-4 text-gold" /> <span className="uppercase tracking-wider">No API tokens exposed</span></li>
              <li className="flex items-center gap-3"><CheckCircle className="w-4 h-4 text-gold" /> <span className="uppercase tracking-wider">.env file properly ignored</span></li>
              <li className="flex items-center gap-3"><CheckCircle className="w-4 h-4 text-gold" /> <span className="uppercase tracking-wider">Firestore Rules restricted to Owner</span></li>
              <li className="flex items-center gap-3"><CheckCircle className="w-4 h-4 text-gold" /> <span className="uppercase tracking-wider">Dangerous auto-actions disabled</span></li>
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <div className="glass-card rounded-2xl p-6 border border-obsidian-border hover:border-cyan-signal/30 transition-colors">
            <h3 className="text-sm font-black uppercase tracking-wider text-white mb-4">Working Modules</h3>
            <div className="flex flex-wrap gap-2">
              {['Dashboard', 'Website Control', 'Task Manager', 'Alert Center', 'Reports Center', 'Social Planner', 'Finance Tracker', 'Bengali Assistant'].map(mod => (
                <span key={mod} className="px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider bg-cyan-signal/10 text-cyan-signal border border-cyan-signal/20">{mod}</span>
              ))}
            </div>
          </div>
          
          <div className="glass-card rounded-2xl p-6 border border-obsidian-border">
            <h3 className="text-sm font-black uppercase tracking-wider text-white mb-4">Mock / UI-Only Modules</h3>
            <div className="flex flex-wrap gap-2">
              {['API Kill Switches', 'WhatsApp API', 'Auto Social Posting', 'Payment API', 'Uptime Real Ping'].map(mod => (
                <span key={mod} className="px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider bg-obsidian-dark/80 text-obsidian-muted border border-obsidian-border/50">{mod}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 border border-cyan-signal/30 bg-cyan-signal/5">
          <h3 className="text-sm font-black uppercase tracking-wider text-white mb-4 flex items-center gap-2">
             <ShieldAlert className="w-4 h-4 text-cyan-signal" /> Next Recommended Steps
          </h3>
          <ol className="list-decimal list-inside text-[11px] font-bold text-obsidian-muted space-y-2">
            <li className="pl-2">Ensure <code className="text-gold bg-obsidian-dark px-1.5 py-0.5 rounded">firestore.rules.example</code> is published in your Firebase Console.</li>
            <li className="pl-2">Deploy the final stable build to Vercel.</li>
            <li className="pl-2">Perform a complete live test with dummy data on the deployed site.</li>
            <li className="pl-2">Take a manual JSON backup via the Settings page.</li>
            <li className="pl-2">Plan Serverless API integrations for Phase 2.</li>
          </ol>
        </div>
      </div>

      {/* Assistant Audit Logs Section */}
      <div className="mt-10 pt-10 border-t border-obsidian-border/50 relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-lg lg:text-xl font-extrabold text-white flex items-center gap-3 uppercase tracking-wider">
            <FileText className="w-6 h-6 text-gold" />
            Assistant <span className="gold-gradient-text">Audit Logs</span>
          </h2>
          <button
            onClick={handleClearLogs}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-obsidian-dark border border-status-error/30 text-status-error hover:bg-status-error/10 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)] transition-all text-[10px] font-black uppercase tracking-wider"
          >
            <Trash2 className="w-4 h-4" />
            Clear Logs
          </button>
        </div>

        <div className="glass-card rounded-2xl border border-obsidian-border overflow-hidden relative">
           <div className="absolute top-0 left-0 w-full h-1 gold-gradient" />
          <div className="max-h-[300px] overflow-y-auto empire-scrollbar p-2 mt-1">
            {logs.length === 0 ? (
              <div className="p-12 text-center text-obsidian-muted text-sm border border-dashed border-obsidian-border m-4 rounded-xl">
                <p className="font-black uppercase tracking-wider">No logs found.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-1 p-2">
                {logs.map((log) => (
                  <div key={log.id} className="p-4 rounded-xl bg-obsidian-dark/30 border border-transparent hover:border-gold/20 flex items-start sm:items-center justify-between flex-col sm:flex-row gap-3 hover:bg-obsidian-dark/80 transition-all">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="text-white text-xs font-black uppercase tracking-wider">{log.action.replace(/_/g, ' ')}</span>
                        <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider ${
                          log.status === 'success' ? 'bg-status-live/10 text-status-live border border-status-live/30 shadow-[0_0_10px_rgba(34,197,94,0.1)]' : 'bg-status-error/10 text-status-error border border-status-error/30 shadow-[0_0_10px_rgba(239,68,68,0.1)]'
                        }`}>
                          {log.status}
                        </span>
                      </div>
                      <p className="text-[11px] font-medium text-obsidian-muted mt-1.5">{log.note}</p>
                    </div>
                    <div className="text-[10px] text-obsidian-muted font-mono font-bold bg-obsidian-card border border-obsidian-border px-3 py-1.5 rounded-lg">
                      {new Date(log.timestamp).toLocaleString('en-GB')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
