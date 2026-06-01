const priorityColors = {
  High: 'text-red-400 border-red-500/30 bg-red-500/10',
  Medium: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10',
  Low: 'text-green-400 border-green-500/30 bg-green-500/10',
}

export default function TaskCard({ task }) {
  return (
    <div className="bg-card border border-gray-800 rounded-xl p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${task.priority === 'High' ? 'bg-red-400' : task.priority === 'Medium' ? 'bg-yellow-400' : 'bg-green-400'}`} />
        <div>
          <p className="text-sm text-white font-medium">{task.title}</p>
          <p className="text-xs text-gray-500">{task.project}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>
        <span className="text-xs text-gray-500">{task.dueDate}</span>
      </div>
    </div>
  )
}
