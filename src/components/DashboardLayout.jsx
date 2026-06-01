import { Outlet, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { signOut } from 'firebase/auth'
import { auth } from '../services/firebaseConfig'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import EmpireAssistant from './EmpireAssistant'
import { addAuditLog } from '../utils/auditLogger'
import { AlertOctagon, ShieldAlert } from 'lucide-react'

export default function DashboardLayout() {
  const [assistantOpen, setAssistantOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [showLockdown, setShowLockdown] = useState(false)
  const [lockdownInput, setLockdownInput] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const handleTriggerLockdown = () => setShowLockdown(true)
    window.addEventListener('trigger_lockdown', handleTriggerLockdown)
    return () => window.removeEventListener('trigger_lockdown', handleTriggerLockdown)
  }, [])

  const handleLockdownConfirm = async () => {
    if (lockdownInput !== 'LOCK') return

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    
    window.dispatchEvent(new Event('lockdown_confirmed'))
    
    addAuditLog('emergency_lockdown', 'success', 'owner_manual', 'System lockdown initiated')
    
    setShowLockdown(false)
    setLockdownInput('')
    
    try {
      await signOut(auth)
      navigate('/')
    } catch (err) {
      console.error('Logout error', err)
    }
  }

  return (
    <div className="min-h-screen bg-empire-dark bg-empire-pattern flex overflow-hidden">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      {/* Main content area */}
      <div className={`flex-1 flex flex-col h-screen transition-all duration-300 ${collapsed ? 'lg:ml-20' : 'lg:ml-64'} min-w-0`}>
        <Topbar onToggleAssistant={() => setAssistantOpen(!assistantOpen)} />
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto empire-scrollbar relative">
          <Outlet />
        </main>
      </div>
      {/* Floating Assistant Button */}
      <EmpireAssistant open={assistantOpen} onToggle={() => setAssistantOpen(!assistantOpen)} />

      {/* Emergency Lockdown Modal */}
      {showLockdown && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-obsidian-dark border border-status-error/50 rounded-2xl w-full max-w-md shadow-[0_0_50px_rgba(239,68,68,0.2)] flex flex-col overflow-hidden">
            <div className="bg-status-error/10 p-5 flex items-center gap-3 border-b border-status-error/20">
              <div className="w-12 h-12 rounded-xl bg-status-error/20 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-6 h-6 text-status-error animate-pulse" />
              </div>
              <div>
                <h2 className="text-status-error font-bold text-lg">Emergency Lockdown Confirmation</h2>
                <p className="text-status-error/70 text-xs">Security Action</p>
              </div>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="bg-status-error/5 border border-status-error/20 p-3 rounded-lg flex items-start gap-3">
                <AlertOctagon className="w-5 h-5 text-status-error shrink-0 mt-0.5" />
                <p className="text-sm text-obsidian-text leading-relaxed">
                  This will close the assistant, stop voice monitor, hide sensitive dashboard view, and sign out the owner. <strong className="text-status-error font-bold">No data will be deleted.</strong>
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-obsidian-muted uppercase font-bold tracking-wider">Type LOCK to confirm</label>
                <input
                  type="text"
                  value={lockdownInput}
                  onChange={(e) => setLockdownInput(e.target.value)}
                  placeholder="LOCK"
                  className="w-full bg-obsidian-card border border-obsidian-border rounded-xl px-4 py-3 text-white font-bold tracking-widest focus:outline-none focus:border-status-error/50 transition-colors"
                />
              </div>
            </div>

            <div className="p-5 border-t border-obsidian-border flex justify-end gap-3 bg-obsidian-card/50">
              <button
                onClick={() => {
                  setShowLockdown(false)
                  setLockdownInput('')
                }}
                className="px-5 py-2.5 rounded-xl font-bold text-obsidian-muted hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLockdownConfirm}
                disabled={lockdownInput !== 'LOCK'}
                className="px-5 py-2.5 rounded-xl font-bold bg-status-error text-white shadow-lg shadow-status-error/20 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Lockdown
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
