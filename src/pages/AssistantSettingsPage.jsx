import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Bot, Settings2, ShieldAlert, Volume2, BellRing, Command, FileText, CheckCircle, MicOff, RefreshCw, Trash2, VolumeX, Activity } from 'lucide-react'
import { getAuditLogs, clearAuditLogs, addAuditLog } from '../utils/auditLogger'

const defaultSettings = {
  voiceOutput: true,
  autoVoiceBriefing: false,
  monitorActive: false,
  quietMode: false,
  checkInterval: 300000,
  alertVoice: true,
  taskReminderVoice: true,
  healthWarningVoice: true,
  agentEventVoice: true,
}

export default function AssistantSettingsPage() {
  const [settings, setSettings] = useState(defaultSettings)
  const [logs, setLogs] = useState([])
  const [isTestPlaying, setIsTestPlaying] = useState(false)
  const [stats, setStats] = useState({
    lastChecked: 'Never',
    lastVoiceReport: 'Never',
    lastAlertSpoken: 'None'
  })

  const loadSettingsAndStats = () => {
    try {
      const stored = localStorage.getItem('km_empire_assistant_settings')
      if (stored) {
        setSettings({ ...defaultSettings, ...JSON.parse(stored) })
      }
      
      const lastCheckedStr = localStorage.getItem('km_empire_last_checked_at')
      const lastVoiceReportStr = localStorage.getItem('km_empire_last_voice_report_at')
      const lastAlertSpokenStr = localStorage.getItem('km_empire_last_spoken_alert')
      
      setStats({
        lastChecked: lastCheckedStr ? new Date(lastCheckedStr).toLocaleTimeString() : 'Never',
        lastVoiceReport: lastVoiceReportStr ? new Date(lastVoiceReportStr).toLocaleTimeString() : 'Never',
        lastAlertSpoken: lastAlertSpokenStr || 'None'
      })
    } catch (err) {
      console.error('Failed to load settings', err)
    }
  }

  const loadLogs = () => {
    setLogs(getAuditLogs().slice(0, 10))
  }

  useEffect(() => {
    loadSettingsAndStats()
    loadLogs()

    const handleUpdate = () => loadSettingsAndStats()
    window.addEventListener('assistant_settings_updated', handleUpdate)
    
    // Poll stats every 5 seconds to keep UI fresh
    const interval = setInterval(handleUpdate, 5000)
    
    return () => {
      window.removeEventListener('assistant_settings_updated', handleUpdate)
      clearInterval(interval)
    }
  }, [])

  const updateSetting = (key, value) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    localStorage.setItem('km_empire_assistant_settings', JSON.stringify(newSettings))
    window.dispatchEvent(new Event('assistant_settings_updated'))
  }

  const handleClearLogs = () => {
    if (window.confirm("Clear local assistant logs only?")) {
      clearAuditLogs()
      addAuditLog('assistant_logs_cleared', 'success', 'owner_manual', 'Cleared all local assistant logs')
      loadLogs()
    }
  }

  const handleTestVoice = () => {
    if (!window.speechSynthesis) return
    if (isTestPlaying) {
      window.speechSynthesis.cancel()
      setIsTestPlaying(false)
      return
    }
    const utterance = new SpeechSynthesisUtterance('আসসালামু আলাইকুম। আমি এম্পায়ার এআই। আপনার সিস্টেম কাজ করছে।')
    const voices = window.speechSynthesis.getVoices()
    const bnVoice = voices.find(v => v.lang.includes('bn'))
    if (bnVoice) {
      utterance.voice = bnVoice
      utterance.lang = bnVoice.lang
    } else {
      utterance.lang = 'bn-BD'
    }
    
    utterance.onstart = () => setIsTestPlaying(true)
    utterance.onend = () => setIsTestPlaying(false)
    utterance.onerror = () => setIsTestPlaying(false)

    window.speechSynthesis.speak(utterance)
  }

  const handleTestBriefing = () => {
    window.dispatchEvent(new Event('test_auto_briefing'))
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 max-w-5xl mx-auto pb-24"
    >
      <div>
        <h1 className="text-xl lg:text-2xl font-extrabold text-white flex items-center gap-3">
          <Bot className="w-8 h-8 text-gold" />
          Assistant <span className="gold-gradient-text">Settings</span>
        </h1>
        <p className="text-xs text-obsidian-muted mt-1">
          Configure Empire AI behavior, voice monitoring, and proactive alerts.
        </p>
      </div>
      
      <div className="bg-obsidian-dark border border-gold/20 p-3 rounded-lg text-[11px] text-gold-light font-medium flex items-start gap-2">
         <ShieldAlert className="w-4 h-4 text-gold shrink-0 mt-0.5" />
         Auto voice works only while Control Room tab is open, browser audio is allowed, and Quiet Mode is OFF.
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* A. Assistant Status */}
        <div className="glass-card rounded-2xl p-5 border border-obsidian-border space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Settings2 className="w-5 h-5 text-gold" />
            <h2 className="text-sm font-bold text-white">Assistant Status</h2>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-obsidian-muted">Assistant Mode:</span>
              <span className="text-status-live font-bold bg-status-live/10 px-2 py-1 rounded">Rule-based</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-obsidian-muted">Language:</span>
              <span className="text-white font-bold bg-obsidian-dark px-2 py-1 rounded">Bengali</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-obsidian-muted">Real AI API:</span>
              <span className="text-status-warning font-bold bg-status-warning/10 px-2 py-1 rounded border border-status-warning/20">Not Connected</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-obsidian-muted">Voice Output Engine:</span>
              <span className="text-white font-bold bg-obsidian-dark px-2 py-1 rounded flex items-center gap-1">
                 Browser SpeechSynthesis
              </span>
            </div>
          </div>
        </div>

        {/* B. Runtime Trackers */}
        <div className="glass-card rounded-2xl p-5 border border-obsidian-border space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-blue-400" />
            <h2 className="text-sm font-bold text-white">Runtime Trackers</h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-obsidian-muted">Last Checked Data:</span>
              <span className="text-white font-mono bg-obsidian-dark px-2 py-1 rounded border border-obsidian-border/50">{stats.lastChecked}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-obsidian-muted">Last Voice Report:</span>
              <span className="text-white font-mono bg-obsidian-dark px-2 py-1 rounded border border-obsidian-border/50">{stats.lastVoiceReport}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-obsidian-muted">Last Alert Spoken:</span>
              <span className="text-gold font-mono bg-gold/10 px-2 py-1 rounded border border-gold/20 truncate max-w-[150px]">{stats.lastAlertSpoken}</span>
            </div>
          </div>
        </div>

        {/* C. Voice & Core Settings */}
        <div className="glass-card rounded-2xl p-5 border border-obsidian-border space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-gold" />
              <h2 className="text-sm font-bold text-white">Voice Settings</h2>
            </div>
            <button
              onClick={handleTestVoice}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border flex items-center gap-1 ${
                isTestPlaying 
                  ? 'bg-status-error/10 text-status-error border-status-error/30 hover:bg-status-error/20'
                  : 'bg-gold/10 text-gold border-gold/30 hover:bg-gold/20'
              }`}
            >
              {isTestPlaying ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              {isTestPlaying ? 'Stop Test' : 'Test Voice'}
            </button>
          </div>
          <div className="space-y-3">
            <label className="flex items-center justify-between cursor-pointer group">
              <span className="text-xs text-obsidian-text group-hover:text-white transition-colors">Voice Output</span>
              <input type="checkbox" checked={settings.voiceOutput} onChange={(e) => updateSetting('voiceOutput', e.target.checked)} className="accent-gold w-4 h-4 cursor-pointer" />
            </label>
            <label className="flex items-center justify-between cursor-pointer group">
              <span className="text-xs text-status-warning font-bold group-hover:text-status-warning/80 transition-colors">Quiet Mode (Mute All)</span>
              <input type="checkbox" checked={settings.quietMode} onChange={(e) => updateSetting('quietMode', e.target.checked)} className="accent-status-warning w-4 h-4 cursor-pointer" />
            </label>
            
            <div className="border-t border-obsidian-border/50 pt-3 mt-3">
               <label className="flex items-center justify-between cursor-pointer group mb-3">
                  <span className="text-xs text-obsidian-text group-hover:text-white transition-colors">Proactive Background Monitor</span>
                  <input type="checkbox" checked={settings.monitorActive} onChange={(e) => updateSetting('monitorActive', e.target.checked)} className="accent-status-live w-4 h-4 cursor-pointer" />
               </label>
               <div className="flex items-center justify-between">
                  <span className="text-xs text-obsidian-muted">Check Interval</span>
                  <select 
                     value={settings.checkInterval}
                     onChange={(e) => updateSetting('checkInterval', Number(e.target.value))}
                     className="bg-obsidian-dark border border-obsidian-border rounded px-2 py-1 text-xs text-white outline-none focus:border-gold/30"
                  >
                     <option value={300000}>5 minutes</option>
                     <option value={600000}>10 minutes</option>
                     <option value={1800000}>30 minutes</option>
                  </select>
               </div>
            </div>
          </div>
        </div>

        {/* D. Proactive Alert Triggers */}
        <div className="glass-card rounded-2xl p-5 border border-obsidian-border space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <BellRing className="w-5 h-5 text-gold" />
              <h2 className="text-sm font-bold text-white">Alert Triggers</h2>
            </div>
            <button onClick={handleTestBriefing} className="px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border border-obsidian-border hover:bg-obsidian-card text-obsidian-muted hover:text-white">
               Test Auto Briefing
            </button>
          </div>
          <div className="space-y-3">
            <label className="flex items-center justify-between cursor-pointer group">
              <span className="text-xs text-obsidian-text group-hover:text-white transition-colors">Auto Voice Briefing (Periodic)</span>
              <input type="checkbox" checked={settings.autoVoiceBriefing} onChange={(e) => updateSetting('autoVoiceBriefing', e.target.checked)} className="accent-gold w-4 h-4 cursor-pointer" />
            </label>
            <label className="flex items-center justify-between cursor-pointer group">
              <span className="text-xs text-obsidian-text group-hover:text-white transition-colors">Speak Critical/High Alerts</span>
              <input type="checkbox" checked={settings.alertVoice} onChange={(e) => updateSetting('alertVoice', e.target.checked)} className="accent-gold w-4 h-4 cursor-pointer" />
            </label>
            <label className="flex items-center justify-between cursor-pointer group">
              <span className="text-xs text-obsidian-text group-hover:text-white transition-colors">Speak Critical Pending Tasks</span>
              <input type="checkbox" checked={settings.taskReminderVoice} onChange={(e) => updateSetting('taskReminderVoice', e.target.checked)} className="accent-gold w-4 h-4 cursor-pointer" />
            </label>
            <label className="flex items-center justify-between cursor-pointer group">
              <span className="text-xs text-obsidian-text group-hover:text-white transition-colors">Speak Project Health Errors</span>
              <input type="checkbox" checked={settings.healthWarningVoice} onChange={(e) => updateSetting('healthWarningVoice', e.target.checked)} className="accent-gold w-4 h-4 cursor-pointer" />
            </label>
            <label className="flex items-center justify-between cursor-pointer group">
              <span className="text-xs text-obsidian-text group-hover:text-white transition-colors">Speak Website Agent Critical Events</span>
              <input type="checkbox" checked={settings.agentEventVoice} onChange={(e) => updateSetting('agentEventVoice', e.target.checked)} className="accent-gold w-4 h-4 cursor-pointer" />
            </label>
            
            <div className="bg-obsidian-dark p-3 rounded-lg border border-obsidian-border mt-2">
              <p className="text-[10px] text-obsidian-muted flex items-start gap-1.5 leading-tight">
                <CheckCircle className="w-3.5 h-3.5 text-status-live shrink-0 mt-0.5" />
                Spam Prevention ACTIVE. The assistant tracks spoken items locally and prevents duplicate alerts during the same session.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* E. Assistant Audit Logs */}
      <div className="glass-card rounded-2xl border border-obsidian-border overflow-hidden mt-6 flex flex-col">
        <div className="bg-obsidian-dark border-b border-obsidian-border p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-gold" />
            <h2 className="text-sm font-bold text-white">Assistant Audit Logs</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadLogs}
              className="p-1.5 rounded-lg text-obsidian-muted hover:text-white hover:bg-obsidian-card transition-colors"
              title="Refresh Logs"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleClearLogs}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-obsidian-card border border-status-error/30 text-status-error hover:bg-status-error/10 transition-colors text-xs font-bold"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear Logs
            </button>
          </div>
        </div>

        <div className="max-h-[300px] overflow-y-auto empire-scrollbar p-2">
          {logs.length === 0 ? (
            <div className="p-8 text-center text-obsidian-muted text-xs">
              No logs found.
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {logs.map((log) => (
                <div key={log.id} className="p-3 bg-obsidian-dark/30 rounded-lg border border-obsidian-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-obsidian-dark/80 transition-colors">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white text-xs font-bold capitalize">{log.action.replace(/_/g, ' ')}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                        log.status === 'success' ? 'bg-status-live/10 text-status-live border border-status-live/20' : 'bg-status-error/10 text-status-error border border-status-error/20'
                      }`}>
                        {log.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-obsidian-muted">{log.note}</p>
                  </div>
                  <div className="text-[10px] text-obsidian-muted font-mono bg-obsidian-dark px-2 py-1 rounded shrink-0 self-start sm:self-center">
                    {new Date(log.timestamp).toLocaleString('en-GB')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </motion.div>
  )
}
