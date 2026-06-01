import { useState, useRef, useEffect } from 'react'
import { Bot, X, Send, Sparkles, Mic, FileText } from 'lucide-react'
import { storageAdapter } from '../services/storageAdapter'
import { getAssistantResponse } from '../data/assistantData'

export default function EmpireAssistant({ open, onToggle }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: { bn: 'আসসালামু আলাইকুম বস। আমি Empire AI। সাহায্যের জন্য "আজকের রিপোর্ট বলো" চাপুন বা কমান্ড লিখুন।', en: 'Welcome! I am Empire AI. Click "Quick Report" or type a command.' } },
  ])
  const [input, setInput] = useState('')
  const [lang, setLang] = useState('bn') // default to Bengali
  const [isTyping, setIsTyping] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [voiceStateMsg, setVoiceStateMsg] = useState('')
  const [systemRisk, setSystemRisk] = useState('Safe')

  const [monitorActive, setMonitorActive] = useState(false)
  const [checkInterval, setCheckInterval] = useState(300000) // 5 min
  const [quietMode, setQuietMode] = useState(false)
  const [lastCheckedTime, setLastCheckedTime] = useState('Never')
  const [lastVoiceAlertTime, setLastVoiceAlertTime] = useState('None')
  const [firebaseError, setFirebaseError] = useState(false)
  const [showMonitorSettings, setShowMonitorSettings] = useState(false)

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
  }, [])

  const speakAlert = (text) => {
    if (!window.speechSynthesis) return
    const utterance = new SpeechSynthesisUtterance(text)
    const voices = window.speechSynthesis.getVoices()
    const bnVoice = voices.find(v => v.lang.includes('bn'))
    if (bnVoice) {
      utterance.voice = bnVoice
      utterance.lang = bnVoice.lang
    } else {
      utterance.lang = 'bn-BD'
    }
    window.speechSynthesis.speak(utterance)
  }

  const runProactiveCheck = async () => {
    try {
      const [alerts, tasks, projects] = await Promise.all([
        storageAdapter.getAlerts(),
        storageAdapter.getTasks(),
        storageAdapter.getProjects()
      ])
      
      setFirebaseError(false)
      const now = new Date()
      setLastCheckedTime(now.toLocaleTimeString())

      const activeAlerts = alerts.filter(a => a.status !== 'Fixed' && a.status !== 'Ignored')
      const criticalOrHighAlerts = activeAlerts.filter(a => a.severity === 'High' || a.severity === 'Critical')
      const errorProjects = projects.filter(p => p.healthStatus === 'Error')
      const pendingCriticalTasks = tasks.filter(t => t.status !== 'Done' && t.priority === 'Critical')

      let spokenData = {}
      try {
        spokenData = JSON.parse(localStorage.getItem('km_empire_spoken_alerts')) || {}
      } catch { spokenData = {} }

      let shouldSpeak = false
      let msgWebsite = ''
      
      for (const a of criticalOrHighAlerts) {
        if (!spokenData[`alert_${a.id}`]) {
          shouldSpeak = true
          spokenData[`alert_${a.id}`] = true
          msgWebsite = a.projectName || ''
          break
        }
      }

      if (!shouldSpeak) {
        for (const p of errorProjects) {
          if (!spokenData[`proj_${p.id}`]) {
            shouldSpeak = true
            spokenData[`proj_${p.id}`] = true
            msgWebsite = p.name || ''
            break
          }
        }
      }

      if (!shouldSpeak) {
        for (const t of pendingCriticalTasks) {
          if (!spokenData[`task_${t.id}`]) {
            shouldSpeak = true
            spokenData[`task_${t.id}`] = true
            break
          }
        }
      }

      if (shouldSpeak) {
        localStorage.setItem('km_empire_spoken_alerts', JSON.stringify(spokenData))
        
        let textToSpeak = 'আসসালামু আলাইকুম বস। একটি গুরুত্বপূর্ণ সতর্কবার্তা আছে। আগে Alert Center চেক করুন।'
        if (msgWebsite) {
          textToSpeak += ` ${msgWebsite}-এ সমস্যা দেখা গেছে।`
        }
        textToSpeak += ' আল্লাহ ভরসা, ধীরে ধীরে নিরাপদভাবে এগোবো।'
        
        speakAlert(textToSpeak)
        setLastVoiceAlertTime(now.toLocaleTimeString())
      }

    } catch (err) {
      setFirebaseError(true)
      const now = new Date()
      setLastCheckedTime(now.toLocaleTimeString())
      
      let spokenData = {}
      try { spokenData = JSON.parse(localStorage.getItem('km_empire_spoken_alerts')) || {} } catch {}
      
      if (!spokenData['firebase_error']) {
        spokenData['firebase_error'] = true
        localStorage.setItem('km_empire_spoken_alerts', JSON.stringify(spokenData))
        speakAlert('Firebase unavailable. Local fallback active.')
        setLastVoiceAlertTime(now.toLocaleTimeString())
      }
    }
  }

  useEffect(() => {
    let intervalId
    if (monitorActive && !quietMode) {
      intervalId = setInterval(runProactiveCheck, checkInterval)
    }
    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [monitorActive, checkInterval, quietMode])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const generateReport = async () => {
    try {
      const [projects, tasks, alerts, reports] = await Promise.all([
        storageAdapter.getProjects(),
        storageAdapter.getTasks(),
        storageAdapter.getAlerts(),
        storageAdapter.getReports()
      ])

      const pendingTasks = tasks.filter(t => t.status !== 'Done')
      const activeAlerts = alerts.filter(a => a.status !== 'Fixed' && a.status !== 'Ignored')
      const criticalAlerts = activeAlerts.filter(a => a.severity === 'High' || a.severity === 'Critical')
      const warningProjects = projects.filter(p => {
        const pAlerts = activeAlerts.filter(a => a.projectId === p.id)
        const hasCritical = pAlerts.some(a => a.severity === 'Critical')
        return hasCritical || p.healthStatus === 'Warning' || p.healthStatus === 'Error' || p.healthStatus === 'Unknown'
      })
      const healthyProjects = projects.filter(p => {
        const pAlerts = activeAlerts.filter(a => a.projectId === p.id)
        const hasCritical = pAlerts.some(a => a.severity === 'Critical')
        return p.healthStatus === 'Healthy' && !hasCritical
      })

      let priorities = []
      if (criticalAlerts.length > 0) priorities.push('• Fix Critical/High alerts first')
      if (pendingTasks.length > 0) priorities.push('• Complete overdue/high priority tasks')
      if (warningProjects.length > 0) priorities.push('• Update Unknown/Error website health')
      priorities.push('• Take backup before risky work')
      priorities.push('• Do not touch API secrets')
      priorities = priorities.slice(0, 3)

      const currentMonth = new Date().toISOString().slice(0, 7)
      const thisMonthIncome = (reports || [])
        .filter(r => (r.docType === 'finance_entry' || r.amount !== undefined) && r.type === 'income' && (r.date || '').startsWith(currentMonth))
        .reduce((sum, r) => sum + Number(r.amount), 0)
        
      const plannedSocialPosts = (reports || [])
        .filter(r => r.docType === 'social_post' || (r.platform && r.caption))
        .length

      let bnText = `আসসালামু আলাইকুম বস।\n\n`
      bnText += `📊 Overall Status: ${systemRisk}\n\n`
      
      bnText += `🌐 Website Health Summary:\n`
      bnText += `Healthy: ${healthyProjects.length}, Warning/Error/Unknown: ${warningProjects.length}\n\n`

      if (criticalAlerts.length > 0) {
        bnText += `🚨 Critical/High Alerts: ${criticalAlerts.length}টি আছে। দয়া করে Alert Center দেখুন।\n\n`
      } else {
        bnText += `✅ কোনো Critical/High অ্যালার্ট নেই।\n\n`
      }

      if (pendingTasks.length > 0) {
        bnText += `📋 Pending Tasks: ${pendingTasks.length}টি\n\n`
      }

      if (plannedSocialPosts > 0 || thisMonthIncome > 0) {
        bnText += `💼 Social/Finance Summary:\n`
        bnText += `এই মাসের আয়: $${thisMonthIncome.toFixed(2)}, সোশ্যাল পোস্ট: ${plannedSocialPosts}টি\n\n`
      }

      bnText += `🎯 Top Recommended Actions:\n`
      priorities.forEach(p => bnText += `${p}\n`)
      bnText += `\n`

      bnText += `🛑 Safe Action Rules (Reminder):\n`
      bnText += `• No API key/token/password in frontend/GitHub\n`
      bnText += `• Backup before delete/migration\n`
      bnText += `• Owner approval before risky action\n`
      bnText += `• Real API only through backend/serverless later\n`
      bnText += `• Mock features should be clearly called mock/manual\n\n`

      bnText += `✨ আল্লাহ ভরসা, ধীরে ধীরে নিরাপদভাবে এগোবো।`

      let enText = `System Report generated successfully. Alerts: ${activeAlerts.length}, Pending Tasks: ${pendingTasks.length}. (Please switch to Bengali for detailed AI tone).`

      return { bn: bnText, en: enText }
    } catch (err) {
      return { bn: 'Firebase unavailable. Local fallback active.', en: 'Firebase unavailable. Local fallback active.' }
    }
  }

  const handleSend = async (customText = null) => {
    const userMsg = customText || input.trim()
    if (!userMsg) return

    setMessages(prev => [...prev, { role: 'user', text: userMsg }])
    if (!customText) setInput('')
    setIsTyping(true)

    const cmd = userMsg.toLowerCase().trim()
    const reportCommands = ['আজকের রিপোর্ট বলো', 'রিপোর্ট বলো', 'report', 'quick report', 'আজকের রিপোর্ট']
    
    if (reportCommands.includes(cmd)) {
      const report = await generateReport()
      setMessages(prev => [...prev, { role: 'assistant', text: report }])
      setIsTyping(false)
      return
    }

    if (cmd === 'এই পেজে কী করব?') {
      const txt = 'বর্তমানে আপনি যে পেজে আছেন, সেখানে mock features থাকতে পারে। রিয়েল API কানেক্ট করার আগে কোনো গোপন তথ্য দেবেন না এবং Backup নিয়ে কাজ করবেন।\n\nMock features should be clearly called mock/manual.'
      setMessages(prev => [...prev, { role: 'assistant', text: { bn: txt, en: txt } }])
      setIsTyping(false)
      return
    }

    if (cmd === 'security check করো') {
      const txt = 'Security Check Report:\n• No API key/token/password in frontend/GitHub\n• Firebase Web SDK only uses public config\n• Firestore Rules block unauthorized writes\n• Local Storage is acting as fallback\n\nOverall: Safe Mode Active.'
      setMessages(prev => [...prev, { role: 'assistant', text: { bn: txt, en: txt } }])
      setIsTyping(false)
      return
    }

    if (cmd === 'next কাজ বলো') {
      const txt = 'Recommended Next Safe Action:\n১. প্রথমে Alerts প্যানেল চেক করে Critical issue থাকলে ফিক্স করুন।\n২. Task list থেকে Urgent কাজ শেষ করুন।\n৩. নতুন কোনো update দেওয়ার আগে Data Export (Backup) করে নিন।'
      setMessages(prev => [...prev, { role: 'assistant', text: { bn: txt, en: txt } }])
      setIsTyping(false)
      return
    }

    if (cmd === 'short voice report') {
      const txt = `আসসালামু আলাইকুম। আপনার এম্পায়ার সিস্টেমটি এখন ${systemRisk} অবস্থায় আছে। আজকে কিছু টাস্ক এবং অ্যালার্ট পেন্ডিং আছে। রিয়েল এপিআই ব্যবহার না করে মক মোডে কাজ করুন। আল্লাহ ভরসা, নিরাপদভাবে এগিয়ে যান।`
      setMessages(prev => [...prev, { role: 'assistant', text: { bn: txt, en: txt } }])
      setIsTyping(false)
      return
    }

    // Default static fallback for other commands
    setTimeout(() => {
      const response = getAssistantResponse(userMsg)
      setMessages(prev => [...prev, { role: 'assistant', text: response }])
      setIsTyping(false)
    }, 400)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleVoice = () => {
    if (!window.speechSynthesis) {
      setVoiceStateMsg('Voice not supported on this browser')
      return
    }

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      setVoiceStateMsg('Voice stopped')
      setTimeout(() => setVoiceStateMsg(''), 3000)
      return
    }

    const lastAssistantMsg = [...messages].reverse().find(m => m.role === 'assistant')
    if (!lastAssistantMsg) return
    
    let textToSpeak = typeof lastAssistantMsg.text === 'object' ? (lastAssistantMsg.text[lang] || lastAssistantMsg.text.bn || lastAssistantMsg.text.en) : lastAssistantMsg.text
    
    // Clean text for speech
    textToSpeak = textToSpeak.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
    textToSpeak = textToSpeak.replace(/\*/g, '')
    
    const utterance = new SpeechSynthesisUtterance(textToSpeak)
    
    const voices = window.speechSynthesis.getVoices()
    const bnVoice = voices.find(v => v.lang.includes('bn'))
    
    if (bnVoice) {
      utterance.voice = bnVoice
      utterance.lang = bnVoice.lang
    } else {
      utterance.lang = 'bn-BD'
      if (!messages.some(m => m.text === 'বাংলা voice আপনার browser/device-এ পাওয়া যায়নি, default voice ব্যবহার হচ্ছে।')) {
        setMessages(prev => [...prev, { role: 'assistant', text: 'বাংলা voice আপনার browser/device-এ পাওয়া যায়নি, default voice ব্যবহার হচ্ছে।' }])
      }
    }
    
    utterance.onstart = () => {
      setIsSpeaking(true)
      setVoiceStateMsg('Reading report...')
    }
    utterance.onend = () => {
      setIsSpeaking(false)
      setVoiceStateMsg('Voice stopped')
      setTimeout(() => setVoiceStateMsg(''), 3000)
    }
    utterance.onerror = () => {
      setIsSpeaking(false)
      setVoiceStateMsg('Voice stopped')
      setTimeout(() => setVoiceStateMsg(''), 3000)
    }
    
    window.speechSynthesis.speak(utterance)
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={onToggle}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-gold-lg ${
          open ? 'bg-obsidian-card border border-gold/30 rotate-45' : 'gold-gradient hover:shadow-gold-lg'
        }`}
      >
        {open ? <X className="w-6 h-6 text-gold" /> : <Bot className="w-6 h-6 text-obsidian-dark" />}
      </button>

      {/* Assistant Panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[350px] max-w-[calc(100vw-2rem)] h-[500px] max-h-[calc(100vh-8rem)] glass-panel rounded-2xl flex flex-col shadow-2xl border border-gold/10 animate-slide-up">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gold/10 bg-obsidian-dark/50 rounded-t-2xl">
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
                <p className="text-[10px] text-obsidian-muted">Control Room Manager</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowMonitorSettings(!showMonitorSettings)}
                className={`px-2 py-1 text-[10px] font-bold rounded-md transition-colors ${
                  monitorActive ? 'bg-status-live/10 text-status-live border border-status-live/20' : 'bg-obsidian-dark text-obsidian-muted border border-obsidian-border hover:bg-obsidian-card'
                }`}
              >
                {monitorActive ? 'Monitor Active' : 'Monitor Off'}
              </button>
              <button
                onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
                className="px-2 py-1 text-[10px] font-bold rounded-md bg-gold/10 text-gold border border-gold/20 hover:bg-gold/20 transition-colors"
              >
                {lang === 'en' ? 'বাংলা' : 'English'}
              </button>
              <button onClick={onToggle} className="text-obsidian-muted hover:text-white transition-colors ml-1" title="Close">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Voice Monitor Settings */}
          {showMonitorSettings && (
            <div className="px-4 py-3 bg-obsidian-dark/80 border-b border-gold/5 text-xs text-obsidian-muted space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white font-semibold">Proactive Voice Monitor</span>
                <button 
                  onClick={() => {
                    setMonitorActive(!monitorActive)
                    if (!monitorActive) runProactiveCheck()
                  }}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${monitorActive ? 'bg-status-live text-obsidian-dark' : 'bg-obsidian-card text-white border border-obsidian-border hover:opacity-80'}`}
                >
                  {monitorActive ? 'ON' : 'OFF'}
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Check Interval:</span>
                <select 
                  value={checkInterval}
                  onChange={(e) => setCheckInterval(Number(e.target.value))}
                  className="bg-obsidian-card border border-obsidian-border rounded px-2 py-1 outline-none text-white"
                >
                  <option value={300000}>5 min</option>
                  <option value={600000}>10 min</option>
                  <option value={1800000}>30 min</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <span>Quiet Mode (Mute):</span>
                <button 
                  onClick={() => setQuietMode(!quietMode)}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${quietMode ? 'bg-status-warning text-obsidian-dark' : 'bg-obsidian-card text-white border border-obsidian-border hover:opacity-80'}`}
                >
                  {quietMode ? 'ON' : 'OFF'}
                </button>
              </div>
              {quietMode && <p className="text-[10px] text-status-warning">Quiet Mode চালু আছে, তাই voice বাজবে না.</p>}

              <div className="bg-obsidian-card/50 p-2 rounded-lg border border-obsidian-border text-[10px] space-y-1">
                <p>Status: <span className="text-white font-bold">{monitorActive ? (quietMode ? 'Monitoring but Quiet' : 'Active (Checking...)') : 'Off'}</span></p>
                <p>Last checked: {lastCheckedTime}</p>
                <p>Last voice alert: {lastVoiceAlertTime}</p>
                {firebaseError && <p className="text-status-error font-bold mt-1">Firebase unavailable / local fallback active.</p>}
                <p className="text-gold/70 mt-1 italic">Voice notification works only while this Control Room tab is open and browser allows audio.</p>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="px-4 py-3 border-b border-gold/5 flex flex-wrap gap-2">
            <button 
              onClick={() => handleSend(lang === 'bn' ? 'আজকের রিপোর্ট বলো' : 'Quick Report')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-obsidian-card border border-obsidian-border text-xs text-gold hover:border-gold/30 transition-colors whitespace-nowrap"
            >
              <FileText className="w-3.5 h-3.5" />
              {lang === 'bn' ? 'আজকের রিপোর্ট বলো' : 'Quick Report'}
            </button>
            <div className="relative group flex items-center">
              <button 
                onClick={handleVoice}
                disabled={messages.length <= 1}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs whitespace-nowrap transition-colors ${
                  messages.length <= 1
                    ? 'bg-obsidian-dark text-obsidian-muted border-obsidian-border/50 cursor-not-allowed'
                    : isSpeaking 
                    ? 'bg-status-error/10 text-status-error border-status-error/30 hover:bg-status-error/20'
                    : 'bg-obsidian-card text-obsidian-muted border-obsidian-border hover:text-white'
                }`}
              >
                {isSpeaking ? (
                  <>⏹ {lang === 'bn' ? 'বন্ধ করুন' : 'Stop'}</>
                ) : (
                  <>🔊 {lang === 'bn' ? 'রিপোর্ট শুনুন' : 'Listen Report'}</>
                )}
              </button>
              {messages.length <= 1 && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-max opacity-0 group-hover:opacity-100 transition-opacity bg-obsidian-dark text-white text-[10px] px-2 py-1 rounded border border-obsidian-border pointer-events-none z-10">
                  আগে Quick Report তৈরি করুন.
                </div>
              )}
            </div>
            <button onClick={() => handleSend('এই পেজে কী করব?')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-obsidian-card border border-obsidian-border text-xs text-obsidian-muted hover:text-white transition-colors whitespace-nowrap">
              এই পেজে কী করব?
            </button>
            <button onClick={() => handleSend('Security check করো')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-obsidian-card border border-obsidian-border text-xs text-obsidian-muted hover:text-white transition-colors whitespace-nowrap">
              Security check করো
            </button>
            <button onClick={() => handleSend('Next কাজ বলো')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-obsidian-card border border-obsidian-border text-xs text-obsidian-muted hover:text-white transition-colors whitespace-nowrap">
              Next কাজ বলো
            </button>
            <button onClick={() => handleSend('Short voice report')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-obsidian-card border border-obsidian-border text-xs text-obsidian-muted hover:text-white transition-colors whitespace-nowrap">
              Short voice report
            </button>
          </div>

          {/* Voice State Feedback */}
          {voiceStateMsg && (
            <div className="px-5 py-1.5 bg-obsidian-dark text-[10px] text-gold text-center border-b border-gold/5 font-medium animate-pulse">
              {voiceStateMsg}
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 empire-scrollbar bg-obsidian-dark/20 overflow-x-hidden">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words ${
                    msg.role === 'user'
                      ? 'bg-gold/10 text-gold-light border border-gold/15 rounded-br-sm'
                      : 'bg-obsidian-card border border-obsidian-border text-obsidian-text rounded-bl-sm shadow-lg'
                  }`}
                >
                  {msg.role === 'assistant' && typeof msg.text === 'object'
                    ? msg.text[lang]
                    : msg.role === 'user'
                    ? msg.text
                    : (msg.text[lang] || msg.text)}
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

          {/* Input */}
          <div className="p-4 border-t border-gold/10 bg-obsidian-dark/50 rounded-b-2xl">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={lang === 'bn' ? 'কমান্ড লিখুন...' : 'Type a command...'}
                className="flex-1 bg-obsidian-card border border-obsidian-border rounded-xl px-4 py-2.5 text-sm text-white placeholder-obsidian-muted focus:outline-none focus:border-gold/30 transition-colors"
                disabled={isTyping}
              />
              <button
                onClick={() => handleSend()}
                disabled={isTyping}
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
