import { useState, useRef, useEffect } from 'react'
import { Bot, X, Send, MessageSquare, Sparkles } from 'lucide-react'
import { getAssistantResponse } from '../data/assistantData'

export default function EmpireAssistant({ open, onToggle }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: { bn: 'আপনাকে স্বাগতম! আমি Empire AI। সাহায্যের জন্য `help` বা `?` টাইপ করুন।', en: 'Welcome! I am Empire AI. Type `help` or `?` to get started.' } },
  ])
  const [input, setInput] = useState('')
  const [lang, setLang] = useState('en')
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (!input.trim()) return
    const userMsg = input.trim()
    setMessages(prev => [...prev, { role: 'user', text: userMsg }])
    setInput('')

    setTimeout(() => {
      const response = getAssistantResponse(userMsg)
      setMessages(prev => [...prev, { role: 'assistant', text: response }])
    }, 300)
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
        <div className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-8rem)] glass-panel rounded-2xl flex flex-col shadow-2xl border border-gold/10 animate-slide-up">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gold/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl gold-gradient flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-obsidian-dark" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">Empire AI</h3>
                <p className="text-[10px] text-obsidian-muted">Digital Empire Assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
                className="px-2 py-1 text-[10px] font-bold rounded-md bg-gold/10 text-gold border border-gold/20 hover:bg-gold/20 transition-colors"
              >
                {lang === 'en' ? 'বাংলা' : 'English'}
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 empire-scrollbar">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                    msg.role === 'user'
                      ? 'bg-gold/10 text-gold-light border border-gold/15'
                      : 'assistant-bubble text-obsidian-text'
                  }`}
                >
                  {msg.role === 'assistant' && typeof msg.text === 'object'
                    ? msg.text[lang]
                    : msg.role === 'user'
                    ? msg.text
                    : msg.text[lang]}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gold/10">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={lang === 'bn' ? 'কমান্ড লিখুন...' : 'Type a command...'}
                className="flex-1 bg-obsidian-card border border-obsidian-border rounded-xl px-4 py-2.5 text-sm text-white placeholder-obsidian-muted focus:outline-none focus:border-gold/30 transition-colors"
              />
              <button
                onClick={handleSend}
                className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center flex-shrink-0 hover:opacity-90 transition-all"
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
