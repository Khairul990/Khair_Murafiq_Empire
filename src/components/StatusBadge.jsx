const colorMap = {
  Planning: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
  Building: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  Live: 'bg-green-500/20 text-green-300 border-green-500/30',
  Paused: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
}

export default function StatusBadge({ status }) {
  const style = colorMap[status] || 'bg-gray-500/20 text-gray-300 border-gray-500/30'
  return (
    <span className={`inline-block px-2.5 py-0.5 text-xs font-medium rounded-full border ${style}`}>
      {status}
    </span>
  )
}
