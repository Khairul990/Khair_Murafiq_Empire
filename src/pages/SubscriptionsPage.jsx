import PlanCard from '../components/PlanCard'
import plans from '../data/plans'

export default function SubscriptionsPage() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((p) => (
          <PlanCard key={p.id} plan={p} />
        ))}
      </div>

      <div className="bg-card border border-gray-800 rounded-xl p-5">
        <h3 className="text-white font-semibold mb-3">Subscription Status</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-xs uppercase border-b border-gray-800">
                <th className="text-left py-2 pr-4">Plan</th>
                <th className="text-left py-2 pr-4">Status</th>
                <th className="text-left py-2 pr-4">Users</th>
                <th className="text-left py-2">Revenue</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-800/50">
                <td className="py-3 pr-4 text-white">Free</td>
                <td className="py-3 pr-4"><span className="text-green-400">Active</span></td>
                <td className="py-3 pr-4 text-gray-300">1</td>
                <td className="py-3 text-gray-300">$0</td>
              </tr>
              <tr className="border-b border-gray-800/50">
                <td className="py-3 pr-4 text-white">Premium</td>
                <td className="py-3 pr-4"><span className="text-yellow-400">Inactive</span></td>
                <td className="py-3 pr-4 text-gray-300">0</td>
                <td className="py-3 text-gray-300">$0</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 text-white">Lifetime</td>
                <td className="py-3 pr-4"><span className="text-yellow-400">Inactive</span></td>
                <td className="py-3 pr-4 text-gray-300">0</td>
                <td className="py-3 text-gray-300">$0</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
