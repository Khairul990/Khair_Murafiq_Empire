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
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices()
    }
  }, [])

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

      let bnText = `আসসালামু আলাইকুম বস। আজ আপনার Control Room-এ ${activeAlerts.length}টা alert আছে, ${pendingTasks.length}টা task pending আছে।\n\n`

      if (criticalAlerts.length > 0) {
        bnText += `🚨 গুরুত্বপূর্ণ warning আছে। আগে Alert Center check করুন।\n\n`
      } else {
        bnText += `✅ আগে High/Critical alert check করা ভালো, তবে বর্তমানে কোনো ক্রিটিক্যাল অ্যালার্ট নেই।\n\n`
      }

      if (pendingTasks.length > 0) {
        bnText += `📋 টপ পেন্ডিং টাস্ক:\n`
        pendingTasks.slice(0, 3).forEach(t => {
          bnText += `• ${t.title} (${t.priority})\n`
        })
        bnText += `\n`
      }

      if (warningProjects.length > 0) {
        bnText += `⚠️ Health Warning/Unknown:\n`
        warningProjects.slice(0, 3).forEach(p => {
          bnText += `• ${p.name} (${p.healthStatus || 'Unknown'})\n`
        })
        bnText += `\n`
      }

      const currentMonth = new Date().toISOString().slice(0, 7)
      const thisMonthIncome = (reports || [])
        .filter(r => (r.docType === 'finance_entry' || r.amount !== undefined) && r.type === 'income' && (r.date || '').startsWith(currentMonth))
        .reduce((sum, r) => sum + Number(r.amount), 0)
        
      const plannedSocialPosts = (reports || [])
        .filter(r => r.docType === 'social_post' || (r.platform && r.caption))
        .length

      if (plannedSocialPosts > 0 || thisMonthIncome > 0) {
        bnText += `📊 বিজনেস আপডেট:\n`
        bnText += `• এই মাসের আয়: $${thisMonthIncome.toFixed(2)}\n`
        bnText += `• সোশ্যাল পোস্ট প্ল্যান করা আছে: ${plannedSocialPosts}টি\n\n`
      }

      bnText += `🛑 Safe Action Rules:\n`
      bnText += `• Owner approval ছাড়া risky action করবেন না\n`
      bnText += `• Backup ছাড়া migration/delete করবেন না\n`
      bnText += `• API key frontend/GitHub-এ রাখবেন না\n\n`
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
        <div className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[560px] max-h-[calc(100vh-8rem)] glass-panel rounded-2xl flex flex-col shadow-2xl border border-gold/10 animate-slide-up">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gold/10 bg-obsidian-dark/50 rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl gold-gradient flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-obsidian-dark" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">Empire AI</h3>
                <p className="text-[10px] text-obsidian-muted">Control Room Manager</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
                className="px-2 py-1 text-[10px] font-bold rounded-md bg-gold/10 text-gold border border-gold/20 hover:bg-gold/20 transition-colors"
              >
                {lang === 'en' ? 'বাংলা' : 'English'}
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="px-4 py-3 border-b border-gold/5 flex flex-wrap gap-2">
            <button 
              onClick={() => handleSend(lang === 'bn' ? 'আজকের রিপোর্ট বলো' : 'Quick Report')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-obsidian-card border border-obsidian-border text-xs text-gold hover:border-gold/30 transition-colors whitespace-nowrap"
            >
              <FileText className="w-3.5 h-3.5" />
              {lang === 'bn' ? 'আজকের রিপোর্ট বলো' : 'Quick Report'}
            </button>
            <button 
              onClick={handleVoice}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs whitespace-nowrap transition-colors ${
                isSpeaking 
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
