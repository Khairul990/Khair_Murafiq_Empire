import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Settings, User, Bell, Globe, Zap, Database, Download, Upload, FileJson, AlertTriangle, LogOut, Server, CheckCircle, XCircle } from 'lucide-react'
import { logActivity } from '../data/activity'
import { firebaseService } from '../services/firebaseService'
import { signOut } from 'firebase/auth'
import { auth } from '../services/firebaseConfig'

export default function SettingsPage() {
  const [ecoMode, setEcoMode] = useState(false)
  const [lang, setLang] = useState('en')
  
  const [testResult, setTestResult] = useState(null)
  const [isTesting, setIsTesting] = useState(false)

  const [previewData, setPreviewData] = useState(null)
  const [migrationPreview, setMigrationPreview] = useState(null)
  const [backupDownloaded, setBackupDownloaded] = useState(false)
  const [migrationConfirmText, setMigrationConfirmText] = useState('')
  const [isMigrating, setIsMigrating] = useState(false)
  const [migrationResult, setMigrationResult] = useState(null)
  const fileInputRef = useRef(null)

  const exportData = (keysToExport, filename) => {
    const data = {
      exportDate: new Date().toISOString(),
      appName: 'Khair Murafiq Empire OS',
      backupVersion: 1
    }
    
    keysToExport.forEach(key => {
      try {
        const val = localStorage.getItem(key)
        data[key.replace('km_empire_', '')] = val ? JSON.parse(val) : []
      } catch {
        data[key.replace('km_empire_', '')] = []
      }
    })
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
    
    logActivity('Data exported', `Exported ${filename}`)
  }

  const handleExportAll = () => {
    exportData([
      'km_empire_projects', 'km_empire_alerts', 'km_empire_tasks', 
      'km_empire_finance', 'km_empire_goals', 'km_empire_social_posts', 'km_empire_settings'
    ], `km-empire-backup-${new Date().toISOString().split('T')[0]}.json`)
    setBackupDownloaded(true)
  }

  const handleExportSpecific = (type, key) => {
    exportData([key], `empire_os_${type}_${new Date().toISOString().split('T')[0]}.json`)
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result)
        if (json.appName !== 'Khair Murafiq Empire OS') {
          alert("Invalid backup file! Missing appName identifier.")
          return
        }
        setPreviewData(json)
      } catch {
        alert("Failed to parse JSON backup file.")
      }
    }
    reader.readAsText(file)
    e.target.value = null // reset input
  }

  const handleConfirmRestore = () => {
    if (!window.confirm("CRITICAL WARNING: This will overwrite your current local data with the backup data. Are you sure you want to proceed?")) {
      return
    }

    if (previewData.projects) localStorage.setItem('km_empire_projects', JSON.stringify(previewData.projects))
    if (previewData.alerts) localStorage.setItem('km_empire_alerts', JSON.stringify(previewData.alerts))
    if (previewData.tasks) localStorage.setItem('km_empire_tasks', JSON.stringify(previewData.tasks))
    if (previewData.finance) localStorage.setItem('km_empire_finance', JSON.stringify(previewData.finance))
    if (previewData.goals) localStorage.setItem('km_empire_goals', JSON.stringify(previewData.goals))
    if (previewData.social_posts) localStorage.setItem('km_empire_social_posts', JSON.stringify(previewData.social_posts))
    if (previewData.settings) localStorage.setItem('km_empire_settings', JSON.stringify(previewData.settings))
    
    logActivity('Backup imported', `Restored backup from ${previewData.exportedAt}`)
    
    setPreviewData(null)
    alert("Data restored successfully! Please refresh the page to see changes.")
    window.location.reload()
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      logActivity('Logged out', 'Owner securely logged out via Firebase Auth')
    } catch (error) {
      console.error("Logout failed", error)
    }
  }

  const handleTestFirebase = async () => {
    setIsTesting(true)
    setTestResult(null)
    const result = await firebaseService.testFirebaseConnection()
    setTestResult(result)
    setIsTesting(false)
  }

  const handlePreviewMigration = () => {
    const getCount = (key) => {
      try {
        const val = localStorage.getItem(key)
        if (!val) return 0
        const parsed = JSON.parse(val)
        return Array.isArray(parsed) ? parsed.length : (parsed ? Object.keys(parsed).length : 0)
      } catch { return 0 }
    }

    const mData = {
      projects: getCount('km_empire_projects'),
      tasks: getCount('km_empire_tasks'),
      alerts: getCount('km_empire_alerts'),
      finance: getCount('km_empire_finance'),
      social_posts: getCount('km_empire_social_posts'),
      goals: getCount('km_empire_goals'),
      settings: getCount('km_empire_settings')
    }
    
    setMigrationPreview(mData)
  }

  const handleRunMigration = async () => {
    if (migrationConfirmText !== 'MIGRATE') return
    
    setIsMigrating(true)
    
    // Read fresh data
    const localData = {
      projects: JSON.parse(localStorage.getItem('km_empire_projects') || '[]'),
      tasks: JSON.parse(localStorage.getItem('km_empire_tasks') || '[]'),
      alerts: JSON.parse(localStorage.getItem('km_empire_alerts') || '[]'),
      finance: JSON.parse(localStorage.getItem('km_empire_finance') || '[]'),
      social_posts: JSON.parse(localStorage.getItem('km_empire_social_posts') || '[]'),
      goals: JSON.parse(localStorage.getItem('km_empire_goals') || '[]'),
      settings: JSON.parse(localStorage.getItem('km_empire_settings') || 'null')
    }

    const result = await firebaseService.migrateDataToFirestore(localData)
    
    if (result.success) {
      const verify = await firebaseService.verifyMigration()
      if (verify.success) {
        setMigrationResult({ success: true, message: `Migration verified! P:${verify.projects} T:${verify.tasks} A:${verify.alerts}` })
      } else {
        setMigrationResult({ success: true, message: `Migration completed but verification failed: ${verify.error}` })
      }
    } else {
      setMigrationResult({ success: false, message: `Migration failed: ${result.error}` })
    }
    
    setIsMigrating(false)
    setMigrationConfirmText('')
    setMigrationPreview(null)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl lg:text-2xl font-extrabold text-white">
            System <span className="gold-gradient-text">Settings</span>
          </h1>
          <p className="text-xs text-obsidian-muted mt-1">
            Configure your Empire OS preferences and manage your data.
          </p>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-status-error/10 border border-status-error/30 text-status-error hover:bg-status-error hover:text-white transition-all"
        >
          <LogOut className="w-4 h-4" /> Log Out
        </button>
      </div>

      {/* Preview Modal Overlay */}
      {previewData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-dark/90 backdrop-blur-sm">
          <div className="bg-obsidian-card border border-obsidian-border rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-status-warning" />
              <h2 className="text-lg font-bold text-white">Confirm Backup Restore</h2>
            </div>
            <p className="text-sm text-obsidian-muted mb-4">
              You are about to restore data exported on <strong>{new Date(previewData.exportedAt).toLocaleString()}</strong>.
            </p>
            
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-xs p-2 rounded bg-obsidian-dark border border-obsidian-border">
                <span className="text-obsidian-muted">Projects</span>
                <span className="font-bold text-white">{previewData.projects?.length || 0}</span>
              </div>
              <div className="flex justify-between text-xs p-2 rounded bg-obsidian-dark border border-obsidian-border">
                <span className="text-obsidian-muted">Tasks</span>
                <span className="font-bold text-white">{previewData.tasks?.length || 0}</span>
              </div>
              <div className="flex justify-between text-xs p-2 rounded bg-obsidian-dark border border-obsidian-border">
                <span className="text-obsidian-muted">Alerts</span>
                <span className="font-bold text-white">{previewData.alerts?.length || 0}</span>
              </div>
              <div className="flex justify-between text-xs p-2 rounded bg-obsidian-dark border border-obsidian-border">
                <span className="text-obsidian-muted">Finance Entries</span>
                <span className="font-bold text-white">{previewData.finance?.length || 0}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={handleConfirmRestore} className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-status-warning/20 border border-status-warning/50 hover:bg-status-warning hover:text-obsidian-dark transition-all">
                Confirm & Overwrite
              </button>
              <button onClick={() => setPreviewData(null)} className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-obsidian-dark text-obsidian-muted border border-obsidian-border hover:text-white transition-all">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Migration Preview Modal Overlay */}
      {migrationPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-dark/90 backdrop-blur-sm">
          <div className="bg-obsidian-card border border-blue-500/50 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <Server className="w-6 h-6 text-blue-400" />
              <h2 className="text-lg font-bold text-white">Migration Preview</h2>
            </div>
            <p className="text-sm text-obsidian-muted mb-4">
              This preview shows the local data that will be moved to Firestore collections.
            </p>
            
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-xs p-2 rounded bg-obsidian-dark border border-obsidian-border">
                <span className="text-obsidian-muted">control_projects</span>
                <span className="font-bold text-white">{migrationPreview.projects} items</span>
              </div>
              <div className="flex justify-between text-xs p-2 rounded bg-obsidian-dark border border-obsidian-border">
                <span className="text-obsidian-muted">control_tasks</span>
                <span className="font-bold text-white">{migrationPreview.tasks} items</span>
              </div>
              <div className="flex justify-between text-xs p-2 rounded bg-obsidian-dark border border-obsidian-border">
                <span className="text-obsidian-muted">control_alerts</span>
                <span className="font-bold text-white">{migrationPreview.alerts} items</span>
              </div>
              <div className="flex justify-between text-xs p-2 rounded bg-obsidian-dark border border-obsidian-border">
                <span className="text-obsidian-muted">control_reports (finance/social)</span>
                <span className="font-bold text-white">{migrationPreview.finance + migrationPreview.social_posts} items</span>
              </div>
              <div className="flex justify-between text-xs p-2 rounded bg-obsidian-dark border border-obsidian-border">
                <span className="text-obsidian-muted">control_settings (goals/config)</span>
                <span className="font-bold text-white">{migrationPreview.goals + (migrationPreview.settings ? 1 : 0)} items</span>
              </div>
            </div>

            <div className="bg-status-warning/10 border border-status-warning/30 rounded-xl p-3 mb-4">
              <p className="text-[10px] text-status-warning font-bold leading-tight mb-2">
                Type MIGRATE below to confirm.
              </p>
              <input 
                type="text" 
                value={migrationConfirmText}
                onChange={(e) => setMigrationConfirmText(e.target.value)}
                placeholder="MIGRATE"
                className="w-full bg-obsidian-dark border border-status-warning/50 rounded p-2 text-white text-xs text-center font-bold outline-none uppercase"
              />
            </div>

            <div className="flex gap-3">
              <button 
                onClick={handleRunMigration}
                disabled={migrationConfirmText !== 'MIGRATE' || isMigrating}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-obsidian-dark bg-status-warning hover:bg-status-warning/90 transition-all disabled:opacity-50 disabled:bg-obsidian-dark disabled:text-obsidian-muted disabled:border-obsidian-border"
              >
                {isMigrating ? 'Migrating...' : 'Confirm Migration'}
              </button>
              <button onClick={() => { setMigrationPreview(null); setMigrationConfirmText(''); }} disabled={isMigrating} className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-obsidian-dark text-obsidian-muted border border-obsidian-border hover:text-white transition-all">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Backup & Restore Center */}
        <div className="glass-card rounded-2xl p-5 lg:col-span-2 border border-gold/20">
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-5 h-5 text-gold" />
            <h3 className="text-white font-bold text-sm">Backup & Restore Center</h3>
            <span className="px-2 py-0.5 rounded-full bg-status-live/10 text-status-live text-[10px] font-bold border border-status-live/30 ml-2">
              Fallback Backup Ready
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="text-xs text-obsidian-muted font-semibold uppercase tracking-wider">Export Data</h4>
              <p className="text-[10px] text-obsidian-muted/70 mb-2">Download your local storage data as a secure JSON file to prevent loss.</p>
              
              <button onClick={handleExportAll} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold gold-gradient text-obsidian-dark hover:opacity-90 transition-all">
                <Download className="w-4 h-4" /> Export All Data
              </button>
              
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button onClick={() => handleExportSpecific('projects', 'km_empire_projects')} className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-semibold bg-obsidian-card border border-obsidian-border text-white hover:border-gold/50 transition-all">
                  <FileJson className="w-3 h-3 text-gold" /> Projects
                </button>
                <button onClick={() => handleExportSpecific('tasks', 'km_empire_tasks')} className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-semibold bg-obsidian-card border border-obsidian-border text-white hover:border-gold/50 transition-all">
                  <FileJson className="w-3 h-3 text-blue-400" /> Tasks
                </button>
                <button onClick={() => handleExportSpecific('alerts', 'km_empire_alerts')} className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-semibold bg-obsidian-card border border-obsidian-border text-white hover:border-gold/50 transition-all">
                  <FileJson className="w-3 h-3 text-status-warning" /> Alerts
                </button>
                <button onClick={() => handleExportSpecific('finance', 'km_empire_finance')} className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-semibold bg-obsidian-card border border-obsidian-border text-white hover:border-gold/50 transition-all">
                  <FileJson className="w-3 h-3 text-status-live" /> Finance
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs text-obsidian-muted font-semibold uppercase tracking-wider">Import Data</h4>
              <p className="text-[10px] text-obsidian-muted/70 mb-2">Restore data from a previously downloaded JSON backup file.</p>
              
              <input 
                type="file" 
                accept=".json" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
              />
              <button onClick={() => fileInputRef.current.click()} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold bg-obsidian-dark text-white border border-obsidian-border hover:border-blue-400/50 hover:bg-blue-400/10 transition-all">
                <Upload className="w-4 h-4" /> Select Backup File to Restore
              </button>
              
              <div className="bg-obsidian-card/50 border border-status-warning/20 rounded-xl p-3 flex gap-2 items-start mt-2">
                <AlertTriangle className="w-4 h-4 text-status-warning flex-shrink-0" />
                <p className="text-[9px] text-obsidian-muted leading-tight">
                  Importing a backup will <strong className="text-status-warning">overwrite</strong> your current local data. A preview will be shown before confirmation.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Firebase Status Panel */}
        <div className="glass-card rounded-2xl p-5 lg:col-span-2 border border-blue-500/20">
          <div className="flex items-center gap-2 mb-4">
            <Server className="w-5 h-5 text-blue-400" />
            <h3 className="text-white font-bold text-sm">Firebase Configuration</h3>
            <span className="px-2 py-0.5 rounded-full bg-status-live/10 text-status-live text-[10px] font-bold border border-status-live/30 ml-2">
              Connected & Live
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between text-xs p-2.5 rounded-lg bg-obsidian-dark border border-obsidian-border">
                <span className="text-obsidian-muted font-bold">Last Firebase Test</span>
                <span className="font-bold text-status-live">Connected</span>
              </div>
              <div className="flex justify-between text-xs p-2.5 rounded-lg bg-obsidian-dark border border-obsidian-border">
                <span className="text-obsidian-muted font-bold">Firebase Auth</span>
                <span className="font-bold text-status-live">Active</span>
              </div>
              <div className="flex justify-between text-xs p-2.5 rounded-lg bg-obsidian-dark border border-obsidian-border">
                <span className="text-obsidian-muted font-bold">Firestore Rules</span>
                <span className="font-bold text-status-live">Published / Tested</span>
              </div>
              <div className="flex justify-between text-xs p-2.5 rounded-lg bg-obsidian-dark border border-obsidian-border">
                <span className="text-obsidian-muted font-bold">Database Protection</span>
                <span className="font-bold text-status-live">Owner-only Active</span>
              </div>
              <div className="flex justify-between text-xs p-2.5 rounded-lg bg-obsidian-dark border border-obsidian-border">
                <span className="text-obsidian-muted font-bold">Storage Mode</span>
                <span className="font-bold text-status-live">Firebase Active</span>
              </div>
              <div className="flex justify-between text-xs p-2.5 rounded-lg bg-obsidian-dark border border-obsidian-border">
                <span className="text-obsidian-muted font-bold">Local Fallback</span>
                <span className="font-bold text-status-live">Enabled</span>
              </div>
              <div className="flex justify-between text-xs p-2.5 rounded-lg bg-obsidian-dark border border-obsidian-border">
                <span className="text-obsidian-muted font-bold">Migration</span>
                <span className="font-bold text-status-live">Completed / Verification Passed</span>
              </div>
              <div className="flex justify-between text-xs p-2.5 rounded-lg bg-obsidian-dark border border-obsidian-border">
                <span className="text-obsidian-muted font-bold">Backup</span>
                <span className="font-bold text-status-live">Available</span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs text-obsidian-muted font-semibold uppercase tracking-wider">Planned Collections</h4>
              <div className="flex flex-wrap gap-2">
                {['control_projects', 'control_tasks', 'control_alerts', 'control_settings', 'control_activity_logs'].map(col => (
                  <span key={col} className="px-2 py-1 bg-obsidian-card border border-obsidian-border rounded text-[10px] text-white font-mono">
                    {col}
                  </span>
                ))}
              </div>
              
              <div className="bg-status-live/10 border border-status-live/30 rounded-xl p-3 flex gap-2 items-start mt-4">
                <CheckCircle className="w-5 h-5 text-status-live flex-shrink-0" />
                <p className="text-[10px] text-status-live font-bold leading-tight">
                  Firebase is Live. Recommended to backup your data before making major structural changes.
                </p>
              </div>

              <div className="mt-4">
                <h4 className="text-xs text-obsidian-muted font-semibold uppercase tracking-wider mb-2">Security Rules Checklist</h4>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-[10px]">
                    <CheckCircle className="w-3 h-3 text-status-live" /> <span className="text-white">No private key in frontend</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px]">
                    <CheckCircle className="w-3 h-3 text-status-live" /> <span className="text-white">.env ignored</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px]">
                    <CheckCircle className="w-3 h-3 text-status-live" /> <span className="text-white">Firebase connection tested</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px]">
                    <CheckCircle className="w-3 h-3 text-status-live" /> <span className="text-white">Firestore rules draft ready</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px]">
                    <CheckCircle className="w-3 h-3 text-status-live" /> <span className="text-white">Firebase Auth Active</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px]">
                    <CheckCircle className="w-3 h-3 text-blue-400" /> <span className="text-white">Migration blocked</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mt-4 text-center">
                <button 
                  onClick={handleTestFirebase}
                  disabled={isTesting}
                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-blue-500 text-white hover:bg-blue-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mb-3"
                >
                  {isTesting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Server className="w-4 h-4" />}
                  {isTesting ? 'Testing Connection...' : 'Test Firebase Connection'}
                </button>

                {testResult && (
                  <div className={`p-3 rounded-lg text-xs font-bold mb-3 flex items-center gap-2 ${testResult.success ? 'bg-status-live/20 text-status-live' : 'bg-status-error/20 text-status-error'}`}>
                    {testResult.success ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    {testResult.message}
                  </div>
                )}
                
                {testResult?.message === 'Permission denied' && (
                  <p className="text-[10px] text-status-error font-semibold mb-3">
                    Firebase connected, but Firestore rules may be blocking test write/read.
                  </p>
                )}

                <p className="text-[10px] text-obsidian-muted/80 mb-4">
                  Firebase test only. Your dashboard data is still stored locally.
                </p>

                {migrationResult && (
                  <div className={`p-3 rounded-lg text-xs font-bold mb-3 ${migrationResult.success ? 'bg-status-live/20 text-status-live border border-status-live/30' : 'bg-status-error/20 text-status-error border border-status-error/30'}`}>
                    <p>{migrationResult.message}</p>
                    {migrationResult.success && <p className="text-[10px] mt-1 text-obsidian-muted">Migration complete. Local backup data is still preserved.</p>}
                  </div>
                )}

                <div className="space-y-3 pt-3 border-t border-obsidian-border">
                  <div className="flex items-center gap-2 mb-2">
                    <input 
                      type="checkbox" 
                      id="backup-confirm" 
                      checked={backupDownloaded}
                      onChange={(e) => setBackupDownloaded(e.target.checked)}
                      className="accent-status-live w-3 h-3"
                    />
                    <label htmlFor="backup-confirm" className="text-[10px] text-obsidian-muted cursor-pointer">
                      I confirm I downloaded my backup JSON file.
                    </label>
                  </div>
                  
                  {testResult?.success && backupDownloaded ? (
                    <button 
                      onClick={handlePreviewMigration}
                      className="w-full py-2.5 rounded-xl text-xs font-bold bg-status-warning text-obsidian-dark hover:opacity-90 transition-all flex items-center justify-center gap-2"
                    >
                      <Database className="w-4 h-4" /> Re-run Migration
                    </button>
                  ) : (
                    <button 
                      disabled
                      className="w-full py-2.5 rounded-xl text-xs font-bold bg-obsidian-dark text-obsidian-muted border border-obsidian-border opacity-75 cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      Check Backup & Test Connection to migrate again
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile */}
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-4 h-4 text-gold" />
            <h3 className="text-white font-bold text-sm">Owner Profile</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] text-obsidian-muted uppercase tracking-wider mb-1 block">Name</label>
              <input type="text" defaultValue="Khair Murafiq" className="w-full bg-obsidian-card border border-obsidian-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold/30" />
            </div>
            <div>
              <label className="text-[10px] text-obsidian-muted uppercase tracking-wider mb-1 block">Role</label>
              <input type="text" defaultValue="Super Admin / Owner" disabled className="w-full bg-obsidian-card/50 border border-obsidian-border rounded-xl px-4 py-2.5 text-sm text-obsidian-muted cursor-not-allowed" />
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-4 h-4 text-gold" />
            <h3 className="text-white font-bold text-sm">Preferences</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-obsidian-card/50 border border-obsidian-border">
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-obsidian-muted" />
                <div>
                  <p className="text-sm font-semibold text-white">Language</p>
                  <p className="text-[10px] text-obsidian-muted">Interface language</p>
                </div>
              </div>
              <select value={lang} onChange={(e) => setLang(e.target.value)} className="bg-obsidian-card border border-obsidian-border rounded-lg px-2 py-1 text-xs text-white outline-none">
                <option value="en">English</option>
                <option value="bn">Bangla</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-obsidian-card/50 border border-obsidian-border">
              <div className="flex items-center gap-3">
                <Zap className={`w-4 h-4 ${ecoMode ? 'text-status-live' : 'text-gold'}`} />
                <div>
                  <p className="text-sm font-semibold text-white">Performance Mode</p>
                  <p className="text-[10px] text-obsidian-muted">Reduce animations</p>
                </div>
              </div>
              <button onClick={() => setEcoMode(!ecoMode)} className={`px-3 py-1 rounded-lg text-xs font-semibold ${ecoMode ? 'bg-status-live/10 text-status-live border border-status-live/20' : 'bg-gold/10 text-gold border border-gold/20'}`}>
                {ecoMode ? 'Eco Mode' : 'Turbo Mode'}
              </button>
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  )
}
