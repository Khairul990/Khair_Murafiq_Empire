import { motion } from 'framer-motion'
import { ShieldAlert, KeyRound, Lock, AlertTriangle, CheckCircle, Database } from 'lucide-react'

export default function SafetyPage() {
  const rules = [
    { title: 'No Secret Keys in Frontend', desc: 'Never store API keys, tokens, or credentials in client-side code.', icon: KeyRound, status: 'Enforced' },
    { title: 'No Password Storage', desc: 'Use secure auth providers; do not store raw passwords.', icon: Lock, status: 'Enforced' },
    { title: 'No Real Auto-Posting in Phase 1', desc: 'Social media automation is strictly disabled during early phases.', icon: ShieldAlert, status: 'Active' },
    { title: 'No Automatic Ad Spending', desc: 'Financial transactions require explicit manual approval.', icon: AlertTriangle, status: 'Enforced' },
    { title: 'No Dangerous Auto-Fixes', desc: 'Automated code or system fixes must be reviewed by the owner.', icon: AlertTriangle, status: 'Active' },
    { title: 'Future Integrations (Serverless)', desc: 'All risky actions will route through secure backend functions.', icon: Database, status: 'Planned' },
  ]

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
    </motion.div>
  )
}
