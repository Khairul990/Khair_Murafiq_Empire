import { ShieldAlert, Shield, Info } from 'lucide-react'
import SecurityLogCard from '../components/SecurityLogCard'
import securityLogs from '../data/securityLogs'

export default function SecurityPage() {
  return (
    <div className="space-y-6">
      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-yellow-300 font-medium">Owner Access Only</p>
          <p className="text-xs text-yellow-400/70">This page displays demo security logs. No real authentication data is exposed.</p>
        </div>
      </div>

      <div className="space-y-2">
        {securityLogs.map((log) => (
          <SecurityLogCard key={log.id} log={log} />
        ))}
      </div>

      <div className="bg-card border border-gray-800 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-5 h-5 text-gold" />
          <h3 className="text-white font-semibold">Security Notes</h3>
        </div>
        <ul className="space-y-2 text-sm text-gray-400">
          <li className="flex items-start gap-2">
            <Info className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
            Firebase Security Rules are set to test mode — update before production.
          </li>
          <li className="flex items-start gap-2">
            <Info className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
            No API keys or secrets are stored in this frontend.
          </li>
          <li className="flex items-start gap-2">
            <Info className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
            All data shown here is placeholder/demo only.
          </li>
        </ul>
      </div>
    </div>
  )
}
