import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Users, UserPlus, CheckCircle, Clock, Eye, Briefcase,
  MoreHorizontal, Mail,
} from 'lucide-react'
import staffList from '../data/staff'

const roleColors = {
  'Owner / Super Admin': 'gold',
  'Manager': 'blue',
  'Staff': 'muted',
}

const statusColors = {
  Working: 'text-status-live',
  Review: 'text-status-warning',
  Pending: 'text-obsidian-muted',
}

export default function StaffPage() {
  const [staff, setStaff] = useState(staffList)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl lg:text-2xl font-extrabold text-white">
            Staff <span className="gold-gradient-text">Management</span>
          </h1>
          <p className="text-xs text-obsidian-muted mt-1">
            Manage team members, roles, and assignments
          </p>
        </div>
        <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold gold-gradient text-obsidian-dark hover:opacity-90 transition-all">
          <UserPlus className="w-3.5 h-3.5" /> Add Staff
        </button>
      </div>

      {/* Staff Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {staff.map((member, i) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card-hover rounded-2xl p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-extrabold ${
                  member.role === 'Owner / Super Admin'
                    ? 'gold-gradient text-obsidian-dark'
                    : member.role === 'Manager'
                    ? 'bg-status-dev/20 text-status-dev border border-status-dev/30'
                    : 'bg-obsidian-card text-obsidian-muted border border-obsidian-border'
                }`}>
                  {member.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">{member.name}</h3>
                  <span className={`text-[11px] font-medium ${
                    member.role === 'Owner / Super Admin' ? 'text-gold' :
                    member.role === 'Manager' ? 'text-status-dev' : 'text-obsidian-muted'
                  }`}>
                    {member.role}
                  </span>
                </div>
              </div>
              <span className={`status-dot ${
                member.status === 'Working' ? 'live' :
                member.status === 'Review' ? 'warning' : 'offline'
              }`} />
            </div>

            <div className="space-y-1.5 mb-4">
              <div className="flex items-center gap-2 text-xs text-obsidian-muted">
                <Briefcase className="w-3 h-3" />
                <span>Project: <span className="text-white">{member.project}</span></span>
              </div>
              <div className="flex items-center gap-2 text-xs text-obsidian-muted">
                <Clock className="w-3 h-3" />
                <span>Task: <span className="text-white">{member.task}</span></span>
              </div>
              <div className="flex items-center gap-2 text-xs text-obsidian-muted">
                <CheckCircle className="w-3 h-3" />
                <span>Status: <span className={statusColors[member.status]}>{member.status}</span></span>
              </div>
              <div className="flex items-center gap-2 text-xs text-obsidian-muted">
                <Clock className="w-3 h-3" />
                <span>Last active: {member.lastActive}</span>
              </div>
              {member.pendingReview > 0 && (
                <div className="flex items-center gap-2 text-xs text-status-warning">
                  <Eye className="w-3 h-3" />
                  <span>{member.pendingReview} item(s) pending review</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-3 border-t border-obsidian-border">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gold/10 text-gold border border-gold/20 hover:bg-gold/20 transition-all">
                Assign Task
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-obsidian-card text-obsidian-muted border border-obsidian-border hover:text-white transition-all">
                Mark Review
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-obsidian-card text-obsidian-muted border border-obsidian-border hover:text-white transition-all ml-auto">
                <Eye className="w-3 h-3" /> Activity
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
