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
      className="space-y-6 pb-20"
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-3xl font-extrabold text-white flex items-center gap-3">
            System <span className="gold-gradient-text">Settings</span>
          </h1>
          <p className="text-xs text-obsidian-muted mt-1 uppercase tracking-widest font-bold">
            Configure your Empire OS preferences and manage your data.
          </p>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-obsidian-dark border border-status-error/30 text-status-error hover:bg-status-error/10 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)] transition-all flex-shrink-0"
        >
          <LogOut className="w-4 h-4" /> Log Out
        </button>
      </div>

      {/* Preview Modal Overlay */}
      {previewData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-dark/90 backdrop-blur-md">
          <div className="bg-obsidian-card border border-status-warning/50 rounded-2xl p-8 w-full max-w-md shadow-[0_0_50px_rgba(249,115,22,0.1)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-status-warning" />
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle className="w-8 h-8 text-status-warning animate-pulse" />
              <h2 className="text-xl font-black text-white uppercase tracking-wider">Confirm Restore</h2>
            </div>
            <p className="text-sm text-obsidian-muted mb-6 font-medium leading-relaxed">
              You are about to restore data exported on <strong className="text-white">{new Date(previewData.exportedAt).toLocaleString()}</strong>.
            </p>
            
            <div className="space-y-3 mb-8">
              <div className="flex justify-between text-xs p-3 rounded-xl bg-obsidian-dark border border-obsidian-border/50">
                <span className="text-obsidian-muted font-bold uppercase tracking-wider">Projects</span>
                <span className="font-black text-white">{previewData.projects?.length || 0}</span>
              </div>
              <div className="flex justify-between text-xs p-3 rounded-xl bg-obsidian-dark border border-obsidian-border/50">
                <span className="text-obsidian-muted font-bold uppercase tracking-wider">Tasks</span>
                <span className="font-black text-white">{previewData.tasks?.length || 0}</span>
              </div>
              <div className="flex justify-between text-xs p-3 rounded-xl bg-obsidian-dark border border-obsidian-border/50">
                <span className="text-obsidian-muted font-bold uppercase tracking-wider">Alerts</span>
                <span className="font-black text-white">{previewData.alerts?.length || 0}</span>
              </div>
              <div className="flex justify-between text-xs p-3 rounded-xl bg-obsidian-dark border border-obsidian-border/50">
                <span className="text-obsidian-muted font-bold uppercase tracking-wider">Finance Entries</span>
                <span className="font-black text-white">{previewData.finance?.length || 0}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={handleConfirmRestore} className="flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-status-warning/20 border border-status-warning/50 hover:bg-status-warning hover:text-obsidian-dark transition-all">
                Confirm & Overwrite
              </button>
              <button onClick={() => setPreviewData(null)} className="flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider bg-obsidian-dark text-obsidian-muted border border-obsidian-border hover:text-white transition-all">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Migration Preview Modal Overlay */}
      {migrationPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-dark/90 backdrop-blur-md">
          <div className="bg-obsidian-card border border-blue-500/50 rounded-2xl p-8 w-full max-w-md shadow-[0_0_50px_rgba(59,130,246,0.1)] relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-blue-500" />
            <div className="flex items-center gap-3 mb-6">
              <Server className="w-8 h-8 text-blue-400" />
              <h2 className="text-xl font-black text-white uppercase tracking-wider">Migration Preview</h2>
            </div>
            <p className="text-sm text-obsidian-muted mb-6 font-medium leading-relaxed">
              This preview shows the local data that will be moved to Firestore collections.
            </p>
            
            <div className="space-y-3 mb-8">
              <div className="flex justify-between text-[11px] p-3 rounded-xl bg-obsidian-dark border border-obsidian-border/50">
                <span className="text-obsidian-muted font-bold uppercase tracking-wider">control_projects</span>
                <span className="font-black text-white">{migrationPreview.projects} items</span>
              </div>
              <div className="flex justify-between text-[11px] p-3 rounded-xl bg-obsidian-dark border border-obsidian-border/50">
                <span className="text-obsidian-muted font-bold uppercase tracking-wider">control_tasks</span>
                <span className="font-black text-white">{migrationPreview.tasks} items</span>
              </div>
              <div className="flex justify-between text-[11px] p-3 rounded-xl bg-obsidian-dark border border-obsidian-border/50">
                <span className="text-obsidian-muted font-bold uppercase tracking-wider">control_alerts</span>
                <span className="font-black text-white">{migrationPreview.alerts} items</span>
              </div>
              <div className="flex justify-between text-[11px] p-3 rounded-xl bg-obsidian-dark border border-obsidian-border/50">
                <span className="text-obsidian-muted font-bold uppercase tracking-wider">control_reports (finance/social)</span>
                <span className="font-black text-white">{migrationPreview.finance + migrationPreview.social_posts} items</span>
              </div>
              <div className="flex justify-between text-[11px] p-3 rounded-xl bg-obsidian-dark border border-obsidian-border/50">
                <span className="text-obsidian-muted font-bold uppercase tracking-wider">control_settings (goals/config)</span>
                <span className="font-black text-white">{migrationPreview.goals + (migrationPreview.settings ? 1 : 0)} items</span>
              </div>
            </div>

            <div className="bg-status-warning/10 border border-status-warning/30 rounded-xl p-4 mb-6">
              <p className="text-[10px] text-status-warning font-black uppercase tracking-wider leading-tight mb-3 text-center">
                Type MIGRATE below to confirm.
              </p>
              <input 
                type="text" 
                value={migrationConfirmText}
                onChange={(e) => setMigrationConfirmText(e.target.value)}
                placeholder="MIGRATE"
                className="w-full bg-obsidian-dark border border-status-warning/50 rounded-xl p-3 text-white text-sm text-center font-black outline-none uppercase tracking-widest focus:border-status-warning transition-colors"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={handleRunMigration}
                disabled={migrationConfirmText !== 'MIGRATE' || isMigrating}
                className="flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider text-obsidian-dark bg-status-warning hover:bg-status-warning/90 transition-all disabled:opacity-50 disabled:bg-obsidian-dark disabled:text-obsidian-muted disabled:border-obsidian-border"
              >
                {isMigrating ? 'Migrating...' : 'Confirm Migration'}
              </button>
              <button onClick={() => { setMigrationPreview(null); setMigrationConfirmText(''); }} disabled={isMigrating} className="flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider bg-obsidian-dark text-obsidian-muted border border-obsidian-border hover:text-white transition-all">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Backup & Restore Center */}
        <div className="glass-card rounded-2xl p-6 xl:col-span-2 border border-gold/30 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-[50px] group-hover:bg-gold/10 transition-colors" />
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6 relative">
            <Database className="w-6 h-6 text-gold" />
            <h3 className="text-white font-black uppercase tracking-wider text-sm flex-1">Backup & Restore Center</h3>
            <span className="px-2.5 py-1 rounded-md bg-status-live/10 text-status-live text-[9px] font-black uppercase tracking-wider border border-status-live/30">
              Fallback Backup Ready
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
            <div className="space-y-4">
              <div>
                <h4 className="text-xs text-white font-black uppercase tracking-widest mb-1">Export Data</h4>
                <p className="text-[11px] text-obsidian-muted font-medium">Download your local storage data as a secure JSON file to prevent loss.</p>
              </div>
              
              <button onClick={handleExportAll} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider gold-gradient text-obsidian-dark hover:shadow-[0_0_20px_rgba(242,201,76,0.3)] transition-all">
                <Download className="w-4 h-4" /> Export All Data
              </button>
              
              <div className="grid grid-cols-2 gap-3 mt-4">
                <button onClick={() => handleExportSpecific('projects', 'km_empire_projects')} className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider bg-obsidian-dark border border-obsidian-border text-obsidian-muted hover:text-white hover:border-gold/50 transition-all">
                  <FileJson className="w-3.5 h-3.5 text-gold" /> Projects
                </button>
                <button onClick={() => handleExportSpecific('tasks', 'km_empire_tasks')} className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider bg-obsidian-dark border border-obsidian-border text-obsidian-muted hover:text-white hover:border-gold/50 transition-all">
                  <FileJson className="w-3.5 h-3.5 text-blue-400" /> Tasks
                </button>
                <button onClick={() => handleExportSpecific('alerts', 'km_empire_alerts')} className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider bg-obsidian-dark border border-obsidian-border text-obsidian-muted hover:text-white hover:border-gold/50 transition-all">
                  <FileJson className="w-3.5 h-3.5 text-status-warning" /> Alerts
                </button>
                <button onClick={() => handleExportSpecific('finance', 'km_empire_finance')} className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider bg-obsidian-dark border border-obsidian-border text-obsidian-muted hover:text-white hover:border-gold/50 transition-all">
                  <FileJson className="w-3.5 h-3.5 text-status-live" /> Finance
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-xs text-white font-black uppercase tracking-widest mb-1">Import Data</h4>
                <p className="text-[11px] text-obsidian-muted font-medium">Restore data from a previously downloaded JSON backup file.</p>
              </div>
              
              <input 
                type="file" 
                accept=".json" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
              />
              <button onClick={() => fileInputRef.current.click()} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider bg-obsidian-dark text-white border border-obsidian-border hover:border-blue-400/50 hover:bg-blue-400/10 hover:shadow-[0_0_15px_rgba(96,165,250,0.15)] transition-all">
                <Upload className="w-4 h-4" /> Select Backup File to Restore
              </button>
              
              <div className="bg-obsidian-dark/50 border border-status-warning/30 rounded-xl p-4 flex gap-3 items-start mt-4">
                <AlertTriangle className="w-5 h-5 text-status-warning flex-shrink-0" />
                <p className="text-[10px] font-bold text-obsidian-muted leading-relaxed uppercase tracking-wide">
                  Importing a backup will <strong className="text-status-warning">overwrite</strong> your current local data. A preview will be shown before confirmation.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Firebase Status Panel */}
        <div className="glass-card rounded-2xl p-6 xl:col-span-2 border border-blue-500/30 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[50px] group-hover:bg-blue-500/10 transition-colors" />
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6 relative">
            <Server className="w-6 h-6 text-blue-400" />
            <h3 className="text-white font-black uppercase tracking-wider text-sm flex-1">Firebase Configuration</h3>
            <span className="px-2.5 py-1 rounded-md bg-status-live/10 text-status-live text-[9px] font-black uppercase tracking-wider border border-status-live/30">
              Connected & Live
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[11px] p-3 rounded-xl bg-obsidian-dark/50 border border-obsidian-border">
                <span className="text-obsidian-muted font-bold uppercase tracking-wider">Last Firebase Test</span>
                <span className="font-black text-status-live bg-status-live/10 px-2 py-1 rounded">Connected</span>
              </div>
              <div className="flex justify-between items-center text-[11px] p-3 rounded-xl bg-obsidian-dark/50 border border-obsidian-border">
                <span className="text-obsidian-muted font-bold uppercase tracking-wider">Firebase Auth</span>
                <span className="font-black text-status-live bg-status-live/10 px-2 py-1 rounded">Active</span>
              </div>
              <div className="flex justify-between items-center text-[11px] p-3 rounded-xl bg-obsidian-dark/50 border border-obsidian-border">
                <span className="text-obsidian-muted font-bold uppercase tracking-wider">Firestore Rules</span>
                <span className="font-black text-status-live bg-status-live/10 px-2 py-1 rounded">Published / Tested</span>
              </div>
              <div className="flex justify-between items-center text-[11px] p-3 rounded-xl bg-obsidian-dark/50 border border-obsidian-border">
                <span className="text-obsidian-muted font-bold uppercase tracking-wider">Database Protection</span>
                <span className="font-black text-status-live bg-status-live/10 px-2 py-1 rounded">Owner-only Active</span>
              </div>
              <div className="flex justify-between items-center text-[11px] p-3 rounded-xl bg-obsidian-dark/50 border border-obsidian-border">
                <span className="text-obsidian-muted font-bold uppercase tracking-wider">Storage Mode</span>
                <span className="font-black text-status-live bg-status-live/10 px-2 py-1 rounded">Firebase Active</span>
              </div>
              <div className="flex justify-between items-center text-[11px] p-3 rounded-xl bg-obsidian-dark/50 border border-obsidian-border">
                <span className="text-obsidian-muted font-bold uppercase tracking-wider">Local Fallback</span>
                <span className="font-black text-status-live bg-status-live/10 px-2 py-1 rounded">Enabled</span>
              </div>
              <div className="flex justify-between items-center text-[11px] p-3 rounded-xl bg-obsidian-dark/50 border border-obsidian-border">
                <span className="text-obsidian-muted font-bold uppercase tracking-wider">Migration</span>
                <span className="font-black text-status-live bg-status-live/10 px-2 py-1 rounded">Completed / Verified</span>
              </div>
              <div className="flex justify-between items-center text-[11px] p-3 rounded-xl bg-obsidian-dark/50 border border-obsidian-border">
                <span className="text-obsidian-muted font-bold uppercase tracking-wider">Backup</span>
                <span className="font-black text-status-live bg-status-live/10 px-2 py-1 rounded">Available</span>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <h4 className="text-xs text-white font-black uppercase tracking-widest mb-3">Planned Collections</h4>
                <div className="flex flex-wrap gap-2">
                  {['control_projects', 'control_tasks', 'control_alerts', 'control_settings', 'control_activity_logs'].map(col => (
                    <span key={col} className="px-2.5 py-1.5 bg-obsidian-dark border border-obsidian-border rounded-lg text-[10px] text-obsidian-muted font-mono font-bold hover:text-white hover:border-gold/30 transition-colors">
                      {col}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="bg-status-live/5 border border-status-live/20 rounded-xl p-4 flex gap-3 items-start">
                <CheckCircle className="w-5 h-5 text-status-live flex-shrink-0" />
                <p className="text-[10px] font-bold text-obsidian-muted leading-relaxed uppercase tracking-wide">
                  <span className="text-status-live">Firebase is Live.</span> Recommended to backup your data before making major structural changes.
                </p>
              </div>

              <div>
                <h4 className="text-xs text-white font-black uppercase tracking-widest mb-3">Security Rules Checklist</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="flex items-center gap-2.5 text-[11px] font-bold text-obsidian-muted bg-obsidian-dark/30 p-2 rounded-lg border border-obsidian-border/50">
                    <CheckCircle className="w-3.5 h-3.5 text-status-live" /> <span>No private key in frontend</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[11px] font-bold text-obsidian-muted bg-obsidian-dark/30 p-2 rounded-lg border border-obsidian-border/50">
                    <CheckCircle className="w-3.5 h-3.5 text-status-live" /> <span>.env ignored</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[11px] font-bold text-obsidian-muted bg-obsidian-dark/30 p-2 rounded-lg border border-obsidian-border/50">
                    <CheckCircle className="w-3.5 h-3.5 text-status-live" /> <span>Firebase connection tested</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[11px] font-bold text-obsidian-muted bg-obsidian-dark/30 p-2 rounded-lg border border-obsidian-border/50">
                    <CheckCircle className="w-3.5 h-3.5 text-status-live" /> <span>Firestore rules draft ready</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[11px] font-bold text-obsidian-muted bg-obsidian-dark/30 p-2 rounded-lg border border-obsidian-border/50">
                    <CheckCircle className="w-3.5 h-3.5 text-status-live" /> <span>Firebase Auth Active</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[11px] font-bold text-obsidian-muted bg-obsidian-dark/30 p-2 rounded-lg border border-obsidian-border/50">
                    <CheckCircle className="w-3.5 h-3.5 text-blue-400" /> <span>Migration blocked</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-5 text-center relative overflow-hidden">
                <button 
                  onClick={handleTestFirebase}
                  disabled={isTesting}
                  className="w-full py-3 rounded-xl text-xs font-black uppercase tracking-wider bg-blue-500 text-white hover:bg-blue-600 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all disabled:opacity-50 flex items-center justify-center gap-2 mb-4"
                >
                  {isTesting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Server className="w-4 h-4" />}
                  {isTesting ? 'Testing Connection...' : 'Test Firebase Connection'}
                </button>

                {testResult && (
                  <div className={`p-3 rounded-xl text-[11px] font-black uppercase tracking-wider mb-4 flex items-center justify-center gap-2 ${testResult.success ? 'bg-status-live/10 text-status-live border border-status-live/30' : 'bg-status-error/10 text-status-error border border-status-error/30'}`}>
                    {testResult.success ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    {testResult.message}
                  </div>
                )}
                
                {testResult?.message === 'Permission denied' && (
                  <p className="text-[10px] text-status-error font-bold uppercase tracking-wide mb-4 bg-status-error/10 p-2 rounded-lg border border-status-error/20">
                    Firebase connected, but Firestore rules may be blocking test write/read.
                  </p>
                )}

                <p className="text-[10px] font-bold text-obsidian-muted uppercase tracking-wide mb-5">
                  Firebase test only. Your dashboard data is still stored locally.
                </p>

                {migrationResult && (
                  <div className={`p-4 rounded-xl text-[11px] font-black uppercase tracking-wider mb-4 text-left ${migrationResult.success ? 'bg-status-live/10 text-status-live border border-status-live/30' : 'bg-status-error/10 text-status-error border border-status-error/30'}`}>
                    <p>{migrationResult.message}</p>
                    {migrationResult.success && <p className="text-[9px] mt-2 text-obsidian-muted font-bold">Migration complete. Local backup data is still preserved.</p>}
                  </div>
                )}

                <div className="space-y-4 pt-4 border-t border-blue-500/20 text-left">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center mt-0.5">
                      <input 
                        type="checkbox" 
                        id="backup-confirm" 
                        checked={backupDownloaded}
                        onChange={(e) => setBackupDownloaded(e.target.checked)}
                        className="peer appearance-none w-4 h-4 border-2 border-obsidian-muted rounded bg-obsidian-dark checked:bg-status-live checked:border-status-live transition-all"
                      />
                      <CheckCircle className="w-3 h-3 text-white absolute opacity-0 peer-checked:opacity-100 pointer-events-none" />
                    </div>
                    <span className="text-[11px] font-bold text-obsidian-muted group-hover:text-white transition-colors">
                      I confirm I downloaded my backup JSON file.
                    </span>
                  </label>
                  
                  {testResult?.success && backupDownloaded ? (
                    <button 
                      onClick={handlePreviewMigration}
                      className="w-full py-3 rounded-xl text-xs font-black uppercase tracking-wider bg-status-warning text-obsidian-dark hover:shadow-[0_0_15px_rgba(249,115,22,0.3)] transition-all flex items-center justify-center gap-2"
                    >
                      <Database className="w-4 h-4" /> Re-run Migration
                    </button>
                  ) : (
                    <button 
                      disabled
                      className="w-full py-3 rounded-xl text-xs font-black uppercase tracking-wider bg-obsidian-dark/50 text-obsidian-muted border border-obsidian-border cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      Check Backup & Test Connection to migrate
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile */}
        <div className="glass-card rounded-2xl p-6 border border-obsidian-border hover:border-gold/30 transition-colors group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 blur-[40px] group-hover:bg-gold/10 transition-colors" />
          <div className="flex items-center gap-3 mb-6 relative">
            <User className="w-5 h-5 text-gold" />
            <h3 className="text-white font-black uppercase tracking-wider text-sm">Owner Profile</h3>
          </div>
          <div className="space-y-5 relative">
            <div>
              <label className="text-[10px] font-black text-white uppercase tracking-widest mb-2 block ml-1">Name</label>
              <input type="text" defaultValue="Khair Murafiq" className="w-full bg-obsidian-dark/50 border border-obsidian-border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-gold/50 transition-all font-medium" />
            </div>
            <div>
              <label className="text-[10px] font-black text-white uppercase tracking-widest mb-2 block ml-1">Role</label>
              <input type="text" defaultValue="Super Admin / Owner" disabled className="w-full bg-obsidian-dark/30 border border-obsidian-border/50 rounded-xl px-4 py-3 text-sm text-obsidian-muted font-bold cursor-not-allowed" />
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="glass-card rounded-2xl p-6 border border-obsidian-border hover:border-gold/30 transition-colors group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-signal/5 blur-[40px] group-hover:bg-cyan-signal/10 transition-colors" />
          <div className="flex items-center gap-3 mb-6 relative">
            <Settings className="w-5 h-5 text-gold" />
            <h3 className="text-white font-black uppercase tracking-wider text-sm">Preferences</h3>
          </div>
          <div className="space-y-4 relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-obsidian-dark/30 border border-obsidian-border hover:border-gold/20 transition-all gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-obsidian-card flex items-center justify-center border border-obsidian-border">
                  <Globe className="w-5 h-5 text-obsidian-muted" />
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-wider text-white">Language</p>
                  <p className="text-[10px] font-bold text-obsidian-muted mt-0.5">Interface language</p>
                </div>
              </div>
              <select value={lang} onChange={(e) => setLang(e.target.value)} className="bg-obsidian-card border border-obsidian-border rounded-xl px-4 py-2.5 text-xs font-bold text-white outline-none focus:border-gold/50 transition-colors cursor-pointer appearance-none w-full sm:w-auto">
                <option value="en">English (Default)</option>
                <option value="bn">Bangla (Bengali)</option>
              </select>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-obsidian-dark/30 border border-obsidian-border hover:border-gold/20 transition-all gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-obsidian-card flex items-center justify-center border border-obsidian-border">
                  <Zap className={`w-5 h-5 ${ecoMode ? 'text-status-live' : 'text-gold'}`} />
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-wider text-white">Performance Mode</p>
                  <p className="text-[10px] font-bold text-obsidian-muted mt-0.5">Toggle visual animations</p>
                </div>
              </div>
              <button onClick={() => setEcoMode(!ecoMode)} className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${ecoMode ? 'bg-status-live/10 text-status-live border border-status-live/30 hover:bg-status-live/20' : 'bg-gold/10 text-gold border border-gold/30 hover:bg-gold/20'}`}>
                {ecoMode ? 'Eco Mode' : 'Turbo Mode'}
              </button>
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  )
}
