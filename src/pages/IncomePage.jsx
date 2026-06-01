import { DollarSign,TrendingUp } from 'lucide-react'
import IncomeCard from '../components/IncomeCard'
import projects from '../data/projects'

const incomeSources = projects.map((p) => ({
  source: p.name,
  amount: p.income,
  period: 'Current month',
}))

export default function IncomePage() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-gold/10 to-transparent border border-gold/20 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <DollarSign className="w-6 h-6 text-gold" />
          <h3 className="text-white font-semibold text-lg">Monthly Revenue</h3>
        </div>
        <p className="text-4xl font-bold text-gold">$0.00</p>
        <p className="text-xs text-gray-500 mt-1">No active payment sources yet</p>
      </div>

      <div>
        <h3 className="text-white font-semibold mb-3">Project-wise Income</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {incomeSources.map((src, i) => (
            <IncomeCard key={i} {...src} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card border border-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-gold" />
            <h4 className="text-white font-semibold">Free Plan Users</h4>
          </div>
          <p className="text-2xl font-bold text-gray-300">1 (owner)</p>
          <p className="text-xs text-gray-500 mt-1">You are currently on the Free plan</p>
        </div>
        <div className="bg-card border border-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-gold" />
            <h4 className="text-white font-semibold">Premium Users</h4>
          </div>
          <p className="text-2xl font-bold text-gray-300">0</p>
          <p className="text-xs text-gray-500 mt-1">No premium subscriptions yet</p>
        </div>
      </div>
    </div>
  )
}
