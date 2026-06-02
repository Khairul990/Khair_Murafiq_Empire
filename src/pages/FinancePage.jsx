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
      className="space-y-6 pb-20"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-3xl font-extrabold text-white flex items-center gap-3">
            Imperial <span className="gold-gradient-text">Ledger</span>
            {isLoading && <Loader2 className="w-5 h-5 animate-spin text-gold" />}
          </h1>
          <p className="text-xs text-obsidian-muted mt-1 uppercase tracking-widest font-bold">
            {isLoading ? 'Syncing Financial Data...' : `Track multi-business income & expenditure nodes`}
          </p>
          {errorMsg && <p className="text-[10px] text-status-error mt-2 bg-status-error/10 px-2 py-1 rounded inline-block">{errorMsg}</p>}
        </div>
        <button
          onClick={() => {
            setEditingId(null)
            setFormData({ business: 'Personal', type: 'income', category: '', amount: '', date: new Date().toISOString().split('T')[0], paymentMethod: 'Cash', notes: '', source: 'Manual' })
            setShowAdd(!showAdd)
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider gold-gradient text-obsidian-dark hover:shadow-[0_0_20px_rgba(242,201,76,0.3)] transition-all flex-shrink-0"
        >
          {showAdd ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showAdd ? 'Cancel Entry' : 'Log Transaction'}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="glass-card rounded-2xl p-5 lg:col-span-1 border border-status-live/20 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-status-live/50 group-hover:bg-status-live transition-colors" />
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-status-live" />
            <span className="text-[10px] font-black uppercase tracking-wider text-obsidian-muted">Total Revenue</span>
          </div>
          <p className="text-2xl font-black text-status-live">${totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
        <div className="glass-card rounded-2xl p-5 lg:col-span-1 border border-status-error/20 relative overflow-hidden group">
           <div className="absolute top-0 left-0 w-full h-1 bg-status-error/50 group-hover:bg-status-error transition-colors" />
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown className="w-4 h-4 text-status-error" />
            <span className="text-[10px] font-black uppercase tracking-wider text-obsidian-muted">Total Expense</span>
          </div>
          <p className="text-2xl font-black text-status-error">${totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
        <div className="glass-card rounded-2xl p-5 lg:col-span-1 border border-gold/30 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gold group-hover:shadow-[0_0_20px_rgba(242,201,76,0.5)] transition-all" />
          <div className="flex items-center gap-2 mb-3">
            <Wallet className="w-4 h-4 text-gold" />
            <span className="text-[10px] font-black uppercase tracking-wider text-obsidian-muted">Net Balance</span>
          </div>
          <p className={`text-2xl font-black ${totalBalance >= 0 ? 'text-white' : 'text-status-error'}`}>
            ${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="glass-card rounded-2xl p-5 lg:col-span-1 bg-status-live/5 border border-status-live/10">
          <div className="flex items-center gap-2 mb-3">
            <CalendarIcon className="w-4 h-4 text-status-live" />
            <span className="text-[10px] font-black uppercase tracking-wider text-obsidian-muted">MTD Revenue</span>
          </div>
          <p className="text-xl font-black text-white">${thisMonthIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
        <div className="glass-card rounded-2xl p-5 lg:col-span-1 bg-status-error/5 border border-status-error/10">
          <div className="flex items-center gap-2 mb-3">
            <CalendarIcon className="w-4 h-4 text-status-error" />
            <span className="text-[10px] font-black uppercase tracking-wider text-obsidian-muted">MTD Expense</span>
          </div>
          <p className="text-xl font-black text-white">${thisMonthExpense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
      </div>

      {/* Add / Edit Form */}
      {showAdd && (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="glass-card rounded-2xl p-6 border border-gold/30 shadow-[0_0_30px_rgba(242,201,76,0.1)] relative overflow-hidden"
          onSubmit={handleSave}
        >
          <div className="absolute top-0 left-0 w-full h-1 gold-gradient" />
          <h3 className="text-sm font-black text-white mb-5 uppercase tracking-wider flex items-center gap-2">
             <DollarSign className="w-5 h-5 text-gold" />
             {editingId ? 'Modify Ledger Entry' : 'New Ledger Entry'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="space-y-1.5">
              <label className="text-[10px] text-obsidian-muted font-bold uppercase tracking-wider ml-1">Flow Type *</label>
              <select required value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-obsidian-dark/50 border border-obsidian-border rounded-xl px-4 py-2.5 text-sm text-white focus:border-gold/50 outline-none transition-all">
                <option value="income">Revenue In (+)</option>
                <option value="expense">Expense Out (-)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] text-obsidian-muted font-bold uppercase tracking-wider ml-1">Volume ($) *</label>
              <input type="number" step="0.01" required value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full bg-obsidian-dark/50 border border-obsidian-border rounded-xl px-4 py-2.5 text-sm text-white focus:border-gold/50 outline-none transition-all" placeholder="0.00" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] text-obsidian-muted font-bold uppercase tracking-wider ml-1">Business Unit *</label>
              <input required value={formData.business} onChange={e => setFormData({...formData, business: e.target.value})} className="w-full bg-obsidian-dark/50 border border-obsidian-border rounded-xl px-4 py-2.5 text-sm text-white focus:border-gold/50 outline-none transition-all" placeholder="e.g. Empire OS" list="business-list" />
              <datalist id="business-list">
                {uniqueBusinesses.map(b => <option key={b} value={b} />)}
              </datalist>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] text-obsidian-muted font-bold uppercase tracking-wider ml-1">Timestamp *</label>
              <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-obsidian-dark/50 border border-obsidian-border rounded-xl px-4 py-2.5 text-sm text-white focus:border-gold/50 outline-none transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] text-obsidian-muted font-bold uppercase tracking-wider ml-1">Category *</label>
              <input required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-obsidian-dark/50 border border-obsidian-border rounded-xl px-4 py-2.5 text-sm text-white focus:border-gold/50 outline-none transition-all" placeholder="e.g. Hosting, Sales" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] text-obsidian-muted font-bold uppercase tracking-wider ml-1">Channel</label>
              <select value={formData.paymentMethod} onChange={e => setFormData({...formData, paymentMethod: e.target.value})} className="w-full bg-obsidian-dark/50 border border-obsidian-border rounded-xl px-4 py-2.5 text-sm text-white focus:border-gold/50 outline-none transition-all">
                {['Cash', 'Credit Card', 'PayPal', 'Stripe', 'Bank Transfer', 'Crypto', 'Other'].map(opt => (
                  <option key={opt} value={opt} className="bg-obsidian-dark">{opt}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] text-obsidian-muted font-bold uppercase tracking-wider ml-1">Origin</label>
              <select value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})} className="w-full bg-obsidian-dark/50 border border-obsidian-border rounded-xl px-4 py-2.5 text-sm text-white focus:border-gold/50 outline-none transition-all">
                {['Manual', 'Website', 'Affiliate', 'Other'].map(opt => (
                  <option key={opt} value={opt} className="bg-obsidian-dark">{opt}</option>
                ))}
              </select>
            </div>
            <div className="col-span-1 md:col-span-2 lg:col-span-4 space-y-1.5">
              <label className="text-[10px] text-obsidian-muted font-bold uppercase tracking-wider ml-1">Log Description</label>
              <input value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full bg-obsidian-dark/50 border border-obsidian-border rounded-xl px-4 py-2.5 text-sm text-white focus:border-gold/50 outline-none transition-all" placeholder="Detailed description..." />
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="submit" className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider gold-gradient text-obsidian-dark hover:shadow-[0_0_20px_rgba(242,201,76,0.3)] transition-all flex-1 sm:flex-none">
              {editingId ? 'Update Ledger' : 'Commit to Ledger'}
            </button>
            <button type="button" onClick={() => setShowAdd(false)} className="px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-obsidian-dark text-obsidian-muted border border-obsidian-border hover:text-white transition-all flex-1 sm:flex-none">
              Cancel
            </button>
          </div>
        </motion.form>
      )}

      {/* Filters */}
      <div className="glass-card p-2 rounded-2xl border border-obsidian-border flex flex-wrap items-center gap-2">
        <div className="flex gap-1.5 p-1">
          {['All', 'income', 'expense'].map(t => (
            <button key={t} onClick={() => setFilterType(t)}
              className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                filterType === t ? 'bg-gold/10 text-gold border border-gold/30 shadow-[0_0_10px_rgba(242,201,76,0.1)]' : 'bg-transparent text-obsidian-muted border border-transparent hover:bg-obsidian-dark hover:text-white'
              }`}
            >
              {t === 'All' ? 'All Flows' : t}
            </button>
          ))}
        </div>
        
        <div className="h-6 w-px bg-obsidian-border mx-2" />
        
        <div className="flex gap-1.5 p-1 overflow-x-auto empire-scrollbar flex-1">
          <button onClick={() => setFilterBusiness('All')}
            className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
              filterBusiness === 'All' ? 'bg-gold/10 text-gold border border-gold/30 shadow-[0_0_10px_rgba(242,201,76,0.1)]' : 'bg-transparent text-obsidian-muted border border-transparent hover:bg-obsidian-dark hover:text-white'
            }`}
          >
            All Units
          </button>
          {uniqueBusinesses.map(b => (
            <button key={b} onClick={() => setFilterBusiness(b)}
              className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 whitespace-nowrap ${
                filterBusiness === b ? 'bg-gold/10 text-gold border border-gold/30 shadow-[0_0_10px_rgba(242,201,76,0.1)]' : 'bg-transparent text-obsidian-muted border border-transparent hover:bg-obsidian-dark hover:text-white'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" /> {b}
            </button>
          ))}
        </div>
      </div>

      {/* Entries List */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-white font-black uppercase tracking-wider text-sm mb-5">Transaction History</h3>
        {filtered.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-obsidian-border rounded-2xl">
            <DollarSign className="w-12 h-12 text-obsidian-muted/30 mx-auto mb-3" />
            <p className="text-sm font-black uppercase tracking-wider text-white mb-1">No Ledger Entries</p>
            <p className="text-xs text-obsidian-muted">Record a new transaction to begin tracking.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.sort((a,b) => new Date(b.date) - new Date(a.date)).map(e => (
              <div 
                key={e.id} 
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 px-5 rounded-xl bg-obsidian-dark/50 border border-obsidian-border hover:border-gold/30 transition-all cursor-pointer group"
                onClick={() => handleEdit(e)}
              >
                <div className="flex items-start sm:items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border flex-shrink-0 shadow-lg ${e.type === 'income' ? 'bg-status-live/10 border-status-live/30 text-status-live shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'bg-status-error/10 border-status-error/30 text-status-error shadow-[0_0_15px_rgba(239,68,68,0.1)]'}`}>
                    {e.type === 'income' ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownRight className="w-6 h-6" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white group-hover:text-gold transition-colors">{e.notes || e.category}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-[10px] font-bold uppercase tracking-wider text-obsidian-muted">
                      <span className="flex items-center gap-1.5"><CalendarIcon className="w-3.5 h-3.5" /> {e.date}</span>
                      <span className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" /> {e.business}</span>
                      <span className="flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" /> {e.category}</span>
                      <span className="px-2 py-1 rounded-md bg-obsidian-card border border-obsidian-border">{e.paymentMethod}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto mt-3 sm:mt-0 pt-3 sm:pt-0 border-t border-obsidian-border sm:border-t-0">
                  <span className={`text-xl font-black ${e.type === 'income' ? 'text-status-live' : 'text-status-error'}`}>
                    {e.type === 'income' ? '+' : '-'}${e.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <button onClick={(ev) => { ev.stopPropagation(); handleDelete(e.id) }} className="p-2.5 rounded-xl hover:bg-status-error/20 text-status-error/60 hover:text-status-error border border-transparent hover:border-status-error/30 transition-all" title="Delete Log">
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
