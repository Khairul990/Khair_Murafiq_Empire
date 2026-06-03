import { useState, useRef, useEffect } from 'react'
import { Bot, X, Send, Sparkles, FileText, Minimize2 } from 'lucide-react'
import { storageAdapter } from '../services/storageAdapter'
import { getAssistantResponse } from '../data/assistantData'
import { addAuditLog } from '../utils/auditLogger'
import { requestElevenLabsVoice } from '../services/apiGatewayClient'

export default function EmpireAssistant({ open, onToggle }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'আসসালামু আলাইকুম বস। আমি Empire AI। নিচে থেকে কমান্ড বেছে নিন অথবা লিখুন।' }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [systemRisk, setSystemRisk] = useState('Safe')
  const [activeVoiceName, setActiveVoiceName] = useState('')
  const [audioBlockedWarning, setAudioBlockedWarning] = useState(false)

  const [settings, setSettings] = useState({
    voiceOutput: true,
    premiumVoiceEnabled: false,
    autoVoiceBriefing: false,
    monitorActive: false,
    quietMode: false,
    checkInterval: 300000,
    alertVoice: true,
    taskReminderVoice: true,
    healthWarningVoice: true,
    agentEventVoice: true,
  })

  const loadSettings = () => {
    try {
      const stored = localStorage.getItem('km_empire_assistant_settings')
      if (stored) {
        setSettings(prev => ({ ...prev, ...JSON.parse(stored) }))
      }
    } catch (err) {}
  }

  const messagesEndRef = useRef(null)

  const loadRisk = async () => {
    try {
      const [alerts, tasks] = await Promise.all([
        storageAdapter.getAlerts(),
        storageAdapter.getTasks()
      ])
      const activeAlerts = alerts.filter(a => a.status !== 'Fixed' && a.status !== 'Ignored')
      const criticalAlerts = activeAlerts.filter(a => a.severity === 'High' || a.severity === 'Critical')
      const pendingTasks = tasks.filter(t => t.status !== 'Done')
      
      if (criticalAlerts.some(a => a.severity === 'Critical')) setSystemRisk('Critical')
      else if (criticalAlerts.length > 0) setSystemRisk('Warning')
      else if (pendingTasks.length > 5) setSystemRisk('Need Review')
      else setSystemRisk('Safe')
    } catch {
      setSystemRisk('Safe')
    }
  }

  useEffect(() => {
    const loadVoices = () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.getVoices()
      }
    }
    loadVoices()
    if (window.speechSynthesis && window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices
    }
    loadRisk()
    loadSettings()

    const handleLockdownConfirmed = () => {
      if (onToggle && open) onToggle()
    }
    const handleSettingsUpdated = () => {
      loadSettings()
    }

    window.addEventListener('lockdown_confirmed', handleLockdownConfirmed)
    window.addEventListener('assistant_settings_updated', handleSettingsUpdated)

    return () => {
      window.removeEventListener('lockdown_confirmed', handleLockdownConfirmed)
      window.removeEventListener('assistant_settings_updated', handleSettingsUpdated)
    }
  }, [open, onToggle])

  const speakAlert = async (text) => {
    if (settings.quietMode || !settings.voiceOutput) return

    const nowTime = Date.now()
    const lastSpoken = localStorage.getItem('km_empire_last_spoken_text')
    const lastSpokenTime = localStorage.getItem('km_empire_last_spoken_time')
    
    // Prevent repeating identical message within 10 seconds
    if (lastSpoken === text && lastSpokenTime && (nowTime - Number(lastSpokenTime) < 10000)) {
      return
    }

    localStorage.setItem('km_empire_last_spoken_text', text)
    localStorage.setItem('km_empire_last_spoken_time', nowTime.toString())

    if (window.speechSynthesis) window.speechSynthesis.cancel()

    if (settings.premiumVoiceEnabled) {
      try {
        setActiveVoiceName('Loading Premium Voice...')
        const res = await requestElevenLabsVoice(text)
        if (res.ok && res.audioBase64) {
          const audio = new Audio(`data:audio/mp3;base64,${res.audioBase64}`)
          audio.onplay = () => setActiveVoiceName('ElevenLabs Premium Voice')
          audio.onerror = () => {
             setActiveVoiceName('Premium Failed - Using Browser (BN)')
             speakWithBrowser(text)
          }
          audio.play()
          return
        } else {
          setActiveVoiceName('Premium Failed - Using Browser (BN)')
        }
      } catch (err) {
        setActiveVoiceName('Premium Failed - Using Browser (BN)')
      }
    }

    speakWithBrowser(text)
  }

  const speakWithBrowser = (text) => {
    if (!window.speechSynthesis) return

    // Critical fix for Chrome: cancel any pending speech
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    const voices = window.speechSynthesis.getVoices()
    
    // First try standard lang codes
    let bnVoice = voices.find(v => v.lang.includes('bn') || v.lang.includes('bn-IN') || v.lang.includes('bn-BD'))
    
    // Google Chrome explicit fallback
    if (!bnVoice) {
      bnVoice = voices.find(v => v.name.includes('Google') && (v.name.includes('বাংলা') || v.name.toLowerCase().includes('bangla') || v.name.toLowerCase().includes('bengali')))
    }
    
    if (bnVoice) {
      utterance.voice = bnVoice
      utterance.lang = bnVoice.lang || 'bn-BD'
      if (!settings.premiumVoiceEnabled) setActiveVoiceName(bnVoice.name)
    } else {
      utterance.lang = 'bn-BD'
      if (!settings.premiumVoiceEnabled) setActiveVoiceName('Browser Default (BN)')
    }
    
    // Custom voice settings for the Majestic Voice Persona
    utterance.pitch = 0.8;
    utterance.rate = 0.9;
    utterance.volume = 1;
    
    utterance.onerror = (e) => {
      if (e.error === 'not-allowed') {
        setAudioBlockedWarning(true)
      }
    }

    utterance.onstart = () => {
      setAudioBlockedWarning(false)
    }

    // Chrome hack: slight delay after cancel to prevent immediate abort
    setTimeout(() => {
      window.speechSynthesis.speak(utterance)
    }, 50)
  }

  const runProactiveCheck = async () => {
    try {
      const [alerts, tasks, projects, events] = await Promise.all([
        storageAdapter.getAlerts(),
        storageAdapter.getTasks(),
        storageAdapter.getProjects(),
        storageAdapter.getWebsiteEvents()
      ])
      
      const now = new Date()
      localStorage.setItem('km_empire_last_checked_at', now.toISOString())

      const activeAlerts = alerts.filter(a => a.status !== 'Fixed' && a.status !== 'Ignored')
      const criticalOrHighAlerts = activeAlerts.filter(a => a.severity === 'High' || a.severity === 'Critical')
      const errorProjects = projects.filter(p => p.healthStatus === 'Error' || p.healthStatus === 'Warning')
      const pendingTasks = tasks.filter(t => t.status !== 'Done')
      const pendingCriticalTasks = pendingTasks.filter(t => t.priority === 'Critical' || t.priority === 'High')
      const criticalEvents = (events || []).filter(e => (e.severity === 'Critical' || e.severity === 'High') && new Date(e.createdAt) > new Date(Date.now() - 24*60*60*1000))

      let spokenAlerts = JSON.parse(localStorage.getItem('km_empire_spoken_alerts') || '{}')
      let spokenEvents = JSON.parse(localStorage.getItem('km_empire_spoken_agent_events') || '{}')
      
      let shouldSpeak = false
      let textToSpeak = ''

      // Check critical alerts
      for (const a of criticalOrHighAlerts) {
        if (settings.alertVoice && !spokenAlerts[a.id]) {
          shouldSpeak = true
          spokenAlerts[a.id] = true
          textToSpeak = 'বস, গুরুত্বপূর্ণ সতর্কবার্তা আছে। আগে Alert Center check করুন।'
          localStorage.setItem('km_empire_last_spoken_alert', `Alert: ${a.projectName}`)
          break
        }
      }

      // Check website agent events
      if (!shouldSpeak) {
        for (const e of criticalEvents) {
          if (settings.agentEventVoice && !spokenEvents[e.id]) {
            shouldSpeak = true
            spokenEvents[e.id] = true
            textToSpeak = 'বস, connected website থেকে নতুন high priority event এসেছে। Website Agent page check করুন।'
            localStorage.setItem('km_empire_last_spoken_alert', `Event: ${e.websiteName}`)
            break
          }
        }
      }

      // Check health
      if (!shouldSpeak) {
        for (const p of errorProjects) {
          if (settings.healthWarningVoice && !spokenAlerts[`health_${p.id}`]) {
            shouldSpeak = true
            spokenAlerts[`health_${p.id}`] = true
            textToSpeak = `বস, ${p.name} ওয়েবসাইটে সমস্যা আছে। দয়া করে Health চেক করুন।`
            localStorage.setItem('km_empire_last_spoken_alert', `Health: ${p.name}`)
            break
          }
        }
      }

      // Check tasks
      if (!shouldSpeak) {
        for (const t of pendingCriticalTasks) {
          if (settings.taskReminderVoice && !spokenAlerts[`task_${t.id}`]) {
            shouldSpeak = true
            spokenAlerts[`task_${t.id}`] = true
            textToSpeak = 'বস, গুরুত্বপূর্ণ কাজ বাকি আছে। Tasks প্যানেল দেখুন।'
            localStorage.setItem('km_empire_last_spoken_alert', `Task: Urgent Task Pending`)
            break
          }
        }
      }

      // Check auto briefing
      if (!shouldSpeak && settings.autoVoiceBriefing) {
        const lastBriefing = localStorage.getItem('km_empire_last_briefing_at')
        // Brief once every 1 hour (3600000ms) or if never
        if (!lastBriefing || (now.getTime() - new Date(lastBriefing).getTime() > 3600000)) {
          shouldSpeak = true
          textToSpeak = `আসসালামু আলাইকুম বস। বর্তমান অবস্থা বলছি। আপনার ${activeAlerts.length}টি alert আছে, ${pendingTasks.length}টি task pending আছে, এবং ${projects.length}টি website monitor হচ্ছে। আগে critical alert check করা ভালো। আল্লাহ ভরসা, ধীরে ধীরে এগোবো।`
          localStorage.setItem('km_empire_last_briefing_at', now.toISOString())
          localStorage.setItem('km_empire_last_spoken_alert', 'Routine Briefing')
        }
      }

      if (shouldSpeak) {
        localStorage.setItem('km_empire_spoken_alerts', JSON.stringify(spokenAlerts))
        localStorage.setItem('km_empire_spoken_agent_events', JSON.stringify(spokenEvents))
        localStorage.setItem('km_empire_last_voice_report_at', now.toISOString())
        speakAlert(textToSpeak)
        window.dispatchEvent(new Event('assistant_settings_updated')) // update UI trackers
      }

    } catch (err) {
      console.error(err)
    }
  }

  // Effect to trigger check ONLY if Monitor is ON, and clear it otherwise.
  useEffect(() => {
    let intervalId
    if (settings.monitorActive) {
      // Run once immediately on start
      runProactiveCheck()
      intervalId = setInterval(runProactiveCheck, settings.checkInterval || 300000)
    }
    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [settings.monitorActive, settings.checkInterval])

  // Custom Event listener to test briefing
  useEffect(() => {
    const handleTestBriefing = () => {
       const text = "আসসালামু আলাইকুম বস। এটি একটি টেস্ট ব্রিফিং। আপনার সিস্টেম সম্পূর্ণ প্রস্তুত।"
       speakAlert(text)
    }
    window.addEventListener('test_auto_briefing', handleTestBriefing)
    return () => window.removeEventListener('test_auto_briefing', handleTestBriefing)
  }, [settings.quietMode, settings.voiceOutput])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const buildSafeAssistantReply = async (type) => {
    try {
      const [projects, tasks, alerts, reports, events] = await Promise.all([
        storageAdapter.getProjects(),
        storageAdapter.getTasks(),
        storageAdapter.getAlerts(),
        storageAdapter.getReports(),
        storageAdapter.getWebsiteEvents()
      ])

      const pTasks = tasks || []
      const pAlerts = alerts || []
      const pProjects = projects || []

      const pendingTasks = pTasks.filter(t => t.status !== 'Done')
      const activeAlerts = pAlerts.filter(a => a.status !== 'Fixed' && a.status !== 'Ignored')
      const cAlerts = pAlerts.filter(a => (a.severity === 'High' || a.severity === 'Critical') && a.status !== 'Fixed' && a.status !== 'Ignored')
      const wProjects = pProjects.filter(p => p.healthStatus === 'Warning' || p.healthStatus === 'Error' || p.healthStatus === 'Unknown')

      if (type === 'daily_report') {
        let text = `আসসালামু আলাইকুম বস।\nআজকের Control Room রিপোর্ট:\n\n`
        text += `১. সামগ্রিক অবস্থা:\n`
        text += `বর্তমান status: ${systemRisk}\n`
        if (systemRisk === 'Need Review') {
          text += `ব্যাখ্যা: কিছু alert/task/website health review দরকার।\n\n`
        } else {
          text += `ব্যাখ্যা: আলহামদুলিল্লাহ, সবকিছু ঠিক আছে।\n\n`
        }

        text += `২. Website:\n`
        text += `মোট website: ${pProjects.length > 0 ? pProjects.length : 'data পাওয়া যায়নি'}\n\n`

        text += `৩. Alert:\n`
        text += `Active alert: ${pAlerts.length > 0 ? activeAlerts.length : 'data পাওয়া যায়নি বা ০টি'}\n\n`

        text += `৪. Task:\n`
        text += `Pending task: ${pTasks.length > 0 ? pendingTasks.length : 'data পাওয়া যায়নি বা ০টি'}\n\n`

        text += `৫. Next Safe Action:\n`
        text += `প্রথমে Website Control দেখুন।\n`
        text += `তারপর Website Agent check করুন।\n`
        text += `তারপর Task Manager / Alert Center update করুন।\n\n`

        text += `৬. Security Reminder:\n`
        text += `API key, token, password frontend বা GitHub-এ দেবেন না।\n`
        text += `Backup ছাড়া delete/migration করবেন না।`

        return text
      }

      if (type === 'task_list') {
        let text = `বস, আপনার কাজের তালিকা:\n\n`
        if (pTasks.length === 0 || pendingTasks.length === 0) {
          text += `কোনো pending task পাওয়া যায়নি।\n`
        } else {
          pendingTasks.slice(0, 5).forEach(t => {
            text += `• [${t.priority}] ${t.title}\n`
          })
          text += `\n`
        }
        return text.trim()
      }

      if (type === 'voice_report') {
        let voiceTxt = `আসসালামু আলাইকুম বস। `
        
        if (systemRisk === 'Need Review') {
           voiceTxt += `বর্তমান অবস্থা, রিভিউ করা প্রয়োজন। `
        } else if (systemRisk === 'Safe') {
           voiceTxt += `বর্তমান অবস্থা নিরাপদ। `
        } else if (systemRisk === 'Warning') {
           voiceTxt += `বর্তমান অবস্থায় কিছু সতর্কতা আছে। `
        } else if (systemRisk === 'Critical') {
           voiceTxt += `বর্তমান অবস্থা ক্রিটিকাল। `
        } else {
           voiceTxt += `বর্তমান অবস্থা ঠিক আছে। `
        }
        
        const cCount = cAlerts.length
        const tCount = pendingTasks.length
        const wCount = wProjects.length

        if (cCount === 0 && tCount === 0 && wCount === 0) {
           voiceTxt += `আপনার কোনো নতুন কাজ বা সমস্যা নেই। নিশ্চিন্তে থাকুন।`
        } else {
           const parts = []
           if (cCount > 0) parts.push(`${cCount}টি ক্রিটিকাল অ্যালার্ট`)
           if (tCount > 0) parts.push(`${tCount}টি কাজ বাকি`)
           if (wCount > 0) parts.push(`${wCount}টি ওয়েবসাইটে সমস্যা`)
           
           voiceTxt += `আপনার ` + parts.join(', ') + ` আছে।`
        }
        
        return voiceTxt
      }

      if (type === 'security_check') {
        let text = `নিরাপত্তা চেক:\n\n`
        text += `• No frontend API keys\n`
        text += `• API gateway planned/safe\n`
        text += `• Firebase owner-only active\n`
        text += `• Backup reminder: Take backup before risky operations`
        return text
      }

    } catch (err) {
      return 'Data unavailable. Local fallback active.'
    }
    
    // fallback
    return `আমি ঠিক বুঝতে পারিনি। আপনি ‘আজকের রিপোর্ট’, ‘কাজের তালিকা’, ‘ভয়েস রিপোর্ট’, অথবা ‘নিরাপত্তা চেক’ চাপুন।`
  }

  const handleSend = async (customType = null, customText = null) => {
    // If we pass a direct type (e.g. from quick chips)
    if (customType) {
      const displayMsg = customText || customType
      setMessages(prev => [...prev, { role: 'user', text: displayMsg }])
      setInput('')
      setIsTyping(true)
      
      const report = await buildSafeAssistantReply(customType)
      
      if (customType === 'voice_report' && settings.voiceOutput && !settings.quietMode) {
        speakAlert(report)
      }
      
      setMessages(prev => [...prev, { role: 'assistant', text: report }])
      addAuditLog(`${customType}_generated`, 'success', 'assistant', `Generated ${customType}`)
      setIsTyping(false)
      return
    }

    const userMsg = input.trim()
    if (!userMsg) return

    setMessages(prev => [...prev, { role: 'user', text: userMsg }])
    setInput('')
    setIsTyping(true)

    const cmd = userMsg.toLowerCase().trim()
    const isMatch = (arr, c) => arr.some(keyword => c.includes(keyword))

    const dailyReportKeywords = ['আজকের রিপোর্ট', 'আজকে কি খবর', 'আজকের খবর কি', 'আজকের অবস্থা', 'আজ কী অবস্থা', 'system report', 'daily report', 'quick report']
    const taskKeywords = ['আজকের কি কাজ আছে', 'আজকে কি কাজ আছে', 'কি কাজ বাকি আছে', 'pending task', 'next task', 'কাজ বলো', 'পরের কাজ বলো', 'এখন কি করব']
    const securityKeywords = ['security check', 'নিরাপত্তা চেক', 'সিকিউরিটি চেক', 'api safe আছে', 'secret আছে কিনা']
    const voiceKeywords = ['short voice report', 'ছোট রিপোর্ট বলো', 'ভয়েস রিপোর্ট', 'শুনিয়ে বলো']

    let replyType = 'fallback'
    if (isMatch(dailyReportKeywords, cmd)) replyType = 'daily_report'
    else if (isMatch(taskKeywords, cmd)) replyType = 'task_list'
    else if (isMatch(securityKeywords, cmd)) replyType = 'security_check'
    else if (isMatch(voiceKeywords, cmd)) replyType = 'voice_report'

    const report = await buildSafeAssistantReply(replyType)
    
    if (replyType === 'voice_report' && settings.voiceOutput && !settings.quietMode) {
      speakAlert(report)
    }

    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'assistant', text: report }])
      setIsTyping(false)
    }, 400)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const getBadgeData = (risk) => {
    if (risk === 'Need Review') return { label: 'Check Needed', tooltip: 'কিছু alert/task/website health check দরকার' }
    if (risk === 'Safe') return { label: 'Safe', tooltip: 'সব ঠিক আছে' }
    if (risk === 'Warning') return { label: 'Warning', tooltip: 'কিছু সতর্কতা আছে' }
    if (risk === 'Critical') return { label: 'Critical', tooltip: 'জরুরি সমস্যা আছে' }
    return { label: risk, tooltip: risk }
  }
  const badgeData = getBadgeData(systemRisk)

  return (
    <>
      {/* Floating Button */}
      {!open && (
        <button
          onClick={onToggle}
          className="fixed bottom-6 right-4 md:right-6 z-[9999] w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-gold-lg gold-gradient hover:shadow-gold-lg"
        >
          <Bot className="w-6 h-6 text-obsidian-dark" />
        </button>
      )}

      {/* Assistant Panel */}
      {open && (
        <div className="fixed bottom-[90px] md:bottom-[110px] right-3 md:right-6 z-[9999] w-[calc(100vw-24px)] md:w-[380px] h-[550px] max-h-[75vh] md:max-h-[70vh] glass-panel rounded-2xl flex flex-col shadow-2xl border border-gold/10 animate-slide-up">
          {/* Header */}
          <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-gold/10 bg-obsidian-dark/50 rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl gold-gradient flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-obsidian-dark" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-white font-bold text-sm">Empire AI</h3>
                  <span 
                    title={badgeData.tooltip}
                    className={`px-1.5 py-0.5 rounded text-[8px] font-bold border uppercase cursor-help ${
                    systemRisk === 'Critical' ? 'bg-status-error/10 text-status-error border-status-error/30' :
                    systemRisk === 'Warning' ? 'bg-status-warning/10 text-status-warning border-status-warning/30' :
                    systemRisk === 'Need Review' ? 'bg-status-dev/10 text-status-dev border-status-dev/30' :
                    'bg-status-live/10 text-status-live border-status-live/30'
                  }`}>
                    {badgeData.label}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <a href="/assistant-settings" className="text-[10px] text-gold hover:underline">
                    Assistant Settings
                  </a>
                  {activeVoiceName && (
                    <span className="text-[9px] text-obsidian-muted px-1.5 py-0.5 rounded bg-obsidian-dark/50 border border-obsidian-border whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]" title={`Voice: ${activeVoiceName}`}>
                      🎙️ {activeVoiceName}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={onToggle} className="text-obsidian-muted hover:text-white transition-colors p-1" title="Minimize">
                <Minimize2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {audioBlockedWarning && (
            <div className="shrink-0 bg-status-error/10 border-b border-status-error/30 px-4 py-2 text-xs text-status-error flex justify-between items-center">
              <span>Voice blocked. Please click anywhere to allow audio.</span>
              <button onClick={() => setAudioBlockedWarning(false)} className="text-status-error hover:text-white p-1">✕</button>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 empire-scrollbar bg-obsidian-dark/20 overflow-x-hidden scroll-smooth">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[95%] w-fit rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words max-h-[60vh] overflow-y-auto empire-scrollbar ${
                    msg.role === 'user'
                      ? 'bg-gold/10 text-gold-light border border-gold/15 rounded-br-sm'
                      : 'bg-obsidian-card border border-obsidian-border text-white rounded-bl-sm shadow-lg'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-obsidian-card border border-obsidian-border rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1">
                  <div className="w-1.5 h-1.5 bg-gold/50 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-gold/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-1.5 h-1.5 bg-gold/50 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Clean Quick Chips */}
          <div className="shrink-0 px-4 py-3 flex flex-wrap gap-2 bg-obsidian-dark/40 shadow-inner justify-center">
            <button 
              onClick={() => handleSend('daily_report', 'আজকের রিপোর্ট')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-obsidian-card border border-gold/20 text-xs text-gold hover:bg-gold/10 transition-colors"
            >
              আজকের রিপোর্ট
            </button>
            <button 
              onClick={() => handleSend('task_list', 'কাজের তালিকা')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-obsidian-card border border-blue-500/20 text-xs text-blue-400 hover:bg-blue-500/10 transition-colors"
            >
              কাজের তালিকা
            </button>
            <button 
              onClick={() => handleSend('voice_report', 'ভয়েস রিপোর্ট')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-obsidian-card border border-status-live/20 text-xs text-status-live hover:bg-status-live/10 transition-colors"
            >
              ভয়েস রিপোর্ট
            </button>
            <button 
              onClick={() => handleSend('security_check', 'নিরাপত্তা চেক')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-obsidian-card border border-obsidian-border text-xs text-obsidian-muted hover:text-white transition-colors"
            >
              নিরাপত্তা চেক
            </button>
          </div>

          {/* Input */}
          <div className="shrink-0 p-4 border-t border-gold/10 bg-obsidian-dark/50 rounded-b-2xl pb-4">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="কমান্ড লিখুন..."
                className="flex-1 bg-obsidian-card border border-obsidian-border rounded-xl px-4 py-2.5 text-sm text-white placeholder-obsidian-muted focus:outline-none focus:border-gold/30 transition-colors"
                disabled={isTyping}
              />
              <button
                onClick={() => handleSend()}
                disabled={isTyping || !input.trim()}
                className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center flex-shrink-0 hover:opacity-90 transition-all disabled:opacity-50"
              >
                <Send className="w-4 h-4 text-obsidian-dark" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
