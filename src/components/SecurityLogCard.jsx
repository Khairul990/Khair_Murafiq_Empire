const statusColors = {
  allowed: 'text-green-400',
  blocked: 'text-red-400',
  verified: 'text-blue-400',
}

export default function SecurityLogCard({ log }) {
  return (
    <div className="bg-card border border-gray-800 rounded-xl p-4 flex items-center justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs text-gray-500">{log.timestamp}</span>
          <span className={`text-xs font-medium capitalize ${statusColors[log.status] || 'text-gray-400'}`}>
            {log.status}
          </span>
        </div>
        <p className="text-sm text-white font-medium">{log.action}</p>
        <p className="text-xs text-gray-500">{log.device}</p>
      </div>
    </div>
  )
}
