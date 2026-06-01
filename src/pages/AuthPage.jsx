import { useState } from 'react'
import { motion } from 'framer-motion'
import { ShieldAlert } from 'lucide-react'

const OWNER_EMAIL = 'khairul2052007@gmail.com'
const DEMO_PASSWORD = 'demo123' // LOCAL DEMO USE ONLY

export default function AuthPage({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    setTimeout(() => {
      const formattedEmail = email.trim().toLowerCase()
      
      if (formattedEmail !== OWNER_EMAIL) {
        setError('Access Denied — Owner only.')
        setLoading(false)
        return
      }

      if (password !== DEMO_PASSWORD) {
        setError('Invalid credentials. Access denied.')
        setLoading(false)
        return
      }

      // Success
      localStorage.setItem('km_empire_owner_session', 'true')
      if (onLogin) onLogin()
      
    }, 800) // fake delay for UI feel
  }

  return (
    <div className="min-h-screen bg-obsidian-dark flex items-center justify-center p-4 font-sans text-white">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-8 w-full max-w-md border border-gold/20 relative overflow-hidden bg-obsidian-card shadow-2xl"
      >
        <div className="absolute top-0 left-0 w-full h-1 gold-gradient"></div>
        
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold mb-2 text-white">
            Empire <span className="gold-gradient-text">OS</span>
          </h1>
          <p className="text-xs font-semibold text-obsidian-muted uppercase tracking-widest">Control Room Authorization</p>
        </div>

        <div className="bg-status-warning/10 border border-status-warning/30 rounded-xl p-3 flex gap-2 items-start mb-6">
          <ShieldAlert className="w-4 h-4 text-status-warning flex-shrink-0" />
          <p className="text-[10px] text-status-warning font-bold leading-tight">
            LOCAL DEMO MODE ACTIVE. Real protection requires Firebase Authentication. 
            Use password: <span className="font-mono bg-status-warning/20 px-1 rounded">demo123</span>
          </p>
        </div>

        {error && (
          <div className="bg-status-error/10 border border-status-error/30 text-status-error text-xs p-3 rounded-xl mb-4 text-center font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-[10px] text-obsidian-muted uppercase tracking-wider mb-1 block ml-1 font-bold">Owner Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-obsidian-dark border border-obsidian-border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-gold/30 transition-colors placeholder-obsidian-muted/50"
              placeholder="owner@khairmurafiq.com"
            />
          </div>
          <div>
            <label className="text-[10px] text-obsidian-muted uppercase tracking-wider mb-1 block ml-1 font-bold">Demo Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-obsidian-dark border border-obsidian-border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-gold/30 transition-colors placeholder-obsidian-muted/50"
              placeholder="••••••••"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3.5 mt-2 rounded-xl text-sm font-bold gold-gradient text-obsidian-dark hover:opacity-90 transition-all disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Enter Control Room'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}
