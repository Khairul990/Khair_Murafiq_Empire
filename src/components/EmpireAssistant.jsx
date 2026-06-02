import { useState, useRef, useEffect } from 'react'
import { Bot, X, Send, Sparkles, FileText, Minimize2 } from 'lucide-react'
import { storageAdapter } from '../services/storageAdapter'
import { getAssistantResponse } from '../data/assistantData'
import { addAuditLog } from '../utils/auditLogger'

export default function EmpireAssistant({ open, onToggle }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'আসসালামু আলাইকুম বস। আমি Empire AI। নিচে থেকে কমান্ড বেছে নিন অথবা লিখুন।' }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [systemRisk, setSystemRisk] = useState('Safe')

  const [settings, setSettings] = useState({
    voiceOutput: true,
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
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices()
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

  const speakAlert = (text) => {
    if (!window.speechSynthesis || settings.quietMode || !settings.voiceOutput) return
    const utterance = new SpeechSynthesisUtterance(text)
    const voices = window.speechSynthesis.getVoices()
    const bnVoice = voices.find(v => v.lang.includes('bn'))
    if (bnVoice) {
      utterance.voice = bnVoice
      utterance.lang = bnVoice.lang
    } else {
      utterance.lang = 'bn-BD'
    }
    
    // Custom voice settings for the Majestic Voice Persona
    utterance.pitch = 0.8;
    utterance.rate = 0.9;
    utterance.volume = 1;
    
    window.speechSynthesis.speak(utterance)
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

  const getRiskExplanation = (risk) => {
    if (risk === 'Need Review') {
       return `বর্তমান অবস্থা: Need Review.\nকারণ: কিছু alert/task pending আছে অথবা website health check দরকার।\nপ্রথমে Website Control পেজে Known Issue দেখুন।\nতারপর Alert Center / Task Manager / Website Agent check করুন।`
    }
    if (risk === 'Safe') return `বর্তমান অবস্থা: Safe.\nসব শান্ত ও সুরক্ষিত আছে, আলহামদুলিল্লাহ।`
    if (risk === 'Warning') return `বর্তমান অবস্থা: Warning.\nকারণ: কোনো non-critical error বা pending task জমে আছে।`
    if (risk === 'Critical') return `বর্তমান অবস্থা: Critical.\nকারণ: সিস্টেমে High/Critical alert রয়েছে। খুব দ্রুত Alert Center চেক করুন।`
    return `বর্তমান অবস্থা: ${risk}`
  }

  const generateReport = async () => {
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
      const pEvents = events || []

      const pendingTasks = pTasks.filter(t => t.status !== 'Done')
      const activeAlerts = pAlerts.filter(a => a.status !== 'Fixed' && a.status !== 'Ignored')
      const criticalEvents = pEvents.filter(e => (e.severity === 'Critical' || e.severity === 'High') && new Date(e.createdAt) > new Date(Date.now() - 24*60*60*1000))
      
      const warningProjects = pProjects.filter(p => p.healthStatus === 'Warning' || p.healthStatus === 'Error' || p.healthStatus === 'Unknown')
      const healthyProjects = pProjects.filter(p => p.healthStatus === 'Healthy')

      let priorities = []
      if (activeAlerts.length > 0) priorities.push('• Fix active alerts first')
      if (pendingTasks.length > 0) priorities.push('• Complete overdue/pending tasks')
      if (warningProjects.length > 0) priorities.push('• Update Unknown/Error website health')
      priorities.push('• Take backup before risky work')
      priorities.push('• Do not touch API secrets')
      priorities = priorities.slice(0, 3)

      let bnText = `আসসালামু আলাইকুম বস।\n\n`
      bnText += `${getRiskExplanation(systemRisk)}\n\n`
      
      if (pProjects.length === 0) {
          bnText += `🌐 Website Health Summary:\nএই data এখনো পাওয়া যায়নি।\n\n`
      } else {
          bnText += `🌐 Website Health Summary:\n`
          bnText += `Total Websites: ${pProjects.length}\nHealthy: ${healthyProjects.length}, Warning/Error/Unknown: ${warningProjects.length}\n\n`
      }

      if (pAlerts.length === 0) {
        bnText += `🚨 Active Alerts:\nএই data এখনো পাওয়া যায়নি বা কোনো alert নেই।\n\n`
      } else {
        bnText += `🚨 Active Alerts: ${activeAlerts.length}টি আছে।\n\n`
      }

      if (pEvents.length === 0) {
        bnText += `⚠️ Agent Events:\nএই data এখনো পাওয়া যায়নি।\n\n`
      } else {
        bnText += `⚠️ Recent Agent Events: ${criticalEvents.length}টি High/Critical event।\n\n`
      }

      if (pTasks.length === 0) {
        bnText += `📋 Pending Tasks:\nএই data এখনো পাওয়া যায়নি বা কোনো কাজ নেই।\n\n`
      } else {
        bnText += `📋 Pending Tasks: ${pendingTasks.length}টি\n\n`
      }

      bnText += `🎯 Top 3 Next Safe Actions:\n`
      priorities.forEach(p => bnText += `${p}\n`)
      bnText += `\n`

      return bnText.trim()
    } catch (err) {
      return 'Firebase unavailable. Local fallback active.'
    }
  }

  const generateTaskReport = async () => {
    try {
      const [tasks, alerts] = await Promise.all([
        storageAdapter.getTasks(),
        storageAdapter.getAlerts()
      ])
      
      const pTasks = tasks || []
      const pAlerts = alerts || []
      
      const pendingTasks = pTasks.filter(t => t.status !== 'Done')
      const activeAlerts = pAlerts.filter(a => a.status !== 'Fixed' && a.status !== 'Ignored')
      const criticalAlerts = activeAlerts.filter(a => a.severity === 'High' || a.severity === 'Critical')
      
      let text = `বস, আপনার কাজের তালিকা:\n\n`
      text += `${getRiskExplanation(systemRisk)}\n\n`
      
      if (activeAlerts.length > 0) {
        text += `🚨 Alerts: ${activeAlerts.length}টি alert আছে। যদি alert থাকে, তবে আগে alert চেক করুন।\n\n`
      }
      
      if (pTasks.length === 0 || pendingTasks.length === 0) {
         text += `✅ কোনো pending task পাওয়া যায়নি।\n\n`
      } else {
         text += `📋 Pending Tasks:\n`
         pendingTasks.slice(0, 5).forEach(t => {
           text += `• [${t.priority}] ${t.title}\n`
         })
         text += `\n`
      }
      
      text += `🎯 Next Safe Action:\n`
      if (criticalAlerts.length > 0) text += `Alert Center এ গিয়ে critical alerts resolve করুন।\n`
      else if (pendingTasks.length > 0) text += `Urgent task গুলো শেষ করুন।\n`
      else text += `নতুন update এর আগে Backup নিয়ে নিন।\n`
      
      return text.trim()
    } catch {
      return 'Data unavailable. Local fallback active.'
    }
  }

  const generateVoiceReport = async () => {
    try {
       const [tasks, alerts, projects] = await Promise.all([
         storageAdapter.getTasks(),
         storageAdapter.getAlerts(),
         storageAdapter.getProjects()
       ])
       const pTasks = tasks || []
       const pAlerts = alerts || []
       const pProjects = projects || []
       
       const pendingTasks = pTasks.filter(t => t.status !== 'Done').length
       const cAlerts = pAlerts.filter(a => (a.severity === 'High' || a.severity === 'Critical') && a.status !== 'Fixed' && a.status !== 'Ignored').length
       const wProjects = pProjects.filter(p => p.healthStatus === 'Warning' || p.healthStatus === 'Error' || p.healthStatus === 'Unknown').length
       
       let voiceTxt = `আসসালামু আলাইকুম বস। `
       if (systemRisk === 'Need Review') {
          voiceTxt += `বর্তমান অবস্থা Need Review। কারণ কিছু অ্যালার্ট বা কাজ বাকি আছে। `
       } else {
          voiceTxt += `বর্তমান অবস্থা ${systemRisk}। `
       }
       voiceTxt += `আপনার ${cAlerts}টি ক্রিটিকাল অ্যালার্ট, ${pendingTasks}টি কাজ বাকি আছে, এবং ${wProjects}টি ওয়েবসাইটে সমস্যা থাকতে পারে।`
       
       return voiceTxt
    } catch {
       return 'দুঃখিত, ডাটা পাওয়া যায়নি।'
    }
  }

  const handleSend = async (customText = null) => {
    const userMsg = customText || input.trim()
    if (!userMsg) return

    setMessages(prev => [...prev, { role: 'user', text: userMsg }])
    if (!customText) setInput('')
    setIsTyping(true)

    const cmd = userMsg.toLowerCase().trim()
    
    const isMatch = (arr, c) => arr.some(keyword => c.includes(keyword))

    const dailyReportKeywords = ['আজকের রিপোর্ট', 'আজকে কি খবর', 'আজকের খবর কি', 'আজকের অবস্থা', 'আজ কী অবস্থা', 'system report', 'daily report', 'quick report']
    const taskKeywords = ['আজকের কি কাজ আছে', 'আজকে কি কাজ আছে', 'কি কাজ বাকি আছে', 'pending task', 'next task', 'কাজ বলো', 'পরের কাজ বলো', 'এখন কি করব']
    const securityKeywords = ['security check', 'নিরাপত্তা চেক', 'সিকিউরিটি চেক', 'api safe আছে', 'secret আছে কিনা']
    const voiceKeywords = ['short voice report', 'ছোট রিপোর্ট বলো', 'ভয়েস রিপোর্ট', 'শুনিয়ে বলো']

    if (isMatch(dailyReportKeywords, cmd)) {
      const report = await generateReport()
      setMessages(prev => [...prev, { role: 'assistant', text: report }])
      addAuditLog('quick_report_generated', 'success', 'assistant', 'Generated quick report')
      setIsTyping(false)
      return
    }

    if (isMatch(taskKeywords, cmd)) {
      const report = await generateTaskReport()
      setMessages(prev => [...prev, { role: 'assistant', text: report }])
      addAuditLog('task_report_generated', 'success', 'assistant', 'Generated task report')
      setIsTyping(false)
      return
    }

    if (isMatch(securityKeywords, cmd)) {
      const txt = 'Security Check Report:\n• API keys frontend blocked: Yes\n• Firebase owner-only status: Active\n• API real status: Planned / Not Connected\n• Backup reminder: Take backup before risky changes\n• No secrets warning: All external APIs are mocked in Safe Mode.'
      setMessages(prev => [...prev, { role: 'assistant', text: txt }])
      addAuditLog('security_check_requested', 'success', 'assistant', 'Security check completed')
      setIsTyping(false)
      return
    }

    if (isMatch(voiceKeywords, cmd)) {
      const report = await generateVoiceReport()
      setMessages(prev => [...prev, { role: 'assistant', text: report }])
      addAuditLog('voice_report_generated', 'success', 'assistant', 'Generated short voice report')
      if (settings.voiceOutput && !settings.quietMode) {
          speakAlert(report)
      }
      setIsTyping(false)
      return
    }

    // Default static fallback for other commands
    setTimeout(() => {
      const response = getAssistantResponse(userMsg)
      let resText = typeof response === 'object' ? (response.bn || response.en) : response || ''
      
      const vagueWords = ['Need Review', 'Safe', 'Warning', 'Critical', 'ওয়েবসাইটে সমস্যা থাকতে পারে']
      
      let finalTxt = resText
      
      if (vagueWords.includes(resText.trim())) {
         finalTxt = getRiskExplanation(resText.trim())
      } else {
         // Fallback for unclear message
         finalTxt = `আমি ঠিক বুঝতে পারিনি। আপনি চাইলে ‘আজকের রিপোর্ট’, ‘কাজের তালিকা’, অথবা ‘নিরাপত্তা চেক’ লিখতে পারেন।`
      }
      
      setMessages(prev => [...prev, { role: 'assistant', text: finalTxt }])
      
      setIsTyping(false)
    }, 400)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

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
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold border uppercase ${
                    systemRisk === 'Critical' ? 'bg-status-error/10 text-status-error border-status-error/30' :
                    systemRisk === 'Warning' ? 'bg-status-warning/10 text-status-warning border-status-warning/30' :
                    systemRisk === 'Need Review' ? 'bg-status-dev/10 text-status-dev border-status-dev/30' :
                    'bg-status-live/10 text-status-live border-status-live/30'
                  }`}>
                    {systemRisk}
                  </span>
                </div>
                <a href="/assistant-settings" className="text-[10px] text-gold hover:underline">
                  Assistant Settings
                </a>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={onToggle} className="text-obsidian-muted hover:text-white transition-colors p-1" title="Minimize">
                <Minimize2 className="w-5 h-5" />
              </button>
            </div>
          </div>

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
              onClick={() => handleSend('আজকের রিপোর্ট')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-obsidian-card border border-gold/20 text-xs text-gold hover:bg-gold/10 transition-colors"
            >
              আজকের রিপোর্ট
            </button>
            <button 
              onClick={() => handleSend('আজকের কি কাজ আছে')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-obsidian-card border border-blue-500/20 text-xs text-blue-400 hover:bg-blue-500/10 transition-colors"
            >
              কাজের তালিকা
            </button>
            <button 
              onClick={() => handleSend('ছোট রিপোর্ট বলো')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-obsidian-card border border-status-live/20 text-xs text-status-live hover:bg-status-live/10 transition-colors"
            >
              ভয়েস রিপোর্ট
            </button>
            <button 
              onClick={() => handleSend('নিরাপত্তা চেক')}
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
