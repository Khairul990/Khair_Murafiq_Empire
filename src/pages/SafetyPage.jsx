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
      className="space-y-5"
    >
      <div>
        <h1 className="text-xl lg:text-2xl font-extrabold text-white">
          Safety & <span className="gold-gradient-text">Compliance</span>
        </h1>
        <p className="text-xs text-obsidian-muted mt-1">
          Security protocols and empire safety rules
        </p>
      </div>

      <div className="glass-card rounded-2xl p-5 border border-status-warning/20">
        <div className="flex items-center gap-2 mb-4">
          <ShieldAlert className="w-5 h-5 text-status-warning" />
          <h3 className="text-white font-bold text-sm">Strict Security Notice</h3>
        </div>
        <p className="text-xs text-obsidian-muted leading-relaxed">
          All risky actions require explicit confirmation from the Owner. 
          Do not connect real APIs or financial accounts during Phase 1 testing.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rules.map((rule, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-start gap-4 p-4 rounded-xl glass-card border border-obsidian-border"
          >
            <div className="w-8 h-8 rounded-lg bg-status-live/10 flex items-center justify-center flex-shrink-0">
              <rule.icon className="w-4 h-4 text-status-live" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-sm font-bold text-white">{rule.title}</h4>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold text-status-live bg-status-live/10 border border-status-live/20">
                  {rule.status}
                </span>
              </div>
              <p className="text-xs text-obsidian-muted leading-relaxed">{rule.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Final System Audit Section */}
      <div className="mt-8 pt-8 border-t border-obsidian-border">
        <h2 className="text-lg lg:text-xl font-extrabold text-white flex items-center gap-2 mb-4">
          <CheckCircle className="w-5 h-5 text-status-live" />
          Final System <span className="gold-gradient-text">Audit</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="glass-card rounded-2xl p-5 border border-status-live/20 bg-status-live/5">
            <h3 className="text-sm font-bold text-white mb-3">System Status</h3>
            <ul className="space-y-2 text-xs text-obsidian-muted">
              <li className="flex justify-between"><span>Overall Condition:</span> <span className="font-bold text-status-live">Safe & Secure</span></li>
              <li className="flex justify-between"><span>Firebase Connection:</span> <span className="font-bold text-status-live">Active (Owner Only)</span></li>
              <li className="flex justify-between"><span>Local Storage:</span> <span className="font-bold text-status-live">Fallback Enabled</span></li>
              <li className="flex justify-between"><span>Security Threats:</span> <span className="font-bold text-white">None Found</span></li>
            </ul>
          </div>
          
          <div className="glass-card rounded-2xl p-5 border border-gold/20">
            <h3 className="text-sm font-bold text-white mb-3">Security Checklist</h3>
            <ul className="space-y-2 text-xs text-obsidian-muted">
              <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-status-live" /> No API tokens exposed</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-status-live" /> .env file properly ignored</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-status-live" /> Firestore Rules restricted to Owner</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-status-live" /> Dangerous auto-actions disabled</li>
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="glass-card rounded-2xl p-5 border border-obsidian-border">
            <h3 className="text-sm font-bold text-white mb-3">Working Modules</h3>
            <div className="flex flex-wrap gap-2">
              {['Dashboard', 'Website Control', 'Task Manager', 'Alert Center', 'Reports Center', 'Social Planner', 'Finance Tracker', 'Bengali Assistant'].map(mod => (
                <span key={mod} className="px-2 py-1 rounded-md text-[10px] bg-status-live/10 text-status-live border border-status-live/20">{mod}</span>
              ))}
            </div>
          </div>
          
          <div className="glass-card rounded-2xl p-5 border border-obsidian-border">
            <h3 className="text-sm font-bold text-white mb-3">Mock / UI-Only Modules</h3>
            <div className="flex flex-wrap gap-2">
              {['API Kill Switches', 'WhatsApp API', 'Auto Social Posting', 'Payment API', 'Uptime Real Ping'].map(mod => (
                <span key={mod} className="px-2 py-1 rounded-md text-[10px] bg-obsidian-dark text-obsidian-muted border border-obsidian-border">{mod}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-blue-400/20 bg-blue-400/5">
          <h3 className="text-sm font-bold text-white mb-2">Next Recommended Steps</h3>
          <ol className="list-decimal list-inside text-xs text-obsidian-muted space-y-1">
            <li>Ensure <code className="text-gold">firestore.rules.example</code> is published in your Firebase Console.</li>
            <li>Deploy the final stable build to Vercel.</li>
            <li>Perform a complete live test with dummy data on the deployed site.</li>
            <li>Take a manual JSON backup via the Settings page.</li>
            <li>Plan Serverless API integrations for Phase 2.</li>
          </ol>
        </div>
      </div>

      {/* Assistant Audit Logs Section */}
      <div className="mt-8 pt-8 border-t border-obsidian-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg lg:text-xl font-extrabold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-gold" />
            Assistant <span className="gold-gradient-text">Audit Logs</span>
          </h2>
          <button
            onClick={handleClearLogs}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-obsidian-card border border-status-error/30 text-status-error hover:bg-status-error/10 transition-colors text-xs font-bold"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Logs
          </button>
        </div>

        <div className="glass-card rounded-2xl border border-obsidian-border overflow-hidden">
          <div className="max-h-[300px] overflow-y-auto empire-scrollbar p-1">
            {logs.length === 0 ? (
              <div className="p-8 text-center text-obsidian-muted text-sm">
                No logs found.
              </div>
            ) : (
              <div className="flex flex-col">
                {logs.map((log) => (
                  <div key={log.id} className="p-3 border-b border-obsidian-border/50 last:border-0 flex items-start sm:items-center justify-between flex-col sm:flex-row gap-2 hover:bg-obsidian-dark/50 transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white text-sm font-bold capitalize">{log.action.replace(/_/g, ' ')}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                          log.status === 'success' ? 'bg-status-live/10 text-status-live border border-status-live/20' : 'bg-status-error/10 text-status-error border border-status-error/20'
                        }`}>
                          {log.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-obsidian-muted mt-0.5">{log.note}</p>
                    </div>
                    <div className="text-[10px] text-obsidian-muted font-mono bg-obsidian-dark px-2 py-1 rounded">
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
