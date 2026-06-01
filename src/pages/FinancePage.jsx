import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  DollarSign, TrendingUp, TrendingDown, Plus, Wallet,
  BarChart3, Briefcase, ArrowUpRight, ArrowDownRight,
} from 'lucide-react'

const FINANCE_KEY = 'km_empire_finance'

const defaultState = {
  businesses: ['Embroidery', 'Ads', 'Personal'],
  activeBusiness: 'Embroidery',
  income: 0,
  expense: 0,
  balance: 0,
  monthlyProfit: 0,
  entries: [],
}

const loadFinance = () => {
  try {
    const stored = localStorage.getItem(FINANCE_KEY)
    if (stored) return JSON.parse(stored)
  } catch {}
  localStorage.setItem(FINANCE_KEY, JSON.stringify(defaultState))
  return { ...defaultState }
}

export default function FinancePage() {
  const [finance, setFinance] = useState(loadFinance)
  const [showAdd, setShowAdd] = useState(false)
  const [entry, setEntry] = useState({ type: 'income', description: '', amount: '', category: '', business: finance.activeBusiness })

  const saveFinance = (data) => {
    localStorage.setItem(FINANCE_KEY, JSON.stringify(data))
    setFinance(data)
  }

  const switchBusiness = (b) => {
    const businessEntries = finance.entries.filter(e => e.business === b)
    const income = businessEntries.filter(e => e.type === 'income').reduce((s, e) => s + Number(e.amount), 0)
    const expense = businessEntries.filter(e => e.type === 'expense').reduce((s, e) => s + Number(e.amount), 0)
    saveFinance({ ...finance, activeBusiness: b, income, expense, balance: income - expense })
  }

  const handleAddEntry = () => {
    if (!entry.description || !entry.amount) return
    const newEntry = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      type: entry.type,
      description: entry.description,
      business: finance.activeBusiness,
      amount: Number(entry.amount),
      category: entry.category || 'General',
    }
    const entries = [newEntry, ...finance.entries]
    const businessEntries = entries.filter(e => e.business === finance.activeBusiness)
    const income = businessEntries.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0)
    const expense = businessEntries.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0)
    saveFinance({ ...finance, entries, income, expense, balance: income - expense })
    setEntry({ type: 'income', description: '', amount: '', category: '', business: finance.activeBusiness })
    setShowAdd(false)
  }

  const businessEntries = finance.entries.filter(e => e.business === finance.activeBusiness)
  const totalIncome = finance.entries.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0)
  const totalExpense = finance.entries.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0)
  const totalBalance = totalIncome - totalExpense

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl lg:text-2xl font-extrabold text-white">
            Finance <span className="gold-gradient-text">Ledger</span>
          </h1>
          <p className="text-xs text-obsidian-muted mt-1">
            Track income and expenses across your businesses
          </p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold gold-gradient text-obsidian-dark hover:opacity-90 transition-all"
        >
          <Plus className="w-3.5 h-3.5" /> Add Entry
        </button>
      </div>

      {/* Business Switcher */}
      <div className="flex flex-wrap gap-2">
        {finance.businesses.map(b => (
          <button
            key={b}
            onClick={() => switchBusiness(b)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
              finance.activeBusiness === b
                ? 'bg-gold/10 text-gold border-gold/20 shadow-gold-sm'
                : 'bg-obsidian-card text-obsidian-muted border-obsidian-border hover:text-white'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" /> {b}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-status-live" />
            <span className="text-xs text-obsidian-muted">Income</span>
          </div>
          <p className="text-xl font-extrabold text-status-live">${finance.income.toFixed(2)}</p>
        </div>
        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-status-error" />
            <span className="text-xs text-obsidian-muted">Expense</span>
          </div>
          <p className="text-xl font-extrabold text-status-error">${finance.expense.toFixed(2)}</p>
        </div>
        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-4 h-4 text-gold" />
            <span className="text-xs text-obsidian-muted">Balance</span>
          </div>
          <p className={`text-xl font-extrabold ${finance.balance >= 0 ? 'text-status-live' : 'text-status-error'}`}>
            ${finance.balance.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Total Summary */}
      <div className="glass-card rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="w-4 h-4 text-gold" />
          <span className="text-xs text-obsidian-muted">Overall</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <p className="text-[10px] text-obsidian-muted">Total Income</p>
            <p className="text-lg font-extrabold text-status-live">${totalIncome.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-[10px] text-obsidian-muted">Total Expense</p>
            <p className="text-lg font-extrabold text-status-error">${totalExpense.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-[10px] text-obsidian-muted">Net Balance</p>
            <p className={`text-lg font-extrabold ${totalBalance >= 0 ? 'text-status-live' : 'text-status-error'}`}>
              ${totalBalance.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Add Entry Form */}
      {showAdd && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-5 space-y-3"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <select
              value={entry.type}
              onChange={(e) => setEntry({ ...entry, type: e.target.value })}
              className="bg-obsidian-card border border-obsidian-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold/30"
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <input
              value={entry.description}
              onChange={(e) => setEntry({ ...entry, description: e.target.value })}
              placeholder="Description..."
              className="bg-obsidian-card border border-obsidian-border rounded-xl px-4 py-2.5 text-sm text-white placeholder-obsidian-muted focus:outline-none focus:border-gold/30"
            />
            <input
              type="number"
              value={entry.amount}
              onChange={(e) => setEntry({ ...entry, amount: e.target.value })}
              placeholder="Amount"
              className="bg-obsidian-card border border-obsidian-border rounded-xl px-4 py-2.5 text-sm text-white placeholder-obsidian-muted focus:outline-none focus:border-gold/30"
            />
            <input
              value={entry.category}
              onChange={(e) => setEntry({ ...entry, category: e.target.value })}
              placeholder="Category (e.g. Order, Supplies)"
              className="bg-obsidian-card border border-obsidian-border rounded-xl px-4 py-2.5 text-sm text-white placeholder-obsidian-muted focus:outline-none focus:border-gold/30"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={handleAddEntry} className="px-5 py-2 rounded-xl text-xs font-semibold gold-gradient text-obsidian-dark hover:opacity-90 transition-all">
              Add Entry
            </button>
            <button onClick={() => setShowAdd(false)} className="px-5 py-2 rounded-xl text-xs font-semibold bg-obsidian-card text-obsidian-muted border border-obsidian-border hover:text-white transition-all">
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Recent Entries */}
      <div className="glass-card rounded-2xl p-5">
        <h3 className="text-white font-bold text-sm mb-4">Recent Entries ({finance.activeBusiness})</h3>
        {businessEntries.length === 0 ? (
          <div className="text-center py-8">
            <DollarSign className="w-10 h-10 text-obsidian-muted/30 mx-auto mb-2" />
            <p className="text-xs text-obsidian-muted">No entries yet. Add your first entry.</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {businessEntries.map(e => (
              <div key={e.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-obsidian-card/50 border border-obsidian-border">
                <div className="flex items-center gap-3">
                  {e.type === 'income'
                    ? <ArrowUpRight className="w-4 h-4 text-status-live" />
                    : <ArrowDownRight className="w-4 h-4 text-status-error" />
                  }
                  <div>
                    <p className="text-sm font-semibold text-white">{e.description}</p>
                    <p className="text-[10px] text-obsidian-muted">{e.date} · {e.category}</p>
                  </div>
                </div>
                <span className={`text-sm font-bold ${e.type === 'income' ? 'text-status-live' : 'text-status-error'}`}>
                  {e.type === 'income' ? '+' : '-'}${e.amount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
