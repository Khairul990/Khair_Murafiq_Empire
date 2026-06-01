export default function IncomeCard({ source, amount, period }) {
  return (
    <div className="bg-card border border-gray-800 rounded-xl p-4 flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-300 font-medium">{source}</p>
        <p className="text-xs text-gray-500">{period}</p>
      </div>
      <span className="text-lg font-bold text-gold">{amount}</span>
    </div>
  )
}
