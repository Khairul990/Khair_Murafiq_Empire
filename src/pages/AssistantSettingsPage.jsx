import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Bot, Settings2, ShieldAlert, Volume2, BellRing, Command, FileText, CheckCircle, MicOff, RefreshCw, Trash2, VolumeX } from 'lucide-react'
import { getAuditLogs, clearAuditLogs, addAuditLog } from '../utils/auditLogger'

const defaultSettings = {
  voiceOutput: true,
  autoVoiceBriefing: false,
  quietMode: false,
  checkInterval: 300000, // 5 mins
  alertVoice: true,
  taskReminderVoice: true,
  healthWarningVoice: true,
}

export default function AssistantSettingsPage() {
  const [settings, setSettings] = useState(defaultSettings)
  const [logs, setLogs] = useState([])
  const [isTestPlaying, setIsTestPlaying] = useState(false)

  const loadSettings = () => {
    try {
      const stored = localStorage.getItem('km_empire_assistant_settings')
      if (stored) {
        setSettings({ ...defaultSettings, ...JSON.parse(stored) })
      }
    } catch (err) {
      console.error('Failed to load settings', err)
    }
  }

  const loadLogs = () => {
    setLogs(getAuditLogs().slice(0, 10))
  }

  useEffect(() => {
    loadSettings()
    loadLogs()

    const handleUpdate = () => loadSettings()
    window.addEventListener('assistant_settings_updated', handleUpdate)
    return () => window.removeEventListener('assistant_settings_updated', handleUpdate)
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 max-w-5xl mx-auto"
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
              <span className="text-obsidian-muted">Voice Output:</span>
              <span className="text-white font-bold bg-obsidian-dark px-2 py-1 rounded">Browser SpeechSynthesis</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-obsidian-muted">Real AI API:</span>
              <span className="text-status-warning font-bold bg-status-warning/10 px-2 py-1 rounded border border-status-warning/20">Not Connected</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-obsidian-muted">Voice Command:</span>
              <span className="text-obsidian-muted font-bold bg-obsidian-dark px-2 py-1 rounded flex items-center gap-1">
                <MicOff className="w-3 h-3" /> Not Connected
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-obsidian-muted">Proactive Monitor:</span>
              <span className="text-status-live font-bold bg-status-live/10 px-2 py-1 rounded">Available</span>
            </div>
          </div>
        </div>

        {/* B. Voice Settings */}
        <div className="glass-card rounded-2xl p-5 border border-obsidian-border space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-gold" />
              <h2 className="text-sm font-bold text-white">Voice Settings</h2>
            </div>
            <button
              onClick={handleTestVoice}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-1 ${
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
              <span className="text-xs text-obsidian-text group-hover:text-white transition-colors">Auto Voice Briefing (On Load)</span>
              <input type="checkbox" checked={settings.autoVoiceBriefing} onChange={(e) => updateSetting('autoVoiceBriefing', e.target.checked)} className="accent-gold w-4 h-4 cursor-pointer" />
            </label>
            <label className="flex items-center justify-between cursor-pointer group">
              <span className="text-xs text-status-warning font-bold group-hover:text-status-warning/80 transition-colors">Quiet Mode (Mute All)</span>
              <input type="checkbox" checked={settings.quietMode} onChange={(e) => updateSetting('quietMode', e.target.checked)} className="accent-status-warning w-4 h-4 cursor-pointer" />
            </label>
            <div className="flex items-center justify-between">
              <span className="text-xs text-obsidian-text">Check Interval</span>
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

        {/* C. Proactive Alert Settings */}
        <div className="glass-card rounded-2xl p-5 border border-obsidian-border space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <BellRing className="w-5 h-5 text-gold" />
            <h2 className="text-sm font-bold text-white">Proactive Alert Settings</h2>
          </div>
          <div className="space-y-3">
            <label className="flex items-center justify-between cursor-pointer group">
              <span className="text-xs text-obsidian-text group-hover:text-white transition-colors">Alert Voice (Critical/High)</span>
              <input type="checkbox" checked={settings.alertVoice} onChange={(e) => updateSetting('alertVoice', e.target.checked)} className="accent-gold w-4 h-4 cursor-pointer" />
            </label>
            <label className="flex items-center justify-between cursor-pointer group">
              <span className="text-xs text-obsidian-text group-hover:text-white transition-colors">Task Reminder Voice</span>
              <input type="checkbox" checked={settings.taskReminderVoice} onChange={(e) => updateSetting('taskReminderVoice', e.target.checked)} className="accent-gold w-4 h-4 cursor-pointer" />
            </label>
            <label className="flex items-center justify-between cursor-pointer group">
              <span className="text-xs text-obsidian-text group-hover:text-white transition-colors">Health Warning Voice</span>
              <input type="checkbox" checked={settings.healthWarningVoice} onChange={(e) => updateSetting('healthWarningVoice', e.target.checked)} className="accent-gold w-4 h-4 cursor-pointer" />
            </label>
            
            <div className="bg-obsidian-dark p-3 rounded-lg border border-obsidian-border mt-2">
              <p className="text-[10px] text-obsidian-muted flex items-start gap-1.5 leading-tight">
                <CheckCircle className="w-3.5 h-3.5 text-status-live shrink-0 mt-0.5" />
                Repeat prevention is ACTIVE. The assistant will not read the same alert/task/project issue twice per session.
              </p>
            </div>
          </div>
        </div>

        {/* D. Keyboard Commander */}
        <div className="glass-card rounded-2xl p-5 border border-obsidian-border space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Command className="w-5 h-5 text-gold" />
            <h2 className="text-sm font-bold text-white">Keyboard Commander</h2>
          </div>
          <div className="grid grid-cols-1 gap-2 text-xs font-mono">
            <div className="flex justify-between items-center bg-obsidian-dark px-3 py-2 rounded-lg border border-obsidian-border/50">
              <span className="text-obsidian-text">Quick Report</span>
              <span className="text-gold font-bold">Ctrl + Shift + R</span>
            </div>
            <div className="flex justify-between items-center bg-obsidian-dark px-3 py-2 rounded-lg border border-obsidian-border/50">
              <span className="text-obsidian-text">Security Check</span>
              <span className="text-gold font-bold">Ctrl + Shift + S</span>
            </div>
            <div className="flex justify-between items-center bg-obsidian-dark px-3 py-2 rounded-lg border border-obsidian-border/50">
              <span className="text-obsidian-text">Next Safe Action</span>
              <span className="text-gold font-bold">Ctrl + Shift + N</span>
            </div>
            <div className="flex justify-between items-center bg-status-error/5 px-3 py-2 rounded-lg border border-status-error/20">
              <span className="text-status-error">Emergency Lockdown</span>
              <span className="text-status-error font-bold">Ctrl + Shift + L</span>
            </div>
          </div>
        </div>

      </div>

      {/* E. Assistant Safety Rules */}
      <div className="glass-card rounded-2xl p-5 border border-status-warning/20 bg-status-warning/5 mt-6">
        <div className="flex items-center gap-2 mb-3">
          <ShieldAlert className="w-5 h-5 text-status-warning" />
          <h2 className="text-sm font-bold text-white">Assistant Safety Rules</h2>
        </div>
        <ul className="list-disc list-inside text-xs text-obsidian-muted space-y-1.5 ml-1">
          <li>No API key/token/password in frontend/GitHub</li>
          <li>Backup before migration/delete</li>
          <li>Owner approval before risky action</li>
          <li>Real API only through backend/serverless later</li>
          <li>Mock/manual features must be clearly labeled</li>
        </ul>
      </div>

      {/* F. Assistant Audit Logs */}
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
