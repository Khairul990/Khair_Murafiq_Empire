import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  DollarSign, TrendingUp, TrendingDown, Plus, Wallet, X,
  BarChart3, Briefcase, ArrowUpRight, ArrowDownRight, Loader2, Calendar as CalendarIcon, Tag
} from 'lucide-react'
import { storageAdapter } from '../services/storageAdapter'
import { auth } from '../services/firebaseConfig'

export default function FinancePage() {
  const [entries, setEntries] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState(null)
  
  const [formData, setFormData] = useState({
    business: 'Personal',
    type: 'income',
    category: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'Cash',
    notes: '',
    source: 'Manual'
  })

  const [filterBusiness, setFilterBusiness] = useState('All')
  const [filterType, setFilterType] = useState('All')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const reports = await storageAdapter.getReports()
      // Filter for finance entries
      const finance = reports.filter(r => r.docType === 'finance_entry' || r.amount !== undefined)
      setEntries(finance)
    } catch (err) {
      setErrorMsg('Firebase unavailable. Local fallback active.')
    }
    setIsLoading(false)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    
    if (!formData.amount || !formData.category || !formData.business) return

    const entryToSave = {
      ...formData,
      amount: Number(formData.amount),
      id: editingId || Date.now().toString(),
      docType: 'finance_entry',
      createdAt: editingId ? (entries.find(en => en.id === editingId)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const newEntries = editingId
      ? entries.map(en => en.id === editingId ? entryToSave : en)
      : [entryToSave, ...entries]

    setEntries(newEntries)
    setShowAdd(false)
    setEditingId(null)
    setFormData({ business: 'Personal', type: 'income', category: '', amount: '', date: new Date().toISOString().split('T')[0], paymentMethod: 'Cash', notes: '', source: 'Manual' })
    
    const allReports = await storageAdapter.getReports()
    const updatedReports = editingId
      ? allReports.map(r => r.id === editingId ? entryToSave : r)
      : [entryToSave, ...allReports]
      
    await storageAdapter.saveReport(entryToSave, updatedReports)
  }

  const handleEdit = (entry) => {
    if (!auth.currentUser || auth.currentUser.email !== 'khairul2052007@gmail.com') {
      alert("Access Denied: Owner login required.")
      return
    }
    setFormData({
      business: entry.business || 'Personal',
      type: entry.type || 'income',
      category: entry.category || '',
      amount: entry.amount || '',
      date: entry.date || new Date().toISOString().split('T')[0],
      paymentMethod: entry.paymentMethod || 'Cash',
      notes: entry.notes || '',
      source: entry.source || 'Manual'
    })
    setEditingId(entry.id)
    setShowAdd(true)
  }

  const handleDelete = async (id) => {
    if (!auth.currentUser || auth.currentUser.email !== 'khairul2052007@gmail.com') {
      alert("Access Denied: Owner login required for this dangerous action.")
      return
    }
    if (window.confirm('Are you sure you want to delete this finance entry?')) {
      const newEntries = entries.filter(e => e.id !== id)
      setEntries(newEntries)
      
      const allReports = await storageAdapter.getReports()
      const updatedReports = allReports.filter(r => r.id !== id)
      await storageAdapter.deleteReport(id, updatedReports)
    }
  }

  const filtered = entries.filter(e => {
    const matchBusiness = filterBusiness === 'All' || e.business === filterBusiness
    const matchType = filterType === 'All' || e.type === filterType
    return matchBusiness && matchType
  })

  // Calculations
  const totalIncome = entries.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0)
  const totalExpense = entries.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0)
  const totalBalance = totalIncome - totalExpense

  const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM
  const thisMonthIncome = entries.filter(e => e.type === 'income' && e.date.startsWith(currentMonth)).reduce((s, e) => s + e.amount, 0)
  const thisMonthExpense = entries.filter(e => e.type === 'expense' && e.date.startsWith(currentMonth)).reduce((s, e) => s + e.amount, 0)

  // Unique businesses for filters
  const uniqueBusinesses = [...new Set(entries.map(e => e.business).filter(Boolean))]
  if (!uniqueBusinesses.includes('Personal')) uniqueBusinesses.push('Personal')

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-extrabold text-white flex items-center gap-2">
            Finance <span className="gold-gradient-text">Tracker</span>
            {isLoading && <Loader2 className="w-4 h-4 animate-spin text-gold" />}
          </h1>
          <p className="text-xs text-obsidian-muted mt-1">
            {isLoading ? 'Loading...' : `Track income and expenses across your businesses`}
          </p>
          {errorMsg && <p className="text-[10px] text-status-error mt-1">{errorMsg}</p>}
        </div>
        <button
          onClick={() => {
            setEditingId(null)
            setFormData({ business: 'Personal', type: 'income', category: '', amount: '', date: new Date().toISOString().split('T')[0], paymentMethod: 'Cash', notes: '', source: 'Manual' })
            setShowAdd(!showAdd)
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold gold-gradient text-obsidian-dark hover:opacity-90 transition-all flex-shrink-0"
        >
          {showAdd ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          {showAdd ? 'Close Form' : 'Add Entry'}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="glass-card rounded-2xl p-4 lg:col-span-1">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-status-live" />
            <span className="text-xs text-obsidian-muted">Total Income</span>
          </div>
          <p className="text-lg font-extrabold text-status-live">${totalIncome.toFixed(2)}</p>
        </div>
        <div className="glass-card rounded-2xl p-4 lg:col-span-1">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-status-error" />
            <span className="text-xs text-obsidian-muted">Total Expense</span>
          </div>
          <p className="text-lg font-extrabold text-status-error">${totalExpense.toFixed(2)}</p>
        </div>
        <div className="glass-card rounded-2xl p-4 lg:col-span-1">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-4 h-4 text-gold" />
            <span className="text-xs text-obsidian-muted">Balance</span>
          </div>
          <p className={`text-lg font-extrabold ${totalBalance >= 0 ? 'text-status-live' : 'text-status-error'}`}>
            ${totalBalance.toFixed(2)}
          </p>
        </div>
        <div className="glass-card rounded-2xl p-4 lg:col-span-1 bg-status-live/5 border-status-live/10">
          <div className="flex items-center gap-2 mb-2">
            <CalendarIcon className="w-4 h-4 text-status-live" />
            <span className="text-xs text-obsidian-muted">This Month Inc.</span>
          </div>
          <p className="text-lg font-extrabold text-white">${thisMonthIncome.toFixed(2)}</p>
        </div>
        <div className="glass-card rounded-2xl p-4 lg:col-span-1 bg-status-error/5 border-status-error/10">
          <div className="flex items-center gap-2 mb-2">
            <CalendarIcon className="w-4 h-4 text-status-error" />
            <span className="text-xs text-obsidian-muted">This Month Exp.</span>
          </div>
          <p className="text-lg font-extrabold text-white">${thisMonthExpense.toFixed(2)}</p>
        </div>
      </div>

      {/* Add / Edit Form */}
      {showAdd && (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="glass-card rounded-2xl p-5 border border-gold/20"
          onSubmit={handleSave}
        >
          <h3 className="text-sm font-bold text-white mb-4">{editingId ? 'Edit Entry' : 'Add New Entry'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] text-obsidian-muted font-medium ml-1">Type *</label>
              <select required value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-obsidian-dark border border-obsidian-border rounded-xl px-3 py-2 text-sm text-white focus:border-gold/30 outline-none transition-colors">
                <option value="income">Income (+)</option>
                <option value="expense">Expense (-)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-obsidian-muted font-medium ml-1">Amount ($) *</label>
              <input type="number" step="0.01" required value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full bg-obsidian-dark border border-obsidian-border rounded-xl px-3 py-2 text-sm text-white focus:border-gold/30 outline-none transition-colors" placeholder="0.00" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-obsidian-muted font-medium ml-1">Business/Project *</label>
              <input required value={formData.business} onChange={e => setFormData({...formData, business: e.target.value})} className="w-full bg-obsidian-dark border border-obsidian-border rounded-xl px-3 py-2 text-sm text-white focus:border-gold/30 outline-none transition-colors" placeholder="e.g. Empire OS" list="business-list" />
              <datalist id="business-list">
                {uniqueBusinesses.map(b => <option key={b} value={b} />)}
              </datalist>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-obsidian-muted font-medium ml-1">Date *</label>
              <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-obsidian-dark border border-obsidian-border rounded-xl px-3 py-2 text-sm text-white focus:border-gold/30 outline-none transition-colors" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-obsidian-muted font-medium ml-1">Category *</label>
              <input required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-obsidian-dark border border-obsidian-border rounded-xl px-3 py-2 text-sm text-white focus:border-gold/30 outline-none transition-colors" placeholder="e.g. Hosting, Sales" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-obsidian-muted font-medium ml-1">Payment Method</label>
              <select value={formData.paymentMethod} onChange={e => setFormData({...formData, paymentMethod: e.target.value})} className="w-full bg-obsidian-dark border border-obsidian-border rounded-xl px-3 py-2 text-sm text-white focus:border-gold/30 outline-none transition-colors">
                {['Cash', 'Credit Card', 'PayPal', 'Stripe', 'Bank Transfer', 'Crypto', 'Other'].map(opt => (
                  <option key={opt} value={opt} className="bg-obsidian-dark">{opt}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-obsidian-muted font-medium ml-1">Source</label>
              <select value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})} className="w-full bg-obsidian-dark border border-obsidian-border rounded-xl px-3 py-2 text-sm text-white focus:border-gold/30 outline-none transition-colors">
                {['Manual', 'Website', 'Affiliate', 'Other'].map(opt => (
                  <option key={opt} value={opt} className="bg-obsidian-dark">{opt}</option>
                ))}
              </select>
            </div>
            <div className="col-span-1 md:col-span-2 lg:col-span-4 space-y-1">
              <label className="text-[11px] text-obsidian-muted font-medium ml-1">Notes / Description</label>
              <input value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full bg-obsidian-dark border border-obsidian-border rounded-xl px-3 py-2 text-sm text-white focus:border-gold/30 outline-none transition-colors" placeholder="Detailed description..." />
            </div>
          </div>
          <div className="mt-5 flex gap-3">
            <button type="submit" className="px-5 py-2 rounded-xl text-xs font-bold gold-gradient text-obsidian-dark hover:opacity-90 transition-all">
              {editingId ? 'Update Entry' : 'Save Entry'}
            </button>
            <button type="button" onClick={() => setShowAdd(false)} className="px-5 py-2 rounded-xl text-xs font-bold bg-obsidian-dark text-obsidian-muted border border-obsidian-border hover:text-white transition-all">
              Cancel
            </button>
          </div>
        </motion.form>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {['All', 'income', 'expense'].map(t => (
          <button key={t} onClick={() => setFilterType(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filterType === t ? 'bg-gold/10 text-gold border border-gold/20' : 'bg-obsidian-card text-obsidian-muted border border-obsidian-border hover:text-white'
            }`}
          >
            {t === 'All' ? 'All Types' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
        <div className="w-px h-5 bg-obsidian-border mx-1" />
        <button onClick={() => setFilterBusiness('All')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            filterBusiness === 'All' ? 'bg-gold/10 text-gold border border-gold/20' : 'bg-obsidian-card text-obsidian-muted border border-obsidian-border hover:text-white'
          }`}
        >
          All Businesses
        </button>
        {uniqueBusinesses.map(b => (
          <button key={b} onClick={() => setFilterBusiness(b)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
              filterBusiness === b ? 'bg-gold/10 text-gold border border-gold/20' : 'bg-obsidian-card text-obsidian-muted border border-obsidian-border hover:text-white'
            }`}
          >
            <Briefcase className="w-3 h-3" /> {b}
          </button>
        ))}
      </div>

      {/* Entries List */}
      <div className="glass-card rounded-2xl p-5">
        <h3 className="text-white font-bold text-sm mb-4">Ledger Entries</h3>
        {filtered.length === 0 ? (
          <div className="text-center py-8">
            <DollarSign className="w-10 h-10 text-obsidian-muted/30 mx-auto mb-2" />
            <p className="text-xs text-obsidian-muted">No finance entries yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.sort((a,b) => new Date(b.date) - new Date(a.date)).map(e => (
              <div 
                key={e.id} 
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 px-4 rounded-xl bg-obsidian-card/50 border border-obsidian-border hover:border-gold/20 transition-all cursor-pointer group"
                onClick={() => handleEdit(e)}
              >
                <div className="flex items-start sm:items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border flex-shrink-0 ${e.type === 'income' ? 'bg-status-live/10 border-status-live/30 text-status-live' : 'bg-status-error/10 border-status-error/30 text-status-error'}`}>
                    {e.type === 'income' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white group-hover:text-gold transition-colors">{e.notes || e.category}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-[10px] text-obsidian-muted">
                      <span className="flex items-center gap-1"><CalendarIcon className="w-3 h-3" /> {e.date}</span>
                      <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> {e.business}</span>
                      <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> {e.category}</span>
                      <span className="px-1.5 py-0.5 rounded bg-obsidian-dark border border-obsidian-border">{e.paymentMethod}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto mt-2 sm:mt-0">
                  <span className={`text-lg font-extrabold ${e.type === 'income' ? 'text-status-live' : 'text-status-error'}`}>
                    {e.type === 'income' ? '+' : '-'}${e.amount.toFixed(2)}
                  </span>
                  <button onClick={(ev) => { ev.stopPropagation(); handleDelete(e.id) }} className="p-2 rounded-lg hover:bg-status-error/10 text-status-error/60 hover:text-status-error transition-all" title="Delete">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
