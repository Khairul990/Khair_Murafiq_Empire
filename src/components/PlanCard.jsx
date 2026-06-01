import { Check, Crown, Star } from 'lucide-react'

const iconMap = {
  Free: Star,
  Premium: Crown,
  Lifetime: Crown,
}

export default function PlanCard({ plan }) {
  const Icon = iconMap[plan.name] || Star
  const isCurrent = plan.status === 'current'
  return (
    <div className={`bg-card border rounded-xl p-6 ${isCurrent ? 'border-gold/50 glow-gold' : 'border-gray-800'}`}>
      <div className="flex items-center gap-3 mb-4">
        <Icon className={`w-6 h-6 ${isCurrent ? 'text-gold' : 'text-gray-400'}`} />
        <div>
          <h3 className="text-white font-semibold text-lg">{plan.name}</h3>
          <p className="text-2xl font-bold text-gold">
            {plan.price}
            <span className="text-sm font-normal text-gray-400"> {plan.period}</span>
          </p>
        </div>
      </div>
      {isCurrent && (
        <span className="inline-block px-2 py-0.5 text-xs font-medium text-gold bg-gold/10 rounded-full mb-3">
          Current Plan
        </span>
      )}
      <ul className="space-y-2 mt-4">
        {plan.features.map((f, i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
            <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
            {f}
          </li>
        ))}
      </ul>
    </div>
  )
}
